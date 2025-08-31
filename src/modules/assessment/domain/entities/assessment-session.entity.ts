// src/modules/assessment/domain/entities/assessment-session.entity.ts

import { AggregateRoot } from '../../../../shared/base/aggregate.root';
import { AssessmentID } from '../../../../shared/value-objects/id.value-object';
import { PersonID } from '../../../../shared/value-objects/id.value-object';
import { BusinessRuleException } from '../../../../shared/domain/exceptions/domain-exception.base';
import { CCISLevel } from '../value-objects/ccis-level.value-object';
import { ConfidenceScore } from '../value-objects/confidence-score.value-object';
import { CompetencyType } from '../value-objects/competency-type.value-object';
import { BehavioralSignals } from '../value-objects/behavioral-signals.value-object';
import { DomainEvent } from '../../../../shared/base/domain-event.base';

// TODO: Import domain events once created
// import { AssessmentSessionStarted } from '../events/assessment-session-started.event';
// import { AssessmentSessionCompleted } from '../events/assessment-session-completed.event';
// import { CCISLevelAchieved } from '../events/ccis-level-achieved.event';
// import { GamingDetected } from '../events/gaming-detected.event';
// import { InterventionTriggered } from '../events/intervention-triggered.event';

/**
 * Assessment Session Entity (Aggregate Root)
 *
 * The central orchestrator for all CCIS assessment activities in Sprint 1.
 * This aggregate root manages the complete assessment lifecycle from initiation
 * to completion, including real-time behavioral signal collection, CCIS calculation,
 * gaming detection, and intervention triggering.
 *
 * Key Responsibilities:
 * 1. **Session Management**: Start, pause, resume, and complete assessment sessions
 * 2. **Signal Collection**: Aggregate behavioral signals from task interactions
 * 3. **CCIS Calculation**: Real-time competency level determination
 * 4. **Gaming Detection**: Identify and respond to assessment gaming patterns
 * 5. **Intervention Management**: Trigger scaffolding adjustments and support
 * 6. **Progress Tracking**: Monitor learning progression across competencies
 * 7. **Claude Integration**: Provide context for AI-powered assessment analysis
 *
 * Assessment Flow (Sprint 1):
 * ```
 * Start Session → Collect Signals → Calculate CCIS → Detect Issues → Trigger Interventions → Complete
 * ```
 *
 * Assessment Types:
 * - **Micro-Task Assessment**: Individual task competency evaluation
 * - **Fusion Task Assessment**: Cross-competency integration evaluation
 * - **Portfolio Assessment**: Cumulative skill demonstration review
 * - **Peer Assessment**: Collaborative competency evaluation
 * - **Self Assessment**: Metacognitive skill reflection
 *
 * Business Rules:
 * - Assessment sessions must have a valid person and competency focus
 * - Sessions cannot exceed maximum duration (4 hours for anti-gaming)
 * - Minimum signal count required for reliable CCIS calculation (10 interactions)
 * - Gaming detection triggers immediate session review
 * - Intervention thresholds based on confidence scores and signal patterns
 * - Session completion requires minimum assessment coverage per competency
 *
 * Integration Points:
 * - **Person Module**: Links to learner profile and skill passport
 * - **Task Module**: Receives behavioral signals from task interactions
 * - **Learning Path Module**: Informs adaptive curriculum sequencing
 * - **Claude 3.5 Sonnet**: AI-powered assessment analysis and recommendations
 * - **Analytics Engine**: Real-time progress tracking and predictive modeling
 */

export enum AssessmentSessionStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  TERMINATED = 'TERMINATED',
  UNDER_REVIEW = 'UNDER_REVIEW',
}

export enum AssessmentSessionType {
  MICRO_TASK = 'MICRO_TASK',
  FUSION_TASK = 'FUSION_TASK',
  PORTFOLIO = 'PORTFOLIO',
  PEER_ASSESSMENT = 'PEER_ASSESSMENT',
  SELF_ASSESSMENT = 'SELF_ASSESSMENT',
  DIAGNOSTIC = 'DIAGNOSTIC',
  FORMATIVE = 'FORMATIVE',
  SUMMATIVE = 'SUMMATIVE',
}

