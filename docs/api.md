# E-Track — Production API & MongoDB Design (Next.js 15)

This document is a complete, implementation-ready guide for building E‑Track with **Next.js 15 (App Router)**, **TypeScript**, **MongoDB (Mongoose)**, **Zod**, and **React Query**. It includes database schemas, controllers/services, validated API routes, RBAC, caching, rate limits, and examples of transactions.

---

## 1. Tech Stack

- **Frontend/SSR**: Next.js 15 (App Router), TypeScript
- **UI**: TailwindCSS, shadcn/ui, lucide-react
- **State/Data**: TanStack Query (React Query) with SSR hydration
- **Validation**: Zod
- **Database**: MongoDB Atlas (Replica Set), **Mongoose** ODM
- **Auth**: NextAuth.js (Credentials/JWT) + route middleware
- **File Storage**: S3-compatible (MinIO/AWS S3) with presigned URLs
- **Queues/Jobs**: BullMQ (Redis) — report generation, email/notify, cache warmers
- **Cache**: Redis (dashboard aggregates, rate limiting counters)
- **Logging**: pino (server), browser console w/ log levels
- **Monitoring**: OpenTelemetry (OTEL) + Prometheus exporters
- **CI/CD**: GitHub Actions → Docker images →
- **Security**: Helmet headers, CORS (strict), TLS, input validation via Zod, RBAC

---

## 2. Roles & RBAC (including SuperAdmin)

```ts
// types/roles.ts
export enum UserRole {
  SuperAdmin = "SuperAdmin",
  GovernorAdmin = "GovernorAdmin",
  ProjectManager = "ProjectManager",
  Contractor = "Contractor",
  FinanceOfficer = "FinanceOfficer",
  ProcurementOfficer = "ProcurementOfficer",
  Vendor = "Vendor",
  Auditor = "Auditor",
  MeetingUser = "MeetingUser",
}
```

**MDA scoping**: ProjectManager/FinanceOfficer/ProcurementOfficer actions are restricted to `user.mdaId`.

---

## 3. Directory Layout for API/Server Code

```
app/
  api/
    auth/
      login/route.ts
      refresh/route.ts
      me/route.ts
    users/route.ts                  # SuperAdmin only
    mdas/route.ts                   # SuperAdmin only

    projects/route.ts               # GET(list/create)
    projects/[id]/route.ts          # GET/PATCH
    projects/[id]/milestones/route.ts        # POST (contractor)
    milestones/[id]/review/route.ts          # POST (approve/reject)

    finance/
      budgets/route.ts              # GET/POST
      expenditures/route.ts         # GET/POST
      revenues/route.ts             # GET/POST

    procurement/
      tenders/route.ts              # GET/POST
      tenders/[id]/route.ts         # GET/PATCH
      tenders/[id]/bids/route.ts    # POST (vendor)
      awards/route.ts               # GET/POST

    meetings/route.ts               # GET/POST
    meetings/[id]/minutes/route.ts  # POST

    audit/discrepancies/route.ts    # GET/POST

    dashboards/
      governor/route.ts             # GET (cached aggregates)
      mda/route.ts                  # GET (per-MDA)

    uploads/presign/route.ts        # POST presigned URL

server/
  db/connect.ts
  models/*.ts
  services/*.ts
  controllers/*.ts
  middleware/
    auth.ts
    rbac.ts
    mda-scope.ts
    rate-limit.ts
  utils/
    responses.ts
    errors.ts
    s3.ts
    pagination.ts
    logger.ts
```

---

## 4. MongoDB Models (Mongoose)

```ts
// server/models/User.ts
import { Schema, model, models } from "mongoose";
import { UserRole } from "@/types/roles";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
    mdaId: { type: Schema.Types.ObjectId, ref: "MDA" },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.User || model("User", UserSchema);
```

```ts
// server/models/MDA.ts
import { Schema, model, models } from "mongoose";
const MDASchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    category: { type: String, required: true },
  },
  { timestamps: true }
);
export default models.MDA || model("MDA", MDASchema);
```

