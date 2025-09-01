import { DomainEvent } from '../../../../shared/base/domain-event.base';
import { PersonID } from '../../../../shared/value-objects/id.value-object';
import { CompetencyType } from '../value-objects/competency-type.value-object';
import { CCISLevel } from '../value-objects/ccis-level.value-object';
import { ConfidenceScore } from '../value-objects/confidence-score.value-object';

/**
 * Domain Event: CCIS Level Achieved
 *
 * Triggered when a student achieves a new CCIS competency level.
 * This is a critical event in the Shrameva ecosystem as it represents
 * measurable skill progression that can lead to:
 * - Skill passport updates
 * - Achievement badges
 * - Placement eligibility changes
 * - Learning path adjustments
 * - Portfolio evidence collection
 *
 * @example
 * ```typescript
 * const event = new CCISLevelAchievedEvent({
 *   personId: PersonID.create('123e4567-e89b-12d3-a456-426614174000'),
 *   competencyType: CompetencyType.COMMUNICATION,
 *   previousLevel: CCISLevel.create(2),
 *   newLevel: CCISLevel.create(3),
 *   confidence: ConfidenceScore.create(85),
 *   evidenceCount: 15,
 *   assessmentSessionId: 'session-123',
 *   achievementTimestamp: new Date(),
 *   progressionMetrics: {
 *     totalTasksCompleted: 45,
 *     averagePerformance: 0.82,
 *     consistencyScore: 0.78
 *   }
 * });
 * ```
 */
export class CCISLevelAchievedEvent extends DomainEvent {
  /**
   * The person who achieved the new CCIS level
   */
  public readonly personId: PersonID;

  /**
   * The competency area where the level was achieved
   */
  public readonly competencyType: CompetencyType;

  /**
   * The previous CCIS level (1-4) before this achievement
   */
  public readonly previousLevel: CCISLevel;

  /**
   * The newly achieved CCIS level (1-4)
   */
  public readonly newLevel: CCISLevel;

  /**
   * Statistical confidence in this level achievement (0-100%)
   */
  public readonly confidence: ConfidenceScore;

  /**
   * Number of evidence pieces that contributed to this level achievement
   */
  public readonly evidenceCount: number;

  /**
   * The assessment session that triggered this level achievement
   */
  public readonly assessmentSessionId: string;

  /**
   * When this level was achieved
   */
  public readonly achievementTimestamp: Date;

  /**
   * Performance metrics that led to this achievement
   */
  public readonly progressionMetrics: {
    /**
     * Total number of tasks completed across all sessions for this competency
     */
    totalTasksCompleted: number;

    /**
     * Average performance score (0-1) across all assessments
     */
    averagePerformance: number;

    /**
     * Consistency of performance indicating reliable skill demonstration
     */
    consistencyScore: number;

    /**
     * Time taken to achieve this level from the previous level (in days)
     */
    levelProgressionDays?: number;

    /**
     * Comparison with peer performance at similar level
     */
    peerComparison?: {
      percentile: number;
      averagePeerTime: number;
      relativeDifficulty: 'easier' | 'typical' | 'challenging';
    };
  };

  /**
   * Cultural and regional context for this achievement
   */
  public readonly culturalContext: {
    /**
     * Geographic region where assessment was taken
     */
    region: 'India' | 'UAE' | 'Global';

    /**
     * Language used during assessment
     */
    assessmentLanguage: string;

    /**
     * Cultural adaptation level applied during assessment
     */
    adaptationLevel: 'minimal' | 'moderate' | 'extensive';

    /**
     * Local competency benchmarks reference
     */
    localBenchmarks: {
      industryStandard: number;
      educationalLevel: string;
      marketRelevance: 'high' | 'medium' | 'emerging';
    };
  };

  /**
   * Implications of this level achievement
   */
  public readonly implications: {
    /**
     * Skills unlocked by achieving this level
     */
    unlockedSkills: string[];

    /**
     * New learning opportunities now available
     */
    availableLearningPaths: string[];

    /**
     * Placement opportunities that may now be accessible
     */
    placementEligibility: {
      roleTypes: string[];
      minimumSalaryBand: string;
      industryCategories: string[];
    };

    /**
     * Next recommended actions for continued growth
     */
    recommendedActions: {
      action: string;
      priority: 'high' | 'medium' | 'low';
      estimatedTimeToComplete: string;
    }[];
  };

