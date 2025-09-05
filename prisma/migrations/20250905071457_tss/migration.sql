-- CreateEnum
CREATE TYPE "ccis"."Gender" AS ENUM ('MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY', 'OTHER');

-- CreateEnum
CREATE TYPE "ccis"."SupportedCountry" AS ENUM ('INDIA', 'UAE');

-- CreateEnum
CREATE TYPE "ccis"."KYCStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ccis"."ProfileVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'CONTACTS_ONLY', 'INSTITUTIONS_ONLY');

-- CreateEnum
CREATE TYPE "ccis"."AccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DEACTIVATED', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "ccis"."SocialPlatform" AS ENUM ('LINKEDIN', 'GITHUB', 'TWITTER', 'INSTAGRAM', 'FACEBOOK', 'PORTFOLIO_WEBSITE', 'OTHER');

-- CreateEnum
CREATE TYPE "ccis"."EnrollmentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'GRADUATED', 'DROPPED_OUT', 'TRANSFERRED', 'SUSPENDED', 'ON_BREAK');

-- CreateEnum
CREATE TYPE "ccis"."PlacementStatus" AS ENUM ('NOT_STARTED', 'PREPARING', 'APPLYING', 'INTERVIEWING', 'OFFER_RECEIVED', 'PLACED', 'NOT_INTERESTED');

-- CreateEnum
CREATE TYPE "ccis"."CompetencyType" AS ENUM ('BUSINESS_COMMUNICATION', 'DATA_ANALYSIS', 'TECHNICAL_KNOWLEDGE', 'PROJECT_MANAGEMENT', 'CRITICAL_THINKING', 'LEADERSHIP_COLLABORATION', 'INNOVATION_ADAPTABILITY');

