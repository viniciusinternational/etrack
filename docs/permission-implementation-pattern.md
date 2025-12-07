# Permission Implementation Pattern

## Page-Level Permission Checks

### Pattern
Add permission checks to page components using `useAuthGuard` hook:

```typescript
import { useAuthGuard } from "@/hooks/use-auth-guard";

export default function MyPage() {
  // Check authentication and permission
  const { isChecking } = useAuthGuard(['view_module']); // Replace with appropriate permission
  
  // Your existing hooks and logic
  const { data, isLoading } = useMyData();
  
  // Show loading while checking auth/permissions
  if (isChecking || isLoading) {
    return <div>Loading...</div>;
  }
  
  // Rest of component...
}
```

### Permission Mapping

- Dashboard: `['view_dashboard']`
- Users: `['view_user']`
- Projects: `['view_project']`
- MDAs: `['view_mda']`
- Budget: `['view_budget']`
- Expenditure: `['view_expenditure']`
- Revenue: `['view_revenue']`
- Submissions: `['view_submission']`
- Tenders: `['view_tender']`
- Awards: `['view_award']`
- Contract: `['view_contract']`
- Events: `['view_event']`
- Meetings: `['view_meeting']`
- Audit: `['view_audit']`

