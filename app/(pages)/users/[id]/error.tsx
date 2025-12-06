"use client";

import { ErrorPage } from "@/components/ui/error";
import { useRouter } from "next/navigation";

export default function UserDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <ErrorPage
      title="User Error"
      message={error.message || "Failed to load user details. Please try again."}
      onRetry={reset}
      onHome={() => router.push("/users")}
    />
  );
}

