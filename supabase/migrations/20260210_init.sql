-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('President', 'VicePresident', 'CEO', 'CFO', 'ProjectManager', 'MarketingManager', 'Member', 'Admin');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('Executive', 'Finance', 'Projects', 'Marketing', 'Operations', 'HR', 'IT');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('Planning', 'Active', 'OnHold', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "ProjectCategory" AS ENUM ('Technology', 'Innovation', 'Research', 'Community', 'Education', 'Business', 'Other');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('Low', 'Medium', 'High', 'Critical');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'InProgress', 'Review', 'Done', 'Blocked');

-- CreateEnum
CREATE TYPE "MemberCategory" AS ENUM ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('Active', 'Inactive', 'Suspended', 'Alumni');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('Conference', 'Workshop', 'Networking', 'Summit', 'Webinar', 'Meeting', 'Social', 'Training', 'Other');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('Planned', 'Active', 'Completed', 'Cancelled', 'Postponed');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('Pending', 'Paid', 'Refunded', 'Completed', 'Failed', 'Cancelled');

-- CreateEnum
CREATE TYPE "FinanceType" AS ENUM ('Income', 'Expense');

-- CreateEnum
CREATE TYPE "FinanceCategory" AS ENUM ('Sponsorship', 'MembershipFees', 'EventRevenue', 'Donations', 'Grants', 'Sales', 'Salaries', 'OfficeRent', 'Utilities', 'Marketing', 'Events', 'Equipment', 'Software', 'Travel', 'Insurance', 'Legal', 'Miscellaneous');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('Cash', 'Check', 'CreditCard', 'DebitCard', 'BankTransfer', 'PayPal', 'Stripe', 'Other');

-- CreateEnum
CREATE TYPE "SponsorLevel" AS ENUM ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond');

-- CreateEnum
CREATE TYPE "SponsorStatus" AS ENUM ('Active', 'Inactive', 'Pending', 'Expired');

-- CreateEnum
CREATE TYPE "SponsorType" AS ENUM ('Corporate', 'Individual', 'Foundation', 'Government', 'NonProfit');

-- CreateEnum
CREATE TYPE "SponsorFrequency" AS ENUM ('OneTime', 'Monthly', 'Quarterly', 'Yearly');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('Present', 'Absent', 'Late', 'HalfDay', 'WorkFromHome', 'OnLeave');

-- CreateEnum
CREATE TYPE "WorkType" AS ENUM ('Office', 'Remote', 'Hybrid', 'FieldWork', 'ClientSite');

-- CreateEnum
CREATE TYPE "CheckMethod" AS ENUM ('Manual', 'QRCode', 'Biometric', 'RFID', 'MobileApp');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('Weekly', 'Monthly', 'Quarterly', 'Annual', 'Project', 'Financial', 'Event', 'Custom');

-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('Executive', 'Financial', 'Operations', 'Marketing', 'HR', 'Projects', 'Events', 'Compliance');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('Draft', 'InReview', 'Approved', 'Published', 'Archived');

-- CreateEnum
CREATE TYPE "Trend" AS ENUM ('Up', 'Down', 'Stable', 'NA');

-- CreateEnum
CREATE TYPE "KPIStatus" AS ENUM ('OnTrack', 'AtRisk', 'Behind', 'Exceeded');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('Pending', 'Approved', 'Rejected', 'ChangesRequested');

-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('Public', 'Internal', 'Restricted', 'Confidential');

