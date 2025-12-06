"use client";

import { useRouter, useParams } from "next/navigation";
import { BudgetFormView } from "@/components/finance/budget-form-view";
import { useBudget, useUpdateBudget } from "@/hooks/use-budget";
import type { BudgetFormInput } from "@/types";

import { Loader2 } from "lucide-react";

export default function EditBudgetPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: budget, isLoading } = useBudget(id);
  const { mutate: updateBudget, isPending: isSaving } = useUpdateBudget();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Budget not found
          </h1>
          <button
            onClick={() => router.push("/budget")}
            className="mt-4 text-primary hover:underline"
          >
            Back to Budgets
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    router.push(`/budget/${id}`);
  };

  const handleSave = (data: BudgetFormInput) => {
    updateBudget(
      { id, ...data },
      {
        onSuccess: () => {
          router.push(`/budget/${id}`);
        },
      }
    );
  };

  return (
    <BudgetFormView budget={budget} onBack={handleBack} onSave={handleSave} isSaving={isSaving} />
  );
}
