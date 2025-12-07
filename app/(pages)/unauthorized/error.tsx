"use client";

import { useEffect } from "react";
import { ErrorPage } from "@/components/ui/error";
import { useRouter } from "next/navigation";

export default function UnauthorizedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Unauthorized page error:", error);
  }, [error]);

  const handleHome = () => {
    router.push("/dashboard");
  };

  return (
    <ErrorPage
      title="Error Loading Page"
      message={error.message || "An error occurred while loading the unauthorized page."}
      onRetry={reset}
      onHome={handleHome}
    />
  );
}

