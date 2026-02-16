import { NotFoundPage } from "@/components/ui/error";

export default function MeetingsNotFound() {
  return (
    <NotFoundPage
      title="Meetings Not Found"
      message="The meetings page you're looking for doesn't exist or has been moved."
      showHome={true}
    />
  );
}
