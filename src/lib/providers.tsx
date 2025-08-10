"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, createContext, useContext, useEffect } from "react";
import { createClient } from "./supabase";
import { User } from "./types";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 minute
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
    );
}

function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        // Get initial session
        const getSession = async () => {
            console.log("🔍 Getting initial session...");
            const {
                data: { session },
            } = await supabase.auth.getSession();
            console.log("📋 Session:", session ? "Found" : "None");

            if (session?.user) {
                console.log("👤 User ID:", session.user.id);
                const { data: userData, error } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();

                if (error && error.code === "PGRST116") {
                    console.log("⚠️ User profile missing, creating...");
                    // User profile doesn't exist, create it
                    const { data: newUser } = await supabase
                        .from("users")
                        .insert({
                            id: session.user.id,
                            email: session.user.email,
                        })
                        .select()
                        .single();
                    console.log("✅ Created user profile:", newUser);
                    setUser(newUser);
                } else if (userData) {
                    console.log("✅ Found user profile:", userData);
                    setUser(userData);
                } else if (error) {
                    console.error("❌ Error fetching user:", error);
                }
            }
            console.log("🏁 Setting loading to false");
            setLoading(false);
        };

        getSession();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const { data: userData, error } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();

                if (error && error.code === "PGRST116") {
                    // User profile doesn't exist, create it
                    const { data: newUser } = await supabase
                        .from("users")
                        .insert({
                            id: session.user.id,
                            email: session.user.email,
                        })
                        .select()
                        .single();
                    setUser(newUser);
                } else if (userData) {
                    setUser(userData);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
    };

    const signUp = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) throw error;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, signIn, signUp, signOut }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
