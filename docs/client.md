# 📂 Next.js 15 Folder Structure for User Pages
# Organized by role-based pages

app/
  layout.tsx                # Root layout
  page.tsx                  # Landing page (login/overview)

  dashboard/
    page.tsx                # Shared dashboard entry (role-based redirect)

  governor/
    dashboard/page.tsx      # High-level analytics, KPIs, exports
    reports/page.tsx        # Export reports (PDF, Excel, CSV)

  project-manager/
    projects/
      page.tsx              # Project list (MDA-specific)
      add/page.tsx          # Add new project form
      [id]/page.tsx         # Project details (with milestones, timeline)
    submissions/
      page.tsx              # Review contractor submissions
      [id]/page.tsx         # Submission detail + approve/reject

  contractor/
    projects/
      page.tsx              # Assigned projects list
      [id]/submit/page.tsx  # Milestone submission form
      [id]/status/page.tsx  # Track submission status

  pages/
    finance/
      dashboard/page.tsx    # Budget vs expenditure overview (MDA-specific)
      budget/page.tsx       # Upload budget form
      expenditure/page.tsx  # Upload expenditure form
      revenue/page.tsx      # Upload revenue form

  procurement-officer/
    procurement/
      dashboard/page.tsx    # Procurement cycle overview
      tenders/page.tsx      # List tenders
      tenders/add/page.tsx  # Create new tender
      tenders/[id]/page.tsx # Tender detail + manage bids
      awards/page.tsx       # Awards listing

  auditor/
    audit/
      dashboard/page.tsx    # Cross-MDA analytics
      discrepancies/page.tsx# Discrepancy reports
      [id]/page.tsx         # Discrepancy detail

  meeting-user/
    meetings/
      page.tsx              # Meeting dashboard (upcoming/past)
      schedule/page.tsx     # Schedule meeting form
      [id]/page.tsx         # Meeting detail + minutes
      archive/page.tsx      # Meeting archive & search

# Shared Components
components/
  layout/
    Sidebar.tsx
    Navbar.tsx
  dashboard/
    KPICard.tsx
    Chart.tsx
  forms/
    ProjectForm.tsx
    MilestoneForm.tsx
    FinanceForm.tsx
    TenderForm.tsx
    MeetingForm.tsx

# Utilities
lib/
  auth.ts                   # Role-based authentication
  permissions.ts            # Uses ROLE_PERMISSIONS mapping
  api.ts                    # API fetch helpers

# Types
types/
  index.ts                  # Import/export of shared TypeScript types
