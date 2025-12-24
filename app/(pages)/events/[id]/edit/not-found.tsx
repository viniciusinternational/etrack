import { NotFoundPage } from "@/components/ui/error";

export default function EditEventNotFound() {
  return (
    <NotFoundPage
      title="Event Not Found"
      message="The event you're trying to edit doesn't exist or has been deleted."
      showHome={true}
    />
  );
}

