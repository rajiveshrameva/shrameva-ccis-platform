/**
 * Task Interaction ORM Entity
 *
 * Prisma ORM entity mapping for TaskInteraction domain entity.
 * This entity represents the database schema for task interactions,
 * storing detailed behavioral data, quality metrics, and real-time
 * assessment signals that drive the CCIS measurement algorithms.
 *
 * Key Features:
 * - High-volume behavioral data storage
 * - Real-time data ingestion optimization
 * - Time-series data management
 * - Gaming detection signal preservation
 * - Quality metrics tracking
 * - Contextual factor storage
 *
 * Database Design:
 * - Time-series optimized schema
 * - Partitioning support for scalability
 * - Compression for behavioral data
 * - Real-time analytics indexes
 * - Data retention policies
 *
 * @example
 * ```sql
 * -- Store task interaction
 * INSERT INTO task_interactions (id, session_id, person_id, ...)
 * VALUES ('interaction-123', 'session-456', 'person-789', ...);
 *
 * -- Query behavioral patterns
 * SELECT * FROM task_interactions
 * WHERE person_id = 'person-789'
 * ORDER BY interaction_timestamp;
 * ```
 */

/**
 * Task Interaction ORM Entity
 *
 * Maps to the task_interactions table in the database.
 * Stores comprehensive interaction data for behavioral analysis.
 */
export interface TaskInteractionOrmEntity {
  // Primary identifiers
  id: string;
  sessionId: string;
  personId: string;
  taskId: string;

  // Interaction context
  competencyFocus: string; // COMMUNICATION, PROBLEM_SOLVING, etc.
  taskType: string; // MICRO_TASK, FUSION_TASK, ASSESSMENT_TASK
  taskDifficulty: number; // 1-10 scale

  // Temporal data
  interactionTimestamp: Date;
  startTime: Date;
  endTime: Date | null;
  duration: number; // milliseconds

  // Interaction data
  interactionData: {
    // Input methods
    inputMethods?: {
      keyboard?: {
        keystrokes: number;
        typingSpeed: number; // words per minute
        backspaceCount: number;
        pauseDuration: number[]; // milliseconds between keystrokes
      };
      mouse?: {
        clicks: number;
        mouseMoves: number;
        scrollActions: number;
        dragActions: number;
        hoverDuration: number;
      };
      touch?: {
        taps: number;
        swipes: number;
        pinches: number;
        touches: number;
        pressure: number[];
      };
      voice?: {
        speechDuration: number;
        pauseCount: number;
        confidence: number;
        clarity: number;
      };
    };

    // Task-specific data
    taskResponse?: {
      responseType: string; // text, multiple_choice, drag_drop, etc.
      responseValue: any;
      responseAccuracy: number;
      responseCompleteness: number;
      responseTime: number;
    };

    // Navigation patterns
    navigation?: {
      pageViews: string[];
      timePerPage: number[];
      backNavigations: number;
      menuUsage: number;
      helpSought: boolean;
      resourcesAccessed: string[];
    };

    // Cognitive load indicators
    cognitiveLoad?: {
      hesitationTime: number;
      revisionCount: number;
      undoActions: number;
      helpRequests: number;
      uncertaintyIndicators: number;
    };

    // Error patterns
    errors?: {
      errorCount: number;
      errorTypes: string[];
      recoveryTime: number[];
      errorPatterns: string[];
      selfCorrectionCount: number;
    };
  }; // JSON

