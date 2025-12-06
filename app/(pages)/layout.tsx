"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { mockUser } from "@/lib/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout user={mockUser}>{children}</AppLayout>;
}
