import { NotFoundPage } from "@/components/ui/error";

export default function ContractNotFound() {
  return (
    <NotFoundPage
      title="Contract Not Found"
      message="The contract you're looking for doesn't exist or has been moved."
      showHome={true}
    />
  );
}

