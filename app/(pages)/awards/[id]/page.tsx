"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/components/procurement/utils";
import { ArrowLeft, Edit, Loader2 } from "lucide-react";
import { useAward } from "@/hooks/use-awards";

export default function AwardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: award, isLoading, error } = useAward(id);

  const onEdit = () => {
    router.push(`/awards/${id}/edit`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !award) {
    notFound();
  }

  const tenderTitle = award.procurementRequest?.title ?? "-";
  const vendorName = award.vendor?.name ?? "-";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between ">
        <Link href="/awards">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>

        <Button variant="outline" onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Award Details</h1>
          <p className="text-muted-foreground mt-1">ID: {award.id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contract Information</CardTitle>
          <CardDescription>Details of the awarded contract</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-muted-foreground">Tender</div>
              <div className="font-medium text-foreground">{tenderTitle}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Vendor</div>
              <div className="font-medium text-foreground">{vendorName}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Contract Value
              </div>
              <div className="font-semibold text-foreground">
                {formatCurrency(award.contractValue)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Award Date</div>
              <div className="font-medium text-foreground">
                {formatDate(award.awardDate)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
