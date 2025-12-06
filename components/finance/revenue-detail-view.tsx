"use client";
import {
  ArrowLeft,
  Edit,
  FileText,
  Calendar,
  DollarSign,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Revenue } from "./types";
import { formatCurrency, formatDateLong } from "./utils";

export function RevenueDetailView({
  revenue,
  onBack,
  onEdit,
}: {
  revenue: Revenue;
  onBack: () => void;
  onEdit: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Revenue Details
            </h1>
            <p className="text-muted-foreground mt-1">
              View revenue information
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <Building className="h-4 w-4" /> MDA
                </h3>
                <p className="text-lg font-semibold text-foreground">
                  {revenue.mda?.name || "N/A"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Type
                </h3>
                <p className="text-lg font-semibold text-foreground">
                  {revenue.type}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Amount
                </h3>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(revenue.amount)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Date
                </h3>
                <p className="text-foreground">
                  {formatDateLong(revenue.date)}
                </p>
              </div>
            </div>

            {revenue.supportingDocs.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Supporting Documents
                </h3>
                <div className="space-y-2">
                  {revenue.supportingDocs.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm bg-muted p-3 rounded"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Record Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Created
              </h3>
              <p className="text-sm text-foreground">
                {formatDateLong(revenue.createdAt)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Last Updated
              </h3>
              <p className="text-sm text-foreground">
                {formatDateLong(revenue.updatedAt)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Record ID
              </h3>
              <p className="text-xs text-foreground font-mono break-all">
                {revenue.id}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
