import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 md:py-12 bg-gradient-to-br from-kaduna-blue-light/20 via-white to-kaduna-green-light/15">
      <div className="w-full max-w-[440px] animate-in fade-in duration-500">
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
                <Skeleton className="h-7 w-24 mx-auto" />
                <Skeleton className="h-4 w-64 mx-auto" />
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-11 w-full" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
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