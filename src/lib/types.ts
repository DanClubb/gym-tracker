export interface User {
    id: string;
    email: string;
    created_at: string;
    updated_at: string;
}

export interface Exercise {
    id: string;
    name: string;
    category: "strength" | "cardio" | "flexibility";
    muscle_groups: string[];
    equipment?: string;
    instructions?: string;
    created_at: string;
    updated_at: string;
}

export interface WorkoutTemplate {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    exercises: WorkoutExercise[];
    created_at: string;
    updated_at: string;
}

export interface CreateWorkoutTemplate {
    user_id: string;
    name: string;
    description?: string;
}

export interface WorkoutExercise {
    id: string;
    workout_template_id: string;
    exercise_id: string;
    exercise: Exercise;
    target_sets: number;
    target_reps: number;
    target_weight?: number;
    rest_seconds: number;
    order: number;
    created_at: string;
    updated_at: string;
}

export interface WorkoutSession {
    id: string;
    user_id: string;
    workout_template_id: string;
    workout_template: WorkoutTemplate;
    started_at: string;
    completed_at?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateWorkoutSession {
    user_id: string;
    workout_template_id: string;
    started_at: string;
    completed_at?: string;
    notes?: string;
}

export interface WorkoutSet {
    id: string;
    workout_session_id: string;
    workout_exercise_id: string;
    workout_exercise: WorkoutExercise;
    set_number: number;
    actual_reps: number;
    actual_weight?: number;
    rest_seconds?: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateWorkoutSet {
    workout_session_id: string;
    workout_exercise_id: string;
    set_number: number;
    actual_reps: number;
    actual_weight?: number;
    rest_seconds?: number;
    notes?: string;
}

export interface ProgressiveOverloadRecommendation {
    exercise_id: string;
    exercise_name: string;
    current_weight: number;
    recommended_weight: number;
    increment: number;
    reason: "target_met" | "target_failed" | "new_exercise";
}

export interface ExerciseProgress {
    exercise_id: string;
    exercise_name: string;
    data: {
        date: string;
        weight: number;
        reps: number;
        sets: number;
    }[];
}
