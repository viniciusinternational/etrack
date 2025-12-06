"use client";

import { ErrorPage } from "@/components/ui/error";
import { useRouter } from "next/navigation";

export default function SubmissionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <ErrorPage
      title="Submissions Error"
      message={error.message || "Failed to load submissions. Please try again."}
      onRetry={reset}
      onHome={() => router.push("/dashboard")}
    />
  );
}

