import { NotFoundPage } from "@/components/ui/error";

export default function ForbiddenNotFound() {
  return (
    <NotFoundPage
      title="Page Not Found"
      message="The forbidden page you're looking for doesn't exist."
    />
  );
}

