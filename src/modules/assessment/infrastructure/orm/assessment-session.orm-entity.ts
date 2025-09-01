/**
 * Assessment Session ORM Entity
 *
 * Prisma ORM entity mapping for AssessmentSession domain entity.
 * This entity represents the database schema for assessment sessions,
 * including all behavioral data, metadata, and relationships required
 * for the CCIS assessment system.
 *
 * Key Features:
 * - Complete session lifecycle tracking
 * - Behavioral signal persistence
 * - Cultural context preservation
 * - Performance optimization for analytics
 * - Audit trail maintenance
 * - Relationship management with task interactions
 *
 * Database Design:
 * - Optimized indexes for common queries
 * - JSON columns for flexible metadata
 * - Temporal data support
 * - Soft delete capabilities
 * - Version control for audit trails
 *
 * @example
 * ```sql
 * -- Create assessment session
 * INSERT INTO assessment_sessions (id, person_id, competency_type, ...)
 * VALUES ('session-123', 'person-456', 'COMMUNICATION', ...);
 *
 * -- Query active sessions
 * SELECT * FROM assessment_sessions
 * WHERE person_id = 'person-456' AND status = 'IN_PROGRESS';
 * ```
 */

/**
 * Assessment Session ORM Entity
 *
 * Maps to the assessment_sessions table in the database.
 * Stores comprehensive session data for CCIS assessments.
 */
export interface AssessmentSessionOrmEntity {
  // Primary identifiers
  id: string;
  personId: string;

  // Session configuration
  competencyType: string; // COMMUNICATION, PROBLEM_SOLVING, etc.
  sessionType: string; // FORMATIVE, SUMMATIVE, DIAGNOSTIC, REMEDIATION
  status: string; // PLANNED, IN_PROGRESS, PAUSED, COMPLETED, TERMINATED, CANCELLED

  // Temporal data
  startTime: Date;
  endTime: Date | null;
  maxDuration: number; // minutes
  actualDuration: number | null; // minutes

  // Assessment context
  culturalContext: string; // INDIA, UAE, etc.
  languagePreference: string;
  accessibilityNeeds: string[]; // JSON array

  // Assessment configuration
  assessmentPurpose: string;
  difficultyLevel: number; // 1-10 scale
  adaptiveEnabled: boolean;
  gamingDetectionEnabled: boolean;

  // Session metadata (JSON)
  sessionMetadata: {
    // Environment settings
    environment?: {
      device?: string;
      browser?: string;
      screenResolution?: string;
      connectionQuality?: string;
    };

    // Cultural adaptations
    culturalAdaptations?: {
      communicationStyle?: string;
      taskPresentationStyle?: string;
      feedbackApproach?: string;
      motivationalApproach?: string;
    };

    // Accessibility configurations
    accessibilityConfig?: {
      screenReader?: boolean;
      highContrast?: boolean;
      largeText?: boolean;
      keyboardNavigation?: boolean;
      voiceInput?: boolean;
      customAccommodations?: string[];
    };

    // Learning preferences
    learningPreferences?: {
      preferredModality?: string[]; // visual, auditory, kinesthetic
      pacingPreference?: string; // self-paced, guided, structured
      feedbackFrequency?: string; // immediate, periodic, end-of-session
      difficultyProgression?: string; // gradual, adaptive, challenging
    };

    // Assessment goals
    assessmentGoals?: {
      primaryObjectives?: string[];
      successCriteria?: string[];
      expectedOutcomes?: string[];
      timeConstraints?: string[];
    };

    // Context factors
    contextualFactors?: {
      priorExperience?: string;
      motivationLevel?: number;
      stressLevel?: number;
      confidenceLevel?: number;
      externalFactors?: string[];
    };
  };

  // Session progress
  currentTaskIndex: number;
  totalTasksPlanned: number;
  tasksCompleted: number;

  // Quality metrics
  overallDataQuality: number; // 0-1 scale
  behavioralConsistency: number; // 0-1 scale
  engagementLevel: number; // 0-1 scale

  // Gaming detection
  gamingRiskScore: number; // 0-1 scale
  gamingPatternsDetected: string[]; // JSON array
  interventionsTriggered: number;

  // Performance metrics
  averageTaskDuration: number | null; // seconds
  averageQualityScore: number | null; // 0-1 scale
  totalInteractions: number;

  // CCIS progression
  initialCCISLevel: number | null; // 1-4 scale
  currentCCISLevel: number | null; // 1-4 scale
  confidenceScore: number | null; // 0-1 scale
  levelAdvancementCount: number;