```ts
// server/models/Project.ts
import { Schema, model, models } from "mongoose";

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true, index: "text" },
    description: { type: String, required: true },
    category: { type: String, required: true },
    supervisingMdaId: {
      type: Schema.Types.ObjectId,
      ref: "MDA",
      required: true,
      index: true,
    },
    contractorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    contractValue: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Planned", "InProgress", "Delayed", "Completed"],
      default: "Planned",
      index: true,
    },
    evidenceDocs: [{ type: String }], // S3 keys
  },
  { timestamps: true }
);

ProjectSchema.index({ supervisingMdaId: 1, status: 1 });
export default models.Project || model("Project", ProjectSchema);
```

```ts
// server/models/MilestoneSubmission.ts
import { Schema, model, models } from "mongoose";

const MilestoneSubmissionSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    contractorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    milestoneStage: {
      type: String,
      enum: [
        "PreConstruction",
        "Foundation",
        "Superstructure",
        "Finishing",
        "TestingCommissioning",
        "Handover",
      ],
      required: true,
    },
    percentComplete: { type: Number, min: 0, max: 100, required: true },
    notes: { type: String },
    geoTag: {
      type: { type: String, enum: ["Point"] },
      coordinates: { type: [Number], index: "2dsphere" },
    },
    evidenceDocs: [{ type: String, required: true }],
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

export default models.MilestoneSubmission ||
  model("MilestoneSubmission", MilestoneSubmissionSchema);
```

```ts
// server/models/Finance.ts
import { Schema, model, models } from "mongoose";

const BudgetAllocationSchema = new Schema(
  {
    mdaId: {
      type: Schema.Types.ObjectId,
      ref: "MDA",
      required: true,
      index: true,
    },
    fiscalYear: { type: Number, required: true, index: true },
    quarter: { type: Number, enum: [1, 2, 3, 4], required: true },
    amount: { type: Number, required: true },
    source: { type: String, required: true },
    supportingDocs: [{ type: String }],
  },
  { timestamps: true }
);

const ExpenditureSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    date: { type: Date, required: true, index: true },
    recipient: { type: String, required: true },
    supportingDocs: [{ type: String }],
  },
  { timestamps: true }
);

const RevenueSchema = new Schema(
  {
    mdaId: {
      type: Schema.Types.ObjectId,
      ref: "MDA",
      required: true,
      index: true,
    },
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true, index: true },
    supportingDocs: [{ type: String }],
  },
  { timestamps: true }
);

export const BudgetAllocation =
  models.BudgetAllocation || model("BudgetAllocation", BudgetAllocationSchema);
export const Expenditure =
  models.Expenditure || model("Expenditure", ExpenditureSchema);
export const Revenue = models.Revenue || model("Revenue", RevenueSchema);
```

```ts
// server/models/Procurement.ts
import { Schema, model, models } from "mongoose";

const ProcurementRequestSchema = new Schema(
  {
    mdaId: {
      type: Schema.Types.ObjectId,
      ref: "MDA",
      required: true,
      index: true,
    },
    title: { type: String, required: true, index: "text" },
    description: { type: String, required: true },
    estimatedCost: { type: Number, required: true },
    requestDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Open", "Bidding", "Awarded", "Closed"],
      default: "Open",
      index: true,
    },
    documents: [{ type: String }],
  },
  { timestamps: true }
);

const BidSchema = new Schema(
  {
    procurementRequestId: {
      type: Schema.Types.ObjectId,
      ref: "ProcurementRequest",
      required: true,
      index: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    bidAmount: { type: Number, required: true },
    proposalDocs: [{ type: String, required: true }],
    complianceDocs: [{ type: String, required: true }],
    status: {
      type: String,
      enum: ["Submitted", "Rejected", "Awarded"],
      default: "Submitted",
      index: true,
    },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const AwardSchema = new Schema(
  {
    procurementRequestId: {
      type: Schema.Types.ObjectId,
      ref: "ProcurementRequest",
      required: true,
      index: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    contractValue: { type: Number, required: true },
    awardDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const ProcurementRequest =
  models.ProcurementRequest ||
  model("ProcurementRequest", ProcurementRequestSchema);
export const Bid = models.Bid || model("Bid", BidSchema);
export const Award = models.Award || model("Award", AwardSchema);
```

