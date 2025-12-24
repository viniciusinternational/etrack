"use client";

import { ErrorPage } from "@/components/ui/error";
import { useRouter } from "next/navigation";

export default function NewEventError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <ErrorPage
      title="Create Event Error"
      message={error.message || "Failed to load create event page. Please try again."}
      onRetry={reset}
      onHome={() => router.push("/events")}
    />
  );
}

