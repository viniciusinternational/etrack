/**
 * Authentication API client helpers
 * Handles login, logout, and token management
 */

import { post } from "./api";
import { UserRole } from "@/types";
import type { UserPermissions } from "@/types/permissions";

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    mdaId?: string;
    mustChangePassword: boolean;
    permissions?: UserPermissions;
  };
  token: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

/**
 * Login with email and password
 */
export async function login(
  email: string,
  password: string
): Promise<ApiResponse<LoginResponse>> {
  try {
    const response = await post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      ok: false,
      error: error.message || "Failed to login",
    };
  }
}

/**
 * Get current user (verify token)
 * This can be used to verify token validity on app initialization
 */
export async function getCurrentUser(): Promise<ApiResponse<LoginResponse["user"]>> {
  try {
    // For now, this is a placeholder
    // In a real implementation, you'd call an endpoint like /auth/me
    // that verifies the token and returns user data
    return {
      ok: false,
      error: "Not implemented",
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message || "Failed to get current user",
    };
  }
}

/**
 * Logout
 * This can call a logout endpoint if needed
 */
export async function logout(): Promise<ApiResponse<void>> {
  try {
    // For now, logout is handled client-side
    // If you need server-side token invalidation, implement it here
    return {
      ok: true,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message || "Failed to logout",
    };
  }
}

