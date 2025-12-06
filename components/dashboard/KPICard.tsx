"use client";

/**
 * KPI Card Component
 * A flexible, modern card for displaying key performance indicators
 * with optional icon, trend indicator, and badge
 */

import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  badge?: string | number;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
  className?: string;
}

export function KPICard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  badge,
  variant = "default",
  className,
}: KPICardProps) {
  const variantStyles = {
    default: "border-border/50",
    primary: "border-primary/20 bg-primary/5",
    success: "border-green-500/20 bg-green-500/5",
    warning: "border-orange-500/20 bg-orange-500/5",
    destructive: "border-red-500/20 bg-red-500/5",
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return TrendingUp;
    if (trend.value < 0) return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (!trend) return "text-muted-foreground";
    if (trend.value > 0) return "text-green-600 dark:text-green-400";
    if (trend.value < 0) return "text-red-600 dark:text-red-400";
    return "text-muted-foreground";
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200 hover:shadow-md hover:shadow-primary/10 hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        variantStyles[variant],
        className
      )}
      role="article"
      aria-label={`${title}: ${typeof value === "number" ? value.toLocaleString() : value}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {title}
              </h3>
              {badge !== undefined && (
                <Badge
                  variant="secondary"
                  className="text-xs font-semibold bg-primary/10 text-primary border-primary/20"
                >
                  {badge}
                </Badge>
              )}
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <p className="text-3xl font-semibold tracking-tight text-foreground" aria-label={`Value: ${typeof value === "number" ? value.toLocaleString() : value}`}>
                {typeof value === "number" ? value.toLocaleString() : value}
              </p>
              {trend && TrendIcon && (
                <div className={cn("flex items-center gap-1", getTrendColor())}>
                  <TrendIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {Math.abs(trend.value)}%
                  </span>
                </div>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
            {trend?.label && (
              <p className="text-xs text-muted-foreground mt-1">
                {trend.label}
              </p>
            )}
          </div>
          {Icon && (
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary/20">
                <Icon className="h-6 w-6" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

