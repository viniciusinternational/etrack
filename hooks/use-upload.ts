import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ApiResponse } from "@/types";

interface UploadResponse {
  url: string;
  filename: string;
}

const API_URL = "/api/upload";

export function useUpload() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const { data } = await axios.post<ApiResponse<UploadResponse>>(API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data.data;
    },
  });
}
