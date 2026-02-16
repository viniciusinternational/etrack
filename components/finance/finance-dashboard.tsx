"use client";


import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MOCK_BUDGETS, MOCK_EXPENDITURES, MOCK_REVENUES } from "./constants";
import { DollarSign, TrendingUp, AlertCircle, FileText } from "lucide-react";

export function FinanceDashboard() {


  // Calculate financial summary
  const totalBudget = MOCK_BUDGETS.reduce((sum, b) => sum + b.amount, 0);
  const totalExpenditure = MOCK_EXPENDITURES.reduce(
    (sum, e) => sum + e.amount,
    0
  );
  const totalRevenue = MOCK_REVENUES.reduce((sum, r) => sum + r.amount, 0);
  const budgetUtilization = (totalExpenditure / totalBudget) * 100;

  // Chart data
  const budgetVsExpenditureData = [
    {
      name: "Ministry of Finance",
      budget: 5000000,
      expenditure: 2300000,
      revenue: 2500000,
    },
    {
      name: "Ministry of Health",
      budget: 3000000,
      expenditure: 2000000,
      revenue: 1200000,
    },
  ];

  const monthlyTrendData = [
    { month: "Jan", budget: 5000000, expenditure: 1200000, revenue: 1500000 },
    { month: "Feb", budget: 5000000, expenditure: 1400000, revenue: 1800000 },
    { month: "Mar", budget: 5000000, expenditure: 1100000, revenue: 1600000 },
    { month: "Apr", budget: 5000000, expenditure: 1300000, revenue: 1700000 },
  ];

  const expenditureByCategory = [
    { name: "Personnel", value: 1200000 },
    { name: "Operations", value: 800000 },
    { name: "Capital", value: 600000 },
    { name: "Maintenance", value: 400000 },
  ];

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Finance Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Budget, expenditure, and revenue overview
          </p>
        </div>
        <Link href="/upload">
          <Button className="gap-2">
            <FileText className="h-4 w-4" />
            Upload Financial Data
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBudget)}
            </div>
            <p className="text-xs text-muted-foreground">Fiscal Year 2024</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenditure
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalExpenditure)}
            </div>
            <p className="text-xs text-muted-foreground">
              {budgetUtilization.toFixed(1)}% of budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {((totalRevenue / totalBudget) * 100).toFixed(1)}% of budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Remaining Budget
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBudget - totalExpenditure)}
            </div>
            <p className="text-xs text-muted-foreground">
              {(100 - budgetUtilization).toFixed(1)}% available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget vs Expenditure */}
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Expenditure by MDA</CardTitle>
            <CardDescription>
              Comparison of allocated vs spent budget
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                budget: { label: "Budget", color: "hsl(var(--chart-1))" },
                expenditure: {
                  label: "Expenditure",
                  color: "hsl(var(--chart-2))",
                },
                revenue: { label: "Revenue", color: "hsl(var(--chart-3))" },
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetVsExpenditureData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="budget" fill="var(--color-budget)" />
                  <Bar dataKey="expenditure" fill="var(--color-expenditure)" />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Financial Trend</CardTitle>
            <CardDescription>
              Budget, expenditure, and revenue over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                budget: { label: "Budget", color: "hsl(var(--chart-1))" },
                expenditure: {
                  label: "Expenditure",
                  color: "hsl(var(--chart-2))",
                },
                revenue: { label: "Revenue", color: "hsl(var(--chart-3))" },
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="budget"
                    stroke="var(--color-budget)"
                  />
                  <Line
                    type="monotone"
                    dataKey="expenditure"
                    stroke="var(--color-expenditure)"
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Expenditure by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Expenditure Distribution</CardTitle>
          <CardDescription>Breakdown by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartContainer
              config={{
                value: { label: "Amount", color: "hsl(var(--chart-1))" },
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenditureByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) =>
                      `${name}: ${formatCurrency(value)}`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenditureByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border border-border rounded-lg p-2">
                            <p className="text-sm font-medium">
                              {payload[0].payload.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(payload[0].value as number)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="space-y-4">
              {expenditureByCategory.map((category, index) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="text-sm font-medium">
                        {category.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold">
                      {formatCurrency(category.value)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${(category.value / 3000000) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenditures */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenditures</CardTitle>
            <CardDescription>Latest spending transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_EXPENDITURES.slice(0, 5).map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell className="font-medium">
                      {exp.project?.title}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {exp.recipient}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(exp.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Revenues */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Revenues</CardTitle>
            <CardDescription>Latest income transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MDA</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_REVENUES.slice(0, 5).map((rev) => (
                  <TableRow key={rev.id}>
                    <TableCell className="font-medium">
                      {rev.mda?.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{rev.type}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(rev.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
