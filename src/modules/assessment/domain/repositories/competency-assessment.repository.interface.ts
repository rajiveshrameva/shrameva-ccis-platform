/**
 * Competency Assessment Repository Interface
 *
 * Defines the contract for persisting and retrieving CompetencyAssessment entities.
 * This interface manages the storage and analysis of competency-specific assessment
 * data, CCIS level progression, and confidence scoring that forms the core of
 * the Shrameva skill passport system.
 *
 * Key Features:
 * - CCIS level progression tracking
 * - Confidence score evolution
 * - Competency-specific analytics
 * - Cross-competency correlation analysis
 * - Evidence-based assessment validation
 * - Longitudinal skill development tracking
 *
 * Design Principles:
 * - Competency-centric data organization
 * - Historical progression preservation
 * - Evidence audit trails
 * - Cross-competency analysis support
 * - Performance optimization for reporting
 *
 * @example
 * ```typescript
 * const repository = new CompetencyAssessmentRepository();
 *
 * // Track competency progression
 * const assessment = CompetencyAssessment.create(...);
 * await repository.save(assessment);
 *
 * // Get progression analytics
 * const progression = await repository.getProgressionAnalytics(personId);
 *
 * // Analyze competency correlations
 * const correlations = await repository.getCompetencyCorrelations(personId);
 * ```
 */

import { CompetencyAssessment } from '../entities/competency-assessment.entity';
import { PersonID } from '../../../../shared/value-objects/id.value-object';
import { CompetencyType } from '../value-objects/competency-type.value-object';
import { CCISLevel } from '../value-objects/ccis-level.value-object';
import { ConfidenceScore } from '../value-objects/confidence-score.value-object';

/**
 * Competency assessment search criteria
 */
export interface CompetencyAssessmentSearchCriteria {
  personId?: PersonID;
  sessionId?: string;
  competencyType?: CompetencyType;
  ccisLevelRange?: {
    minLevel: CCISLevel;
    maxLevel: CCISLevel;
  };
  confidenceRange?: {
    minConfidence: ConfidenceScore;
    maxConfidence: ConfidenceScore;
  };
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  culturalContext?: string[];
  hasEvidence?: boolean;
  progressionStatus?: ('stable' | 'improving' | 'declining')[];
  lastUpdatedWithin?: number; // hours
}

/**
 * Competency progression analytics
 */
export interface CompetencyProgressionAnalytics {
  personId: PersonID;
  overviewMetrics: {
    totalCompetencies: number;
    assessedCompetencies: number;
    averageCCISLevel: number;
    averageConfidence: number;
    overallProgressionTrend: 'improving' | 'stable' | 'declining';
    lastAssessmentDate: Date;
  };
  competencyDetails: {
    competency: CompetencyType;
    currentLevel: CCISLevel;
    confidence: ConfidenceScore;
    progressionHistory: {
      date: Date;
      level: CCISLevel;
      confidence: ConfidenceScore;
      evidenceCount: number;
      sessionId: string;
    }[];
    progressionTrend: 'improving' | 'stable' | 'declining';
    levelAdvancementProbability: number;
    estimatedTimeToNextLevel: number; // days
    strengthIndicators: string[];
    improvementAreas: string[];
    culturalAdaptationNeeded: boolean;
  }[];
  crossCompetencyInsights: {
    strongCorrelations: {
      competency1: CompetencyType;
      competency2: CompetencyType;
      correlationStrength: number;
      mutualReinforcement: boolean;
    }[];
    competencyGaps: {
      competency: CompetencyType;
      gapSize: number;
      impactOnOthers: number;
      priorityLevel: 'high' | 'medium' | 'low';
    }[];
    balanceScore: number;
    recommendedFocusAreas: CompetencyType[];
  };
  learningPathRecommendations: {
    immediateActions: {
      competency: CompetencyType;
      action: string;
      expectedImpact: 'high' | 'medium' | 'low';
      timeEstimate: number; // hours
    }[];
    mediumTermGoals: {
      competency: CompetencyType;
      targetLevel: CCISLevel;
      milestones: string[];
      estimatedCompletion: Date;
    }[];
    longTermVision: {
      overallProfileTarget: string;
      keyCompetencyTargets: {
        competency: CompetencyType;
        targetLevel: CCISLevel;
      }[];
      careerAlignment: string[];
    };
  };
}

/**
 * Competency correlation analysis
 */
