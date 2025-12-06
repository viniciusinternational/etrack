"use client";

import { ErrorPage } from "@/components/ui/error";
import { useRouter } from "next/navigation";

export default function ExpenditureDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <ErrorPage
      title="Expenditure Error"
      message={error.message || "Failed to load expenditure details. Please try again."}
      onRetry={reset}
      onHome={() => router.push("/expenditure")}
    />
  );
}

