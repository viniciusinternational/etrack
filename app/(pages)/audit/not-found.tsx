import { NotFoundPage } from "@/components/ui/error";

export default function AuditNotFound() {
  return (
    <NotFoundPage
      title="Audit Not Found"
      message="The audit page you're looking for doesn't exist or has been moved."
      showHome={true}
    />
  );
}

