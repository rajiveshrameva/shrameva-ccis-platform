/**
 * Competency Assessment ORM Entity
 *
 * Prisma ORM entity mapping for CompetencyAssessment domain entity.
 * This entity represents the database schema for competency assessments,
 * storing CCIS level progression, confidence scores, evidence data,
 * and competency-specific analytics that power the skill passport system.
 *
 * Key Features:
 * - CCIS level progression tracking with historical data
 * - Confidence score evolution and validation
 * - Evidence-based assessment audit trails
 * - Cross-competency correlation analysis
 * - Cultural context adaptation tracking
 * - Performance benchmarking support
 *
 * Database Design:
 * - Competency-centric organization
 * - Historical progression preservation
 * - Evidence quality validation
 * - Analytics optimization
 * - Cross-reference support
 *
 * @example
 * ```sql
 * -- Store competency assessment
 * INSERT INTO competency_assessments (id, person_id, competency_type, ...)
 * VALUES ('comp-123', 'person-456', 'COMMUNICATION', ...);
 *
 * -- Query progression history
 * SELECT * FROM competency_assessments
 * WHERE person_id = 'person-456'
 * ORDER BY assessment_date;
 * ```
 */

/**
 * Competency Assessment ORM Entity
 *
 * Maps to the competency_assessments table in the database.
 * Stores comprehensive competency evaluation data for skill passport system.
 */
export interface CompetencyAssessmentOrmEntity {
  // Primary identifiers
  id: string;
  sessionId: string;
  personId: string;
  competencyType: string; // COMMUNICATION, PROBLEM_SOLVING, etc.

  // Assessment metadata
  assessmentDate: Date;
  assessmentVersion: string; // Version of assessment algorithm used
  assessmentMethod: string; // BEHAVIORAL, TASK_BASED, PORTFOLIO, PEER_REVIEW
  culturalContext: string; // INDIA, UAE, GLOBAL

  // CCIS level data
  ccisLevel: number; // 1-4 scale
  previousCcisLevel: number | null; // For progression tracking
  levelConfidence: number; // 0-1 scale
  levelJustification: string; // Explanation for level assignment

  // Confidence scoring
  confidenceScore: number; // 0-1 scale
  confidenceFactors: {
    // Data quality contribution to confidence
    dataQuality?: {
      completeness: number;
      consistency: number;
      reliability: number;
      validity: number;
    };

    // Evidence strength
    evidenceStrength?: {
      directEvidence: number;
      indirectEvidence: number;
      crossValidation: number;
      temporalConsistency: number;
    };

    // Assessment method confidence
    methodConfidence?: {
      methodReliability: number;
      contextualRelevance: number;
      culturalAppropriatenesss: number;
      algorithmicConfidence: number;
    };

    // External validation
    externalValidation?: {
      peerValidation: number;
      expertValidation: number;
      performanceValidation: number;
      outcomeValidation: number;
    };
  }; // JSON

  // Evidence data
  evidenceData: {
    // Primary evidence sources
    primaryEvidence?: {
      taskPerformance?: {
        taskCount: number;
        averageQuality: number;
        consistencyScore: number;
        improvementTrend: number;
      };
      behavioralObservations?: {
        observationCount: number;
        consistencyRating: number;
        skillDemonstration: number;
        naturalBehavior: number;
      };
      selfAssessment?: {
        selfRating: number;
        selfAwareness: number;
        accuracyScore: number;
        confidenceCalibration: number;
      };
      peerFeedback?: {
        peerCount: number;
        averageRating: number;
        consensusLevel: number;
        credibilityScore: number;
      };
    };

    // Supporting evidence
    supportingEvidence?: {
      historicalPerformance?: {
        trendData: number[];
        improvementRate: number;
        consistencyMetrics: number;
        contextualFactors: string[];
      };
      transferEvidence?: {
        crossContextApplication: number;
        adaptabilityDemonstration: number;
        generalizationCapability: number;
        novelSituationPerformance: number;
      };
      metacognitive?: {
        selfReflectionQuality: number;
        strategicThinking: number;
        learningAwareness: number;
        adaptiveCapacity: number;
      };
    };

    // Evidence quality metrics
    evidenceQuality?: {
      overallQuality: number;
      reliabilityScore: number;
      validityScore: number;
      comprehensiveness: number;
      recency: number;
      relevance: number;
    };
  }; // JSON

