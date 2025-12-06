"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Download, ChevronDown } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import numeral from "numeral";
import { GlobalTable } from "@/components/global/global-table";
import { useProjectPermissions } from "@/hooks/use-project-permissions";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type Project, ProjectCategory, ProjectStatus } from "@/types";
import { MDA_OPTIONS } from "@/components/projects-manager/constants";
import {
  formatDate,
  getStatusColor,
  getCategoryColor,
} from "@/components/projects-manager/utils";

// Utility function to format large numbers with abbreviations
const formatCompactNumber = (value: number): string => {
  return numeral(value).format("0.0a").toUpperCase();
};

// Utility function to format currency with abbreviations
const formatCompactCurrency = (value: number): string => {
  return `₦${numeral(value).format("0.0a").toUpperCase()}`;
};

export function ProjectListView({
  projects,
  onDeleteProject,
}: {
  projects: Project[];
  onDeleteProject: (projectId: string) => void;
}) {
  const permissions = useProjectPermissions();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [mdaFilter, setMdaFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isExporting, setIsExporting] = useState(false);

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

  // Filtered projects (category, status, MDA applied; GlobalTable handles text search)
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory =
        categoryFilter === "all" || project.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;
      const matchesMda =
        mdaFilter === "all" || project.supervisingMdaId === mdaFilter;
      return matchesCategory && matchesStatus && matchesMda;
    });
  }, [projects, categoryFilter, statusFilter, mdaFilter]);

  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      onDeleteProject(projectToDelete.id);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleExport = async (format: "csv" | "excel" | "json") => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();
      params.append("format", format);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (mdaFilter !== "all") params.append("mdaId", mdaFilter);

      const response = await fetch(`/api/projects/export?${params.toString()}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `projects-${new Date().toISOString().split("T")[0]}.${format === "excel" ? "xls" : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Projects exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to export projects");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage all MDA projects</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {permissions.canExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isExporting} className="w-full sm:w-auto">
                  <Download className="mr-2 h-4 w-4" />
                  {isExporting ? "Exporting..." : "Export"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("excel")}>
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("json")}>
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {permissions.canCreate && (
            <Link href="/projects/add" className="w-full sm:w-auto">
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add New Project
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {formatCompactNumber(stats.total)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-3">
              {formatCompactNumber(stats.inProgress)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-2">
              {formatCompactNumber(stats.completed)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4">
              {formatCompactCurrency(stats.totalValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Contract values
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters (search lives inside GlobalTable) */}
      <div className="flex flex-col md:flex-row gap-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.values(ProjectCategory).map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
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
            {Object.values(ProjectStatus).map((st) => (
              <SelectItem key={st} value={st}>
                {st}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={mdaFilter} onValueChange={setMdaFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
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

      {/* Projects Table (Global TanStack Table) */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Projects List</CardTitle>
          <CardDescription>
            Showing {filteredProjects.length} of {projects.length} projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GlobalTable
            data={filteredProjects}
            columns={(() => {
              const cols: ColumnDef<Project>[] = [
                {
                  accessorKey: "title",
                  header: "Project",
                  cell: ({ row }) => (
                    <div className="max-w-[220px]">
                      <div className="font-medium text-foreground truncate">
                        {row.original.title}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {row.original.description}
                      </div>
                    </div>
                  ),
                },
                {
                  accessorKey: "category",
                  header: "Category",
                  cell: ({ row }) => (
                    <Badge
                      variant="secondary"
                      className={getCategoryColor(row.original.category)}
                    >
                      {row.original.category}
                    </Badge>
                  ),
                },
                {
                  accessorKey: "supervisingMda.name",
                  header: "MDA",
                  cell: ({ row }) => (
                    <div className="text-sm truncate max-w-[160px]">
                      {row.original.supervisingMda?.name || 'N/A'}
                    </div>
                  ),
                },
                {
                  accessorKey: "contractor.name",
                  header: "Contractor",
                  cell: ({ row }) => (
                    <div className="text-sm truncate max-w-[160px]">
                      {row.original.contractor?.name || 'N/A'}
                    </div>
                  ),
                },
                {
                  accessorKey: "contractValue",
                  header: "Value",
                  cell: ({ row }) => (
                    <div className="text-sm font-medium">
                      {formatCompactCurrency(row.original.contractValue)}
                    </div>
                  ),
                },
                {
                  accessorKey: "status",
                  header: "Status",
                  cell: ({ row }) => (
                    <Badge
                      variant="secondary"
                      className={getStatusColor(row.original.status)}
                    >
                      {row.original.status}
                    </Badge>
                  ),
                },
                {
                  id: "timeline",
                  header: "Timeline",
                  cell: ({ row }) => {
                    const startDate = row.original.startDate instanceof Date 
                      ? row.original.startDate.toISOString() 
                      : row.original.startDate;
                    const endDate = row.original.endDate instanceof Date 
                      ? row.original.endDate.toISOString() 
                      : row.original.endDate;
                    
                    return (
                      <div className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(startDate)} -{" "}
                        {formatDate(endDate)}
                      </div>
                    );
                  },
                },
              
              ];
              return cols;
            })()}
            title="Projects"
            rowClickHref={(row) => `/projects/${row.id}`}
          />
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{projectToDelete?.title}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
