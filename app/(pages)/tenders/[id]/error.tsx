"use client";

/**
 * Tender Detail Error Page
 * Client component for error boundary
 */

import { ErrorPage } from "@/components/ui/error";
import { useRouter } from "next/navigation";

export default function TenderDetailError({
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
    router.push("/tenders");
  };

  return (
    <ErrorPage
      title="Tender Error"
      message={error.message || "Failed to load tender details. Please try again."}
      onRetry={handleRetry}
      onHome={handleHome}
    />
  );
}

