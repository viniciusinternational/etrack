/**
 * Tender Not Found Page
 * Shows when tender is not found
 */

import { NotFoundPage } from "@/components/ui/error";

export default function TenderNotFound() {
  return (
    <NotFoundPage
      title="Tender Not Found"
      message="The tender you're looking for doesn't exist or has been moved."
      showHome={true}
    />
  );
}

