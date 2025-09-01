import { DomainEvent } from '../../../../shared/base/domain-event.base';
import { PersonID } from '../../../../shared/value-objects/id.value-object';
import { CompetencyType } from '../value-objects/competency-type.value-object';
import { CCISLevel } from '../value-objects/ccis-level.value-object';
import { ConfidenceScore } from '../value-objects/confidence-score.value-object';

/**
 * Domain Event: Assessment Completed
 *
 * Triggered when a student completes a full assessment session.
 * This event captures comprehensive assessment results and performance
 * metrics that drive the entire CCIS competency progression system.
 *
 * Key Implications:
 * - Skill passport updates across multiple competencies
 * - Learning path recommendations and adjustments
 * - Scaffolding and intervention planning
 * - Performance analytics and benchmarking
 * - Placement eligibility calculations
 * - AI agent orchestration for next steps
 *
 * @example
 * ```typescript
 * const event = new AssessmentCompletedEvent({
 *   personId: PersonID.create('123e4567-e89b-12d3-a456-426614174000'),
 *   sessionId: 'session-abc123',
 *   competencyResults: [
 *     {
 *       competencyType: CompetencyType.COMMUNICATION,
 *       achievedLevel: CCISLevel.fromLevel(3),
 *       confidence: ConfidenceScore.create(87)
 *     }
 *   ],
 *   overallPerformance: {
 *     totalTasksCompleted: 25,
 *     averageAccuracy: 0.84,
 *     sessionDuration: 3600000
 *   }
 * });
 * ```
 */
export class AssessmentCompletedEvent extends DomainEvent {
  /**
   * The person who completed the assessment
   */
  public readonly personId: PersonID;

  /**
   * Unique identifier for the assessment session
   */
  public readonly sessionId: string;

  /**
   * Assessment results for each competency evaluated
   */
  public readonly competencyResults: Array<{
    /**
     * The competency that was assessed
     */
    competencyType: CompetencyType;

    /**
     * The CCIS level achieved for this competency
     */
    achievedLevel: CCISLevel;

    /**
     * Statistical confidence in the level assessment
     */
    confidence: ConfidenceScore;

    /**
     * Number of tasks completed for this competency
     */
    tasksCompleted: number;

    /**
     * Performance metrics specific to this competency
     */
    performance: {
      accuracy: number; // 0-1
      averageTimePerTask: number; // milliseconds
      struggledAreas: string[];
      strengths: string[];
      improvementSuggestions: string[];
    };

    /**
     * Whether this represents a level advancement
     */
    isLevelAdvancement: boolean;

    /**
     * Previous level before this assessment (if advancement occurred)
     */
    previousLevel?: CCISLevel;
  }>;

  /**
   * Overall session performance metrics
   */
  public readonly overallPerformance: {
    /**
     * Total number of tasks completed across all competencies
     */
    totalTasksCompleted: number;

    /**
     * Overall accuracy across all tasks (0-1)
     */
    averageAccuracy: number;

    /**
     * Total time spent in the assessment session (milliseconds)
     */
    sessionDuration: number;

    /**
     * Number of hints requested during the session
     */
    hintsRequested: number;

    /**
     * Gaming behaviors detected during the session
     */
    gamingBehaviorsDetected: string[];

    /**
     * Engagement level throughout the session
     */
    engagementLevel: 'low' | 'medium' | 'high';

    /**
     * Technical issues encountered during the session
     */
    technicalIssues: string[];
  };

