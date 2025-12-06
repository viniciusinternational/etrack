import { NotFoundPage } from "@/components/ui/error";

export default function MDAsNotFound() {
  return (
    <NotFoundPage
      title="MDAs Not Found"
      message="The MDAs page you're looking for doesn't exist or has been moved."
      showHome={true}
    />
  );
}

