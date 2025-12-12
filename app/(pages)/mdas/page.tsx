"use client";
import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { GlobalTable } from "@/components/global/global-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MDA } from "@/types";
import { useMDAs, useCreateMDA } from "@/hooks/use-mdas";
import { useUsers } from "@/hooks/use-users";
import { toast } from "sonner";

type MDAFormData = Omit<MDA, "id" | "createdAt" | "updatedAt">;

// NOTE: MDAs are now fetched from API via React Query hooks

const CATEGORY_OPTIONS = ["Ministry", "Department", "Agency", "Board"];

import { useAuthGuard } from "@/hooks/use-auth-guard";

export default function MDAManagementPage() {
  // Check authentication and permission
  const { isChecking } = useAuthGuard(['view_mda']);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<MDAFormData>({
    name: "",
    category: "Ministry",
    description: "",
    headOfMda: "",
    email: "",
    phone: "",
    address: "",
    isActive: true,
  });
  const { data: mdasData, isLoading: isLoadingMdas, error: mdasError } = useMDAs();
  const { mutate: createMDA, isPending: isCreating } = useCreateMDA();
  const { data: usersData } = useUsers();
  
  const mdas = useMemo(() => {
    console.log('MDAs data:', mdasData);
    return mdasData || [];
  }, [mdasData]);
  const users = usersData || [];

  // Statistics
  const stats = useMemo(() => {
    const total = mdas.length;
    const active = mdas.filter((m) => m.isActive).length;
    const inactive = mdas.filter((m) => !m.isActive).length;
    const byCategory = CATEGORY_OPTIONS.map((cat) => ({
      category: cat,
      count: mdas.filter((m) => m.category === cat).length,
    }));

    return { total, active, inactive, byCategory };
  }, [mdas]);

  // Filtered MDAs (category & status applied; GlobalTable handles text search)
  const filteredMdas = useMemo(() => {
    const filtered = mdas.filter((mda) => {
      const matchesCategory =
        categoryFilter === "all" || mda.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? mda.isActive : !mda.isActive);
      return matchesCategory && matchesStatus;
    });
    console.log('Filtered MDAs:', filtered, 'categoryFilter:', categoryFilter, 'statusFilter:', statusFilter);
    return filtered;
  }, [mdas, categoryFilter, statusFilter]);

  // Memoize columns to prevent table reset on every render
  const columns = useMemo<ColumnDef<MDA>[]>(() => [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-foreground">
            {row.original.name}
          </div>
          {row.original.description && (
            <div className="text-sm text-muted-foreground">
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge
          variant={getCategoryBadgeVariant(row.original.category)}
        >
          {row.original.category}
        </Badge>
      ),
    },
    {
      accessorKey: "headOfMda",
      header: "Head of MDA",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.headOfMda || "-"}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-sm">{row.original.email || "-"}</div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.isActive ? "default" : "secondary"}
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ], []);

  // Handlers
  const handleAddMda = () => {
    const newMda: Partial<MDA> = {
      ...formData,
    };

    createMDA(newMda, {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        resetForm();
        toast.success("MDA created successfully");
      },
      onError: (error) => {
        console.error("Error creating MDA:", error);
        toast.error("Failed to create MDA");
      }
    });
  };



  // Edit/Delete are performed on the MDA view page. Keep list simple: click a row to view.

  const resetForm = () => {
    setFormData({
      name: "",
      category: "Ministry",
      description: "",
      headOfMda: "",
      email: "",
      phone: "",
      address: "",
      isActive: true,
    });
  };

  // selection removed for this migration

  const getCategoryBadgeVariant = (category: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "outline" | "destructive"
    > = {
      Ministry: "default",
      Department: "secondary",
      Agency: "outline",
      Board: "destructive",
    };
    return variants[category] || "secondary";
  };

  // formatDate removed — not used in this simplified list view

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">MDA Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage Ministries, Departments, and Agencies
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New MDA
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total MDAs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All registered MDAs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active MDAs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-2">
              {stats.active}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inactive MDAs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {stats.inactive}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Deactivated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-4">
              {CATEGORY_OPTIONS.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Types available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters (search lives inside GlobalTable) */}
      <div className="flex gap-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORY_OPTIONS.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk actions removed - list uses row click for details and edit icon for editing */}

      {/* MDAs Table (Global TanStack Table) */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>MDAs List</CardTitle>
          <CardDescription>
            Showing {filteredMdas.length} of {mdas.length} MDAs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GlobalTable
            data={filteredMdas}
            columns={columns}
            title="MDAs"
            rowClickHref={(row) => `/mdas/${row.id}`}
          />
        </CardContent>
      </Card>

      {/* Add MDA Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New MDA</DialogTitle>
            <DialogDescription>
              Create a new Ministry, Department, or Agency record
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">MDA Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter MDA name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter MDA description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="head">Head of MDA</Label>
                <Select
                  value={formData.headOfMda || "None"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, headOfMda: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select head of MDA" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={`${user.firstname} ${user.lastname}`}>
                        {`${user.firstname} ${user.lastname}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Enter address"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <RadioGroup
                value={formData.isActive ? "active" : "inactive"}
                onValueChange={(value) =>
                  setFormData({ ...formData, isActive: value === "active" })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label
                    htmlFor="active"
                    className="font-normal cursor-pointer"
                  >
                    Active
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="inactive" />
                  <Label
                    htmlFor="inactive"
                    className="font-normal cursor-pointer"
                  >
                    Inactive
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMda} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create MDA"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      {/* Delete removed - deletion handled on MDA detail page if required */}
    </div>
  );
}
