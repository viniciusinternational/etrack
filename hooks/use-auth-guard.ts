"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { hasAnyPermission } from "@/lib/permissions";
import type { PermissionKey } from "@/types/permissions";

interface UseAuthGuardReturn {
  isChecking: boolean;
  user: any | null;
}

/**
 * Hook to protect routes with authentication and optional permission checks
 * 
 * @param requiredPermissions - Optional array of permission keys. User needs at least one.
 * @returns Object with isChecking flag and user object
 * 
 * @example
 * // Require authentication only
 * const { isChecking, user } = useAuthGuard();
 * 
 * // Require specific permission
 * const { isChecking, user } = useAuthGuard(['view_project']);
 * 
 * // Require any of multiple permissions
 * const { isChecking, user } = useAuthGuard(['view_project', 'view_report']);
 */
export function useAuthGuard(
  requiredPermissions?: PermissionKey[]
): UseAuthGuardReturn {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, hasHydrated, checkSession } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for hydration to complete before checking authentication
    if (!hasHydrated) {
      return;
    }

    // Skip check for login page
    if (pathname === "/auth/login") {
      setIsChecking(false);
      // If already authenticated, redirect appropriately
      if (isAuthenticated && checkSession()) {
        if (user?.mustChangePassword) {
          router.push("/auth/resetpassword");
        } else {
          router.push("/dashboard");
        }
      }
      return;
    }

    // Allow access to reset password page if authenticated
    if (pathname === "/auth/resetpassword") {
      const isValid = checkSession();
      if (!isAuthenticated || !isValid) {
        router.push("/auth/login");
        return;
      }
      setIsChecking(false);
      return;
    }

    // Check session validity
    const isValid = checkSession();

    if (!isAuthenticated || !isValid || !user) {
      // Session expired or not authenticated
      router.push("/auth/login");
      return;
    }

    // Check if password change is required
    if (user?.mustChangePassword && pathname !== "/auth/resetpassword") {
      router.push("/auth/resetpassword");
      return;
    }

    // 2. Check permissions if required permissions are specified
    if (requiredPermissions && requiredPermissions.length > 0) {
      if (!hasAnyPermission(user, requiredPermissions)) {
        // User doesn't have required permissions
        // If already on dashboard, don't redirect (avoid infinite loop)
        if (pathname !== "/dashboard") {
          router.push("/dashboard");
          return;
        }
        // If on dashboard and missing permission, still allow (will show no access message)
      }
    }

    // User is authenticated and authorized
    setIsChecking(false);
  }, [isAuthenticated, user, hasHydrated, router, requiredPermissions, pathname, checkSession]);

  return { isChecking, user };
}
