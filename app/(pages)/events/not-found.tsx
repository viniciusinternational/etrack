import { NotFoundPage } from "@/components/ui/error";

export default function EventsNotFound() {
  return (
    <NotFoundPage
      title="Events Not Found"
      message="The events page you're looking for doesn't exist or has been moved."
      showHome={true}
    />
  );
}

