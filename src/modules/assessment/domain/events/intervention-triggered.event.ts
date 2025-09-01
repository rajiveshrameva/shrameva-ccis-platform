import { DomainEvent } from '../../../../shared/base/domain-event.base';
import { PersonID } from '../../../../shared/value-objects/id.value-object';
import { CompetencyType } from '../value-objects/competency-type.value-object';
import { CCISLevel } from '../value-objects/ccis-level.value-object';

/**
 * Domain Event: Intervention Triggered
 *
 * Triggered when the scaffolding adjustment system determines that a student
 * requires immediate educational intervention or support. This event is central
 * to Shrameva's adaptive learning approach and personalized education delivery.
 *
 * Interventions are triggered by various factors:
 * - Learning difficulties or struggle patterns
 * - Performance decline or plateau
 * - Engagement issues or disengagement signs
 * - Cultural or linguistic barriers
 * - Accessibility needs identification
 * - Motivational challenges
 * - Skill gap identification
 * - Gaming behavior correction needs
 *
 * @example
 * ```typescript
 * const event = new InterventionTriggeredEvent({
 *   personId: PersonID.create('123e4567-e89b-12d3-a456-426614174000'),
 *   sessionId: 'session-abc123',
 *   interventionType: 'scaffolding_adjustment',
 *   urgency: 'immediate',
 *   triggerCause: 'learning_difficulty',
 *   competencyFocus: CompetencyType.COMMUNICATION,
 *   interventionPlan: {
 *     strategy: 'simplified_content',
 *     duration: 'short_term',
 *     resources: ['visual_aids', 'step_by_step_guidance']
 *   }
 * });
 * ```
 */
export class InterventionTriggeredEvent extends DomainEvent {
  /**
   * The person who requires intervention
   */
  public readonly personId: PersonID;

  /**
   * Assessment session that triggered the intervention (if applicable)
   */
  public readonly sessionId?: string;

  /**
   * Type of intervention required
   */
  public readonly interventionType:
    | 'scaffolding_adjustment'
    | 'remediation_support'
    | 'acceleration_support'
    | 'motivation_enhancement'
    | 'accessibility_accommodation'
    | 'cultural_adaptation'
    | 'technical_support'
    | 'behavioral_correction'
    | 'learning_strategy_guidance'
    | 'social_emotional_support';

  /**
   * Urgency level of the intervention
   */
  public readonly urgency:
    | 'immediate'
    | 'within_hours'
    | 'within_day'
    | 'within_week'
    | 'scheduled';

  /**
   * What triggered this intervention
   */
  public readonly triggerCause:
    | 'learning_difficulty'
    | 'performance_decline'
    | 'engagement_drop'
    | 'cultural_barrier'
    | 'accessibility_need'
    | 'motivational_issue'
    | 'skill_gap'
    | 'gaming_behavior'
    | 'technical_difficulty'
    | 'assessment_anxiety'
    | 'peer_comparison_stress'
    | 'time_management_issue';

  /**
   * Primary competency area requiring intervention
   */
  public readonly competencyFocus: CompetencyType;

  /**
   * Current CCIS level in the focus competency
   */
  public readonly currentLevel: CCISLevel;

  /**
   * Detailed intervention plan and strategy
   */
  public readonly interventionPlan: {
    /**
     * Specific intervention strategy to implement
     */
    strategy: string;

    /**
     * Expected duration of the intervention
     */
    duration:
      | 'immediate'
      | 'short_term'
      | 'medium_term'
      | 'long_term'
      | 'ongoing';

    /**
     * Resources and tools to be used
     */
    resources: string[];

    /**
     * Learning modalities to emphasize
     */
    modalities: Array<
      'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'interactive'
    >;

    /**
     * Specific adjustments to make
     */
    adjustments: Array<{
      type:
        | 'content_simplification'
        | 'pacing_adjustment'
        | 'instruction_style'
        | 'feedback_frequency'
        | 'difficulty_level'
        | 'language_support';
      description: string;
      intensity: 'minimal' | 'moderate' | 'significant' | 'major';
    }>;

    /**
     * Success criteria for the intervention
     */
    successCriteria: Array<{
      metric: string;
      target: number;
      timeframe: string;
      measurement: string;
    }>;

    /**
     * Fallback strategies if primary intervention fails
     */
    fallbackStrategies: string[];
  };

