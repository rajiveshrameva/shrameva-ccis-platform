import { PersonID } from '../../../../shared/value-objects/id.value-object';
import { CCISLevel } from '../../domain/value-objects/ccis-level.value-object';
import { CompetencyType } from '../../domain/value-objects/competency-type.value-object';

/**
 * Command: Start Assessment
 *
 * Initiates a new CCIS assessment session for a person, configuring
 * the assessment parameters, competency focus, and adaptive settings
 * based on the person's profile and learning context.
 *
 * This command serves as the entry point for the Shrameva CCIS
 * assessment system, orchestrating the creation of assessment sessions
 * with proper behavioral signal collection, gaming detection, and
 * scaffolding adjustment capabilities.
 *
 * Key Features:
 * 1. **Adaptive Configuration**: Configures assessment based on learner profile
 * 2. **Competency Targeting**: Focuses on specific competencies or comprehensive assessment
 * 3. **Cultural Adaptation**: Applies cultural context and preferences
 * 4. **Accessibility Support**: Configures accessibility accommodations
 * 5. **Gaming Prevention**: Sets up anti-gaming detection parameters
 * 6. **Performance Tracking**: Establishes baseline and progress metrics
 * 7. **Multi-Modal Support**: Configures various interaction modalities
 * 8. **Risk Assessment**: Evaluates and mitigates assessment risks
 *
 * Usage Patterns:
 * - Initial competency assessment for new students
 * - Periodic progress evaluation for existing students
 * - Targeted competency assessment for specific skills
 * - Remediation assessment for struggling learners
 * - Advanced assessment for high-performing students
 *
 * @example
 * ```typescript
 * const command = new StartAssessmentCommand({
 *   personId: PersonID.fromString('person-123'),
 *   assessmentType: 'comprehensive',
 *   targetCompetencies: [CompetencyType.COMMUNICATION, CompetencyType.PROBLEM_SOLVING],
 *   culturalContext: 'india',
 *   accessibilityNeeds: ['screen_reader'],
 *   priorAssessmentHistory: assessmentHistory
 * });
 *
 * const result = await handler.handle(command);
 * ```
 */
export class StartAssessmentCommand {
  public readonly personId: PersonID;
  public readonly assessmentType: AssessmentType;
  public readonly targetCompetencies: CompetencyType[];
  public readonly estimatedDuration: number; // minutes
  public readonly culturalContext: CulturalContext;
  public readonly accessibilityNeeds: AccessibilityNeed[];
  public readonly learningPreferences: LearningPreferences;
  public readonly priorAssessmentHistory?: PriorAssessmentHistory;
  public readonly assessmentGoals: AssessmentGoal[];
  public readonly schedulingConstraints: SchedulingConstraints;
  public readonly stakeholderNotifications: StakeholderNotification[];
  public readonly riskMitigationSettings: RiskMitigationSettings;
  public readonly metadata: AssessmentMetadata;

  constructor(params: StartAssessmentCommandParams) {
    // Validate required parameters
    this.validateRequiredParams(params);

    // Core assessment parameters
    this.personId = params.personId;
    this.assessmentType = params.assessmentType;
    this.targetCompetencies =
      params.targetCompetencies || this.getDefaultCompetencies();
    this.estimatedDuration =
      params.estimatedDuration || this.calculateEstimatedDuration();

    // Context and adaptation parameters
    this.culturalContext =
      params.culturalContext || this.getDefaultCulturalContext();
    this.accessibilityNeeds = params.accessibilityNeeds || [];
    this.learningPreferences =
      params.learningPreferences || this.getDefaultLearningPreferences();

    // Historical and goal parameters
    this.priorAssessmentHistory = params.priorAssessmentHistory;
    this.assessmentGoals =
      params.assessmentGoals || this.getDefaultAssessmentGoals();

    // Operational parameters
    this.schedulingConstraints =
      params.schedulingConstraints || this.getDefaultSchedulingConstraints();
    this.stakeholderNotifications = params.stakeholderNotifications || [];
    this.riskMitigationSettings =
      params.riskMitigationSettings || this.getDefaultRiskMitigationSettings();

    // Metadata and tracking
    this.metadata = {
      commandId: this.generateCommandId(),
      requestedAt: new Date(),
      requestSource:
        (params.requestSource as AssessmentMetadata['requestSource']) ||
        'direct',
      priority: params.priority || 'normal',
      version: '1.0.0',
      correlationId: params.correlationId,
    };

    // Post-construction validation
    this.validateAssessmentConfiguration();
  }

