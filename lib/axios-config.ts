/**
 * Axios Configuration with Interceptors
 * Handles authentication, error handling, and permission errors
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import type { PermissionKey } from "@/types/permissions";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token to headers
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get user info from auth store
    const state = useAuthStore.getState();
    if (config.headers && state.user?.id) {
      config.headers["x-user-id"] = state.user.id;
      // If you have a token-based auth, add it here:
      // if (state.token) {
      //   config.headers.Authorization = `Bearer ${state.token}`;
      // }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<{ ok?: boolean; error?: string; message?: string; requiredPermissions?: PermissionKey[] }>) => {
    const response = error.response;
    
    if (!response) {
      // Network error or no response
      toast.error("Network error. Please check your connection.");
      return Promise.reject(error);
    }

    const status = response.status;
    const errorData = response.data;
    const errorMessage = errorData?.error || errorData?.message || error.message || "An error occurred";
    const requiredPermissions = errorData?.requiredPermissions;

    // Handle 401 Unauthorized
    if (status === 401) {
      const authStore = useAuthStore.getState();
      
      toast.error("Unauthorized: Please log in to continue.");
      
      // Auto-logout and redirect to login if authenticated
      if (authStore.isAuthenticated) {
        authStore.autoLogout();
        // Redirect will be handled by auth guard or component
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      } else if (typeof window !== "undefined") {
        window.location.href = "/unauthorized";
      }
      
      return Promise.reject(error);
    }

    // Handle 403 Forbidden (Permission denied)
    if (status === 403) {
      let permissionMessage = "You don't have permission to perform this action.";
      
      if (requiredPermissions && requiredPermissions.length > 0) {
        const permissionsList = requiredPermissions.join(", ");
        permissionMessage = `Missing required permissions: ${permissionsList}`;
        
        // Build URL with permissions for forbidden page
        const permissionsParam = encodeURIComponent(JSON.stringify(requiredPermissions));
        const forbiddenUrl = `/forbidden?permissions=${permissionsParam}`;
        
        // Show toast with permission details
        toast.error(permissionMessage, {
          duration: 5000,
          action: {
            label: "View Details",
            onClick: () => {
              if (typeof window !== "undefined") {
                window.location.href = forbiddenUrl;
              }
            },
          },
        });
      } else {
        toast.error(permissionMessage);
      }
      
      return Promise.reject(error);
    }

    // Handle other error status codes
    if (status >= 400 && status < 500) {
      toast.error(errorMessage);
    } else if (status >= 500) {
      toast.error("Server error. Please try again later.");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

