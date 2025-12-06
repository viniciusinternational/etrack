"use client";

import { ErrorPage } from "@/components/ui/error";
import { useRouter } from "next/navigation";

export default function SubmissionDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <ErrorPage
      title="Submission Error"
      message={error.message || "Failed to load submission details. Please try again."}
      onRetry={reset}
      onHome={() => router.push("/submissions")}
    />
  );
}

