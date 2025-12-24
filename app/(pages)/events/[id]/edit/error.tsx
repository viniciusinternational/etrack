"use client";

import { ErrorPage } from "@/components/ui/error";
import { useRouter } from "next/navigation";

export default function EditEventError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <ErrorPage
      title="Edit Event Error"
      message={error.message || "Failed to load event for editing. Please try again."}
      onRetry={reset}
      onHome={() => router.push("/events")}
    />
  );
}