  /**
   * Assessment context and environmental factors
   */
  public readonly assessmentContext: {
    /**
     * Type of assessment conducted
     */
    assessmentType:
      | 'initial'
      | 'progress'
      | 'final'
      | 'placement'
      | 'diagnostic';

    /**
     * Device and platform used for assessment
     */
    platform: {
      deviceType: 'mobile' | 'tablet' | 'desktop';
      operatingSystem: string;
      browserType?: string;
      networkQuality: 'poor' | 'fair' | 'good' | 'excellent';
    };

    /**
     * Time and location context
     */
    sessionContext: {
      startTime: Date;
      endTime: Date;
      timezone: string;
      location?: {
        country: 'India' | 'UAE' | 'Global';
        state?: string;
        city?: string;
      };
    };

    /**
     * Supervised or unsupervised assessment
     */
    supervisionLevel:
      | 'unsupervised'
      | 'partially-supervised'
      | 'fully-supervised';

    /**
     * Cultural and language adaptations applied
     */
    adaptations: {
      language: string;
      culturalContext: string;
      difficultyAdjustments: string[];
      accessibilityFeatures: string[];
    };
  };

  /**
   * Recommendations generated from this assessment
   */
  public readonly recommendations: {
    /**
     * Immediate next steps for the student
     */
    immediateActions: Array<{
      action: string;
      priority: 'high' | 'medium' | 'low';
      estimatedTimeToComplete: string;
      competencyFocus: CompetencyType;
    }>;

    /**
     * Learning path adjustments recommended
     */
    learningPathUpdates: Array<{
      currentPath: string;
      suggestedPath: string;
      reason: string;
      expectedOutcome: string;
    }>;

    /**
     * Intervention strategies recommended
     */
    interventionStrategies: Array<{
      type: 'scaffolding' | 'remediation' | 'acceleration' | 'motivation';
      competencyFocus: CompetencyType;
      strategy: string;
      urgency: 'immediate' | 'within-week' | 'within-month';
    }>;

    /**
     * Placement readiness assessment
     */
    placementReadiness: {
      overallReadiness:
        | 'not-ready'
        | 'partially-ready'
        | 'ready'
        | 'highly-ready';
      readyForRoles: string[];
      skillGapsToAddress: Array<{
        competency: CompetencyType;
        gap: string;
        suggestedTimeToClose: string;
      }>;
      minimumSalaryEstimate?: {
        currency: 'INR' | 'AED' | 'USD';
        amount: number;
        confidence: number; // 0-1
      };
    };
  };

  /**
   * Data quality and integrity metrics
   */
  public readonly qualityMetrics: {
    /**
     * Overall confidence in the assessment results
     */
    overallConfidence: ConfidenceScore;

    /**
     * Data completeness score (0-1)
     */
    dataCompleteness: number;

    /**
     * Assessment validity indicators
     */
    validityIndicators: {
      consistencyScore: number; // 0-1
      attentionScore: number; // 0-1
      engagementScore: number; // 0-1
      integrityScore: number; // 0-1
    };

    /**
     * Potential concerns or flags
     */
    qualityFlags: string[];

    /**
     * Recommended follow-up assessments
     */
    followUpRecommendations: string[];
  };

