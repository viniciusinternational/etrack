"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function ResetPasswordNotFound() {
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
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">
                  Page Not Found
                </h2>
                <p className="text-sm text-muted-foreground">
                  The reset password page you're looking for doesn't exist
                </p>
              </div>
              <div className="space-y-2">
                <Link href="/auth/resetpassword">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-11 shadow-sm transition-all">
                    Go to Reset Password
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full font-medium h-11">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

