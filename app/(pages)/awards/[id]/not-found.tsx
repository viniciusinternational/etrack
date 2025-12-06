import { NotFoundPage } from "@/components/ui/error";

export default function AwardNotFound() {
  return (
    <NotFoundPage
      title="Award Not Found"
      message="The award you're looking for doesn't exist or has been moved."
      showHome={true}
    />
  );
}

