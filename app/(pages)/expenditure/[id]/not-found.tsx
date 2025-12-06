import { NotFoundPage } from "@/components/ui/error";

export default function ExpenditureNotFound() {
  return (
    <NotFoundPage
      title="Expenditure Not Found"
      message="The expenditure record you're looking for doesn't exist or has been moved."
      showHome={true}
    />
  );
}

