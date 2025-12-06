"use client";

import { useRouter, useParams } from "next/navigation";
import { AwardFormView } from "@/components/procurement/award-form-view";
import { useAward, useUpdateAward } from "@/hooks/use-awards";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EditAwardPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: award, isLoading, error } = useAward(id);
  const { mutateAsync: updateAward } = useUpdateAward();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !award) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-xl font-semibold">Award not found</h2>
        <p className="text-muted-foreground">The requested award could not be found.</p>
        <button
          onClick={() => router.push("/awards")}
          className="text-primary hover:underline"
        >
          Back to Awards
        </button>
      </div>
    );
  }

  return (
    <AwardFormView
      award={award}
      onBack={() => router.push("/awards")}
      onSave={async (data) => {
        try {
          await updateAward({ id, ...data });
          toast.success("Award updated successfully!");
          router.push("/awards");
        } catch (e) {
          console.error(e);
          toast.error("Failed to update award");
        }
      }}
    />
  );
}
