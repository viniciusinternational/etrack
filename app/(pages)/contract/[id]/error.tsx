"use client";

import { ErrorPage } from "@/components/ui/error";
import { useRouter } from "next/navigation";

export default function ContractDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <ErrorPage
      title="Contract Error"
      message={error.message || "Failed to load contract details. Please try again."}
      onRetry={reset}
      onHome={() => router.push("/contract")}
    />
  );
}

