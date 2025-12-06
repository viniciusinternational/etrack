"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit } from "lucide-react";
import { User, UserRole, type UserFormData } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUser, useUpdateUser, useUserPermissions, useAssignUserPermissions, useRemoveUserPermission } from "@/hooks/use-users";
import { useMDAs } from "@/hooks/use-mdas";
import { Loader2, Key, Shield, CheckCircle2, XCircle } from "lucide-react";
import { PermissionSelector } from "@/components/admin/permission-selector";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { toast } from "sonner";

export default function UserViewClient({ id }: { id: string }) {
  const router = useRouter();
  const { data: user, isLoading } = useUser(id);
  const { data: mdasData } = useMDAs();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const { data: userPermissionsData, isLoading: isLoadingPermissions } = useUserPermissions(id);
  const { mutate: assignPermissions, isPending: isAssigningPermissions } = useAssignUserPermissions();
  const { mutate: removePermission } = useRemoveUserPermission();

  const mdas = mdasData || [];
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isGeneratePasswordOpen, setIsGeneratePasswordOpen] = useState(false);
  const [form, setForm] = useState<UserFormData | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        role: user.role,
        mdaId: user.mdaId || "",
        status: (user.status as "active" | "inactive") || "active",
      });
    }
  }, [user]);

  useEffect(() => {
    if (userPermissionsData) {
      const permissionIds = userPermissionsData.userPermissions.map((up) => up.permissionId);
      setSelectedPermissionIds(permissionIds);
    }
  }, [userPermissionsData]);

  function openEdit() {
    setIsEditOpen(true);
  }

  function onSave() {
    if (!user || !form) return;
    const updates = {
      name: form.name,
      email: form.email,
      role: form.role,
      mdaId: form.mdaId,
      mdaName: mdas.find((m) => m.id === form.mdaId)?.name,
      status: form.status,
    };

    updateUser(
      { id: user.id, ...updates },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          toast.success("User updated successfully");
        },
        onError: () => {
          toast.error("Failed to update user");
        },
      }
    );
  }

  function handleSavePermissions() {
    if (!user) return;
    assignPermissions(
      { userId: user.id, permissionIds: selectedPermissionIds },
      {
        onSuccess: () => {
          setIsPermissionsOpen(false);
          toast.success("Permissions updated successfully");
        },
        onError: () => {
          toast.error("Failed to update permissions");
        },
      }
    );
  }

  async function handleGeneratePassword() {
    if (!user) return;
    try {
      const { data } = await axios.post(`/api/users/${user.id}/generate-password`);
      if (data.ok) {
        setGeneratedPassword(data.data.generatedPassword);
        setIsGeneratePasswordOpen(true);
        toast.success("Password generated successfully");
      }
    } catch (error) {
      console.error("Error generating password:", error);
      toast.error("Failed to generate password");
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !form) return null;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">{user.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Information about this user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Role</div>
              <div className="font-medium">{user.role}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">MDA</div>
              <div className="font-medium">
                {(user as User & Record<string, unknown>).mdaName || "-"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-medium">{user.email || "-"}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="font-medium capitalize">
                {user.status || "active"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Last Login</div>
              <div className="font-medium">
                {(user as User & Record<string, unknown>).lastLogin
                  ? new Date(
                      (user as User & Record<string, unknown>).lastLogin as Date
                    ).toLocaleDateString()
                  : "Never"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Password Status</div>
              <div className="font-medium flex items-center gap-2">
                {(user as User & Record<string, unknown>).mustChangePassword ? (
                  <>
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="text-destructive">Must Change</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Active</span>
                  </>
                )}
              </div>
            </div>
            {(user as User & Record<string, unknown>).passwordChangedAt && (
              <div>
                <div className="text-sm text-muted-foreground">Password Changed</div>
                <div className="font-medium">
                  {new Date(
                    (user as User & Record<string, unknown>).passwordChangedAt as Date
                  ).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Permissions Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>User's assigned permissions</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setIsPermissionsOpen(true)}>
              <Shield className="mr-2 h-4 w-4" />
              Manage Permissions
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingPermissions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : userPermissionsData && userPermissionsData.userPermissions.length > 0 ? (
            <div className="space-y-2">
              {Object.entries(
                userPermissionsData.userPermissions.reduce((acc, up) => {
                  if (!acc[up.module]) acc[up.module] = [];
                  acc[up.module].push(up);
                  return acc;
                }, {} as Record<string, typeof userPermissionsData.userPermissions>)
              ).map(([module, perms]) => (
                <div key={module} className="border rounded-lg p-3">
                  <div className="font-semibold mb-2">{module}</div>
                  <div className="flex flex-wrap gap-2">
                    {perms.map((perm) => (
                      <Badge key={perm.id} variant="secondary">
                        {perm.action}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No permissions assigned
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Management Card */}
      <Card>
        <CardHeader>
          <CardTitle>Password Management</CardTitle>
          <CardDescription>Generate new password for user</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGeneratePassword} variant="outline">
            <Key className="mr-2 h-4 w-4" />
            Generate New Password
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            User will be required to change password on next login
          </p>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
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
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role *</Label>
                <Select
                  value={form.role}
                  onValueChange={(value) =>
                    setForm({ ...form, role: value as UserRole })
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
                  value={form.mdaId}
                  onValueChange={(value) => setForm({ ...form, mdaId: value })}
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
                value={form.status}
                onValueChange={(value) =>
                  setForm({ ...form, status: value as "active" | "inactive" })
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Management Dialog */}
      <Dialog open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
            <DialogDescription>
              Assign or remove permissions for {user.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <PermissionSelector
              selectedPermissionIds={selectedPermissionIds}
              onSelectionChange={setSelectedPermissionIds}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePermissions} disabled={isAssigningPermissions}>
              {isAssigningPermissions && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generated Password Dialog */}
      <Dialog open={isGeneratePasswordOpen} onOpenChange={setIsGeneratePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Generated</DialogTitle>
            <DialogDescription>
              A new password has been generated for {user.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label>Generated Password</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={generatedPassword || ""}
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (generatedPassword) {
                      navigator.clipboard.writeText(generatedPassword);
                      toast.success("Password copied to clipboard");
                    }
                  }}
                >
                  Copy
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                ⚠️ Save this password securely. User must change it on next login.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsGeneratePasswordOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
