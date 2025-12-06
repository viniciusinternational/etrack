"use client";

import { useRouter, useParams } from "next/navigation";
import { RevenueFormView } from "@/components/finance/revenue-form-view";
import { useRevenue, useUpdateRevenue } from "@/hooks/use-revenue";
import { RevenueFormInput } from "@/types";
import { Loader2 } from "lucide-react";

export default function EditRevenuePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: revenue, isLoading } = useRevenue(id);
  const { mutate: updateRevenue, isPending: isSaving } = useUpdateRevenue();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!revenue) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Revenue not found
          </h1>
          <button
            onClick={() => router.push("/revenue")}
            className="mt-4 text-primary hover:underline"
          >
            Back to Revenues
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    router.push(`/revenue/${id}`);
  };

  const handleSave = (input: RevenueFormInput) => {
    updateRevenue(
      {
        ...input,
        id,
        date: new Date(input.date),
      },
      {
        onSuccess: () => {
          router.push(`/revenue/${id}`);
        },
        onError: (error) => {
          console.error("Failed to update revenue:", error);
        },
      }
    );
  };

  return (
    <RevenueFormView
      revenue={revenue}
      onBack={handleBack}
      onSave={handleSave}
      isSaving={isSaving}
    />
  );
}
