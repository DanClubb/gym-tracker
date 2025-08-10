"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/providers";
import {
    useWorkoutSets,
    useProgressiveOverloadRecommendations,
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
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { TrendingUp, CheckCircle, XCircle, Target, Award } from "lucide-react";
import Link from "next/link";

export default function WorkoutSummaryPage() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const sessionId = params.id as string;

    const { data: sets = [], isLoading: setsLoading } =
        useWorkoutSets(sessionId);
    const { data: recommendations = [], isLoading: recommendationsLoading } =
        useProgressiveOverloadRecommendations(sessionId);

    if (!user) {
        return null;
    }

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

    const totalSets = sets.length;
    const totalVolume = sets.reduce(
        (sum, set) => sum + (set.actual_weight || 0) * set.actual_reps,
        0
    );

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Workout Complete!
                        </h1>
                        <p className="text-gray-600">
                            Great job finishing your workout
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" asChild>
                            <Link href="/dashboard">Back to Dashboard</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/workout/new">Start New Workout</Link>
                        </Button>
                    </div>
                </div>

                {/* Workout Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Target className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Total Sets
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {totalSets}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Total Volume
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {totalVolume.toFixed(0)} lbs
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Award className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Exercises
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {Object.keys(exerciseGroups).length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Progressive Overload Recommendations */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5" />
                            <span>Progressive Overload Recommendations</span>
                        </CardTitle>
                        <CardDescription>
                            Suggested weight increases for your next workout
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recommendationsLoading ? (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : recommendations.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-600">
                                    No recommendations available
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recommendations.map((rec) => (
                                    <div
                                        key={rec.exercise_id}
                                        className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2">
                                                {rec.increment > 0 ? (
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-yellow-600" />
                                                )}
                                                <span className="font-medium">
                                                    {rec.exercise_name}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Current:{" "}
                                                {rec.current_weight.toFixed(1)}{" "}
                                                lbs
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <div className="font-medium">
                                                    {rec.recommended_weight.toFixed(
                                                        1
                                                    )}{" "}
                                                    lbs
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {rec.increment > 0
                                                        ? `+${rec.increment} lbs`
                                                        : "No change"}
                                                </div>
                                            </div>
                                            <Badge
                                                variant={
                                                    rec.increment > 0
                                                        ? "default"
                                                        : "secondary"
                                                }
                                            >
                                                {rec.reason === "target_met"
                                                    ? "Target Met"
                                                    : "Target Failed"}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Exercise Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Exercise Details</CardTitle>
                        <CardDescription>
                            Breakdown of your completed exercises and sets
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {setsLoading ? (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.values(exerciseGroups).map(
                                    (group: any) => (
                                        <div
                                            key={group.exercise.id}
                                            className="space-y-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-lg">
                                                    {group.exercise.name}
                                                </h3>
                                                <Badge variant="outline">
                                                    {group.sets.length} sets
                                                </Badge>
                                            </div>

                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>
                                                            Set
                                                        </TableHead>
                                                        <TableHead>
                                                            Weight (lbs)
                                                        </TableHead>
                                                        <TableHead>
                                                            Reps
                                                        </TableHead>
                                                        <TableHead>
                                                            Volume
                                                        </TableHead>
                                                        <TableHead>
                                                            Target Met
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {group.sets.map(
                                                        (
                                                            set: any,
                                                            index: number
                                                        ) => {
                                                            const volume =
                                                                (set.actual_weight ||
                                                                    0) *
                                                                set.actual_reps;
                                                            const targetMet =
                                                                set.actual_reps >=
                                                                    group.target
                                                                        .target_reps &&
                                                                (set.actual_weight ||
                                                                    0) >=
                                                                    (group
                                                                        .target
                                                                        .target_weight ||
                                                                        0);

                                                            return (
                                                                <TableRow
                                                                    key={index}
                                                                >
                                                                    <TableCell className="font-medium">
                                                                        {
                                                                            set.set_number
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {set.actual_weight ||
                                                                            "-"}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {
                                                                            set.actual_reps
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {volume.toFixed(
                                                                            0
                                                                        )}{" "}
                                                                        lbs
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {targetMet ? (
                                                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                                                        ) : (
                                                                            <XCircle className="h-4 w-4 text-yellow-600" />
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        }
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