export interface CompetencyCorrelationAnalysis {
  personId: PersonID;
  correlationMatrix: {
    competency1: CompetencyType;
    competency2: CompetencyType;
    correlationCoefficient: number;
    significance: number;
    directionality: 'bidirectional' | 'unidirectional' | 'independent';
  }[];
  clusterAnalysis: {
    clusterId: string;
    competencies: CompetencyType[];
    clusterStrength: number;
    dominantPattern: string;
    developmentStrategy: string;
  }[];
  competencyProfileType: {
    profileName: string;
    characteristics: string[];
    typicalProgressionPath: string[];
    commonChallenges: string[];
    recommendedApproaches: string[];
  };
  benchmarkComparisons: {
    competency: CompetencyType;
    personalLevel: CCISLevel;
    peerAverage: CCISLevel;
    industryBenchmark: CCISLevel;
    percentileRanking: number;
    competitiveAdvantage: boolean;
  }[];
}

/**
 * Evidence quality analysis
 */
export interface EvidenceQualityAnalysis {
  personId: PersonID;
  overallQuality: {
    averageQualityScore: number;
    evidenceCompleteness: number;
    validationStrength: number;
    temporalConsistency: number;
  };
  competencyBreakdown: {
    competency: CompetencyType;
    evidenceCount: number;
    qualityDistribution: {
      high: number;
      medium: number;
      low: number;
    };
    evidenceTypes: {
      type: string;
      count: number;
      averageQuality: number;
    }[];
    gapsIdentified: string[];
    strengthAreas: string[];
  }[];
  validationMetrics: {
    crossValidatedEvidence: number;
    selfReportedEvidence: number;
    observationalEvidence: number;
    performanceBasedEvidence: number;
    validationReliability: number;
  };
  recommendations: {
    evidenceGaps: {
      competency: CompetencyType;
      missingEvidenceTypes: string[];
      collectionStrategy: string;
      priority: 'high' | 'medium' | 'low';
    }[];
    qualityImprovements: {
      area: string;
      improvementActions: string[];
      expectedImpact: number;
    }[];
  };
}

/**
 * Competency benchmarking data
 */
export interface CompetencyBenchmarkData {
  benchmarkType: 'peer' | 'industry' | 'academic' | 'global';
  referencePopulation: {
    size: number;
    demographics: Record<string, any>;
    timeRange: { startDate: Date; endDate: Date };
  };
  competencyBenchmarks: {
    competency: CompetencyType;
    distributionData: {
      percentile25: CCISLevel;
      percentile50: CCISLevel;
      percentile75: CCISLevel;
      percentile90: CCISLevel;
      mean: number;
      standardDeviation: number;
    };
    progressionRates: {
      averageTimeToLevel2: number; // days
      averageTimeToLevel3: number;
      averageTimeToLevel4: number;
      typicalPlateauDuration: number;
    };
    culturalVariations: {
      context: string;
      adjustmentFactor: number;
      specificConsiderations: string[];
    }[];
  }[];
  contextualFactors: {
    educationalBackground: Record<string, number>;
    experienceLevel: Record<string, number>;
    culturalContext: Record<string, number>;
    assessmentMethod: Record<string, number>;
  };
}

/**
 * Competency Assessment Repository Interface
 *
 * Provides comprehensive data access patterns for CompetencyAssessment entities
 * with focus on progression tracking, analytics, and evidence management.
 */
export interface CompetencyAssessmentRepositoryInterface {
  /**
   * Basic CRUD Operations
   */

  /**
   * Save competency assessment
   * Handles versioning and audit trail for progression tracking
   */
  save(assessment: CompetencyAssessment): Promise<void>;

  /**
   * Find assessment by unique identifier
   */
  findById(assessmentId: string): Promise<CompetencyAssessment | null>;

  /**
   * Delete assessment (soft delete with audit preservation)
   */
  delete(assessmentId: string): Promise<void>;

  /**
   * Check if assessment exists
   */
  exists(assessmentId: string): Promise<boolean>;

  /**
   * Query Operations
   */

  /**
   * Find assessments for a specific person
   * Returns comprehensive competency profile
   */
  findByPersonId(
    personId: PersonID,
    options?: {
      competencyFilter?: CompetencyType[];
      includeHistory?: boolean;
      sortBy?: 'competency' | 'level' | 'confidence' | 'lastUpdated';
      sortOrder?: 'ASC' | 'DESC';
    },
  ): Promise<CompetencyAssessment[]>;