  /**
   * Validate required command parameters
   */
  private validateRequiredParams(params: StartAssessmentCommandParams): void {
    if (!params.personId) {
      throw new Error('PersonID is required for starting assessment');
    }

    if (!params.assessmentType) {
      throw new Error('Assessment type must be specified');
    }

    if (params.targetCompetencies && params.targetCompetencies.length === 0) {
      throw new Error(
        'At least one target competency must be specified when targetCompetencies is provided',
      );
    }

    if (
      params.estimatedDuration &&
      (params.estimatedDuration < 5 || params.estimatedDuration > 240)
    ) {
      throw new Error('Assessment duration must be between 5 and 240 minutes');
    }
  }

  /**
   * Get default competencies for comprehensive assessment
   */
  private getDefaultCompetencies(): CompetencyType[] {
    return [
      CompetencyType.COMMUNICATION,
      CompetencyType.PROBLEM_SOLVING,
      CompetencyType.TEAMWORK,
      CompetencyType.ADAPTABILITY,
      CompetencyType.TIME_MANAGEMENT,
      CompetencyType.TECHNICAL_SKILLS,
      CompetencyType.LEADERSHIP,
    ];
  }

  /**
   * Calculate estimated duration based on assessment type and competencies
   */
  private calculateEstimatedDuration(): number {
    const baseTimePerCompetency = 15; // minutes
    const assessmentTypeMultiplier = this.getAssessmentTypeMultiplier();

    return Math.min(
      this.targetCompetencies.length *
        baseTimePerCompetency *
        assessmentTypeMultiplier,
      120, // Maximum 2 hours
    );
  }

  /**
   * Get multiplier based on assessment type
   */
  private getAssessmentTypeMultiplier(): number {
    switch (this.assessmentType) {
      case 'quick':
        return 0.5;
      case 'standard':
        return 1.0;
      case 'comprehensive':
        return 1.5;
      case 'diagnostic':
        return 2.0;
      case 'remediation':
        return 1.2;
      case 'advanced':
        return 1.8;
      default:
        return 1.0;
    }
  }

  /**
   * Get default cultural context (can be enhanced with user profile data)
   */
  private getDefaultCulturalContext(): CulturalContext {
    return {
      region: 'india', // Default to India market
      language: 'english',
      culturalAdaptations: ['collectivist_feedback', 'respect_for_authority'],
      communicationStyle: 'formal',
      learningCulture: 'examination_oriented',
    };
  }

  /**
   * Get default learning preferences
   */
  private getDefaultLearningPreferences(): LearningPreferences {
    return {
      preferredModality: 'visual',
      interactionStyle: 'guided',
      feedbackFrequency: 'moderate',
      challengeLevel: 'adaptive',
      supportLevel: 'standard',
    };
  }

  /**
   * Get default assessment goals
   */
  private getDefaultAssessmentGoals(): AssessmentGoal[] {
    return [
      {
        type: 'competency_baseline',
        description: 'Establish baseline competency levels',
        priority: 'high',
        metrics: ['ccis_level', 'confidence_score'],
      },
      {
        type: 'learning_needs_identification',
        description: 'Identify specific learning needs and gaps',
        priority: 'high',
        metrics: ['skill_gaps', 'intervention_needs'],
      },
      {
        type: 'personalization_data',
        description: 'Collect data for learning personalization',
        priority: 'medium',
        metrics: ['learning_preferences', 'behavioral_patterns'],
      },
    ];
  }

