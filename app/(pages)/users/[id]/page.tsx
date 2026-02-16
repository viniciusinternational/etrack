import UserViewClient from "@/components/admin/user-view";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log("id ", id);
  return <UserViewClient id={id} />;
}
