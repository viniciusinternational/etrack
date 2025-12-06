"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export function useAuthGuard() {
  const { isAuthenticated, user, checkSession } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Skip check for login page
    if (pathname === "/login") {
      setIsChecking(false);
      // If already authenticated, redirect to dashboard
      if (isAuthenticated && checkSession()) {
        const changePassword = searchParams.get("changePassword");
        if (changePassword === "true" || user?.mustChangePassword) {
          router.push("/dashboard?changePassword=true");
        } else {
          router.push("/dashboard");
        }
      }
      return;
    }

    // Check session validity
    const isValid = checkSession();

    if (!isAuthenticated || !isValid) {
      // Session expired or not authenticated
      router.push("/login");
      return;
    }

    // Check if password change is required
    if (user?.mustChangePassword && pathname !== "/dashboard") {
      router.push("/dashboard?changePassword=true");
      return;
    }

    setIsChecking(false);
  }, [isAuthenticated, pathname, router, user, checkSession, searchParams]);

  return { isAuthenticated, user, isChecking };
}
