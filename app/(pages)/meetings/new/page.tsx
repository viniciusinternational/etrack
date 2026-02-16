"use client";

import { useRouter } from "next/navigation";
import { MeetingFormView } from "@/components/meetings/meeting-form-view";
import { useCreateMeeting } from "@/hooks/use-meetings";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function NewMeetingPage() {
  const router = useRouter();
  const { isChecking } = useAuthGuard(["create_meeting"]);
  const createMeeting = useCreateMeeting();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    router.push("/meetings");
  };

  const handleSubmit = async (data: { title: string; participants?: Array<{ email: string; name: string }> }) => {
    setIsSubmitting(true);
    try {
      const meeting = await createMeeting.mutateAsync(data);
      toast.success("Meeting created successfully");
      router.push(`/meetings/${meeting.id}`);
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast.error("Failed to create meeting");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <MeetingFormView
          onBack={handleBack}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
