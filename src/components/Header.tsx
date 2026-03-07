"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Header() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const fetchProfile = async (userId: string) => {
            let errorOccurred = null;
            for (let i = 0; i < 5; i++) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (data) {
                    setProfile(data);
                    return;
                }

                errorOccurred = error;
                // Wait 1s before retry
                await new Promise(res => setTimeout(res, 1000));
            }

            if (errorOccurred) {
                console.error("Profile fetch error after retries:", errorOccurred);
            }
        };

        // Listen for auth changes and handle initial session
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth Event:", event);
            const currentUser = session?.user || null;
            setUser(currentUser);

            if (currentUser) {
                await fetchProfile(currentUser.id);
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md z-50 border-b border-border">
            <div className="container mx-auto px-6 h-full flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">
                        HealthBook
                    </span>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link
                        href="/doctors"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                        Find Doctors
                    </Link>
                    <Link
                        href="/doctors/1"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                        Video Consult
                    </Link>
                    {profile?.role === 'doctor' && (
                        <>
                            <Link
                                href="/dashboard/provider/services"
                                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                            >
                                Services
                            </Link>
                            <Link
                                href="/dashboard/provider/settings"
                                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                            >
                                Settings
                            </Link>
                        </>
                    )}
                </nav>

                {/* Auth CTA */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link
                                href={profile?.role === 'doctor' ? "/dashboard/provider" : "/dashboard/customer"}
                                className="text-sm font-bold text-foreground hover:text-primary transition-colors"
                            >
                                {profile?.full_name || 'My Dashboard'}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="px-5 py-2.5 bg-slate-100 text-foreground text-sm font-semibold rounded-2xl hover:bg-slate-200 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-2xl hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            Login / Signup
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
