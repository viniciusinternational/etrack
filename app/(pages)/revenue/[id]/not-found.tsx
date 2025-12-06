/**
 * Revenue Not Found Page
 * Shows when revenue is not found
 */

import { NotFoundPage } from "@/components/ui/error";

export default function RevenueNotFound() {
  return (
    <NotFoundPage
      title="Revenue Not Found"
      message="The revenue record you're looking for doesn't exist or has been moved."
      showHome={true}
    />
  );
}

