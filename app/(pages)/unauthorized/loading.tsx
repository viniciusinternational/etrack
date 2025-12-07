import { Skeleton } from "@/components/ui/skeleton";

export default function UnauthorizedLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="text-center max-w-md w-full">
        <Skeleton className="mx-auto mb-4 h-16 w-16 rounded-full" />
        <Skeleton className="mb-2 h-8 w-64 mx-auto" />
        <Skeleton className="mb-6 h-4 w-full" />
        <Skeleton className="mb-2 h-4 w-3/4 mx-auto" />
        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
          <Skeleton className="h-10 w-32 mx-auto sm:mx-0" />
          <Skeleton className="h-10 w-40 mx-auto sm:mx-0" />
        </div>
      </div>
    </div>
  );
}

