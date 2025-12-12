"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserRole, type UserFormData } from "@/types";
import {
  useUser,
  useUpdateUser,
  useUserPermissionsJSON,
  useUpdateUserPermissionsJSON,
} from "@/hooks/use-users";
import { useMDAs } from "@/hooks/use-mdas";
import { PermissionsEditor } from "@/components/user/permissions-editor";
import type { PartialUserPermissions } from "@/types/permissions";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { toast } from "sonner";

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>("");
  const { isChecking } = useAuthGuard(["edit_user"]);
  const router = useRouter();
  const { data: user, isLoading } = useUser(id);
  const { data: mdasData } = useMDAs();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const { data: userPermissionsData, isLoading: isLoadingPermissions } =
    useUserPermissionsJSON(id);
  const { mutate: updatePermissions, isPending: isUpdatingPermissions } =
    useUpdateUserPermissionsJSON();

  const mdas = mdasData || [];

  const [formData, setFormData] = useState<UserFormData | null>(null);
  const [permissions, setPermissions] = useState<PartialUserPermissions>({});

  // Resolve params
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  // Load user data into form
  useEffect(() => {
    if (user) {
      setFormData({
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        mdaId: user.mdaId || "",
        status: (user.status as "active" | "inactive") || "active",
      });
    }
  }, [user]);

  // Load permissions
  useEffect(() => {
    if (userPermissionsData?.permissions) {
      setPermissions(userPermissionsData.permissions);
    }
  }, [userPermissionsData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !formData) return;

    if (!formData.firstname || !formData.lastname || !formData.email || !formData.mdaId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const updates: any = {
      firstname: formData.firstname,
      lastname: formData.lastname,
      email: formData.email,
      role: formData.role,
      mdaId: formData.mdaId,
      status: formData.status,
    };

    updateUser(
      { id: user.id, ...updates },
      {
        onSuccess: () => {
          // Update permissions if any are set
          if (Object.keys(permissions).length > 0) {
            updatePermissions(
              { userId: user.id, permissions },
              {
                onSuccess: () => {
                  toast.success("User updated successfully");
                  router.push(`/users/${user.id}`);
                },
                onError: () => {
                  toast.error("User updated but failed to update permissions");
                  router.push(`/users/${user.id}`);
                },
              }
            );
          } else {
            toast.success("User updated successfully");
            router.push(`/users/${user.id}`);
          }
        },
        onError: (error: any) => {
          console.error("Failed to update user:", error);
          toast.error(
            error?.response?.data?.error || "Failed to update user. Please try again."
          );
        },
      }
    );
  };

  if (isChecking || isLoading || !id) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !formData) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>User Not Found</CardTitle>
              <CardDescription>
                The user you're trying to edit doesn't exist.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/users")}>
                Go back to users
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/users/${user.id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit User</h1>
            <p className="text-muted-foreground mt-1">
              Update user information and permissions
            </p>
          </div>
        </div>

        {/* User Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground font-medium text-lg">
                  {`${user.firstname[0]}${user.lastname[0]}`.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold">{`${user.firstname} ${user.lastname}`}</h3>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground">
                  {(user as any).mdaName || "No MDA assigned"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update the user's name and email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstname">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstname"
                    value={formData.firstname}
                    onChange={(e) =>
                      setFormData({ ...formData, firstname: e.target.value })
                    }
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastname">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastname"
                    value={formData.lastname}
                    onChange={(e) =>
                      setFormData({ ...formData, lastname: e.target.value })
                    }
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role & MDA */}
          <Card>
            <CardHeader>
              <CardTitle>Role & Organization</CardTitle>
              <CardDescription>
                Update the user's role and MDA affiliation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">
                    Role <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role: value as UserRole })
                    }
                  >
                    <SelectTrigger className="w-full">
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
                  <Label htmlFor="mda">
                    MDA <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.mdaId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, mdaId: value })
                    }
                  >
                    <SelectTrigger className="w-full">
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
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>
                Update the status for this user account
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                    Active - User can log in and use the system
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="status-inactive" />
                  <Label
                    htmlFor="status-inactive"
                    className="font-normal cursor-pointer"
                  >
                    Inactive - User cannot log in
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                Update permissions for this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPermissions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <PermissionsEditor
                  permissions={permissions}
                  onPermissionsChange={setPermissions}
                />
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/users/${user.id}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating || isUpdatingPermissions}>
              {(isUpdating || isUpdatingPermissions) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

