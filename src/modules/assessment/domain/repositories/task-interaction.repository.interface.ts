/**
 * Task Interaction Repository Interface
 *
 * Defines the contract for persisting and retrieving TaskInteraction entities.
 * This interface handles the storage and retrieval of behavioral interaction data,
 * quality metrics, and real-time assessment signals that form the foundation
 * of the CCIS measurement system.
 *
 * Key Features:
 * - Real-time behavioral data persistence
 * - Gaming detection signal storage
 * - Quality metrics tracking
 * - Temporal interaction patterns
 * - Contextual factor preservation
 * - Performance optimization for high-volume data
 *
 * Design Principles:
 * - High-performance data ingestion
 * - Time-series data optimization
 * - Real-time analytics support
 * - Data compression and archival
 * - Privacy and data retention compliance
 *
 * @example
 * ```typescript
 * const repository = new TaskInteractionRepository();
 *
 * // Store interaction data
 * const interaction = TaskInteraction.create(...);
 * await repository.save(interaction);
 *
 * // Get behavioral patterns
 * const patterns = await repository.getBehavioralPatterns(sessionId);
 *
 * // Analyze gaming indicators
 * const gaming = await repository.detectGamingPatterns(personId);
 * ```
 */

import { TaskInteraction } from '../entities/task-interaction.entity';
import { PersonID } from '../../../../shared/value-objects/id.value-object';
import { CompetencyType } from '../value-objects/competency-type.value-object';
import { BehavioralSignals } from '../value-objects/behavioral-signals.value-object';

/**
 * Interaction search and filtering criteria
 */
export interface InteractionSearchCriteria {
  personId?: PersonID;
  sessionId?: string;
  taskId?: string;
  competencyType?: CompetencyType;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  qualityRange?: {
    minQuality: number;
    maxQuality: number;
  };
  durationRange?: {
    minDuration: number;
    maxDuration: number;
  };
  hasGamingIndicators?: boolean;
  contextualFactors?: Record<string, any>;
  minConfidenceScore?: number;
}

/**
 * Behavioral pattern analysis result
 */
export interface BehavioralPatternAnalysis {
  sessionId: string;
  personId: PersonID;
  overallPattern: {
    consistencyScore: number;
    engagementLevel: 'low' | 'medium' | 'high';
    learningStyle: string;
    problemSolvingApproach: string;
  };
  temporalPatterns: {
    peakPerformanceHours: number[];
    attentionSpanTrend: 'improving' | 'stable' | 'declining';
    speedAccuracyTradeoff: number;
    restBreakPatterns: number[];
  };
  qualityMetrics: {
    averageQuality: number;
    qualityTrend: 'improving' | 'stable' | 'declining';
    consistencyIndex: number;
    outlierCount: number;
  };
  competencySpecificPatterns: {
    competency: CompetencyType;
    strengthIndicators: string[];
    improvementAreas: string[];
    confidenceProgression: number[];
  }[];
  contextualInfluences: {
    culturalFactors: Record<string, number>;
    environmentalFactors: Record<string, number>;
    accessibilityImpacts: Record<string, number>;
  };
  recommendations: {
    immediateActions: string[];
    longTermStrategies: string[];
    riskMitigations: string[];
  };
}

/**
 * Gaming detection analysis result
 */
export interface GamingDetectionAnalysis {
  personId: PersonID;
  riskScore: number;
  detectedPatterns: {
    patternType: string;
    confidence: number;
    frequency: number;
    impact: 'low' | 'medium' | 'high';
    description: string;
  }[];
  timelineAnalysis: {
    suspiciousInteractions: {
      interactionId: string;
      timestamp: Date;
      suspicionReasons: string[];
      severity: number;
    }[];
    gamingEvolution: {
      date: Date;
      riskScore: number;
      patterns: string[];
    }[];
  };
  behavioralAnomalies: {
    speedAnomalies: number;
    accuracyAnomalies: number;
    patternAnomalies: number;
    contextualAnomalies: number;
  };
  interventionRecommendations: {
    immediateActions: string[];
    monitoringStrategy: string;
    adaptationAdjustments: string[];
    escalationThreshold: number;
  };
  confidenceMetrics: {
    dataQuality: number;
    sampleSize: number;
    temporalCoverage: number;
    crossValidationScore: number;
  };
}

/**
 * Quality metrics aggregation
 */
