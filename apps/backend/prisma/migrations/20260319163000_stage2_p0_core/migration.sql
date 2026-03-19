-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('single', 'multiple', 'boolean', 'case');

-- CreateEnum
CREATE TYPE "QuestionDifficulty" AS ENUM ('easy', 'medium', 'hard');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "positionName" TEXT NOT NULL DEFAULT '未配置';

-- AlterTable
ALTER TABLE "Exam"
ADD COLUMN "isRetake" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "sourceExamId" TEXT,
ADD COLUMN "createdBy" TEXT;

-- AlterTable
ALTER TABLE "Notification"
ADD COLUMN "sourceType" TEXT,
ADD COLUMN "sourceKey" TEXT;

-- CreateTable
CREATE TABLE "QuestionBank" (
    "id" TEXT NOT NULL,
    "stem" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "options" JSONB NOT NULL,
    "correctOptionIds" JSONB NOT NULL,
    "knowledgeTag" TEXT NOT NULL,
    "difficulty" "QuestionDifficulty" NOT NULL DEFAULT 'medium',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionBank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamAssignment" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRetake" BOOLEAN NOT NULL DEFAULT false,
    "sourceExamId" TEXT,

    CONSTRAINT "ExamAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "detail" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionBank_type_difficulty_isActive_idx" ON "QuestionBank"("type", "difficulty", "isActive");

-- CreateIndex
CREATE INDEX "QuestionBank_knowledgeTag_idx" ON "QuestionBank"("knowledgeTag");

-- CreateIndex
CREATE UNIQUE INDEX "ExamAssignment_examId_userId_key" ON "ExamAssignment"("examId", "userId");

-- CreateIndex
CREATE INDEX "ExamAssignment_userId_idx" ON "ExamAssignment"("userId");

-- CreateIndex
CREATE INDEX "ExamAssignment_sourceExamId_idx" ON "ExamAssignment"("sourceExamId");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_sourceKey_key" ON "Notification"("sourceKey");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_createdAt_idx" ON "AuditLog"("entityType", "createdAt");

-- AddForeignKey
ALTER TABLE "ExamAssignment" ADD CONSTRAINT "ExamAssignment_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAssignment" ADD CONSTRAINT "ExamAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
