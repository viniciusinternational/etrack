"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MilestoneSubmissionFormView } from "@/components/contractor/milestone-submission-form-view";
import { useProjects } from "@/hooks/use-projects";
import { useCreateSubmission } from "@/hooks/use-submissions";
import { MilestoneSubmissionFormInput } from "@/types";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AddSubmissionPage() {
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const { mutate: createSubmission, isPending: isSaving } = useCreateSubmission();

  const handleSave = (data: MilestoneSubmissionFormInput) => {
    createSubmission({
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    }, {
      onSuccess: () => {
        router.push("/submissions");
      },
      onError: (error) => {
        console.error("Failed to create submission:", error);
      },
    });
  };

  if (isLoadingProjects) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!selectedProjectId) {
    return (
      <div className="container max-w-2xl py-10">
        <Card>
          <CardHeader>
            <CardTitle>Select Project</CardTitle>
            <CardDescription>
              Choose a project to submit a milestone for
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select
                value={selectedProjectId}
                onValueChange={setSelectedProjectId}
              >
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
                <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <MilestoneSubmissionFormView
        projectId={selectedProjectId}
        submission={null}
        projectTitle={projects?.find(p => p.id === selectedProjectId)?.title}
        contractorId={projects?.find(p => p.id === selectedProjectId)?.contractorId}
        onBack={() => setSelectedProjectId("")} // Go back to project selection
        onSave={handleSave}
      />
    </div>
  );
}
