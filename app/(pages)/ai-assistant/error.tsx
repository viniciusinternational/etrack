"use client";

/**
 * AI Assistant Error Page
 * Client component for error boundary
 */

import { ErrorPage } from "@/components/ui/error";
import { useRouter } from "next/navigation";

export default function AIAssistantError({
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
      title="AI Assistant Error"
      message={error.message || "Failed to load AI assistant. Please try again."}
      onRetry={handleRetry}
      onHome={handleHome}
    />
  );
}

