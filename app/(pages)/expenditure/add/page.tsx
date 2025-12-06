"use client";

import { useRouter } from "next/navigation";
import { ExpenditureFormView } from "@/components/finance/expenditure-form-view";
import { useCreateExpenditure } from "@/hooks/use-expenditure";
import { ExpenditureFormInput } from "@/types";

export default function AddExpenditurePage() {
  const router = useRouter();
  const { mutate: createExpenditure, isPending: isSaving } = useCreateExpenditure();

  const handleBack = () => {
    router.push("/expenditure");
  };

  const handleSave = (data: ExpenditureFormInput) => {
    createExpenditure(
      {
        ...data,
        date: new Date(data.date),
      },
      {
        onSuccess: () => {
          router.push("/expenditure");
        },
        onError: (error) => {
          console.error("Failed to create expenditure:", error);
        },
      }
    );
  };

  return (
    <ExpenditureFormView
      expenditure={null}
      onBack={handleBack}
      onSave={handleSave}
      isSaving={isSaving}
    />
  );
}
