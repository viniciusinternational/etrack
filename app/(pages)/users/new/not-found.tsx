import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Page Not Found</CardTitle>
            <CardDescription>
              The page you're looking for doesn't exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/users">Go back to users</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