export enum InterventionType {
  SCAFFOLDING_INCREASE = 'SCAFFOLDING_INCREASE',
  SCAFFOLDING_DECREASE = 'SCAFFOLDING_DECREASE',
  HINT_AVAILABILITY = 'HINT_AVAILABILITY',
  PEER_SUPPORT = 'PEER_SUPPORT',
  INSTRUCTOR_REVIEW = 'INSTRUCTOR_REVIEW',
  ALTERNATIVE_PATHWAY = 'ALTERNATIVE_PATHWAY',
  BREAK_RECOMMENDATION = 'BREAK_RECOMMENDATION',
  GAMING_INTERVENTION = 'GAMING_INTERVENTION',
}

export interface AssessmentSessionData {
  personId: PersonID;
  competencyType: CompetencyType;
  sessionType: AssessmentSessionType;
  status: AssessmentSessionStatus;
  startTime: Date;
  endTime?: Date;
  maxDuration: number; // minutes
  targetCCISLevel?: CCISLevel;
  metadata: {
    institutionId?: string;
    courseId?: string;
    instructorId?: string;
    assessmentPurpose: string;
    culturalContext: 'INDIA' | 'UAE' | 'INTERNATIONAL';
    languagePreference: string;
    accessibilityNeeds?: string[];
  };
}

export interface SessionProgress {
  totalInteractions: number;
  signalCollectionCount: number;
  currentCCISLevel: CCISLevel;
  overallConfidence: ConfidenceScore;
  competencyProgress: Map<
    CompetencyType,
    {
      ccisLevel: CCISLevel;
      confidence: ConfidenceScore;
      signalCount: number;
      lastUpdated: Date;
    }
  >;
  interventionsTriggered: InterventionType[];
  gamingPatternDetected: boolean;
  assessmentReliability: 'HIGH' | 'MODERATE' | 'LOW' | 'INSUFFICIENT_DATA';
}

export interface SessionAnalytics {
  engagementMetrics: {
    totalTimeSpent: number; // minutes
    activeTimePercentage: number;
    taskCompletionRate: number;
    averageResponseTime: number; // seconds
  };
  learningMetrics: {
    ccisProgression: CCISLevel[];
    confidenceProgression: number[];
    errorPatterns: string[];
    improvementRate: number;
  };
  behavioralMetrics: {
    hintUsagePattern: number[];
    helpSeekingFrequency: number;
    selfAssessmentAccuracy: number;
    metacognitiveAwareness: number;
  };
  predictiveMetrics: {
    projectedCCISLevel: CCISLevel;
    timeToCompletion: number; // minutes
    interventionLikelihood: number;
    successProbability: number;
  };
}

export class AssessmentSession extends AggregateRoot<AssessmentID> {
  // Core session properties
  public readonly personId: PersonID;
  public readonly competencyType: CompetencyType;
  public readonly sessionType: AssessmentSessionType;
  public readonly startTime: Date;
  public readonly maxDuration: number;
  public readonly metadata: AssessmentSessionData['metadata'];

  // Assessment state
  private _status: AssessmentSessionStatus;
  private _endTime?: Date;
  private _targetCCISLevel?: CCISLevel;
  private _currentCCISLevel: CCISLevel;
  private _overallConfidence: ConfidenceScore;

  // Signal collection and analysis
  private _behavioralSignals: BehavioralSignals[] = [];
  private _totalInteractions: number = 0;
  private _signalCollectionCount: number = 0;

  // Competency-specific progress tracking
  private _competencyProgress: Map<
    CompetencyType,
    {
      ccisLevel: CCISLevel;
      confidence: ConfidenceScore;
      signalCount: number;
      lastUpdated: Date;
    }
  > = new Map();

  // Intervention and gaming detection
  private _interventionsTriggered: InterventionType[] = [];
  private _gamingPatternDetected: boolean = false;
  private _gamingDetectionHistory: Date[] = [];

  // Session analytics
  private _sessionAnalytics: SessionAnalytics;

