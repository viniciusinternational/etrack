"use client";

import { ErrorPage } from "@/components/ui/error";
import { useRouter } from "next/navigation";

export default function BudgetDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <ErrorPage
      title="Budget Error"
      message={error.message || "Failed to load budget details. Please try again."}
      onRetry={reset}
      onHome={() => router.push("/budget")}
    />
  );
}

