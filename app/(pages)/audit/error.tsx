"use client";

import { ErrorPage } from "@/components/ui/error";
import { useRouter } from "next/navigation";

export default function AuditError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <ErrorPage
      title="Audit Error"
      message={error.message || "Failed to load audit logs. Please try again."}
      onRetry={reset}
      onHome={() => router.push("/dashboard")}
    />
  );
}

