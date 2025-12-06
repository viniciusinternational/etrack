"use client";
import { TenderDetailView } from "@/components/procurement/tender-detail-view";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { use } from "react";
import { useTender } from "@/hooks/use-tenders";
import { Loader2 } from "lucide-react";

export default function TenderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: tender, isLoading, error } = useTender(id);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !tender) {
    notFound();
  }

  return (
    <TenderDetailView
      onEdit={() => router.push(`/tenders/${id}/edit`)}
      tender={tender}
    />
  );
}
