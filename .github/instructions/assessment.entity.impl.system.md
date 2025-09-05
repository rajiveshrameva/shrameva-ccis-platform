Assessment Entity - Complete Specification for GitHub Autopilot

1. Entity Definition
   Assessment Entity - The core domain entity that captures and measures a student's competency level using the CCIS (Confidence-Competence Independence Scale) methodology. This entity represents a single assessment instance for a specific competency, containing behavioral signals, AI-generated CCIS level determination, and progression tracking.
2. Role and Responsibility
   The Assessment Entity serves as the central hub for:

CCIS Level Measurement: Determines student independence levels (1-4) based on behavioral signals
Competency Tracking: Tracks progress within specific competencies (Business Communication, Data Analysis, etc.)
AI Decision Recording: Stores AI reasoning and confidence scores for transparency
Progression Logic: Enables level advancement and scaffolding reduction
Audit Trail: Maintains complete history of assessment decisions for validation
Placement Prediction: Feeds data into job-readiness algorithms

3. Entity Structure
   Prisma Model
   prismamodel Assessment {
   id String @id @default(cuid())
   personId String
   competencyType CompetencyType
   ccisLevel Int // 1-4
   confidenceScore Float // 0.0-1.0
   assessmentDate DateTime @default(now())

// Behavioral Signals (Core CCIS Calculation)
hintRequestFrequency Float // Hints per minute
errorRecoveryTime Float // Seconds to self-correct
transferSuccessRate Float // 0.0-1.0
metacognitiveAccuracy Float // 0.0-1.0
taskCompletionTime Float // Minutes
helpSeekingQuality Float // 0.0-10.0
selfAssessmentAlignment Float // 0.0-1.0

// AI Decision Context
aiReasoningTrace String // LLM decision explanation
aiModelUsed String // e.g., "claude-3-5-sonnet"
aiPromptVersion String // For A/B testing

// Assessment Context
taskIds String[] // Array of task IDs completed
sessionDuration Float // Total minutes in session
distractionEvents Int // Times student left task interface

// Progression Tracking
previousCcisLevel Int? // Previous level for progression tracking
nextLevelRequirements String[] // JSON array of requirements
isLevelProgression Boolean @default(false)

// Validation & Quality
validationFlags String[] // Gaming detection, consistency checks
humanReviewRequired Boolean @default(false)
humanReviewNotes String?

// Relationships
person Person @relation(fields: [personId], references: [id])
taskSubmissions TaskSubmission[]

// Indexes
@@index([personId, competencyType])
@@index([assessmentDate])
@@index([ccisLevel, competencyType])
@@unique([personId, competencyType, assessmentDate])
}

enum CompetencyType {
BUSINESS_COMMUNICATION
DATA_ANALYSIS
TECHNICAL_KNOWLEDGE
PROJECT_MANAGEMENT
CRITICAL_THINKING
LEADERSHIP_COLLABORATION
INNOVATION_ADAPTABILITY
}
TypeScript Entity Class
typescriptexport class Assessment extends AggregateRoot {
constructor(
private readonly id: AssessmentId,
private readonly personId: PersonId,
private readonly competencyType: CompetencyType,
private ccisLevel: CCISLevel,
private confidenceScore: ConfidenceScore,
private readonly behavioralSignals: BehavioralSignals,
private readonly aiDecisionContext: AIDecisionContext,
private readonly assessmentContext: AssessmentContext,
private progressionTracking: ProgressionTracking,
private validationState: ValidationState
) {
super();
}
} 4. Field Descriptions
FieldDescriptionTypeConstraintsidUnique assessment identifierString (CUID)Primary KeypersonIdReference to student being assessedStringForeign Key to PersoncompetencyTypeWhich of 7 competencies being assessedEnumRequiredccisLevelIndependence level (1=Dependent, 4=Expert)Integer1-4confidenceScoreAI confidence in assessment accuracyFloat0.0-1.0hintRequestFrequencyBehavioral signal: hints per minuteFloat≥0errorRecoveryTimeBehavioral signal: self-correction speedFloat≥0 secondstransferSuccessRateBehavioral signal: novel problem successFloat0.0-1.0metacognitiveAccuracyBehavioral signal: self-assessment accuracyFloat0.0-1.0taskCompletionTimeTotal time spent on tasksFloat≥0 minuteshelpSeekingQualityQuality of questions askedFloat0.0-10.0selfAssessmentAlignmentPrediction vs actual performanceFloat0.0-1.0aiReasoningTraceLLM explanation of decisionStringMax 4000 charsaiModelUsedAI model identifierStringRequiredtaskIdsCompleted task identifiersString[]Min 1 tasknextLevelRequirementsSteps to advance CCIS levelString[]JSON arrayvalidationFlagsQuality assurance flagsString[]Gaming detection 5. Field Population Methods
FieldPopulation MethodSource/ServiceidAuto-generatedPrisma CUIDpersonIdUser contextAuthentication/SessioncompetencyTypeUser selectionFrontend competency selectionccisLevelAI calculatedCCISCalculationService + Claude APIconfidenceScoreAI calculatedCCISCalculationServicehintRequestFrequencyReal-time trackingSignalCollectionServiceerrorRecoveryTimeReal-time trackingSignalCollectionServicetransferSuccessRateAI analyzedTransferAnalysisService + historical datametacognitiveAccuracyComparison logicMetacognitionServicetaskCompletionTimeTimer trackingTaskTimerServicehelpSeekingQualityAI analyzedHelpQualityService + Claude APIselfAssessmentAlignmentComparison logicSelfAssessmentServiceaiReasoningTraceAI generatedClaude API with reasoning promptaiModelUsedSystem constantConfigurationtaskIdsSession trackingTaskSessionServicenextLevelRequirementsAI generatedProgressionService + Claude APIvalidationFlagsSystem checksGamingDetectionService 6. Domain Events

