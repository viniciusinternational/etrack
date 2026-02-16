"use client";

import { ErrorPage } from "@/components/ui/error";
import { useRouter } from "next/navigation";

export default function NewMeetingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <ErrorPage
      title="Create Meeting Error"
      message={error.message || "Failed to load page. Please try again."}
      onRetry={reset}
      onHome={() => router.push("/meetings")}
    />
  );
}
