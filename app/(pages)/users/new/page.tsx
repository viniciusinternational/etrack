"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2, Copy, Eye, EyeOff } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserRole, type UserFormData } from "@/types";
import { useCreateUser, useUpdateUserPermissionsJSON } from "@/hooks/use-users";
import { useMDAs } from "@/hooks/use-mdas";
import { PermissionsEditor } from "@/components/user/permissions-editor";
import type { PartialUserPermissions } from "@/types/permissions";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

export default function NewUserPage() {
  const { isChecking } = useAuthGuard(["create_user"]);
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
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
  const [suggestedPermissions, setSuggestedPermissions] = useState<string[]>([]);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showPermissionList, setShowPermissionList] = useState(false);
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);

  // Helper to format permission names
  const formatPermissionName = (perm: string) => {
    return perm.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Handle password generation
  useEffect(() => {
    if (generatePassword) {
      // Generate a random password on client side so user can see it immediately
      const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
      let retVal = "";
      for (let i = 0, n = charset.length; i < 12; ++i) {
          retVal += charset.charAt(Math.floor(Math.random() * n));
      }
      setGeneratedPassword(retVal);
    } else {
      setGeneratedPassword(null);
    }
  }, [generatePassword]);

  // Load suggested permissions when role changes
  useEffect(() => {
    const loadRolePermissions = async () => {
      if (!formData.role || !currentUser?.id) return;
      
      setIsLoadingTemplate(true);
      try {
        // Fetch role permission template from your API with authentication
        const response = await fetch(`/api/role-permission-templates?role=${formData.role}`, {
          headers: {
            'x-user-id': currentUser.id,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.ok && data.data && data.data.permissions) {
            const templatePermissions = Array.isArray(data.data.permissions) 
              ? data.data.permissions 
              : [];
            
            setSuggestedPermissions(templatePermissions);
            
            // Auto-apply suggested permissions
            const newPermissions: PartialUserPermissions = {};
            templatePermissions.forEach((perm: string) => {
              // Type assertion to ensure perm is treated as a valid key
              newPermissions[perm as keyof PartialUserPermissions] = true;
            });
            setPermissions(newPermissions);
            
            if (templatePermissions.length > 0) {
              toast.success(`Applied ${templatePermissions.length} suggested permissions for ${formData.role}`);
            }
          } else {
            setSuggestedPermissions([]);
            setPermissions({});
          }
        } else {
          console.warn("No permission template found for role:", formData.role);
          setSuggestedPermissions([]);
        }
      } catch (error) {
        console.error("Failed to load role permissions:", error);
        toast.error("Could not load suggested permissions for this role");
        setSuggestedPermissions([]);
      } finally {
        setIsLoadingTemplate(false);
      }
    };

    loadRolePermissions();
  }, [formData.role, currentUser?.id]);

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
      // If we generated a password client-side, send it as the password
      password: generatePassword ? generatedPassword : undefined,
      // We handle generation client-side now, so tell backend NOT to generate
      generatePassword: false, 
      // But we still want to enforce password change
      mustChangePassword: generatePassword,
    };

    createUser(newUser, {
      onSuccess: async (data: any) => {
        setCreatedUserId(data.id);
        
        // Show dialog if we generated a password (even though it's already visible in form)
        // This acts as a confirmation/reminder
        if (generatePassword && generatedPassword) {
          setShowPasswordDialog(true);
        }

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

  const selectedPermissionsCount = Object.values(permissions).filter(v => v === true).length;

  return (
    <div className="min-h-screen bg-muted/40 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/users")}
            className="hover:bg-gray-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
            <p className="text-gray-600 mt-1">
              Add a new user account with appropriate role and permissions
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* User Information */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="text-foreground">User Information</CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter the user's basic details, role, and organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 bg-card">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 font-medium">
                    Full Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter full name"
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email Address <span className="text-red-600">*</span>
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
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Role & MDA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-gray-700 font-medium">
                    Role <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role: value as UserRole })
                    }
                  >
                    <SelectTrigger className="w-full border-gray-300 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                      {Object.values(UserRole).map((role) => (
                        <SelectItem 
                          key={role} 
                          value={role}
                          className="hover:bg-gray-100 cursor-pointer bg-white focus:bg-gray-100"
                        >
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isLoadingTemplate && (
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading suggested permissions...
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mda" className="text-gray-700 font-medium">
                    MDA <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={formData.mdaId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, mdaId: value })
                    }
                  >
                    <SelectTrigger className="w-full border-gray-300 bg-white">
                      <SelectValue placeholder="Select MDA" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                      {mdas.map((mda) => (
                        <SelectItem 
                          key={mda.id} 
                          value={mda.id}
                          className="hover:bg-gray-100 cursor-pointer bg-white focus:bg-gray-100"
                        >
                          {mda.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="text-foreground">Account Settings</CardTitle>
              <CardDescription className="text-muted-foreground">
                Configure account status and password options
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 bg-card">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Status */}
                <div className="space-y-3">
                  <Label className="text-gray-700 font-medium">Account Status</Label>
                  <RadioGroup
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        status: value as "active" | "inactive",
                      })
                    }
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="active" id="status-active" />
                      <Label
                        htmlFor="status-active"
                        className="font-normal cursor-pointer flex-1"
                      >
                        Active - User can log in
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="inactive" id="status-inactive" />
                      <Label
                        htmlFor="status-inactive"
                        className="font-normal cursor-pointer flex-1"
                      >
                        Inactive - User cannot log in
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Password Options */}
                <div className="space-y-3">
                  <Label className="text-gray-700 font-medium">Password</Label>
                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200">
                    <Checkbox
                      id="generate-password"
                      checked={generatePassword}
                      onCheckedChange={(checked) =>
                        setGeneratePassword(checked as boolean)
                      }
                      className="mt-1"
                    />
                    <Label
                      htmlFor="generate-password"
                      className="font-normal cursor-pointer flex-1"
                    >
                      Generate password automatically (user must change on first login)
                    </Label>
                  </div>
                  
                  {/* Show password field after generation */}
                  {generatePassword && generatedPassword && (
                    <div className="space-y-2">
                      <Label htmlFor="generated-password" className="text-gray-700 font-medium">
                        Generated Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="generated-password"
                          value={generatedPassword}
                          readOnly
                          className="font-mono bg-muted pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (generatedPassword) {
                              navigator.clipboard.writeText(generatedPassword);
                              toast.success("Password copied to clipboard");
                            }
                          }}
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-200"
                        >
                          <Copy className="h-4 w-4 text-gray-600" />
                        </Button>
                      </div>
                      <p className="text-xs text-accent-foreground bg-accent/20 p-2 rounded-md border border-accent/40">
                        ⚠️ Save this password securely. User must change it on next login.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="text-foreground flex items-center justify-between">
                <span>Permissions</span>
                {selectedPermissionsCount > 0 && (
                  <span className="text-sm font-normal text-primary">
                    {selectedPermissionsCount} selected
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {suggestedPermissions.length > 0 
                  ? `${suggestedPermissions.length} suggested permissions for ${formData.role} role have been pre-selected. You can modify them as needed.`
                  : "Assign specific permissions to this user (optional)"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 bg-card">
              {suggestedPermissions.length > 0 && (
                <div className="mb-4 space-y-2">
                  <Alert className="bg-secondary/10 border-secondary/20">
                    <CheckCircle2 className="h-4 w-4 text-secondary" />
                    <AlertDescription className="text-secondary flex items-center justify-between w-full">
                      <span>
                        <span className="font-medium">Auto-applied permissions</span> based on the {formData.role} role. Review and adjust below.
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPermissionList(!showPermissionList)}
                        className="h-6 w-6 p-0 hover:bg-secondary/20 text-secondary"
                        title={showPermissionList ? "Hide permissions list" : "Show permissions list"}
                      >
                        {showPermissionList ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDescription>
                  </Alert>
                  
                  {showPermissionList && (
                    <div className="bg-secondary/5 border border-secondary/10 rounded-md p-3 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                      <p className="font-medium text-secondary mb-2">Auto-selected permissions:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {suggestedPermissions.map((perm) => (
                          <div key={perm} className="flex items-center gap-2 text-secondary bg-background px-2 py-1 rounded border border-secondary/20 text-xs font-medium">
                            <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                            {formatPermissionName(perm)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <PermissionsEditor
                permissions={permissions}
                onPermissionsChange={setPermissions}
                disabled={isLoadingTemplate}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 bg-white p-6 rounded-lg shadow-sm">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/users")}
              className="border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isCreating || isUpdatingPermissions}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {(isCreating || isUpdatingPermissions) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create User
            </Button>
          </div>
        </div>

        {/* Generated Password Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent className="bg-white">
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
                    className="font-mono bg-gray-50"
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
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                  ⚠️ Save this password securely. User must change it on next
                  login.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handlePasswordDialogClose} className="bg-blue-600 hover:bg-blue-700">
                Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}