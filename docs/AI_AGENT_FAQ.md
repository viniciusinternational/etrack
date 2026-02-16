---
title: E-Track Platform — End User FAQ
version: 1.0
purpose: AI agent / knowledge base context for end-user support
embedding: When using in JS/TS template literals, escape backslashes, backticks, and dollar-brace
---

# E-Track Platform — End User FAQ

> **Purpose:** This document is designed to be consumed by an AI agent or knowledge base to answer end-user questions about the E-Track Government Performance & Accountability Platform.

---

## About E-Track

E-Track is a comprehensive platform for tracking government projects, finances, and performance across Ministries, Departments, and Agencies (MDAs). It supports project management, procurement, finance, and reporting workflows.

---

## 1. How do I create a new project in E-Track? {#create-project}

### Prerequisites
- You need the [view_project] and [create_project] permissions.
- Your role must be one of: Admin, GovernorAdmin, ProjectManager, or equivalent with project creation rights.

### Steps

1. **Navigate to Projects**
   - Open the sidebar and click **Projects** (or go to /projects).

2. **Start creation**
   - Click **Add New Project** or go to /projects/add.

3. **Fill in project details**
   - **Project Title** (required)
   - **Description** (required)
   - **Category** (required): Infrastructure, Healthcare, Education, Agriculture, Technology, Environment, or Housing
   - **Supervising MDA** (optional): Select the MDA overseeing the project
   - **Contractor** (optional): Select a user with the Contractor role
   - **Supervisor** (optional): Select an Admin, ProjectManager, or GovernorAdmin
   - **Contract Value** (required)
   - **Start Date** and **End Date** (required)
   - **Evidence Documents** (optional): Attach supporting files

4. **Save**
   - Click **Save** to create the project. The project starts with status **Planned**.

### Project statuses
- **Planned** — Newly created
- **In Progress** — Work started
- **Delayed** — Behind schedule
- **Completed** — Finished

### Categories
Infrastructure | Healthcare | Education | Agriculture | Technology | Environment | Housing

---

## 2. Show me a summary of recent procurement activities {#procurement}

### Where to find procurement data

1. **Tenders page**
   - Go to **Tenders** in the sidebar (or /tenders).
   - Summary cards show: Total Tenders, Open, Bidding, Awarded, Total Value.

2. **Tender statuses**
   - **Open** — Accepting bids
   - **Bidding** — Bids under evaluation
   - **Awarded** — Contract awarded
   - **Closed** — Process finished

3. **Procurement request fields**
   - Title, description, estimated cost, request date, status
   - Related bids with vendor, amount, and status (Submitted, Rejected, Awarded)

### Related modules

- **Tenders** (/tenders) — Procurement requests and bidding
- **Awards** (/awards) — Awarded contracts
- **Contract** (/contract) — Contract details and workflows

### Permissions
- [view_tender] — View tenders
- [create_tender] — Create tenders (e.g. "Create Tender" on Tenders page)
- [view_award] — View awards
- [view_contract] — View contracts

---

## 3. Help me understand the finance dashboard {#finance}

### Finance-related areas

The finance functions are split across several modules:

#### Budget (/budget)
- Budget allocations by MDA, fiscal year, quarter, amount, and source
- Add, edit, view budget records
- Permissions: [view_budget], [create_budget], [edit_budget], [delete_budget], [upload_budget], [export_budget]

#### Expenditure (/expenditure)
- Project expenditures: amount, date, recipient, supporting docs
- Linked to projects
- Permissions: [view_expenditure], [create_expenditure], [edit_expenditure], etc.

#### Revenue (/revenue)
- MDA revenues: type, amount, date, supporting docs
- Permissions: [view_revenue], [create_revenue], [edit_revenue], etc.

#### Finance upload (/upload)
- Upload financial data via Finance Upload Form
- Used to import budget, expenditure, and revenue data

#### Finance dashboard components
- Total budget, total expenditure, total revenue
- Budget vs expenditure charts
- Expenditure by category (e.g. Personnel, Operations, Capital, Maintenance)
- Monthly trends

### Payments (when applicable)
- Payments linked to projects, request forms, or payroll
- Statuses: draft, pending_approval, approved, processing, paid, failed, cancelled, partially_paid
- Methods: bank_transfer, check, cash, mobile_money, card

---

## 4. What reports can I generate in E-Track? {#reports}

### Reports page (/reports)

You need the [view_dashboard] permission to access Reports.

### Report types

1. **Overview**
   - Users, MDAs, projects, financials
   - Users by role, projects by status, MDAs overview

2. **Financial**
   - Budget, expenditure, revenue
   - Financial summaries and trends