  /**
   * Context and data that led to the intervention trigger
   */
  public readonly triggerContext: {
    /**
     * Performance data that triggered intervention
     */
    performanceData: {
      currentAccuracy: number; // 0-1
      accuracyTrend: 'improving' | 'stable' | 'declining';
      averageTaskTime: number; // milliseconds
      timeEfficiency: 'excellent' | 'good' | 'fair' | 'poor';
      strugglingAreas: string[];
      confidenceLevel: number; // 0-1
    };

    /**
     * Engagement metrics
     */
    engagementMetrics: {
      attentionScore: number; // 0-1
      participationLevel: 'high' | 'medium' | 'low' | 'minimal';
      motivationIndicators: string[];
      frustractionSigns: string[];
      disengagementPatterns: string[];
    };

    /**
     * Learning patterns and preferences
     */
    learningPatterns: {
      preferredModality:
        | 'visual'
        | 'auditory'
        | 'kinesthetic'
        | 'reading'
        | 'mixed';
      learningPace: 'fast' | 'moderate' | 'slow' | 'variable';
      responseToFeedback: 'positive' | 'neutral' | 'negative' | 'mixed';
      collaborationPreference:
        | 'individual'
        | 'small_group'
        | 'large_group'
        | 'flexible';
    };

    /**
     * Cultural and linguistic context
     */
    culturalContext: {
      primaryLanguage: string;
      culturalBackground: string;
      communicationStyle: 'direct' | 'indirect' | 'formal' | 'informal';
      learningCultureNorms: string[];
      adaptationNeeds: string[];
    };

    /**
     * Technical and accessibility factors
     */
    technicalFactors: {
      deviceCapabilities: string[];
      connectivityIssues: string[];
      accessibilityNeeds: string[];
      interfacePreferences: string[];
      assistiveTechnologies: string[];
    };
  };

  /**
   * Stakeholders who should be involved in the intervention
   */
  public readonly stakeholders: {
    /**
     * Primary responsibility for implementing intervention
     */
    primaryResponsible:
      | 'ai_agent'
      | 'human_tutor'
      | 'educator'
      | 'counselor'
      | 'technical_support'
      | 'combined_team';

    /**
     * Educators who should be notified
     */
    educatorsToNotify: string[];

    /**
     * Mentors who should be involved
     */
    mentorsToInvolve: string[];

    /**
     * Family members who should be informed (if applicable)
     */
    familyToInform: string[];

    /**
     * Specialists who may need to be consulted
     */
    specialistsRequired: Array<{
      type:
        | 'learning_specialist'
        | 'counselor'
        | 'accessibility_expert'
        | 'cultural_liaison'
        | 'technical_specialist';
      reason: string;
      urgency: 'immediate' | 'soon' | 'when_available';
    }>;
  };

  /**
   * Expected outcomes and impact of the intervention
   */
  public readonly expectedOutcomes: {
    /**
     * Primary goals of the intervention
     */
    primaryGoals: string[];

    /**
     * Expected timeline for improvement
     */
    improvementTimeline: {
      shortTerm: string[]; // within days
      mediumTerm: string[]; // within weeks
      longTerm: string[]; // within months
    };

    /**
     * Metrics to track intervention effectiveness
     */
    trackingMetrics: Array<{
      metric: string;
      baseline: number;
      target: number;
      timeframe: string;
    }>;

    /**
     * Potential risks and mitigation strategies
     */
    riskMitigation: Array<{
      risk: string;
      probability: 'low' | 'medium' | 'high';
      impact: 'low' | 'medium' | 'high';
      mitigation: string;
    }>;

    /**
     * Success indicators to monitor
     */
    successIndicators: string[];
  };

