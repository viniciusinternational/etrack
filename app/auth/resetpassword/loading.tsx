"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResetPasswordLoading() {
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
                <Skeleton className="h-8 w-32 mx-auto" />
                <Skeleton className="h-4 w-64 mx-auto" />
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-11 w-full" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-11 w-full" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-11 w-full" />
                </div>

                <Skeleton className="h-11 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Skeleton */}
        <div className="text-center mt-6">
          <Skeleton className="h-3 w-64 mx-auto" />
        </div>
      </div>
    </div>
  );
}

