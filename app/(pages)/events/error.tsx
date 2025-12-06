"use client";

import { ErrorPage } from "@/components/ui/error";
import { useRouter } from "next/navigation";

export default function EventsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <ErrorPage
      title="Events Error"
      message={error.message || "Failed to load events. Please try again."}
      onRetry={reset}
      onHome={() => router.push("/dashboard")}
    />
  );
}

