"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit } from "lucide-react";
import { MDA } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMDA, useUpdateMDA } from "@/hooks/use-mdas";
import { useUsers } from "@/hooks/use-users";
import { Loader2 } from "lucide-react";

export default function MdaViewClient({ id }: { id: string }) {
  const router = useRouter();
  const { data: mda, isLoading } = useMDA(id);
  const { mutate: updateMDA, isPending: isUpdating } = useUpdateMDA();
  const { data: usersData } = useUsers();
  
  const users = usersData || [];
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [form, setForm] = useState<Omit<
    MDA,
    "id" | "createdAt" | "updatedAt"
  > | null>(null);

  useEffect(() => {
    if (mda) {
      setForm({
        name: mda.name,
        category: mda.category,
        description: mda.description,
        headOfMda: mda.headOfMda,
        email: mda.email,
        phone: mda.phone,
        address: mda.address,
        isActive: mda.isActive,
      });
    }
  }, [mda]);

  function openEdit() {
    setIsEditOpen(true);
  }

  function onSave() {
    if (!mda || !form) return;
    const updated: MDA = {
      ...mda,
      ...form,
      updatedAt: new Date(),
    };
    
    updateMDA(updated, {
      onSuccess: () => {
        setIsEditOpen(false);
      }
    });
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!mda || !form) return <div className="p-6">MDA not found</div>;

  // deletion is handled from a separate admin flow; list page removed delete button per request

  if (!mda || !form) return null;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">{mda.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Information about this MDA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Category</div>
              <div className="font-medium">{mda.category}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Head</div>
              <div className="font-medium">{mda.headOfMda || "-"}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-medium">{mda.email || "-"}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Phone</div>
              <div className="font-medium">{mda.phone || "-"}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-muted-foreground">Address</div>
              <div className="font-medium">{mda.address || "-"}</div>
            </div>
            {mda.description && (
              <div className="md:col-span-2">
                <div className="text-sm text-muted-foreground">Description</div>
                <div className="font-medium">{mda.description}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit MDA</DialogTitle>
            <DialogDescription>
              Update MDA information and details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">MDA Name *</Label>
                <Input
                  id="edit-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) =>
                    setForm({ ...form, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ministry">Ministry</SelectItem>
                    <SelectItem value="Department">Department</SelectItem>
                    <SelectItem value="Agency">Agency</SelectItem>
                    <SelectItem value="Board">Board</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-head">Head of MDA</Label>
                <Select
                  value={form.headOfMda || "None"}
                  onValueChange={(value) =>
                    setForm({ ...form, headOfMda: value === "None" ? undefined : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select head of MDA" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={`${user.firstname} ${user.lastname}`}>
                        {`${user.firstname} ${user.lastname}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={form.email || ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={form.phone || ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={form.address || ""}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <RadioGroup
                value={form.isActive ? "active" : "inactive"}
                onValueChange={(value) =>
                  setForm({ ...form, isActive: value === "active" })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="edit-active" />
                  <Label
                    htmlFor="edit-active"
                    className="font-normal cursor-pointer"
                  >
                    Active
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="edit-inactive" />
                  <Label
                    htmlFor="edit-inactive"
                    className="font-normal cursor-pointer"
                  >
                    Inactive
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