  /**
   * Find current assessment for person and competency
   * Returns the most recent assessment for specific competency
   */
  findCurrentByPersonAndCompetency(
    personId: PersonID,
    competencyType: CompetencyType,
  ): Promise<CompetencyAssessment | null>;

  /**
   * Find assessments by session
   * All competency assessments within a specific assessment session
   */
  findBySessionId(
    sessionId: string,
    options?: {
      includeProgression?: boolean;
      competencyFilter?: CompetencyType[];
    },
  ): Promise<CompetencyAssessment[]>;

  /**
   * Find assessments by competency type
   * Cross-person analysis for specific competency
   */
  findByCompetencyType(
    competencyType: CompetencyType,
    options?: {
      limit?: number;
      offset?: number;
      levelFilter?: CCISLevel[];
      confidenceThreshold?: ConfidenceScore;
      dateRange?: { startDate: Date; endDate: Date };
    },
  ): Promise<CompetencyAssessment[]>;

  /**
   * Advanced search with multiple criteria
   */
  search(
    criteria: CompetencyAssessmentSearchCriteria,
  ): Promise<CompetencyAssessment[]>;

  /**
   * Count assessments matching criteria
   */
  count(criteria?: CompetencyAssessmentSearchCriteria): Promise<number>;

  /**
   * Progression Analytics
   */

  /**
   * Get comprehensive progression analytics for person
   * Complete competency development analysis
   */
  getProgressionAnalytics(
    personId: PersonID,
    options?: {
      timeRange?: { startDate: Date; endDate: Date };
      competencyFilter?: CompetencyType[];
      includePredictions?: boolean;
      includeRecommendations?: boolean;
      culturalContext?: string;
    },
  ): Promise<CompetencyProgressionAnalytics>;

  /**
   * Get historical progression for specific competency
   * Detailed progression timeline and trends
   */
  getCompetencyProgression(
    personId: PersonID,
    competencyType: CompetencyType,
    options?: {
      timeRange?: { startDate: Date; endDate: Date };
      includeEvidence?: boolean;
      includeContextualFactors?: boolean;
    },
  ): Promise<{
    competency: CompetencyType;
    progressionTimeline: {
      date: Date;
      level: CCISLevel;
      confidence: ConfidenceScore;
      sessionId: string;
      evidenceQuality: number;
      contextualFactors: Record<string, any>;
    }[];
    progressionMetrics: {
      totalProgression: number;
      progressionRate: number; // levels per month
      confidenceGrowth: number;
      stabilityPeriods: { start: Date; end: Date; reason: string }[];
      accelerationPoints: { date: Date; trigger: string; impact: number }[];
    };
    insights: {
      learningPattern: string;
      keySuccessFactors: string[];
      challengeAreas: string[];
      optimizationOpportunities: string[];
    };
  }>;

  /**
   * Analyze competency correlations
   * Cross-competency relationship analysis
   */
  getCompetencyCorrelations(
    personId: PersonID,
    options?: {
      timeRange?: { startDate: Date; endDate: Date };
      includeClusterAnalysis?: boolean;
      includeBenchmarking?: boolean;
      minCorrelationThreshold?: number;
    },
  ): Promise<CompetencyCorrelationAnalysis>;

  /**
   * Evidence Management
   */

  /**
   * Get evidence quality analysis
   * Comprehensive evidence validation and quality assessment
   */
  getEvidenceQualityAnalysis(
    personId: PersonID,
    options?: {
      competencyFilter?: CompetencyType[];
      timeRange?: { startDate: Date; endDate: Date };
      includeRecommendations?: boolean;
    },
  ): Promise<EvidenceQualityAnalysis>;

  /**
   * Validate assessment evidence
   * Cross-validation and evidence verification
   */
  validateEvidence(
    assessmentId: string,
    validationCriteria?: {
      requireCrossValidation?: boolean;
      minEvidenceQuality?: number;
      temporalConsistencyCheck?: boolean;
      culturalContextValidation?: boolean;
    },
  ): Promise<{
    isValid: boolean;
    validationScore: number;
    validationDetails: {
      criterion: string;
      passed: boolean;
      score: number;
      issues: string[];
    }[];
    recommendations: string[];
  }>;

  /**
   * Benchmarking and Comparison
   */