  // Competency-specific data
  competencySpecificData: {
    // Communication competency specific
    communication?: {
      verbalCommunication?: {
        clarity: number;
        articulation: number;
        vocabulary: number;
        persuasiveness: number;
      };
      writtenCommunication?: {
        structureQuality: number;
        grammarAccuracy: number;
        coherence: number;
        purposefulness: number;
      };
      nonVerbalCommunication?: {
        bodyLanguage: number;
        eyeContact: number;
        gestures: number;
        overallPresence: number;
      };
      listeningSkills?: {
        activeListening: number;
        comprehension: number;
        empathyDemonstration: number;
        responseQuality: number;
      };
      culturalCommunication?: {
        culturalSensitivity: number;
        adaptationAbility: number;
        crossCulturalEffectiveness: number;
        respectfulInteraction: number;
      };
    };

    // Problem solving competency specific
    problemSolving?: {
      problemIdentification?: {
        problemRecognition: number;
        rootCauseAnalysis: number;
        prioritization: number;
        scopeDefinition: number;
      };
      solutionGeneration?: {
        creativity: number;
        alternativeGeneration: number;
        innovativeThinking: number;
        practicalSolutions: number;
      };
      analyticalThinking?: {
        logicalReasoning: number;
        dataAnalysis: number;
        patternRecognition: number;
        conclusionDrawing: number;
      };
      decisionMaking?: {
        criteriaEvaluation: number;
        riskAssessment: number;
        timelyDecisions: number;
        outcomeEvaluation: number;
      };
    };

    // Add other competency-specific structures as needed
    teamwork?: Record<string, any>;
    adaptability?: Record<string, any>;
    timeManagement?: Record<string, any>;
    technicalSkills?: Record<string, any>;
    leadership?: Record<string, any>;
  }; // JSON

  // Progression data
  progressionData: {
    // Historical progression
    progressionHistory?: {
      date: Date;
      level: number;
      confidence: number;
      triggerEvent: string;
      improvementAreas: string[];
    }[];

    // Learning velocity
    learningVelocity?: {
      progressionRate: number; // levels per month
      accelerationFactor: number;
      consistencyScore: number;
      plateauDuration: number; // days
    };

    // Milestone achievements
    milestones?: {
      milestoneType: string;
      achievementDate: Date;
      significanceLevel: number;
      evidenceQuality: number;
    }[];

    // Future projections
    projections?: {
      nextLevelProbability: number;
      estimatedTimeToNextLevel: number; // days
      requiredImprovements: string[];
      confidenceInProjection: number;
    };
  }; // JSON

  // Cultural adaptation data
  culturalAdaptationData: {
    // Cultural context effectiveness
    contextEffectiveness?: {
      culturalAlignment: number;
      adaptationSuccess: number;
      culturalSensitivity: number;
      contextualRelevance: number;
    };

    // Cultural learning patterns
    culturalLearning?: {
      culturalCompetence: number;
      crossCulturalTransfer: number;
      culturalAdaptability: number;
      respectForDiversity: number;
    };

    // Cultural challenges
    culturalChallenges?: {
      identifiedBarriers: string[];
      adaptationStrategies: string[];
      successFactors: string[];
      improvementNeeds: string[];
    };

    // Cultural strengths
    culturalStrengths?: {
      culturalAssets: string[];
      uniquePerspectives: string[];
      culturalContributions: string[];
      diversityValue: string[];
    };
  }; // JSON

  // Assessment analytics
  assessmentAnalytics: {
    // Comparative analysis
    comparativeAnalysis?: {
      peerComparison?: {
        percentileRanking: number;
        peerGroupAverage: number;
        relativaStrength: number;
        competitiveAdvantage: boolean;
      };
      benchmarkComparison?: {
        industryBenchmark: number;
        academicBenchmark: number;
        globalBenchmark: number;
        regionalBenchmark: number;
      };
      historicalComparison?: {
        personalBest: number;
        improvementFromBaseline: number;
        consistencyWithHistory: number;
        trendAlignment: number;
      };
    };

    // Predictive analytics
    predictiveAnalytics?: {
      futurePerformance?: {
        oneMonthProjection: number;
        threeMonthProjection: number;
        sixMonthProjection: number;
        oneYearProjection: number;
      };
      riskFactors?: {
        plateauRisk: number;
        regressionRisk: number;
        engagementRisk: number;
        motivationRisk: number;
      };
      opportunityFactors?: {
        accelerationOpportunity: number;
        transferOpportunity: number;
        leadershipOpportunity: number;
        mentorshipOpportunity: number;
      };
    };

    // Correlation analysis
    correlationAnalysis?: {
      crossCompetencyCorrelations?: {
        competency: string;
        correlationStrength: number;
        mutualReinforcement: boolean;
        developmentSynergy: number;
      }[];
      skillClusterAnalysis?: {
        primaryCluster: string;
        clusterStrength: number;
        developmentPattern: string;
        optimizationStrategy: string;
      };
    };
  }; // JSON

