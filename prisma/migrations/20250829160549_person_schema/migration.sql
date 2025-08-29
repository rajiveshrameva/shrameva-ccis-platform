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

-- CreateTable
CREATE TABLE "ccis"."persons" (
    "id" UUID NOT NULL,
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
    "verifiedBy" UUID,
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
    "id" UUID NOT NULL,
    "personId" UUID NOT NULL,
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
    "id" UUID NOT NULL,
    "personId" UUID NOT NULL,
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
    "id" UUID NOT NULL,
    "personId" UUID NOT NULL,
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
    "id" UUID NOT NULL,
    "personId" UUID NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "persons_email_key" ON "ccis"."persons"("email");

-- CreateIndex
CREATE UNIQUE INDEX "persons_phone_key" ON "ccis"."persons"("phone");

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
