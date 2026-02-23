"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import authService from "@/app/services/auth.service";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.push("/");
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    // Prevent rendering protected content until auth finishes checking on the client
    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[#2C333D] flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-10 w-10 border-4 border-[#F9FFA1] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-white mt-4 font-bebas tracking-wide text-xl">Loading...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