  // Behavioral signals
  behavioralSignals: {
    // Timing patterns
    timing?: {
      reactionTime: number;
      processingTime: number;
      decisionTime: number;
      executionTime: number;
      reviewTime: number;
    };

    // Engagement signals
    engagement?: {
      focusLevel: number; // 0-1 scale
      attentionConsistency: number;
      distractionCount: number;
      taskCommitment: number;
      motivationLevel: number;
    };

    // Confidence indicators
    confidence?: {
      initialConfidence: number;
      finalConfidence: number;
      confidenceEvolution: number[];
      uncertaintyMarkers: number;
      secondGuessing: number;
    };

    // Stress and anxiety
    stressIndicators?: {
      stressLevel: number; // 0-1 scale
      anxietyMarkers: number;
      frustrationLevel: number;
      overwhelmIndicators: number;
      calmingBehaviors: number;
    };

    // Learning patterns
    learning?: {
      explorationBehavior: number;
      experimentationLevel: number;
      patternRecognition: number;
      adaptationSpeed: number;
      transferLearning: number;
    };

    // Social interaction (if applicable)
    social?: {
      collaborationLevel: number;
      communicationClarity: number;
      helpSeeking: number;
      helpProviding: number;
      socialAwareness: number;
    };

    // Cultural behavioral patterns
    cultural?: {
      communicationStyle: string;
      decisionMaking: string;
      problemSolving: string;
      timeOrientation: string;
      authorityInteraction: string;
    };
  }; // JSON

  // Quality metrics
  qualityMetrics: {
    // Data quality
    dataCompleteness: number; // 0-1 scale
    dataConsistency: number;
    dataAccuracy: number;
    signalClarity: number;

    // Behavioral quality
    behavioralConsistency: number;
    patternReliability: number;
    anomalyScore: number;
    naturalness: number;

    // Technical quality
    deviceStability: number;
    networkQuality: number;
    interfaceResponsiveness: number;
    dataIntegrity: number;

    // Context quality
    environmentalStability: number;
    contextualRelevance: number;
    culturalAppropriatenesss: number;
    taskAlignment: number;
  }; // JSON

  // Contextual factors
  contextualFactors: {
    // Environment
    environment?: {
      deviceType: string;
      operatingSystem: string;
      browserType: string;
      screenSize: string;
      networkCondition: string;
      location: string;
      timeOfDay: string;
      dayOfWeek: string;
    };

    // Personal context
    personalContext?: {
      energyLevel: number;
      moodState: string;
      stressLevel: number;
      motivationLevel: number;
      priorExperience: string;
      currentGoals: string[];
    };

    // External factors
    externalFactors?: {
      distractions: string[];
      timeConstraints: boolean;
      socialPressure: number;
      externalSupport: boolean;
      competitiveElements: boolean;
    };

    // Cultural context
    culturalContext?: {
      communicationNorms: string[];
      learningPreferences: string[];
      valueSystem: string[];
      socialExpectations: string[];
      culturalBarriers: string[];
    };

    // Accessibility context
    accessibility?: {
      assistiveTechnology: string[];
      accommodationsUsed: string[];
      accessibilityBarriers: string[];
      adaptationNeeds: string[];
    };
  }; // JSON

  // Gaming detection data
  gamingDetectionData: {
    // Pattern flags
    suspiciousPatterns?: {
      speedAnomalies: boolean;
      accuracyAnomalies: boolean;
      timingAnomalies: boolean;
      behavioralAnomalies: boolean;
      contextualAnomalies: boolean;
    };

    // Risk indicators
    riskIndicators?: {
      automationLikelihood: number;
      collabLikelihood: number;
      cheatingLikelihood: number;
      dataDoctoring: number;
      patternMatching: number;
    };

    // Behavioral markers
    behavioralMarkers?: {
      unnaturalConsistency: number;
      suspiciousAccuracy: number;
      impossibleSpeed: number;
      patternRepetition: number;
      crossTaskConsistency: number;
    };

    // Verification data
    verification?: {
      crossValidationScore: number;
      peerComparisonScore: number;
      historicalConsistency: number;
      contextualPlausibility: number;
    };
  }; // JSON

  // Analysis results
  analysisResults: {
    // CCIS contribution
    ccisContribution?: {
      competencyLevel: number;
      confidenceScore: number;
      evidenceStrength: number;
      contributionWeight: number;
    };

    // Behavioral analysis
    behavioralAnalysis?: {
      primaryPatterns: string[];
      secondaryPatterns: string[];
      anomalies: string[];
      insights: string[];
    };

    // Learning insights
    learningInsights?: {
      learningStyle: string;
      strengthAreas: string[];
      improvementAreas: string[];
      recommendedAdaptations: string[];
    };

    // Cultural insights
    culturalInsights?: {
      culturalAlignment: number;
      adaptationNeeds: string[];
      culturalStrengths: string[];
      potentialBarriers: string[];
    };
  }; // JSON

