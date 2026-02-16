"use client";

import { ErrorPage } from "@/components/ui/error";
import { useRouter } from "next/navigation";

export default function ReportsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <ErrorPage
      title="Reports Error"
      message={error.message || "Failed to load reports. Please try again."}
      onRetry={reset}
      onHome={() => router.push("/dashboard")}
    />
  );
}
