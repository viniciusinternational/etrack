import { NotFoundPage } from "@/components/ui/error";

export default function MeetingNotFound() {
  return (
    <NotFoundPage
      title="Meeting Not Found"
      message="The meeting you're looking for doesn't exist or has been removed."
      showHome={true}
    />
  );
}
