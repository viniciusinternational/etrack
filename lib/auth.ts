/**
 * Authentication utilities for E-Track
 * Role-based authentication and session management
 */

import { User, UserRole, Session } from "@/types";
// re-export UserRole for convenience in some components that import it from this module
export { UserRole };

// Mock authentication - replace with real auth implementation
export const mockUser: User = {
  id: "1",
  email: "project.manager@etrack.gov",
  name: "Project Manager",
  role: UserRole.Admin,
  mdaId: "mda-1",
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockSession: Session = {
  user: mockUser,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
};

export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    [UserRole.SuperAdmin]: "Super Administrator",
    [UserRole.Admin]: "System Administrator",
    [UserRole.GovernorAdmin]: "Governor Administrator",
    [UserRole.ProjectManager]: "Project Manager",
    [UserRole.Contractor]: "Contractor",
    [UserRole.FinanceOfficer]: "Finance Officer",
    [UserRole.ProcurementOfficer]: "Procurement Officer",
    [UserRole.Auditor]: "Auditor",
    [UserRole.MeetingUser]: "Meeting User",
    [UserRole.Vendor]: "Vendor",
  };
  return displayNames[role];
}

export function getRoleRoutes(): string[] {
  // Role-aware routing has been normalized to a single dashboard.
  return ["/dashboard"];
}
