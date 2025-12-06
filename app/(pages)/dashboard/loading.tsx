import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DashboardPanel } from "@/components/dashboard/DashboardPanel";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <header className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96" />
      </header>

      {/* KPI Cards Row */}
      <section className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-20 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Primary Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* User Distribution by Role */}
        <DashboardPanel
          title="Users by Role"
          description="Distribution of users across different system roles"
        >
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Skeleton className="w-24 h-2 rounded-full" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-3 w-10" />
                </div>
              </div>
            ))}
          </div>
        </DashboardPanel>

        {/* Recent Activity */}
        <DashboardPanel
          title="Recent Users"
          description="Latest user registrations and activity"
        >
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg"
              >
                <Skeleton className="h-2 w-2 rounded-full mt-2" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </div>

      {/* Quick Actions */}
      <DashboardPanel
        title="Quick Actions"
        description="Frequently used administrative tasks"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </DashboardPanel>

      {/* System Health */}
      <DashboardPanel
        title="System Health"
        description="Current system performance and status metrics"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center p-6 rounded-xl border">
              <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
              <Skeleton className="h-8 w-16 mx-auto mb-1" />
              <Skeleton className="h-4 w-24 mx-auto mb-1" />
              <Skeleton className="h-3 w-32 mx-auto" />
            </div>
          ))}
        </div>
      </DashboardPanel>
    </div>
  );
}

