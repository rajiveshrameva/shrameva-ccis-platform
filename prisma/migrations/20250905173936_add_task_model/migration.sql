-- CreateEnum
CREATE TYPE "ccis"."TaskType" AS ENUM ('MICRO_CONCEPT', 'MICRO_TASK', 'FUSION_TASK');

-- CreateEnum
CREATE TYPE "ccis"."TaskCategory" AS ENUM ('EMAIL_WRITING', 'PRESENTATION_SKILLS', 'MEETING_FACILITATION', 'CLIENT_COMMUNICATION', 'EXCEL_ANALYSIS', 'SQL_QUERIES', 'DATA_VISUALIZATION', 'INSIGHT_GENERATION', 'PROGRAMMING_EXERCISE', 'SYSTEM_DESIGN', 'DEBUGGING_CHALLENGE', 'TECHNICAL_DOCUMENTATION', 'PROJECT_PLANNING', 'TIMELINE_CREATION', 'RISK_ASSESSMENT', 'STAKEHOLDER_COMMUNICATION', 'ROOT_CAUSE_ANALYSIS', 'DECISION_FRAMEWORK', 'SCENARIO_ANALYSIS', 'CREATIVE_PROBLEM_SOLVING', 'TEAM_COORDINATION', 'CONFLICT_RESOLUTION', 'DELEGATION_EXERCISE', 'MENTORING_SIMULATION', 'PROCESS_IMPROVEMENT', 'TECHNOLOGY_ADOPTION', 'CHANGE_MANAGEMENT', 'CREATIVE_IDEATION');

-- CreateTable
CREATE TABLE "ccis"."tasks" (
    "id" VARCHAR(25) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "expectedDuration" INTEGER NOT NULL DEFAULT 5,
    "difficulty" DECIMAL(3,2) NOT NULL DEFAULT 0.5,
    "targetCCISLevel" INTEGER NOT NULL DEFAULT 1,
    "ccisLevelRange" INTEGER[] DEFAULT ARRAY[1, 2]::INTEGER[],
    "taskType" "ccis"."TaskType" NOT NULL,
    "taskCategory" "ccis"."TaskCategory" NOT NULL,
    "competencyId" VARCHAR(25) NOT NULL,
    "contentBlocks" JSONB NOT NULL,
    "successCriteria" JSONB NOT NULL,
    "assessmentRubric" JSONB NOT NULL,
    "hintsAvailable" JSONB NOT NULL,
    "scaffoldingConfig" JSONB NOT NULL,
    "averageCompletionTime" DECIMAL(65,30),
    "averageSuccessRate" DECIMAL(5,4),
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "industryScenario" TEXT,
    "prerequisiteTasks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "followUpTasks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedTasks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "publishedAt" TIMESTAMPTZ,
    "deprecatedAt" TIMESTAMPTZ,
    "lastValidationDate" TIMESTAMPTZ,
    "contentVersion" VARCHAR(50),

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tasks_competencyId_idx" ON "ccis"."tasks"("competencyId");

-- CreateIndex
CREATE INDEX "tasks_taskType_idx" ON "ccis"."tasks"("taskType");

-- CreateIndex
CREATE INDEX "tasks_taskCategory_idx" ON "ccis"."tasks"("taskCategory");

-- CreateIndex
CREATE INDEX "tasks_targetCCISLevel_idx" ON "ccis"."tasks"("targetCCISLevel");

-- CreateIndex
CREATE INDEX "tasks_difficulty_idx" ON "ccis"."tasks"("difficulty");

-- CreateIndex
CREATE INDEX "tasks_publishedAt_idx" ON "ccis"."tasks"("publishedAt");

-- CreateIndex
CREATE INDEX "tasks_deprecatedAt_idx" ON "ccis"."tasks"("deprecatedAt");

-- CreateIndex
CREATE INDEX "tasks_createdAt_idx" ON "ccis"."tasks"("createdAt");

-- CreateIndex
CREATE INDEX "tasks_competencyId_taskType_idx" ON "ccis"."tasks"("competencyId", "taskType");

-- CreateIndex
CREATE INDEX "tasks_taskCategory_targetCCISLevel_idx" ON "ccis"."tasks"("taskCategory", "targetCCISLevel");

-- CreateIndex
CREATE INDEX "tasks_publishedAt_deprecatedAt_idx" ON "ccis"."tasks"("publishedAt", "deprecatedAt");

-- AddForeignKey
ALTER TABLE "ccis"."task_interactions" ADD CONSTRAINT "task_interactions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ccis"."tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