  /**
   * Timing and scheduling information
   */
  public readonly scheduling: {
    /**
     * When the intervention should start
     */
    startTime: Date;

    /**
     * Estimated duration of the intervention
     */
    estimatedDuration: number; // milliseconds

    /**
     * Frequency of intervention sessions
     */
    frequency:
      | 'continuous'
      | 'daily'
      | 'several_times_week'
      | 'weekly'
      | 'as_needed';

    /**
     * Specific time constraints or preferences
     */
    timeConstraints: string[];

    /**
     * Dependencies that must be resolved first
     */
    dependencies: string[];

    /**
     * Review and adjustment schedule
     */
    reviewSchedule: Array<{
      reviewDate: Date;
      reviewType:
        | 'progress_check'
        | 'strategy_adjustment'
        | 'outcome_assessment';
      stakeholders: string[];
    }>;
  };

  constructor(data: {
    personId: PersonID;
    sessionId?: string;
    interventionType: InterventionTriggeredEvent['interventionType'];
    urgency: InterventionTriggeredEvent['urgency'];
    triggerCause: InterventionTriggeredEvent['triggerCause'];
    competencyFocus: CompetencyType;
    currentLevel: CCISLevel;
    interventionPlan: InterventionTriggeredEvent['interventionPlan'];
    triggerContext: InterventionTriggeredEvent['triggerContext'];
    stakeholders: InterventionTriggeredEvent['stakeholders'];
    expectedOutcomes: InterventionTriggeredEvent['expectedOutcomes'];
    scheduling: InterventionTriggeredEvent['scheduling'];
    correlationId?: string;
    causationId?: string;
    userId?: string;
  }) {
    super(data.personId, 'Person', {
      correlationId: data.correlationId,
      causationId: data.causationId,
      userId: data.userId,
    });

    // Validate intervention data
    if (
      !data.interventionPlan.strategy ||
      data.interventionPlan.strategy.trim().length === 0
    ) {
      throw new Error('Intervention strategy is required');
    }

    if (
      !data.interventionPlan.resources ||
      data.interventionPlan.resources.length === 0
    ) {
      throw new Error('At least one intervention resource must be specified');
    }

    if (
      !data.interventionPlan.successCriteria ||
      data.interventionPlan.successCriteria.length === 0
    ) {
      throw new Error('Success criteria must be defined for intervention');
    }

    // Validate performance data ranges
    const perf = data.triggerContext.performanceData;
    if (perf.currentAccuracy < 0 || perf.currentAccuracy > 1) {
      throw new Error('Current accuracy must be between 0 and 1');
    }

    if (perf.confidenceLevel < 0 || perf.confidenceLevel > 1) {
      throw new Error('Confidence level must be between 0 and 1');
    }

    // Validate engagement metrics ranges
    const engagement = data.triggerContext.engagementMetrics;
    if (engagement.attentionScore < 0 || engagement.attentionScore > 1) {
      throw new Error('Attention score must be between 0 and 1');
    }

    // Validate timing
    if (data.scheduling.startTime < new Date()) {
      throw new Error('Intervention start time cannot be in the past');
    }

    if (data.scheduling.estimatedDuration <= 0) {
      throw new Error('Estimated duration must be positive');
    }

    // Validate success criteria targets
    for (const criteria of data.interventionPlan.successCriteria) {
      if (criteria.target <= 0) {
        throw new Error(
          `Success criteria target for ${criteria.metric} must be positive`,
        );
      }
    }

    // Validate primary goals exist
    if (
      !data.expectedOutcomes.primaryGoals ||
      data.expectedOutcomes.primaryGoals.length === 0
    ) {
      throw new Error('Primary goals must be defined for intervention');
    }

    this.personId = data.personId;
    this.sessionId = data.sessionId;
    this.interventionType = data.interventionType;
    this.urgency = data.urgency;
    this.triggerCause = data.triggerCause;
    this.competencyFocus = data.competencyFocus;
    this.currentLevel = data.currentLevel;
    this.interventionPlan = data.interventionPlan;
    this.triggerContext = data.triggerContext;
    this.stakeholders = data.stakeholders;
    this.expectedOutcomes = data.expectedOutcomes;
    this.scheduling = data.scheduling;
  }

