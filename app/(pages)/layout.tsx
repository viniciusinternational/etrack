"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AutoLogout } from "@/components/auth/auto-logout";
import { useAuthStore } from "@/store/auth-store";
import { User } from "@/types";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();

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

  // AuthGuard will handle:
  // - Loading state during auth check
  // - Redirect to login if not authenticated
  // - Redirect to reset password if mustChangePassword is true
  // We just need to ensure we have a user before rendering AppLayout
  return (
    <AuthGuard>
      <AutoLogout />
      {appUser ? (
        <AppLayout user={appUser}>
          {children}
        </AppLayout>
      ) : null}
    </AuthGuard>
  );
}