-- CreateTable
CREATE TABLE "ccis"."persons" (
    "id" VARCHAR(25) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,
    "firstName" VARCHAR(100) NOT NULL,
    "middleName" VARCHAR(100),
    "lastName" VARCHAR(100) NOT NULL,
    "preferredName" VARCHAR(100),
    "dateOfBirth" DATE NOT NULL,
    "gender" "ccis"."Gender" NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMPTZ,
    "phone" VARCHAR(20) NOT NULL,
    "phoneCountryCode" VARCHAR(5) NOT NULL,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerifiedAt" TIMESTAMPTZ,
    "addressLine1" VARCHAR(255),
    "addressLine2" VARCHAR(255),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "postalCode" VARCHAR(20),
    "country" "ccis"."SupportedCountry",
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMPTZ,
    "verifiedBy" VARCHAR(25),
    "kycStatus" "ccis"."KYCStatus" NOT NULL DEFAULT 'PENDING',
    "kycCompletedAt" TIMESTAMPTZ,
    "trustScore" REAL,
    "privacySettings" JSONB NOT NULL DEFAULT '{}',
    "profileVisibility" "ccis"."ProfileVisibility" NOT NULL DEFAULT 'PRIVATE',
    "dataSharing" JSONB NOT NULL DEFAULT '{}',
    "lastLoginAt" TIMESTAMPTZ,
    "profileCompleteness" SMALLINT NOT NULL DEFAULT 0,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "accountStatus" "ccis"."AccountStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ccis"."skill_passports" (
    "id" VARCHAR(25) NOT NULL,
    "personId" VARCHAR(25) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "communicationLevel" SMALLINT NOT NULL DEFAULT 1,
    "communicationEvidence" JSONB NOT NULL DEFAULT '[]',
    "communicationLastAssessed" TIMESTAMPTZ,
    "problemSolvingLevel" SMALLINT NOT NULL DEFAULT 1,
    "problemSolvingEvidence" JSONB NOT NULL DEFAULT '[]',
    "problemSolvingLastAssessed" TIMESTAMPTZ,
    "teamworkLevel" SMALLINT NOT NULL DEFAULT 1,
    "teamworkEvidence" JSONB NOT NULL DEFAULT '[]',
    "teamworkLastAssessed" TIMESTAMPTZ,
    "adaptabilityLevel" SMALLINT NOT NULL DEFAULT 1,
    "adaptabilityEvidence" JSONB NOT NULL DEFAULT '[]',
    "adaptabilityLastAssessed" TIMESTAMPTZ,
    "timeManagementLevel" SMALLINT NOT NULL DEFAULT 1,
    "timeManagementEvidence" JSONB NOT NULL DEFAULT '[]',
    "timeManagementLastAssessed" TIMESTAMPTZ,
    "technicalSkillsLevel" SMALLINT NOT NULL DEFAULT 1,
    "technicalSkillsEvidence" JSONB NOT NULL DEFAULT '[]',
    "technicalSkillsLastAssessed" TIMESTAMPTZ,
    "leadershipLevel" SMALLINT NOT NULL DEFAULT 1,
    "leadershipEvidence" JSONB NOT NULL DEFAULT '[]',
    "leadershipLastAssessed" TIMESTAMPTZ,
    "overallCCISLevel" REAL NOT NULL DEFAULT 1.0,
    "totalAssessments" INTEGER NOT NULL DEFAULT 0,
    "lastAssessmentDate" TIMESTAMPTZ,
    "assessmentCountry" "ccis"."SupportedCountry",
    "culturalContext" JSONB NOT NULL DEFAULT '{}',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "sharedWith" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "skill_passports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ccis"."emergency_contacts" (
    "id" VARCHAR(25) NOT NULL,
    "personId" VARCHAR(25) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "relationship" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255),
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ccis"."social_profiles" (
    "id" VARCHAR(25) NOT NULL,
    "personId" VARCHAR(25) NOT NULL,
    "platform" "ccis"."SocialPlatform" NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "profileUrl" VARCHAR(500),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "social_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ccis"."students" (
    "id" VARCHAR(25) NOT NULL,
    "personId" VARCHAR(25) NOT NULL,
    "studentId" VARCHAR(50) NOT NULL,
    "enrollmentNumber" VARCHAR(50),
    "collegeName" VARCHAR(200) NOT NULL,
    "collegeCode" VARCHAR(20),
    "program" VARCHAR(100) NOT NULL,
    "specialization" VARCHAR(100),
    "yearOfStudy" SMALLINT NOT NULL,
    "semester" SMALLINT,
    "enrollmentDate" DATE NOT NULL,
    "expectedGraduationDate" DATE,
    "enrollmentStatus" "ccis"."EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentGPA" REAL,
    "totalCredits" INTEGER DEFAULT 0,
    "completedCredits" INTEGER DEFAULT 0,
    "placementStatus" "ccis"."PlacementStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "placementTarget" DATE,
    "placementAchieved" BOOLEAN NOT NULL DEFAULT false,
    "placementDate" DATE,
    "placementCompany" VARCHAR(200),
    "placementPackage" REAL,
    "placementRole" VARCHAR(100),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ccis"."assessments" (
    "id" VARCHAR(25) NOT NULL,
    "personId" VARCHAR(25) NOT NULL,
    "competencyType" "ccis"."CompetencyType" NOT NULL,
    "ccisLevel" INTEGER NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "assessmentDate" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hintRequestFrequency" DOUBLE PRECISION NOT NULL,
    "errorRecoveryTime" DOUBLE PRECISION NOT NULL,
    "transferSuccessRate" DOUBLE PRECISION NOT NULL,
    "metacognitiveAccuracy" DOUBLE PRECISION NOT NULL,
    "taskCompletionTime" DOUBLE PRECISION NOT NULL,
    "helpSeekingQuality" DOUBLE PRECISION NOT NULL,
    "selfAssessmentAlignment" DOUBLE PRECISION NOT NULL,
    "aiReasoningTrace" TEXT NOT NULL,
    "aiModelUsed" TEXT NOT NULL,
    "aiPromptVersion" TEXT NOT NULL,
    "taskIds" TEXT[],
    "sessionDuration" DOUBLE PRECISION NOT NULL,
    "distractionEvents" INTEGER NOT NULL,
    "previousCcisLevel" INTEGER,
    "nextLevelRequirements" TEXT[],
    "isLevelProgression" BOOLEAN NOT NULL DEFAULT false,
    "validationFlags" TEXT[],
    "humanReviewRequired" BOOLEAN NOT NULL DEFAULT false,
    "humanReviewNotes" TEXT,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ccis"."assessment_sessions" (
    "id" VARCHAR(25) NOT NULL,
    "personId" VARCHAR(25) NOT NULL,
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
    "id" VARCHAR(25) NOT NULL,
    "sessionId" VARCHAR(25) NOT NULL,
    "personId" VARCHAR(25) NOT NULL,
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
    "id" VARCHAR(25) NOT NULL,
    "sessionId" VARCHAR(25) NOT NULL,
    "personId" VARCHAR(25) NOT NULL,
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

-- CreateTable
CREATE TABLE "ccis"."audit_events" (
    "id" VARCHAR(25) NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventType" VARCHAR(50) NOT NULL,
    "entityId" VARCHAR(255) NOT NULL,
    "entityType" VARCHAR(50) NOT NULL,
    "userId" VARCHAR(255),
    "sessionId" VARCHAR(255),
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "metadata" JSONB NOT NULL,
    "sensitiveDataHash" TEXT,
    "retentionPolicy" VARCHAR(50),
    "complianceFlags" JSONB,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "persons_email_idx" ON "ccis"."persons"("email");

-- CreateIndex
CREATE INDEX "persons_phone_idx" ON "ccis"."persons"("phone");

-- CreateIndex
CREATE INDEX "persons_country_city_idx" ON "ccis"."persons"("country", "city");

-- CreateIndex
CREATE INDEX "persons_kycStatus_idx" ON "ccis"."persons"("kycStatus");

-- CreateIndex
CREATE INDEX "persons_isVerified_idx" ON "ccis"."persons"("isVerified");

-- CreateIndex
CREATE INDEX "persons_createdAt_idx" ON "ccis"."persons"("createdAt");

-- CreateIndex
CREATE INDEX "persons_lastLoginAt_idx" ON "ccis"."persons"("lastLoginAt");

-- CreateIndex
CREATE INDEX "persons_accountStatus_idx" ON "ccis"."persons"("accountStatus");

-- CreateIndex
CREATE INDEX "persons_deletedAt_idx" ON "ccis"."persons"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "skill_passports_personId_key" ON "ccis"."skill_passports"("personId");

-- CreateIndex
CREATE INDEX "skill_passports_overallCCISLevel_idx" ON "ccis"."skill_passports"("overallCCISLevel");

-- CreateIndex
CREATE INDEX "skill_passports_communicationLevel_problemSolvingLevel_team_idx" ON "ccis"."skill_passports"("communicationLevel", "problemSolvingLevel", "teamworkLevel");

-- CreateIndex
CREATE INDEX "skill_passports_lastAssessmentDate_idx" ON "ccis"."skill_passports"("lastAssessmentDate");

-- CreateIndex
CREATE INDEX "emergency_contacts_personId_idx" ON "ccis"."emergency_contacts"("personId");

-- CreateIndex
CREATE INDEX "social_profiles_personId_idx" ON "ccis"."social_profiles"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "social_profiles_personId_platform_key" ON "ccis"."social_profiles"("personId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "students_personId_key" ON "ccis"."students"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "students_studentId_key" ON "ccis"."students"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "students_enrollmentNumber_key" ON "ccis"."students"("enrollmentNumber");

-- CreateIndex
CREATE INDEX "students_collegeName_idx" ON "ccis"."students"("collegeName");

-- CreateIndex
CREATE INDEX "students_program_idx" ON "ccis"."students"("program");

-- CreateIndex
CREATE INDEX "students_yearOfStudy_idx" ON "ccis"."students"("yearOfStudy");

-- CreateIndex
CREATE INDEX "students_enrollmentStatus_idx" ON "ccis"."students"("enrollmentStatus");

-- CreateIndex
CREATE INDEX "students_placementStatus_idx" ON "ccis"."students"("placementStatus");

-- CreateIndex
CREATE INDEX "students_expectedGraduationDate_idx" ON "ccis"."students"("expectedGraduationDate");

-- CreateIndex
CREATE INDEX "assessments_personId_competencyType_idx" ON "ccis"."assessments"("personId", "competencyType");

-- CreateIndex
CREATE INDEX "assessments_assessmentDate_idx" ON "ccis"."assessments"("assessmentDate");

-- CreateIndex
CREATE INDEX "assessments_ccisLevel_competencyType_idx" ON "ccis"."assessments"("ccisLevel", "competencyType");

-- CreateIndex
CREATE UNIQUE INDEX "assessments_personId_competencyType_assessmentDate_key" ON "ccis"."assessments"("personId", "competencyType", "assessmentDate");

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

-- CreateIndex
CREATE INDEX "audit_events_eventType_idx" ON "ccis"."audit_events"("eventType");

-- CreateIndex
CREATE INDEX "audit_events_entityId_entityType_idx" ON "ccis"."audit_events"("entityId", "entityType");

-- CreateIndex
CREATE INDEX "audit_events_userId_idx" ON "ccis"."audit_events"("userId");

-- CreateIndex
CREATE INDEX "audit_events_timestamp_idx" ON "ccis"."audit_events"("timestamp");

-- CreateIndex
CREATE INDEX "audit_events_sessionId_idx" ON "ccis"."audit_events"("sessionId");

-- CreateIndex
CREATE INDEX "audit_events_ipAddress_idx" ON "ccis"."audit_events"("ipAddress");

-- CreateIndex
CREATE INDEX "audit_events_eventType_timestamp_idx" ON "ccis"."audit_events"("eventType", "timestamp");

-- CreateIndex
CREATE INDEX "audit_events_entityId_eventType_timestamp_idx" ON "ccis"."audit_events"("entityId", "eventType", "timestamp");

-- AddForeignKey
ALTER TABLE "ccis"."persons" ADD CONSTRAINT "persons_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "ccis"."persons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ccis"."skill_passports" ADD CONSTRAINT "skill_passports_personId_fkey" FOREIGN KEY ("personId") REFERENCES "ccis"."persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ccis"."emergency_contacts" ADD CONSTRAINT "emergency_contacts_personId_fkey" FOREIGN KEY ("personId") REFERENCES "ccis"."persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ccis"."social_profiles" ADD CONSTRAINT "social_profiles_personId_fkey" FOREIGN KEY ("personId") REFERENCES "ccis"."persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ccis"."students" ADD CONSTRAINT "students_personId_fkey" FOREIGN KEY ("personId") REFERENCES "ccis"."persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ccis"."assessments" ADD CONSTRAINT "assessments_personId_fkey" FOREIGN KEY ("personId") REFERENCES "ccis"."persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
