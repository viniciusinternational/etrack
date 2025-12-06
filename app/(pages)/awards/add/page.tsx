"use client";

import { useRouter } from "next/navigation";
import { AwardFormView } from "@/components/procurement/award-form-view";
import { useCreateAward } from "@/hooks/use-awards";
import { toast } from "sonner";

export default function AddAwardPage() {
  const router = useRouter();
  const { mutateAsync: createAward } = useCreateAward();

  return (
    <AwardFormView
      onBack={() => router.push("/awards")}
      onSave={async (data) => {
        try {
          await createAward(data);
          toast.success("Award created successfully!");
          router.push("/awards");
        } catch (e) {
          console.error(e);
          toast.error("Failed to create award");
        }
      }}
    />
  );
}
