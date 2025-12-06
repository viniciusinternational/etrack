import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function LoginNotFound() {
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
            </div>
          </CardHeader>

          <CardContent className="pt-8 pb-8 px-6 md:px-8">
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">
                  Page Not Found
                </h2>
                <p className="text-sm text-muted-foreground">
                  The login page you're looking for doesn't exist
                </p>
              </div>
              <Link href="/login">
                <Button className="w-full bg-kaduna-blue hover:bg-kaduna-blue/90 text-white font-medium h-11 shadow-sm transition-all">
                  Go to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}