  /**
   * Get default scheduling constraints
   */
  private getDefaultSchedulingConstraints(): SchedulingConstraints {
    return {
      maxSessionDuration: 45, // minutes
      breakRequirements: {
        enabled: true,
        intervalMinutes: 20,
        breakDurationMinutes: 5,
      },
      timeOfDayConstraints: {
        preferredStart: '09:00',
        preferredEnd: '17:00',
        avoidEarlyMorning: true,
        avoidLateEvening: true,
      },
      accessibilityBreaks: true,
    };
  }

  /**
   * Get default risk mitigation settings
   */
  private getDefaultRiskMitigationSettings(): RiskMitigationSettings {
    return {
      gamingDetection: {
        enabled: true,
        sensitivity: 'medium',
        interventionThreshold: 0.7,
      },
      assessmentAnxiety: {
        monitoringEnabled: true,
        supportResourcesAvailable: true,
        calmingTechniquesEnabled: true,
      },
      technicalFailure: {
        autoSaveFrequency: 30, // seconds
        redundantSystems: true,
        offlineCapability: false,
      },
      accessibilitySupport: {
        assistiveTechnologySupport: true,
        alternativeFormats: true,
        extendedTimeAllowance: 1.5,
      },
    };
  }

  /**
   * Validate the complete assessment configuration
   */
  private validateAssessmentConfiguration(): void {
    // Validate competency-duration alignment
    if (this.targetCompetencies.length > 7 && this.estimatedDuration < 60) {
      throw new Error(
        'Assessment duration too short for the number of target competencies',
      );
    }

    // Validate accessibility needs compatibility
    if (
      this.accessibilityNeeds.includes('extended_time') &&
      this.estimatedDuration > 180
    ) {
      throw new Error(
        'Extended time accessibility need would exceed maximum assessment duration',
      );
    }

    // Validate cultural context alignment
    if (
      this.culturalContext.region === 'uae' &&
      this.culturalContext.language === 'hindi'
    ) {
      throw new Error(
        'Language-region combination not supported (Hindi in UAE)',
      );
    }

    // Validate assessment type and goals alignment
    if (
      this.assessmentType === 'quick' &&
      this.assessmentGoals.some(
        (goal) => goal.type === 'comprehensive_analysis',
      )
    ) {
      throw new Error(
        'Quick assessment type incompatible with comprehensive analysis goals',
      );
    }
  }

