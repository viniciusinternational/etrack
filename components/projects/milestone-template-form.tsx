"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import { type ProjectMilestoneTemplate, MilestoneStage } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MILESTONE_STAGES = Object.values(MilestoneStage);

export function MilestoneTemplateForm({
  templates,
  onChange,
}: {
  templates: ProjectMilestoneTemplate[];
  onChange: (templates: ProjectMilestoneTemplate[]) => void;
}) {
  const addTemplate = () => {
    onChange([
      ...templates,
      {
        stage: MilestoneStage.PreConstruction,
        targetDate: "",
        description: "",
        targetPercent: 0,
      },
    ]);
  };

  const updateTemplate = (index: number, updates: Partial<ProjectMilestoneTemplate>) => {
    const updated = [...templates];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeTemplate = (index: number) => {
    onChange(templates.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Planned Milestones</Label>
        <Button type="button" variant="outline" size="sm" onClick={addTemplate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-lg">
          <p>No planned milestones yet.</p>
          <p className="text-sm mt-1">Click "Add Milestone" to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((template, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Stage *</Label>
                    <Select
                      value={template.stage}
                      onValueChange={(value) =>
                        updateTemplate(index, { stage: value as MilestoneStage })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MILESTONE_STAGES.map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {stage}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Target Date</Label>
                    <Input
                      type="date"
                      value={template.targetDate || ""}
                      onChange={(e) =>
                        updateTemplate(index, { targetDate: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={template.description || ""}
                      onChange={(e) =>
                        updateTemplate(index, { description: e.target.value })
                      }
                      rows={2}
                      placeholder="Milestone description..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Target % Complete</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={template.targetPercent || 0}
                      onChange={(e) =>
                        updateTemplate(index, {
                          targetPercent: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeTemplate(index)}
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

