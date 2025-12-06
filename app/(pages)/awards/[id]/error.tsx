"use client";

import { ErrorPage } from "@/components/ui/error";
import { useRouter } from "next/navigation";

export default function AwardDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <ErrorPage
      title="Award Error"
      message={error.message || "Failed to load award details. Please try again."}
      onRetry={reset}
      onHome={() => router.push("/awards")}
    />
  );
}