  // Intervention and recommendations
  interventionData: {
    // Current interventions
    activeInterventions?: {
      interventionType: string;
      startDate: Date;
      targetOutcome: string;
      progressToTarget: number;
      effectiveness: number;
    }[];

    // Completed interventions
    completedInterventions?: {
      interventionType: string;
      duration: number; // days
      outcome: string;
      effectiveness: number;
      lessonsLearned: string[];
    }[];

    // Recommended interventions
    recommendations?: {
      recommendationType: string;
      priority: 'high' | 'medium' | 'low';
      expectedImpact: number;
      timeframe: string;
      resourceRequirements: string[];
    }[];

    // Scaffolding history
    scaffoldingHistory?: {
      scaffoldingType: string;
      applicationDate: Date;
      effectiveness: number;
      userReception: number;
      outcome: string;
    }[];
  }; // JSON

  // Validation and verification
  validationData: {
    // Internal validation
    internalValidation?: {
      algorithmicValidation: number;
      crossReferenceValidation: number;
      temporalConsistency: number;
      logicalConsistency: number;
    };

    // External validation
    externalValidation?: {
      peerValidation?: {
        validatorCount: number;
        consensusLevel: number;
        averageRating: number;
        credibilityScore: number;
      };
      expertValidation?: {
        expertCount: number;
        expertiseLevel: number;
        validationScore: number;
        recommendationConfidence: number;
      };
      performanceValidation?: {
        realWorldPerformance: number;
        transferSuccess: number;
        applicationEffectiveness: number;
        outcomeAlignment: number;
      };
    };

    // Quality assurance
    qualityAssurance?: {
      dataIntegrityCheck: boolean;
      algorithmicReliability: number;
      biasDetection: number;
      fairnessAssessment: number;
    };
  }; // JSON

  // Metadata and system information
  systemMetadata: {
    // Processing information
    processing?: {
      algorithmVersion: string;
      processingTime: number;
      computationalComplexity: number;
      resourceUsage: number;
    };

    // Data lineage
    dataLineage?: {
      dataSourced: string[];
      processingSteps: string[];
      qualityChecks: string[];
      validationSteps: string[];
    };

    // Version control
    versionControl?: {
      assessmentVersion: string;
      algorithmVersion: string;
      dataVersion: string;
      configurationVersion: string;
    };

    // Audit information
    auditInfo?: {
      createdBy: string;
      reviewedBy: string[];
      approvedBy: string;
      lastModifiedBy: string;
    };
  }; // JSON

  // Computed metrics (stored for performance)
  overallCompetencyScore: number; // 0-1 scale
  competencyStrengthRating: number; // 0-1 scale
  developmentPriorityScore: number; // 0-1 scale
  crossCompetencyImpact: number; // 0-1 scale

  // Quality indicators
  assessmentReliability: number; // 0-1 scale
  evidenceCompleteness: number; // 0-1 scale
  validationStrength: number; // 0-1 scale
  culturalRelevance: number; // 0-1 scale

  // Status and lifecycle
  assessmentStatus: string; // DRAFT, VALIDATED, APPROVED, SUPERSEDED, ARCHIVED
  isCurrentAssessment: boolean; // Latest assessment for this competency
  supersededBy: string | null; // ID of newer assessment

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
    progressionTrend?: 'improving' | 'stable' | 'declining';
    benchmarkPosition?:
      | 'below_average'
      | 'average'
      | 'above_average'
      | 'exceptional';
    developmentRecommendation?: string;
    nextMilestone?: string;
  };
}

/**
 * Assessment Session ORM Entity Reference
 */
export interface AssessmentSessionOrmEntity {
  id: string;
  personId: string;
  // ... other fields
}

/**
 * Database indexes for optimal query performance
 */
