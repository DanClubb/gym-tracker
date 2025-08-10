"use client";

import { useAuth } from "@/lib/providers";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Dumbbell,
    Calendar,
    BarChart3,
    Plus,
    LogOut,
    User,
    Home,
} from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Workouts", href: "/workouts", icon: Dumbbell },
    { name: "History", href: "/history", icon: Calendar },
    { name: "Progress", href: "/progress", icon: BarChart3 },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, signOut } = useAuth();
    const pathname = usePathname();

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link
                                href="/dashboard"
                                className="flex items-center space-x-2"
                            >
                                <Dumbbell className="h-8 w-8 text-blue-600" />
                                <span className="text-xl font-bold text-gray-900">
                                    Gym Tracker
                                </span>
                            </Link>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Link href="/workout/new">
                                <Button
                                    size="sm"
                                    className="flex items-center space-x-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Start Workout</span>
                                </Button>
                            </Link>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative h-8 w-8 rounded-full"
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>
                                                {user?.email
                                                    ?.charAt(0)
                                                    .toUpperCase() || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-56"
                                    align="end"
                                    forceMount
                                >
                                    <DropdownMenuItem className="flex items-center space-x-2">
                                        <User className="h-4 w-4" />
                                        <span>{user?.email}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={handleSignOut}
                                        className="flex items-center space-x-2"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Sign out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                                        isActive
                                            ? "border-blue-500 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">{children}</div>
            </main>
        </div>
    );
}
