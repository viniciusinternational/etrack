"use client";

import { ErrorPage } from "@/components/ui/error";
import { useRouter, useParams } from "next/navigation";

export default function EditMeetingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  return (
    <ErrorPage
      title="Edit Meeting Error"
      message={error.message || "Failed to load page. Please try again."}
      onRetry={reset}
      onHome={() => router.push(id ? `/meetings/${id}` : "/meetings")}
    />
  );
}