```ts
// server/models/Meeting.ts
import { Schema, model, models } from "mongoose";

const MeetingSchema = new Schema(
  {
    title: { type: String, required: true },
    agendaDocs: [{ type: String }],
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    scheduledAt: { type: Date, required: true },
    locationOrLink: { type: String, required: true },
  },
  { timestamps: true }
);

const MeetingMinutesSchema = new Schema(
  {
    meetingId: {
      type: Schema.Types.ObjectId,
      ref: "Meeting",
      required: true,
      index: true,
    },
    decisions: [{ type: String, required: true }],
    actionItems: [
      {
        task: String,
        responsibleUserId: { type: Schema.Types.ObjectId, ref: "User" },
        dueDate: Date,
      },
    ],
    attachments: [{ type: String }],
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Meeting = models.Meeting || model("Meeting", MeetingSchema);
export const MeetingMinutes =
  models.MeetingMinutes || model("MeetingMinutes", MeetingMinutesSchema);
```

```ts
// server/models/DiscrepancyRemark.ts
import { Schema, model, models } from "mongoose";

const DiscrepancyRemarkSchema = new Schema(
  {
    entityId: { type: Schema.Types.ObjectId, required: true }, // references any doc id
    module: {
      type: String,
      enum: ["budget", "expenditure", "revenue", "procurement", "project"],
      required: true,
    },
    auditorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, required: true },
    status: {
      type: String,
      enum: ["Open", "Resolved", "Escalated"],
      default: "Open",
      index: true,
    },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export default models.DiscrepancyRemark ||
  model("DiscrepancyRemark", DiscrepancyRemarkSchema);
```

**Indexing guidelines**

- Text indexes on searchable fields (e.g., Project.title, Procurement.title)
- Compound indexes for common filters (e.g., `{ supervisingMdaId, status }`)
- 2dsphere index on `MilestoneSubmission.geoTag`

---

## 5. DB Connection (Mongoose)

```ts
// server/db/connect.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!; // set in env

declare global {
  // Next.js hot-reload safe cache
  // eslint-disable-next-line no-var
  var _mongoose: Promise<typeof mongoose> | undefined;
}

export async function dbConnect() {
  if (!global._mongoose) {
    global._mongoose = mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB || "etrack",
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 5000,
    });
  }
  return global._mongoose;
}
```

---

## 6. Utilities (Responses, Errors, Pagination)

```ts
// server/utils/responses.ts
export function ok<T>(data: T, message = "OK") {
  return Response.json({ ok: true, data, message }, { status: 200 });
}
export function created<T>(data: T, message = "Created") {
  return Response.json({ ok: true, data, message }, { status: 201 });
}
export function badRequest(message = "Bad Request") {
  return Response.json({ ok: false, message }, { status: 400 });
}
export function unauthorized(message = "Unauthorized") {
  return Response.json({ ok: false, message }, { status: 401 });
}
export function forbidden(message = "Forbidden") {
  return Response.json({ ok: false, message }, { status: 403 });
}
export function notFound(message = "Not Found") {
  return Response.json({ ok: false, message }, { status: 404 });
}
export function serverError(message = "Server Error") {
  return Response.json({ ok: false, message }, { status: 500 });
}
```

```ts
// server/utils/pagination.ts
export function getPagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
```

---

## 7. Middleware (Auth, RBAC, MDA scope, Rate Limit)

```ts
// server/middleware/auth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as { id: string; role: string; mdaId?: string };
}
```

```ts
// server/middleware/rbac.ts
import { ROLE_PERMISSIONS, UserRole } from "@/types/roles";

export function requirePermission(
  user: { role: UserRole },
  predicate: (p: (typeof ROLE_PERMISSIONS)[UserRole]) => boolean
) {
  const perms = ROLE_PERMISSIONS[user.role];
  return predicate(perms);
}
```

```ts
// server/middleware/mda-scope.ts
export function ensureSameMDA(userMdaId?: string, resourceMdaId?: string) {
  return (
    !!userMdaId &&
    !!resourceMdaId &&
    String(userMdaId) === String(resourceMdaId)
  );
}
```

```ts
// server/middleware/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
export const limiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
});

export async function rateLimit(ip: string) {
  return limiter.limit(`ratelimit:${ip}`);
}
```

---

## 8. Validation (Zod Schemas)

