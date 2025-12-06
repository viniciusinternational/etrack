/**
 * Landing page for E-Track
 * Redirects to dashboard - client-side auth guard will handle authentication check
 */

import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect to dashboard - client-side auth guard will check authentication
  // and redirect to login if not authenticated
  redirect("/dashboard");
}
