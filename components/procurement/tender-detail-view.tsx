"use client";

import Link from "next/link";
import { ArrowLeft, Download, Edit, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ProcurementRequest, Bid } from "@/types";
import {
  formatCurrency,
  formatDate,
  getProcurementStatusConfig,
  getBidStatusConfig,
} from "./utils";
import { useUpdateBid } from "@/hooks/use-bids";
import { useState } from "react";
import { SubmitBidDialog } from "./submit-bid-dialog";
import { toast } from "sonner";

interface TenderDetailViewProps {
  tender: ProcurementRequest & { bids?: Bid[] };
  onEdit: () => void;
}

export function TenderDetailView({ tender, onEdit }: TenderDetailViewProps) {
  const { mutateAsync: updateBid, isPending: isUpdatingBid } = useUpdateBid();
  const [processingBidId, setProcessingBidId] = useState<string | null>(null);

  const relatedBids = tender.bids || [];
  const statusConfig = getProcurementStatusConfig(tender.status);
  
  const isTenderOpen = tender.status === "Open" || tender.status === "Bidding";

  const handleBidAction = async (bidId: string, action: "Awarded" | "Rejected") => {
    if (!confirm(`Are you sure you want to ${action === "Awarded" ? "award" : "reject"} this bid?`)) return;
    
    setProcessingBidId(bidId);
    try {
      await updateBid({ id: bidId, status: action });
      toast.success(`Bid ${action.toLowerCase()} successfully`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update bid status");
    } finally {
      setProcessingBidId(null);
    }
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/tenders">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>

          <div className="flex gap-2">
            {isTenderOpen && (
              <SubmitBidDialog tenderId={tender.id} />
            )}
            <Button variant="outline" onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {tender.title}
            </h1>
            <p className="text-muted-foreground mt-1">{tender.mda?.name}</p>
          </div>
          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estimated Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(tender.estimatedCost)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Request Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-foreground">
              {formatDate(tender.requestDate)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bids
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {relatedBids.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground">{tender.description}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            Supporting documents for this tender
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tender.documents.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{doc.split('/').pop()}</span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a href={doc} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            ))}
            {tender.documents.length === 0 && (
               <p className="text-sm text-muted-foreground">No documents attached</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bids Received</CardTitle>
          <CardDescription>
            Showing {relatedBids.length} bids for this tender
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border w-full overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="w-full table-auto">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Vendor</TableHead>
                    <TableHead className="w-[130px]">Bid Amount</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[120px]">Submitted</TableHead>
                    <TableHead className="text-right w-[150px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatedBids.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No bids received yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    relatedBids.map((bid) => {
                      const bidStatusConfig = getBidStatusConfig(bid.status);
                      const isProcessing = processingBidId === bid.id;
                      
                      return (
                        <TableRow key={bid.id}>
                          <TableCell className="font-medium">
                            {bid.vendor ? `${bid.vendor.firstname} ${bid.vendor.lastname}` : "Unknown Vendor"}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(bid.bidAmount)}
                          </TableCell>
                          <TableCell>
                            <Badge className={bidStatusConfig.color}>
                              {bidStatusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(bid.submittedAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                  >
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Bid Details</DialogTitle>
                                    <DialogDescription>
                                      Vendor: {bid.vendor ? `${bid.vendor.firstname} ${bid.vendor.lastname}` : "Unknown Vendor"}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm text-muted-foreground">
                                          Bid Amount
                                        </p>
                                        <p className="text-lg font-semibold">
                                          {formatCurrency(bid.bidAmount)}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">
                                          Status
                                        </p>
                                        <Badge className={bidStatusConfig.color}>
                                          {bidStatusConfig.label}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium mb-2">
                                        Proposal Documents
                                      </p>
                                      <div className="space-y-2">
                                        {bid.proposalDocs.map((doc, idx) => (
                                          <div
                                            key={idx}
                                            className="flex items-center gap-2 p-2 border rounded"
                                          >
                                            <FileText className="h-4 w-4" />
                                            <span className="text-sm">{doc}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              {isTenderOpen && bid.status === "Submitted" && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    title="Award Bid"
                                    onClick={() => handleBidAction(bid.id, "Awarded")}
                                    disabled={isProcessing || isUpdatingBid}
                                  >
                                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Reject Bid"
                                    onClick={() => handleBidAction(bid.id, "Rejected")}
                                    disabled={isProcessing || isUpdatingBid}
                                  >
                                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
