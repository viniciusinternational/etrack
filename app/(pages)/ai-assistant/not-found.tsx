/**
 * AI Assistant Not Found Page
 * Shows when AI assistant route is not found
 */

import { NotFoundPage } from "@/components/ui/error";

export default function AIAssistantNotFound() {
  return (
    <NotFoundPage
      title="AI Assistant Not Found"
      message="The AI assistant page you're looking for doesn't exist or has been moved."
      showHome={true}
    />
  );
}

