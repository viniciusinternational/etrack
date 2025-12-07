"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

const CHECK_INTERVAL = 60 * 1000; // Check every minute
const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before expiry

export function AutoLogout() {
  const { checkSession, sessionExpiry, isAuthenticated, autoLogout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip on login page
    if (pathname === "/auth/login" || !isAuthenticated) {
      return;
    }

    const checkSessionExpiry = () => {
      if (!sessionExpiry) {
        return;
      }

      const now = Date.now();
      const timeRemaining = sessionExpiry - now;

      // Check if session is expired
      if (timeRemaining <= 0) {
        toast.error("Your session has expired. Please login again.");
        autoLogout();
        router.push("/auth/login");
        return;
      }

      // Show warning 5 minutes before expiry
      if (timeRemaining <= WARNING_TIME && timeRemaining > CHECK_INTERVAL) {
        const minutesRemaining = Math.ceil(timeRemaining / (60 * 1000));
        toast.warning(`Your session will expire in ${minutesRemaining} minute${minutesRemaining > 1 ? "s" : ""}. Please save your work.`, {
          duration: 10000,
        });
      }
    };

    // Check immediately
    checkSessionExpiry();

    // Check session validity
    const isValid = checkSession();
    if (!isValid) {
      return; // autoLogout already called by checkSession
    }

    // Set up interval to check every minute
    const interval = setInterval(() => {
      checkSessionExpiry();
      const isValid = checkSession();
      if (!isValid) {
        clearInterval(interval);
      }
    }, CHECK_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [sessionExpiry, isAuthenticated, pathname, checkSession, autoLogout, router]);

  return null;
}