```ts
// server/validation/project.ts
import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(2),
  supervisingMdaId: z.string().length(24),
  contractorId: z.string().length(24),
  contractValue: z.number().positive(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const milestoneSubmitSchema = z.object({
  milestoneStage: z.enum([
    "PreConstruction",
    "Foundation",
    "Superstructure",
    "Finishing",
    "TestingCommissioning",
    "Handover",
  ]),
  percentComplete: z.number().min(0).max(100),
  notes: z.string().optional(),
  geoTag: z.object({ lat: z.number(), lng: z.number() }).optional(),
  evidenceDocs: z.array(z.string()).min(1),
});
```

---

## 9. Services & Controllers

**Pattern**: Route → Controller (parse/validate) → Service (DB logic) → Response

```ts
// server/services/project.service.ts
import Project from "@/server/models/Project";
import MilestoneSubmission from "@/server/models/MilestoneSubmission";

export async function listProjects(filter: any, skip: number, limit: number) {
  const [items, total] = await Promise.all([
    Project.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Project.countDocuments(filter),
  ]);
  return { items, total };
}

export async function createProject(data: any) {
  const doc = await Project.create({ ...data });
  return doc.toObject();
}

export async function submitMilestone(
  projectId: string,
  contractorId: string,
  payload: any
) {
  const submission = await MilestoneSubmission.create({
    projectId,
    contractorId,
    ...payload,
  });
  return submission.toObject();
}

export async function reviewMilestone(
  submissionId: string,
  reviewerId: string,
  approve: boolean
) {
  const now = new Date();
  const submission = await MilestoneSubmission.findByIdAndUpdate(
    submissionId,
    {
      status: approve ? "Approved" : "Rejected",
      reviewedBy: reviewerId,
      reviewedAt: now,
    },
    { new: true }
  ).lean();
  return submission;
}
```

```ts
// server/services/finance.service.ts
import {
  BudgetAllocation,
  Expenditure,
  Revenue,
} from "@/server/models/Finance";

export async function upsertBudget(input: any) {
  const doc = await BudgetAllocation.findOneAndUpdate(
    {
      mdaId: input.mdaId,
      fiscalYear: input.fiscalYear,
      quarter: input.quarter,
    },
    { $set: input },
    { upsert: true, new: true }
  ).lean();
  return doc;
}

export async function createExpenditure(input: any) {
  return (await Expenditure.create(input)).toObject();
}
export async function createRevenue(input: any) {
  return (await Revenue.create(input)).toObject();
}
```

```ts
// server/services/procurement.service.ts
import { ProcurementRequest, Bid, Award } from "@/server/models/Procurement";

export async function createTender(input: any) {
  return (await ProcurementRequest.create(input)).toObject();
}
export async function listTenders(filter: any, skip: number, limit: number) {
  const [items, total] = await Promise.all([
    ProcurementRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ProcurementRequest.countDocuments(filter),
  ]);
  return { items, total };
}
export async function submitBid(input: any) {
  return (await Bid.create(input)).toObject();
}
export async function createAward(input: any) {
  return (await Award.create(input)).toObject();
}
```

---

## 10. API Route Handlers (Next.js App Router)

### 10.1 Projects

```ts
// app/api/projects/route.ts
import { dbConnect } from "@/server/db/connect";
import { requireAuth } from "@/server/middleware/auth";
import { requirePermission } from "@/server/middleware/rbac";
import { ROLE_PERMISSIONS, UserRole } from "@/types/roles";
import { getPagination } from "@/server/utils/pagination";
import {
  ok,
  created,
  badRequest,
  unauthorized,
  forbidden,
} from "@/server/utils/responses";
import { createProjectSchema } from "@/server/validation/project";
import { createProject, listProjects } from "@/server/services/project.service";

export async function GET(req: Request) {
  await dbConnect();
  const user = await requireAuth();
  if (!user) return unauthorized();

  const url = new URL(req.url);
  const { page, limit, skip } = getPagination(url.searchParams);

  const filter: any = {};
  // GovernorAdmin & SuperAdmin see all; MDA roles only within their MDA
  if (
    user.role !== UserRole.SuperAdmin &&
    user.role !== UserRole.GovernorAdmin
  ) {
    filter.supervisingMdaId = user.mdaId;
  }

  const result = await listProjects(filter, skip, limit);
  return ok({ ...result, page, limit });
}

export async function POST(req: Request) {
  await dbConnect();
  const user = await requireAuth();
  if (!user) return unauthorized();

  const allowed = requirePermission(user as any, (p) => p.canAddProjects);
  if (!allowed) return forbidden();

  const body = await req.json();
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success)
    return badRequest(parsed.error.errors.map((e) => e.message).join(", "));

  // Enforce MDA scope for ProjectManager
  if (
    user.role === UserRole.ProjectManager &&
    String(parsed.data.supervisingMdaId) !== String((user as any).mdaId)
  ) {
    return forbidden("Project must belong to your MDA");
  }

  const doc = await createProject(parsed.data);
  return created(doc);
}
```

