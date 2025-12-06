"use client";
import { useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { GlobalTable } from "@/components/global/global-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import numeral from "numeral";

import type { BudgetAllocation } from "@/hooks/use-budget";
// import { formatCurrency } from "./utils";

export function BudgetListView({
  budgets,
}: // onDeleteBudget,
{
  budgets: BudgetAllocation[];
  onDeleteBudget?: (id: string) => void;
}) {
  const stats = useMemo(() => {
    const total = budgets.length;
    const totalAmount = budgets.reduce((sum, b) => sum + b.amount, 0);
    const avgAmount = total > 0 ? totalAmount / total : 0;
    return { total, totalAmount, avgAmount };
  }, [budgets]);
  const formatCompactNumber = (value: number): string => {
    return numeral(value).format("0.0a").toUpperCase();
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Budgets</h1>
          <p className="text-muted-foreground mt-1">Manage MDA budgets</p>
        </div>
        <Link href="/budget/add" className="w-full sm:w-auto">
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Budget
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Budgets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {stats.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCompactNumber(stats.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Allocated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCompactNumber(stats.avgAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per record</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Table (Global TanStack Table) */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Records</CardTitle>
          <CardDescription>Showing {budgets.length} records</CardDescription>
        </CardHeader>

        <CardContent>
          <GlobalTable
            data={budgets}
            columns={(() => {
              const cols: ColumnDef<BudgetAllocation>[] = [
                {
                  accessorKey: "mda.name",
                  header: "MDA",
                  cell: ({ row }) => (
                    <div className="font-medium">
                      {row.original.mda?.name || "N/A"}
                    </div>
                  ),
                },
                {
                  accessorKey: "source",
                  header: "Source",
                  cell: ({ row }) => (
                    <div className="text-sm">{row.original.source}</div>
                  ),
                },
                {
                  accessorKey: "amount",
                  header: "Amount",
                  cell: ({ row }) => (
                    <div className="font-semibold">
                      {formatCompactNumber(row.original.amount)}
                    </div>
                  ),
                },
                {
                  accessorKey: "fiscalYear",
                  header: "Fiscal Year",
                  cell: ({ row }) => (
                    <div className="text-sm">{row.original.fiscalYear}</div>
                  ),
                },
              ];
              return cols;
            })()}
            title="Budgets"
            rowClickHref={(row) => `/budget/${row.id}`}
          />
        </CardContent>
      </Card>
    </>
  );
}