export interface QualityMetricsAggregation {
  overallQuality: {
    average: number;
    median: number;
    standardDeviation: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  dataCompleteness: {
    requiredFieldsPresent: number;
    optionalFieldsPresent: number;
    missingDataPercentage: number;
  };
  behavioralConsistency: {
    withinSessionConsistency: number;
    crossSessionConsistency: number;
    temporalStability: number;
  };
  contextualRelevance: {
    culturalAlignment: number;
    taskAppropriatenesss: number;
    difficultyAlignment: number;
  };
  technicalQuality: {
    responseTimeVariability: number;
    interactionCompleteness: number;
    errorRate: number;
  };
}

/**
 * Task Interaction Repository Interface
 *
 * Provides comprehensive data access patterns for TaskInteraction entities
 * with emphasis on behavioral analytics, gaming detection, and real-time processing.
 */
export interface TaskInteractionRepositoryInterface {
  /**
   * Basic CRUD Operations
   */

  /**
   * Save task interaction
   * Optimized for high-volume, real-time data ingestion
   */
  save(interaction: TaskInteraction): Promise<void>;

  /**
   * Find interaction by unique identifier
   */
  findById(interactionId: string): Promise<TaskInteraction | null>;

  /**
   * Delete interaction (soft delete with retention policy)
   */
  delete(interactionId: string): Promise<void>;

  /**
   * Check if interaction exists
   */
  exists(interactionId: string): Promise<boolean>;

  /**
   * Query Operations
   */

  /**
   * Find all interactions for a specific session
   * Ordered chronologically for behavioral analysis
   */
  findBySessionId(
    sessionId: string,
    options?: {
      limit?: number;
      offset?: number;
      includeDeleted?: boolean;
      sortOrder?: 'ASC' | 'DESC';
    },
  ): Promise<TaskInteraction[]>;

  /**
   * Find interactions by person across all sessions
   * Critical for cross-session behavioral analysis
   */
  findByPersonId(
    personId: PersonID,
    options?: {
      limit?: number;
      offset?: number;
      dateRange?: { startDate: Date; endDate: Date };
      competencyFilter?: CompetencyType[];
      includeQualityThreshold?: number;
    },
  ): Promise<TaskInteraction[]>;

  /**
   * Find interactions by task type
   * Useful for task-specific analytics and calibration
   */
  findByTaskId(
    taskId: string,
    options?: {
      limit?: number;
      offset?: number;
      personFilter?: PersonID[];
      qualityThreshold?: number;
    },
  ): Promise<TaskInteraction[]>;

  /**
   * Find interactions by competency type
   * Essential for competency-specific behavioral analysis
   */
  findByCompetencyType(
    competencyType: CompetencyType,
    options?: {
      limit?: number;
      offset?: number;
      dateRange?: { startDate: Date; endDate: Date };
      qualityFilter?: { min: number; max: number };
    },
  ): Promise<TaskInteraction[]>;

  /**
   * Advanced search with multiple criteria
   */
  search(criteria: InteractionSearchCriteria): Promise<TaskInteraction[]>;

  /**
   * Count interactions matching criteria
   */
  count(criteria?: InteractionSearchCriteria): Promise<number>;

  /**
   * Behavioral Analytics
   */

  /**
   * Analyze behavioral patterns for a session
   * Comprehensive pattern recognition and analysis
   */
  getBehavioralPatterns(
    sessionId: string,
    options?: {
      includeTemporalAnalysis?: boolean;
      includeQualityMetrics?: boolean;
      includeContextualFactors?: boolean;
      analysisDepth?: 'basic' | 'detailed' | 'comprehensive';
    },
  ): Promise<BehavioralPatternAnalysis>;

  /**
   * Analyze behavioral patterns for a person
   * Cross-session behavioral analysis and progression tracking
   */
  getPersonBehavioralPatterns(
    personId: PersonID,
    options?: {
      timeRange?: { startDate: Date; endDate: Date };
      competencyFilter?: CompetencyType[];
      includeProgressionAnalysis?: boolean;
      includeCulturalContext?: boolean;
    },
  ): Promise<BehavioralPatternAnalysis>;

  /**
   * Detect gaming patterns
   * Advanced gaming detection algorithms and analysis
   */
  detectGamingPatterns(
    personId: PersonID,
    options?: {
      timeWindow?: number; // hours
      sensitivityLevel?: 'low' | 'medium' | 'high';
      includeHistoricalData?: boolean;
      crossReferenceOtherUsers?: boolean;
    },
  ): Promise<GamingDetectionAnalysis>;

  /**
   * Get quality metrics aggregation
   * Comprehensive data quality analysis
   */
  getQualityMetrics(
    criteria: InteractionSearchCriteria,
    options?: {
      granularity?: 'interaction' | 'session' | 'person' | 'global';
      includeCompetencyBreakdown?: boolean;
      includeTemporalTrends?: boolean;
    },
  ): Promise<QualityMetricsAggregation>;

  /**
   * Real-time Operations
   */

