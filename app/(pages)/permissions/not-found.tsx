import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function PermissionsNotFound() {
  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <FileQuestion className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Permissions Not Found</CardTitle>
          </div>
          <CardDescription>
            The permissions page you're looking for doesn't exist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/permissions">
            <Button className="w-full">Go to Permissions</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

