import AuditDetailClient from "@/components/audit/audit-detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AuditDetailPage({ params }: Props) {
  const { id } = await params;
  return <AuditDetailClient id={id} />;
}
