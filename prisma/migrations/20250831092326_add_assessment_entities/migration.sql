-- CreateTable
CREATE TABLE "ccis"."assessment_sessions" (
    "id" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "competencyType" TEXT NOT NULL,
    "sessionType" TEXT NOT NULL DEFAULT 'FORMATIVE',
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "startTime" TIMESTAMPTZ NOT NULL,
    "endTime" TIMESTAMPTZ,
    "maxDuration" INTEGER NOT NULL,
    "actualDuration" INTEGER,
    "culturalContext" TEXT NOT NULL DEFAULT 'INDIA',
    "languagePreference" TEXT NOT NULL DEFAULT 'english',
    "accessibilityNeeds" JSONB NOT NULL DEFAULT '[]',
    "assessmentPurpose" TEXT,
    "difficultyLevel" INTEGER NOT NULL DEFAULT 5,
    "adaptiveEnabled" BOOLEAN NOT NULL DEFAULT true,
    "gamingDetectionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sessionMetadata" JSONB NOT NULL DEFAULT '{}',
    "currentTaskIndex" INTEGER NOT NULL DEFAULT 0,
    "totalTasksPlanned" INTEGER NOT NULL DEFAULT 0,
    "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "overallDataQuality" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "behavioralConsistency" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "engagementLevel" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "gamingRiskScore" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "gamingPatternsDetected" JSONB NOT NULL DEFAULT '[]',
    "interventionsTriggered" INTEGER NOT NULL DEFAULT 0,
    "averageTaskDuration" DECIMAL(8,2),
    "averageQualityScore" DECIMAL(3,2),
    "totalInteractions" INTEGER NOT NULL DEFAULT 0,
    "initialCcisLevel" INTEGER,
    "currentCcisLevel" INTEGER,
    "confidenceScore" DECIMAL(3,2),
    "levelAdvancementCount" INTEGER NOT NULL DEFAULT 0,
    "culturalAdaptationScore" DECIMAL(3,2),
    "crossCulturalValidation" BOOLEAN NOT NULL DEFAULT false,
    "scaffoldingAdjustments" JSONB NOT NULL DEFAULT '[]',
    "outcomeMetrics" JSONB NOT NULL DEFAULT '{}',
    "analyticsData" JSONB NOT NULL DEFAULT '{}',
    "processingMetrics" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMPTZ,
    "deletedBy" VARCHAR(50),

    CONSTRAINT "assessment_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ccis"."task_interactions" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "taskId" VARCHAR(50) NOT NULL,
    "competencyFocus" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "taskDifficulty" INTEGER NOT NULL DEFAULT 5,
    "interactionTimestamp" TIMESTAMPTZ NOT NULL,
    "startTime" TIMESTAMPTZ NOT NULL,
    "endTime" TIMESTAMPTZ,
    "duration" BIGINT NOT NULL,
    "interactionData" JSONB NOT NULL DEFAULT '{}',
    "behavioralSignals" JSONB NOT NULL DEFAULT '{}',
    "qualityMetrics" JSONB NOT NULL DEFAULT '{}',
    "contextualFactors" JSONB NOT NULL DEFAULT '{}',
    "gamingDetectionData" JSONB NOT NULL DEFAULT '{}',
    "analysisResults" JSONB NOT NULL DEFAULT '{}',
    "performanceMetrics" JSONB NOT NULL DEFAULT '{}',
    "interventionData" JSONB NOT NULL DEFAULT '{}',
    "systemMetadata" JSONB NOT NULL DEFAULT '{}',
    "overallQualityScore" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "gamingRiskScore" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "learningProgressIndicator" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "culturalAlignmentScore" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMPTZ,
    "deletedBy" VARCHAR(50),

    CONSTRAINT "task_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ccis"."competency_assessments" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "competencyType" TEXT NOT NULL,
    "assessmentDate" TIMESTAMPTZ NOT NULL,
    "assessmentVersion" VARCHAR(20) NOT NULL,
    "assessmentMethod" VARCHAR(30) NOT NULL,
    "culturalContext" TEXT NOT NULL,
    "ccisLevel" INTEGER NOT NULL,
    "previousCcisLevel" INTEGER,
    "levelConfidence" DECIMAL(3,2) NOT NULL,
    "levelJustification" TEXT,
    "confidenceScore" DECIMAL(3,2) NOT NULL,
    "confidenceFactors" JSONB NOT NULL DEFAULT '{}',
    "evidenceData" JSONB NOT NULL DEFAULT '{}',
    "competencySpecificData" JSONB NOT NULL DEFAULT '{}',
    "progressionData" JSONB NOT NULL DEFAULT '{}',
    "culturalAdaptationData" JSONB NOT NULL DEFAULT '{}',
    "assessmentAnalytics" JSONB NOT NULL DEFAULT '{}',
    "interventionData" JSONB NOT NULL DEFAULT '{}',
    "validationData" JSONB NOT NULL DEFAULT '{}',
    "systemMetadata" JSONB NOT NULL DEFAULT '{}',
    "overallCompetencyScore" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "competencyStrengthRating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "developmentPriorityScore" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "crossCompetencyImpact" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "assessmentReliability" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "evidenceCompleteness" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "validationStrength" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "culturalRelevance" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "assessmentStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "isCurrentAssessment" BOOLEAN NOT NULL DEFAULT false,
    "supersededBy" VARCHAR(50),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMPTZ,
    "deletedBy" VARCHAR(50),

    CONSTRAINT "competency_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assessment_sessions_personId_idx" ON "ccis"."assessment_sessions"("personId");

-- CreateIndex
CREATE INDEX "assessment_sessions_status_idx" ON "ccis"."assessment_sessions"("status");

-- CreateIndex
CREATE INDEX "assessment_sessions_competencyType_idx" ON "ccis"."assessment_sessions"("competencyType");

-- CreateIndex
CREATE INDEX "assessment_sessions_startTime_idx" ON "ccis"."assessment_sessions"("startTime");

-- CreateIndex
CREATE INDEX "assessment_sessions_culturalContext_idx" ON "ccis"."assessment_sessions"("culturalContext");

-- CreateIndex
CREATE INDEX "assessment_sessions_personId_status_idx" ON "ccis"."assessment_sessions"("personId", "status");

-- CreateIndex
CREATE INDEX "assessment_sessions_competencyType_startTime_idx" ON "ccis"."assessment_sessions"("competencyType", "startTime");

-- CreateIndex
CREATE INDEX "task_interactions_sessionId_idx" ON "ccis"."task_interactions"("sessionId");

-- CreateIndex
CREATE INDEX "task_interactions_personId_idx" ON "ccis"."task_interactions"("personId");

-- CreateIndex
CREATE INDEX "task_interactions_taskId_idx" ON "ccis"."task_interactions"("taskId");

-- CreateIndex
CREATE INDEX "task_interactions_interactionTimestamp_idx" ON "ccis"."task_interactions"("interactionTimestamp");

-- CreateIndex
CREATE INDEX "task_interactions_competencyFocus_idx" ON "ccis"."task_interactions"("competencyFocus");

-- CreateIndex
CREATE INDEX "task_interactions_sessionId_interactionTimestamp_idx" ON "ccis"."task_interactions"("sessionId", "interactionTimestamp");

-- CreateIndex
CREATE INDEX "task_interactions_personId_interactionTimestamp_idx" ON "ccis"."task_interactions"("personId", "interactionTimestamp");

-- CreateIndex
CREATE INDEX "competency_assessments_personId_idx" ON "ccis"."competency_assessments"("personId");

-- CreateIndex
CREATE INDEX "competency_assessments_sessionId_idx" ON "ccis"."competency_assessments"("sessionId");

-- CreateIndex
CREATE INDEX "competency_assessments_competencyType_idx" ON "ccis"."competency_assessments"("competencyType");

-- CreateIndex
CREATE INDEX "competency_assessments_assessmentDate_idx" ON "ccis"."competency_assessments"("assessmentDate");

-- CreateIndex
CREATE INDEX "competency_assessments_personId_competencyType_isCurrentAss_idx" ON "ccis"."competency_assessments"("personId", "competencyType", "isCurrentAssessment");

-- CreateIndex
CREATE INDEX "competency_assessments_competencyType_culturalContext_idx" ON "ccis"."competency_assessments"("competencyType", "culturalContext");

-- AddForeignKey
ALTER TABLE "ccis"."assessment_sessions" ADD CONSTRAINT "assessment_sessions_personId_fkey" FOREIGN KEY ("personId") REFERENCES "ccis"."persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ccis"."task_interactions" ADD CONSTRAINT "task_interactions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ccis"."assessment_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ccis"."task_interactions" ADD CONSTRAINT "task_interactions_personId_fkey" FOREIGN KEY ("personId") REFERENCES "ccis"."persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ccis"."competency_assessments" ADD CONSTRAINT "competency_assessments_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ccis"."assessment_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ccis"."competency_assessments" ADD CONSTRAINT "competency_assessments_personId_fkey" FOREIGN KEY ("personId") REFERENCES "ccis"."persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