  // Performance data
  performanceMetrics: {
    // Task performance
    taskPerformance?: {
      completionRate: number;
      accuracyRate: number;
      efficiencyScore: number;
      qualityScore: number;
    };

    // Learning performance
    learningPerformance?: {
      comprehensionLevel: number;
      retentionIndicators: number;
      transferability: number;
      applicationAbility: number;
    };

    // Behavioral performance
    behavioralPerformance?: {
      consistencyScore: number;
      adaptabilityScore: number;
      resilienceScore: number;
      persistenceScore: number;
    };

    // Social performance (if applicable)
    socialPerformance?: {
      communicationEffectiveness: number;
      collaborationSkill: number;
      empathyDemonstration: number;
      leadershipIndicators: number;
    };
  }; // JSON

  // Intervention data
  interventionData: {
    // Scaffolding received
    scaffolding?: {
      scaffoldingType: string[];
      scaffoldingLevel: number;
      effectivenesss: number;
      userReception: number;
    };

    // Feedback received
    feedback?: {
      feedbackType: string[];
      feedbackTiming: string;
      feedbackRelevance: number;
      userResponseToFeedback: number;
    };

    // Adaptations made
    adaptations?: {
      adaptationType: string[];
      adaptationTrigger: string;
      adaptationEffectiveness: number;
      userSatisfaction: number;
    };

    // Recommendations provided
    recommendations?: {
      recommendationType: string[];
      recommendationRelevance: number;
      userAcceptance: number;
      implementationSuccess: number;
    };
  }; // JSON

  // System metadata
  systemMetadata: {
    // Processing information
    processing?: {
      processingTime: number;
      algorithmVersion: string;
      dataQualityChecks: boolean;
      validationsPassed: string[];
    };

    // Storage information
    storage?: {
      compressionLevel: number;
      dataSize: number;
      storageLocation: string;
      backupStatus: string;
    };

    // Analytics information
    analytics?: {
      analyticsVersion: string;
      predictionGenerated: boolean;
      recommendationsGenerated: boolean;
      alertsTriggered: string[];
    };
  }; // JSON

  // Computed metrics (calculated fields)
  overallQualityScore: number; // 0-1 scale
  gamingRiskScore: number; // 0-1 scale
  learningProgressIndicator: number; // 0-1 scale
  culturalAlignmentScore: number; // 0-1 scale

  // Audit fields
  createdAt: Date;
  updatedAt: Date;
  version: number;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;

  // Relationships
  assessmentSession?: AssessmentSessionOrmEntity;

  // Computed fields (not stored, calculated on query)
  computedFields?: {
    normalizedQuality?: number;
    relativeDifficulty?: number;
    progressionContribution?: number;
    anomalyLevel?: number;
  };
}

/**
 * Assessment Session ORM Entity Reference
 */
export interface AssessmentSessionOrmEntity {
  id: string;
  personId: string;
  // ... other fields from assessment session
}

/**
 * Database indexes for optimal query performance
 */