  constructor(data: {
    personId: PersonID;
    competencyType: CompetencyType;
    previousLevel: CCISLevel;
    newLevel: CCISLevel;
    confidence: ConfidenceScore;
    evidenceCount: number;
    assessmentSessionId: string;
    achievementTimestamp: Date;
    progressionMetrics: CCISLevelAchievedEvent['progressionMetrics'];
    culturalContext: CCISLevelAchievedEvent['culturalContext'];
    implications: CCISLevelAchievedEvent['implications'];
    correlationId?: string;
    causationId?: string;
    userId?: string;
  }) {
    super(data.personId, 'Person', {
      correlationId: data.correlationId,
      causationId: data.causationId,
      userId: data.userId,
    });

    // Validate level progression
    if (data.newLevel.getLevel() <= data.previousLevel.getLevel()) {
      throw new Error(
        `New CCIS level (${data.newLevel.getLevel()}) must be higher than previous level (${data.previousLevel.getLevel()})`,
      );
    }

    // Validate evidence count
    if (data.evidenceCount < 1) {
      throw new Error(
        'Evidence count must be at least 1 to achieve a new CCIS level',
      );
    }

    // Validate confidence score for level achievement
    if (data.confidence.getScore() < 70) {
      throw new Error(
        `Confidence score (${data.confidence.getScore()}%) is too low for level achievement (minimum 70%)`,
      );
    }

    // Validate progression metrics
    if (data.progressionMetrics.totalTasksCompleted < 1) {
      throw new Error(
        'At least 1 task must be completed to achieve a CCIS level',
      );
    }

    if (data.progressionMetrics.averagePerformance < 0.6) {
      throw new Error(
        `Average performance (${data.progressionMetrics.averagePerformance}) is too low for level achievement (minimum 0.6)`,
      );
    }

    // Validate timestamp
    if (data.achievementTimestamp > new Date()) {
      throw new Error('Achievement timestamp cannot be in the future');
    }

    this.personId = data.personId;
    this.competencyType = data.competencyType;
    this.previousLevel = data.previousLevel;
    this.newLevel = data.newLevel;
    this.confidence = data.confidence;
    this.evidenceCount = data.evidenceCount;
    this.assessmentSessionId = data.assessmentSessionId;
    this.achievementTimestamp = data.achievementTimestamp;
    this.progressionMetrics = data.progressionMetrics;
    this.culturalContext = data.culturalContext;
    this.implications = data.implications;
  }

  /**
   * Check if this is a breakthrough achievement (skipping levels)
   */
  public isBreakthroughAchievement(): boolean {
    return this.newLevel.getLevel() - this.previousLevel.getLevel() > 1;
  }

  /**
   * Check if this achievement qualifies for accelerated progression
   */
  public qualifiesForAcceleratedProgression(): boolean {
    return (
      this.confidence.getScore() >= 90 &&
      this.progressionMetrics.consistencyScore >= 0.85 &&
      this.progressionMetrics.averagePerformance >= 0.8
    );
  }

  /**
   * Get the skill gap filled by this achievement
   */
  public getSkillGapFilled(): {
    competency: string;
    levelGap: number;
    skillsGained: string[];
    marketValue: 'high' | 'medium' | 'low';
  } {
    const levelGap = this.newLevel.getLevel() - this.previousLevel.getLevel();
    const competencyName = this.competencyType.getName();

    return {
      competency: competencyName,
      levelGap,
      skillsGained: this.implications.unlockedSkills,
      marketValue:
        this.implications.placementEligibility.industryCategories.length > 3
          ? 'high'
          : this.implications.placementEligibility.industryCategories.length > 1
            ? 'medium'
            : 'low',
    };
  }

  /**
   * Get celebration message for this achievement
   */
  public getCelebrationMessage(): string {
    const competencyName = this.competencyType.getName();
    const levelName = this.newLevel.getDescription();

    if (this.isBreakthroughAchievement()) {
      return `🚀 Breakthrough Achievement! You've advanced to ${levelName} in ${competencyName} - exceptional progress!`;
    }

    if (this.qualifiesForAcceleratedProgression()) {
      return `⭐ Outstanding! You've achieved ${levelName} in ${competencyName} with exceptional confidence!`;
    }

    return `🎉 Congratulations! You've reached ${levelName} in ${competencyName}!`;
  }

  /**
   * Get analytics data for this achievement
   */
  public getAnalyticsData(): Record<string, any> {
    return {
      eventType: 'ccis_level_achieved',
      personId: this.personId.getValue(),
      competency: this.competencyType.getName(),
      previousLevel: this.previousLevel.getLevel(),
      newLevel: this.newLevel.getLevel(),
      levelGap: this.newLevel.getLevel() - this.previousLevel.getLevel(),
      confidence: this.confidence.getScore(),
      evidenceCount: this.evidenceCount,
      totalTasks: this.progressionMetrics.totalTasksCompleted,
      averagePerformance: this.progressionMetrics.averagePerformance,
      consistencyScore: this.progressionMetrics.consistencyScore,
      isBreakthrough: this.isBreakthroughAchievement(),
      qualifiesAccelerated: this.qualifiesForAcceleratedProgression(),
      region: this.culturalContext.region,
      adaptationLevel: this.culturalContext.adaptationLevel,
      placementOpportunities:
        this.implications.placementEligibility.roleTypes.length,
      timestamp: this.achievementTimestamp.toISOString(),
      sessionId: this.assessmentSessionId,
    };
  }

  /**
   * Implement abstract method from DomainEvent
   */
  public getEventData(): Record<string, any> {
    return this.getAnalyticsData();
  }

  /**
   * Convert to JSON for serialization
   */
  public toJSON(): Record<string, any> {
    return {
      eventType: this.eventType,
      eventId: this.eventId,
      timestamp: this.occurredAt.toISOString(),
      personId: this.personId.getValue(),
      competencyType: this.competencyType.toJSON(),
      previousLevel: this.previousLevel.toJSON(),
      newLevel: this.newLevel.toJSON(),
      confidence: this.confidence.toJSON(),
      evidenceCount: this.evidenceCount,
      assessmentSessionId: this.assessmentSessionId,
      achievementTimestamp: this.achievementTimestamp.toISOString(),
      progressionMetrics: this.progressionMetrics,
      culturalContext: this.culturalContext,
      implications: this.implications,
      analytics: this.getAnalyticsData(),
    };
  }
}
