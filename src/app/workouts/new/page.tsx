"use client";

import { useState } from "react";
import { useAuth } from "@/lib/providers";
import { useExercises, useCreateWorkoutTemplate } from "@/lib/hooks";
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
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { Plus, X, GripVertical } from "lucide-react";
import { Exercise, WorkoutExercise } from "@/lib/types";

interface ExerciseFormData {
    exercise_id: string;
    target_sets: number;
    target_reps: number;
    target_weight?: number;
    rest_seconds: number;
}

export default function NewWorkoutTemplatePage() {
    const { user } = useAuth();
    const router = useRouter();
    const { data: exercises = [] } = useExercises();
    const createTemplate = useCreateWorkoutTemplate();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedExercises, setSelectedExercises] = useState<
        ExerciseFormData[]
    >([]);

    const handleAddExercise = () => {
        setSelectedExercises([
            ...selectedExercises,
            {
                exercise_id: "",
                target_sets: 3,
                target_reps: 10,
                target_weight: undefined,
                rest_seconds: 60,
            },
        ]);
    };

    const handleRemoveExercise = (index: number) => {
        setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
    };

    const handleExerciseChange = (
        index: number,
        field: keyof ExerciseFormData,
        value: any
    ) => {
        const updated = [...selectedExercises];
        updated[index] = { ...updated[index], [field]: value };
        setSelectedExercises(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || selectedExercises.length === 0) {
            return;
        }

        try {
            // Create the workout template
            const template = await createTemplate.mutateAsync({
                user_id: user!.id,
                name: name.trim(),
                description: description.trim() || undefined,
            });

            // Create the workout exercises
            const supabase = (await import("@/lib/supabase")).createClient();

            for (let i = 0; i < selectedExercises.length; i++) {
                const exercise = selectedExercises[i];
                if (exercise.exercise_id) {
                    await supabase.from("workout_exercises").insert({
                        workout_template_id: template.id,
                        exercise_id: exercise.exercise_id,
                        target_sets: exercise.target_sets,
                        target_reps: exercise.target_reps,
                        target_weight: exercise.target_weight,
                        rest_seconds: exercise.rest_seconds,
                        order_index: i,
                    });
                }
            }

            router.push("/workouts");
        } catch (error) {
            console.error("Error creating workout template:", error);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Create Workout Template
                    </h1>
                    <p className="text-gray-600">
                        Build a custom workout routine
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Workout Details</CardTitle>
                            <CardDescription>
                                Give your workout a name and description
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Workout Name *</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Push Day, Leg Day, Full Body"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder="Optional description of your workout"
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Exercises */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Exercises</CardTitle>
                            <CardDescription>
                                Add exercises to your workout routine
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {selectedExercises.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-600 mb-4">
                                        No exercises added yet
                                    </p>
                                    <Button
                                        type="button"
                                        onClick={handleAddExercise}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Exercise
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {selectedExercises.map(
                                        (exercise, index) => (
                                            <div
                                                key={index}
                                                className="border rounded-lg p-4 space-y-4"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <GripVertical className="h-4 w-4 text-gray-400" />
                                                        <span className="font-medium">
                                                            Exercise {index + 1}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleRemoveExercise(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>
                                                            Exercise *
                                                        </Label>
                                                        <Select
                                                            value={
                                                                exercise.exercise_id
                                                            }
                                                            onValueChange={(
                                                                value
                                                            ) =>
                                                                handleExerciseChange(
                                                                    index,
                                                                    "exercise_id",
                                                                    value
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select an exercise" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {exercises.map(
                                                                    (ex) => (
                                                                        <SelectItem
                                                                            key={
                                                                                ex.id
                                                                            }
                                                                            value={
                                                                                ex.id
                                                                            }
                                                                        >
                                                                            <div className="flex items-center space-x-2">
                                                                                <span>
                                                                                    {
                                                                                        ex.name
                                                                                    }
                                                                                </span>
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className="text-xs"
                                                                                >
                                                                                    {
                                                                                        ex.category
                                                                                    }
                                                                                </Badge>
                                                                            </div>
                                                                        </SelectItem>
                                                                    )
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>
                                                            Target Weight (lbs)
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            value={
                                                                exercise.target_weight ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleExerciseChange(
                                                                    index,
                                                                    "target_weight",
                                                                    e.target
                                                                        .value
                                                                        ? parseFloat(
                                                                              e
                                                                                  .target
                                                                                  .value
                                                                          )
                                                                        : undefined
                                                                )
                                                            }
                                                            placeholder="Optional"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>Sets *</Label>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={
                                                                exercise.target_sets
                                                            }
                                                            onChange={(e) =>
                                                                handleExerciseChange(
                                                                    index,
                                                                    "target_sets",
                                                                    parseInt(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                            required
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>Reps *</Label>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={
                                                                exercise.target_reps
                                                            }
                                                            onChange={(e) =>
                                                                handleExerciseChange(
                                                                    index,
                                                                    "target_reps",
                                                                    parseInt(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                            required
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>
                                                            Rest (seconds)
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                exercise.rest_seconds
                                                            }
                                                            onChange={(e) =>
                                                                handleExerciseChange(
                                                                    index,
                                                                    "rest_seconds",
                                                                    parseInt(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleAddExercise}
                                        className="w-full"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Exercise
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                createTemplate.isPending ||
                                !name.trim() ||
                                selectedExercises.length === 0
                            }
                        >
                            {createTemplate.isPending
                                ? "Creating..."
                                : "Create Workout"}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
