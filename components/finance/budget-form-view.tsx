"use client";
import type React from "react";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BudgetFormInput } from "@/types";
import type { BudgetAllocation } from "@/hooks/use-budget";
import { useMDAs } from "@/hooks/use-mdas";
import { EXPENDITURE_CATEGORIES } from "./constants";

export function BudgetFormView({
  budget,
  onBack,
  onSave,
  isSaving = false,
}: {
  budget: BudgetAllocation | null;
  onBack: () => void;
  onSave: (data: BudgetFormInput) => void;
  isSaving?: boolean;
}) {
  const { data: mdas } = useMDAs();
  const [formData, setFormData] = useState<BudgetFormInput>({
    mdaId: budget?.mdaId || "",
    amount: budget?.amount || 0,
    fiscalYear: budget?.fiscalYear || new Date().getFullYear(),
    quarter: budget?.quarter || 1,
    source: budget?.source || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {budget ? "Edit Budget" : "Add Budget"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {budget
              ? "Update budget details"
              : "Create a new budget allocation"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Budget Information</CardTitle>
            <CardDescription>Fill in the budget details</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mda">MDA *</Label>
                <Select
                  value={formData.mdaId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, mdaId: value })
                  }
                >
                  <SelectTrigger id="mda">
                    <SelectValue placeholder="Select MDA" />
                  </SelectTrigger>
                  <SelectContent>
                    {mdas?.map((mda) => (
                      <SelectItem key={mda.id} value={mda.id}>
                        {mda.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">Source / Category *</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) =>
                    setFormData({ ...formData, source: value })
                  }
                >
                  <SelectTrigger id="source">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENDITURE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₦) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: Number(e.target.value) })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fiscalYear">Fiscal Year *</Label>
                <Input
                  id="fiscalYear"
                  type="number"
                  placeholder="2024"
                  value={formData.fiscalYear}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fiscalYear: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quarter">Quarter *</Label>
                <Select
                  value={formData.quarter.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, quarter: Number(value) })
                  }
                >
                  <SelectTrigger id="quarter">
                    <SelectValue placeholder="Select Quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((q) => (
                      <SelectItem key={q} value={q.toString()}>
                        Q{q}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-full sm:w-auto bg-transparent"
          >
            Cancel
          </Button>
          <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {budget ? "Update Budget" : "Add Budget"}
          </Button>
        </div>
      </form>
    </>
  );
}
