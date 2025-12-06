import { NotFoundPage } from "@/components/ui/error";

export default function UsersNotFound() {
  return (
    <NotFoundPage
      title="Users Not Found"
      message="The users page you're looking for doesn't exist or has been moved."
      showHome={true}
    />
  );
}

