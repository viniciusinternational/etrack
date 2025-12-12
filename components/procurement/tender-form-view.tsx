"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, X, FileText } from "lucide-react";
import { useMDAs } from "@/hooks/use-mdas";
import { useUpload } from "@/hooks/use-upload";
import type { ProcurementFormData } from "./types";
import { toast } from "sonner";

interface TenderFormViewProps {
  initialData?: ProcurementFormData & { id?: string };
  isEditing?: boolean;
}

export function TenderFormView({
  initialData,
  isEditing = false,
}: TenderFormViewProps) {
  const router = useRouter();
  const { data: mdas, isLoading: isLoadingMDAs } = useMDAs();
  const { mutateAsync: uploadFile, isPending: isUploading } = useUpload();
  
  const [formData, setFormData] = useState<ProcurementFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    estimatedCost: initialData?.estimatedCost || 0,
    mdaId: initialData?.mdaId || "",
    documents: initialData?.documents || [],
  });
  
  // If initialData has mdaId but MDAs are loading, we might want to wait or just let it bind naturally
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (formData.estimatedCost <= 0)
      newErrors.estimatedCost = "Estimated cost must be greater than 0";
    if (!formData.mdaId) newErrors.mdaId = "MDA is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        const files = Array.from(e.target.files);
        const uploadPromises = files.map(file => uploadFile(file));
        const responses = await Promise.all(uploadPromises);
        
        const uploadedUrls = responses.map(res => res?.url).filter(Boolean) as string[];
        
        if (uploadedUrls.length > 0) {
          setFormData(prev => ({
            ...prev,
            documents: [...(prev.documents || []), ...uploadedUrls]
          }));
          // toast.success("Files uploaded successfully");
        }
      } catch (error) {
        console.error("Upload failed", error);
        toast.error("Failed to upload files");
      }
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const url = isEditing && initialData?.id 
        ? `/api/tenders/${initialData.id}` 
        : "/api/tenders";
      
      const method = isEditing ? "PUT" : "POST";
      
      const payload = {
        ...formData,
        // Ensure requestDate is set for new tenders
        requestDate: isEditing ? undefined : new Date().toISOString(),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save tender");
      }

      // toast.success(isEditing ? "Tender updated successfully" : "Tender created successfully");
      router.push("/tenders");
      router.refresh();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          {isEditing ? "Edit Tender" : "Create New Tender"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isEditing
            ? "Update tender details"
            : "Create a new procurement tender"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tender Information</CardTitle>
          <CardDescription>Fill in the tender details below</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Tender Title *</Label>
              <Input
                id="title"
                placeholder="Enter tender title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Enter tender description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mdaId">MDA *</Label>
                <Select
                  value={formData.mdaId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, mdaId: value })
                  }
                  disabled={isLoadingMDAs}
                >
                  <SelectTrigger
                    className={errors.mdaId ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder={isLoadingMDAs ? "Loading MDAs..." : "Select MDA"} />
                  </SelectTrigger>
                  <SelectContent>
                    {mdas?.map((mda) => (
                      <SelectItem key={mda.id} value={mda.id}>
                        {mda.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.mdaId && (
                  <p className="text-sm text-red-500">{errors.mdaId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedCost">Estimated Cost *</Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  placeholder="Enter estimated cost"
                  value={formData.estimatedCost}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedCost: Number.parseFloat(e.target.value),
                    })
                  }
                  className={errors.estimatedCost ? "border-red-500" : ""}
                />
                {errors.estimatedCost && (
                  <p className="text-sm text-red-500">{errors.estimatedCost}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Documents</Label>
              <div className="border rounded-md p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("file-upload")?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload Documents
                  </Button>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <span className="text-sm text-muted-foreground">
                    {isUploading ? "Uploading..." : "Supported formats: PDF, DOC, JPG"}
                  </span>
                </div>

                {formData.documents && formData.documents.length > 0 && (
                  <div className="space-y-2">
                    {formData.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm truncate">{doc.split('/').pop()}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting
                  ? "Saving..."
                  : isEditing
                  ? "Update Tender"
                  : "Create Tender"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
