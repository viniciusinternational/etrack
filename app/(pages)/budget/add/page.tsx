"use client";

import { useRouter } from "next/navigation";
import { BudgetFormView } from "@/components/finance/budget-form-view";
import { useCreateBudget } from "@/hooks/use-budget";
import type { BudgetFormInput } from "@/types";

export default function AddBudgetPage() {
  const router = useRouter();
  const { mutate: createBudget, isPending: isSaving } = useCreateBudget();

  const handleBack = () => {
    router.push("/budget");
  };

  const handleSave = (data: BudgetFormInput) => {
    createBudget(data, {
      onSuccess: () => {
        router.push("/budget");
      },
      onError: (error) => {
        console.error("Failed to create budget:", error);
      },
    });
  };

  return (
    <BudgetFormView budget={null} onBack={handleBack} onSave={handleSave} isSaving={isSaving} />
  );
}
