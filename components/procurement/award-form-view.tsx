"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Award } from "@/types";
import { useTenders } from "@/hooks/use-tenders";
import { useUsers } from "@/hooks/use-users";

interface AwardFormViewProps {
  award?: Award | null;
  onBack?: () => void;
  onSave?: (data: Partial<Award>) => Promise<void> | void;
}

export function AwardFormView({ award, onBack, onSave }: AwardFormViewProps) {
  const router = useRouter();
  const { data: tenders } = useTenders();
  const { data: users } = useUsers();

  const vendors = users?.filter((u) => u.role === "Vendor") || [];

  const [formData, setFormData] = useState<Partial<Award>>({
    procurementRequestId: award?.procurementRequestId || "",
    vendorId: award?.vendorId || "",
    contractValue: award?.contractValue || 0,
    awardDate: award?.awardDate ? new Date(award.awardDate) : new Date(),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!award;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.procurementRequestId)
      e.procurementRequestId = "Tender is required";
    if (!formData.vendorId) e.vendorId = "Vendor is required";
    if (!formData.contractValue || formData.contractValue <= 0)
      e.contractValue = "Contract value must be greater than 0";
    if (!formData.awardDate) e.awardDate = "Award date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    setGeneralError(null);
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await onSave?.(formData);
    } catch (error) {
      console.error(error);
      setGeneralError("An error occurred while saving. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          {isEditing ? "Edit Award" : "Create Award"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isEditing ? "Update award details" : "Record a new award"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Award Information</CardTitle>
          <CardDescription>Fill in the award details below</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Tender *</Label>
              <Select
                value={formData.procurementRequestId}
                onValueChange={(v) =>
                  setFormData({ ...formData, procurementRequestId: v })
                }
              >
                <SelectTrigger
                  className={
                    errors.procurementRequestId ? "border-red-500" : ""
                  }
                >
                  <SelectValue placeholder="Select tender" />
                </SelectTrigger>
                <SelectContent>
                  {tenders?.map((req) => (
                    <SelectItem key={req.id} value={req.id}>
                      {req.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.procurementRequestId && (
                <p className="text-sm text-red-500">
                  {errors.procurementRequestId}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Vendor *</Label>
              <Select
                value={formData.vendorId}
                onValueChange={(v) => setFormData({ ...formData, vendorId: v })}
              >
                <SelectTrigger
                  className={errors.vendorId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vendorId && (
                <p className="text-sm text-red-500">{errors.vendorId}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contract Value *</Label>
                <Input
                  type="number"
                  value={Number(formData.contractValue ?? 0)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contractValue: Number.parseFloat(e.target.value),
                    })
                  }
                  className={errors.contractValue ? "border-red-500" : ""}
                />
                {errors.contractValue && (
                  <p className="text-sm text-red-500">{errors.contractValue}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Award Date *</Label>
                <Input
                  type="date"
                  value={(() => {
                    try {
                      return formData.awardDate
                        ? new Date(formData.awardDate).toISOString().slice(0, 10)
                        : "";
                    } catch (e) {
                      return "";
                    }
                  })()}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                      setFormData({ ...formData, awardDate: undefined });
                      return;
                    }
                    const date = new Date(val);
                    if (!isNaN(date.getTime())) {
                      setFormData({ ...formData, awardDate: date });
                    }
                  }}
                  className={errors.awardDate ? "border-red-500" : ""}
                />
                {errors.awardDate && (
                  <p className="text-sm text-red-500">{errors.awardDate}</p>
                )}
              </div>
            </div>

            {generalError && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {generalError}
              </div>
            )}

            <div className="flex gap-4 pt-2">
              <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update Award" : "Save Award"}
              </Button>
              <Button
                variant="outline"
                onClick={onBack ?? (() => router.back())}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
