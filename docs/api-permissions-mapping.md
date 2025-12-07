# API Route Permission Mapping

This document maps API routes to their required permissions in the new RBAS format.

## Routes to Update

### Projects
- GET /api/projects → `view_project` ✅
- POST /api/projects → `create_project` ✅
- GET /api/projects/[id] → `view_project`
- PATCH /api/projects/[id] → `edit_project`
- DELETE /api/projects/[id] → `delete_project`
- GET /api/projects/export → `export_project`

### Users
- GET /api/users → `view_user` ✅
- POST /api/users → `create_user` ✅
- GET /api/users/[id] → `view_user`
- PATCH /api/users/[id] → `edit_user`
- DELETE /api/users/[id] → `delete_user`

### Budget
- GET /api/budget → `view_budget`
- POST /api/budget → `create_budget`
- GET /api/budget/[id] → `view_budget`
- PATCH /api/budget/[id] → `edit_budget`
- DELETE /api/budget/[id] → `delete_budget`

### Expenditure
- GET /api/expenditure → `view_expenditure`
- POST /api/expenditure → `create_expenditure`
- GET /api/expenditure/[id] → `view_expenditure`
- PATCH /api/expenditure/[id] → `edit_expenditure`
- DELETE /api/expenditure/[id] → `delete_expenditure`

### Revenue
- GET /api/revenue → `view_revenue`
- POST /api/revenue → `create_revenue`
- GET /api/revenue/[id] → `view_revenue`
- PATCH /api/revenue/[id] → `edit_revenue`
- DELETE /api/revenue/[id] → `delete_revenue`

### MDAs
- GET /api/mdas → `view_mda`
- POST /api/mdas → `create_mda`
- GET /api/mdas/[id] → `view_mda`
- PATCH /api/mdas/[id] → `edit_mda`
- DELETE /api/mdas/[id] → `delete_mda`

### Tenders
- GET /api/tenders → `view_tender` ✅
- POST /api/tenders → `create_tender` ✅
- GET /api/tenders/[id] → `view_tender`
- PATCH /api/tenders/[id] → `edit_tender`
- DELETE /api/tenders/[id] → `delete_tender`

### Submissions
- GET /api/submissions → `view_submission`
- POST /api/submissions → `create_submission`
- GET /api/submissions/[id] → `view_submission`
- PATCH /api/submissions/[id] → `edit_submission`
- DELETE /api/submissions/[id] → `delete_submission`
- POST /api/submissions/[id]/approve → `approve_submission`
- POST /api/submissions/[id]/reject → `reject_submission`

### Awards
- GET /api/awards → `view_award`
- POST /api/awards → `create_award`
- GET /api/awards/[id] → `view_award`
- PATCH /api/awards/[id] → `edit_award`
- DELETE /api/awards/[id] → `delete_award`

### Audit
- GET /api/audit → `view_audit`
- POST /api/audit → `create_audit`
- GET /api/audit/[id] → `view_audit`

### Contract
- GET /api/contract → `view_contract`
- POST /api/contract → `create_contract`
- GET /api/contract/[id] → `view_contract`
- PATCH /api/contract/[id] → `edit_contract`
- DELETE /api/contract/[id] → `delete_contract`

### Events
- GET /api/events → `view_event`
- POST /api/events → `create_event`
- GET /api/events/[id] → `view_event`
- PATCH /api/events/[id] → `edit_event`
- DELETE /api/events/[id] → `delete_event`

### Dashboard
- GET /api/dashboard → `view_dashboard`
- GET /api/dashboard/[id] → `view_dashboard`

### Payments
- GET /api/payments → `view_payment`
- POST /api/payments → `create_payment`
- PATCH /api/payments/[id] → `edit_payment`
- POST /api/payments/[id]/approve → `approve_payment`
- POST /api/payments/[id]/reject → `reject_payment`

