"use client";

/**
 * AI Assistant Page
 * Main page for interacting with the AI assistant
 */

import { useAuthGuard } from "@/hooks/use-auth-guard";
import { AIAssistantThread } from "@/components/ai-assistant/thread";
import { Loader2 } from "lucide-react";

export default function AIAssistantPage() {
  // Check authentication and permission
  const { isChecking } = useAuthGuard(["view_ai_assistant"]);

  if (isChecking) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <header className="flex-shrink-0 space-y-2 mb-6 pb-4 border-b">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          AI Assistant
        </h1>
        <p className="text-base text-muted-foreground">
          Ask questions and get help with the E-Track platform
        </p>
      </header>

      <div className="flex-1 min-h-0 flex flex-col">
        <AIAssistantThread />
      </div>
    </div>
  );
}

