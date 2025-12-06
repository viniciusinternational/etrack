"use client";
import type React from "react";
import { useState } from "react";
import { ArrowLeft, Upload, FileText, Loader2 } from "lucide-react";
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
import type { Expenditure } from "./types";
import { useProjects } from "@/hooks/use-projects";
import { ExpenditureFormInput } from "@/types";

export function ExpenditureFormView({
  expenditure,
  onBack,
  onSave,
  isSaving = false,
}: {
  expenditure: Expenditure | null;
  onBack: () => void;
  onSave: (data: ExpenditureFormInput) => void;
  isSaving?: boolean;
}) {
  const { data: projects } = useProjects();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>(
    expenditure?.supportingDocs.map((doc) => new File([], doc)) || []
  );
  const [formData, setFormData] = useState({
    projectId: expenditure?.projectId || "",
    amount: expenditure?.amount || 0,
    date: expenditure?.date
      ? new Date(expenditure.date).toISOString().split("T")[0]
      : "",
    recipient: expenditure?.recipient || "",
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      supportingDocs: uploadedFiles.map((f) => f.name),
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
            {expenditure ? "Edit Expenditure" : "Add Expenditure"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {expenditure
              ? "Update expenditure details"
              : "Record a new expenditure"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Expenditure Information</CardTitle>
            <CardDescription>Fill in the expenditure details</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project">Project *</Label>
                <Select
                  value={formData.projectId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, projectId: value })
                  }
                >
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((proj) => (
                      <SelectItem key={proj.id} value={proj.id}>
                        {proj.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₦) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: Number(e.target.value) })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient/Vendor *</Label>
                <Input
                  id="recipient"
                  placeholder="Enter recipient name"
                  value={formData.recipient}
                  onChange={(e) =>
                    setFormData({ ...formData, recipient: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <Label>Supporting Documents</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOC, XLS, JPG, PNG up to 10MB
                  </p>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Uploaded Files:</p>
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-muted p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        Remove
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
          >
            Cancel
          </Button>
          <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {expenditure ? "Update Expenditure" : "Add Expenditure"}
          </Button>
        </div>
      </form>
    </>
  );
}
