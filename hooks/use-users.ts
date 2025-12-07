import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios-config";
import { ApiResponse, User } from "@/types";

const API_URL = "/api/users";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<User[]>>(API_URL);
      return data.data;
    },
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<User>>(`${API_URL}/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newItem: Partial<User>) => {
      const { data } = await axiosInstance.post<ApiResponse<User> & { generatedPassword?: string }>(API_URL, newItem);
      // Return both user data and generatedPassword if present
      return {
        ...data.data,
        generatedPassword: (data as any).generatedPassword,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<User>) => {
      const { data } = await axiosInstance.put<ApiResponse<User>>(`${API_URL}/${id}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.delete<ApiResponse<User>>(`${API_URL}/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// JSON-based permissions hooks (RBAS)
export interface UserPermissionsJSONResponse {
  userId: string;
  email: string;
  name: string;
  permissions: Record<string, boolean>;
}

export function useUserPermissionsJSON(userId: string) {
  return useQuery({
    queryKey: ["users", userId, "permissions-json"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<UserPermissionsJSONResponse>>(
        `${API_URL}/${userId}/permissions`
      );
      return data.data;
    },
    enabled: !!userId,
  });
}

export function useUpdateUserPermissionsJSON() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      permissions,
    }: {
      userId: string;
      permissions: Record<string, boolean>;
    }) => {
      const { data } = await axiosInstance.patch<ApiResponse<UserPermissionsJSONResponse>>(
        `${API_URL}/${userId}/permissions`,
        { permissions }
      );
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId, "permissions-json"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}