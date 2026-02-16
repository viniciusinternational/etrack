"use client";

import { ErrorPage } from "@/components/ui/error";
import { useRouter } from "next/navigation";

export default function MeetingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <ErrorPage
      title="Meetings Error"
      message={error.message || "Failed to load meetings. Please try again."}
      onRetry={reset}
      onHome={() => router.push("/dashboard")}
    />
  );
}