  constructor(data: {
    personId: PersonID;
    sessionId: string;
    competencyResults: AssessmentCompletedEvent['competencyResults'];
    overallPerformance: AssessmentCompletedEvent['overallPerformance'];
    assessmentContext: AssessmentCompletedEvent['assessmentContext'];
    recommendations: AssessmentCompletedEvent['recommendations'];
    qualityMetrics: AssessmentCompletedEvent['qualityMetrics'];
    correlationId?: string;
    causationId?: string;
    userId?: string;
  }) {
    super(data.personId, 'Person', {
      correlationId: data.correlationId,
      causationId: data.causationId,
      userId: data.userId,
    });

    // Validate session data
    if (!data.sessionId || data.sessionId.trim().length === 0) {
      throw new Error('Session ID is required for assessment completion');
    }

    // Validate competency results
    if (!data.competencyResults || data.competencyResults.length === 0) {
      throw new Error(
        'At least one competency result is required for assessment completion',
      );
    }

    // Validate overall performance
    if (data.overallPerformance.totalTasksCompleted < 1) {
      throw new Error(
        'At least one task must be completed for assessment completion',
      );
    }

    if (
      data.overallPerformance.averageAccuracy < 0 ||
      data.overallPerformance.averageAccuracy > 1
    ) {
      throw new Error('Average accuracy must be between 0 and 1');
    }

    if (data.overallPerformance.sessionDuration < 1000) {
      throw new Error('Session duration must be at least 1 second (1000ms)');
    }

    // Validate assessment context timing
    if (
      data.assessmentContext.sessionContext.endTime <=
      data.assessmentContext.sessionContext.startTime
    ) {
      throw new Error('Assessment end time must be after start time');
    }

    // Validate quality metrics
    if (
      data.qualityMetrics.dataCompleteness < 0 ||
      data.qualityMetrics.dataCompleteness > 1
    ) {
      throw new Error('Data completeness must be between 0 and 1');
    }

    // Validate each validity indicator
    const validators = data.qualityMetrics.validityIndicators;
    const indicators = [
      'consistencyScore',
      'attentionScore',
      'engagementScore',
      'integrityScore',
    ];

    for (const indicator of indicators) {
      const value = validators[indicator as keyof typeof validators];
      if (value < 0 || value > 1) {
        throw new Error(`${indicator} must be between 0 and 1`);
      }
    }

    // Validate competency results
    for (const result of data.competencyResults) {
      if (result.tasksCompleted < 1) {
        throw new Error(
          `Tasks completed for ${result.competencyType.getName()} must be at least 1`,
        );
      }

      if (result.performance.accuracy < 0 || result.performance.accuracy > 1) {
        throw new Error(
          `Accuracy for ${result.competencyType.getName()} must be between 0 and 1`,
        );
      }

      if (result.isLevelAdvancement && !result.previousLevel) {
        throw new Error(
          `Previous level is required when level advancement is true for ${result.competencyType.getName()}`,
        );
      }
    }

    this.personId = data.personId;
    this.sessionId = data.sessionId;
    this.competencyResults = data.competencyResults;
    this.overallPerformance = data.overallPerformance;
    this.assessmentContext = data.assessmentContext;
    this.recommendations = data.recommendations;
    this.qualityMetrics = data.qualityMetrics;
  }

  /**
   * Get competencies where level advancement occurred
   */
  public getLevelAdvancements(): AssessmentCompletedEvent['competencyResults'] {
    return this.competencyResults.filter((result) => result.isLevelAdvancement);
  }

