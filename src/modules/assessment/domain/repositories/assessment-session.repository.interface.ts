/**
 * Assessment Session Repository Interface
 *
 * Defines the contract for persisting and retrieving AssessmentSession aggregates.
 * This interface provides comprehensive data access patterns for the CCIS assessment
 * workflow, including session lifecycle management, behavioral data persistence,
 * and analytics query support.
 *
 * Key Features:
 * - Session lifecycle management (create, update, complete)
 * - Behavioral signal persistence and retrieval
 * - Real-time assessment progress tracking
 * - Analytics and reporting queries
 * - Concurrent session handling
 * - Cultural and accessibility context preservation
 *
 * Design Principles:
 * - Domain-driven repository pattern
 * - Aggregate persistence boundaries
 * - Query optimization for analytics
 * - Event sourcing compatibility
 * - Multi-tenant data isolation
 *
 * @example
 * ```typescript
 * const repository = new AssessmentSessionRepository();
 *
 * // Create new session
 * const session = AssessmentSession.create(...);
 * await repository.save(session);
 *
 * // Find active sessions
 * const activeSessions = await repository.findActiveByPersonId(personId);
 *
 * // Get analytics data
 * const analytics = await repository.getSessionAnalytics(criteria);
 * ```
 */

import { AssessmentSession } from '../entities/assessment-session.entity';
import { PersonID } from '../../../../shared/value-objects/id.value-object';
import { CompetencyType } from '../value-objects/competency-type.value-object';
import { CCISLevel } from '../value-objects/ccis-level.value-object';

/**
 * Session search and filtering criteria
 */
export interface SessionSearchCriteria {
  personId?: PersonID;
  competencyTypes?: CompetencyType[];
  sessionStatus?: SessionStatus[];
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  culturalContext?: string[];
  assessmentPurpose?: string[];
  minDuration?: number;
  maxDuration?: number;
  hasCompletedTasks?: boolean;
  minCCISLevel?: CCISLevel;
  maxCCISLevel?: CCISLevel;
}

/**
 * Session analytics aggregation options
 */
export interface SessionAnalytics {
  totalSessions: number;
  completedSessions: number;
  averageDuration: number;
  averageCCISLevel: number;
  competencyDistribution: {
    competency: CompetencyType;
    sessionCount: number;
    averageLevel: number;
    completionRate: number;
  }[];
  culturalContextBreakdown: {
    context: string;
    sessionCount: number;
    successRate: number;
  }[];
  timeBasedMetrics: {
    sessionsPerDay: { date: Date; count: number }[];
    peakUsageHours: number[];
    averageSessionsPerPerson: number;
  };
  qualityMetrics: {
    averageDataQuality: number;
    gamingDetectionRate: number;
    interventionTriggerRate: number;
    adaptationSuccessRate: number;
  };
}

/**
 * Session status enumeration
 */
export enum SessionStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  TERMINATED = 'TERMINATED',
  CANCELLED = 'CANCELLED',
}

/**
 * Repository performance configuration
 */
export interface RepositoryConfig {
  cacheEnabled: boolean;
  cacheTTL: number;
  batchSize: number;
  queryTimeout: number;
  enableOptimisticLocking: boolean;
  auditEnabled: boolean;
}

/**
 * Assessment Session Repository Interface
 *
 * Provides comprehensive data access patterns for AssessmentSession entities
 * with support for complex queries, analytics, and performance optimization.
 */
export interface AssessmentSessionRepositoryInterface {
  /**
   * Basic CRUD Operations
   */

  /**
   * Save assessment session (create or update)
   * Handles aggregate persistence with proper transaction boundaries
   */
  save(session: AssessmentSession): Promise<void>;

  /**
   * Find session by unique identifier
   * Returns null if session not found
   */
  findById(sessionId: string): Promise<AssessmentSession | null>;

  /**
   * Delete session by identifier
   * Performs soft delete with audit trail
   */
  delete(sessionId: string): Promise<void>;

  /**
   * Check if session exists
   * Optimized existence check without full entity loading
   */
  exists(sessionId: string): Promise<boolean>;

  /**
   * Query Operations
   */

  /**
   * Find all sessions for a specific person
   * Supports pagination and filtering
   */
  findByPersonId(
    personId: PersonID,
    options?: {
      limit?: number;
      offset?: number;
      includeCompleted?: boolean;
      sortBy?: 'startTime' | 'endTime' | 'duration';
      sortOrder?: 'ASC' | 'DESC';
    },
  ): Promise<AssessmentSession[]>;

  /**
   * Find active sessions (in progress or paused)
   * Critical for preventing concurrent assessment conflicts
   */
  findActiveByPersonId(personId: PersonID): Promise<AssessmentSession[]>;

  /**
   * Find sessions by competency type
   * Useful for competency-specific analytics and reporting
   */
  findByCompetencyType(
    competencyType: CompetencyType,
    options?: {
      limit?: number;
      offset?: number;
      dateRange?: { startDate: Date; endDate: Date };
    },
  ): Promise<AssessmentSession[]>;

