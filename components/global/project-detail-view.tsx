"use client";
import {
  ArrowLeft,
  Edit,
  Building,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProjectPermissions } from "@/hooks/use-project-permissions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  type Project,
  type MilestoneSubmission,
  ProjectStatus,
  SubmissionStatus,
} from "@/types";
import {
  formatCurrency,
  formatDateLong,
  getStatusColor,
  getMilestoneStageLabel,
} from "@/components/projects-manager/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type ProjectMilestoneTemplate } from "@/types";

export function ProjectDetailView({
  project,
  milestones,
  onBack,
  onEdit,
}: {
  project: Project;
  milestones: MilestoneSubmission[];
  onBack: () => void;
  onEdit: () => void;
}) {
  const permissions = useProjectPermissions();
  const getStatusIcon = (status: ProjectStatus) => {
    const icons = {
      [ProjectStatus.Planned]: Clock,
      [ProjectStatus.InProgress]: Clock,
      [ProjectStatus.Delayed]: AlertCircle,
      [ProjectStatus.Completed]: CheckCircle,
    };
    const Icon = icons[status];
    return <Icon className="h-5 w-5" />;
  };

  const calculateProgress = () => {
    if (milestones.length === 0) return 0;
    const approved = milestones.filter(
      (m) => m.status === SubmissionStatus.Approved
    );
    const total = approved.reduce((s, m) => s + m.percentComplete, 0);
    return Math.round(total / Math.max(1, milestones.length));
  };

  // Helper function to safely convert to ISO string
  const toISOString = (date: Date | string): string => {
    if (typeof date === "string") return date;
    return date.toISOString();
  };

  const projectProgress = calculateProgress();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {project.title}
            </h1>
            <p className="text-gray-600 mt-1">
              Project Details and Milestone Tracking
            </p>
          </div>
        </div>
        {permissions.canUpdate && (
          <Button variant="outline" onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Project Overview</CardTitle>
              <Badge
                variant="secondary"
                className={getStatusColor(project.status)}
              >
                <span className="flex items-center gap-1">
                  {getStatusIcon(project.status)}
                  {project.status}
                </span>
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Description
              </h3>
              <p className="text-gray-900">{project.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Category
                </h3>
                <Badge variant="outline">{project.category}</Badge>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Contract Value
                </h3>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(project.contractValue)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                  <Building className="h-4 w-4" /> Supervising MDA
                </h3>
                <p className="text-gray-900">{project.supervisingMda?.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Contractor
                </h3>
                <p className="text-gray-900">{project.contractor?.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Start Date
                </h3>
                <p className="text-gray-900">
                  {formatDateLong(toISOString(project.startDate))}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> End Date
                </h3>
                <p className="text-gray-900">
                  {formatDateLong(toISOString(project.endDate))}
                </p>
              </div>
            </div>

            {project.evidenceDocs.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Evidence Documents
                </h3>
                <div className="space-y-2">
                  {project.evidenceDocs.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded"
                    >
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Overall Progress
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {projectProgress}%
                </span>
              </div>
              <Progress value={projectProgress} className="h-3" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Milestones</span>
                <span className="font-semibold">{milestones.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Approved</span>
                <span className="font-semibold text-green-600">
                  {
                    milestones.filter(
                      (m) => m.status === SubmissionStatus.Approved
                    ).length
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="font-semibold text-yellow-600">
                  {
                    milestones.filter(
                      (m) => m.status === SubmissionStatus.Pending
                    ).length
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rejected</span>
                <span className="font-semibold text-red-600">
                  {
                    milestones.filter(
                      (m) => m.status === SubmissionStatus.Rejected
                    ).length
                  }
                </span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-xs text-gray-500 space-y-1">
                <div>
                  Created: {formatDateLong(toISOString(project.createdAt))}
                </div>
                <div>
                  Last Updated: {formatDateLong(toISOString(project.updatedAt))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestones section */}
      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
          <CardDescription>
            Planned milestones and contractor submissions
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="planned" className="w-full">
            <TabsList>
              <TabsTrigger value="planned">Planned Milestones</TabsTrigger>
              <TabsTrigger value="submissions">
                Submissions ({milestones.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="planned" className="mt-4">
              {(() => {
                let plannedMilestones: ProjectMilestoneTemplate[] = [];
                if (project.plannedMilestones) {
                  if (Array.isArray(project.plannedMilestones)) {
                    plannedMilestones = project.plannedMilestones;
                  } else if (typeof project.plannedMilestones === 'string') {
                    try {
                      plannedMilestones = JSON.parse(project.plannedMilestones);
                    } catch {
                      plannedMilestones = [];
                    }
                  } else {
                    plannedMilestones = project.plannedMilestones as any;
                  }
                }
                
                if (plannedMilestones.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <Clock className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">
                        No planned milestones
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        Planned milestones will appear here once they are defined for the project.
                      </p>
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-4">
                    {plannedMilestones.map((template, index) => {
                    const hasSubmission = milestones.some(
                      (m) => m.milestoneStage === template.stage
                    );
                    return (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {getMilestoneStageLabel(template.stage)}
                                </h3>
                                {hasSubmission && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    Has Submission
                                  </Badge>
                                )}
                              </div>
                              {template.description && (
                                <p className="text-sm text-gray-700 mb-2">
                                  {template.description}
                                </p>
                              )}
                              <div className="grid grid-cols-2 gap-4">
                                {template.targetDate && (
                                  <div>
                                    <span className="text-sm text-gray-500">Target Date</span>
                                    <div className="mt-1 text-sm text-gray-700">
                                      {formatDateLong(template.targetDate)}
                                    </div>
                                  </div>
                                )}
                                {template.targetPercent !== undefined && (
                                  <div>
                                    <span className="text-sm text-gray-500">Target %</span>
                                    <div className="mt-1 text-sm font-medium text-gray-700">
                                      {template.targetPercent}%
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  </div>
                );
              })()}
            </TabsContent>

            <TabsContent value="submissions" className="mt-4">
              {milestones.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No milestones yet
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Milestone submissions will appear here once contractors start
                    submitting progress updates.
                  </p>
                </div>
              ) : (
            <div className="space-y-4 max-h-[55vh] overflow-y-auto">
              {milestones.map((milestone) => (
                <Card key={milestone.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {getMilestoneStageLabel(milestone.milestoneStage)}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={
                              milestone.status === SubmissionStatus.Approved
                                ? "bg-green-100 text-green-800"
                                : milestone.status === SubmissionStatus.Pending
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {milestone.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <span className="text-sm text-gray-500">
                              Progress
                            </span>
                            <div className="mt-1">
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={milestone.percentComplete}
                                  className="h-3 w-full"
                                />
                                <span className="text-sm font-medium">
                                  {milestone.percentComplete}%
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <span className="text-sm text-gray-500">
                              Submitted
                            </span>
                            <div className="mt-1 text-sm text-gray-700">
                              {new Date(milestone.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {milestone.notes && (
                          <p className="text-sm text-gray-700">
                            {milestone.notes}
                          </p>
                        )}
                      </div>

                      <div className="ml-4 flex-shrink-0">
                        <div className="text-sm text-gray-500">Evidence</div>
                        <div className="mt-2 space-y-2">
                          {milestone.evidenceDocs.map((doc, idx) => (
                            <div
                              key={idx}
                              className="text-sm bg-gray-50 p-2 rounded flex items-center gap-2"
                            >
                              <FileText className="h-4 w-4" />
                              <span>{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
