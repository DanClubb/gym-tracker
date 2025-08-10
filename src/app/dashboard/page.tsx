"use client";

import { useAuth } from "@/lib/providers";
import { useWorkoutTemplates, useWorkoutSessions } from "@/lib/hooks";
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
import Link from "next/link";
import {
    Dumbbell,
    Calendar,
    Plus,
    Clock,
    TrendingUp,
    Activity,
} from "lucide-react";

export default function DashboardPage() {
    const { user } = useAuth();
    const { data: templates = [], isLoading: templatesLoading } =
        useWorkoutTemplates();
    const { data: sessions = [], isLoading: sessionsLoading } =
        useWorkoutSessions();

    const recentSessions = sessions.slice(0, 5);
    const recentTemplates = templates.slice(0, 3);

    if (!user) {
        return null;
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Welcome Section */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back!
                    </h1>
                    <p className="text-gray-600">
                        Ready to crush your next workout?
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Plus className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">
                                        Start Workout
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Begin a new session
                                    </p>
                                </div>
                            </div>
                            <Button className="w-full mt-4" asChild>
                                <Link href="/workout/new">Start Now</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Dumbbell className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">
                                        Create Template
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Build a new workout
                                    </p>
                                </div>
                            </div>
                            <Button
                                className="w-full mt-4"
                                variant="outline"
                                asChild
                            >
                                <Link href="/workouts/new">
                                    Create Template
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">
                                        View Progress
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Track your gains
                                    </p>
                                </div>
                            </div>
                            <Button
                                className="w-full mt-4"
                                variant="outline"
                                asChild
                            >
                                <Link href="/progress">View Progress</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Workouts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Clock className="h-5 w-5" />
                                <span>Recent Workouts</span>
                            </CardTitle>
                            <CardDescription>
                                Your latest workout sessions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {sessionsLoading ? (
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : recentSessions.length === 0 ? (
                                <div className="text-center py-8">
                                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">
                                        No workouts yet
                                    </p>
                                    <Button className="mt-2" asChild>
                                        <Link href="/workout/new">
                                            Start your first workout
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentSessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div>
                                                <h4 className="font-medium">
                                                    {session.workout_template
                                                        ?.name ||
                                                        "Untitled Workout"}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(
                                                        session.started_at
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Badge
                                                variant={
                                                    session.completed_at
                                                        ? "default"
                                                        : "secondary"
                                                }
                                            >
                                                {session.completed_at
                                                    ? "Completed"
                                                    : "In Progress"}
                                            </Badge>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        asChild
                                    >
                                        <Link href="/history">View All</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Workout Templates */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Dumbbell className="h-5 w-5" />
                                <span>Workout Templates</span>
                            </CardTitle>
                            <CardDescription>
                                Your saved workout routines
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {templatesLoading ? (
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : recentTemplates.length === 0 ? (
                                <div className="text-center py-8">
                                    <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">
                                        No templates yet
                                    </p>
                                    <Button className="mt-2" asChild>
                                        <Link href="/workouts/new">
                                            Create your first template
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentTemplates.map((template) => (
                                        <div
                                            key={template.id}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div>
                                                <h4 className="font-medium">
                                                    {template.name}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    {template.exercises
                                                        ?.length || 0}{" "}
                                                    exercises
                                                </p>
                                            </div>
                                            <Button size="sm" asChild>
                                                <Link
                                                    href={`/workout/new?template=${template.id}`}
                                                >
                                                    Start
                                                </Link>
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        asChild
                                    >
                                        <Link href="/workouts">View All</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