3. **Projects**
   - Project summaries, status, categories
   - Progress and metrics

4. **Users**
   - User counts, roles, status
   - Distribution and activity

### Using reports

1. Open **Reports** in the sidebar.
2. Choose report type: Overview, Financial, Projects, or Users.
3. Optional: set **Start date** and **End date**.
4. View the report.
5. **Export PDF** — Download as PDF.
6. **Print** — Print the current report.

---

## 5. Explain how to track project milestones {#milestones}

### Milestone submissions

Milestone tracking uses **Submissions** (contractor milestone submissions) and **Milestone stages**.

### Milestone stages (in order)
1. PreConstruction
2. Foundation
3. Superstructure
4. Finishing
5. TestingCommissioning
6. Handover

### For contractors (submit milestones)

1. Go to **Submissions** (/submissions).
2. Create or edit a submission for your project.
3. Choose milestone stage and percent complete.
4. Add notes and optional geo-tag.
5. Attach evidence documents.
6. Submit for review.

### For reviewers (approve/reject)

1. Go to **Submissions** (/submissions).
2. Use status filter: Pending, Approved, Rejected.
3. Click a submission to open detail page.
4. Review evidence and details.
5. Use **Approve** or **Reject**.

### Submission statuses
- **Pending** — Awaiting review
- **Approved** — Accepted
- **Rejected** — Declined

### Permissions
- [view_submission] — View submissions
- [edit_submission] — Edit submissions
- [approve_submission] — Approve
- [reject_submission] — Reject

### Viewing milestones in a project

1. Go to **Projects** → select a project.
2. Open the project detail page.
3. View milestones and related submissions in the project view.

---

## 6. How do I manage user permissions? {#permissions}

### User management (/users)

1. Open **Users** in the sidebar.
2. Use filters: search (name/email), role, status, MDA.
3. Click a user to view or edit their profile.
4. Use **Add New User** for new accounts.
5. Use **Manage Permissions** to adjust role templates.

### Role permission templates (/users/permissions)

This page defines **default** permissions for each role. You need appropriate admin rights.

1. Go to **Users** → **Manage Permissions** (or /users/permissions).
2. Select a role tab (e.g. Admin, ProjectManager, Contractor).
3. Enable or disable permissions per module.
4. Use **Select All** per module to toggle all permissions.
5. Click **Save Changes** to apply.

### User roles
- SuperAdmin | Admin | GovernorAdmin | ProjectManager
- Contractor | FinanceOfficer | ProcurementOfficer
- Vendor | Auditor | MeetingUser

### Permission format
- Pattern: [action]_[module] (e.g. [view_project], [create_user])
- Actions: view, create, edit, delete, export, approve, reject, upload, manage
- Modules: project, user, mda, budget, expenditure, revenue, tender, award, submission, event, meeting, audit, ai_assistant, etc.

### Module examples (permissions)
- **Users** — create_user, view_user, edit_user, delete_user
- **Projects** — create_project, view_project, edit_project, delete_project
- **Budget** — create_budget, view_budget, edit_budget, delete_budget, upload_budget
- **Submissions** — view_submission, approve_submission, reject_submission
- **AI Assistant** — view_ai_assistant

### Editing individual users
- Go to **Users** → click user → **Edit**.
- Change role (Admin, ProjectManager, Contractor, etc.).
- Assign MDA (if applicable).
- User permissions are derived from role templates; SuperAdmin/Admin can override when supported.

---

## Quick reference — navigation routes {#routes}

| Module      | Route              | Key purpose                           |
|-------------|--------------------|----------------------------------------|
| Dashboard   | /dashboard         | System overview                        |
| Projects    | /projects          | Project list, add, edit                |
| Submissions | /submissions       | Milestone submissions                  |
| Users       | /users             | User management                        |
| Permissions | /users/permissions | Role permission templates              |
| MDAs        | /mdas              | MDA management                         |
| Budget      | /budget            | Budget allocations                     |
| Expenditure | /expenditure       | Expenditures                           |
| Revenue     | /revenue           | Revenue records                        |
| Tenders     | /tenders           | Procurement tenders                    |
| Awards      | /awards            | Awarded contracts                      |
| Reports     | /reports           | Overview, Financial, Projects, Users   |
| AI Assistant| /ai-assistant      | AI help for E-Track                    |

---

## Common terms {#terms}

- **MDA** — Ministry, Department, or Agency
- **Contractor** — User assigned to execute project work
- **Supervisor** — User overseeing a project
- **Submission** — Contractor milestone progress report for review
- **Milestone** — Project phase (e.g. Foundation, Finishing)
- **Tender** — Procurement request open for bids

---

*Document version: 1.0 — For AI agent context and end-user support*
