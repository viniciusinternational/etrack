"use client";

import { useRouter } from "next/navigation";
import { ErrorPage } from "@/components/ui/error";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleDashboard = () => {
    router.push("/dashboard");
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="text-center max-w-md w-full">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
          <ShieldX className="h-8 w-8 text-orange-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Unauthorized Access</h1>
        <p className="mb-6 text-gray-600">
          You are not authorized to access this resource. Please ensure you are logged in with the correct account.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button onClick={handleGoBack} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button onClick={handleDashboard} className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

