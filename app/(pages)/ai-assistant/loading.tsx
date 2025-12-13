import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AIAssistantLoading() {
  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Page Header */}
      <header className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96" />
      </header>

      {/* Chat Area Skeleton */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-4"
            >
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
        <div className="p-4 border-t">
          <Skeleton className="h-12 w-full" />
        </div>
      </Card>
    </div>
  );
}