  /**
   * Get overall assessment quality score
   */
  public getOverallQualityScore(): number {
    const indicators = this.qualityMetrics.validityIndicators;
    const scores = [
      indicators.consistencyScore,
      indicators.attentionScore,
      indicators.engagementScore,
      indicators.integrityScore,
    ];

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  /**
   * Check if assessment results are reliable enough for progression decisions
   */
  public isReliableForProgression(): boolean {
    return (
      this.qualityMetrics.overallConfidence.getScore() >= 75 &&
      this.getOverallQualityScore() >= 0.7 &&
      this.qualityMetrics.dataCompleteness >= 0.8 &&
      this.qualityMetrics.qualityFlags.length === 0
    );
  }

  /**
   * Get high-priority recommendations requiring immediate action
   */
  public getHighPriorityRecommendations(): AssessmentCompletedEvent['recommendations']['immediateActions'] {
    return this.recommendations.immediateActions.filter(
      (action) => action.priority === 'high',
    );
  }

  /**
   * Get placement readiness summary
   */
  public getPlacementReadinessSummary(): {
    readiness: string;
    readyRoleCount: number;
    criticalGaps: number;
    estimatedSalary?: string;
  } {
    const placement = this.recommendations.placementReadiness;

    return {
      readiness: placement.overallReadiness,
      readyRoleCount: placement.readyForRoles.length,
      criticalGaps: placement.skillGapsToAddress.filter(
        (gap) =>
          gap.suggestedTimeToClose.includes('immediate') ||
          gap.suggestedTimeToClose.includes('urgent'),
      ).length,
      estimatedSalary: placement.minimumSalaryEstimate
        ? `${placement.minimumSalaryEstimate.amount} ${placement.minimumSalaryEstimate.currency}`
        : undefined,
    };
  }

  /**
   * Get assessment performance summary
   */
  public getPerformanceSummary(): {
    overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    strengths: string[];
    improvements: string[];
    timeEfficiency: 'excellent' | 'good' | 'fair' | 'poor';
  } {
    const accuracy = this.overallPerformance.averageAccuracy;
    const efficiency = this.getTimeEfficiency();

    // Extract strengths and improvements from competency results
    const allStrengths = this.competencyResults.flatMap(
      (result) => result.performance.strengths,
    );
    const allImprovements = this.competencyResults.flatMap(
      (result) => result.performance.improvementSuggestions,
    );

    return {
      overallGrade: this.calculateOverallGrade(accuracy),
      strengths: [...new Set(allStrengths)], // Remove duplicates
      improvements: [...new Set(allImprovements)], // Remove duplicates
      timeEfficiency: efficiency,
    };
  }

  /**
   * Calculate overall letter grade based on performance
   */
  private calculateOverallGrade(accuracy: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (accuracy >= 0.9) return 'A';
    if (accuracy >= 0.8) return 'B';
    if (accuracy >= 0.7) return 'C';
    if (accuracy >= 0.6) return 'D';
    return 'F';
  }

  /**
   * Calculate time efficiency based on average task completion time
   */
  private getTimeEfficiency(): 'excellent' | 'good' | 'fair' | 'poor' {
    const avgTimePerTask =
      this.overallPerformance.sessionDuration /
      this.overallPerformance.totalTasksCompleted;

    // Benchmarks in milliseconds (these could be made configurable)
    if (avgTimePerTask <= 60000) return 'excellent'; // <= 1 minute per task
    if (avgTimePerTask <= 120000) return 'good'; // <= 2 minutes per task
    if (avgTimePerTask <= 300000) return 'fair'; // <= 5 minutes per task
    return 'poor'; // > 5 minutes per task
  }

  /**
   * Implement abstract method from DomainEvent
   */
  public getEventData(): Record<string, any> {
    return {
      personId: this.personId.getValue(),
      sessionId: this.sessionId,
      competencyCount: this.competencyResults.length,
      levelAdvancements: this.getLevelAdvancements().length,
      overallAccuracy: this.overallPerformance.averageAccuracy,
      sessionDuration: this.overallPerformance.sessionDuration,
      qualityScore: this.getOverallQualityScore(),
      isReliable: this.isReliableForProgression(),
      placementReadiness:
        this.recommendations.placementReadiness.overallReadiness,
      highPriorityActions: this.getHighPriorityRecommendations().length,
      assessmentType: this.assessmentContext.assessmentType,
      platform: this.assessmentContext.platform.deviceType,
      location:
        this.assessmentContext.sessionContext.location?.country || 'unknown',
    };
  }

  /**
   * Convert to comprehensive JSON for serialization
   */
  public toJSON(): Record<string, any> {
    return {
      eventType: this.eventType,
      eventId: this.eventId,
      timestamp: this.occurredAt.toISOString(),
      personId: this.personId.getValue(),
      sessionId: this.sessionId,
      competencyResults: this.competencyResults.map((result) => ({
        competencyType: result.competencyType.toJSON(),
        achievedLevel: result.achievedLevel.toJSON(),
        confidence: result.confidence.toJSON(),
        tasksCompleted: result.tasksCompleted,
        performance: result.performance,
        isLevelAdvancement: result.isLevelAdvancement,
        previousLevel: result.previousLevel?.toJSON(),
      })),
      overallPerformance: this.overallPerformance,
      assessmentContext: this.assessmentContext,
      recommendations: this.recommendations,
      qualityMetrics: {
        ...this.qualityMetrics,
        overallConfidence: this.qualityMetrics.overallConfidence.toJSON(),
      },
      analytics: this.getEventData(),
      summary: this.getPerformanceSummary(),
      placementSummary: this.getPlacementReadinessSummary(),
    };
  }
}
