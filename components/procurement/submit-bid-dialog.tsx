"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateBid } from "@/hooks/use-bids";
import { useUpload } from "@/hooks/use-upload";
import { Loader2, Upload, X } from "lucide-react";
import { useUsers } from "@/hooks/use-users";
import { toast } from "sonner";

interface SubmitBidDialogProps {
  tenderId: string;
  trigger?: React.ReactNode;
}

export function SubmitBidDialog({ tenderId, trigger }: SubmitBidDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: createBid, isPending: isSubmitting } = useCreateBid();
  const { mutateAsync: uploadFile, isPending: isUploading } = useUpload();
  const { data: users } = useUsers();
  
  // In a real app, we'd get the current user from auth context.
  // For now, we'll select a vendor from the list or default to the first one found.
  const vendors = users?.filter(u => u.role === "Vendor") || [];
  const [selectedVendorId, setSelectedVendorId] = useState("");

  const [bidAmount, setBidAmount] = useState<number>(0);
  const [proposalDocs, setProposalDocs] = useState<string[]>([]);
  const [complianceDocs, setComplianceDocs] = useState<string[]>([]);

  const handleFileUpload = async (
    files: FileList | null,
    type: "proposal" | "compliance"
  ) => {
    if (!files) return;

    try {
      const uploadPromises = Array.from(files).map((file) => uploadFile(file));
      const results = await Promise.all(uploadPromises);
      const urls = results.filter((res) => res !== undefined).map((res) => res.url);

      if (type === "proposal") {
        setProposalDocs((prev) => [...prev, ...urls]);
      } else {
        setComplianceDocs((prev) => [...prev, ...urls]);
      }
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Failed to upload files");
    }
  };

  const handleSubmit = async () => {
    if (!selectedVendorId) {
      toast.error("Please select a vendor (simulating login)");
      return;
    }
    if (bidAmount <= 0) {
      toast.error("Bid amount must be positive");
      return;
    }
    if (proposalDocs.length === 0) {
      toast.error("At least one proposal document is required");
      return;
    }

    try {
      await createBid({
        procurementRequestId: tenderId,
        vendorId: selectedVendorId,
        bidAmount,
        proposalDocs,
        complianceDocs,
      });
      setOpen(false);
      toast.success("Bid submitted successfully!");
      // Reset form
      setBidAmount(0);
      setProposalDocs([]);
      setComplianceDocs([]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit bid");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Submit Bid</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit Bid</DialogTitle>
          <DialogDescription>
            Submit your proposal for this tender.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          
          {/* Vendor Selection (Simulation) */}
          <div className="grid gap-2">
            <Label>Simulate Vendor (Select who is bidding)</Label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
            >
              <option value="">Select a vendor...</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{`${v.firstname} ${v.lastname}`}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Bid Amount</Label>
            <Input
              id="amount"
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
            />
          </div>
          
          <div className="grid gap-2">
            <Label>Proposal Documents</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                multiple
                className="hidden"
                id="proposal-upload"
                onChange={(e) => handleFileUpload(e.target.files, "proposal")}
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("proposal-upload")?.click()}
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Upload Proposal
              </Button>
            </div>
            {proposalDocs.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {proposalDocs.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="truncate max-w-[300px]">{doc.split('/').pop()}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setProposalDocs(prev => prev.filter((_, idx) => idx !== i))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Compliance Documents</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                multiple
                className="hidden"
                id="compliance-upload"
                onChange={(e) => handleFileUpload(e.target.files, "compliance")}
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("compliance-upload")?.click()}
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Upload Compliance
              </Button>
            </div>
            {complianceDocs.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {complianceDocs.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="truncate max-w-[300px]">{doc.split('/').pop()}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setComplianceDocs(prev => prev.filter((_, idx) => idx !== i))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting || isUploading}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Bid
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