```ts
// app/api/projects/[id]/milestones/route.ts
import { dbConnect } from "@/server/db/connect";
import { requireAuth } from "@/server/middleware/auth";
import { requirePermission } from "@/server/middleware/rbac";
import { milestoneSubmitSchema } from "@/server/validation/project";
import { submitMilestone } from "@/server/services/project.service";
import {
  unauthorized,
  forbidden,
  badRequest,
  created,
} from "@/server/utils/responses";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const user = await requireAuth();
  if (!user) return unauthorized();

  const allowed = requirePermission(user as any, (p) => p.canSubmitProgress);
  if (!allowed) return forbidden();

  const payload = await req.json();
  const parsed = milestoneSubmitSchema.safeParse(payload);
  if (!parsed.success)
    return badRequest(parsed.error.errors.map((e) => e.message).join(", "));

  const createdSubmission = await submitMilestone(
    params.id,
    (user as any).id,
    parsed.data
  );
  return created(createdSubmission);
}
```

```ts
// app/api/milestones/[id]/review/route.ts
import { dbConnect } from "@/server/db/connect";
import { requireAuth } from "@/server/middleware/auth";
import { requirePermission } from "@/server/middleware/rbac";
import { reviewMilestone } from "@/server/services/project.service";
import {
  ok,
  unauthorized,
  forbidden,
  badRequest,
} from "@/server/utils/responses";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const user = await requireAuth();
  if (!user) return unauthorized();
  const allowed = requirePermission(
    user as any,
    (p) => p.canApproveSubmissions
  );
  if (!allowed) return forbidden();

  const { decision } = await req.json(); // decision: 'approve' | 'reject'
  if (!["approve", "reject"].includes(decision))
    return badRequest("Invalid decision");

  const updated = await reviewMilestone(
    params.id,
    (user as any).id,
    decision === "approve"
  );
  return ok(updated);
}
```

### 10.2 Finance

```ts
// app/api/finance/budgets/route.ts
import { dbConnect } from "@/server/db/connect";
import { requireAuth } from "@/server/middleware/auth";
import { requirePermission } from "@/server/middleware/rbac";
import { upsertBudget } from "@/server/services/finance.service";
import {
  ok,
  created,
  unauthorized,
  forbidden,
  badRequest,
} from "@/server/utils/responses";

export async function GET(req: Request) {
  await dbConnect();
  const user = await requireAuth();
  if (!user) return unauthorized();

  // filter by MDA if not Super/Governor
  const url = new URL(req.url);
  const mdaId = url.searchParams.get("mdaId");
  const filter: any = {};
  if (user.role !== "SuperAdmin" && user.role !== "GovernorAdmin")
    filter.mdaId = (user as any).mdaId;
  if (mdaId) filter.mdaId = mdaId;

  const docs = await (
    await import("@/server/models/Finance")
  ).BudgetAllocation.find(filter).lean();
  return ok(docs);
}

export async function POST(req: Request) {
  await dbConnect();
  const user = await requireAuth();
  if (!user) return unauthorized();

  const allowed = requirePermission(user as any, (p) => p.canUploadFinance);
  if (!allowed) return forbidden();

  const body = await req.json();
  const required = ["mdaId", "fiscalYear", "quarter", "amount", "source"];
  for (const key of required) {
    if (!(key in body)) return badRequest(`Missing ${key}`);
  }

  if (
    user.role === "FinanceOfficer" &&
    String(body.mdaId) !== String((user as any).mdaId)
  )
    return forbidden("Budget must belong to your MDA");

  const doc = await upsertBudget(body);
  return created(doc);
}
```