AssessmentCreated - New assessment initiated for person/competency
CCISLevelDetermined - AI has calculated CCIS level with confidence
CCISLevelProgressed - Student advanced to next CCIS level
CCISLevelRegressed - Student dropped CCIS level (quality flag)
HighConfidenceAchieved - Assessment confidence >90% (early termination possible)
LowConfidenceDetected - Assessment confidence <70% (more tasks needed)
GamingPatternDetected - Suspicious behavioral patterns identified
HumanReviewTriggered - Assessment flagged for human validation
PlacementReadinessAchieved - Student reached Level 3+ threshold
AssessmentValidated - Human reviewer confirmed AI assessment
TransferSkillDemonstrated - Student successfully applied skills to novel problem

7. Domain Services Required

CCISCalculationService - Core AI-powered CCIS level determination
SignalCollectionService - Real-time behavioral signal capture and normalization
TransferAnalysisService - Evaluate skill transfer to novel problems
GamingDetectionService - Identify cheating or suspicious patterns
ProgressionService - Determine advancement requirements and scaffolding
MetacognitionService - Compare student confidence vs actual performance
HelpQualityService - Analyze quality of student questions and help requests
ValidationService - Cross-validate assessments for consistency
PlacementPredictionService - Update job-readiness predictions

8. Infrastructure Layer

AssessmentRepository - Prisma-based data persistence
AnthropicClient - Claude API integration for AI reasoning
SignalTracker - Real-time behavioral data collection
CacheManager - Redis caching for assessment data
EventBus - Domain event publishing/subscription
ValidationQueue - Async processing for quality checks
AnalyticsCollector - Assessment metrics and business intelligence
AuditLogger - Compliance and debugging trail

9. Dependencies
   Core Framework:

@nestjs/core
@nestjs/common
@nestjs/config

Database & ORM:

prisma
@prisma/client

AI Integration:

@anthropic-ai/sdk

Validation & Types:

class-validator
class-transformer
@nestjs/mapped-types

Caching & Performance:

@nestjs/cache-manager
cache-manager-redis-store

Event Handling:

@nestjs/event-emitter

Utilities:

lodash
date-fns
uuid

Testing:

@nestjs/testing
jest

10. High Level Design - Data Flows
    mermaidflowchart TD
    A[Student Completes Task] --> B[SignalCollectionService]
    B --> C[Behavioral Signals Captured]
    C --> D[CCISCalculationService]
    D --> E[Claude API: CCIS Analysis]
    E --> F[Assessment Entity Created]
    F --> G[ValidationService]
    G --> H{Validation Passed?}
    H -->|Yes| I[Assessment Persisted]
    H -->|No| J[Human Review Queue]
    I --> K[Domain Events Published]
    K --> L[ProgressionService]
    K --> M[PlacementPredictionService]
    K --> N[AnalyticsCollector]
        subgraph "Real-time Signal Collection"
            B1[Hint Requests] --> B
            B2[Error Recovery] --> B
            B3[Task Timing] --> B
            B4[Help Quality] --> B
        end

        subgraph "AI Processing"
            E1[CCIS Level Calculation]
            E2[Confidence Scoring]
            E3[Reasoning Generation]
            E4[Progression Requirements]
        end
    Key Data Flow Stages:

