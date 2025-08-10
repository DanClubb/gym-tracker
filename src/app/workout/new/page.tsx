"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/providers";
import {
    useWorkoutTemplates,
    useCreateWorkoutSession,
    useCreateWorkoutSet,
    useCompleteWorkoutSession,
} from "@/lib/hooks";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Check, Timer, Target } from "lucide-react";
import { WorkoutTemplate, WorkoutExercise } from "@/lib/types";

interface SetData {
    set_number: number;
    actual_reps: number;
    actual_weight?: number;
    rest_seconds?: number;
    saved?: boolean;
}

interface ExerciseSession {
    workout_exercise: WorkoutExercise;
    sets: SetData[];
    completed: boolean;
}

export default function NewWorkoutPage() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const templateId = searchParams.get("template");

    const { data: templates = [] } = useWorkoutTemplates();
    const createSession = useCreateWorkoutSession();
    const createSet = useCreateWorkoutSet();
    const completeSession = useCompleteWorkoutSession();

    const [selectedTemplate, setSelectedTemplate] =
        useState<WorkoutTemplate | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [exerciseSessions, setExerciseSessions] = useState<ExerciseSession[]>(
        []
    );
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    // Initialize template if provided in URL
    useEffect(() => {
        if (templateId && templates.length > 0) {
            const template = templates.find((t) => t.id === templateId);
            if (template) {
                setSelectedTemplate(template);
            }
        }
    }, [templateId, templates]);

    // Initialize exercise sessions when template is selected
    useEffect(() => {
        if (selectedTemplate && selectedTemplate.exercises) {
            const sessions = selectedTemplate.exercises.map((exercise) => ({
                workout_exercise: exercise,
                sets: [],
                completed: false,
            }));
            setExerciseSessions(sessions);
        }
    }, [selectedTemplate]);

    const handleStartWorkout = async () => {
        if (!selectedTemplate) return;

        try {
            const session = await createSession.mutateAsync({
                user_id: user!.id,
                workout_template_id: selectedTemplate.id,
                started_at: new Date().toISOString(),
            });
            setSessionId(session.id);
        } catch (error) {
            console.error("Error starting workout:", error);
        }
    };

    const handleAddSet = (exerciseIndex: number) => {
        const updated = [...exerciseSessions];
        const exercise = updated[exerciseIndex];
        const setNumber = exercise.sets.length + 1;

        exercise.sets.push({
            set_number: setNumber,
            actual_reps: exercise.workout_exercise.target_reps,
            actual_weight: exercise.workout_exercise.target_weight,
            rest_seconds: exercise.workout_exercise.rest_seconds,
        });

        setExerciseSessions(updated);
    };

    const handleUpdateSet = (
        exerciseIndex: number,
        setIndex: number,
        field: keyof SetData,
        value: any
    ) => {
        const updated = [...exerciseSessions];
        updated[exerciseIndex].sets[setIndex] = {
            ...updated[exerciseIndex].sets[setIndex],
            [field]: value,
        };
        setExerciseSessions(updated);
    };

    const handleSaveSet = async (exerciseIndex: number, setIndex: number) => {
        if (!sessionId) return;

        const exercise = exerciseSessions[exerciseIndex];
        const set = exercise.sets[setIndex];

        try {
            await createSet.mutateAsync({
                workout_session_id: sessionId,
                workout_exercise_id: exercise.workout_exercise.id,
                set_number: set.set_number,
                actual_reps: set.actual_reps,
                actual_weight: set.actual_weight,
                rest_seconds: set.rest_seconds,
            });

            // Mark set as saved
            const updated = [...exerciseSessions];
            updated[exerciseIndex].sets[setIndex] = {
                ...updated[exerciseIndex].sets[setIndex],
                saved: true,
            };
            setExerciseSessions(updated);
        } catch (error) {
            console.error("Error saving set:", error);
        }
    };

    const handleCompleteExercise = (exerciseIndex: number) => {
        const updated = [...exerciseSessions];
        updated[exerciseIndex].completed = true;
        setExerciseSessions(updated);

        // Move to next exercise if available
        if (exerciseIndex < exerciseSessions.length - 1) {
            setCurrentExerciseIndex(exerciseIndex + 1);
        }
    };

    const handleCompleteWorkout = async () => {
        if (!sessionId) return;

        try {
            await completeSession.mutateAsync(sessionId);
            setIsCompleted(true);
            router.push(`/workout/${sessionId}/summary`);
        } catch (error) {
            console.error("Error completing workout:", error);
        }
    };

    const allExercisesCompleted = exerciseSessions.every((ex) => ex.completed);

    if (!user) {
        return null;
    }

    if (!selectedTemplate) {
        return (
            <DashboardLayout>
                <div className="max-w-2xl mx-auto space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Start Workout
                        </h1>
                        <p className="text-gray-600">
                            Choose a workout template to begin
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Select Workout Template</CardTitle>
                            <CardDescription>
                                Choose from your saved workout templates
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                    onClick={() =>
                                        setSelectedTemplate(template)
                                    }
                                >
                                    <div>
                                        <h3 className="font-medium">
                                            {template.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {template.exercises?.length || 0}{" "}
                                            exercises
                                        </p>
                                    </div>
                                    <Button size="sm">Select</Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    if (!sessionId) {
        return (
            <DashboardLayout>
                <div className="max-w-2xl mx-auto space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Start Workout
                        </h1>
                        <p className="text-gray-600">
                            Ready to begin: {selectedTemplate.name}
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Workout Overview</CardTitle>
                            <CardDescription>
                                Review your workout before starting
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-medium mb-2">Exercises:</h3>
                                <div className="space-y-2">
                                    {selectedTemplate.exercises?.map(
                                        (exercise, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                            >
                                                <span>
                                                    {exercise.exercise.name}
                                                </span>
                                                <Badge variant="outline">
                                                    {exercise.target_sets} ×{" "}
                                                    {exercise.target_reps}
                                                </Badge>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            <Button
                                onClick={handleStartWorkout}
                                disabled={createSession.isPending}
                                className="w-full"
                            >
                                {createSession.isPending
                                    ? "Starting..."
                                    : "Start Workout"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    const currentExercise = exerciseSessions[currentExerciseIndex];

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {selectedTemplate.name}
                        </h1>
                        <p className="text-gray-600">
                            Exercise {currentExerciseIndex + 1} of{" "}
                            {exerciseSessions.length}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                            {
                                exerciseSessions.filter((ex) => ex.completed)
                                    .length
                            }{" "}
                            / {exerciseSessions.length} completed
                        </Badge>
                        {allExercisesCompleted && (
                            <Button
                                onClick={handleCompleteWorkout}
                                disabled={completeSession.isPending}
                            >
                                {completeSession.isPending
                                    ? "Completing..."
                                    : "Complete Workout"}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                            width: `${
                                (exerciseSessions.filter((ex) => ex.completed)
                                    .length /
                                    exerciseSessions.length) *
                                100
                            }%`,
                        }}
                    />
                </div>

                {/* Current Exercise */}
                {currentExercise && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Target className="h-5 w-5" />
                                <span>
                                    {
                                        currentExercise.workout_exercise
                                            .exercise.name
                                    }
                                </span>
                                {currentExercise.completed && (
                                    <Check className="h-5 w-5 text-green-600" />
                                )}
                            </CardTitle>
                            <CardDescription>
                                Target:{" "}
                                {currentExercise.workout_exercise.target_sets}{" "}
                                sets ×{" "}
                                {currentExercise.workout_exercise.target_reps}{" "}
                                reps
                                {currentExercise.workout_exercise
                                    .target_weight &&
                                    ` @ ${currentExercise.workout_exercise.target_weight} lbs`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Sets */}
                            <div className="space-y-3">
                                {currentExercise.sets.map((set, setIndex) => (
                                    <div
                                        key={setIndex}
                                        className="flex items-center space-x-4 p-3 border rounded-lg"
                                    >
                                        <div className="font-medium">
                                            Set {set.set_number}
                                        </div>
                                        <div className="flex-1 grid grid-cols-3 gap-4">
                                            <div>
                                                <Label className="text-xs">
                                                    Reps
                                                </Label>
                                                <Input
                                                    type="number"
                                                    value={set.actual_reps}
                                                    onChange={(e) =>
                                                        handleUpdateSet(
                                                            currentExerciseIndex,
                                                            setIndex,
                                                            "actual_reps",
                                                            parseInt(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                    min="0"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">
                                                    Weight (lbs)
                                                </Label>
                                                <Input
                                                    type="number"
                                                    value={
                                                        set.actual_weight || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleUpdateSet(
                                                            currentExerciseIndex,
                                                            setIndex,
                                                            "actual_weight",
                                                            e.target.value
                                                                ? parseFloat(
                                                                      e.target
                                                                          .value
                                                                  )
                                                                : undefined
                                                        )
                                                    }
                                                    min="0"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">
                                                    Rest (sec)
                                                </Label>
                                                <Input
                                                    type="number"
                                                    value={
                                                        set.rest_seconds || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleUpdateSet(
                                                            currentExerciseIndex,
                                                            setIndex,
                                                            "rest_seconds",
                                                            e.target.value
                                                                ? parseInt(
                                                                      e.target
                                                                          .value
                                                                  )
                                                                : undefined
                                                        )
                                                    }
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSet(
                                                    currentExerciseIndex,
                                                    setIndex
                                                )
                                            }
                                            disabled={createSet.isPending}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {/* Add Set Button */}
                            {currentExercise.sets.length <
                                currentExercise.workout_exercise
                                    .target_sets && (
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        handleAddSet(currentExerciseIndex)
                                    }
                                    className="w-full"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Set
                                </Button>
                            )}

                            {/* Complete Exercise Button */}
                            {currentExercise.sets.length >=
                                currentExercise.workout_exercise.target_sets &&
                                !currentExercise.completed && (
                                    <Button
                                        onClick={() =>
                                            handleCompleteExercise(
                                                currentExerciseIndex
                                            )
                                        }
                                        className="w-full"
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Complete Exercise
                                    </Button>
                                )}
                        </CardContent>
                    </Card>
                )}

                {/* Exercise Navigation */}
                <div className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={() =>
                            setCurrentExerciseIndex(
                                Math.max(0, currentExerciseIndex - 1)
                            )
                        }
                        disabled={currentExerciseIndex === 0}
                    >
                        Previous Exercise
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() =>
                            setCurrentExerciseIndex(
                                Math.min(
                                    exerciseSessions.length - 1,
                                    currentExerciseIndex + 1
                                )
                            )
                        }
                        disabled={
                            currentExerciseIndex === exerciseSessions.length - 1
                        }
                    >
                        Next Exercise
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
