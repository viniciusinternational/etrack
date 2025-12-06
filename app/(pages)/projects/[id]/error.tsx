"use client";

/**
 * Project Detail Error Page
 * Client component for error boundary
 */

import { ErrorPage } from "@/components/ui/error";
import { useRouter } from "next/navigation";

export default function ProjectDetailError({
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
    router.push("/projects");
  };

  return (
    <ErrorPage
      title="Project Error"
      message={error.message || "Failed to load project details. Please try again."}
      onRetry={handleRetry}
      onHome={handleHome}
    />
  );
}

