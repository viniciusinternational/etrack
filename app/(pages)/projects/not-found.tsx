import { NotFoundPage } from "@/components/ui/error";

export default function ProjectsNotFound() {
  return (
    <NotFoundPage
      title="Projects Not Found"
      message="The projects page you're looking for doesn't exist or has been moved."
      showHome={true}
    />
  );
}

