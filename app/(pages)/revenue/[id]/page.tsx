"use client";

import { useRouter, useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { RevenueDetailView } from "@/components/finance/revenue-detail-view";
import { useRevenue } from "@/hooks/use-revenue";
import { Loader2 } from "lucide-react";

export default function RevenueDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: revenue, isLoading } = useRevenue(id);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!revenue) {
    notFound();
  }

  const handleBack = () => {
    router.push("/revenue");
  };

  const handleEdit = () => {
    router.push(`/revenue/${id}/edit`);
  };

  return (
    <RevenueDetailView
      revenue={revenue}
      onBack={handleBack}
      onEdit={handleEdit}
    />
  );
}
