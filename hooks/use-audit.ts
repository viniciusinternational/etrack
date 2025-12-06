import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ApiResponse, AuditLog, AuditLogFormInput } from "@/types";

const API_URL = "/api/audit";

export function useAuditLogs(filters?: {
  entity?: string;
  actor?: string;
  actionType?: string;
}) {
  return useQuery({
    queryKey: ["audit", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.entity) params.append("entity", filters.entity);
      if (filters?.actor) params.append("actor", filters.actor);
      if (filters?.actionType) params.append("actionType", filters.actionType);
      
      const { data } = await axios.get<ApiResponse<AuditLog[]>>(
        `${API_URL}?${params.toString()}`
      );
      return data.data;
    },
  });
}

export function useAuditLog(id: string) {
  return useQuery({
    queryKey: ["audit", id],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<AuditLog>>(`${API_URL}/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateAuditLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newLog: AuditLogFormInput) => {
      const { data } = await axios.post<ApiResponse<AuditLog>>(API_URL, newLog);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit"] });
    },
  });
}