Signal Collection: Real-time capture during task completion
AI Analysis: Claude API determines CCIS level with reasoning
Validation: Quality checks and gaming detection
Persistence: Store assessment with full audit trail
Event Publishing: Trigger downstream services
Analytics: Update predictive models and dashboards

11. API Layer - Controller & Endpoints
    AssessmentController
    Base Route: /api/assessments
    MethodEndpointDescriptionRequest BodyResponsePOST/Create new assessmentCreateAssessmentDtoAssessmentResponseDtoGET/person/:personIdGet all assessments for person-AssessmentResponseDto[]GET/person/:personId/competency/:competencyTypeGet competency-specific assessments-AssessmentResponseDto[]GET/person/:personId/latestGet latest assessment per competency-AssessmentSummaryDtoGET/:idGet specific assessment-DetailedAssessmentDtoPUT/:id/validateHuman validation of assessmentValidationDtoAssessmentResponseDtoGET/person/:personId/progressGet CCIS progression over time-ProgressionDtoPOST/analyze-signalsReal-time signal analysisSignalDataDtoSignalAnalysisDtoGET/person/:personId/placement-readinessCheck job-readiness status-PlacementReadinessDto
    DTOs Required
    typescriptCreateAssessmentDto {
    personId: string;
    competencyType: CompetencyType;
    taskIds: string[];
    behavioralSignals: BehavioralSignalsDto;
    }

AssessmentResponseDto {
id: string;
ccisLevel: number;
confidenceScore: number;
competencyType: CompetencyType;
assessmentDate: Date;
nextLevelRequirements: string[];
}

DetailedAssessmentDto extends AssessmentResponseDto {
aiReasoningTrace: string;
behavioralSignals: BehavioralSignalsDto;
validationFlags: string[];
} 12. Authentication Strategy
Current Implementation: No authentication for Sprint 1
Future Implementation: JWT-based authentication with role-based access control
Placeholder: Use hardcoded personId for development and testing 13. GitHub Autopilot System Instructions
markdown# GitHub Autopilot Instructions: Assessment Entity Implementation

## Context

You are implementing the Assessment Entity for Shrameva's AI-powered career transformation platform. This entity captures CCIS (Confidence-Competence Independence Scale) measurements that determine student workplace readiness. Follow Domain-Driven Design principles with NestJS, Prisma, and PostgreSQL.

## Implementation Order

1. **Prisma Schema**: Add Assessment model to schema.prisma with all fields and relationships
2. **Domain Layer**: Create Assessment aggregate root with value objects and domain logic
3. **Domain Services**: Implement CCISCalculationService and SignalCollectionService
4. **Infrastructure**: Create AssessmentRepository and AnthropicClient integration
5. **Application Layer**: Build AssessmentService with use cases
6. **API Layer**: Implement AssessmentController with all endpoints
7. **DTOs**: Create request/response DTOs with validation
8. **Events**: Implement domain events and handlers
9. **Tests**: Unit tests for domain logic and integration tests for API

## Critical Requirements

- **Zero Hallucination**: Only implement specified functionality
- **DDD Compliance**: Proper aggregate boundaries and domain modeling
- **Type Safety**: Full TypeScript typing throughout
- **Error Handling**: Comprehensive error scenarios
- **Validation**: Input validation at all layers
- **Performance**: Implement caching and optimization
- **Audit Trail**: Complete assessment history tracking

## AI Integration Specifics

- Use @anthropic-ai/sdk for Claude API integration
- Implement prompt engineering for CCIS level determination
- Include confidence scoring and reasoning trace capture
- Handle API failures gracefully with fallback logic

## File Structure

src/
├── domain/
│ ├── assessment/
│ │ ├── assessment.aggregate.ts
│ │ ├── assessment.repository.interface.ts
│ │ ├── value-objects/
│ │ └── events/
├── application/
│ ├── assessment/
│ │ ├── assessment.service.ts
│ │ ├── dto/
│ │ └── use-cases/
├── infrastructure/
│ ├── assessment/
│ │ ├── assessment.repository.ts
│ │ └── anthropic-client.service.ts
└── presentation/
└── assessment/
└── assessment.controller.ts

## Quality Standards

- Google-level code quality with comprehensive documentation
- Complete error handling and edge case coverage
- Performance optimization from day one
- Security best practices (SQL injection prevention, input sanitization)
- Comprehensive logging for debugging and audit

## Testing Strategy

- Unit tests for all domain logic
- Integration tests for API endpoints
- Mock external dependencies (Anthropic API)
- Test data fixtures for consistent testing
- Performance benchmarks for critical paths
