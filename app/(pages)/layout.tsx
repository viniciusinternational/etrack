"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AutoLogout } from "@/components/auth/auto-logout";
import { ChangePasswordDialog } from "@/components/auth/change-password-dialog";
import { useAuthStore } from "@/store/auth-store";
import { User } from "@/types";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    // Show change password dialog if:
    // 1. URL has changePassword=true parameter, OR
    // 2. User has mustChangePassword flag set
    const shouldShow = 
      searchParams.get("changePassword") === "true" || 
      user?.mustChangePassword === true;
    setShowChangePassword(shouldShow);
  }, [searchParams, user?.mustChangePassword]);

  // Convert UserState to User type for AppLayout
  const appUser: User | null = user
    ? {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mdaId: user.mdaId,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    : null;

  const handlePasswordChangeSuccess = () => {
    setShowChangePassword(false);
  };

  if (!appUser) {
    return null; // AuthGuard will handle redirect
  }

  return (
    <AuthGuard>
      <AutoLogout />
      <AppLayout user={appUser}>
        {children}
      </AppLayout>
      {showChangePassword && (
        <ChangePasswordDialog
          open={showChangePassword}
          forceChange={user?.mustChangePassword === true}
          onSuccess={handlePasswordChangeSuccess}
          onCancel={() => {
            if (user?.mustChangePassword) {
              // Don't allow canceling if password change is forced
              return;
            }
            setShowChangePassword(false);
          }}
        />
      )}
    </AuthGuard>
  );
}