-- CreateEnum
CREATE TYPE "ChartType" AS ENUM ('Line', 'Bar', 'Pie', 'Doughnut', 'Area', 'Scatter');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('Contract', 'Invoice', 'Receipt', 'Agreement', 'Other');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "supabaseId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'Member',
    "avatar" TEXT,
    "department" "Department" NOT NULL DEFAULT 'Operations',
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" TIMESTAMP(3),
    "permissions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ProjectCategory" NOT NULL DEFAULT 'Other',
    "status" "ProjectStatus" NOT NULL DEFAULT 'Planning',
    "priority" "Priority" NOT NULL DEFAULT 'Medium',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "budgetAllocated" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "budgetSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "budgetRemaining" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "managerId" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTeamMember" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMilestone" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectAttachment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectNote" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "Priority" NOT NULL DEFAULT 'Medium',
    "dueDate" TIMESTAMP(3),
    "estimatedHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actualHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskChecklistItem" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TaskChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskComment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskAttachment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskDependency" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "dependsOnId" TEXT NOT NULL,

    CONSTRAINT "TaskDependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "category" "MemberCategory" NOT NULL DEFAULT 'Bronze',
    "status" "MemberStatus" NOT NULL DEFAULT 'Active',
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateOfBirth" TIMESTAMP(3),
    "notes" TEXT,
    "avatar" TEXT,
    "interests" TEXT[],
    "skills" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "addressStreet" TEXT,
    "addressCity" TEXT,
    "addressState" TEXT,
    "addressZipCode" TEXT,
    "addressCountry" TEXT DEFAULT 'USA',
    "companyName" TEXT,
    "companyPosition" TEXT,
    "educationDegree" TEXT,
    "educationInstitution" TEXT,
    "educationGraduationYear" INTEGER,
    "linkedinUrl" TEXT,
    "twitterUrl" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "emergencyName" TEXT,
    "emergencyRelationship" TEXT,
    "emergencyPhone" TEXT,
    "membershipFeeAmount" DOUBLE PRECISION,
    "membershipPaidDate" TIMESTAMP(3),
    "membershipExpiryDate" TIMESTAMP(3),

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberEventAttendance" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "attendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberEventAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "EventType" NOT NULL DEFAULT 'Other',
    "status" "EventStatus" NOT NULL DEFAULT 'Planned',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "banner" TEXT,
    "tags" TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "locationVenue" TEXT NOT NULL,
    "locationAddress" TEXT,
    "locationCity" TEXT,
    "locationState" TEXT,
    "locationZipCode" TEXT,
    "locationCountry" TEXT,
    "locationIsVirtual" BOOLEAN NOT NULL DEFAULT false,
    "locationVirtualLink" TEXT,
    "pricingIsFree" BOOLEAN NOT NULL DEFAULT true,
    "pricingMemberPrice" DOUBLE PRECISION,
    "pricingNonMemberPrice" DOUBLE PRECISION,
    "pricingEarlyBirdPrice" DOUBLE PRECISION,
    "pricingEarlyBirdDeadline" TIMESTAMP(3),
    "budgetEstimated" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "budgetActual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "organizerId" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSpeaker" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "bio" TEXT,
    "photo" TEXT,

    CONSTRAINT "EventSpeaker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRegistration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "ticketType" TEXT,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'Pending',

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventAgendaItem" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "speaker" TEXT,

    CONSTRAINT "EventAgendaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventAttachment" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "EventAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventFeedback" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Finance" (
    "id" TEXT NOT NULL,
    "type" "FinanceType" NOT NULL,
    "category" "FinanceCategory" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'Cash',
    "status" "PaymentStatus" NOT NULL DEFAULT 'Completed',
    "reference" TEXT,
    "paidBy" TEXT,
    "paidTo" TEXT,
    "invoiceNumber" TEXT,
    "receiptNumber" TEXT,
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,
    "tags" TEXT[],
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringFrequency" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT,
    "eventId" TEXT,
    "sponsorId" TEXT,
    "memberId" TEXT,
    "recordedById" TEXT NOT NULL,
    "approvedById" TEXT,

    CONSTRAINT "Finance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceAttachment" (
    "id" TEXT NOT NULL,
    "financeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinanceAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sponsor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "level" "SponsorLevel" NOT NULL DEFAULT 'Bronze',
    "status" "SponsorStatus" NOT NULL DEFAULT 'Active',
    "type" "SponsorType" NOT NULL DEFAULT 'Corporate',
    "industry" TEXT,
    "notes" TEXT,
    "tags" TEXT[],
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactTitle" TEXT,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "companyWebsite" TEXT,
    "companyDescription" TEXT,
    "companyStreet" TEXT,
    "companyCity" TEXT,
    "companyState" TEXT,
    "companyZipCode" TEXT,
    "companyCountry" TEXT,
    "sponsorshipAmount" DOUBLE PRECISION NOT NULL,
    "sponsorshipCurrency" TEXT NOT NULL DEFAULT 'USD',
    "sponsorshipFrequency" "SponsorFrequency" NOT NULL DEFAULT 'OneTime',
    "sponsorshipStartDate" TIMESTAMP(3) NOT NULL,
    "sponsorshipEndDate" TIMESTAMP(3),
    "sponsorshipTotalCommitted" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sponsorshipTotalReceived" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "linkedinUrl" TEXT,
    "twitterUrl" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "managedById" TEXT,

    CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SponsorBenefit" (
    "id" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "delivered" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SponsorBenefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SponsorEvent" (
    "id" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "sponsorshipLevel" TEXT,
    "amount" DOUBLE PRECISION,

    CONSTRAINT "SponsorEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SponsorProject" (
    "id" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,

    CONSTRAINT "SponsorProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SponsorPayment" (
    "id" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "method" TEXT,
    "reference" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'Pending',

    CONSTRAINT "SponsorPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SponsorDocument" (
    "id" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL DEFAULT 'Other',
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SponsorDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'Present',
    "workType" "WorkType" NOT NULL DEFAULT 'Office',
    "hoursWorked" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "mood" TEXT,
    "productivity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "checkInTime" TIMESTAMP(3) NOT NULL,
    "checkInMethod" "CheckMethod" NOT NULL DEFAULT 'Manual',
    "checkInAddress" TEXT,
    "checkInLat" DOUBLE PRECISION,
    "checkInLng" DOUBLE PRECISION,
    "checkOutTime" TIMESTAMP(3),
    "checkOutMethod" "CheckMethod",
    "checkOutAddress" TEXT,
    "checkOutLat" DOUBLE PRECISION,
    "checkOutLng" DOUBLE PRECISION,
    "overtimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overtimeApproved" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "verifiedById" TEXT,
    "overtimeApprovedById" TEXT,
    "projectId" TEXT,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceBreak" (
    "id" TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" DOUBLE PRECISION,
    "type" TEXT NOT NULL DEFAULT 'Other',

    CONSTRAINT "AttendanceBreak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceTask" (
    "id" TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "hoursSpent" DOUBLE PRECISION,

    CONSTRAINT "AttendanceTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "category" "ReportCategory" NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'Draft',
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "highlights" TEXT[],
    "challenges" TEXT[],
    "recommendations" TEXT[],
    "nextSteps" TEXT[],
    "tags" TEXT[],
    "views" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "isConfidential" BOOLEAN NOT NULL DEFAULT false,
    "accessLevel" "AccessLevel" NOT NULL DEFAULT 'Internal',
    "publishedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "periodStartDate" TIMESTAMP(3) NOT NULL,
    "periodEndDate" TIMESTAMP(3) NOT NULL,
    "financialsIncome" DOUBLE PRECISION,
    "financialsExpenses" DOUBLE PRECISION,
    "financialsNetIncome" DOUBLE PRECISION,
    "financialsBudget" DOUBLE PRECISION,
    "financialsBudgetVariance" DOUBLE PRECISION,
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportMetric" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT,
    "trend" "Trend" NOT NULL DEFAULT 'NA',
    "change" DOUBLE PRECISION,

    CONSTRAINT "ReportMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportKPI" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "target" DOUBLE PRECISION,
    "actual" DOUBLE PRECISION,
    "unit" TEXT,
    "status" "KPIStatus" NOT NULL DEFAULT 'OnTrack',

    CONSTRAINT "ReportKPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportProject" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" TEXT,
    "progress" INTEGER,
    "highlights" TEXT,

    CONSTRAINT "ReportProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportEvent" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "attendance" INTEGER,
    "feedback" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "ReportEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportChart" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "type" "ChartType" NOT NULL,
    "title" TEXT,
    "data" TEXT NOT NULL,

    CONSTRAINT "ReportChart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportAttachment" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportReviewer" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'Pending',
    "comments" TEXT,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "ReportReviewer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseId_key" ON "User"("supabaseId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_supabaseId_idx" ON "User"("supabaseId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_managerId_idx" ON "Project"("managerId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectTeamMember_projectId_userId_key" ON "ProjectTeamMember"("projectId", "userId");

-- CreateIndex
CREATE INDEX "Task_projectId_status_idx" ON "Task"("projectId", "status");

-- CreateIndex
CREATE INDEX "Task_assignedToId_status_idx" ON "Task"("assignedToId", "status");

-- CreateIndex
CREATE INDEX "Task_dueDate_idx" ON "Task"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "TaskDependency_taskId_dependsOnId_key" ON "TaskDependency"("taskId", "dependsOnId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE INDEX "Member_email_idx" ON "Member"("email");

-- CreateIndex
CREATE INDEX "Member_status_idx" ON "Member"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MemberEventAttendance_memberId_eventId_key" ON "MemberEventAttendance"("memberId", "eventId");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_eventId_memberId_key" ON "EventRegistration"("eventId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "EventFeedback_eventId_memberId_key" ON "EventFeedback"("eventId", "memberId");

-- CreateIndex
CREATE INDEX "Finance_type_date_idx" ON "Finance"("type", "date");

-- CreateIndex
CREATE INDEX "Finance_category_date_idx" ON "Finance"("category", "date");

-- CreateIndex
CREATE INDEX "Finance_status_idx" ON "Finance"("status");

-- CreateIndex
CREATE INDEX "Sponsor_status_idx" ON "Sponsor"("status");

-- CreateIndex
CREATE INDEX "Sponsor_level_idx" ON "Sponsor"("level");

-- CreateIndex
CREATE UNIQUE INDEX "SponsorEvent_sponsorId_eventId_key" ON "SponsorEvent"("sponsorId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "SponsorProject_sponsorId_projectId_key" ON "SponsorProject"("sponsorId", "projectId");

-- CreateIndex
CREATE INDEX "Attendance_userId_date_idx" ON "Attendance"("userId", "date");

-- CreateIndex
CREATE INDEX "Report_type_periodStartDate_idx" ON "Report"("type", "periodStartDate");

-- CreateIndex
CREATE INDEX "Report_category_status_idx" ON "Report"("category", "status");

-- CreateIndex
CREATE INDEX "Report_createdById_idx" ON "Report"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "ReportReviewer_reportId_userId_key" ON "ReportReviewer"("reportId", "userId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTeamMember" ADD CONSTRAINT "ProjectTeamMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTeamMember" ADD CONSTRAINT "ProjectTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMilestone" ADD CONSTRAINT "ProjectMilestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAttachment" ADD CONSTRAINT "ProjectAttachment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectNote" ADD CONSTRAINT "ProjectNote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectNote" ADD CONSTRAINT "ProjectNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskChecklistItem" ADD CONSTRAINT "TaskChecklistItem_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAttachment" ADD CONSTRAINT "TaskAttachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_dependsOnId_fkey" FOREIGN KEY ("dependsOnId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberEventAttendance" ADD CONSTRAINT "MemberEventAttendance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberEventAttendance" ADD CONSTRAINT "MemberEventAttendance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSpeaker" ADD CONSTRAINT "EventSpeaker_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAgendaItem" ADD CONSTRAINT "EventAgendaItem_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttachment" ADD CONSTRAINT "EventAttachment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventFeedback" ADD CONSTRAINT "EventFeedback_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventFeedback" ADD CONSTRAINT "EventFeedback_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finance" ADD CONSTRAINT "Finance_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finance" ADD CONSTRAINT "Finance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finance" ADD CONSTRAINT "Finance_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finance" ADD CONSTRAINT "Finance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finance" ADD CONSTRAINT "Finance_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finance" ADD CONSTRAINT "Finance_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceAttachment" ADD CONSTRAINT "FinanceAttachment_financeId_fkey" FOREIGN KEY ("financeId") REFERENCES "Finance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_managedById_fkey" FOREIGN KEY ("managedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsorBenefit" ADD CONSTRAINT "SponsorBenefit_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsorEvent" ADD CONSTRAINT "SponsorEvent_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsorEvent" ADD CONSTRAINT "SponsorEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsorProject" ADD CONSTRAINT "SponsorProject_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsorProject" ADD CONSTRAINT "SponsorProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsorPayment" ADD CONSTRAINT "SponsorPayment_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsorDocument" ADD CONSTRAINT "SponsorDocument_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_overtimeApprovedById_fkey" FOREIGN KEY ("overtimeApprovedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceBreak" ADD CONSTRAINT "AttendanceBreak_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceTask" ADD CONSTRAINT "AttendanceTask_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceTask" ADD CONSTRAINT "AttendanceTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportMetric" ADD CONSTRAINT "ReportMetric_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportKPI" ADD CONSTRAINT "ReportKPI_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportProject" ADD CONSTRAINT "ReportProject_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportProject" ADD CONSTRAINT "ReportProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportEvent" ADD CONSTRAINT "ReportEvent_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportEvent" ADD CONSTRAINT "ReportEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportChart" ADD CONSTRAINT "ReportChart_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportAttachment" ADD CONSTRAINT "ReportAttachment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportReviewer" ADD CONSTRAINT "ReportReviewer_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportReviewer" ADD CONSTRAINT "ReportReviewer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

