"use client";

import { ErrorPage } from "@/components/ui/error";
import { useRouter } from "next/navigation";

export default function MDADetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <ErrorPage
      title="MDA Error"
      message={error.message || "Failed to load MDA details. Please try again."}
      onRetry={reset}
      onHome={() => router.push("/mdas")}
    />
  );
}

