"use client";
import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Loader2 } from "lucide-react";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { GlobalTable } from "@/components/global/global-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// dropdown menu removed; actions handled via edit icon in table row
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
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// bulk selection removed
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// use shared types
import { User, UserRole } from "@/types";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useUserPermissions, useAssignUserPermissions } from "@/hooks/use-users";
import { useMDAs } from "@/hooks/use-mdas";
import { PermissionSelector } from "@/components/admin/permission-selector";
import { Checkbox } from "@/components/ui/checkbox";

// Mock Data removed

export default function UserManagementPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { data: usersData } = useUsers();
  const { data: mdasData } = useMDAs();
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const { mutate: assignPermissions, isPending: isAssigningPermissions } = useAssignUserPermissions();
  
  const users = useMemo(() => usersData || [], [usersData]);
  const mdas = mdasData || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [mdaFilter, setMdaFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: UserRole.MeetingUser,
    mdaId: "",
    status: "active" as "active" | "inactive",
    generatePassword: false,
  });
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "active").length;
    const inactive = users.filter((u) => u.status === "inactive").length;
    const newThisWeek = users.filter((u) => {
      const created = new Date(u.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created > weekAgo;
    }).length;

    return { total, active, inactive, newThisWeek };
  }, [users]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;
      const matchesMda = mdaFilter === "all" || user.mdaId === mdaFilter;

      return matchesSearch && matchesRole && matchesStatus && matchesMda;
    });
  }, [users, searchTerm, roleFilter, statusFilter, mdaFilter]);

  // Handlers
  const handleAddUser = () => {
    const newUser: any = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      mdaId: formData.mdaId || undefined,
      status: formData.status,
      generatePassword: formData.generatePassword,
    };

    if (selectedPermissionIds.length > 0) {
      newUser.permissionIds = selectedPermissionIds;
    }

    createUser(newUser, {
      onSuccess: (data: any) => {
        setIsAddDialogOpen(false);
        resetForm();
        if (data?.generatedPassword) {
          alert(`User created successfully!\n\nGenerated Password: ${data.generatedPassword}\n\nUser must change password on first login.`);
        }
      },
      onError: (error) => {
        console.error("Failed to create user:", error);
        alert("Failed to create user. Check console for details.");
      }
    });
  };

  // Load user permissions when editing
  const { data: userPermissionsData } = useUserPermissions(selectedUser?.id || "");
  
  // Update selected permissions when user permissions load
  useEffect(() => {
    if (userPermissionsData && selectedUser && isEditDialogOpen) {
      const permissionIds = userPermissionsData.userPermissions.map((up) => up.permissionId);
      setSelectedPermissionIds(permissionIds);
    }
  }, [userPermissionsData, selectedUser, isEditDialogOpen]);

  const handleEditUser = () => {
    if (!selectedUser) return;
    const updates: any = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      mdaId: formData.mdaId || undefined,
      status: formData.status,
    };
    
    updateUser({ id: selectedUser.id, ...updates }, {
      onSuccess: () => {
        // Assign permissions if any are selected
        if (selectedPermissionIds.length > 0) {
          assignPermissions(
            { userId: selectedUser.id, permissionIds: selectedPermissionIds },
            {
              onSuccess: () => {
                setIsEditDialogOpen(false);
                setSelectedUser(null);
                resetForm();
              },
            }
          );
        } else {
          setIsEditDialogOpen(false);
          setSelectedUser(null);
          resetForm();
        }
      }
    });
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    deleteUser(selectedUser.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setSelectedUser(null);
      }
    });
  };



  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: UserRole.MeetingUser,
      mdaId: "",
      status: "active",
      generatePassword: false,
    });
    setSelectedPermissionIds([]);
    setSearchTerm(""); // Clear search bar
  };

  // selection helpers removed (list is row-click navigable)

  const getRoleBadgeVariant = (role: UserRole) => {
    const variants: Record<
      UserRole,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      [UserRole.SuperAdmin]: "destructive",
      [UserRole.Admin]: "default",
      [UserRole.GovernorAdmin]: "default",
      [UserRole.ProjectManager]: "secondary",
      [UserRole.Contractor]: "secondary",
      [UserRole.FinanceOfficer]: "secondary",
      [UserRole.ProcurementOfficer]: "secondary",
      [UserRole.Vendor]: "outline",
      [UserRole.Auditor]: "outline",
      [UserRole.MeetingUser]: "outline",
    };
    return variants[role] || "secondary";
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All registered users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
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
              Inactive Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {stats.inactive}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Deactivated accounts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue">
              {stats.newThisWeek}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Recently registered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {Object.values(UserRole).map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
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
            <Select value={mdaFilter} onValueChange={setMdaFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All MDAs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All MDAs</SelectItem>
                {mdas.map((mda) => (
                  <SelectItem key={mda.id} value={mda.id}>
                    {mda.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table (Global Table) */}
      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription>
            Showing {filteredUsers.length} of {users.length} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GlobalTable
            data={filteredUsers}
            columns={(() => {
              const cols: ColumnDef<User>[] = [
                {
                  accessorKey: "name",
                  header: "User",
                  cell: ({ row }: { row: Row<User> }) => (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                          {row.original.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">
                          {row.original.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {row.original.email}
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  accessorKey: "role",
                  header: "Role",
                  cell: ({ row }: { row: Row<User> }) => (
                    <Badge variant={getRoleBadgeVariant(row.original.role)}>
                      {row.original.role}
                    </Badge>
                  ),
                },
                {
                  accessorKey: "mdaName",
                  header: "MDA",
                  cell: ({ row }: { row: Row<User> }) => (
                    <div className="text-sm text-foreground">
                      {row.original.mdaName || "-"}
                    </div>
                  ),
                },
                {
                  accessorKey: "status",
                  header: "Status",
                  cell: ({ row }: { row: Row<User> }) => (
                    <Badge
                      variant={
                        row.original.status === "active"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {row.original.status}
                    </Badge>
                  ),
                },
                {
                  accessorKey: "lastLogin",
                  header: "Last Login",
                  cell: ({ row }: { row: Row<User> }) => (
                    <div className="text-sm text-muted-foreground">
                      {row.original.lastLogin
                        ? formatDate(row.original.lastLogin)
                        : "Never"}
                    </div>
                  ),
                },
              ];
              return cols;
            })()}
            title="Users"
            rowClickHref={(row) => `/users/${row.id}`}
          />
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with appropriate role and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email address"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value as UserRole })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(UserRole).map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mda">MDA *</Label>
                <Select
                  value={formData.mdaId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, mdaId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select MDA" />
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
            </div>
            <div className="space-y-3">
              <Label>Account Status</Label>
              <RadioGroup
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as "active" | "inactive",
                  })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="status-active" />
                  <Label
                    htmlFor="status-active"
                    className="font-normal cursor-pointer"
                  >
                    Active
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="status-inactive" />
                  <Label
                    htmlFor="status-inactive"
                    className="font-normal cursor-pointer"
                  >
                    Inactive
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="generate-password"
                  checked={formData.generatePassword}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      generatePassword: checked as boolean,
                    })
                  }
                />
                <Label
                  htmlFor="generate-password"
                  className="font-normal cursor-pointer"
                >
                  Generate password (user must change on first login)
                </Label>
              </div>
            </div>
            <div className="space-y-3">
              <Label>Permissions</Label>
              <div className="border rounded-lg p-4">
                <PermissionSelector
                  selectedPermissionIds={selectedPermissionIds}
                  onSelectionChange={setSelectedPermissionIds}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value as UserRole })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(UserRole).map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-mda">MDA *</Label>
                <Select
                  value={formData.mdaId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, mdaId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
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
            </div>
            <div className="space-y-3">
              <Label>Account Status</Label>
              <RadioGroup
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as "active" | "inactive",
                  })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="edit-status-active" />
                  <Label
                    htmlFor="edit-status-active"
                    className="font-normal cursor-pointer"
                  >
                    Active
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="edit-status-inactive" />
                  <Label
                    htmlFor="edit-status-inactive"
                    className="font-normal cursor-pointer"
                  >
                    Inactive
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-3">
              <Label>Permissions</Label>
              <div className="border rounded-lg p-4">
                <PermissionSelector
                  selectedPermissionIds={selectedPermissionIds}
                  onSelectionChange={setSelectedPermissionIds}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={isUpdating || isAssigningPermissions}>
              {(isUpdating || isAssigningPermissions) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.name}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