  // Cultural effectiveness
  culturalAdaptationScore: number | null; // 0-1 scale
  crossCulturalValidation: boolean;

  // Scaffolding and adaptation
  scaffoldingAdjustments: {
    adjustmentType: string;
    adjustmentValue: number;
    appliedAt: Date;
    effectiveness: number;
    reason: string;
  }[]; // JSON array

  // Session outcomes
  outcomeMetrics: {
    // Learning outcomes
    competencyProgression?: number;
    skillAcquisitionRate?: number;
    knowledgeRetention?: number;

    // Performance outcomes
    taskCompletionRate?: number;
    accuracyImprovement?: number;
    efficiencyGains?: number;

    // Behavioral outcomes
    engagementConsistency?: number;
    motivationSustainability?: number;
    confidenceBuilding?: number;

    // System outcomes
    adaptationEffectiveness?: number;
    interventionSuccess?: number;
    dataQualityMaintenance?: number;
  }; // JSON

  // Analytics data
  analyticsData: {
    // Temporal patterns
    timeBasedMetrics?: {
      peakPerformanceTime?: string;
      attentionSpanDuration?: number;
      breakPatterns?: string[];
      speedAccuracyTradeoff?: number;
    };

    // Learning patterns
    learningPatterns?: {
      learningStyle?: string;
      preferredTaskTypes?: string[];
      optimalDifficultyLevel?: number;
      feedbackResponsePatterns?: string[];
    };

    // Behavioral patterns
    behavioralPatterns?: {
      consistencyScore?: number;
      adaptabilityScore?: number;
      persistenceLevel?: number;
      helpSeekingBehavior?: string;
    };

    // Cultural patterns
    culturalPatterns?: {
      communicationEffectiveness?: number;
      culturalComfort?: number;
      adaptationRequirements?: string[];
      crossCulturalReadiness?: number;
    };
  }; // JSON

  // System data
  processingMetrics: {
    dataIngestionRate?: number;
    analyticsProcessingTime?: number;
    recommendationGenerationTime?: number;
    systemResponseTime?: number;
    errorRate?: number;
    cacheHitRate?: number;
  }; // JSON

  // Audit fields
  createdAt: Date;
  updatedAt: Date;
  version: number;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;

  // Relationships
  taskInteractions?: TaskInteractionOrmEntity[];
  competencyAssessments?: CompetencyAssessmentOrmEntity[];

  // Computed fields (not stored, calculated on query)
  computedFields?: {
    sessionEffectiveness?: number;
    learningVelocity?: number;
    adaptationSuccess?: number;
    overallSuccessScore?: number;
  };
}

/**
 * Task Interaction ORM Entity Reference
 * (Will be defined in separate file)
 */
export interface TaskInteractionOrmEntity {
  id: string;
  sessionId: string;
  personId: string;
  taskId: string;
  // ... other fields
}

/**
 * Competency Assessment ORM Entity Reference
 * (Will be defined in separate file)
 */
export interface CompetencyAssessmentOrmEntity {
  id: string;
  sessionId: string;
  personId: string;
  competencyType: string;
  // ... other fields
}

/**
 * Database indexes for optimal query performance
 */
export const ASSESSMENT_SESSION_INDEXES = {
  // Primary access patterns
  personId:
    'CREATE INDEX idx_assessment_sessions_person_id ON assessment_sessions(person_id)',
  status:
    'CREATE INDEX idx_assessment_sessions_status ON assessment_sessions(status)',
  competencyType:
    'CREATE INDEX idx_assessment_sessions_competency_type ON assessment_sessions(competency_type)',

  // Temporal queries
  startTime:
    'CREATE INDEX idx_assessment_sessions_start_time ON assessment_sessions(start_time)',
  createdAt:
    'CREATE INDEX idx_assessment_sessions_created_at ON assessment_sessions(created_at)',

  // Analytics queries
  culturalContext:
    'CREATE INDEX idx_assessment_sessions_cultural_context ON assessment_sessions(cultural_context)',
  sessionType:
    'CREATE INDEX idx_assessment_sessions_session_type ON assessment_sessions(session_type)',

  // Composite indexes for common query patterns
  personStatus:
    'CREATE INDEX idx_assessment_sessions_person_status ON assessment_sessions(person_id, status)',
  competencyDate:
    'CREATE INDEX idx_assessment_sessions_competency_date ON assessment_sessions(competency_type, start_time)',
  culturalCompetency:
    'CREATE INDEX idx_assessment_sessions_cultural_competency ON assessment_sessions(cultural_context, competency_type)',

  // Performance optimization
  activeSessionsLookup:
    "CREATE INDEX idx_assessment_sessions_active ON assessment_sessions(person_id, status) WHERE status IN ('PLANNED', 'IN_PROGRESS', 'PAUSED')",
  analyticsOptimization:
    'CREATE INDEX idx_assessment_sessions_analytics ON assessment_sessions(competency_type, cultural_context, start_time) WHERE is_deleted = false',

  // JSON field indexes (PostgreSQL specific)
  metadataGin:
    'CREATE INDEX idx_assessment_sessions_metadata_gin ON assessment_sessions USING gin(session_metadata)',
  analyticsGin:
    'CREATE INDEX idx_assessment_sessions_analytics_gin ON assessment_sessions USING gin(analytics_data)',
  outcomesGin:
    'CREATE INDEX idx_assessment_sessions_outcomes_gin ON assessment_sessions USING gin(outcome_metrics)',

  // Soft delete optimization
  notDeleted:
    'CREATE INDEX idx_assessment_sessions_not_deleted ON assessment_sessions(id) WHERE is_deleted = false',
};

