"use client";

/**
 * Dashboard Panel Component
 * A consistent container for dashboard sections with header, actions, and content
 */

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface DashboardPanelProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function DashboardPanel({
  title,
  description,
  action,
  children,
  className,
  headerClassName,
  contentClassName,
}: DashboardPanelProps) {
  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md hover:shadow-primary/5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2", className)}>
      <CardHeader className={cn("border-b border-border/50", headerClassName)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold tracking-tight leading-none">
              {title}
            </h2>
            {description && (
              <CardDescription className="mt-1.5">{description}</CardDescription>
            )}
          </div>
          {action && <CardAction>{action}</CardAction>}
        </div>
      </CardHeader>
      <CardContent className={cn("p-6", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

