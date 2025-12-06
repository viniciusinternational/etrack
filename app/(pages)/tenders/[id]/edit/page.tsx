"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { TenderFormView } from "@/components/procurement/tender-form-view";
import { useTender } from "@/hooks/use-tenders";
import { Loader2 } from "lucide-react";

export default function EditTenderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { data: tender, isLoading, error } = useTender(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !tender) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-xl font-semibold">Tender not found</h2>
        <p className="text-muted-foreground">The requested tender could not be found.</p>
        <button
          onClick={() => router.push("/tenders")}
          className="text-primary hover:underline"
        >
          Back to Tenders
        </button>
      </div>
    );
  }

  return <TenderFormView initialData={tender} isEditing />;
}
