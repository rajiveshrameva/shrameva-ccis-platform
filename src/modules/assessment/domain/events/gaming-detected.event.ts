import { DomainEvent } from '../../../../shared/base/domain-event.base';
import { PersonID } from '../../../../shared/value-objects/id.value-object';
import { CompetencyType } from '../value-objects/competency-type.value-object';

/**
 * Domain Event: Gaming Detected
 *
 * Triggered when the gaming detection system identifies potential
 * gaming behaviors during assessment sessions. This event is critical
 * for maintaining assessment integrity and ensuring fair evaluation
 * across the Shrameva CCIS platform.
 *
 * Gaming behaviors threaten the validity of:
 * - CCIS competency level assessments
 * - Skill passport accuracy
 * - Placement eligibility decisions
 * - Learning analytics and benchmarks
 * - AI agent training data quality
 *
 * @example
 * ```typescript
 * const event = new GamingDetectedEvent({
 *   personId: PersonID.create('123e4567-e89b-12d3-a456-426614174000'),
 *   sessionId: 'session-abc123',
 *   gamingType: 'pattern_clicking',
 *   severity: 'medium',
 *   detectionDetails: {
 *     pattern: 'Rapid clicking without reading content',
 *     confidence: 0.85,
 *     evidence: ['Click intervals < 100ms', 'No scroll activity']
 *   },
 *   contextData: {
 *     taskType: 'reading-comprehension',
 *     competencyFocus: CompetencyType.COMMUNICATION,
 *     detectionTimestamp: new Date()
 *   }
 * });
 * ```
 */
export class GamingDetectedEvent extends DomainEvent {
  /**
   * The person who exhibited gaming behavior
   */
  public readonly personId: PersonID;

  /**
   * Assessment session where gaming was detected
   */
  public readonly sessionId: string;

  /**
   * Type of gaming behavior detected
   */
  public readonly gamingType:
    | 'pattern_clicking'
    | 'response_time_gaming'
    | 'sequence_manipulation'
    | 'content_exploitation'
    | 'social_engineering'
    | 'technical_exploitation'
    | 'behavioral_inconsistency'
    | 'statistical_anomaly';

  /**
   * Severity level of the gaming behavior
   */
  public readonly severity: 'low' | 'medium' | 'high' | 'critical';

  /**
   * Detailed information about the detected gaming behavior
   */
  public readonly detectionDetails: {
    /**
     * Description of the specific gaming pattern detected
     */
    pattern: string;

    /**
     * Statistical confidence in the detection (0-1)
     */
    confidence: number;

    /**
     * Specific evidence that led to the detection
     */
    evidence: string[];

    /**
     * Raw data points that triggered the detection
     */
    rawData: Record<string, any>;

    /**
     * Algorithm or model that made the detection
     */
    detectionMethod: string;

    /**
     * Threshold values that were exceeded
     */
    thresholds: {
      parameter: string;
      threshold: number;
      actualValue: number;
      deviation: number;
    }[];
  };

  /**
   * Context information about when and where gaming was detected
   */
  public readonly contextData: {
    /**
     * Type of task being performed when gaming was detected
     */
    taskType: string;

    /**
     * Competency area being assessed
     */
    competencyFocus: CompetencyType;

    /**
     * Exact timestamp when gaming behavior was detected
     */
    detectionTimestamp: Date;

    /**
     * Progress through the task when gaming was detected (0-1)
     */
    taskProgress: number;

    /**
     * Number of previous gaming incidents for this person
     */
    previousIncidents: number;

    /**
     * Time elapsed in session before detection (milliseconds)
     */
    sessionDuration: number;

    /**
     * Platform and device information
     */
    platform: {
      deviceType: 'mobile' | 'tablet' | 'desktop';
      operatingSystem: string;
      browserType?: string;
      screenResolution?: string;
      inputMethod: 'touch' | 'mouse' | 'keyboard' | 'mixed';
    };

    /**
     * Network and connectivity context
     */
    networkContext: {
      connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
      connectionQuality: 'poor' | 'fair' | 'good' | 'excellent';
      latency?: number; // milliseconds
      bandwidth?: number; // mbps
    };
  };

