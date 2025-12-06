"use client";

import { useRouter, useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { BudgetDetailView } from "@/components/finance/budget-detail-view";
import { useBudget } from "@/hooks/use-budget";
import { Loader2 } from "lucide-react";

export default function BudgetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: budget, isLoading } = useBudget(id);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!budget) {
    notFound();
  }

  const handleBack = () => {
    router.push("/budget");
  };

  const handleEdit = () => {
    router.push(`/budget/${id}/edit`);
  };

  return (
    <BudgetDetailView budget={budget} onBack={handleBack} onEdit={handleEdit} />
  );
}
