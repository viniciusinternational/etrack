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
import { useUser, useUserPermissionsJSON, useUpdateUserPermissionsJSON } from "@/hooks/use-users";
import { Loader2, Key, Shield, CheckCircle2, XCircle } from "lucide-react";
import { PermissionsEditor } from "@/components/user/permissions-editor";
import type { PartialUserPermissions } from "@/types/permissions";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { toast } from "sonner";

export default function UserViewClient({ id }: { id: string }) {
  const router = useRouter();
  const { data: user, isLoading } = useUser(id);
  const { data: userPermissionsData, isLoading: isLoadingPermissions } = useUserPermissionsJSON(id);
  const { mutate: updatePermissions, isPending: isUpdatingPermissions } = useUpdateUserPermissionsJSON();
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isGeneratePasswordOpen, setIsGeneratePasswordOpen] = useState(false);
  const [permissions, setPermissions] = useState<PartialUserPermissions>({});
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  useEffect(() => {
    if (userPermissionsData?.permissions) {
      setPermissions(userPermissionsData.permissions);
    }
  }, [userPermissionsData]);

  function handleSavePermissions() {
    if (!user) return;
    updatePermissions(
      { userId: user.id, permissions },
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
          <Button variant="outline" onClick={() => router.push(`/users/${user.id}/edit`)}>
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
          ) : userPermissionsData && userPermissionsData.permissions ? (
            <div className="space-y-2">
              {Object.entries(
                Object.entries(userPermissionsData.permissions)
                  .filter(([, enabled]) => enabled === true)
                  .reduce((acc, [key]) => {
                    const module = key.split('_').slice(1).join('_');
                    const action = key.split('_')[0];
                    if (!acc[module]) acc[module] = [];
                    acc[module].push({ key, action, module });
                    return acc;
                  }, {} as Record<string, Array<{ key: string; action: string; module: string }>>)
              ).map(([module, perms]) => (
                <div key={module} className="border rounded-lg p-3">
                  <div className="font-semibold mb-2 capitalize">{module}</div>
                  <div className="flex flex-wrap gap-2">
                    {perms.map((perm) => (
                      <Badge key={perm.key} variant="secondary" className="capitalize">
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
            <PermissionsEditor
              permissions={permissions}
              onPermissionsChange={setPermissions}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePermissions} disabled={isUpdatingPermissions}>
              {isUpdatingPermissions && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
