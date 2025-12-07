"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import type { PermissionKey } from "@/types/permissions";

interface ApiErrorResponse {
  ok?: boolean;
  error?: string;
  message?: string;
  requiredPermissions?: PermissionKey[];
  details?: unknown;
}

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: (failureCount, error) => {
              // Don't retry on 401/403 errors
              if (error instanceof AxiosError) {
                const status = error.response?.status;
                if (status === 401 || status === 403) {
                  return false;
                }
              }
              // Retry up to 2 times for other errors
              return failureCount < 2;
            },
            onError: (error) => {
              // Global query error handler
              if (error instanceof AxiosError) {
                const response = error.response;
                if (response) {
                  const errorData = response.data as ApiErrorResponse | undefined;
                  const status = response.status;
                  
                  // Skip toast for 401/403 as they're handled by axios interceptor
                  if (status !== 401 && status !== 403) {
                    const errorMessage = errorData?.error || errorData?.message || error.message || "Failed to fetch data";
                    toast.error(errorMessage);
                  }
                } else {
                  toast.error("Network error. Please check your connection.");
                }
              }
            },
          },
          mutations: {
            onError: (error) => {
              // Global mutation error handler
              if (error instanceof AxiosError) {
                const response = error.response;
                if (response) {
                  const errorData = response.data as ApiErrorResponse | undefined;
                  const status = response.status;
                  
                  // Skip toast for 401/403 as they're handled by axios interceptor
                  if (status !== 401 && status !== 403) {
                    const errorMessage = errorData?.error || errorData?.message || error.message || "Operation failed";
                    toast.error(errorMessage);
                  }
                } else {
                  toast.error("Network error. Please check your connection.");
                }
              }
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