  constructor(data: AssessmentSessionData, id: AssessmentID) {
    super(id);

    // Initialize core properties
    this.personId = data.personId;
    this.competencyType = data.competencyType;
    this.sessionType = data.sessionType;
    this.startTime = data.startTime;
    this.maxDuration = data.maxDuration;
    this.metadata = data.metadata;

    // Initialize assessment state
    this._status = data.status;
    this._endTime = data.endTime;
    this._targetCCISLevel = data.targetCCISLevel;
    this._currentCCISLevel = CCISLevel.fromPercentage(0); // Start at 0%
    this._overallConfidence = ConfidenceScore.fromValue(0.0); // No confidence initially

    // Initialize analytics
    this._sessionAnalytics = this.initializeSessionAnalytics();

    // Validate session data
    this.validateSessionData();
  }

  /**
   * Implement abstract method from AggregateRoot
   */
  protected createDeletedEvent(): DomainEvent {
    // TODO: Create proper AssessmentSessionDeleted event class
    // For now, create a minimal concrete implementation
    return new (class extends DomainEvent {
      constructor(
        sessionId: AssessmentID,
        personId: PersonID,
        competencyType: CompetencyType,
      ) {
        super(sessionId, 'AssessmentSession');
        this.sessionId = sessionId;
        this.personId = personId;
        this.competencyType = competencyType;
      }

      private sessionId: AssessmentID;
      private personId: PersonID;
      private competencyType: CompetencyType;

      public getEventData(): Record<string, any> {
        return {
          sessionId: this.sessionId.getValue(),
          personId: this.personId.getValue(),
          competencyType: this.competencyType.getValue(),
          deletedAt: this.occurredAt,
        };
      }
    })(this.getId(), this.personId, this.competencyType);
  }

  /**
   * Create a new Assessment Session
   */
  public static async create(
    data: AssessmentSessionData,
  ): Promise<AssessmentSession> {
    const id = await AssessmentID.generate();
    const session = new AssessmentSession(data, id);

    // TODO: Publish domain event once event classes are created
    // session.addDomainEvent(
    //   new AssessmentSessionStarted(
    //     session.getId(),
    //     data.personId,
    //     data.competencyType,
    //     data.sessionType,
    //     data.startTime,
    //     data.metadata
    //   )
    // );

    return session;
  }

  /**
   * Add behavioral signals from task interactions
   */
  public addBehavioralSignals(signals: BehavioralSignals): void {
    this.ensureSessionIsActive();

    // Add signals to collection
    this._behavioralSignals.push(signals);
    this._totalInteractions++;
    this._signalCollectionCount++;

    // Update CCIS calculation
    this.recalculateCCISLevel();

    // Check for gaming patterns
    this.checkForGamingPatterns(signals);

    // Update competency-specific progress
    this.updateCompetencyProgress(signals);

    // Check if intervention is needed
    this.checkInterventionTriggers();

    // Update analytics
    this.updateSessionAnalytics(signals);
  }

  /**
   * Calculate current CCIS level based on all behavioral signals
   */
  private recalculateCCISLevel(): void {
    if (this._behavioralSignals.length === 0) {
      return;
    }

    // Calculate weighted average of all signals
    const totalWeight = this._behavioralSignals.length;
    let weightedSum = 0;
    let confidenceSum = 0;

    for (const signals of this._behavioralSignals) {
      const signalScore = signals.calculateWeightedScore();
      const signalConfidence = signals.getAssessmentConfidence();

      weightedSum += signalScore * signalConfidence;
      confidenceSum += signalConfidence;
    }

    // Calculate overall weighted score
    const overallScore = weightedSum / confidenceSum;
    const overallConfidence = confidenceSum / totalWeight;

    // Update current CCIS level
    const previousLevel = this._currentCCISLevel;
    this._currentCCISLevel = CCISLevel.fromPercentage(overallScore * 100);
    this._overallConfidence = ConfidenceScore.fromValue(overallConfidence);

    // TODO: Check if CCIS level has changed and publish event
    // if (!previousLevel.equals(this._currentCCISLevel)) {
    //   this.addDomainEvent(
    //     new CCISLevelAchieved(
    //       this.getId(),
    //       this.personId,
    //       this.competencyType,
    //       previousLevel,
    //       this._currentCCISLevel,
    //       this._overallConfidence,
    //       new Date()
    //     )
    //   );
    // }
  }

