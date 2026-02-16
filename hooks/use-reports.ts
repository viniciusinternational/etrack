import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios-config";
import type {
  ApiResponse,
  ReportType,
  ReportOverviewData,
  ReportFinancialData,
  ReportProjectsData,
  ReportUsersData,
} from "@/types";

const API_URL = "/api/reports";

export type ReportData =
  | ReportOverviewData
  | ReportFinancialData
  | ReportProjectsData
  | ReportUsersData;

export interface UseReportsParams {
  type: ReportType;
  startDate?: string;
  endDate?: string;
}

export function useReports({ type, startDate, endDate }: UseReportsParams) {
  return useQuery({
    queryKey: ["reports", type, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({ type });
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      const { data } = await axiosInstance.get<ApiResponse<ReportData>>(
        `${API_URL}?${params.toString()}`
      );
      if (!data.ok || data.data === undefined) {
        throw new Error("Failed to load report");
      }
      return data.data;
    },
    enabled: !!type,
  });
}
