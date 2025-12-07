"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
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

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    }
  }, [user, router]);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!currentPassword) {
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

    if (!user?.id) {
      toast.error("User ID not found");
      return;
    }

    setIsChanging(true);
    try {
      const response = await fetch(`/api/users/${user.id}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
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
        
        // Redirect to dashboard
        router.push("/dashboard");
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

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 md:py-12 relative">
      {/* Banner Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/banner.png"
          alt="Kaduna State Government Banner"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-background/30 dark:bg-background/75" />
      </div>

      {/* Centered Card */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in duration-500">
        <Card className="border shadow-2xl bg-card/95 backdrop-blur-sm">
          {/* Logo Section */}
          <div className="flex justify-center pt-8 pb-6">
            <div className="relative w-24 h-24 md:w-28 md:h-28">
              <Image
                src="/logo.png"
                alt="Kaduna State Government Logo"
                fill
                className="object-contain"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>
          </div>

          <CardContent className="px-6 md:px-8 pb-8">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="flex justify-center mb-2">
                  <Lock className="h-8 w-8 text-kaduna-blue" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                  {user.mustChangePassword ? "Change Password Required" : "Change Password"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {user.mustChangePassword
                    ? "You must change your password before continuing."
                    : "Enter your current password and choose a new one."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-sm font-medium">
                    Current Password
                  </Label>
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
                      disabled={isChanging}
                      autoComplete="current-password"
                      aria-invalid={!!errors.currentPassword}
                      aria-describedby={errors.currentPassword ? "current-password-error" : undefined}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      disabled={isChanging}
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
                    <p
                      id="current-password-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {errors.currentPassword}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-sm font-medium">
                    New Password
                  </Label>
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
                      disabled={isChanging}
                      autoComplete="new-password"
                      aria-invalid={!!errors.newPassword}
                      aria-describedby={errors.newPassword ? "new-password-error" : undefined}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={isChanging}
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
                    <p
                      id="new-password-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium">
                    Confirm New Password
                  </Label>
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
                      disabled={isChanging}
                      autoComplete="new-password"
                      aria-invalid={!!errors.confirmPassword}
                      aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isChanging}
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
                    <p
                      id="confirm-password-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isChanging}
                  className="w-full bg-kaduna-blue hover:bg-kaduna-blue/90 text-white font-medium h-11 shadow-sm transition-all"
                >
                  {isChanging && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Change Password
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} Kaduna State Government. All rights
          reserved.
        </p>
      </div>
    </div>
  );
}

