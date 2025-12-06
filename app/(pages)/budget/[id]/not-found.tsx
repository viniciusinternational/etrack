import { NotFoundPage } from "@/components/ui/error";

export default function BudgetNotFound() {
  return (
    <NotFoundPage
      title="Budget Not Found"
      message="The budget record you're looking for doesn't exist or has been moved."
      showHome={true}
    />
  );
}