### 10.3 Procurement

```ts
// app/api/tenders/route.ts
import { dbConnect } from "@/server/db/connect";
import { requireAuth } from "@/server/middleware/auth";
import { requirePermission } from "@/server/middleware/rbac";
import {
  listTenders,
  createTender,
} from "@/server/services/procurement.service";
import { getPagination } from "@/server/utils/pagination";
import {
  ok,
  created,
  unauthorized,
  forbidden,
  badRequest,
} from "@/server/utils/responses";

export async function GET(req: Request) {
  await dbConnect();
  const user = await requireAuth();
  if (!user) return unauthorized();

  const url = new URL(req.url);
  const { page, limit, skip } = getPagination(url.searchParams);
  const filter: any = {};
  if (
    (user as any).role !== "SuperAdmin" &&
    (user as any).role !== "GovernorAdmin"
  )
    filter.mdaId = (user as any).mdaId;
  const result = await listTenders(filter, skip, limit);
  return ok({ ...result, page, limit });
}

export async function POST(req: Request) {
  await dbConnect();
  const user = await requireAuth();
  if (!user) return unauthorized();
  const allowed = requirePermission(user as any, (p) => p.canManageProcurement);
  if (!allowed) return forbidden();

  const body = await req.json();
  const required = [
    "mdaId",
    "title",
    "description",
    "estimatedCost",
    "requestDate",
  ];
  for (const key of required) {
    if (!(key in body)) return badRequest(`Missing ${key}`);
  }
  if (
    (user as any).role === "ProcurementOfficer" &&
    String(body.mdaId) !== String((user as any).mdaId)
  )
    return forbidden("Tender must belong to your MDA");

  const doc = await createTender({ ...body, status: "Open" });
  return created(doc);
}
```

```ts
// app/api/tenders/[id]/bids/route.ts
import { dbConnect } from "@/server/db/connect";
import { requireAuth } from "@/server/middleware/auth";
import { submitBid } from "@/server/services/procurement.service";
import {
  created,
  unauthorized,
  badRequest,
  forbidden,
} from "@/server/utils/responses";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const user = await requireAuth();
  if (!user) return unauthorized();
  if ((user as any).role !== "Vendor") return forbidden("Vendors only");

  const body = await req.json();
  const required = ["bidAmount", "proposalDocs", "complianceDocs"];
  for (const key of required) {
    if (!(key in body)) return badRequest(`Missing ${key}`);
  }

  const doc = await submitBid({
    procurementRequestId: params.id,
    vendorId: (user as any).id,
    ...body,
  });
  return created(doc);
}
```

### 10.4 Meetings

```ts
// app/api/meetings/route.ts
import { dbConnect } from "@/server/db/connect";
import { requireAuth } from "@/server/middleware/auth";
import {
  ok,
  created,
  unauthorized,
  badRequest,
} from "@/server/utils/responses";
import { Meeting } from "@/server/models/Meeting";

export async function GET() {
  await dbConnect();
  const docs = await Meeting.find({}).sort({ scheduledAt: -1 }).lean();
  return ok(docs);
}

export async function POST(req: Request) {
  await dbConnect();
  const user = await requireAuth();
  if (!user) return unauthorized();
  const body = await req.json();
  const required = ["title", "participants", "scheduledAt", "locationOrLink"];
  for (const key of required) {
    if (!(key in body)) return badRequest(`Missing ${key}`);
  }
  const doc = await Meeting.create(body);
  return created(doc.toObject());
}
```

### 10.5 Audit

```ts
// app/api/audit/discrepancies/route.ts
import { dbConnect } from "@/server/db/connect";
import { requireAuth } from "@/server/middleware/auth";
import {
  ok,
  created,
  unauthorized,
  forbidden,
  badRequest,
} from "@/server/utils/responses";
import DiscrepancyRemark from "@/server/models/DiscrepancyRemark";

export async function GET(req: Request) {
  await dbConnect();
  const user = await requireAuth();
  if (!user) return unauthorized();
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const filter: any = status ? { status } : {};
  const docs = await DiscrepancyRemark.find(filter)
    .sort({ createdAt: -1 })
    .lean();
  return ok(docs);
}

export async function POST(req: Request) {
  await dbConnect();
  const user = await requireAuth();
  if (!user) return unauthorized();
  if ((user as any).role !== "Auditor" && (user as any).role !== "SuperAdmin")
    return forbidden("Auditor or SuperAdmin only");

  const body = await req.json();
  const required = ["entityId", "module", "comment"];
  for (const key of required) {
    if (!(key in body)) return badRequest(`Missing ${key}`);
  }

  const doc = await DiscrepancyRemark.create(body);
  return created(doc.toObject());
}
```

