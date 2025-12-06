"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";

interface ChangePasswordDialogProps {
  open: boolean;
  userId?: string; // Optional, will use auth store if not provided
  onSuccess?: () => void;
  onCancel?: () => void;
  forceChange?: boolean; // If true, user cannot cancel
}

export function ChangePasswordDialog({
  open,
  userId: propUserId,
  onSuccess,
  onCancel,
  forceChange = false,
}: ChangePasswordDialogProps) {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const userId = propUserId || user?.id || "";
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!forceChange && !currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (currentPassword === newPassword) {
      newErrors.newPassword = "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    setIsChanging(true);
    try {
      // Use fetch directly to call the API endpoint
      const response = await fetch(`/api/users/${userId}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: forceChange ? undefined : currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        toast.success("Password changed successfully");
        
        // Update auth store to clear mustChangePassword flag
        updateUser({ mustChangePassword: false });
        
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setErrors({});
        
        // If this was a forced change, redirect to dashboard
        if (forceChange) {
          router.push("/dashboard");
        }
        
        onSuccess?.();
      } else {
        toast.error(data.error || "Failed to change password");
      }
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsChanging(false);
    }
  };

  const handleCancel = () => {
    if (forceChange) {
      toast.error("You must change your password to continue");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
    onCancel?.();
  };

  return (
    <Dialog open={open} onOpenChange={forceChange ? undefined : handleCancel}>
      <DialogContent
        className="sm:max-w-md border shadow-xl shadow-black/5"
        onEscapeKeyDown={forceChange ? (e) => e.preventDefault() : undefined}
      >
        <DialogHeader className="pb-4 border-b space-y-2">
          <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
            {forceChange ? "Change Password Required" : "Change Password"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {forceChange
              ? "You must change your password before continuing."
              : "Enter your current password and choose a new one."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-6">
            {!forceChange && (
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      setErrors({ ...errors, currentPassword: undefined });
                    }}
                    className={
                      errors.currentPassword
                        ? "border-destructive focus-visible:ring-destructive pr-10 h-11"
                        : "focus-visible:ring-kaduna-blue pr-10 h-11 transition-all"
                    }
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    aria-label={
                      showCurrentPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.currentPassword && (
                  <p className="text-sm text-destructive">{errors.currentPassword}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setErrors({ ...errors, newPassword: undefined });
                  }}
                    className={
                      errors.newPassword
                        ? "border-destructive focus-visible:ring-destructive pr-10 h-11"
                        : "focus-visible:ring-kaduna-blue pr-10 h-11 transition-all"
                    }
                    placeholder="Enter new password (min. 8 characters)"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-destructive">{errors.newPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors({ ...errors, confirmPassword: undefined });
                  }}
                    className={
                      errors.confirmPassword
                        ? "border-destructive focus-visible:ring-destructive pr-10 h-11"
                        : "focus-visible:ring-kaduna-blue pr-10 h-11 transition-all"
                    }
                    placeholder="Confirm new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            {!forceChange && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isChanging}
              className="bg-kaduna-blue hover:bg-kaduna-blue/90 text-white font-medium h-11 shadow-sm transition-all"
            >
              {isChanging && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

