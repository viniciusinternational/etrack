"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { login } from "@/lib/api-auth";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loginWithToken } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await login(email, password);

      if (response.ok && response.data) {
        const { user, token } = response.data;

        // Store user and token in auth store
        loginWithToken(
          {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            mdaId: user.mdaId,
            mustChangePassword: user.mustChangePassword,
          },
          token
        );

        toast.success("Login successful");

        // Redirect based on mustChangePassword flag
        if (user.mustChangePassword) {
          router.push("/dashboard?changePassword=true");
        } else {
          router.push("/dashboard");
        }
      } else {
        setErrors({
          general: response.error || "Invalid email or password",
        });
        toast.error(response.error || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setErrors({
        general: error.message || "An error occurred during login",
      });
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 md:py-12 bg-gradient-to-br from-kaduna-blue-light/20 via-white to-kaduna-green-light/15">
      <div className="w-full max-w-[440px] animate-in fade-in duration-500">
        {/* Login Card */}
        <Card className="border shadow-xl shadow-black/5">
          {/* Header Section with Logo and Branding */}
          <CardHeader className="text-center space-y-6 pb-8 border-b">
            <div className="flex justify-center">
              <div className="relative w-20 h-20 md:w-24 md:h-24">
                <Image
                  src="/kaduna-logo.png"
                  alt="Kaduna State Government Logo"
                  fill
                  className="object-contain"
                  priority
                  onError={(e) => {
                    // Fallback if logo doesn't exist yet
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                Kaduna State Government
              </h1>
              <p className="text-lg md:text-xl font-semibold text-kaduna-blue">
                E-Track
              </p>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Government Performance & Accountability Platform
              </p>
            </div>
          </CardHeader>

          <CardContent className="pt-8 pb-8 px-6 md:px-8">
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-foreground">Sign In</h2>
                <p className="text-sm text-muted-foreground">
                  Enter your credentials to access your account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {errors.general && (
                  <div
                    className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md"
                    role="alert"
                    aria-live="polite"
                  >
                    {errors.general}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors({ ...errors, email: undefined });
                    }}
                    className={
                      errors.email
                        ? "border-destructive focus-visible:ring-destructive h-11"
                        : "focus-visible:ring-kaduna-blue h-11 transition-all"
                    }
                    disabled={isLoading}
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p
                      id="email-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors({ ...errors, password: undefined });
                      }}
                      className={
                        errors.password
                          ? "border-destructive focus-visible:ring-destructive pr-10 h-11"
                          : "focus-visible:ring-kaduna-blue pr-10 h-11 transition-all"
                      }
                      disabled={isLoading}
                      autoComplete="current-password"
                      aria-invalid={!!errors.password}
                      aria-describedby={
                        errors.password ? "password-error" : undefined
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p
                      id="password-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {errors.password}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-kaduna-blue hover:bg-kaduna-blue/90 text-white font-medium h-11 shadow-sm transition-all"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Signing in..." : "Sign In"}
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