"use client";

/**
 * Dashboard Error Page
 * Client component for error boundary
 */

import { ErrorPage } from "@/components/ui/error";
import { useRouter } from "next/navigation";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  const handleRetry = () => {
    reset();
  };

  const handleHome = () => {
    router.push("/dashboard");
  };

  return (
    <ErrorPage
      title="Dashboard Error"
      message={error.message || "Failed to load dashboard data. Please try again."}
      onRetry={handleRetry}
      onHome={handleHome}
    />
  );
}

