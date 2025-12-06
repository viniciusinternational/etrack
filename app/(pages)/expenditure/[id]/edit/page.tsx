"use client";

import { useRouter, useParams } from "next/navigation";
import { ExpenditureFormView } from "@/components/finance/expenditure-form-view";
import { useExpenditure, useUpdateExpenditure } from "@/hooks/use-expenditure";
import { ExpenditureFormInput } from "@/types";
import { Loader2 } from "lucide-react";

export default function EditExpenditurePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: expenditure, isLoading } = useExpenditure(id);
  const { mutate: updateExpenditure, isPending: isSaving } = useUpdateExpenditure();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!expenditure) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Expenditure not found
          </h1>
          <button
            onClick={() => router.push("/expenditure")}
            className="mt-4 text-primary hover:underline"
          >
            Back to Expenditures
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    router.push(`/expenditure/${id}`);
  };

  const handleSave = (input: ExpenditureFormInput) => {
    updateExpenditure(
      {
        ...input,
        id,
        date: new Date(input.date),
      },
      {
        onSuccess: () => {
          router.push(`/expenditure/${id}`);
        },
        onError: (error) => {
          console.error("Failed to update expenditure:", error);
        },
      }
    );
  };

  return (
    <ExpenditureFormView
      expenditure={expenditure}
      onBack={handleBack}
      onSave={handleSave}
      isSaving={isSaving}
    />
  );
}
