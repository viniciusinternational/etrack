"use client";

import { useRouter } from "next/navigation";
import { RevenueFormView } from "@/components/finance/revenue-form-view";
import { useCreateRevenue } from "@/hooks/use-revenue";
import { RevenueFormInput } from "@/types";

export default function AddRevenuePage() {
  const router = useRouter();
  const { mutate: createRevenue, isPending: isSaving } = useCreateRevenue();

  const handleBack = () => {
    router.push("/revenue");
  };

  const handleSave = (data: RevenueFormInput) => {
    createRevenue(
      {
        ...data,
        date: new Date(data.date),
      },
      {
        onSuccess: () => {
          router.push("/revenue");
        },
        onError: (error) => {
          console.error("Failed to create revenue:", error);
        },
      }
    );
  };

  return (
    <RevenueFormView revenue={null} onBack={handleBack} onSave={handleSave} isSaving={isSaving} />
  );
}