  /**
   * Get competency benchmarks
   * Industry and peer comparison data
   */
  getCompetencyBenchmarks(
    benchmarkType: 'peer' | 'industry' | 'academic' | 'global',
    options?: {
      competencyFilter?: CompetencyType[];
      demographicFilters?: Record<string, any>;
      culturalContext?: string;
      timeRange?: { startDate: Date; endDate: Date };
    },
  ): Promise<CompetencyBenchmarkData>;

  /**
   * Compare person against benchmarks
   * Detailed benchmarking analysis for individual
   */
  compareAgainstBenchmarks(
    personId: PersonID,
    benchmarkType: 'peer' | 'industry' | 'academic' | 'global',
    options?: {
      competencyFilter?: CompetencyType[];
      includeGapAnalysis?: boolean;
      includeRecommendations?: boolean;
    },
  ): Promise<{
    overallRanking: {
      percentile: number;
      relativeProficiency:
        | 'below_average'
        | 'average'
        | 'above_average'
        | 'exceptional';
      strengthAreas: CompetencyType[];
      improvementAreas: CompetencyType[];
    };
    competencyComparisons: {
      competency: CompetencyType;
      personalLevel: CCISLevel;
      benchmarkLevel: CCISLevel;
      percentileRanking: number;
      gapAnalysis: {
        levelGap: number;
        timeToClose: number; // estimated days
        strategies: string[];
      };
    }[];
    recommendations: {
      priorityCompetencies: CompetencyType[];
      developmentStrategies: string[];
      timelineEstimates: Record<string, number>;
    };
  }>;

  /**
   * Reporting and Analytics
   */

  /**
   * Get competency portfolio summary
   * High-level overview for dashboards and reports
   */
  getCompetencyPortfolio(
    personId: PersonID,
    options?: {
      includeProjections?: boolean;
      includeMarketRelevance?: boolean;
      includeCareerAlignment?: boolean;
    },
  ): Promise<{
    profileOverview: {
      totalCompetencies: number;
      advancedCompetencies: number;
      emergingStrengths: CompetencyType[];
      developmentAreas: CompetencyType[];
      uniqueStrengths: string[];
    };
    marketRelevance: {
      demandedCompetencies: CompetencyType[];
      competitiveAdvantages: CompetencyType[];
      skillGaps: CompetencyType[];
      marketAlignment: number;
    };
    careerAlignment: {
      bestFitRoles: string[];
      developpmentPathways: string[];
      complementarySkills: string[];
    };
    projections: {
      sixMonthTargets: { competency: CompetencyType; targetLevel: CCISLevel }[];
      oneYearVision: string;
      lifelearningPath: string[];
    };
  }>;

  /**
   * Generate competency reports
   * Formatted reports for various stakeholders
   */
  generateCompetencyReport(
    personId: PersonID,
    reportType: 'individual' | 'employer' | 'academic' | 'certification',
    options?: {
      competencyFilter?: CompetencyType[];
      timeRange?: { startDate: Date; endDate: Date };
      includeEvidence?: boolean;
      includeBenchmarking?: boolean;
      format?: 'json' | 'pdf' | 'html';
      anonymize?: boolean;
    },
  ): Promise<{
    reportId: string;
    generatedAt: Date;
    reportData: any;
    downloadUrl?: string;
    validUntil?: Date;
  }>;

  /**
   * Performance Optimization
   */

  /**
   * Batch operations for performance
   */
  saveMany(assessments: CompetencyAssessment[]): Promise<void>;

  /**
   * Precomputed analytics cache
   */
  refreshAnalyticsCache(personId?: PersonID): Promise<void>;

  /**
   * Database optimization
   */
  optimizeQueries(): Promise<void>;

  /**
   * Data Export and Integration
   */

  /**
   * Export competency data
   * Support for external system integration
   */
  exportCompetencyData(
    criteria: CompetencyAssessmentSearchCriteria,
    options: {
      format: 'json' | 'csv' | 'xml';
      includeEvidence?: boolean;
      includeProgression?: boolean;
      anonymize?: boolean;
    },
  ): Promise<Buffer>;

  /**
   * Import competency data
   * Support for data migration and integration
   */
  importCompetencyData(
    data: any[],
    options: {
      format: 'json' | 'csv' | 'xml';
      validateData?: boolean;
      updateExisting?: boolean;
      preserveHistory?: boolean;
    },
  ): Promise<{
    imported: number;
    updated: number;
    failed: number;
    errors: string[];
  }>;
}
