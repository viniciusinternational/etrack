# E-Track Architecture Documentation

## Overview

E-Track is a comprehensive government performance and accountability platform built with Next.js 15, featuring role-based access control and a modern, responsive design.

## Project Structure

```
e-track/
├── app/                          # Next.js 15 App Router
│   ├── layout.tsx               # Root layout with MainLayout
│   ├── page.tsx                 # Landing page (role-based redirect)
│   ├── loading.tsx              # Global loading component
│   ├── error.tsx                # Global error component
│   ├── not-found.tsx            # 404 page
│   ├── dashboard/               # Shared dashboard entry
│   ├── governor/                # Governor role pages
│   │   ├── dashboard/page.tsx   # High-level analytics
│   │   └── reports/page.tsx     # Export reports
│   ├── project-manager/         # Project Manager role pages
│   │   ├── projects/            # Project management
│   │   │   ├── page.tsx         # Project list
│   │   │   ├── add/page.tsx     # Add project form
│   │   │   └── [id]/page.tsx    # Project details
│   │   └── submissions/         # Submission management
│   │       ├── page.tsx         # Review submissions
│   │       └── [id]/page.tsx    # Submission details
│   ├── contractor/              # Contractor role pages
│   │   └── projects/            # Assigned projects
│   │       ├── page.tsx         # Project list
│   │       ├── [id]/submit/     # Milestone submission
│   │       └── [id]/status/     # Track status
│   ├── pages/         # Finance Officer role pages
│   │   └── finance/             # Financial management
│   │       ├── dashboard/       # Budget overview
│   │       ├── budget/          # Upload budget
│   │       ├── expenditure/     # Upload expenditure
│   │       └── revenue/         # Upload revenue
│   ├── procurement-officer/     # Procurement Officer role pages
│   │   └── procurement/         # Procurement management
│   │       ├── dashboard/       # Procurement overview
│   │       ├── tenders/         # Tender management
│   │       └── awards/          # Award management
│   ├── auditor/                 # Auditor role pages
│   │   └── audit/               # Audit management
│   │       ├── dashboard/       # Cross-MDA analytics
│   │       └── discrepancies/   # Discrepancy reports
│   └── meeting-user/            # Meeting User role pages
│       └── meetings/            # Meeting management
│           ├── page.tsx         # Meeting dashboard
│           ├── schedule/        # Schedule meetings
│           └── archive/         # Meeting archive
├── components/                  # Reusable components
│   ├── layout/                  # Layout components
│   │   ├── MainLayout.tsx       # Main layout wrapper
│   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   └── Navbar.tsx           # Top navigation
│   └── ui/                      # UI components
│       ├── loading.tsx          # Loading states
│       └── error.tsx            # Error components
├── lib/                         # Utility libraries
│   ├── auth.ts                  # Authentication utilities
│   ├── permissions.ts           # Permission management
│   └── api.ts                   # API utilities
├── types/                       # TypeScript definitions
│   └── index.ts                 # Shared types
└── docs/                        # Documentation
    └── architecture.md          # This file
```

## Key Features

### 1. Role-Based Access Control

The platform supports 9 different user roles:

- **SuperAdmin**: Full system access
- **GovernorAdmin**: High-level analytics and reports
- **ProjectManager**: Project and submission management
- **Contractor**: Project execution and milestone submission
- **FinanceOfficer**: Budget and financial management
- **ProcurementOfficer**: Tender and procurement management
- **Auditor**: Cross-MDA audit and compliance
- **MeetingUser**: Meeting scheduling and management
- **Vendor**: Tender participation and award tracking

### 2. Responsive Layout System

- **MainLayout**: Combines sidebar, navbar, and content area
- **Sidebar**: Role-based navigation with collapsible design
- **Navbar**: Top navigation with user menu and notifications
- **Mobile Support**: Responsive design with mobile menu

### 3. Error Handling

- **Global Error Boundary**: Catches and displays application errors
- **Loading States**: Consistent loading indicators
- **404 Page**: Custom not found page
- **Error Components**: Reusable error display components

### 4. Authentication & Permissions

- **Mock Authentication**: Currently uses mock user data
- **Permission System**: Role-based permission checking
- **Route Protection**: Automatic redirect based on user role
- **Session Management**: User session handling

## Component Architecture

### Layout Components

#### MainLayout
- Wraps all pages with consistent layout
- Manages sidebar collapse state
- Handles mobile menu toggle
- Provides user context

#### Sidebar
- Role-based navigation items
- Collapsible design
- Active route highlighting
- Mobile-responsive

#### Navbar
- User profile menu
- Notifications
- Search functionality
- Mobile menu toggle

### UI Components

#### Loading Components
- `LoadingSpinner`: Animated spinner
- `LoadingPage`: Full-page loading state
- `LoadingCard`: Card skeleton loader
- `LoadingTable`: Table skeleton loader

#### Error Components
- `ErrorPage`: Full-page error display
- `ErrorCard`: Inline error display
- `ErrorBoundary`: React error boundary
- `NotFoundPage`: 404 error page

## Data Flow

1. **Authentication**: User role determines available routes
2. **Navigation**: Sidebar shows role-appropriate menu items
3. **Page Rendering**: Each role has dedicated dashboard and management pages
4. **State Management**: Local state for UI interactions
5. **API Integration**: Centralized API utilities for data fetching

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Design**: Mobile-first approach
- **Consistent Spacing**: Standardized padding and margins
- **Color Scheme**: Government-appropriate color palette
- **Typography**: Inter font family for readability

## Development Guidelines

### File Naming
- Use kebab-case for file names
- Use PascalCase for component names
- Use camelCase for utility functions

### Component Structure
- Export default for page components
- Use TypeScript interfaces for props
- Include JSDoc comments for complex components
- Follow Next.js 15 best practices

### State Management
- Use React hooks for local state
- Implement error boundaries for error handling
- Use loading states for async operations

## Future Enhancements

1. **Real Authentication**: Replace mock auth with real authentication
2. **Database Integration**: Connect to actual database
3. **Real-time Updates**: WebSocket integration for live updates
4. **File Upload**: Implement file upload functionality
5. **Advanced Charts**: Add interactive charts and graphs
6. **Mobile App**: React Native mobile application
7. **API Documentation**: Comprehensive API documentation
8. **Testing**: Unit and integration tests
9. **Performance**: Code splitting and optimization
10. **Accessibility**: WCAG compliance improvements

## Getting Started

1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Open browser to `http://localhost:3000`
4. The app will redirect based on the mock user role

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Font**: Inter (Google Fonts)
- **Build Tool**: Next.js built-in bundler
- **Package Manager**: npm
