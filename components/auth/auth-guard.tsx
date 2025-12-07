"use client";

import { useAuthGuard } from "@/hooks/use-auth-guard";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isChecking } = useAuthGuard();

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-kaduna-blue-light/20 via-white to-kaduna-green-light/15">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-kaduna-blue" />
          <p className="text-sm text-muted-foreground font-medium">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  // Redirect will be handled by useAuthGuard hook

  return <>{children}</>;
}