  /**
   * Impact assessment of the gaming behavior
   */
  public readonly impactAssessment: {
    /**
     * How much this gaming affects assessment validity
     */
    validityImpact: 'minimal' | 'moderate' | 'significant' | 'severe';

    /**
     * Affected competency assessments
     */
    affectedCompetencies: CompetencyType[];

    /**
     * Tasks that may have been compromised
     */
    compromisedTasks: string[];

    /**
     * Confidence level in subsequent assessments
     */
    assessmentReliability: {
      beforeGaming: number; // 0-1
      afterGaming: number; // 0-1
      degradation: number; // 0-1
    };

    /**
     * Estimated impact on CCIS level accuracy
     */
    ccisImpact: {
      competencyType: CompetencyType;
      estimatedInflation: number; // how much the level might be inflated
      confidenceDegradation: number; // 0-1
    }[];
  };

  /**
   * Recommended response actions
   */
  public readonly responseRecommendations: {
    /**
     * Immediate actions to take
     */
    immediateActions: Array<{
      action:
        | 'pause_assessment'
        | 'invalidate_session'
        | 'require_supervision'
        | 'flag_for_review'
        | 'continue_with_monitoring';
      priority: 'urgent' | 'high' | 'medium' | 'low';
      rationale: string;
      estimatedImpact: string;
    }>;

    /**
     * Assessment validity adjustments
     */
    validityAdjustments: Array<{
      competencyType: CompetencyType;
      adjustment:
        | 'reduce_confidence'
        | 'require_retest'
        | 'invalidate_results'
        | 'add_supervision'
        | 'no_action';
      severity: number; // 0-1
      reasoning: string;
    }>;

    /**
     * Follow-up interventions
     */
    followUpInterventions: Array<{
      intervention:
        | 'educational_guidance'
        | 'assessment_coaching'
        | 'integrity_training'
        | 'proctored_retest'
        | 'counseling';
      timing: 'immediate' | 'within_24h' | 'within_week' | 'next_session';
      description: string;
    }>;

    /**
     * Monitoring and prevention strategies
     */
    preventionStrategies: Array<{
      strategy: string;
      implementation: 'immediate' | 'next_session' | 'ongoing';
      expectedEffectiveness: number; // 0-1
    }>;
  };

  /**
   * Historical gaming context for this person
   */
  public readonly historicalContext: {
    /**
     * Previous gaming incidents
     */
    priorIncidents: Array<{
      sessionId: string;
      gamingType: GamingDetectedEvent['gamingType'];
      severity: GamingDetectedEvent['severity'];
      timestamp: Date;
      resolved: boolean;
    }>;

    /**
     * Gaming pattern trends
     */
    patterns: {
      isRepeatOffender: boolean;
      gamingFrequency: number; // incidents per session
      severityTrend: 'improving' | 'stable' | 'worsening';
      mostCommonGamingType: GamingDetectedEvent['gamingType'];
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
    };

    /**
     * Intervention effectiveness history
     */
    interventionHistory: Array<{
      intervention: string;
      appliedDate: Date;
      effectiveness:
        | 'very_effective'
        | 'effective'
        | 'somewhat_effective'
        | 'ineffective';
      notes: string;
    }>;
  };

