import { NotFoundPage } from "@/components/ui/error";

export default function UnauthorizedNotFound() {
  return (
    <NotFoundPage
      title="Page Not Found"
      message="The unauthorized page you're looking for doesn't exist."
    />
  );
}

