import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ApiResponse, User } from "@/types";

const API_URL = "/api/users";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<User[]>>(API_URL);
      return data.data;
    },
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<User>>(`${API_URL}/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newItem: Partial<User>) => {
      const { data } = await axios.post<ApiResponse<User>>(API_URL, newItem);
      return data.data;
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
      const { data } = await axios.put<ApiResponse<User>>(`${API_URL}/${id}`, updates);
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
      const { data } = await axios.delete<ApiResponse<User>>(`${API_URL}/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// User Permissions hooks
export interface UserPermission {
  id: string;
  permissionId: string;
  module: string;
  action: string;
  description?: string;
}

export interface UserPermissionsResponse {
  userPermissions: UserPermission[];
  allPermissions: Array<{
    id: string;
    module: string;
    action: string;
    description?: string;
    assigned: boolean;
  }>;
}

export function useUserPermissions(userId: string) {
  return useQuery({
    queryKey: ["users", userId, "permissions"],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<UserPermissionsResponse>>(
        `${API_URL}/${userId}/permissions`
      );
      return data.data;
    },
    enabled: !!userId,
  });
}

export function useAssignUserPermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      permissionIds,
    }: {
      userId: string;
      permissionIds: string[];
    }) => {
      const { data } = await axios.post<ApiResponse<UserPermission[]>>(
        `${API_URL}/${userId}/permissions`,
        { permissionIds }
      );
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId, "permissions"] });
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
      const { data } = await axios.get<ApiResponse<UserPermissionsJSONResponse>>(
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
      const { data } = await axios.patch<ApiResponse<UserPermissionsJSONResponse>>(
        `${API_URL}/${userId}/permissions`,
        { permissions }
      );
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId, "permissions-json"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId, "permissions"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useRemoveUserPermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      permissionId,
    }: {
      userId: string;
      permissionId: string;
    }) => {
      const { data } = await axios.delete<ApiResponse>(
        `${API_URL}/${userId}/permissions/${permissionId}`
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId, "permissions"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}