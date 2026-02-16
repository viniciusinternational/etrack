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
  MessagePrimitive,
  useAssistantApi,
} from "@assistant-ui/react";
import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles } from "lucide-react";

// E-Track focused prompt templates
const PROMPT_TEMPLATES = [
  "How do I create a new project in E-Track?",
  "Show me a summary of recent procurement activities",
  "Help me understand the finance dashboard",
  "What reports can I generate in E-Track?",
  "Explain how to track project milestones",
  "How do I manage user permissions?",
];

// Prompt template chips shown when thread is empty
function PromptTemplates() {
  const api = useAssistantApi();

  const handlePromptClick = (prompt: string) => {
    api.composer().setText(prompt);
    api.composer().send();
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12 px-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Sparkles className="h-5 w-5" />
        <span className="text-sm font-medium">Try asking</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl">
        {PROMPT_TEMPLATES.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handlePromptClick(prompt)}
            className="text-left rounded-lg border border-border bg-background/50 px-4 py-3 text-sm text-foreground hover:bg-muted/50 hover:border-primary/30 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

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

// Assistant Message Component with Markdown support
const AssistantMessage = () => {
  return (
    <MessagePrimitive.Root className="mb-4 flex justify-start" data-role="assistant">
      <div className="aui-md max-w-[80%] rounded-lg bg-muted px-4 py-2 [&_pre]:rounded-md [&_pre]:bg-muted-foreground/10 [&_pre]:p-3 [&_code]:rounded [&_code]:bg-muted-foreground/10 [&_code]:px-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6">
        <MessagePrimitive.Parts
          components={{
            Text: () => <MarkdownTextPrimitive remarkPlugins={[remarkGfm]} />,
          }}
        />
      </div>
    </MessagePrimitive.Root>
  );
};

export function AIAssistantThread() {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: process.env.NEXT_PUBLIC_AI_ASSISTANT_API_URL ?? "",
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ThreadPrimitive.Root className="flex h-full flex-col min-h-0">
        <ThreadPrimitive.Viewport
          className="flex flex-1 flex-col min-h-0 overflow-auto p-4"
          autoScroll
          scrollToBottomOnRunStart
        >
          <ThreadPrimitive.Empty>
            <PromptTemplates />
          </ThreadPrimitive.Empty>
          <ThreadPrimitive.Messages
            components={{
              UserMessage,
              AssistantMessage,
            }}
          />
        </ThreadPrimitive.Viewport>
        <div className="flex-shrink-0 border-t bg-background p-4">
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

