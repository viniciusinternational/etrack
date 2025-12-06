"use client";
import { useState } from "react";
import { Plus, Trash2, Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { type MilestoneSubmission, MilestoneStage } from "@/types";
import { useUpload } from "@/hooks/use-upload";
import { toast } from "sonner";

export function MilestoneSubmissionForm({
  submissions,
  projectId,
  contractorId,
  onChange,
}: {
  submissions: MilestoneSubmission[];
  projectId: string;
  contractorId: string;
  onChange: (submissions: MilestoneSubmission[]) => void;
}) {
  const { mutateAsync: uploadFile, isPending: isUploading } = useUpload();

  const addSubmission = () => {
    const newSubmission: MilestoneSubmission = {
      id: `temp-${Date.now()}`,
      projectId,
      contractorId,
      milestoneStage: MilestoneStage.PreConstruction,
      percentComplete: 0,
      notes: "",
      evidenceDocs: [],
      status: "Pending" as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    onChange([...submissions, newSubmission]);
  };

  const updateSubmission = (index: number, updates: Partial<MilestoneSubmission>) => {
    const updated = [...submissions];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeSubmission = (index: number) => {
    onChange(submissions.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const uploadPromises = Array.from(files).map((file) => uploadFile(file));
      const results = await Promise.all(uploadPromises);
      const urls = results.filter((res) => res !== undefined).map((res) => res.url);
      const currentDocs = submissions[index].evidenceDocs || [];
      updateSubmission(index, { evidenceDocs: [...currentDocs, ...urls] });
      toast.success("Files uploaded successfully");
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Failed to upload files");
    }
  };

  const removeFile = (submissionIndex: number, fileIndex: number) => {
    const submission = submissions[submissionIndex];
    const updatedDocs = submission.evidenceDocs.filter((_, i) => i !== fileIndex);
    updateSubmission(submissionIndex, { evidenceDocs: updatedDocs });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Milestone Submissions</Label>
        <Button type="button" variant="outline" size="sm" onClick={addSubmission}>
          <Plus className="h-4 w-4 mr-2" />
          Add Submission
        </Button>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-lg">
          <p>No milestone submissions yet.</p>
          <p className="text-sm mt-1">Click "Add Submission" to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((submission, index) => (
            <Card key={submission.id || index}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Stage *</Label>
                    <Select
                      value={submission.milestoneStage}
                      onValueChange={(value) =>
                        updateSubmission(index, {
                          milestoneStage: value as MilestoneStage,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
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
                    <Label>% Complete: {submission.percentComplete}%</Label>
                    <Slider
                      value={[submission.percentComplete]}
                      onValueChange={([value]) =>
                        updateSubmission(index, { percentComplete: value })
                      }
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={submission.notes || ""}
                      onChange={(e) =>
                        updateSubmission(index, { notes: e.target.value })
                      }
                      rows={2}
                      placeholder="Submission notes..."
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Evidence Documents</Label>
                    <div className="border-2 border-dashed rounded-lg p-4">
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        id={`evidence-${index}`}
                        onChange={(e) => handleFileUpload(e, index)}
                        disabled={isUploading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document.getElementById(`evidence-${index}`)?.click()
                        }
                        disabled={isUploading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploading ? "Uploading..." : "Upload Files"}
                      </Button>
                    </div>
                    {submission.evidenceDocs.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {submission.evidenceDocs.map((doc, docIndex) => (
                          <div
                            key={docIndex}
                            className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
                          >
                            <span className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              {doc}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index, docIndex)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeSubmission(index)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

