/**
 * API utilities for E-Track
 * Centralized API calls and error handling
 */

import { ApiResponse, PaginatedResponse } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export interface ApiErrorDetails {
  error?: string;
  message?: string;
  requiredPermissions?: string[];
  details?: unknown;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response,
    public details?: ApiErrorDetails
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T = Record<string, unknown>>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      // Try to extract detailed error message from response
      let errorDetails: ApiErrorDetails | undefined;
      let errorMessage = `API request failed: ${response.statusText}`;
      
      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.clone().json() as { ok?: boolean; error?: string; message?: string; requiredPermissions?: string[]; details?: unknown };
          errorDetails = {
            error: errorData.error,
            message: errorData.message,
            requiredPermissions: errorData.requiredPermissions,
            details: errorData.details,
          };
          
          // Use the most specific error message available
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else {
            errorMessage = `API request failed: ${response.statusText}`;
          }
        }
      } catch (parseError) {
        // If JSON parsing fails, use default message
        console.error("Failed to parse error response:", parseError);
      }
      
      throw new ApiError(
        errorMessage,
        response.status,
        response,
        errorDetails
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      0
    );
  }
}

export async function get<T = Record<string, unknown>>(
  endpoint: string
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: "GET" });
}

export async function post<T = Record<string, unknown>>(
  endpoint: string,
  data?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function put<T = Record<string, unknown>>(
  endpoint: string,
  data?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function del<T = Record<string, unknown>>(
  endpoint: string
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: "DELETE" });
}

// Paginated data fetching
export async function getPaginated<T = Record<string, unknown>>(
  endpoint: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<T>> {
  const response = await get<PaginatedResponse<T>>(
    `${endpoint}?page=${page}&limit=${limit}`
  );
  return response.data!;
}

// File upload utility
export async function uploadFile(
  endpoint: string,
  file: File,
  additionalData?: Record<string, unknown>
): Promise<ApiResponse<{ url: string; filename: string }>> {
  const formData = new FormData();
  formData.append("file", file);

  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
  }

  return apiRequest(endpoint, {
    method: "POST",
    body: formData,
    headers: {}, // Let browser set Content-Type for FormData
  });
}
