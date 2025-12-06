# 📘 E-Track PRD 

## 1.0 Overview

E-Track is a **government performance and accountability web platform** for:

* Project lifecycle management
* Finance tracking
* Procurement transparency
* Meeting management
* Cross-module performance monitoring

Design principle:

* **Governor/Admin = Oversight only (hands-off)**
* **MDAs = Execution units** (Project, Finance, Procurement)
* **Contractors = Submit updates**
* **Auditors = Independent watchdogs**

---

## 2.0 User Roles & Permissions

### 2.1 Governor/Admin (Oversight)

* **Functions**

  * View dashboards across all MDAs.
  * Export reports (PDF, Excel, CSV).
  * Filter by time, location, MDA, category.
* **Restrictions**

  * No project/finance/procurement creation.
  * No submission approvals.
  * Read-only.

---

### 2.2 Project Manager (MDA-Specific)

* **Functions**

  * Add new projects under their MDA.
  * Submit milestone progress.
  * Review/approve/reject contractor submissions.
  * View finance allocations for projects in their MDA.
* **Scope**

  * Restricted to their assigned **MDA only**.
* **Permissions**

  * CRUD on projects within their MDA.
  * Approve/reject contractor progress reports.

---

### 2.3 Contractor

* **Functions**

  * View assigned projects.
  * Submit milestone progress reports.
  * Upload geo-tagged evidence (photos/videos/docs).
  * Track status of submissions.
* **Restrictions**

  * Can only interact with their own assigned projects.

---

### 2.4 Finance Officer (MDA-Specific)

* **Functions**

  * Upload budgets for their MDA.
  * Upload expenditures linked to their MDA’s projects.
  * Upload revenues relevant to their MDA.
  * View finance dashboards.
* **Scope**

  * Restricted to their **MDA finance records only**.

---

### 2.5 Procurement Officer (MDA-Specific)

* **Functions**

  * Create/manage procurement requests for their MDA.
  * Upload tender documents.
  * Generate procurement reports.
* **Scope**

  * Restricted to procurement activity in their **MDA only**.

---

### 2.6 Vendor

* **Functions**

  * View published tenders.
  * Submit bids with required documents.
  * View award results.
* **Restrictions**

  * Access limited to procurement module.

---

### 2.7 Auditor

* **Functions**

  * Read-only across all MDAs.
  * Flag discrepancies in finance, procurement, and project submissions.
  * Generate compliance & discrepancy reports.
* **Scope**

  * Access is **cross-MDA**, independent role.

---

### 2.8 Meeting User (Facilitator + Officials)

* **Functions**

  * Schedule meetings (title, agenda, docs).
  * Record meeting minutes & action items.
  * Participants view invites, attend, and access archives.
* **Scope**

  * Meetings can be MDA-specific or cross-government.

---

## 3.0 Module Descriptions & Pages

### 3.1 Project Module

* **Key Pages**

  * **Project Dashboard (per MDA)**: Active, completed, delayed projects.
  * **Project Addition Form** (title, category, contractor, contract value, docs).
  * **Milestone Submission Form** (status, % complete, notes, geo-tag evidence).
  * **Submission Review Page** (approval/rejection by Project Manager).
* **Analytics**: GIS map, Gantt charts, completion %, contractor rankings.

---

### 3.2 Finance Module

* **Key Pages**

  * **Finance Dashboard (per MDA + consolidated)**.
  * **Budget Upload Form** (allocations by MDA).
  * **Expenditure Upload Form** (amounts spent, recipients, receipts).
  * **Revenue Upload Form** (taxes, levies, grants, other sources).
* **Analytics**: Allocations vs expenditures, year-on-year trends, discrepancy logs.

---

### 3.3 Procurement Module

* **Key Pages**

  * **Procurement Dashboard (per MDA + consolidated)**.
  * **Tender Creation Form** (title, docs, evaluation criteria, deadline).
  * **Bid Submission Form (Vendor)**.
  * **Award Notice Page** (winners, values, dates).
* **Analytics**: Vendor participation rates, cost savings from competitive bidding.

---

### 3.4 Meeting Module

* **Key Pages**

  * **Meeting Dashboard** (upcoming vs past).
  * **Meeting Scheduling Form** (agenda, participants, docs, time).
  * **Meeting Minutes Form** (decisions, action items, attachments).
  * **Archive/Search** (by date, topic, MDA).

---

### 3.5 Performance Monitoring

* **Key Pages**

  * **Performance Dashboard** (traffic-light KPIs per project/MDA).
  * **Report Export Page** (auto-generated PDF/Excel).
* **Analytics**

  * % budget utilization per MDA.
  * % projects completed.
  * Procurement savings.
  * Meeting resolution status.

---

## 4.0 Workflows

### 4.1 Project Workflow

1. Project Manager (MDA) creates project.
2. Contractor submits milestone progress.
3. Project Manager reviews → Approve/Reject.
4. Dashboard updates for Governor/Admin & Auditor.

---

### 4.2 Finance Workflow

1. Finance Officer (MDA) uploads budget/expenditures/revenue.
2. System compares allocations vs spending.
3. Auditor flags discrepancies.
4. Governor/Admin views dashboards only.

---

### 4.3 Procurement Workflow

1. Procurement Officer (MDA) creates tender.
2. Vendors submit bids.
3. Committee evaluates & awards.
4. Dashboard updates → Auditor reviews.
5. Governor/Admin sees summary analytics.

---

### 4.4 Meeting Workflow

1. Facilitator schedules meeting (MDA-specific or cross-MDA).
2. Participants notified.
3. Meeting held (physical/virtual).
4. Minutes & actions recorded.
5. Archive searchable for Governor/Admin & Auditor.

---

### 4.5 Performance Monitoring Workflow

1. System aggregates KPIs across all MDAs.
2. Governor/Admin exports reports.
3. Auditor cross-checks compliance.

---

## 5.0 Non-Functional Requirements

* **Availability**: ≥ 99.5% uptime.
* **Scalability**: Support 5,000+ concurrent users.
* **Security**: Role-based access, AES-256 encryption, TLS 1.3.
* **Compliance**: NDPR/GDPR alignment.
* **Auditability**: All user actions logged.
* **Performance**: Dashboards update in real time.
* **Integration**: API-ready (national finance systems, GIS).
* **Usability**: Responsive web design for mobile/tablet.

---

✅ Summary:

* **Governor/Admin is hands-off** → oversight only.
* **Project/Finance/Procurement Officers are MDA-tied** → clear accountability.
* **Contractors just submit** → simple role.
* **Auditors watch everyone** → integrity guaranteed.
