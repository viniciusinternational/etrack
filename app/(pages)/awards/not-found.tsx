import { NotFoundPage } from "@/components/ui/error";

export default function AwardsNotFound() {
  return (
    <NotFoundPage
      title="Awards Not Found"
      message="The awards page you're looking for doesn't exist or has been moved."
      showHome={true}
    />
  );
}

