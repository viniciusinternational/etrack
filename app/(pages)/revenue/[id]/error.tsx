"use client";

/**
 * Revenue Detail Error Page
 * Client component for error boundary
 */

import { ErrorPage } from "@/components/ui/error";
import { useRouter } from "next/navigation";

export default function RevenueDetailError({
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
    router.push("/revenue");
  };

  return (
    <ErrorPage
      title="Revenue Error"
      message={error.message || "Failed to load revenue details. Please try again."}
      onRetry={handleRetry}
      onHome={handleHome}
    />
  );
}

