import { NotFoundPage } from "@/components/ui/error";

export default function SubmissionNotFound() {
  return (
    <NotFoundPage
      title="Submission Not Found"
      message="The submission you're looking for doesn't exist or has been moved."
      showHome={true}
    />
  );
}

