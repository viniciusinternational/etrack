/**
 * 404 Not Found page for E-Track
 * Shows when a page is not found
 */

import { NotFoundPage } from '@/components/ui/error';


export default function NotFound() {
  return (
    <NotFoundPage
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      showHome={true}
    />
  );
}
