"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "./supabase";
import {
    Exercise,
    WorkoutTemplate,
    CreateWorkoutTemplate,
    WorkoutSession,
    CreateWorkoutSession,
    WorkoutSet,
    CreateWorkoutSet,
    ProgressiveOverloadRecommendation,
} from "./types";

const supabase = createClient();

// Exercise hooks
export function useExercises() {
    return useQuery({
        queryKey: ["exercises"],
        queryFn: async (): Promise<Exercise[]> => {
            const { data, error } = await supabase
                .from("exercises")
                .select("*")
                .order("name");

            if (error) throw error;
            return data || [];
        },
    });
}

// Workout template hooks
export function useWorkoutTemplates() {
    return useQuery({
        queryKey: ["workout-templates"],
        queryFn: async (): Promise<WorkoutTemplate[]> => {
            const { data, error } = await supabase
                .from("workout_templates")
                .select(
                    `
          *,
          exercises:workout_exercises(
            *,
            exercise:exercises(*)
          )
        `
                )
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data || [];
        },
    });
}

export function useCreateWorkoutTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (template: CreateWorkoutTemplate) => {
            const { data, error } = await supabase
                .from("workout_templates")
                .insert(template)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workout-templates"] });
        },
    });
}

export function useUpdateWorkoutTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            ...template
        }: Partial<WorkoutTemplate> & { id: string }) => {
            const { data, error } = await supabase
                .from("workout_templates")
                .update(template)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workout-templates"] });
        },
    });
}

export function useDeleteWorkoutTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("workout_templates")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workout-templates"] });
        },
    });
}

// Workout session hooks
export function useWorkoutSessions() {
    return useQuery({
        queryKey: ["workout-sessions"],
        queryFn: async (): Promise<WorkoutSession[]> => {
            const { data, error } = await supabase
                .from("workout_sessions")
                .select(
                    `
          *,
          workout_template:workout_templates(*)
        `
                )
                .order("started_at", { ascending: false });

            if (error) throw error;
            return data || [];
        },
    });
}

export function useCreateWorkoutSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (session: CreateWorkoutSession) => {
            const { data, error } = await supabase
                .from("workout_sessions")
                .insert(session)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workout-sessions"] });
        },
    });
}

export function useCompleteWorkoutSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { data, error } = await supabase
                .from("workout_sessions")
                .update({ completed_at: new Date().toISOString() })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workout-sessions"] });
        },
    });
}

// Workout sets hooks
export function useWorkoutSets(sessionId: string) {
    return useQuery({
        queryKey: ["workout-sets", sessionId],
        queryFn: async (): Promise<WorkoutSet[]> => {
            const { data, error } = await supabase
                .from("workout_sets")
                .select(
                    `
          *,
          workout_exercise:workout_exercises(
            *,
            exercise:exercises(*)
          )
        `
                )
                .eq("workout_session_id", sessionId)
                .order("created_at");

            if (error) throw error;
            return data || [];
        },
        enabled: !!sessionId,
    });
}

export function useCreateWorkoutSet() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (set: CreateWorkoutSet) => {
            const { data, error } = await supabase
                .from("workout_sets")
                .insert(set)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["workout-sets", variables.workout_session_id],
            });
        },
    });
}

// Progressive overload hooks
export function useProgressiveOverloadRecommendations(sessionId: string) {
    return useQuery({
        queryKey: ["progressive-overload", sessionId],
        queryFn: async (): Promise<ProgressiveOverloadRecommendation[]> => {
            // This would typically be a database function or API endpoint
            // For now, we'll implement the logic in the frontend
            const { data: sets } = await supabase
                .from("workout_sets")
                .select(
                    `
          *,
          workout_exercise:workout_exercises(
            *,
            exercise:exercises(*)
          )
        `
                )
                .eq("workout_session_id", sessionId);

            if (!sets) return [];

            // Group sets by exercise
            const exerciseGroups = sets.reduce((acc, set) => {
                const exerciseId = set.workout_exercise.exercise.id;
                if (!acc[exerciseId]) {
                    acc[exerciseId] = {
                        exercise: set.workout_exercise.exercise,
                        target: set.workout_exercise,
                        sets: [],
                    };
                }
                acc[exerciseId].sets.push(set);
                return acc;
            }, {} as Record<string, any>);

            // Calculate recommendations
            return Object.values(exerciseGroups).map((group: any) => {
                const { exercise, target, sets } = group;
                const avgWeight =
                    sets.reduce(
                        (sum: number, set: any) =>
                            sum + (set.actual_weight || 0),
                        0
                    ) / sets.length;
                const targetMet = sets.every(
                    (set: any) =>
                        set.actual_reps >= target.target_reps &&
                        set.actual_weight >= (target.target_weight || 0)
                );

                const increment = 5; // 5 lbs increment for strength exercises
                const recommendedWeight = targetMet
                    ? avgWeight + increment
                    : avgWeight;

                return {
                    exercise_id: exercise.id,
                    exercise_name: exercise.name,
                    current_weight: avgWeight,
                    recommended_weight: recommendedWeight,
                    increment: targetMet ? increment : 0,
                    reason: targetMet ? "target_met" : "target_failed",
                };
            });
        },
        enabled: !!sessionId,
    });
}

// Exercise progress hooks
export function useExerciseProgress(exerciseId: string, days: number = 30) {
    return useQuery({
        queryKey: ["exercise-progress", exerciseId, days],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("workout_sets")
                .select(
                    `
          actual_weight,
          actual_reps,
          created_at,
          workout_exercise:workout_exercises(
            exercise:exercises(*)
          )
        `
                )
                .eq("workout_exercise.exercise_id", exerciseId)
                .gte(
                    "created_at",
                    new Date(
                        Date.now() - days * 24 * 60 * 60 * 1000
                    ).toISOString()
                )
                .order("created_at");

            if (error) throw error;

            // Group by date and calculate daily averages
            const dailyData = (data || []).reduce((acc, set) => {
                const date = new Date(set.created_at).toDateString();
                if (!acc[date]) {
                    acc[date] = { weight: 0, reps: 0, sets: 0, count: 0 };
                }
                acc[date].weight += set.actual_weight || 0;
                acc[date].reps += set.actual_reps;
                acc[date].sets += 1;
                acc[date].count += 1;
                return acc;
            }, {} as Record<string, any>);

            return Object.entries(dailyData).map(([date, stats]) => ({
                date,
                weight: stats.weight / stats.count,
                reps: stats.reps / stats.count,
                sets: stats.sets,
            }));
        },
        enabled: !!exerciseId,
    });
}
