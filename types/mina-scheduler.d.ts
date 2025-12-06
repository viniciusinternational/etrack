declare module "mina-scheduler" {
  import * as React from "react";

  export interface Event {
    id: string;
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    variant?:
      | "primary"
      | "secondary"
      | "success"
      | "warning"
      | "destructive"
      | string;
    [key: string]: string | Date | number | boolean | undefined; // Allow additional properties
  }

  export interface SchedulerProviderProps {
    children: React.ReactNode;
    initialState?: Event[];
    defaultDate?: Date;
    weekStartsOn?: "sunday" | "monday";
  }

  export interface ClassNames {
    buttons?: {
      addEvent?: string;
      next?: string;
      prev?: string;
    };
    tabs?: {
      panel?: string;
    };
    [key: string]: string | Record<string, string> | undefined;
  }

  export interface CustomComponents {
    customButtons?: {
      CustomAddEventButton?: React.ReactNode;
      CustomPrevButton?: React.ReactNode;
      CustomNextButton?: React.ReactNode;
    };
    customTabs?: {
      CustomDayTab?: React.ReactNode;
      CustomWeekTab?: React.ReactNode;
      CustomMonthTab?: React.ReactNode;
    };
    CustomEventComponent?: React.ComponentType<{ event: Event }>;
    CustomEventModal?: {
      CustomAddEventModal?: {
        title?: string;
        CustomForm?: React.ComponentType<Record<string, unknown>>;
      };
      CustomEditEventModal?: {
        title?: string;
        CustomForm?: React.ComponentType<Record<string, unknown>>;
      };
    };
  }

  export interface ViewsSelector {
    views?: ("day" | "week" | "month")[];
    mobileViews?: ("day" | "week" | "month")[];
  }

  export interface SchedularViewProps {
    classNames?: ClassNames;
    CustomComponents?: CustomComponents;
    views?: ViewsSelector;
    onEventClick?: (event: Event) => void;
  }

  export const SchedulerProvider: React.FC<SchedulerProviderProps>;
  export const SchedularView: React.FC<SchedularViewProps>;

  export function useScheduler(): {
    events: Event[];
    addEvent: (event: Event) => void;
    updateEvent: (id: string, event: Partial<Event>) => void;
    deleteEvent: (id: string) => void;
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
  };

  export const eventSchema: Record<string, unknown>;
  export const variants: string[];
}
