"use client";

import { useRouter, useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { MeetingDetailView } from "@/components/meetings/meeting-detail-view";
import { useMeeting, useDeleteMeeting } from "@/hooks/use-meetings";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function MeetingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { isChecking } = useAuthGuard(["view_meeting"]);
  const { data: meeting, isLoading } = useMeeting(id);
  const deleteMeeting = useDeleteMeeting();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleBack = () => router.push("/meetings");
  const handleEdit = () => router.push(`/meetings/${id}/edit`);

  const handleDelete = async () => {
    try {
      await deleteMeeting.mutateAsync(id);
      toast.success("Meeting ended");
      router.push("/meetings");
    } catch {
      toast.error("Failed to end meeting");
    } finally {
      setShowDeleteConfirm(false);
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
      <div className="max-w-7xl mx-auto">
        <MeetingDetailView
          meeting={meeting}
          onBack={handleBack}
          onEdit={handleEdit}
          onDelete={() => setShowDeleteConfirm(true)}
        />
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End meeting?</AlertDialogTitle>
            <AlertDialogDescription>
              This will end the meeting &quot;{meeting.title}&quot;. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              End Meeting
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