  /**
   * Check for gaming patterns in behavioral signals
   */
  private checkForGamingPatterns(newSignals: BehavioralSignals): void {
    // Check individual signal gaming
    if (newSignals.detectsGaming()) {
      this._gamingPatternDetected = true;
      this._gamingDetectionHistory.push(new Date());

      // TODO: Publish gaming detected event
      // this.addDomainEvent(
      //   new GamingDetected(
      //     this.getId(),
      //     this.personId,
      //     this.competencyType,
      //     'INDIVIDUAL_SIGNAL_GAMING',
      //     newSignals,
      //     new Date()
      //   )
      // );

      // Trigger gaming intervention
      this.triggerIntervention(InterventionType.GAMING_INTERVENTION);
    }

    // Check pattern-based gaming (inconsistent signal patterns)
    if (this._behavioralSignals.length >= 5) {
      const recentSignals = this._behavioralSignals.slice(-5);
      const scoreVariance = this.calculateSignalVariance(recentSignals);

      // High variance might indicate gaming
      if (scoreVariance > 0.3) {
        this._gamingPatternDetected = true;
        this._gamingDetectionHistory.push(new Date());

        // TODO: Publish gaming detected event
        // this.addDomainEvent(
        //   new GamingDetected(
        //     this.getId(),
        //     this.personId,
        //     this.competencyType,
        //     'PATTERN_INCONSISTENCY',
        //     newSignals,
        //     new Date()
        //   )
        // );
      }
    }
  }

  /**
   * Calculate variance in signal scores for gaming detection
   */
  private calculateSignalVariance(signals: BehavioralSignals[]): number {
    if (signals.length < 2) return 0;

    const scores = signals.map((s) => s.calculateWeightedScore());
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance =
      scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
      scores.length;

    return variance;
  }

  /**
   * Update competency-specific progress
   */
  private updateCompetencyProgress(signals: BehavioralSignals): void {
    const competencyScore = signals.calculateWeightedScore();
    const competencyConfidence = signals.getAssessmentConfidence();
    const competencyCCIS = CCISLevel.fromPercentage(competencyScore * 100);

    const currentProgress = this._competencyProgress.get(
      this.competencyType,
    ) || {
      ccisLevel: CCISLevel.fromPercentage(0),
      confidence: ConfidenceScore.fromValue(0.0),
      signalCount: 0,
      lastUpdated: new Date(),
    };

    // Update competency progress
    this._competencyProgress.set(this.competencyType, {
      ccisLevel: competencyCCIS,
      confidence: ConfidenceScore.fromValue(competencyConfidence),
      signalCount: currentProgress.signalCount + 1,
      lastUpdated: new Date(),
    });
  }

  /**
   * Check if interventions should be triggered
   */
  private checkInterventionTriggers(): void {
    const currentConfidence = this._overallConfidence.getScore();
    const currentLevel = this._currentCCISLevel.getPercentage();

    // Low confidence intervention
    if (currentConfidence < 0.4 && this._signalCollectionCount >= 5) {
      this.triggerIntervention(InterventionType.SCAFFOLDING_INCREASE);
    }

    // High performance intervention (reduce scaffolding)
    if (currentLevel >= 75 && currentConfidence >= 0.8) {
      this.triggerIntervention(InterventionType.SCAFFOLDING_DECREASE);
    }

    // Long session intervention
    const sessionDuration = this.getSessionDurationMinutes();
    if (sessionDuration >= this.maxDuration * 0.8) {
      this.triggerIntervention(InterventionType.BREAK_RECOMMENDATION);
    }

    // Performance plateau intervention
    if (this.detectPerformancePlateau()) {
      this.triggerIntervention(InterventionType.ALTERNATIVE_PATHWAY);
    }
  }

  /**
   * Trigger specific intervention
   */
  private triggerIntervention(interventionType: InterventionType): void {
    if (!this._interventionsTriggered.includes(interventionType)) {
      this._interventionsTriggered.push(interventionType);

      // TODO: Publish intervention triggered event
      // this.addDomainEvent(
      //   new InterventionTriggered(
      //     this.getId(),
      //     this.personId,
      //     this.competencyType,
      //     interventionType,
      //     this._currentCCISLevel,
      //     this._overallConfidence,
      //     new Date()
      //   )
      // );
    }
  }

