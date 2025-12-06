const STORAGE_KEY = "e-track-users";

const MOCK_USERS = [
  {
    id: "1",
    email: "john.doe@gov.ng",
    name: "John Doe",
    role: "ProjectManager",
    mdaId: "mda-1",
    mdaName: "Ministry of Works",
    status: "active",
    lastLogin: "2024-10-15T10:30:00",
    createdAt: "2024-01-15T08:00:00",
    updatedAt: "2024-10-15T10:30:00",
  },
  {
    id: "2",
    email: "jane.smith@gov.ng",
    name: "Jane Smith",
    role: "FinanceOfficer",
    mdaId: "mda-2",
    mdaName: "Ministry of Health",
    status: "active",
    lastLogin: "2024-10-14T16:45:00",
    createdAt: "2024-02-20T09:00:00",
    updatedAt: "2024-10-14T16:45:00",
  },
  {
    id: "3",
    email: "bob.wilson@contractor.com",
    name: "Bob Wilson",
    role: "Contractor",
    mdaId: "mda-3",
    mdaName: "Ministry of Education",
    status: "inactive",
    lastLogin: "2024-09-28T14:20:00",
    createdAt: "2024-03-10T11:30:00",
    updatedAt: "2024-09-28T14:20:00",
  },
  {
    id: "4",
    email: "alice.lee@gov.ng",
    name: "Alice Lee",
    role: "ProcurementOfficer",
    mdaId: "mda-4",
    mdaName: "Ministry of Agriculture",
    status: "active",
    lastLogin: "2024-10-13T09:15:00",
    createdAt: "2024-04-05T10:00:00",
    updatedAt: "2024-10-13T09:15:00",
  },
  {
    id: "5",
    email: "michael.chen@gov.ng",
    name: "Michael Chen",
    role: "Auditor",
    mdaId: "mda-1",
    mdaName: "Ministry of Works",
    status: "active",
    lastLogin: "2024-10-15T08:00:00",
    createdAt: "2024-05-12T13:00:00",
    updatedAt: "2024-10-15T08:00:00",
  },
];

export function seedIfEmpty() {
  if (typeof window === "undefined") return;
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_USERS));
  }
}

export function getUsers() {
  if (typeof window === "undefined") return [];
  seedIfEmpty();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveUsers(users: Array<Record<string, unknown>>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function getUser(id: string): Record<string, unknown> | null {
  const users = getUsers();
  return users.find((u: Record<string, unknown>) => u.id === id) || null;
}

export function saveUser(user: Record<string, unknown>) {
  const users = getUsers();
  const next = users.map((u: Record<string, unknown>) =>
    u.id === user.id ? user : u
  );
  saveUsers(next);
}

export function addUser(user: Record<string, unknown>) {
  const users = getUsers();
  const next = [...users, user];
  saveUsers(next);
}

export function deleteUser(id: string) {
  const users = getUsers();
  const next = users.filter((u: Record<string, unknown>) => u.id !== id);
  saveUsers(next);
}