---

## 11. File Uploads (Presigned)

```ts
// server/utils/s3.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const client = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
});

export async function createPresignedUpload(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(client, command, { expiresIn: 60 });
  return { url, key };
}
```

```ts
// app/api/uploads/presign/route.ts
import { createPresignedUpload } from "@/server/utils/s3";
import { unauthorized, badRequest, ok } from "@/server/utils/responses";
import { requireAuth } from "@/server/middleware/auth";

export async function POST(req: Request) {
  const user = await requireAuth();
  if (!user) return unauthorized();
  const { key, contentType } = await req.json();
  if (!key || !contentType) return badRequest("key and contentType required");
  const result = await createPresignedUpload(key, contentType);
  return ok(result);
}
```

---

## 12. Aggregates & Dashboards (Caching)

- Use **MongoDB Aggregation Pipelines** to compute per-MDA KPIs.
- Cache results in **Redis** for 60–300 seconds.

```ts
// app/api/dashboards/mda/route.ts
import { dbConnect } from "@/server/db/connect";
import Project from "@/server/models/Project";
import { ok, unauthorized } from "@/server/utils/responses";
import { requireAuth } from "@/server/middleware/auth";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(req: Request) {
  await dbConnect();
  const user = await requireAuth();
  if (!user) return unauthorized();
  const url = new URL(req.url);
  const mdaId = url.searchParams.get("mdaId") || (user as any).mdaId;
  const cacheKey = `dash:mda:${mdaId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return ok(cached);

  const [counts] = await Project.aggregate([
    {
      $match: {
        supervisingMdaId: new (
          await import("mongoose")
        ).default.Types.ObjectId(mdaId),
      },
    },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  await redis.set(cacheKey, counts, { ex: 120 });
  return ok(counts);
}
```

---

## 13. Transactions (Milestone Review + Project Status)

MongoDB transactions (requires replica set). Example: approving a milestone may update project status if `percentComplete === 100`.

```ts
// server/services/tx.service.ts
import mongoose from "mongoose";
import MilestoneSubmission from "@/server/models/MilestoneSubmission";
import Project from "@/server/models/Project";

export async function approveMilestoneAndMaybeComplete(
  submissionId: string,
  reviewerId: string
) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const sub = await MilestoneSubmission.findByIdAndUpdate(
      submissionId,
      { status: "Approved", reviewedBy: reviewerId, reviewedAt: new Date() },
      { new: true, session }
    );
    if (!sub) throw new Error("Submission not found");

    if (sub.percentComplete === 100) {
      await Project.findByIdAndUpdate(
        sub.projectId,
        { status: "Completed" },
        { session }
      );
    }

    await session.commitTransaction();
    return sub.toObject();
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
}
```

---

## 14. Security Hardening

- Enforce JWT exp/refresh and IP-based rate limits
- Strict CORS to known origins
- Helmet headers on API routes
- Validate **every** input with Zod or explicit checks
- Store only S3 keys, never raw files in DB
- Principle of least privilege in ROLE_PERMISSIONS + MDA scoping

---

---

## 16. Observability

- OTEL instrumentation for route timings
- Log correlation IDs per request (x-request-id)
- Dashboards in Grafana for request rates, errors, latencies

---

## 17. Response Contract (Global)

Every route returns:

```json
{ "ok": true, "data": <T>, "message": "OK" }
```

Errors use `ok: false` with appropriate HTTP codes.

---

## 18. Rollout & Migration Checklist

1. Provision MongoDB Atlas replica set + Redis + S3 bucket
2. Configure env vars (DB, Redis, S3, Auth secrets)
3. Deploy Next.js on Kubernetes (HPA enabled)
4. Seed SuperAdmin user
5. Create MDAs
6. Create role accounts per MDA
7. Verify end-to-end flows and caches