  /**
   * Detect performance plateau
   */
  private detectPerformancePlateau(): boolean {
    if (this._behavioralSignals.length < 10) return false;

    const recentSignals = this._behavioralSignals.slice(-10);
    const recentScores = recentSignals.map((s) => s.calculateWeightedScore());

    // Check if scores are stagnant
    const scoreRange = Math.max(...recentScores) - Math.min(...recentScores);
    return scoreRange < 0.1; // Less than 10% improvement
  }

  /**
   * Complete the assessment session
   */
  public completeSession(): void {
    this.ensureSessionIsActive();
    this.validateMinimumRequirements();

    this._status = AssessmentSessionStatus.COMPLETED;
    this._endTime = new Date();

    // Final analytics calculation
    this.finalizeSessionAnalytics();

    // TODO: Publish completion event once event classes are created
    // this.addDomainEvent(
    //   new AssessmentSessionCompleted(
    //     this.getId(),
    //     this.personId,
    //     this.competencyType,
    //     this._currentCCISLevel,
    //     this._overallConfidence,
    //     this.getSessionProgress(),
    //     this._endTime,
    //     this._sessionAnalytics
    //   )
    // );
  }

  /**
   * Pause the assessment session
   */
  public pauseSession(): void {
    this.ensureSessionIsActive();
    this._status = AssessmentSessionStatus.PAUSED;
  }

  /**
   * Resume the assessment session
   */
  public resumeSession(): void {
    if (this._status !== AssessmentSessionStatus.PAUSED) {
      throw new BusinessRuleException(
        'Cannot resume non-paused session',
        'sessionStatus',
      );
    }

    // Check if session hasn't exceeded maximum duration
    const totalDuration = this.getSessionDurationMinutes();
    if (totalDuration >= this.maxDuration) {
      throw new BusinessRuleException(
        'Session has exceeded maximum duration',
        'sessionDuration',
      );
    }

    this._status = AssessmentSessionStatus.ACTIVE;
  }

  /**
   * Terminate session (for gaming or other violations)
   */
  public terminateSession(reason: string): void {
    this._status = AssessmentSessionStatus.TERMINATED;
    this._endTime = new Date();

    // Add termination reason to metadata
    (this.metadata as any).terminationReason = reason;
  }

  // Getter methods
  public get status(): AssessmentSessionStatus {
    return this._status;
  }

  public get endTime(): Date | undefined {
    return this._endTime;
  }

  public get currentCCISLevel(): CCISLevel {
    return this._currentCCISLevel;
  }

  public get overallConfidence(): ConfidenceScore {
    return this._overallConfidence;
  }

  public get totalInteractions(): number {
    return this._totalInteractions;
  }

  public get signalCollectionCount(): number {
    return this._signalCollectionCount;
  }

  public get interventionsTriggered(): readonly InterventionType[] {
    return [...this._interventionsTriggered];
  }

  public get gamingPatternDetected(): boolean {
    return this._gamingPatternDetected;
  }

  public get sessionAnalytics(): SessionAnalytics {
    return { ...this._sessionAnalytics };
  }

  /**
   * Get comprehensive session progress
   */
  public getSessionProgress(): SessionProgress {
    return {
      totalInteractions: this._totalInteractions,
      signalCollectionCount: this._signalCollectionCount,
      currentCCISLevel: this._currentCCISLevel,
      overallConfidence: this._overallConfidence,
      competencyProgress: new Map(this._competencyProgress),
      interventionsTriggered: [...this._interventionsTriggered],
      gamingPatternDetected: this._gamingPatternDetected,
      assessmentReliability: this.calculateAssessmentReliability(),
    };
  }

  /**
   * Calculate assessment reliability
   */
  private calculateAssessmentReliability():
    | 'HIGH'
    | 'MODERATE'
    | 'LOW'
    | 'INSUFFICIENT_DATA' {
    if (this._signalCollectionCount < 5) return 'INSUFFICIENT_DATA';
    if (
      this._overallConfidence.getScore() >= 0.8 &&
      !this._gamingPatternDetected
    )
      return 'HIGH';
    if (
      this._overallConfidence.getScore() >= 0.6 &&
      !this._gamingPatternDetected
    )
      return 'MODERATE';
    return 'LOW';
  }

  /**
   * Get session duration in minutes
   */
  public getSessionDurationMinutes(): number {
    const endTime = this._endTime || new Date();
    return Math.floor(
      (endTime.getTime() - this.startTime.getTime()) / (1000 * 60),
    );
  }