  /**
   * Batch save for high-volume ingestion
   * Optimized for real-time data streaming
   */
  saveMany(interactions: TaskInteraction[]): Promise<void>;

  /**
   * Get real-time interaction stream
   * Live data for monitoring and immediate intervention
   */
  getActiveInteractionStream(
    sessionId: string,
    callback: (interaction: TaskInteraction) => void,
  ): Promise<() => void>; // Returns unsubscribe function

  /**
   * Get live quality metrics
   * Real-time data quality monitoring
   */
  getLiveQualityMetrics(sessionId?: string): Promise<{
    averageQuality: number;
    dataIngestionRate: number;
    anomalyDetectionRate: number;
    gamingRiskLevel: 'low' | 'medium' | 'high';
    lastUpdateTime: Date;
  }>;

  /**
   * Performance Optimization
   */

  /**
   * Preload interactions with related data
   * Performance optimization for complex queries
   */
  findWithBehavioralData(
    interactionId: string,
    options?: {
      includeBehavioralSignals?: boolean;
      includeQualityMetrics?: boolean;
      includeContextualFactors?: boolean;
    },
  ): Promise<TaskInteraction | null>;

  /**
   * Aggregate interactions for analytics
   * Pre-computed aggregations for dashboard performance
   */
  getInteractionAggregations(
    criteria: InteractionSearchCriteria,
    aggregations: {
      groupBy?: ('competency' | 'session' | 'person' | 'date')[];
      metrics?: ('count' | 'average_quality' | 'duration' | 'gaming_risk')[];
      timeGranularity?: 'hour' | 'day' | 'week' | 'month';
    },
  ): Promise<Record<string, any>[]>;

  /**
   * Data Management
   */

  /**
   * Archive old interactions
   * Data lifecycle management with retention policies
   */
  archiveOldInteractions(
    olderThan: Date,
    options?: {
      preserveHighQuality?: boolean;
      preserveAnomalies?: boolean;
      compressionLevel?: 'none' | 'standard' | 'maximum';
    },
  ): Promise<{
    archivedCount: number;
    preservedCount: number;
    spaceSaved: number; // bytes
  }>;

  /**
   * Clean up low-quality data
   * Data quality maintenance and optimization
   */
  cleanupLowQualityData(
    qualityThreshold: number,
    options?: {
      dryRun?: boolean;
      preserveAnomalies?: boolean;
      maxDeletions?: number;
    },
  ): Promise<{
    candidatesForDeletion: number;
    actuallyDeleted: number;
    preservedAnomalies: number;
  }>;

  /**
   * Specialized Analytics
   */

  /**
   * Get temporal interaction patterns
   * Time-based behavioral analysis
   */
  getTemporalPatterns(
    personId: PersonID,
    timeRange: { startDate: Date; endDate: Date },
    options?: {
      granularity?: 'hour' | 'day' | 'week';
      includeSeasonality?: boolean;
      includeAnomalies?: boolean;
    },
  ): Promise<{
    patterns: {
      timeSlot: string;
      interactionCount: number;
      averageQuality: number;
      behavioralConsistency: number;
    }[];
    insights: {
      peakPerformanceTimes: string[];
      consistencyIndicators: string[];
      recommendations: string[];
    };
  }>;

  /**
   * Get competency progression indicators
   * Behavioral signals for CCIS level advancement
   */
  getCompetencyProgressionIndicators(
    personId: PersonID,
    competencyType: CompetencyType,
    options?: {
      timeWindow?: number; // days
      includeConfidenceMetrics?: boolean;
      includeLearningVelocity?: boolean;
    },
  ): Promise<{
    progressionSignals: {
      signal: string;
      strength: number;
      confidence: number;
      trend: 'improving' | 'stable' | 'declining';
    }[];
    overallProgression: {
      likelihood: number;
      timeToAdvancement: number; // days
      requiredImprovement: string[];
    };
  }>;

  /**
   * Get cultural adaptation insights
   * Cultural context effectiveness analysis
   */
  getCulturalAdaptationInsights(
    culturalContext: string,
    options?: {
      competencyFilter?: CompetencyType[];
      timeRange?: { startDate: Date; endDate: Date };
      includeComparisons?: boolean;
    },
  ): Promise<{
    adaptationEffectiveness: {
      competency: CompetencyType;
      effectivenessScore: number;
      improvementAreas: string[];
    }[];
    crossCulturalComparisons: {
      metric: string;
      currentContext: number;
      averageOtherContexts: number;
      relativeLearning: number;
    }[];
    recommendations: {
      adaptationAdjustments: string[];
      priorityLevel: 'high' | 'medium' | 'low';
    }[];
  }>;
}
