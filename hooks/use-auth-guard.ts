"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export function useAuthGuard() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip check for login page if it exists
    if (pathname === "/login") return;

    if (!isAuthenticated) {
      // Redirect to login or handle unauthenticated state
      // router.push("/login"); 
      console.log("User not authenticated, redirecting...");
    }
  }, [isAuthenticated, pathname, router]);

  return { isAuthenticated, user };
}
