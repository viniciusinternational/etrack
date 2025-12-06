"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { REVENUE_TYPES, EXPENDITURE_CATEGORIES } from "./constants";
import { Upload, FileText } from "lucide-react";
import { useCreateExpenditure } from "@/hooks/use-expenditure";
import { useCreateRevenue } from "@/hooks/use-revenue";
import { useCreateBudget } from "@/hooks/use-budget";

export function FinanceUploadForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("expenditure");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { mutate: createExpenditure, isPending: isExpenditurePending } = useCreateExpenditure();
  const { mutate: createRevenue, isPending: isRevenuePending } = useCreateRevenue();
  const { mutate: createBudget, isPending: isBudgetPending } = useCreateBudget();

  // Expenditure form state
  const [expenditureForm, setExpenditureForm] = useState({
    projectId: "",
    amount: "",
    date: "",
    recipient: "",
    category: "",
  });

  // Revenue form state
  const [revenueForm, setRevenueForm] = useState({
    mdaId: "",
    type: "",
    amount: "",
    date: "",
  });

  // Budget form state
  const [budgetForm, setBudgetForm] = useState({
    mdaId: "",
    amount: "",
    fiscalYear: new Date().getFullYear().toString(),
    category: "",
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExpenditureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, we would upload files first and get URLs
    // For now, we'll just use placeholder URLs if files exist
    const supportingDocs = uploadedFiles.map(f => `https://storage.example.com/${f.name}`);

    createExpenditure({
      projectId: expenditureForm.projectId,
      amount: Number(expenditureForm.amount),
      date: new Date(expenditureForm.date),
      recipient: expenditureForm.recipient,
      supportingDocs,
    }, {
      onSuccess: () => {
        setExpenditureForm({
          projectId: "",
          amount: "",
          date: "",
          recipient: "",
          category: "",
        });
        setUploadedFiles([]);
        alert("Expenditure record uploaded successfully!");
      }
    });
  };

  const handleRevenueSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const supportingDocs = uploadedFiles.map(f => `https://storage.example.com/${f.name}`);

    createRevenue({
      mdaId: revenueForm.mdaId,
      type: revenueForm.type,
      amount: Number(revenueForm.amount),
      date: new Date(revenueForm.date),
      supportingDocs,
    }, {
      onSuccess: () => {
        setRevenueForm({
          mdaId: "",
          type: "",
          amount: "",
          date: "",
        });
        setUploadedFiles([]);
        alert("Revenue record uploaded successfully!");
      }
    });
  };

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const supportingDocs = uploadedFiles.map(f => `https://storage.example.com/${f.name}`);

    createBudget({
      mdaId: budgetForm.mdaId,
      amount: Number(budgetForm.amount),
      fiscalYear: Number(budgetForm.fiscalYear),
      quarter: 1, // Defaulting to Q1 for now as it's not in the form
      source: "Government", // Default source
      supportingDocs,
    }, {
      onSuccess: () => {
        setBudgetForm({
          mdaId: "",
          amount: "",
          fiscalYear: new Date().getFullYear().toString(),
          category: "",
        });
        setUploadedFiles([]);
        alert("Budget record uploaded successfully!");
      }
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Upload Financial Data
          </h1>
          <p className="text-muted-foreground mt-1">
            Add expenditure, revenue, and budget records with supporting
            documents
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back to Dashboard
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="expenditure">Expenditure</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
        </TabsList>

        {/* Expenditure Tab */}
        <TabsContent value="expenditure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Record Expenditure</CardTitle>
              <CardDescription>
                Add a new expenditure record with supporting documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleExpenditureSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project">Project</Label>
                    <Select
                      value={expenditureForm.projectId}
                      onValueChange={(value) =>
                        setExpenditureForm({
                          ...expenditureForm,
                          projectId: value,
                        })
                      }
                    >
                      <SelectTrigger id="project">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="proj-1">
                          Infrastructure Development
                        </SelectItem>
                        <SelectItem value="proj-2">
                          Healthcare Initiative
                        </SelectItem>
                        <SelectItem value="proj-3">
                          Education Program
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={expenditureForm.category}
                      onValueChange={(value) =>
                        setExpenditureForm({
                          ...expenditureForm,
                          category: value,
                        })
                      }
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
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

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (USD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={expenditureForm.amount}
                      onChange={(e) =>
                        setExpenditureForm({
                          ...expenditureForm,
                          amount: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={expenditureForm.date}
                      onChange={(e) =>
                        setExpenditureForm({
                          ...expenditureForm,
                          date: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient/Vendor</Label>
                  <Input
                    id="recipient"
                    placeholder="Enter recipient name"
                    value={expenditureForm.recipient}
                    onChange={(e) =>
                      setExpenditureForm({
                        ...expenditureForm,
                        recipient: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-4">
                  <Label>Supporting Documents</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, DOC, XLS, JPG, PNG up to 10MB
                      </p>
                    </label>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Uploaded Files:</p>
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-muted p-3 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{file.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isExpenditurePending}
                  className="w-full"
                >
                  {isExpenditurePending ? "Uploading..." : "Record Expenditure"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Record Revenue</CardTitle>
              <CardDescription>
                Add a new revenue record with supporting documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRevenueSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mda">MDA</Label>
                    <Select
                      value={revenueForm.mdaId}
                      onValueChange={(value) =>
                        setRevenueForm({ ...revenueForm, mdaId: value })
                      }
                    >
                      <SelectTrigger id="mda">
                        <SelectValue placeholder="Select MDA" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mda-1">
                          Ministry of Finance
                        </SelectItem>
                        <SelectItem value="mda-2">
                          Ministry of Health
                        </SelectItem>
                        <SelectItem value="mda-3">
                          Ministry of Education
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Revenue Type</Label>
                    <Select
                      value={revenueForm.type}
                      onValueChange={(value) =>
                        setRevenueForm({ ...revenueForm, type: value })
                      }
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {REVENUE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rev-amount">Amount (USD)</Label>
                    <Input
                      id="rev-amount"
                      type="number"
                      placeholder="0.00"
                      value={revenueForm.amount}
                      onChange={(e) =>
                        setRevenueForm({
                          ...revenueForm,
                          amount: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rev-date">Date</Label>
                    <Input
                      id="rev-date"
                      type="date"
                      value={revenueForm.date}
                      onChange={(e) =>
                        setRevenueForm({ ...revenueForm, date: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div className="space-y-4">
                  <Label>Supporting Documents</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload-revenue"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                    />
                    <label
                      htmlFor="file-upload-revenue"
                      className="cursor-pointer"
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, DOC, XLS, JPG, PNG up to 10MB
                      </p>
                    </label>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Uploaded Files:</p>
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-muted p-3 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{file.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isRevenuePending}
                  className="w-full"
                >
                  {isRevenuePending ? "Uploading..." : "Record Revenue"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Budget</CardTitle>
              <CardDescription>
                Add a new budget allocation record
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBudgetSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget-mda">MDA</Label>
                    <Select
                      value={budgetForm.mdaId}
                      onValueChange={(value) =>
                        setBudgetForm({ ...budgetForm, mdaId: value })
                      }
                    >
                      <SelectTrigger id="budget-mda">
                        <SelectValue placeholder="Select MDA" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mda-1">
                          Ministry of Finance
                        </SelectItem>
                        <SelectItem value="mda-2">
                          Ministry of Health
                        </SelectItem>
                        <SelectItem value="mda-3">
                          Ministry of Education
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fiscal-year">Fiscal Year</Label>
                    <Input
                      id="fiscal-year"
                      type="number"
                      value={budgetForm.fiscalYear}
                      onChange={(e) =>
                        setBudgetForm({
                          ...budgetForm,
                          fiscalYear: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget-category">Category</Label>
                    <Select
                      value={budgetForm.category}
                      onValueChange={(value) =>
                        setBudgetForm({ ...budgetForm, category: value })
                      }
                    >
                      <SelectTrigger id="budget-category">
                        <SelectValue placeholder="Select category" />
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

                  <div className="space-y-2">
                    <Label htmlFor="budget-amount">Amount (USD)</Label>
                    <Input
                      id="budget-amount"
                      type="number"
                      placeholder="0.00"
                      value={budgetForm.amount}
                      onChange={(e) =>
                        setBudgetForm({ ...budgetForm, amount: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div className="space-y-4">
                  <Label>Supporting Documents</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload-budget"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                    />
                    <label
                      htmlFor="file-upload-budget"
                      className="cursor-pointer"
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, DOC, XLS, JPG, PNG up to 10MB
                      </p>
                    </label>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Uploaded Files:</p>
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-muted p-3 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{file.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isBudgetPending}
                  className="w-full"
                >
                  {isBudgetPending ? "Uploading..." : "Upload Budget"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
