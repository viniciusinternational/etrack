import { NotFoundPage } from "@/components/ui/error";

export default function UserNotFound() {
  return (
    <NotFoundPage
      title="User Not Found"
      message="The user you're looking for doesn't exist or has been moved."
      showHome={true}
    />
  );
}