export const COMPETENCY_ASSESSMENT_INDEXES = {
  // Primary access patterns
  personId:
    'CREATE INDEX idx_competency_assessments_person_id ON competency_assessments(person_id)',
  sessionId:
    'CREATE INDEX idx_competency_assessments_session_id ON competency_assessments(session_id)',
  competencyType:
    'CREATE INDEX idx_competency_assessments_competency_type ON competency_assessments(competency_type)',

  // Temporal queries
  assessmentDate:
    'CREATE INDEX idx_competency_assessments_date ON competency_assessments(assessment_date)',

  // Current assessments (most frequently queried)
  currentAssessments:
    'CREATE INDEX idx_competency_assessments_current ON competency_assessments(person_id, competency_type, is_current_assessment) WHERE is_current_assessment = true',

  // Progression tracking
  personCompetencyProgression:
    'CREATE INDEX idx_competency_assessments_progression ON competency_assessments(person_id, competency_type, assessment_date)',

  // Level and confidence queries
  ccisLevel:
    'CREATE INDEX idx_competency_assessments_ccis_level ON competency_assessments(ccis_level)',
  confidenceScore:
    'CREATE INDEX idx_competency_assessments_confidence ON competency_assessments(confidence_score)',

  // Cultural analysis
  culturalContext:
    'CREATE INDEX idx_competency_assessments_cultural ON competency_assessments(cultural_context)',
  culturalCompetency:
    'CREATE INDEX idx_competency_assessments_cultural_competency ON competency_assessments(cultural_context, competency_type)',

  // Assessment status and quality
  assessmentStatus:
    'CREATE INDEX idx_competency_assessments_status ON competency_assessments(assessment_status)',
  qualityMetrics:
    'CREATE INDEX idx_competency_assessments_quality ON competency_assessments(assessment_reliability, evidence_completeness)',

  // Composite indexes for analytics
  competencyLevelConfidence:
    'CREATE INDEX idx_competency_assessments_level_confidence ON competency_assessments(competency_type, ccis_level, confidence_score)',
  personProgressAnalytics:
    'CREATE INDEX idx_competency_assessments_person_analytics ON competency_assessments(person_id, assessment_date, ccis_level, confidence_score) WHERE is_deleted = false',
  benchmarkingQueries:
    "CREATE INDEX idx_competency_assessments_benchmarking ON competency_assessments(competency_type, cultural_context, ccis_level, assessment_date) WHERE assessment_status = 'APPROVED'",

  // JSON field indexes (PostgreSQL specific)
  evidenceDataGin:
    'CREATE INDEX idx_competency_assessments_evidence_gin ON competency_assessments USING gin(evidence_data)',
  competencySpecificGin:
    'CREATE INDEX idx_competency_assessments_specific_gin ON competency_assessments USING gin(competency_specific_data)',
  progressionDataGin:
    'CREATE INDEX idx_competency_assessments_progression_gin ON competency_assessments USING gin(progression_data)',
  analyticsDataGin:
    'CREATE INDEX idx_competency_assessments_analytics_gin ON competency_assessments USING gin(assessment_analytics)',

  // Performance optimization
  activeAssessments:
    "CREATE INDEX idx_competency_assessments_active ON competency_assessments(person_id, competency_type) WHERE is_deleted = false AND assessment_status IN ('VALIDATED', 'APPROVED')",
  recentAssessments:
    "CREATE INDEX idx_competency_assessments_recent ON competency_assessments(assessment_date DESC, person_id) WHERE assessment_date >= NOW() - INTERVAL '6 months'",

  // Soft delete optimization
  notDeleted:
    'CREATE INDEX idx_competency_assessments_not_deleted ON competency_assessments(id) WHERE is_deleted = false',
};

/**
 * Database constraints for data integrity
 */