export const TASK_INTERACTION_INDEXES = {
  // Primary access patterns
  sessionId:
    'CREATE INDEX idx_task_interactions_session_id ON task_interactions(session_id)',
  personId:
    'CREATE INDEX idx_task_interactions_person_id ON task_interactions(person_id)',
  taskId:
    'CREATE INDEX idx_task_interactions_task_id ON task_interactions(task_id)',

  // Temporal queries (critical for time-series analysis)
  interactionTimestamp:
    'CREATE INDEX idx_task_interactions_timestamp ON task_interactions(interaction_timestamp)',
  sessionTimestamp:
    'CREATE INDEX idx_task_interactions_session_timestamp ON task_interactions(session_id, interaction_timestamp)',
  personTimestamp:
    'CREATE INDEX idx_task_interactions_person_timestamp ON task_interactions(person_id, interaction_timestamp)',

  // Analytics queries
  competencyFocus:
    'CREATE INDEX idx_task_interactions_competency ON task_interactions(competency_focus)',
  taskType:
    'CREATE INDEX idx_task_interactions_task_type ON task_interactions(task_type)',
  qualityScore:
    'CREATE INDEX idx_task_interactions_quality ON task_interactions(overall_quality_score)',

  // Gaming detection queries
  gamingRisk:
    'CREATE INDEX idx_task_interactions_gaming_risk ON task_interactions(gaming_risk_score)',
  highRiskGaming:
    'CREATE INDEX idx_task_interactions_high_gaming_risk ON task_interactions(person_id, gaming_risk_score) WHERE gaming_risk_score > 0.7',

  // Composite indexes for complex queries
  personCompetencyTime:
    'CREATE INDEX idx_task_interactions_person_competency_time ON task_interactions(person_id, competency_focus, interaction_timestamp)',
  sessionQualityTime:
    'CREATE INDEX idx_task_interactions_session_quality_time ON task_interactions(session_id, overall_quality_score, interaction_timestamp)',
  competencyTaskQuality:
    'CREATE INDEX idx_task_interactions_competency_task_quality ON task_interactions(competency_focus, task_type, overall_quality_score)',

  // Performance optimization for behavioral analysis
  behavioralPatterns:
    'CREATE INDEX idx_task_interactions_behavioral ON task_interactions(person_id, task_type, duration) WHERE is_deleted = false',
  qualityAnalysis:
    'CREATE INDEX idx_task_interactions_quality_analysis ON task_interactions(competency_focus, overall_quality_score, cultural_alignment_score) WHERE is_deleted = false',

  // JSON field indexes (PostgreSQL specific)
  behavioralSignalsGin:
    'CREATE INDEX idx_task_interactions_behavioral_gin ON task_interactions USING gin(behavioral_signals)',
  contextualFactorsGin:
    'CREATE INDEX idx_task_interactions_contextual_gin ON task_interactions USING gin(contextual_factors)',
  qualityMetricsGin:
    'CREATE INDEX idx_task_interactions_quality_gin ON task_interactions USING gin(quality_metrics)',
  gamingDetectionGin:
    'CREATE INDEX idx_task_interactions_gaming_gin ON task_interactions USING gin(gaming_detection_data)',

  // Partitioning support indexes
  monthlyPartition:
    "CREATE INDEX idx_task_interactions_monthly ON task_interactions(DATE_TRUNC('month', interaction_timestamp), person_id)",

  // Soft delete optimization
  notDeleted:
    'CREATE INDEX idx_task_interactions_not_deleted ON task_interactions(id) WHERE is_deleted = false',

  // Real-time analytics optimization
  realtimeAnalytics:
    "CREATE INDEX idx_task_interactions_realtime ON task_interactions(session_id, interaction_timestamp DESC) WHERE interaction_timestamp >= NOW() - INTERVAL '1 hour'",
};

/**
 * Database constraints for data integrity
 */
