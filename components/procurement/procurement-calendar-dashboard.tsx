"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatCurrency,
  formatDate,
  getProcurementStatusConfig,
} from "./utils";
import { MOCK_PROCUREMENT_REQUESTS, MOCK_AWARDS } from "./constants";

export function ProcurementCalendarDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 9, 23));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const stats = useMemo(() => {
    const total = MOCK_PROCUREMENT_REQUESTS.length;
    const open = MOCK_PROCUREMENT_REQUESTS.filter(
      (p) => p.status === "Open"
    ).length;
    const bidding = MOCK_PROCUREMENT_REQUESTS.filter(
      (p) => p.status === "Bidding"
    ).length;
    const awarded = MOCK_AWARDS.length;
    const totalValue = MOCK_PROCUREMENT_REQUESTS.reduce(
      (sum, p) => sum + p.estimatedCost,
      0
    );
    return { total, open, bidding, awarded, totalValue };
  }, []);

  const getEventsForDate = (date: Date) => {
    return MOCK_PROCUREMENT_REQUESTS.filter((p) => {
      const pDate = new Date(p.requestDate);
      return (
        pDate.getDate() === date.getDate() &&
        pDate.getMonth() === date.getMonth() &&
        pDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const monthDays = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const calendarDays = Array.from({ length: monthDays }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Procurement Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of procurement activities and timeline
          </p>
        </div>
        <Link href="/tenders/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Tender
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tenders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {stats.total}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.open}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bidding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {stats.bidding}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Awarded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats.awarded}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.totalValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Procurement Calendar</CardTitle>
              <div className="flex items-center gap-2">
                <Tabs
                  value={viewMode}
                  onValueChange={(value) =>
                    setViewMode(value as "month" | "week" | "day")
                  }
                >
                  <TabsList>
                    <TabsTrigger value="month">Month</TabsTrigger>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="day">Day</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleToday}
                  className="min-w-32 bg-transparent"
                >
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="text-lg font-semibold">{monthName}</h2>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-sm text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty days */}
              {emptyDays.map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Calendar days */}
              {calendarDays.map((day) => {
                const date = new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  day
                );
                const dayEvents = getEventsForDate(date);
                const isToday =
                  date.toDateString() === new Date().toDateString();
                const isSelected =
                  selectedDate?.toDateString() === date.toDateString();

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square border rounded-lg p-2 cursor-pointer transition-colors ${
                      isToday
                        ? "bg-primary text-primary-foreground border-primary"
                        : isSelected
                        ? "bg-accent border-accent"
                        : "bg-card border-border hover:bg-muted"
                    }`}
                  >
                    <div className="text-sm font-semibold mb-1">{day}</div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => {
                        const statusConfig = getProcurementStatusConfig(
                          event.status
                        );
                        return (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded cursor-pointer truncate ${statusConfig.color}`}
                          >
                            {event.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground px-1">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate ? formatDate(selectedDate) : "Select a date"}
            </CardTitle>
            <CardDescription>
              {selectedDateEvents.length} event
              {selectedDateEvents.length !== 1 ? "s" : ""} on this date
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No events on this date
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => {
                  const statusConfig = getProcurementStatusConfig(event.status);
                  return (
                    <Link key={event.id} href={`/tenders/${event.id}`}>
                      <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-foreground text-sm">
                            {event.title}
                          </h3>
                          <Badge className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {event.mda?.name}
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {formatCurrency(event.estimatedCost)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Tenders */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Tenders</CardTitle>
          <CardDescription>Latest procurement requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {MOCK_PROCUREMENT_REQUESTS.slice(0, 3).map((tender) => {
              const statusConfig = getProcurementStatusConfig(tender.status);
              return (
                <Link key={tender.id} href={`/tenders/${tender.id}`}>
                  <div className="flex justify-between items-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {tender.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {tender.mda?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {formatCurrency(tender.estimatedCost)}
                      </p>
                      <Badge className={statusConfig.color}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
