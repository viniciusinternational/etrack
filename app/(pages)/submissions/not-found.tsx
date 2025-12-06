import { NotFoundPage } from "@/components/ui/error";

export default function SubmissionsNotFound() {
  return (
    <NotFoundPage
      title="Submissions Not Found"
      message="The submissions page you're looking for doesn't exist or has been moved."
      showHome={true}
    />
  );
}