  constructor(data: {
    personId: PersonID;
    sessionId: string;
    gamingType: GamingDetectedEvent['gamingType'];
    severity: GamingDetectedEvent['severity'];
    detectionDetails: GamingDetectedEvent['detectionDetails'];
    contextData: GamingDetectedEvent['contextData'];
    impactAssessment: GamingDetectedEvent['impactAssessment'];
    responseRecommendations: GamingDetectedEvent['responseRecommendations'];
    historicalContext: GamingDetectedEvent['historicalContext'];
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
      throw new Error('Session ID is required for gaming detection');
    }

    // Validate detection details
    if (
      data.detectionDetails.confidence < 0 ||
      data.detectionDetails.confidence > 1
    ) {
      throw new Error('Detection confidence must be between 0 and 1');
    }

    if (data.detectionDetails.confidence < 0.5) {
      throw new Error(
        'Gaming detection confidence must be at least 0.5 to trigger event',
      );
    }

    if (
      !data.detectionDetails.evidence ||
      data.detectionDetails.evidence.length === 0
    ) {
      throw new Error(
        'At least one piece of evidence is required for gaming detection',
      );
    }

    // Validate context data
    if (
      data.contextData.taskProgress < 0 ||
      data.contextData.taskProgress > 1
    ) {
      throw new Error('Task progress must be between 0 and 1');
    }

    if (data.contextData.sessionDuration < 0) {
      throw new Error('Session duration cannot be negative');
    }

    if (data.contextData.detectionTimestamp > new Date()) {
      throw new Error('Detection timestamp cannot be in the future');
    }

    // Validate impact assessment
    for (const threshold of data.detectionDetails.thresholds) {
      if (threshold.threshold <= 0) {
        throw new Error(
          `Invalid threshold for ${threshold.parameter}: must be positive`,
        );
      }
    }

    // Validate assessment reliability values
    const reliability = data.impactAssessment.assessmentReliability;
    if (
      reliability.beforeGaming < 0 ||
      reliability.beforeGaming > 1 ||
      reliability.afterGaming < 0 ||
      reliability.afterGaming > 1 ||
      reliability.degradation < 0 ||
      reliability.degradation > 1
    ) {
      throw new Error('Assessment reliability values must be between 0 and 1');
    }

    // Validate immediate actions exist
    if (
      !data.responseRecommendations.immediateActions ||
      data.responseRecommendations.immediateActions.length === 0
    ) {
      throw new Error(
        'At least one immediate action recommendation is required',
      );
    }

    this.personId = data.personId;
    this.sessionId = data.sessionId;
    this.gamingType = data.gamingType;
    this.severity = data.severity;
    this.detectionDetails = data.detectionDetails;
    this.contextData = data.contextData;
    this.impactAssessment = data.impactAssessment;
    this.responseRecommendations = data.responseRecommendations;
    this.historicalContext = data.historicalContext;
  }

  /**
   * Check if this gaming incident requires immediate intervention
   */
  public requiresImmediateIntervention(): boolean {
    return (
      this.severity === 'critical' ||
      this.severity === 'high' ||
      this.impactAssessment.validityImpact === 'severe' ||
      this.historicalContext.patterns.riskLevel === 'critical' ||
      this.responseRecommendations.immediateActions.some(
        (action) => action.priority === 'urgent',
      )
    );
  }

  /**
   * Check if assessment session should be invalidated
   */
  public shouldInvalidateSession(): boolean {
    return (
      this.severity === 'critical' ||
      this.impactAssessment.validityImpact === 'severe' ||
      this.responseRecommendations.immediateActions.some(
        (action) => action.action === 'invalidate_session',
      )
    );
  }

  /**
   * Get risk level for future assessments
   */
  public getFutureRiskLevel(): 'low' | 'medium' | 'high' | 'critical' {
    const currentRisk = this.historicalContext.patterns.riskLevel;

    // Escalate risk based on current severity
    if (this.severity === 'critical') return 'critical';
    if (this.severity === 'high' && currentRisk !== 'critical') return 'high';

    return currentRisk;
  }

  /**
   * Get gaming pattern description for human understanding
   */
  public getGamingDescription(): string {
    const descriptions: Record<GamingDetectedEvent['gamingType'], string> = {
      pattern_clicking:
        'Rapid, systematic clicking without proper content engagement',
      response_time_gaming:
        'Artificially fast or slow response times indicating gaming',
      sequence_manipulation: 'Attempting to manipulate task sequence or timing',
      content_exploitation:
        'Exploiting content patterns or predictable elements',
      social_engineering:
        'Attempting to gather information about correct answers',
      technical_exploitation: 'Using technical means to gain unfair advantage',
      behavioral_inconsistency:
        'Behavior patterns inconsistent with genuine assessment',
      statistical_anomaly:
        'Performance patterns that are statistically improbable',
    };

    return descriptions[this.gamingType] || 'Unknown gaming behavior detected';
  }

