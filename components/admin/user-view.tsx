"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Edit } from "lucide-react";
import { User, UserRole, type UserFormData } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
import {
  useUser,
  useUserPermissionsJSON,
  useUpdateUserPermissionsJSON,
} from "@/hooks/use-users";
import { useAuditLogs } from "@/hooks/use-audit";
import {
  Loader2,
  Key,
  Shield,
  CheckCircle2,
  XCircle,
  Mail,
  Building,
  Phone,
  Calendar,
  User as UserIcon,
  Activity,
  ExternalLink,
} from "lucide-react";
import { PermissionsEditor } from "@/components/user/permissions-editor";
import type { PartialUserPermissions } from "@/types/permissions";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { toast } from "sonner";

export default function UserViewClient({ id }: { id: string }) {
  const router = useRouter();
  const { data: user, isLoading } = useUser(id);
  const { data: userPermissionsData, isLoading: isLoadingPermissions } =
    useUserPermissionsJSON(id);
  const { data: auditLogs, isLoading: isLoadingAudit } = useAuditLogs({
    actor: user?.id || "",
  });
  const { mutate: updatePermissions, isPending: isUpdatingPermissions } =
    useUpdateUserPermissionsJSON();
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isGeneratePasswordOpen, setIsGeneratePasswordOpen] = useState(false);
  const [permissions, setPermissions] = useState<PartialUserPermissions>({});
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (userPermissionsData?.permissions) {
      setPermissions(userPermissionsData.permissions);
    }
    console.log("logs in page user detail >>>>>> ", auditLogs);
  }, [userPermissionsData, auditLogs]);

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
      const { data } = await axios.post(
        `/api/users/${user.id}/generate-password`
      );
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

  const getActionBadge = (actionType: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      CREATE: "default",
      UPDATE: "secondary",
      DELETE: "destructive",
      VIEW: "outline",
      EXPORT: "outline",
      LOGIN: "outline",
      LOGOUT: "outline",
    };
    return (
      <Badge variant={variants[actionType] || "default"} className="text-xs">
        {actionType}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-xl font-semibold">User not found</h2>
        <Button onClick={() => router.push("/users")}>Back to Users</Button>
      </div>
    );
  }

  const recentAuditLogs = auditLogs?.slice(0, 10) || [];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>

        {/* User Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
          <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
            <AvatarImage src="" alt={`${user.firstname} ${user.lastname}`} />
            <AvatarFallback className="text-4xl font-bold bg-primary text-primary-foreground">
              {`${user.firstname?.[0] || ""}${
                user.lastname?.[0] || ""
              }`.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{`${user.firstname} ${user.lastname}`}</h1>
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="px-3 py-1 text-sm font-medium"
              >
                {user.role}
              </Badge>
              <Badge
                variant={user.status === "active" ? "default" : "destructive"}
                className="px-3 py-1 text-sm font-medium capitalize"
              >
                {user.status || "active"}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2 mb-2">
            <Button onClick={() => router.push(`/users/${user.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        <Separator />

        {/* 70/30 Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Left Column - 70% */}
          <div className="lg:col-span-7 space-y-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              {/* OVERVIEW TAB */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Information</CardTitle>
                    <CardDescription>
                      Complete user profile and organizational details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Info */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3">
                        <UserIcon className="h-4 w-4" />
                        Contact Information
                      </div>
                      <div className="space-y-3 pl-6">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Email Address
                          </div>
                          <div className="flex items-center gap-2 font-medium">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Organization */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3">
                        <Building className="h-4 w-4" />
                        Organization
                      </div>
                      <div className="space-y-3 pl-6">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Ministry / Department / Agency
                          </div>
                          <div className="font-medium">
                            {user.mdaName || "Not Assigned"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Activity - Full Width */}
                    <div className="space-y-4 md:col-span-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3">
                        <Calendar className="h-4 w-4" />
                        Activity Timeline
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Last Login
                          </div>
                          <div className="font-medium">
                            {user.lastLogin
                              ? new Date(user.lastLogin).toLocaleDateString()
                              : "Never"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Account Created
                          </div>
                          <div className="font-medium">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* PERMISSIONS TAB */}
              <TabsContent value="permissions" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">
                      Assigned Permissions
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      View and manage specific access rights for this user.
                    </p>
                  </div>
                  <Button onClick={() => setIsPermissionsOpen(true)}>
                    <Shield className="mr-2 h-4 w-4" />
                    Manage Permissions
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-6">
                    {isLoadingPermissions ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : userPermissionsData &&
                      userPermissionsData.permissions &&
                      Object.keys(userPermissionsData.permissions).length >
                        0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(
                          Object.entries(userPermissionsData.permissions)
                            .filter(([, enabled]) => enabled === true)
                            .reduce((acc, [key]) => {
                              const module = key.split("_").slice(1).join("_");
                              const action = key.split("_")[0];
                              if (!acc[module]) acc[module] = [];
                              acc[module].push({ key, action, module });
                              return acc;
                            }, {} as Record<string, Array<{ key: string; action: string; module: string }>>)
                        ).map(([module, perms]) => (
                          <div
                            key={module}
                            className="border rounded-lg p-4 bg-muted/20"
                          >
                            <div className="font-semibold mb-3 capitalize flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                              {module.replace("_", " ")}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {perms.map((perm) => (
                                <Badge
                                  key={perm.key}
                                  variant="secondary"
                                  className="capitalize border bg-background text-foreground/80 hover:bg-background"
                                >
                                  {perm.action}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <Shield className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-medium text-foreground">
                          No Permissions Assigned
                        </h3>
                        <p>
                          This user currently has no specific permissions
                          configured.
                        </p>
                        <Button
                          variant="link"
                          onClick={() => setIsPermissionsOpen(true)}
                          className="mt-2"
                        >
                          Assign Permissions
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* SECURITY TAB */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Password & Authentication
                    </CardTitle>
                    <CardDescription>
                      Manage password settings and status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                      <div className="space-y-1">
                        <span className="text-sm font-medium">
                          Password Status
                        </span>
                        <div className="text-xs text-muted-foreground">
                          Current state of user password
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.mustChangePassword ? (
                          <Badge
                            variant="destructive"
                            className="flex items-center gap-1"
                          >
                            <XCircle className="h-3 w-3" /> Must Change
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 border-green-500 text-green-600 bg-green-50 dark:bg-green-950/20"
                          >
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                      <div className="space-y-1">
                        <span className="text-sm font-medium">
                          Last Password Change
                        </span>
                        <div className="text-xs text-muted-foreground">
                          Date of last update
                        </div>
                      </div>
                      <div className="font-mono text-sm">
                        {user.passwordChangedAt
                          ? new Date(
                              user.passwordChangedAt
                            ).toLocaleDateString()
                          : "Never"}
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        onClick={handleGeneratePassword}
                        variant="outline"
                        className="w-full"
                      >
                        <Key className="mr-2 h-4 w-4" />
                        Generate New Password
                      </Button>
                      <p className="text-xs text-center text-muted-foreground mt-3">
                        This will create a temporary password that the user must
                        change upon next login.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - 30% - Audit Logs */}
          <div className="lg:col-span-3">
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Activity className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Last 10 audit logs
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingAudit ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : recentAuditLogs.length > 0 ? (
                  <>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                      {recentAuditLogs.map((log) => (
                        <div
                          key={log.id}
                          className="border rounded-lg p-3 bg-muted/20 hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            {getActionBadge(log.actionType)}
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-sm font-medium mb-1">
                            {log.entity}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {log.description}
                          </p>
                          {log.entityId && (
                            <div className="text-xs text-muted-foreground mt-1 font-mono">
                              ID: {log.entityId.substring(0, 8)}...
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() =>
                        router.push(
                          `/audit?actor=${encodeURIComponent(user.email)}`
                        )
                      }
                    >
                      Show All Activity
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <Activity className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Permissions Management Dialog */}
      <Dialog open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
            <DialogDescription>
              Assign or remove permissions for{" "}
              {`${user.firstname} ${user.lastname}`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <PermissionsEditor
              permissions={permissions}
              onPermissionsChange={setPermissions}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPermissionsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePermissions}
              disabled={isUpdatingPermissions}
            >
              {isUpdatingPermissions && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generated Password Dialog */}
      <Dialog
        open={isGeneratePasswordOpen}
        onOpenChange={setIsGeneratePasswordOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Generated</DialogTitle>
            <DialogDescription>
              A new password has been generated for{" "}
              {`${user.firstname} ${user.lastname}`}
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
            <Button onClick={() => setIsGeneratePasswordOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
