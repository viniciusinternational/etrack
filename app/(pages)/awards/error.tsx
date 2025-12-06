"use client";

import { ErrorPage } from "@/components/ui/error";
import { useRouter } from "next/navigation";

export default function AwardsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <ErrorPage
      title="Awards Error"
      message={error.message || "Failed to load awards. Please try again."}
      onRetry={reset}
      onHome={() => router.push("/dashboard")}
    />
  );
}

