"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MilestoneStage,
  SubmissionStatus,
  type MilestoneSubmissionFormInput,
  type Project,
  type MilestoneSubmission,
} from "@/types";
import { useUpload } from "@/hooks/use-upload";
import { toast } from "sonner";

interface AddMilestoneModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  milestones: MilestoneSubmission[];
  contractorId: string;
  onSave: (data: MilestoneSubmissionFormInput) => Promise<void>;
  isSubmitting?: boolean;
  milestone?: MilestoneSubmission; // If provided, modal is in edit mode
  userRole?: string; // User's role to determine field access
}

export function AddMilestoneModal({
  open,
  onOpenChange,
  project,
  milestones,
  contractorId,
  onSave,
  isSubmitting = false,
  milestone,
  userRole = "Contractor",
}: AddMilestoneModalProps) {
  const isEditMode = !!milestone;
  const isContractor = userRole === "Contractor";
  const { mutateAsync: uploadFile, isPending: isUploading } = useUpload();
  const [evidenceDocs, setEvidenceDocs] = useState<string[]>(
    milestone?.evidenceDocs || []
  );
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [useGpsLocation, setUseGpsLocation] = useState(false);
  const [formData, setFormData] = useState({
    milestoneStage: milestone?.milestoneStage || "",
    percentComplete: milestone?.percentComplete || 0,
    notes: milestone?.notes || "",
    latitude: "",
    longitude: "",
  });

  // Update form data when milestone changes (for editing different milestones)
  useEffect(() => {
    if (milestone) {
      const lat =
        milestone.geoTag && Array.isArray(milestone.geoTag.coordinates)
          ? String(milestone.geoTag.coordinates[1] ?? "")
          : "";
      const lon =
        milestone.geoTag && Array.isArray(milestone.geoTag.coordinates)
          ? String(milestone.geoTag.coordinates[0] ?? "")
          : "";

      setFormData({
        milestoneStage: milestone.milestoneStage || "",
        percentComplete: milestone.percentComplete || 0,
        notes: milestone.notes || "",
        latitude: lat,
        longitude: lon,
      });
      setEvidenceDocs(milestone.evidenceDocs || []);
    }
  }, [milestone]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const uploadPromises = Array.from(files).map((file) => uploadFile(file));
      const results = await Promise.all(uploadPromises);
      const urls = results
        .filter((res) => res !== undefined)
        .map((res) => res.url);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.milestoneStage) {
      toast.error("Please select a milestone stage");
      return;
    }

    try {
      await onSave({
        projectId: project.id,
        contractorId,

        milestoneStage: formData.milestoneStage as MilestoneStage,
        percentComplete: formData.percentComplete,
        notes: formData.notes || undefined,

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

        status: SubmissionStatus.Pending, // Default to Pending, parent will override based on role

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Reset form
      setFormData({
        milestoneStage: "",
        percentComplete: 0,
        notes: "",
        latitude: "",
        longitude: "",
      });
      setEvidenceDocs([]);
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Failed to save milestone", error);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      // Reset form when closing
      setFormData({
        milestoneStage: "",
        percentComplete: 0,
        notes: "",
        latitude: "",
        longitude: "",
      });
      setEvidenceDocs([]);
      setUseGpsLocation(false);
    }
  };

  const handleGetGpsLocation = async () => {
    setIsGettingLocation(true);
    try {
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev) => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          }));
          toast.success("Location obtained successfully");
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error(
            `Failed to get location: ${
              error.message || "Permission denied or location unavailable"
            }`
          );
        }
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit" : "Add"} Milestone Submission
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update milestone for" : "Submit a new milestone for"}{" "}
            {project.title}
            {isContractor && isEditMode && (
              <span className="block mt-2 text-sm text-muted-foreground">
                Note: You can add/remove documents, update notes and location.
                Contact supervisor to update progress or percent complete.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="milestoneStage">
              Milestone Stage <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.milestoneStage}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, milestoneStage: value }))
              }
              disabled={isSubmitting || (isEditMode && isContractor)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select milestone stage" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(MilestoneStage).map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Percent Complete: {formData.percentComplete}%</Label>
            <Slider
              value={[formData.percentComplete]}
              onValueChange={([value]) =>
                setFormData((prev) => ({ ...prev, percentComplete: value }))
              }
              max={100}
              step={1}
              className="w-full"
              disabled={isSubmitting || (isEditMode && isContractor)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              placeholder="Add any notes about this milestone..."
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="use-gps"
                checked={useGpsLocation}
                onCheckedChange={(checked) => {
                  setUseGpsLocation(!!checked);
                  if (checked) {
                    handleGetGpsLocation();
                  }
                }}
                disabled={isSubmitting || isGettingLocation}
              />
              <Label
                htmlFor="use-gps"
                className="font-normal cursor-pointer flex items-center gap-2"
              >
                {isGettingLocation ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Getting location...
                  </>
                ) : (
                  "Use phone GPS location"
                )}
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude (optional)</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      latitude: e.target.value,
                    }))
                  }
                  placeholder="e.g., 6.5244"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude (optional)</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      longitude: e.target.value,
                    }))
                  }
                  placeholder="e.g., 3.3792"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Evidence Documents</Label>
            <div className="border-2 border-dashed rounded-lg p-4">
              <input
                type="file"
                multiple
                className="hidden"
                id="evidence-upload"
                onChange={handleFileUpload}
                disabled={isUploading || isSubmitting}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  document.getElementById("evidence-upload")?.click()
                }
                disabled={isUploading || isSubmitting}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Uploading..." : "Upload Files"}
              </Button>
            </div>
            {evidenceDocs.length > 0 && (
              <div className="mt-2 space-y-1">
                {evidenceDocs.map((doc, docIndex) => (
                  <div
                    key={docIndex}
                    className="flex items-center justify-between text-sm bg-primary/10 border border-primary/20 p-2 rounded"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{doc}</span>
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(docIndex)}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditMode ? "Updating..." : "Submitting..."}
                </>
              ) : isEditMode ? (
                "Update Milestone"
              ) : (
                "Submit Milestone"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
