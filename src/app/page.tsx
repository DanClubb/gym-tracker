"use client";

import { useAuth } from "@/lib/providers";
import { AuthForm } from "@/components/auth/auth-form";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push("/dashboard");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return <AuthForm />;
    }

    return null;
}
