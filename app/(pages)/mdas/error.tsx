"use client";

import { ErrorPage } from "@/components/ui/error";
import { useRouter } from "next/navigation";

export default function MDAsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <ErrorPage
      title="MDAs Error"
      message={error.message || "Failed to load MDAs. Please try again."}
      onRetry={reset}
      onHome={() => router.push("/dashboard")}
    />
  );
}