export const COMPETENCY_ASSESSMENT_CONSTRAINTS = {
  // Primary key
  primaryKey:
    'ALTER TABLE competency_assessments ADD CONSTRAINT pk_competency_assessments PRIMARY KEY (id)',

  // Foreign key constraints
  sessionIdFk:
    'ALTER TABLE competency_assessments ADD CONSTRAINT fk_competency_assessments_session_id FOREIGN KEY (session_id) REFERENCES assessment_sessions(id)',
  personIdFk:
    'ALTER TABLE competency_assessments ADD CONSTRAINT fk_competency_assessments_person_id FOREIGN KEY (person_id) REFERENCES persons(id)',

  // Check constraints
  competencyTypeCheck:
    "ALTER TABLE competency_assessments ADD CONSTRAINT chk_competency_assessments_competency_type CHECK (competency_type IN ('COMMUNICATION', 'PROBLEM_SOLVING', 'TEAMWORK', 'ADAPTABILITY', 'TIME_MANAGEMENT', 'TECHNICAL_SKILLS', 'LEADERSHIP'))",
  ccisLevelCheck:
    'ALTER TABLE competency_assessments ADD CONSTRAINT chk_competency_assessments_ccis_level CHECK (ccis_level >= 1 AND ccis_level <= 4 AND (previous_ccis_level IS NULL OR (previous_ccis_level >= 1 AND previous_ccis_level <= 4)))',
  confidenceScoreCheck:
    'ALTER TABLE competency_assessments ADD CONSTRAINT chk_competency_assessments_confidence CHECK (confidence_score >= 0 AND confidence_score <= 1 AND level_confidence >= 0 AND level_confidence <= 1)',
  qualityScoresCheck:
    'ALTER TABLE competency_assessments ADD CONSTRAINT chk_competency_assessments_quality_scores CHECK (assessment_reliability >= 0 AND assessment_reliability <= 1 AND evidence_completeness >= 0 AND evidence_completeness <= 1)',
  assessmentStatusCheck:
    "ALTER TABLE competency_assessments ADD CONSTRAINT chk_competency_assessments_status CHECK (assessment_status IN ('DRAFT', 'VALIDATED', 'APPROVED', 'SUPERSEDED', 'ARCHIVED'))",
  culturalContextCheck:
    "ALTER TABLE competency_assessments ADD CONSTRAINT chk_competency_assessments_cultural_context CHECK (cultural_context IN ('INDIA', 'UAE', 'GLOBAL'))",

  // Business logic constraints
  currentAssessmentLogic:
    "ALTER TABLE competency_assessments ADD CONSTRAINT chk_competency_assessments_current_logic CHECK ((is_current_assessment = true AND assessment_status IN ('VALIDATED', 'APPROVED')) OR is_current_assessment = false)",
  supersededLogic:
    "ALTER TABLE competency_assessments ADD CONSTRAINT chk_competency_assessments_superseded_logic CHECK ((assessment_status = 'SUPERSEDED' AND superseded_by IS NOT NULL) OR (assessment_status != 'SUPERSEDED' AND superseded_by IS NULL))",

  // Unique constraints
  uniqueCurrentAssessment:
    'CREATE UNIQUE INDEX idx_competency_assessments_unique_current ON competency_assessments(person_id, competency_type) WHERE is_current_assessment = true AND is_deleted = false',

  // Version control
  versionCheck:
    'ALTER TABLE competency_assessments ADD CONSTRAINT chk_competency_assessments_version CHECK (version >= 1)',

  // Soft delete consistency
  deleteConsistency:
    'ALTER TABLE competency_assessments ADD CONSTRAINT chk_competency_assessments_delete_consistency CHECK ((is_deleted = false AND deleted_at IS NULL AND deleted_by IS NULL) OR (is_deleted = true AND deleted_at IS NOT NULL AND deleted_by IS NOT NULL))',
};

/**
 * Database views for common analytics queries
 */
export const COMPETENCY_ASSESSMENT_VIEWS = {
  // Current competency levels for all persons
  currentCompetencyLevels: `
    CREATE VIEW v_current_competency_levels AS
    SELECT 
      person_id, competency_type, ccis_level, confidence_score,
      assessment_date, assessment_reliability, evidence_completeness
    FROM competency_assessments
    WHERE is_current_assessment = true 
      AND is_deleted = false 
      AND assessment_status IN ('VALIDATED', 'APPROVED')
  `,

  // Competency progression tracking
  competencyProgression: `
    CREATE VIEW v_competency_progression AS
    SELECT 
      person_id, competency_type,
      assessment_date, ccis_level, confidence_score,
      LAG(ccis_level) OVER (PARTITION BY person_id, competency_type ORDER BY assessment_date) as previous_level,
      LAG(assessment_date) OVER (PARTITION BY person_id, competency_type ORDER BY assessment_date) as previous_date,
      LEAD(ccis_level) OVER (PARTITION BY person_id, competency_type ORDER BY assessment_date) as next_level
    FROM competency_assessments
    WHERE is_deleted = false AND assessment_status IN ('VALIDATED', 'APPROVED')
    ORDER BY person_id, competency_type, assessment_date
  `,

  // Competency benchmarks
  competencyBenchmarks: `
    CREATE VIEW v_competency_benchmarks AS
    SELECT 
      competency_type, cultural_context,
      COUNT(*) as assessment_count,
      AVG(ccis_level) as avg_level,
      PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY ccis_level) as percentile_25,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ccis_level) as median_level,
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY ccis_level) as percentile_75,
      AVG(confidence_score) as avg_confidence,
      AVG(assessment_reliability) as avg_reliability
    FROM competency_assessments
    WHERE is_deleted = false 
      AND assessment_status = 'APPROVED'
      AND assessment_date >= NOW() - INTERVAL '12 months'
    GROUP BY competency_type, cultural_context
  `,

  // Person competency portfolio
  personCompetencyPortfolio: `
    CREATE VIEW v_person_competency_portfolio AS
    SELECT 
      person_id,
      COUNT(*) as total_competencies,
      AVG(ccis_level) as avg_level,
      AVG(confidence_score) as avg_confidence,
      COUNT(CASE WHEN ccis_level >= 3 THEN 1 END) as advanced_competencies,
      COUNT(CASE WHEN ccis_level = 4 THEN 1 END) as expert_competencies,
      MAX(assessment_date) as last_assessment_date,
      STRING_AGG(competency_type, ',') as competency_list
    FROM competency_assessments
    WHERE is_current_assessment = true 
      AND is_deleted = false 
      AND assessment_status IN ('VALIDATED', 'APPROVED')
    GROUP BY person_id
  `,

  // Cultural effectiveness analysis
  culturalEffectiveness: `
    CREATE VIEW v_cultural_effectiveness AS
    SELECT 
      cultural_context, competency_type,
      COUNT(*) as assessment_count,
      AVG(cultural_relevance) as avg_cultural_relevance,
      AVG(ccis_level) as avg_achievement_level,
      AVG(confidence_score) as avg_confidence,
      STDDEV(ccis_level) as level_consistency
    FROM competency_assessments
    WHERE is_deleted = false 
      AND assessment_status = 'APPROVED'
      AND cultural_relevance IS NOT NULL
    GROUP BY cultural_context, competency_type
  `,
};

