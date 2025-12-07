import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios-config";
import { ApiResponse, Project } from "@/types";

const API_URL = "/api/projects";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<Project[]>>(API_URL);
      return data.data;
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<Project>>(`${API_URL}/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newItem: Partial<Project>) => {
      const { data } = await axiosInstance.post<ApiResponse<Project>>(API_URL, newItem);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: { id: string } & Partial<Project>) => {
      const { id, ...updateData } = updates;
      const { data } = await axiosInstance.put<ApiResponse<Project>>(`${API_URL}/${id}`, updateData);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", variables.id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.delete<ApiResponse<Project>>(`${API_URL}/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