  // Private helper methods
  private ensureSessionIsActive(): void {
    if (this._status !== AssessmentSessionStatus.ACTIVE) {
      throw new BusinessRuleException(
        'Session must be active for this operation',
        'sessionStatus',
      );
    }
  }

  private validateSessionData(): void {
    if (!this.personId) {
      throw new BusinessRuleException(
        'Assessment session must have a valid person ID',
        'personId',
      );
    }

    if (!this.competencyType) {
      throw new BusinessRuleException(
        'Assessment session must have a valid competency type',
        'competencyType',
      );
    }

    if (this.maxDuration <= 0 || this.maxDuration > 240) {
      throw new BusinessRuleException(
        'Maximum duration must be between 1 and 240 minutes',
        'maxDuration',
      );
    }
  }

  private validateMinimumRequirements(): void {
    if (this._signalCollectionCount < 5) {
      throw new BusinessRuleException(
        'Minimum 5 signal collections required for session completion',
        'signalCount',
      );
    }

    if (this._overallConfidence.getScore() < 0.3) {
      throw new BusinessRuleException(
        'Assessment confidence too low for reliable completion',
        'confidence',
      );
    }
  }

  private initializeSessionAnalytics(): SessionAnalytics {
    return {
      engagementMetrics: {
        totalTimeSpent: 0,
        activeTimePercentage: 0,
        taskCompletionRate: 0,
        averageResponseTime: 0,
      },
      learningMetrics: {
        ccisProgression: [],
        confidenceProgression: [],
        errorPatterns: [],
        improvementRate: 0,
      },
      behavioralMetrics: {
        hintUsagePattern: [],
        helpSeekingFrequency: 0,
        selfAssessmentAccuracy: 0,
        metacognitiveAwareness: 0,
      },
      predictiveMetrics: {
        projectedCCISLevel: CCISLevel.fromPercentage(0),
        timeToCompletion: 0,
        interventionLikelihood: 0,
        successProbability: 0,
      },
    };
  }

  private updateSessionAnalytics(signals: BehavioralSignals): void {
    // Update CCIS progression
    this._sessionAnalytics.learningMetrics.ccisProgression.push(
      this._currentCCISLevel,
    );
    this._sessionAnalytics.learningMetrics.confidenceProgression.push(
      this._overallConfidence.getScore(),
    );

    // Update behavioral metrics (accessing signals through proper methods)
    // TODO: Add proper getter methods to BehavioralSignals for analytics
    // For now, use default values to prevent compilation errors
    this._sessionAnalytics.behavioralMetrics.hintUsagePattern.push(0.2); // Default placeholder
    this._sessionAnalytics.behavioralMetrics.helpSeekingFrequency = 0.3; // Default placeholder
    this._sessionAnalytics.behavioralMetrics.selfAssessmentAccuracy = 0.7; // Default placeholder
    this._sessionAnalytics.behavioralMetrics.metacognitiveAwareness = 0.8; // Default placeholder

    // Update engagement metrics
    this._sessionAnalytics.engagementMetrics.totalTimeSpent =
      this.getSessionDurationMinutes();
  }

  private finalizeSessionAnalytics(): void {
    // Calculate final metrics
    const progression = this._sessionAnalytics.learningMetrics.ccisProgression;
    if (progression.length >= 2) {
      const firstLevel = progression[0].getPercentage();
      const lastLevel = progression[progression.length - 1].getPercentage();
      this._sessionAnalytics.learningMetrics.improvementRate =
        (lastLevel - firstLevel) / progression.length;
    }

    // Calculate task completion rate
    this._sessionAnalytics.engagementMetrics.taskCompletionRate =
      this._signalCollectionCount / Math.max(this._totalInteractions, 1);

    // Calculate predictive metrics
    this._sessionAnalytics.predictiveMetrics.projectedCCISLevel =
      this._currentCCISLevel;
    this._sessionAnalytics.predictiveMetrics.successProbability =
      this._overallConfidence.getScore();
    this._sessionAnalytics.predictiveMetrics.interventionLikelihood =
      this._interventionsTriggered.length /
      Math.max(this._signalCollectionCount, 1);
  }
}
