"use client";

import { useRouter, useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { MeetingEditView } from "@/components/meetings/meeting-edit-view";
import { useMeeting, useUpdateMeeting } from "@/hooks/use-meetings";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function EditMeetingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { isChecking } = useAuthGuard(["edit_meeting"]);
  const { data: meeting, isLoading } = useMeeting(id);
  const updateMeeting = useUpdateMeeting();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => router.push(`/meetings/${id}`);

  const handleSubmit = async (data: { title?: string; status?: "ACTIVE" | "ENDED" }) => {
    setIsSubmitting(true);
    try {
      await updateMeeting.mutateAsync({ id, ...data });
      toast.success("Meeting updated");
      router.push(`/meetings/${id}`);
    } catch (error) {
      console.error("Error updating meeting:", error);
      toast.error("Failed to update meeting");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChecking || isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!meeting) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <MeetingEditView
          meeting={meeting}
          onBack={handleBack}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