/**
 * Competency Assessment table creation SQL
 */
export const CREATE_COMPETENCY_ASSESSMENT_TABLE = `
  CREATE TABLE IF NOT EXISTS competency_assessments (
    -- Primary identifiers
    id VARCHAR(50) PRIMARY KEY,
    session_id VARCHAR(50) NOT NULL,
    person_id VARCHAR(50) NOT NULL,
    competency_type VARCHAR(30) NOT NULL,
    
    -- Assessment metadata
    assessment_date TIMESTAMPTZ NOT NULL,
    assessment_version VARCHAR(20) NOT NULL,
    assessment_method VARCHAR(30) NOT NULL,
    cultural_context VARCHAR(20) NOT NULL,
    
    -- CCIS level data
    ccis_level INTEGER NOT NULL,
    previous_ccis_level INTEGER,
    level_confidence DECIMAL(3,2) NOT NULL,
    level_justification TEXT,
    
    -- Confidence scoring
    confidence_score DECIMAL(3,2) NOT NULL,
    confidence_factors JSONB DEFAULT '{}',
    
    -- Evidence data (JSON)
    evidence_data JSONB DEFAULT '{}',
    
    -- Competency-specific data (JSON)
    competency_specific_data JSONB DEFAULT '{}',
    
    -- Progression data (JSON)
    progression_data JSONB DEFAULT '{}',
    
    -- Cultural adaptation data (JSON)
    cultural_adaptation_data JSONB DEFAULT '{}',
    
    -- Assessment analytics (JSON)
    assessment_analytics JSONB DEFAULT '{}',
    
    -- Intervention and recommendations (JSON)
    intervention_data JSONB DEFAULT '{}',
    
    -- Validation and verification (JSON)
    validation_data JSONB DEFAULT '{}',
    
    -- System metadata (JSON)
    system_metadata JSONB DEFAULT '{}',
    
    -- Computed metrics
    overall_competency_score DECIMAL(3,2) NOT NULL DEFAULT 0,
    competency_strength_rating DECIMAL(3,2) NOT NULL DEFAULT 0,
    development_priority_score DECIMAL(3,2) NOT NULL DEFAULT 0,
    cross_competency_impact DECIMAL(3,2) NOT NULL DEFAULT 0,
    
    -- Quality indicators
    assessment_reliability DECIMAL(3,2) NOT NULL DEFAULT 0,
    evidence_completeness DECIMAL(3,2) NOT NULL DEFAULT 0,
    validation_strength DECIMAL(3,2) NOT NULL DEFAULT 0,
    cultural_relevance DECIMAL(3,2) NOT NULL DEFAULT 0,
    
    -- Status and lifecycle
    assessment_status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    is_current_assessment BOOLEAN DEFAULT false,
    superseded_by VARCHAR(50),
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(50)
  );
`;