export const TASK_INTERACTION_CONSTRAINTS = {
  // Primary key
  primaryKey:
    'ALTER TABLE task_interactions ADD CONSTRAINT pk_task_interactions PRIMARY KEY (id)',

  // Foreign key constraints
  sessionIdFk:
    'ALTER TABLE task_interactions ADD CONSTRAINT fk_task_interactions_session_id FOREIGN KEY (session_id) REFERENCES assessment_sessions(id)',
  personIdFk:
    'ALTER TABLE task_interactions ADD CONSTRAINT fk_task_interactions_person_id FOREIGN KEY (person_id) REFERENCES persons(id)',

  // Check constraints
  competencyFocusCheck:
    "ALTER TABLE task_interactions ADD CONSTRAINT chk_task_interactions_competency_focus CHECK (competency_focus IN ('COMMUNICATION', 'PROBLEM_SOLVING', 'TEAMWORK', 'ADAPTABILITY', 'TIME_MANAGEMENT', 'TECHNICAL_SKILLS', 'LEADERSHIP'))",
  taskTypeCheck:
    "ALTER TABLE task_interactions ADD CONSTRAINT chk_task_interactions_task_type CHECK (task_type IN ('MICRO_TASK', 'FUSION_TASK', 'ASSESSMENT_TASK', 'DIAGNOSTIC_TASK', 'REMEDIATION_TASK'))",
  difficultyCheck:
    'ALTER TABLE task_interactions ADD CONSTRAINT chk_task_interactions_difficulty CHECK (task_difficulty >= 1 AND task_difficulty <= 10)',
  durationCheck:
    'ALTER TABLE task_interactions ADD CONSTRAINT chk_task_interactions_duration CHECK (duration >= 0 AND duration <= 86400000)', // Max 24 hours in milliseconds
  qualityScoreCheck:
    'ALTER TABLE task_interactions ADD CONSTRAINT chk_task_interactions_quality_scores CHECK (overall_quality_score >= 0 AND overall_quality_score <= 1 AND gaming_risk_score >= 0 AND gaming_risk_score <= 1)',

  // Temporal constraints
  endTimeCheck:
    'ALTER TABLE task_interactions ADD CONSTRAINT chk_task_interactions_end_time CHECK (end_time IS NULL OR end_time >= start_time)',
  timestampCheck:
    'ALTER TABLE task_interactions ADD CONSTRAINT chk_task_interactions_timestamp CHECK (interaction_timestamp >= start_time)',

  // Version control
  versionCheck:
    'ALTER TABLE task_interactions ADD CONSTRAINT chk_task_interactions_version CHECK (version >= 1)',

  // Soft delete consistency
  deleteConsistency:
    'ALTER TABLE task_interactions ADD CONSTRAINT chk_task_interactions_delete_consistency CHECK ((is_deleted = false AND deleted_at IS NULL AND deleted_by IS NULL) OR (is_deleted = true AND deleted_at IS NOT NULL AND deleted_by IS NOT NULL))',
};

/**
 * Database views for common analytics queries
 */
export const TASK_INTERACTION_VIEWS = {
  // Real-time interaction stream
  realtimeInteractions: `
    CREATE VIEW v_realtime_task_interactions AS
    SELECT 
      id, session_id, person_id, task_id, competency_focus,
      interaction_timestamp, duration, overall_quality_score,
      gaming_risk_score, learning_progress_indicator
    FROM task_interactions
    WHERE is_deleted = false 
      AND interaction_timestamp >= NOW() - INTERVAL '1 hour'
    ORDER BY interaction_timestamp DESC
  `,

  // Behavioral patterns summary
  behavioralPatterns: `
    CREATE VIEW v_behavioral_patterns AS
    SELECT 
      person_id, competency_focus,
      COUNT(*) as interaction_count,
      AVG(duration) as avg_duration,
      AVG(overall_quality_score) as avg_quality,
      AVG(gaming_risk_score) as avg_gaming_risk,
      STDDEV(duration) as duration_consistency,
      MIN(interaction_timestamp) as first_interaction,
      MAX(interaction_timestamp) as last_interaction
    FROM task_interactions
    WHERE is_deleted = false
    GROUP BY person_id, competency_focus
  `,

  // Gaming detection alerts
  gamingAlerts: `
    CREATE VIEW v_gaming_detection_alerts AS
    SELECT 
      person_id, session_id, task_id,
      interaction_timestamp, gaming_risk_score,
      (gaming_detection_data->>'riskIndicators') as risk_indicators,
      overall_quality_score
    FROM task_interactions
    WHERE is_deleted = false 
      AND gaming_risk_score > 0.7
      AND interaction_timestamp >= NOW() - INTERVAL '24 hours'
    ORDER BY gaming_risk_score DESC, interaction_timestamp DESC
  `,

  // Quality metrics summary
  qualityMetrics: `
    CREATE VIEW v_quality_metrics_summary AS
    SELECT 
      competency_focus, task_type,
      COUNT(*) as interaction_count,
      AVG(overall_quality_score) as avg_quality,
      AVG(cultural_alignment_score) as avg_cultural_alignment,
      AVG(learning_progress_indicator) as avg_learning_progress,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY overall_quality_score) as median_quality,
      COUNT(CASE WHEN gaming_risk_score > 0.5 THEN 1 END) as high_risk_count
    FROM task_interactions
    WHERE is_deleted = false
    GROUP BY competency_focus, task_type
  `,

  // Person interaction timeline
  personTimeline: `
    CREATE VIEW v_person_interaction_timeline AS
    SELECT 
      person_id, session_id, competency_focus,
      interaction_timestamp, task_type, duration,
      overall_quality_score, learning_progress_indicator,
      LAG(interaction_timestamp) OVER (PARTITION BY person_id ORDER BY interaction_timestamp) as prev_interaction,
      LEAD(interaction_timestamp) OVER (PARTITION BY person_id ORDER BY interaction_timestamp) as next_interaction
    FROM task_interactions
    WHERE is_deleted = false
    ORDER BY person_id, interaction_timestamp
  `,
};

