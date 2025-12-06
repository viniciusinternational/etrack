/**
 * Project Not Found Page
 * Shows when project is not found
 */

import { NotFoundPage } from "@/components/ui/error";
import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <NotFoundPage
      title="Project Not Found"
      message="The project you're looking for doesn't exist or has been moved."
      showHome={true}
    />
  );
}

