import UserViewClient from "@/components/admin/user-view";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserViewClient id={id} />;
}
