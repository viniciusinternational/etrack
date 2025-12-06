import { NotFoundPage } from "@/components/ui/error";

export default function MDANotFound() {
  return (
    <NotFoundPage
      title="MDA Not Found"
      message="The MDA you're looking for doesn't exist or has been moved."
      showHome={true}
    />
  );
}