  /**
   * Generate unique command identifier
   */
  private generateCommandId(): string {
    return `start-assessment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if this is a remediation assessment
   */
  public isRemediationAssessment(): boolean {
    return (
      this.assessmentType === 'remediation' ||
      this.assessmentGoals.some((goal) => goal.type === 'skill_gap_remediation')
    );
  }

  /**
   * Check if this is a comprehensive assessment
   */
  public isComprehensiveAssessment(): boolean {
    return (
      this.assessmentType === 'comprehensive' &&
      this.targetCompetencies.length >= 5
    );
  }

  /**
   * Check if this assessment requires special accommodations
   */
  public requiresSpecialAccommodations(): boolean {
    return (
      this.accessibilityNeeds.length > 0 ||
      this.culturalContext.culturalAdaptations.length > 2
    );
  }

  /**
   * Get the priority level for this assessment
   */
  public getPriorityLevel(): 'low' | 'normal' | 'high' | 'urgent' {
    if (
      this.assessmentType === 'diagnostic' ||
      this.isRemediationAssessment()
    ) {
      return 'high';
    }

    if (this.requiresSpecialAccommodations()) {
      return 'high';
    }

    return this.metadata.priority;
  }

  /**
   * Calculate complexity score for assessment planning
   */
  public getComplexityScore(): number {
    let score = 0;

    // Base complexity from competency count
    score += this.targetCompetencies.length * 0.1;

    // Assessment type complexity
    const typeComplexity = {
      quick: 0.2,
      standard: 0.5,
      comprehensive: 0.8,
      diagnostic: 1.0,
      remediation: 0.7,
      advanced: 0.9,
    };
    score += typeComplexity[this.assessmentType] || 0.5;

    // Accessibility needs complexity
    score += this.accessibilityNeeds.length * 0.1;

    // Cultural adaptation complexity
    score += this.culturalContext.culturalAdaptations.length * 0.05;

    return Math.min(score, 1.0); // Cap at 1.0
  }

  /**
   * Get expected assessment outcomes
   */
  public getExpectedOutcomes(): AssessmentExpectedOutcome[] {
    const outcomes: AssessmentExpectedOutcome[] = [];

    // CCIS level determination for each competency
    this.targetCompetencies.forEach((competency) => {
      outcomes.push({
        type: 'ccis_level_determination',
        competency: competency.getName(),
        expectedAccuracy: this.getExpectedAccuracy(),
        confidenceThreshold: 0.8,
      });
    });

    // Learning needs identification
    outcomes.push({
      type: 'learning_needs_identification',
      description: 'Specific learning gaps and intervention needs',
      expectedAccuracy: 0.85,
      confidenceThreshold: 0.75,
    });

    // Behavioral pattern analysis
    outcomes.push({
      type: 'behavioral_pattern_analysis',
      description: 'Learning preferences and behavioral signals',
      expectedAccuracy: 0.75,
      confidenceThreshold: 0.7,
    });

    return outcomes;
  }

  /**
   * Get expected accuracy based on assessment configuration
   */
  private getExpectedAccuracy(): number {
    let accuracy = 0.8; // Base accuracy

    // Assessment type adjustments
    if (this.assessmentType === 'comprehensive') accuracy += 0.1;
    if (this.assessmentType === 'diagnostic') accuracy += 0.05;
    if (this.assessmentType === 'quick') accuracy -= 0.1;

    // Duration adjustments
    if (this.estimatedDuration > 90) accuracy += 0.05;
    if (this.estimatedDuration < 30) accuracy -= 0.05;

    // Prior history availability
    if (this.priorAssessmentHistory) accuracy += 0.05;

    return Math.min(Math.max(accuracy, 0.6), 0.95); // Clamp between 60% and 95%
  }

  /**
   * Convert command to JSON for logging and audit
   */
  public toJSON(): Record<string, any> {
    return {
      commandId: this.metadata.commandId,
      personId: this.personId.getValue(),
      assessmentType: this.assessmentType,
      targetCompetencies: this.targetCompetencies.map((c) => c.getName()),
      estimatedDuration: this.estimatedDuration,
      culturalContext: this.culturalContext,
      accessibilityNeeds: this.accessibilityNeeds,
      learningPreferences: this.learningPreferences,
      assessmentGoals: this.assessmentGoals,
      priority: this.getPriorityLevel(),
      complexityScore: this.getComplexityScore(),
      expectedOutcomes: this.getExpectedOutcomes(),
      metadata: this.metadata,
      createdAt: this.metadata.requestedAt.toISOString(),
    };
  }
}

// Supporting types and interfaces

export type AssessmentType =
  | 'quick' // 15-30 minutes, basic competency overview
  | 'standard' // 45-60 minutes, balanced assessment
  | 'comprehensive' // 90-120 minutes, deep competency analysis
  | 'diagnostic' // 60-90 minutes, problem identification focus
  | 'remediation' // 30-60 minutes, targeted skill gap assessment
  | 'advanced'; // 90-120 minutes, high-level competency validation

export interface CulturalContext {
  region: 'india' | 'uae' | 'global';
  language: 'english' | 'hindi' | 'arabic' | 'tamil' | 'bengali';
  culturalAdaptations: string[];
  communicationStyle: 'formal' | 'informal' | 'mixed';
  learningCulture:
    | 'examination_oriented'
    | 'project_based'
    | 'collaborative'
    | 'individual';
}

export type AccessibilityNeed =
  | 'screen_reader'
  | 'high_contrast'
  | 'large_fonts'
  | 'keyboard_navigation'
  | 'extended_time'
  | 'frequent_breaks'
  | 'alternative_input'
  | 'captioned_content'
  | 'simplified_interface'
  | 'voice_commands';

export interface LearningPreferences {
  preferredModality: 'visual' | 'auditory' | 'kinesthetic' | 'multimodal';
  interactionStyle: 'guided' | 'exploratory' | 'structured' | 'flexible';
  feedbackFrequency: 'immediate' | 'moderate' | 'summary' | 'minimal';
  challengeLevel: 'low' | 'moderate' | 'high' | 'adaptive';
  supportLevel: 'minimal' | 'standard' | 'enhanced' | 'intensive';
}

export interface PriorAssessmentHistory {
  totalAssessments: number;
  averageCCISLevel: number;
  strongestCompetencies: CompetencyType[];
  developmentAreas: CompetencyType[];
  lastAssessmentDate: Date;
  progressTrend: 'improving' | 'stable' | 'declining';
  gamingIncidents: number;
  interventionsReceived: number;
}

export interface AssessmentGoal {
  type:
    | 'competency_baseline'
    | 'learning_needs_identification'
    | 'progress_tracking'
    | 'skill_gap_remediation'
    | 'advancement_readiness'
    | 'personalization_data'
    | 'comprehensive_analysis';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  metrics: string[];
  successCriteria?: string[];
}

export interface SchedulingConstraints {
  maxSessionDuration: number; // minutes
  breakRequirements: {
    enabled: boolean;
    intervalMinutes: number;
    breakDurationMinutes: number;
  };
  timeOfDayConstraints: {
    preferredStart: string; // HH:MM format
    preferredEnd: string; // HH:MM format
    avoidEarlyMorning: boolean;
    avoidLateEvening: boolean;
  };
  accessibilityBreaks: boolean;
}

export interface StakeholderNotification {
  stakeholderType:
    | 'educator'
    | 'mentor'
    | 'parent'
    | 'supervisor'
    | 'specialist';
  stakeholderId: string;
  notificationTiming:
    | 'before_start'
    | 'after_completion'
    | 'on_issues'
    | 'progress_updates';
  notificationMethod: 'email' | 'sms' | 'in_app' | 'dashboard';
  includeDetails: boolean;
}

export interface RiskMitigationSettings {
  gamingDetection: {
    enabled: boolean;
    sensitivity: 'low' | 'medium' | 'high';
    interventionThreshold: number; // 0-1
  };
  assessmentAnxiety: {
    monitoringEnabled: boolean;
    supportResourcesAvailable: boolean;
    calmingTechniquesEnabled: boolean;
  };
  technicalFailure: {
    autoSaveFrequency: number; // seconds
    redundantSystems: boolean;
    offlineCapability: boolean;
  };
  accessibilitySupport: {
    assistiveTechnologySupport: boolean;
    alternativeFormats: boolean;
    extendedTimeAllowance: number; // multiplier
  };
}

export interface AssessmentMetadata {
  commandId: string;
  requestedAt: Date;
  requestSource:
    | 'direct'
    | 'scheduled'
    | 'triggered'
    | 'remediation'
    | 'placement';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  version: string;
  correlationId?: string;
}

export interface AssessmentExpectedOutcome {
  type:
    | 'ccis_level_determination'
    | 'learning_needs_identification'
    | 'behavioral_pattern_analysis'
    | 'skill_gap_analysis'
    | 'intervention_recommendations'
    | 'personalization_profile';
  competency?: string;
  description?: string;
  expectedAccuracy: number; // 0-1
  confidenceThreshold: number; // 0-1
}

export interface StartAssessmentCommandParams {
  personId: PersonID;
  assessmentType: AssessmentType;
  targetCompetencies?: CompetencyType[];
  estimatedDuration?: number;
  culturalContext?: CulturalContext;
  accessibilityNeeds?: AccessibilityNeed[];
  learningPreferences?: LearningPreferences;
  priorAssessmentHistory?: PriorAssessmentHistory;
  assessmentGoals?: AssessmentGoal[];
  schedulingConstraints?: SchedulingConstraints;
  stakeholderNotifications?: StakeholderNotification[];
  riskMitigationSettings?: RiskMitigationSettings;
  requestSource?:
    | 'direct'
    | 'scheduled'
    | 'triggered'
    | 'remediation'
    | 'placement';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  correlationId?: string;
}