/**
 * Database constraints for data integrity
 */
export const ASSESSMENT_SESSION_CONSTRAINTS = {
  // Primary key
  primaryKey:
    'ALTER TABLE assessment_sessions ADD CONSTRAINT pk_assessment_sessions PRIMARY KEY (id)',

  // Foreign key constraints
  personIdFk:
    'ALTER TABLE assessment_sessions ADD CONSTRAINT fk_assessment_sessions_person_id FOREIGN KEY (person_id) REFERENCES persons(id)',

  // Check constraints
  statusCheck:
    "ALTER TABLE assessment_sessions ADD CONSTRAINT chk_assessment_sessions_status CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'TERMINATED', 'CANCELLED'))",
  competencyTypeCheck:
    "ALTER TABLE assessment_sessions ADD CONSTRAINT chk_assessment_sessions_competency_type CHECK (competency_type IN ('COMMUNICATION', 'PROBLEM_SOLVING', 'TEAMWORK', 'ADAPTABILITY', 'TIME_MANAGEMENT', 'TECHNICAL_SKILLS', 'LEADERSHIP'))",
  culturalContextCheck:
    "ALTER TABLE assessment_sessions ADD CONSTRAINT chk_assessment_sessions_cultural_context CHECK (cultural_context IN ('INDIA', 'UAE', 'GLOBAL'))",
  durationCheck:
    'ALTER TABLE assessment_sessions ADD CONSTRAINT chk_assessment_sessions_duration CHECK (max_duration > 0 AND max_duration <= 1440)', // Max 24 hours
  qualityScoreCheck:
    'ALTER TABLE assessment_sessions ADD CONSTRAINT chk_assessment_sessions_quality_scores CHECK (overall_data_quality >= 0 AND overall_data_quality <= 1 AND behavioral_consistency >= 0 AND behavioral_consistency <= 1)',
  ccisLevelCheck:
    'ALTER TABLE assessment_sessions ADD CONSTRAINT chk_assessment_sessions_ccis_level CHECK (initial_ccis_level >= 1 AND initial_ccis_level <= 4 AND current_ccis_level >= 1 AND current_ccis_level <= 4)',

  // Temporal constraints
  endTimeCheck:
    'ALTER TABLE assessment_sessions ADD CONSTRAINT chk_assessment_sessions_end_time CHECK (end_time IS NULL OR end_time >= start_time)',

  // Unique constraints
  uniqueActiveSession:
    "CREATE UNIQUE INDEX idx_assessment_sessions_unique_active ON assessment_sessions(person_id, competency_type) WHERE status IN ('IN_PROGRESS', 'PAUSED')",

  // Version control
  versionCheck:
    'ALTER TABLE assessment_sessions ADD CONSTRAINT chk_assessment_sessions_version CHECK (version >= 1)',

  // Soft delete consistency
  deleteConsistency:
    'ALTER TABLE assessment_sessions ADD CONSTRAINT chk_assessment_sessions_delete_consistency CHECK ((is_deleted = false AND deleted_at IS NULL AND deleted_by IS NULL) OR (is_deleted = true AND deleted_at IS NOT NULL AND deleted_by IS NOT NULL))',
};

/**
 * Database views for common query patterns
 */
