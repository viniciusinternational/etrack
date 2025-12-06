import MdaViewClient from "@/components/admin/mda-view";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <MdaViewClient id={id} />;
}
