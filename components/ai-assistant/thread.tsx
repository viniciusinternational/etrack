"use client";

/**
 * AI Assistant Thread Component
 * Connects to external backend using AssistantChatTransport
 */

import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { 
  AssistantRuntimeProvider, 
  ThreadPrimitive, 
  ComposerPrimitive,
  MessagePrimitive 
} from "@assistant-ui/react";

// Simple User Message Component
const UserMessage = () => {
  return (
    <MessagePrimitive.Root className="mb-4 flex justify-end" data-role="user">
      <div className="max-w-[80%] rounded-lg bg-primary px-4 py-2 text-primary-foreground">
        <MessagePrimitive.Parts />
      </div>
    </MessagePrimitive.Root>
  );
};

// Simple Assistant Message Component
const AssistantMessage = () => {
  return (
    <MessagePrimitive.Root className="mb-4 flex justify-start" data-role="assistant">
      <div className="max-w-[80%] rounded-lg bg-muted px-4 py-2">
        <MessagePrimitive.Parts />
      </div>
    </MessagePrimitive.Root>
  );
};

export function AIAssistantThread() {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "https://mastra.prismaforge.ng/weather/weatherAgent",
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ThreadPrimitive.Root className="flex h-full flex-col">
        <ThreadPrimitive.Viewport className="flex flex-1 flex-col overflow-auto p-4">
          <ThreadPrimitive.Messages
            components={{
              UserMessage,
              AssistantMessage,
            }}
          />
        </ThreadPrimitive.Viewport>
        <div className="border-t p-4">
          <ComposerPrimitive.Root className="flex flex-col gap-2">
            <ComposerPrimitive.Input
              placeholder="Type your message..."
              className="min-h-[60px] w-full resize-none rounded-lg border border-input bg-background px-4 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              autoFocus
            />
            <div className="flex justify-end">
              <ComposerPrimitive.Send asChild>
                <button
                  type="submit"
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Send
                </button>
              </ComposerPrimitive.Send>
            </div>
          </ComposerPrimitive.Root>
        </div>
      </ThreadPrimitive.Root>
    </AssistantRuntimeProvider>
  );
}