  /**
   * Advanced search with multiple criteria
   * Supports complex filtering and analytics queries
   */
  search(criteria: SessionSearchCriteria): Promise<AssessmentSession[]>;

  /**
   * Count sessions matching criteria
   * Optimized for pagination and analytics
   */
  count(criteria?: SessionSearchCriteria): Promise<number>;

  /**
   * Analytics and Reporting
   */

  /**
   * Get comprehensive session analytics
   * Provides aggregated metrics for dashboards and insights
   */
  getSessionAnalytics(
    criteria?: SessionSearchCriteria,
    options?: {
      includeTrends?: boolean;
      includeComparisons?: boolean;
      granularity?: 'day' | 'week' | 'month';
    },
  ): Promise<SessionAnalytics>;

  /**
   * Get person-specific progress metrics
   * Tracks individual learning journey and CCIS progression
   */
  getPersonProgress(
    personId: PersonID,
    options?: {
      timeRange?: { startDate: Date; endDate: Date };
      competencyFilter?: CompetencyType[];
      includeProjections?: boolean;
    },
  ): Promise<{
    totalSessions: number;
    completedSessions: number;
    averageCCISProgression: number;
    competencyLevels: { competency: CompetencyType; currentLevel: CCISLevel }[];
    learningVelocity: number;
    nextRecommendations: string[];
  }>;

  /**
   * Get cultural context insights
   * Analyzes assessment effectiveness across different cultural contexts
   */
  getCulturalAnalytics(options?: {
    culturalContexts?: string[];
    competencyFilter?: CompetencyType[];
    dateRange?: { startDate: Date; endDate: Date };
  }): Promise<{
    contextPerformance: {
      context: string;
      averageSuccess: number;
      commonChallenges: string[];
      adaptationEffectiveness: number;
    }[];
    recommendations: {
      context: string;
      suggestedAdaptations: string[];
      priorityLevel: 'high' | 'medium' | 'low';
    }[];
  }>;

  /**
   * Performance and Optimization
   */

  /**
   * Batch operations for improved performance
   * Useful for data migrations and bulk updates
   */
  saveMany(sessions: AssessmentSession[]): Promise<void>;

  /**
   * Preload related data for performance optimization
   * Eager loading of task interactions and competency assessments
   */
  findWithRelations(
    sessionId: string,
    relations?: {
      includeTaskInteractions?: boolean;
      includeCompetencyAssessments?: boolean;
      includeBehavioralData?: boolean;
    },
  ): Promise<AssessmentSession | null>;

  /**
   * Cache management for frequently accessed data
   */
  refreshCache(sessionId?: string): Promise<void>;

  /**
   * Database maintenance and optimization
   */
  optimizeQueries(): Promise<void>;

  /**
   * Specialized Queries
   */

  /**
   * Find sessions requiring intervention
   * Identifies sessions with quality issues or gaming patterns
   */
  findRequiringIntervention(criteria?: {
    gamingRiskThreshold?: number;
    qualityThreshold?: number;
    maxAge?: number; // hours
  }): Promise<AssessmentSession[]>;

  /**
   * Find sessions for adaptive recalibration
   * Identifies sessions that need scaffolding adjustments
   */
  findForAdaptiveRecalibration(criteria?: {
    culturalContext?: string;
    competencyType?: CompetencyType;
    performanceThreshold?: number;
  }): Promise<AssessmentSession[]>;

  /**
   * Get session clusters for machine learning
   * Groups similar sessions for pattern analysis and model training
   */
  getSessionClusters(options?: {
    clusteringCriteria?: ('competency' | 'cultural' | 'performance')[];
    minClusterSize?: number;
    maxClusters?: number;
  }): Promise<
    {
      clusterId: string;
      sessions: AssessmentSession[];
      characteristics: Record<string, any>;
      insights: string[];
    }[]
  >;

  /**
   * Real-time Operations
   */

  /**
   * Subscribe to session changes
   * Real-time updates for active assessment monitoring
   */
  subscribeToChanges(
    sessionId: string,
    callback: (session: AssessmentSession) => void,
  ): Promise<() => void>; // Returns unsubscribe function

  /**
   * Get live session metrics
   * Real-time dashboard data for active sessions
   */
  getLiveMetrics(): Promise<{
    activeSessions: number;
    sessionsInLastHour: number;
    averageActiveSessionDuration: number;
    currentSystemLoad: number;
    alertsRequiringAttention: number;
  }>;

  /**
   * Data Export and Integration
   */

  /**
   * Export session data for external analysis
   * Supports various formats and privacy controls
   */
  exportData(
    criteria: SessionSearchCriteria,
    options: {
      format: 'json' | 'csv' | 'excel';
      includePersonalData?: boolean;
      anonymize?: boolean;
      fields?: string[];
    },
  ): Promise<Buffer>;

  /**
   * Import session data from external sources
   * Supports data migration and integration scenarios
   */
  importData(
    data: any[],
    options: {
      format: 'json' | 'csv';
      validateData?: boolean;
      createMissingSessions?: boolean;
      updateExisting?: boolean;
    },
  ): Promise<{
    imported: number;
    failed: number;
    errors: string[];
  }>;
}
