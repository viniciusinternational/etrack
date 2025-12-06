"use client";
import type React from "react";
import { useState } from "react";
import { ArrowLeft, Upload, FileText, MapPin, Loader2, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { SubmissionStatus, type MilestoneStage, type MilestoneSubmission, type MilestoneSubmissionFormInput } from "@/types";
import { MILESTONE_STAGES } from "./constants";
import { useUpload } from "@/hooks/use-upload";
import { toast } from "sonner";

export function MilestoneSubmissionFormView({
  projectId,
  submission,
  projectTitle,
  contractorId,
  onBack,
  onSave,
  isSubmitting = false,
}: {
  projectId: string;
  submission: MilestoneSubmission | null;
  projectTitle?: string;
  contractorId?: string;
  onBack: () => void;
  onSave: (data: MilestoneSubmissionFormInput) => void;
  isSubmitting?: boolean;
}) {
  const { mutateAsync: uploadFile, isPending: isUploading } = useUpload();
  const [evidenceDocs, setEvidenceDocs] = useState<string[]>(
    submission?.evidenceDocs || []
  );
  
  const [formData, setFormData] = useState({
    milestoneStage: submission?.milestoneStage || "",
    percentComplete: submission?.percentComplete || 0,
    notes: submission?.notes || "",
    latitude: submission?.geoTag?.coordinates[1] || "",
    longitude: submission?.geoTag?.coordinates[0] || "",
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const uploadPromises = Array.from(files).map((file) => uploadFile(file));
      const results = await Promise.all(uploadPromises);
      const urls = results.filter((res) => res !== undefined).map((res) => res.url);
      setEvidenceDocs((prev) => [...prev, ...urls]);
      toast.success("Files uploaded successfully");
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Failed to upload files");
    }
  };

  const removeFile = (index: number) => {
    setEvidenceDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.milestoneStage) {
      toast.error("Please select a milestone stage");
      return;
    }

    onSave({
      projectId,
      contractorId: submission?.contractorId ?? contractorId ?? "",

      milestoneStage: formData.milestoneStage as MilestoneStage,
      percentComplete: formData.percentComplete,
      notes: formData.notes,

      geoTag:
        formData.latitude && formData.longitude
          ? {
              type: "Point",
              coordinates: [
                Number(formData.longitude),
                Number(formData.latitude),
              ],
            }
          : undefined,

      evidenceDocs: evidenceDocs,

      status: submission?.status ?? SubmissionStatus.Pending,

      createdAt: submission?.createdAt
        ? new Date(submission.createdAt).toISOString()
        : new Date().toISOString(),

      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Submit Milestone
          </h1>
          <p className="text-muted-foreground mt-1">
            {projectTitle || "Project"} -{" "}
            {submission ? "Update submission" : "Submit new milestone"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Milestone Information</CardTitle>
            <CardDescription>
              Fill in the milestone submission details
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stage">Milestone Stage *</Label>
                <Select
                  value={formData.milestoneStage}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      milestoneStage: value as MilestoneStage,
                    })
                  }
                >
                  <SelectTrigger id="stage">
                    <SelectValue placeholder="Select milestone stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {MILESTONE_STAGES.map((stage) => (
                      <SelectItem key={stage.value} value={stage.value}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="percent">
                  Completion Percentage: {formData.percentComplete}% *
                </Label>
                <Slider
                  id="percent"
                  min={0}
                  max={100}
                  step={5}
                  value={[formData.percentComplete]}
                  onValueChange={(value) =>
                    setFormData({ ...formData, percentComplete: value[0] })
                  }
                  className="mt-4"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes & Comments</Label>
              <Textarea
                id="notes"
                placeholder="Describe the milestone progress, challenges, or any other relevant information..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={4}
              />
            </div>

            {/* Geo Location */}
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">
                  Geo Location (Optional)
                </Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    placeholder="e.g., 6.5244"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    placeholder="e.g., 3.3792"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <Label>Evidence Documents *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.jpg,.png,.mp4"
                  disabled={isUploading}
                />
                <label htmlFor="file-upload" className={`cursor-pointer ${isUploading ? 'opacity-50' : ''}`}>
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-spin" />
                  ) : (
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  )}
                  <p className="text-sm font-medium">
                    {isUploading ? "Uploading..." : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Photos, videos, documents up to 50MB
                  </p>
                </label>
              </div>

              {evidenceDocs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Uploaded Files ({evidenceDocs.length}):
                  </p>
                  {evidenceDocs.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-muted p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate max-w-[300px]">{doc.split('/').pop()}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-full sm:w-auto bg-transparent"
            disabled={isSubmitting || isUploading}
          >
            Cancel
          </Button>
          <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || isUploading}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submission ? "Update Submission" : "Submit Milestone"}
          </Button>
        </div>
      </form>
    </>
  );
}
