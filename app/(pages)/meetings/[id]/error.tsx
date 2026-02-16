"use client";

import { ErrorPage } from "@/components/ui/error";
import { useRouter } from "next/navigation";

export default function MeetingDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <ErrorPage
      title="Meeting Error"
      message={error.message || "Failed to load meeting. Please try again."}
      onRetry={reset}
      onHome={() => router.push("/meetings")}
    />
  );
}
