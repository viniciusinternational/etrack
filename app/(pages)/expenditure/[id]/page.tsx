"use client";

import { useRouter, useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { ExpenditureDetailView } from "@/components/finance/expenditure-detail-view";
import { useExpenditure } from "@/hooks/use-expenditure";
import { Loader2 } from "lucide-react";

export default function ExpenditureDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: expenditure, isLoading } = useExpenditure(id);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!expenditure) {
    notFound();
  }

  const handleBack = () => {
    router.push("/expenditure");
  };

  const handleEdit = () => {
    router.push(`/expenditure/${id}/edit`);
  };

  return (
    <ExpenditureDetailView
      expenditure={expenditure}
      onBack={handleBack}
      onEdit={handleEdit}
    />
  );
}
