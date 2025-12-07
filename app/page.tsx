"use client";

/**
 * Landing page for E-Track
 * Client-side auth-aware redirect based on authentication state
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, checkSession } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for Zustand persist rehydration
    // Check session validity
    const isValid = checkSession();

    if (!isAuthenticated || !isValid) {
      // Not authenticated or session expired
      router.push("/auth/login");
      return;
    }

    // Check if password change is required
    if (user?.mustChangePassword) {
      router.push("/auth/resetpassword");
      return;
    }

    // Authenticated and no password change required
    router.push("/dashboard");
  }, [isAuthenticated, user, checkSession, router]);

  // Show loading state while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-kaduna-blue-light/20 via-white to-kaduna-green-light/15">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-kaduna-blue" />
        <p className="text-sm text-muted-foreground font-medium">
          Loading...
        </p>
      </div>
    </div>
  );
}