export const ASSESSMENT_SESSION_VIEWS = {
  // Active sessions view
  activeSessions: `
    CREATE VIEW v_active_assessment_sessions AS
    SELECT 
      id, person_id, competency_type, session_type, status,
      start_time, max_duration, cultural_context,
      current_ccis_level, confidence_score,
      overall_data_quality, engagement_level
    FROM assessment_sessions
    WHERE is_deleted = false 
      AND status IN ('PLANNED', 'IN_PROGRESS', 'PAUSED')
  `,

  // Session analytics view
  sessionAnalytics: `
    CREATE VIEW v_assessment_session_analytics AS
    SELECT 
      id, person_id, competency_type, cultural_context,
      start_time, end_time, actual_duration,
      initial_ccis_level, current_ccis_level,
      (current_ccis_level - initial_ccis_level) as ccis_progression,
      overall_data_quality, behavioral_consistency,
      gaming_risk_score, interventions_triggered,
      tasks_completed, total_tasks_planned,
      (tasks_completed::float / NULLIF(total_tasks_planned, 0)) as completion_rate
    FROM assessment_sessions
    WHERE is_deleted = false AND status = 'COMPLETED'
  `,

  // Cultural effectiveness view
  culturalEffectiveness: `
    CREATE VIEW v_cultural_effectiveness AS
    SELECT 
      cultural_context,
      competency_type,
      COUNT(*) as session_count,
      AVG(cultural_adaptation_score) as avg_adaptation_score,
      AVG(overall_data_quality) as avg_data_quality,
      AVG(engagement_level) as avg_engagement,
      AVG(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completion_rate
    FROM assessment_sessions
    WHERE is_deleted = false
    GROUP BY cultural_context, competency_type
  `,

  // Person progress summary view
  personProgress: `
    CREATE VIEW v_person_assessment_progress AS
    SELECT 
      person_id,
      COUNT(*) as total_sessions,
      COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_sessions,
      AVG(current_ccis_level) as avg_ccis_level,
      AVG(confidence_score) as avg_confidence,
      MAX(start_time) as last_assessment_date,
      STRING_AGG(DISTINCT competency_type, ',') as assessed_competencies
    FROM assessment_sessions
    WHERE is_deleted = false
    GROUP BY person_id
  `,
};

/**
 * Assessment Session table creation SQL
 */
export const CREATE_ASSESSMENT_SESSION_TABLE = `
  CREATE TABLE IF NOT EXISTS assessment_sessions (
    -- Primary identifiers
    id VARCHAR(50) PRIMARY KEY,
    person_id VARCHAR(50) NOT NULL,
    
    -- Session configuration
    competency_type VARCHAR(30) NOT NULL,
    session_type VARCHAR(20) NOT NULL DEFAULT 'FORMATIVE',
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    
    -- Temporal data
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    max_duration INTEGER NOT NULL,
    actual_duration INTEGER,
    
    -- Assessment context
    cultural_context VARCHAR(20) NOT NULL DEFAULT 'INDIA',
    language_preference VARCHAR(20) NOT NULL DEFAULT 'english',
    accessibility_needs JSONB DEFAULT '[]',
    
    -- Assessment configuration
    assessment_purpose VARCHAR(100),
    difficulty_level INTEGER DEFAULT 5,
    adaptive_enabled BOOLEAN DEFAULT true,
    gaming_detection_enabled BOOLEAN DEFAULT true,
    
    -- Session metadata
    session_metadata JSONB DEFAULT '{}',
    
    -- Session progress
    current_task_index INTEGER DEFAULT 0,
    total_tasks_planned INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    
    -- Quality metrics
    overall_data_quality DECIMAL(3,2) DEFAULT 0,
    behavioral_consistency DECIMAL(3,2) DEFAULT 0,
    engagement_level DECIMAL(3,2) DEFAULT 0,
    
    -- Gaming detection
    gaming_risk_score DECIMAL(3,2) DEFAULT 0,
    gaming_patterns_detected JSONB DEFAULT '[]',
    interventions_triggered INTEGER DEFAULT 0,
    
    -- Performance metrics
    average_task_duration DECIMAL(8,2),
    average_quality_score DECIMAL(3,2),
    total_interactions INTEGER DEFAULT 0,
    
    -- CCIS progression
    initial_ccis_level INTEGER,
    current_ccis_level INTEGER,
    confidence_score DECIMAL(3,2),
    level_advancement_count INTEGER DEFAULT 0,
    
    -- Cultural effectiveness
    cultural_adaptation_score DECIMAL(3,2),
    cross_cultural_validation BOOLEAN DEFAULT false,
    
    -- Scaffolding and adaptation
    scaffolding_adjustments JSONB DEFAULT '[]',
    
    -- Session outcomes
    outcome_metrics JSONB DEFAULT '{}',
    
    -- Analytics data
    analytics_data JSONB DEFAULT '{}',
    
    -- System data
    processing_metrics JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(50)
  );
`;
