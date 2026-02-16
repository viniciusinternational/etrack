"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Circle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FinancialEvent {
  id: string;
  title: string;
  date: Date;
  type: "expenditure" | "revenue" | "budget";
  amount: number;
  status: "pending" | "approved" | "completed" | "rejected";
  description?: string;
  mda?: string;
}

const initialMockEvents: FinancialEvent[] = [
  {
    id: "1",
    title: "Infrastructure Project Expenditure",
    date: new Date(2024, 9, 23),
    type: "expenditure",
    amount: 50000,
    status: "approved",
    mda: "Ministry of Works",
    description: "Payment for construction materials",
  },
  {
    id: "2",
    title: "Q4 Budget Allocation",
    date: new Date(2024, 9, 26),
    type: "budget",
    amount: 500000,
    status: "completed",
    mda: "Ministry of Health",
    description: "Q4 2024 budget allocation",
  },
  {
    id: "3",
    title: "Tax Revenue Collection",
    date: new Date(2024, 9, 28),
    type: "revenue",
    amount: 150000,
    status: "completed",
    mda: "Ministry of Finance",
    description: "Monthly tax revenue",
  },
  {
    id: "4",
    title: "Healthcare Equipment Purchase",
    date: new Date(2024, 10, 1),
    type: "expenditure",
    amount: 75000,
    status: "pending",
    mda: "Ministry of Health",
    description: "Medical equipment procurement",
  },
  {
    id: "5",
    title: "Education Sector Budget",
    date: new Date(2024, 9, 25),
    type: "budget",
    amount: 300000,
    status: "approved",
    mda: "Ministry of Education",
    description: "Education sector allocation",
  },
];

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: Circle,
  },
  approved: {
    label: "Approved",
    color: "bg-blue-100 text-blue-800",
    icon: CheckCircle2,
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800",
    icon: AlertCircle,
  },
};

const typeConfig = {
  expenditure: { label: "Expenditure", color: "bg-red-50 border-red-200" },
  revenue: { label: "Revenue", color: "bg-green-50 border-green-200" },
  budget: { label: "Budget", color: "bg-blue-50 border-blue-200" },
};

