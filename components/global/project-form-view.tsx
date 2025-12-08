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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Project, ProjectCategory, type MDA, type User, ProjectFormInput, type MilestoneSubmission, UserRole } from "@/types";
import { MilestoneSubmissionForm } from "@/components/projects/milestone-submission-form";
import { useProjectPermissions } from "@/hooks/use-project-permissions";

export function ProjectFormView({
  project,
  mdas = [],
  contractors = [],
  supervisors = [],
  onBack,
  onSave,
  isSaving = false,
}: {
  project: Project | null;
  mdas?: MDA[];
  contractors?: User[];
  supervisors?: User[];
  onBack: () => void;
  onSave: (data: ProjectFormInput) => void;
  isSaving?: boolean;
}) {
  const permissions = useProjectPermissions();
  
  // Helper to format dates for input[type="date"]
  const formatDateForInput = (date: Date | string | undefined): string => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    title: project?.title || "",
    description: project?.description || "",
    category:
      (project?.category as ProjectCategory) || ProjectCategory.Infrastructure,
    supervisingMdaId: project?.supervisingMdaId || "",
    contractorId: project?.contractorId || "",
    supervisorId: project?.supervisorId || "",
    contractValue: project?.contractValue || 0,
    startDate: formatDateForInput(project?.startDate),
    endDate: formatDateForInput(project?.endDate),
    evidenceDocs: project?.evidenceDocs || [],
  });

  const [milestoneSubmissions, setMilestoneSubmissions] = useState<MilestoneSubmission[]>(
    project?.milestones || []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save project
    const projectData: ProjectFormInput = {
      ...formData,
    };
    
    onSave(projectData);
    
    // Note: Milestone submissions should be saved separately via /api/submissions
    // This will be handled in the parent component or via a separate API call
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {project ? "Edit Project" : "Add New Project"}
          </h1>
          <p className="text-gray-600 mt-1">
            {project
              ? "Update project information"
              : "Create a new project for your MDA"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>
              Fill in the details for the project
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 max-h-[75vh] overflow-y-auto">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        category: value as ProjectCategory,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ProjectCategory).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractValue">Contract Value (₦) *</Label>
                  <Input
                    id="contractValue"
                    type="number"
                    value={formData.contractValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contractValue: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mda">Supervising MDA</Label>
                  <Select
                    value={formData.supervisingMdaId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, supervisingMdaId: value })
                    }
                  >
                    <SelectTrigger className="w-[240px]">
                      <SelectValue placeholder="Select MDA (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {mdas.map((mda) => (
                        <SelectItem key={mda.id} value={mda.id}>
                          {mda.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractor">Contractor</Label>
                  <Select
                    value={formData.contractorId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, contractorId: value })
                    }
                  >
                    <SelectTrigger className="w-[240px]">
                      <SelectValue placeholder="Select Contractor (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {contractors.map((contractor) => (
                        <SelectItem key={contractor.id} value={contractor.id}>
                          {contractor ? `${contractor.firstname} ${contractor.lastname}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supervisor">Supervisor</Label>
                  <Select
                    value={formData.supervisorId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, supervisorId: value })
                    }
                  >
                    <SelectTrigger className="w-[240px]">
                      <SelectValue placeholder="Select Supervisor (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {supervisors.map((supervisor) => (
                        <SelectItem key={supervisor.id} value={supervisor.id}>
                          {supervisor ? `${supervisor.firstname} ${supervisor.lastname}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="evidenceDocs">Evidence Documents</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, DOCX up to 10MB
                  </p>
                  <input
                    id="evidenceDocs"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setFormData({
                        ...formData,
                        evidenceDocs: files.map((f) => f.name),
                      });
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4 bg-transparent"
                    onClick={() =>
                      document.getElementById("evidenceDocs")?.click()
                    }
                  >
                    Select Files
                  </Button>
                </div>

                {formData.evidenceDocs.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formData.evidenceDocs.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {doc}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
          <Button 
            type="submit" 
            className="w-full sm:w-auto" 
            disabled={isSaving || (!permissions.canCreate && !project) || (!permissions.canUpdate && project)}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {project ? "Update Project" : "Create Project"}
          </Button>
        </div>
      </form>
    </>
  );
}
