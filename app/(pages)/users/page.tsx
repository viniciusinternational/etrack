"use client";
import { useState, useMemo } from "react";
import { Plus, Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// use shared types
import { User, UserRole } from "@/types";
import { useUsers, useDeleteUser } from "@/hooks/use-users";
import { useMDAs } from "@/hooks/use-mdas";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { toast } from "sonner";

// Mock Data removed

export default function UserManagementPage() {
  // Check authentication and permission
  const { isChecking } = useAuthGuard(['view_user']);
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { data: usersData } = useUsers();
  const { data: mdasData } = useMDAs();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  
  const users = useMemo(() => usersData || [], [usersData]);
  const mdas = mdasData || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [mdaFilter, setMdaFilter] = useState<string>("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
      const fullName = `${user.firstname} ${user.lastname}`;
      const matchesSearch =
        user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;
      const matchesMda = mdaFilter === "all" || user.mdaId === mdaFilter;

      return matchesSearch && matchesRole && matchesStatus && matchesMda;
    });
  }, [users, searchTerm, roleFilter, statusFilter, mdaFilter]);

  // Handlers
  const handleDeleteUser = () => {
    if (!selectedUser) return;
    deleteUser(selectedUser.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setSelectedUser(null);
        toast.success("User deleted successfully");
      },
      onError: () => {
        toast.error("Failed to delete user");
      },
    });
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
        <Button onClick={() => router.push("/users/new")} size="lg">
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
                  id: "name",
                  header: "User",
                  cell: ({ row }: { row: Row<User> }) => {
                    const fullName = `${row.original.firstname} ${row.original.lastname}`;
                    return (
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                            {`${row.original.firstname?.[0] || ""}${row.original.lastname?.[0] || ""}`.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">
                            {fullName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {row.original.email}
                          </div>
                        </div>
                      </div>
                    );
                  },
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser ? `${selectedUser.firstname} ${selectedUser.lastname}` : ''}? This action
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