  /**
   * Check if intervention requires immediate action
   */
  public requiresImmediateAction(): boolean {
    return (
      this.urgency === 'immediate' ||
      this.triggerCause === 'assessment_anxiety' ||
      this.triggerCause === 'technical_difficulty' ||
      (this.triggerCause === 'gaming_behavior' &&
        this.urgency === 'within_hours')
    );
  }

  /**
   * Check if intervention involves multiple stakeholders
   */
  public isMultiStakeholderIntervention(): boolean {
    return (
      this.stakeholders.educatorsToNotify.length > 0 ||
      this.stakeholders.mentorsToInvolve.length > 0 ||
      this.stakeholders.specialistsRequired.length > 0 ||
      this.stakeholders.primaryResponsible === 'combined_team'
    );
  }

  /**
   * Get intervention complexity level
   */
  public getComplexityLevel():
    | 'simple'
    | 'moderate'
    | 'complex'
    | 'highly_complex' {
    let complexityScore = 0;

    // Add points for various complexity factors
    if (this.isMultiStakeholderIntervention()) complexityScore += 2;
    if (this.interventionPlan.adjustments.length > 3) complexityScore += 1;
    if (this.interventionPlan.modalities.length > 2) complexityScore += 1;
    if (this.stakeholders.specialistsRequired.length > 0) complexityScore += 2;
    if (this.triggerContext.culturalContext.adaptationNeeds.length > 2)
      complexityScore += 1;
    if (this.triggerContext.technicalFactors.accessibilityNeeds.length > 0)
      complexityScore += 1;
    if (this.expectedOutcomes.riskMitigation.length > 2) complexityScore += 1;

    if (complexityScore >= 7) return 'highly_complex';
    if (complexityScore >= 4) return 'complex';
    if (complexityScore >= 2) return 'moderate';
    return 'simple';
  }

  /**
   * Get risk assessment for intervention success
   */
  public getRiskAssessment(): {
    overallRisk: 'low' | 'medium' | 'high';
    riskFactors: string[];
    successProbability: number; // 0-1
    recommendedMitigations: string[];
  } {
    const risks = this.expectedOutcomes.riskMitigation;
    const highRisks = risks.filter(
      (r) => r.probability === 'high' && r.impact === 'high',
    );
    const mediumRisks = risks.filter(
      (r) =>
        (r.probability === 'high' && r.impact === 'medium') ||
        (r.probability === 'medium' && r.impact === 'high'),
    );

    let overallRisk: 'low' | 'medium' | 'high' = 'low';
    if (highRisks.length > 0) overallRisk = 'high';
    else if (mediumRisks.length > 1) overallRisk = 'medium';
    else if (mediumRisks.length > 0) overallRisk = 'medium';

    // Calculate success probability based on various factors
    let successProbability = 0.8; // baseline

    // Adjust based on engagement level
    const engagement = this.triggerContext.engagementMetrics.participationLevel;
    if (engagement === 'high') successProbability += 0.1;
    else if (engagement === 'low') successProbability -= 0.1;
    else if (engagement === 'minimal') successProbability -= 0.2;

    // Adjust based on performance trends
    const trend = this.triggerContext.performanceData.accuracyTrend;
    if (trend === 'improving') successProbability += 0.1;
    else if (trend === 'declining') successProbability -= 0.1;

    // Adjust based on risk level
    if (overallRisk === 'high') successProbability -= 0.2;
    else if (overallRisk === 'medium') successProbability -= 0.1;

    // Clamp between 0 and 1
    successProbability = Math.max(0, Math.min(1, successProbability));

    return {
      overallRisk,
      riskFactors: risks.map((r) => r.risk),
      successProbability,
      recommendedMitigations: risks.map((r) => r.mitigation),
    };
  }