/**
 * Task Interaction table creation SQL with partitioning
 */
export const CREATE_TASK_INTERACTION_TABLE = `
  CREATE TABLE IF NOT EXISTS task_interactions (
    -- Primary identifiers
    id VARCHAR(50) PRIMARY KEY,
    session_id VARCHAR(50) NOT NULL,
    person_id VARCHAR(50) NOT NULL,
    task_id VARCHAR(50) NOT NULL,
    
    -- Interaction context
    competency_focus VARCHAR(30) NOT NULL,
    task_type VARCHAR(30) NOT NULL,
    task_difficulty INTEGER NOT NULL DEFAULT 5,
    
    -- Temporal data
    interaction_timestamp TIMESTAMPTZ NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration BIGINT NOT NULL,
    
    -- Interaction data (JSON)
    interaction_data JSONB DEFAULT '{}',
    
    -- Behavioral signals (JSON)
    behavioral_signals JSONB DEFAULT '{}',
    
    -- Quality metrics (JSON)
    quality_metrics JSONB DEFAULT '{}',
    
    -- Contextual factors (JSON)
    contextual_factors JSONB DEFAULT '{}',
    
    -- Gaming detection data (JSON)
    gaming_detection_data JSONB DEFAULT '{}',
    
    -- Analysis results (JSON)
    analysis_results JSONB DEFAULT '{}',
    
    -- Performance metrics (JSON)
    performance_metrics JSONB DEFAULT '{}',
    
    -- Intervention data (JSON)
    intervention_data JSONB DEFAULT '{}',
    
    -- System metadata (JSON)
    system_metadata JSONB DEFAULT '{}',
    
    -- Computed metrics
    overall_quality_score DECIMAL(3,2) NOT NULL DEFAULT 0,
    gaming_risk_score DECIMAL(3,2) NOT NULL DEFAULT 0,
    learning_progress_indicator DECIMAL(3,2) NOT NULL DEFAULT 0,
    cultural_alignment_score DECIMAL(3,2) NOT NULL DEFAULT 0,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(50)
  ) PARTITION BY RANGE (interaction_timestamp);
`;

/**
 * Partition creation for time-series optimization
 */
export const CREATE_TASK_INTERACTION_PARTITIONS = `
  -- Create monthly partitions for the current and next few months
  CREATE TABLE task_interactions_2025_08 PARTITION OF task_interactions
    FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');
    
  CREATE TABLE task_interactions_2025_09 PARTITION OF task_interactions
    FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
    
  CREATE TABLE task_interactions_2025_10 PARTITION OF task_interactions
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
    
  CREATE TABLE task_interactions_2025_11 PARTITION OF task_interactions
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
    
  CREATE TABLE task_interactions_2025_12 PARTITION OF task_interactions
    FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');
`;