  /**
   * Get recommended intervention summary
   */
  public getInterventionSummary(): {
    urgentActions: number;
    invalidateSession: boolean;
    requireSupervision: boolean;
    needsRetest: boolean;
    educationalGuidance: boolean;
  } {
    const immediateActions = this.responseRecommendations.immediateActions;
    const followUps = this.responseRecommendations.followUpInterventions;
    const validityAdjustments =
      this.responseRecommendations.validityAdjustments;

    return {
      urgentActions: immediateActions.filter(
        (action) => action.priority === 'urgent',
      ).length,
      invalidateSession: immediateActions.some(
        (action) => action.action === 'invalidate_session',
      ),
      requireSupervision: immediateActions.some(
        (action) => action.action === 'require_supervision',
      ),
      needsRetest: validityAdjustments.some(
        (adj) => adj.adjustment === 'require_retest',
      ),
      educationalGuidance: followUps.some(
        (intervention) => intervention.intervention === 'educational_guidance',
      ),
    };
  }

  /**
   * Get impact on CCIS competency assessments
   */
  public getCCISImpactSummary(): {
    affectedCompetencies: number;
    maxInflation: number;
    averageConfidenceDegradation: number;
    requiresReassessment: CompetencyType[];
  } {
    const ccisImpacts = this.impactAssessment.ccisImpact;

    if (ccisImpacts.length === 0) {
      return {
        affectedCompetencies: 0,
        maxInflation: 0,
        averageConfidenceDegradation: 0,
        requiresReassessment: [],
      };
    }

    const maxInflation = Math.max(
      ...ccisImpacts.map((impact) => impact.estimatedInflation),
    );
    const avgDegradation =
      ccisImpacts.reduce(
        (sum, impact) => sum + impact.confidenceDegradation,
        0,
      ) / ccisImpacts.length;

    // Competencies requiring reassessment (high inflation or confidence degradation)
    const requiresReassessment = ccisImpacts
      .filter(
        (impact) =>
          impact.estimatedInflation > 0.3 || impact.confidenceDegradation > 0.4,
      )
      .map((impact) => impact.competencyType);

    return {
      affectedCompetencies: ccisImpacts.length,
      maxInflation,
      averageConfidenceDegradation: avgDegradation,
      requiresReassessment,
    };
  }

  /**
   * Implement abstract method from DomainEvent
   */
  public getEventData(): Record<string, any> {
    const ccisImpact = this.getCCISImpactSummary();
    const interventionSummary = this.getInterventionSummary();

    return {
      personId: this.personId.getValue(),
      sessionId: this.sessionId,
      gamingType: this.gamingType,
      severity: this.severity,
      confidence: this.detectionDetails.confidence,
      pattern: this.detectionDetails.pattern,
      competencyFocus: this.contextData.competencyFocus.getName(),
      taskType: this.contextData.taskType,
      sessionDuration: this.contextData.sessionDuration,
      previousIncidents: this.contextData.previousIncidents,
      validityImpact: this.impactAssessment.validityImpact,
      affectedCompetencies: ccisImpact.affectedCompetencies,
      maxInflation: ccisImpact.maxInflation,
      requiresImmediateIntervention: this.requiresImmediateIntervention(),
      shouldInvalidateSession: this.shouldInvalidateSession(),
      urgentActions: interventionSummary.urgentActions,
      riskLevel: this.historicalContext.patterns.riskLevel,
      futureRiskLevel: this.getFutureRiskLevel(),
      deviceType: this.contextData.platform.deviceType,
      connectionQuality: this.contextData.networkContext.connectionQuality,
      detectionMethod: this.detectionDetails.detectionMethod,
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
      gamingType: this.gamingType,
      severity: this.severity,
      detectionDetails: this.detectionDetails,
      contextData: {
        ...this.contextData,
        competencyFocus: this.contextData.competencyFocus.toJSON(),
        detectionTimestamp: this.contextData.detectionTimestamp.toISOString(),
      },
      impactAssessment: {
        ...this.impactAssessment,
        affectedCompetencies: this.impactAssessment.affectedCompetencies.map(
          (comp) => comp.toJSON(),
        ),
        ccisImpact: this.impactAssessment.ccisImpact.map((impact) => ({
          ...impact,
          competencyType: impact.competencyType.toJSON(),
        })),
      },
      responseRecommendations: this.responseRecommendations,
      historicalContext: this.historicalContext,
      analytics: this.getEventData(),
      ccisImpactSummary: this.getCCISImpactSummary(),
      interventionSummary: this.getInterventionSummary(),
      gamingDescription: this.getGamingDescription(),
    };
  }
}
