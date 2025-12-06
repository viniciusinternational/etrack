/**
 * Dashboard Not Found Page
 * Shows when dashboard route is not found
 */

import { NotFoundPage } from "@/components/ui/error";
import Link from "next/link";

export default function DashboardNotFound() {
  return (
    <NotFoundPage
      title="Dashboard Not Found"
      message="The dashboard page you're looking for doesn't exist or has been moved."
      showHome={true}
    />
  );
}