  /**
   * Get intervention priority score for scheduling
   */
  public getPriorityScore(): number {
    let score = 0;

    // Urgency impact
    switch (this.urgency) {
      case 'immediate':
        score += 10;
        break;
      case 'within_hours':
        score += 8;
        break;
      case 'within_day':
        score += 6;
        break;
      case 'within_week':
        score += 4;
        break;
      case 'scheduled':
        score += 2;
        break;
    }

    // Trigger cause impact
    const highPriorityCauses = [
      'assessment_anxiety',
      'technical_difficulty',
      'gaming_behavior',
    ];
    if (highPriorityCauses.includes(this.triggerCause)) score += 5;

    // Performance impact
    if (this.triggerContext.performanceData.currentAccuracy < 0.5) score += 3;
    if (this.triggerContext.performanceData.accuracyTrend === 'declining')
      score += 2;

    // Engagement impact
    if (this.triggerContext.engagementMetrics.participationLevel === 'minimal')
      score += 3;

    return score;
  }

  /**
   * Get human-readable intervention description
   */
  public getInterventionDescription(): string {
    const causes: Record<InterventionTriggeredEvent['triggerCause'], string> = {
      learning_difficulty: 'Learning challenges identified',
      performance_decline: 'Performance decline detected',
      engagement_drop: 'Engagement levels dropping',
      cultural_barrier: 'Cultural adaptation needed',
      accessibility_need: 'Accessibility support required',
      motivational_issue: 'Motivation enhancement needed',
      skill_gap: 'Skill gap requires attention',
      gaming_behavior: 'Behavior correction needed',
      technical_difficulty: 'Technical support required',
      assessment_anxiety: 'Assessment anxiety support needed',
      peer_comparison_stress: 'Peer pressure support needed',
      time_management_issue: 'Time management guidance needed',
    };

    return `${causes[this.triggerCause]} - ${this.interventionPlan.strategy} intervention required for ${this.competencyFocus.getName()}`;
  }

  /**
   * Implement abstract method from DomainEvent
   */
  public getEventData(): Record<string, any> {
    const riskAssessment = this.getRiskAssessment();
    const complexityLevel = this.getComplexityLevel();
    const priorityScore = this.getPriorityScore();

    return {
      personId: this.personId.getValue(),
      sessionId: this.sessionId,
      interventionType: this.interventionType,
      urgency: this.urgency,
      triggerCause: this.triggerCause,
      competencyFocus: this.competencyFocus.getName(),
      currentLevel: this.currentLevel.getLevel(),
      strategy: this.interventionPlan.strategy,
      duration: this.interventionPlan.duration,
      requiresImmediateAction: this.requiresImmediateAction(),
      isMultiStakeholder: this.isMultiStakeholderIntervention(),
      complexityLevel,
      overallRisk: riskAssessment.overallRisk,
      successProbability: riskAssessment.successProbability,
      priorityScore,
      primaryResponsible: this.stakeholders.primaryResponsible,
      specialistsRequired: this.stakeholders.specialistsRequired.length,
      estimatedDuration: this.scheduling.estimatedDuration,
      frequency: this.scheduling.frequency,
      adjustmentCount: this.interventionPlan.adjustments.length,
      modalityCount: this.interventionPlan.modalities.length,
      currentAccuracy: this.triggerContext.performanceData.currentAccuracy,
      engagementLevel: this.triggerContext.engagementMetrics.participationLevel,
      preferredModality: this.triggerContext.learningPatterns.preferredModality,
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
      interventionType: this.interventionType,
      urgency: this.urgency,
      triggerCause: this.triggerCause,
      competencyFocus: this.competencyFocus.toJSON(),
      currentLevel: this.currentLevel.toJSON(),
      interventionPlan: this.interventionPlan,
      triggerContext: this.triggerContext,
      stakeholders: this.stakeholders,
      expectedOutcomes: this.expectedOutcomes,
      scheduling: {
        ...this.scheduling,
        startTime: this.scheduling.startTime.toISOString(),
        reviewSchedule: this.scheduling.reviewSchedule.map((review) => ({
          ...review,
          reviewDate: review.reviewDate.toISOString(),
        })),
      },
      analytics: this.getEventData(),
      riskAssessment: this.getRiskAssessment(),
      complexityLevel: this.getComplexityLevel(),
      priorityScore: this.getPriorityScore(),
      description: this.getInterventionDescription(),
    };
  }
}