export function FinanceCalendarDashboard() {
  const [events, setEvents] = useState<FinancialEvent[]>(initialMockEvents);
  const [currentDate, setCurrentDate] = useState(new Date(2024, 9, 23));
  const [selectedEvent, setSelectedEvent] = useState<FinancialEvent | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const [formData, setFormData] = useState<{
    title: string;
    type: "expenditure" | "revenue" | "budget";
    amount: string;
    date: string;
    status: "pending" | "approved" | "completed" | "rejected";
    mda: string;
    description: string;
  }>({
    title: "",
    type: "expenditure",
    amount: "",
    date: "",
    status: "pending",
    mda: "",
    description: "",
  });

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    );
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

  const handleCreateEvent = () => {
    if (!formData.title || !formData.date || !formData.amount) {
      alert("Please fill in all required fields");
      return;
    }

    const newEvent: FinancialEvent = {
      id: Date.now().toString(),
      title: formData.title,
      date: new Date(formData.date),
      type: formData.type,
      amount: Number.parseFloat(formData.amount),
      status: formData.status,
      mda: formData.mda,
      description: formData.description,
    };

    setEvents([...events, newEvent]);
    setFormData({
      title: "",
      type: "expenditure",
      amount: "",
      date: "",
      status: "pending",
      mda: "",
      description: "",
    });
    setIsCreateDialogOpen(false);
  };

  const handleEditEvent = () => {
    if (
      !selectedEvent ||
      !formData.title ||
      !formData.date ||
      !formData.amount
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const updatedEvents = events.map((event) =>
      event.id === selectedEvent.id
        ? {
            ...event,
            title: formData.title,
            date: new Date(formData.date),
            type: formData.type,
            amount: Number.parseFloat(formData.amount),
            status: formData.status,
            mda: formData.mda,
            description: formData.description,
          }
        : event
    );

    setEvents(updatedEvents);
    setSelectedEvent(null);
    setFormData({
      title: "",
      type: "expenditure",
      amount: "",
      date: "",
      status: "pending",
      mda: "",
      description: "",
    });
    setIsEditDialogOpen(false);
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    setEvents(events.filter((event) => event.id !== selectedEvent.id));
    setSelectedEvent(null);
    setIsDeleteAlertOpen(false);
  };

  const openEditDialog = () => {
    if (!selectedEvent) return;
    setFormData({
      title: selectedEvent.title,
      type: selectedEvent.type,
      amount: selectedEvent.amount.toString(),
      date: selectedEvent.date.toISOString().split("T")[0],
      status: selectedEvent.status,
      mda: selectedEvent.mda || "",
      description: selectedEvent.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Finance Calendar
          </h1>
          <p className="text-muted-foreground">
            Track budget allocations, expenditures, and revenue
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
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
            <h2 className="text-xl font-semibold ml-4 min-w-48">{monthName}</h2>
          </div>

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

            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Financial Event</DialogTitle>
                  <DialogDescription>
                    Add a new financial transaction
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter event title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          type: value as "expenditure" | "revenue" | "budget",
                        })
                      }
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expenditure">Expenditure</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="budget">Budget</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Amount (NGN)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          status: value as
                            | "pending"
                            | "approved"
                            | "completed"
                            | "rejected",
                        })
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="mda">MDA</Label>
                    <Input
                      id="mda"
                      placeholder="Enter MDA name"
                      value={formData.mda}
                      onChange={(e) =>
                        setFormData({ ...formData, mda: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Event description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button className="w-full" onClick={handleCreateEvent}>
                    Create Event
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center font-semibold text-sm text-muted-foreground py-2"
                      >
                        {day}
                      </div>
                    )
                  )}
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

                    return (
                      <div
                        key={day}
                        className={`aspect-square border rounded-lg p-2 cursor-pointer transition-colors ${
                          isToday
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border hover:bg-muted"
                        }`}
                      >
                        <div className="text-sm font-semibold mb-1">{day}</div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => {
                            const config = statusConfig[event.status];
                            return (
                              <div
                                key={event.id}
                                onClick={() => setSelectedEvent(event)}
                                className={`text-xs p-1 rounded cursor-pointer truncate ${config.color}`}
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
          </div>

          {/* Sidebar - Event Details */}
          <div className="space-y-4">
            {selectedEvent ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedEvent.title}
                  </CardTitle>
                  <CardDescription>{selectedEvent.mda}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Badge className={statusConfig[selectedEvent.status].color}>
                      {statusConfig[selectedEvent.status].label}
                    </Badge>
                    <Badge variant="outline">
                      {typeConfig[selectedEvent.type].label}
                    </Badge>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>${selectedEvent.amount.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{selectedEvent.date.toLocaleDateString()}</span>
                    </div>

                    {selectedEvent.description && (
                      <div className="pt-2 border-t">
                        <p className="text-foreground">
                          {selectedEvent.description}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      size="sm"
                      onClick={openEditDialog}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      size="sm"
                      onClick={() => setIsDeleteAlertOpen(true)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <p>Select an event to view details</p>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/expenditure" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    Record Expenditure
                  </Button>
                </Link>
                <Link href="/revenue" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    Record Revenue
                  </Button>
                </Link>
                <Link href="/budget" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    Upload Budget
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {events
                  .filter((event) => event.date >= currentDate)
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .slice(0, 5)
                  .map((event) => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium truncate">
                          {event.title}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {event.date.toLocaleDateString("default", {
                            month: "short",
                            day: "numeric",
                          })}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ${event.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update the financial event details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="Enter event title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    type: value as "expenditure" | "revenue" | "budget",
                  })
                }
              >
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expenditure">Expenditure</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="budget">Budget</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-amount">Amount (NGN)</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as
                      | "pending"
                      | "approved"
                      | "completed"
                      | "rejected",
                  })
                }
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleEditEvent}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
