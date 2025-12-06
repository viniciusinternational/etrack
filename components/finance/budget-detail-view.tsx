"use client";
import {
  ArrowLeft,
  Edit,
  Building,
  DollarSign,
  Calendar,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { BudgetAllocation } from "@/hooks/use-budget";
import { formatCurrency, formatDateLong } from "./utils";

export function BudgetDetailView({
  budget,
  onBack,
  onEdit,
}: {
  budget: BudgetAllocation;
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
              Budget Details
            </h1>
            <p className="text-muted-foreground mt-1">
              View budget information
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
            <CardTitle>Budget Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <Building className="h-4 w-4" /> MDA
                </h3>
                <p className="text-lg font-semibold text-foreground">
                  {budget.mda?.name || "N/A"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <Tag className="h-4 w-4" /> Category
                </h3>
                <p className="text-lg font-semibold text-foreground">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(budget as any).category ||
                    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                    (budget as any).source ||
                    "N/A"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Amount
                </h3>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(budget.amount)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Fiscal Year
                </h3>
                <p className="text-lg font-semibold text-foreground">
                  {budget.fiscalYear}
                </p>
              </div>
            </div>
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
                {budget.createdAt ? formatDateLong(budget.createdAt) : "N/A"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Last Updated
              </h3>
              <p className="text-sm text-foreground">
                {budget.updatedAt ? formatDateLong(budget.updatedAt) : "N/A"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Record ID
              </h3>
              <p className="text-xs text-foreground font-mono break-all">
                {budget.id}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
