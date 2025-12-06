/**
 * Landing page for E-Track
 * Role-based redirect to appropriate dashboard
 */

import { redirect } from "next/navigation";

export default function HomePage() {
  // Normalize landing: always redirect to the unified dashboard
  redirect("/dashboard");
}
