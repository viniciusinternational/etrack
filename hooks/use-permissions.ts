import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ApiResponse } from "@/types";

const API_URL = "/api/permissions";

export interface Permission {
  id: string;
  module: string;
  action: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionsGrouped {
  [module: string]: Permission[];
}

export function usePermissions() {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<PermissionsGrouped>>(API_URL);
      return data.data;
    },
  });
}

export function useAllPermissions() {
  return useQuery({
    queryKey: ["permissions", "all"],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<{ all: Permission[]; data: PermissionsGrouped }>>(API_URL);
      return data.data.all || [];
    },
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (permission: { module: string; action: string; description?: string }) => {
      const { data } = await axios.post<ApiResponse<Permission>>(API_URL, permission);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
}

