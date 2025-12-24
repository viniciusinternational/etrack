import { NotFoundPage } from "@/components/ui/error";

export default function EventDetailNotFound() {
  return (
    <NotFoundPage
      title="Event Not Found"
      message="The event you're looking for doesn't exist or has been deleted."
      showHome={true}
    />
  );
}

