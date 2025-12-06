"use client";

import React, { useMemo, useState } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Project,
  ProjectCategory,
  ProjectStatus,
} from "@/types";
import { MDA_OPTIONS } from "@/components/projects-manager/constants";

interface Props {
  projects: Project[];
  onAddNew: () => void;
  onViewProject: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

export default function ProjectList({
  projects,
  onAddNew,
  onViewProject,
  onEditProject,
  onDeleteProject,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mdaFilter, setMdaFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const stats = useMemo(() => {
    const total = projects.length;
    const inProgress = projects.filter(
      (p) => p.status === ProjectStatus.InProgress
    ).length;
    const completed = projects.filter(
      (p) => p.status === ProjectStatus.Completed
    ).length;
    const totalValue = projects.reduce((sum, p) => sum + p.contractValue, 0);
    return { total, inProgress, completed, totalValue };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || project.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;
      const matchesMda =
        mdaFilter === "all" || project.supervisingMdaId === mdaFilter;
      return matchesSearch && matchesCategory && matchesStatus && matchesMda;
    });
  }, [projects, searchTerm, categoryFilter, statusFilter, mdaFilter]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(n);

  const getStatusColor = (s: ProjectStatus) =>
    ({
      [ProjectStatus.Planned]: "bg-blue-100 text-blue-800",
      [ProjectStatus.InProgress]: "bg-yellow-100 text-yellow-800",
      [ProjectStatus.Delayed]: "bg-red-100 text-red-800",
      [ProjectStatus.Completed]: "bg-green-100 text-green-800",
    }[s]);

  const getCategoryColor = (c: ProjectCategory) =>
    ({
      [ProjectCategory.Infrastructure]: "bg-purple-100 text-purple-800",
      [ProjectCategory.Healthcare]: "bg-pink-100 text-pink-800",
      [ProjectCategory.Education]: "bg-indigo-100 text-indigo-800",
      [ProjectCategory.Agriculture]: "bg-green-100 text-green-800",
      [ProjectCategory.Technology]: "bg-blue-100 text-blue-800",
      [ProjectCategory.Environment]: "bg-teal-100 text-teal-800",
      [ProjectCategory.Housing]: "bg-orange-100 text-orange-800",
    }[c]);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage all MDA projects</p>
        </div>
        <Button onClick={onAddNew} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add New Project
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Projects",
            value: stats.total,
            color: "text-blue-600",
          },
          {
            label: "In Progress",
            value: stats.inProgress,
            color: "text-yellow-600",
          },
          {
            label: "Completed",
            value: stats.completed,
            color: "text-green-600",
          },
          {
            label: "Total Value",
            value: formatCurrency(stats.totalValue),
            color: "text-purple-600",
          },
        ].map((stat, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.values(ProjectCategory).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.values(ProjectStatus).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={mdaFilter} onValueChange={setMdaFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All MDAs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All MDAs</SelectItem>
                {MDA_OPTIONS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Projects List</CardTitle>
          <CardDescription>
            Showing {filteredProjects.length} of {projects.length} projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>MDA</TableHead>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      No projects found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div className="font-medium">{project.title}</div>
                        <div className="text-sm text-gray-500">
                          {project.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(project.category)}>
                          {project.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{project.supervisingMda?.name}</TableCell>
                      <TableCell>{project.contractor?.name}</TableCell>
                      <TableCell>
                        {formatCurrency(project.contractValue)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => onViewProject(project)}
                            >
                              <Eye className="mr-2 h-4 w-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onEditProject(project)}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setProjectToDelete(project);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (projectToDelete) onDeleteProject(projectToDelete.id);
                setDeleteDialogOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
