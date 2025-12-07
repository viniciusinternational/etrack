"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserRole, type UserFormData } from "@/types";
import { useCreateUser, useUpdateUserPermissionsJSON } from "@/hooks/use-users";
import { useMDAs } from "@/hooks/use-mdas";
import { PermissionsEditor } from "@/components/user/permissions-editor";
import type { PartialUserPermissions } from "@/types/permissions";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function NewUserPage() {
  const { isChecking } = useAuthGuard(["create_user"]);
  const router = useRouter();
  const { data: mdasData } = useMDAs();
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updatePermissions, isPending: isUpdatingPermissions } =
    useUpdateUserPermissionsJSON();

  const mdas = mdasData || [];

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: UserRole.MeetingUser,
    mdaId: "",
    status: "active",
  });
  const [generatePassword, setGeneratePassword] = useState(false);
  const [permissions, setPermissions] = useState<PartialUserPermissions>({});
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.mdaId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newUser: any = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      mdaId: formData.mdaId,
      status: formData.status,
      generatePassword,
    };

    createUser(newUser, {
      onSuccess: async (data: any) => {
        setCreatedUserId(data.id);
        
        // If password was generated, show it in a dialog
        if (generatePassword && data?.generatedPassword) {
          setGeneratedPassword(data.generatedPassword);
          setShowPasswordDialog(true);
        }

        // Update permissions if any are set
        if (Object.keys(permissions).length > 0) {
          updatePermissions(
            { userId: data.id, permissions },
            {
              onSuccess: () => {
                if (!generatePassword || !data?.generatedPassword) {
                  toast.success("User created successfully");
                  router.push(`/users/${data.id}`);
                }
              },
              onError: () => {
                toast.error("User created but failed to update permissions");
                router.push(`/users/${data.id}`);
              },
            }
          );
        } else {
          if (!generatePassword || !data?.generatedPassword) {
            toast.success("User created successfully");
            router.push(`/users/${data.id}`);
          }
        }
      },
      onError: (error: any) => {
        console.error("Failed to create user:", error);
        toast.error(
          error?.response?.data?.error || "Failed to create user. Please try again."
        );
      },
    });
  };

  const [createdUserId, setCreatedUserId] = useState<string | null>(null);

  const handlePasswordDialogClose = () => {
    setShowPasswordDialog(false);
    if (generatedPassword && createdUserId) {
      router.push(`/users/${createdUserId}`);
    }
  };

  if (isChecking) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/users")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create New User</h1>
            <p className="text-muted-foreground mt-1">
              Add a new user account with appropriate role and permissions
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the user's name and email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter full name"
                    required
                  />
                </div>
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
                Assign the user's role and MDA affiliation
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
                Set the initial status for this user account
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

          {/* Password Options */}
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Choose how to handle the user's initial password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="generate-password"
                  checked={generatePassword}
                  onCheckedChange={(checked) =>
                    setGeneratePassword(checked as boolean)
                  }
                />
                <Label
                  htmlFor="generate-password"
                  className="font-normal cursor-pointer"
                >
                  Generate password automatically (user must change on first login)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                Assign specific permissions to this user (optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PermissionsEditor
                permissions={permissions}
                onPermissionsChange={setPermissions}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/users")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || isUpdatingPermissions}>
              {(isCreating || isUpdatingPermissions) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create User
            </Button>
          </div>
        </form>

        {/* Generated Password Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Password Generated</DialogTitle>
              <DialogDescription>
                A new password has been generated for this user. Please save it
                securely.
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
                  ⚠️ Save this password securely. User must change it on next
                  login.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handlePasswordDialogClose}>Continue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

