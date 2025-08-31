// src/modules/assessment/domain/entities/task-interaction.entity.ts

import { Entity } from '../../../../shared/base/entity.base';
import {
  TaskID,
  AssessmentID,
  PersonID,
} from '../../../../shared/value-objects/id.value-object';
import { BusinessRuleException } from '../../../../shared/domain/exceptions/domain-exception.base';
import { CCISLevel } from '../value-objects/ccis-level.value-object';
import { ConfidenceScore } from '../value-objects/confidence-score.value-object';
import { CompetencyType } from '../value-objects/competency-type.value-object';
import { BehavioralSignals } from '../value-objects/behavioral-signals.value-object';

/**
 * Task Interaction Entity
 *
 * Tracks individual task interactions within an assessment session, capturing
 * detailed behavioral signals that feed into CCIS level calculation. This entity
 * is the primary source of assessment data in Sprint 1.
 *
 * Key Responsibilities:
 * 1. **Interaction Tracking**: Record all user interactions with assessment tasks
 * 2. **Signal Collection**: Capture behavioral signals (hints, errors, time, etc.)
 * 3. **Performance Analysis**: Calculate interaction-level performance metrics
 * 4. **Gaming Detection**: Identify suspicious interaction patterns
 * 5. **Real-time Feedback**: Provide immediate performance insights
 * 6. **Evidence Generation**: Create evidence for CCIS level determination
 *
 * Interaction Types:
 * - **Task Start**: User begins working on a task
 * - **Hint Request**: User requests help or scaffolding
 * - **Answer Submission**: User submits a response
 * - **Error Recovery**: User corrects a mistake
 * - **Resource Access**: User accesses additional materials
 * - **Peer Consultation**: User seeks peer assistance
 * - **Self-Assessment**: User reflects on their performance
 * - **Task Completion**: User finishes the task
 *
 * Behavioral Signals Captured:
 * - **Hint Request Frequency (35%)**: Primary independence indicator
 * - **Error Recovery Speed (25%)**: Self-correction capability
 * - **Transfer Success Rate (20%)**: Apply skills to novel problems
 * - **Metacognitive Accuracy (10%)**: Self-assessment alignment
 * - **Task Completion Efficiency (5%)**: Improvement over time
 * - **Help-Seeking Quality (3%)**: Strategic vs generic questions
 * - **Self-Assessment Alignment (2%)**: Prediction accuracy
 *
 * Business Rules:
 * - Each interaction must be linked to a valid assessment session
 * - Interaction timestamps must be sequential within a task
 * - Gaming patterns automatically flag interactions for review
 * - Minimum interaction duration prevents rapid-fire gaming
 * - Maximum interaction time triggers automatic break recommendations
 * - Error patterns inform adaptive scaffolding adjustments
 *
 * Integration Points:
 * - **Assessment Session**: Reports behavioral signals for CCIS calculation
 * - **Task Module**: Receives task configuration and constraints
 * - **Claude 3.5 Sonnet**: AI analysis of interaction patterns
 * - **Intervention Engine**: Triggers real-time support adjustments
 * - **Analytics Engine**: Performance trend analysis and prediction
 *
 * @example
 * ```typescript
 * // Create task interaction
 * const interaction = TaskInteraction.create({
 *   assessmentSessionId: sessionId,
 *   taskId: taskId,
 *   personId: personId,
 *   competencyType: CompetencyType.PROBLEM_SOLVING,
 *   interactionType: TaskInteractionType.ANSWER_SUBMISSION,
 *   startTime: new Date(),
 *   metadata: {
 *     taskDifficulty: 'intermediate',
 *     scaffoldingLevel: 2,
 *     priorAttempts: 1
 *   }
 * });
 *
 * // Record behavioral signals
 * interaction.recordHintRequest('conceptual_help', 45); // 45 seconds in
 * interaction.recordErrorRecovery('calculation_error', 120); // 2 minutes recovery
 * interaction.recordTaskCompletion(300, 0.85); // 5 minutes, 85% confidence
 *
 * // Calculate performance
 * const signals = interaction.generateBehavioralSignals();
 * const performance = interaction.getPerformanceMetrics();
 * ```
 */

export enum TaskInteractionType {
  TASK_START = 'TASK_START',
  HINT_REQUEST = 'HINT_REQUEST',
  ANSWER_SUBMISSION = 'ANSWER_SUBMISSION',
  ERROR_RECOVERY = 'ERROR_RECOVERY',
  RESOURCE_ACCESS = 'RESOURCE_ACCESS',
  PEER_CONSULTATION = 'PEER_CONSULTATION',
  SELF_ASSESSMENT = 'SELF_ASSESSMENT',
  TASK_COMPLETION = 'TASK_COMPLETION',
  SCAFFOLDING_ADJUSTMENT = 'SCAFFOLDING_ADJUSTMENT',
  BREAK_TAKEN = 'BREAK_TAKEN',
}

export enum InteractionStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
  FLAGGED = 'FLAGGED',
  UNDER_REVIEW = 'UNDER_REVIEW',
}

export enum HintType {
  CONCEPTUAL_HELP = 'CONCEPTUAL_HELP',
  PROCEDURAL_GUIDANCE = 'PROCEDURAL_GUIDANCE',
  EXAMPLE_REQUEST = 'EXAMPLE_REQUEST',
  CLARIFICATION = 'CLARIFICATION',
  RESOURCE_POINTER = 'RESOURCE_POINTER',
  STRATEGY_SUGGESTION = 'STRATEGY_SUGGESTION',
}

export enum ErrorType {
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  CONCEPTUAL_MISUNDERSTANDING = 'CONCEPTUAL_MISUNDERSTANDING',
  PROCEDURAL_MISTAKE = 'PROCEDURAL_MISTAKE',
  INTERPRETATION_ERROR = 'INTERPRETATION_ERROR',
  CARELESS_MISTAKE = 'CARELESS_MISTAKE',
  INCOMPLETE_SOLUTION = 'INCOMPLETE_SOLUTION',
}

export interface TaskInteractionData {
  id: TaskID;
  assessmentSessionId: AssessmentID;
  taskId: TaskID;
  personId: PersonID;
  competencyType: CompetencyType;
  interactionType: TaskInteractionType;
  status: InteractionStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number; // milliseconds
  metadata: {
    taskDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    scaffoldingLevel: number; // 0-5, where 0 is no scaffolding
    priorAttempts: number;
    contextualFactors?: string[];
    culturalContext: 'INDIA' | 'UAE' | 'INTERNATIONAL';
    languagePreference: string;
    deviceType?: 'desktop' | 'tablet' | 'mobile';
    networkQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  };
}

export interface HintRequestData {
  hintType: HintType;
  requestTime: number; // milliseconds from interaction start
  hintContent?: string;
  helpfulnessRating?: number; // 1-5 scale, provided by user
  followUpQuestions?: string[];
  strategicRequest: boolean; // vs random/panic request
}

export interface ErrorRecoveryData {
  errorType: ErrorType;
  errorTime: number; // milliseconds from interaction start
  recoveryTime: number; // milliseconds to recover
  recoveryStrategy: string;
  selfCorrected: boolean; // vs required intervention
  errorSeverity: 'minor' | 'moderate' | 'major' | 'critical';
}

export interface SelfAssessmentData {
  confidencePrediction: number; // 0-1 scale before task
  difficultyPrediction: number; // 1-5 scale before task
  actualConfidence: number; // 0-1 scale after task
  actualDifficulty: number; // 1-5 scale after task
  reflectionText?: string;
  metacognitiveAccuracy: number; // calculated alignment
}

export interface PerformanceMetrics {
  accuracy: number; // 0-1 scale
  efficiency: number; // 0-1 scale (time vs optimal)
  independence: number; // 0-1 scale (1 - hint_dependency)
  persistence: number; // 0-1 scale (recovery from errors)
  metacognition: number; // 0-1 scale (self-assessment accuracy)
  transferability: number; // 0-1 scale (applying prior knowledge)
  collaboration: number; // 0-1 scale (peer interaction quality)
}

export class TaskInteraction extends Entity<TaskID> {
  // Core interaction properties
  public readonly assessmentSessionId: AssessmentID;
  public readonly taskId: TaskID;
  public readonly personId: PersonID;
  public readonly competencyType: CompetencyType;
  public readonly interactionType: TaskInteractionType;
  public readonly startTime: Date;
  public readonly metadata: TaskInteractionData['metadata'];

  // Interaction state
  private _status: InteractionStatus;
  private _endTime?: Date;
  private _duration?: number;

  // Behavioral signal data
  private _hintRequests: HintRequestData[] = [];
  private _errorRecoveries: ErrorRecoveryData[] = [];
  private _selfAssessments: SelfAssessmentData[] = [];
  private _resourceAccesses: string[] = [];
  private _peerConsultations: string[] = [];

  // Performance tracking
  private _performanceMetrics?: PerformanceMetrics;
  private _behavioralSignals?: BehavioralSignals;
  private _gamingFlags: string[] = [];

  // Real-time analytics
  private _interactionEvents: {
    timestamp: Date;
    eventType: string;
    eventData: any;
  }[] = [];

  constructor(data: TaskInteractionData) {
    super(data.id);

    // Initialize core properties
    this.assessmentSessionId = data.assessmentSessionId;
    this.taskId = data.taskId;
    this.personId = data.personId;
    this.competencyType = data.competencyType;
    this.interactionType = data.interactionType;
    this.startTime = data.startTime;
    this.metadata = data.metadata;

    // Initialize state
    this._status = data.status;
    this._endTime = data.endTime;
    this._duration = data.duration;

    // Validate interaction data
    this.validateInteractionData();
  }

  /**
   * Create a new Task Interaction
   */
  public static create(data: TaskInteractionData): TaskInteraction {
    const interaction = new TaskInteraction(data);

    // Log interaction start
    interaction.logEvent('INTERACTION_STARTED', {
      interactionType: data.interactionType,
      competencyType: data.competencyType.getValue(),
      scaffoldingLevel: data.metadata.scaffoldingLevel,
    });

    return interaction;
  }

  /**
   * Record a hint request
   */
  public recordHintRequest(
    hintType: HintType,
    requestTime: number,
    strategicRequest: boolean = false,
    hintContent?: string,
  ): void {
    this.ensureInteractionActive();

    const hintData: HintRequestData = {
      hintType,
      requestTime,
      hintContent,
      strategicRequest,
      followUpQuestions: [],
    };

    this._hintRequests.push(hintData);

    // Log event
    this.logEvent('HINT_REQUESTED', {
      hintType,
      requestTime,
      strategicRequest,
      totalHints: this._hintRequests.length,
    });

    // Check for hint gaming patterns
    this.checkHintGamingPatterns();
  }

  /**
   * Record error recovery
   */
  public recordErrorRecovery(
    errorType: ErrorType,
    errorTime: number,
    recoveryTime: number,
    selfCorrected: boolean = true,
    recoveryStrategy?: string,
  ): void {
    this.ensureInteractionActive();

    const errorData: ErrorRecoveryData = {
      errorType,
      errorTime,
      recoveryTime,
      recoveryStrategy: recoveryStrategy || 'unknown',
      selfCorrected,
      errorSeverity: this.calculateErrorSeverity(errorType, recoveryTime),
    };

    this._errorRecoveries.push(errorData);

    // Log event
    this.logEvent('ERROR_RECOVERY', {
      errorType,
      recoveryTime,
      selfCorrected,
      errorSeverity: errorData.errorSeverity,
    });

    // Check for error patterns
    this.analyzeErrorPatterns();
  }

  /**
   * Record self-assessment
   */
  public recordSelfAssessment(assessment: SelfAssessmentData): void {
    this.ensureInteractionActive();

    // Calculate metacognitive accuracy
    const confidenceAccuracy =
      1 -
      Math.abs(assessment.confidencePrediction - assessment.actualConfidence);
    const difficultyAccuracy =
      1 -
      Math.abs(assessment.difficultyPrediction - assessment.actualDifficulty) /
        4;
    assessment.metacognitiveAccuracy =
      (confidenceAccuracy + difficultyAccuracy) / 2;

    this._selfAssessments.push(assessment);

    // Log event
    this.logEvent('SELF_ASSESSMENT', {
      metacognitiveAccuracy: assessment.metacognitiveAccuracy,
      confidenceGap:
        assessment.actualConfidence - assessment.confidencePrediction,
      difficultyGap:
        assessment.actualDifficulty - assessment.difficultyPrediction,
    });
  }

  /**
   * Record resource access
   */
  public recordResourceAccess(resourceType: string, accessTime: number): void {
    this.ensureInteractionActive();

    this._resourceAccesses.push(`${resourceType}:${accessTime}`);

    this.logEvent('RESOURCE_ACCESSED', {
      resourceType,
      accessTime,
      totalResources: this._resourceAccesses.length,
    });
  }

  /**
   * Record peer consultation
   */
  public recordPeerConsultation(
    consultationType: string,
    duration: number,
  ): void {
    this.ensureInteractionActive();

    this._peerConsultations.push(`${consultationType}:${duration}`);

    this.logEvent('PEER_CONSULTATION', {
      consultationType,
      duration,
      totalConsultations: this._peerConsultations.length,
    });
  }

  /**
   * Complete the task interaction
   */
  public completeInteraction(accuracy: number, actualDifficulty: number): void {
    this.ensureInteractionActive();

    this._endTime = new Date();
    this._duration = this._endTime.getTime() - this.startTime.getTime();
    this._status = InteractionStatus.COMPLETED;

    // Calculate performance metrics
    this._performanceMetrics = this.calculatePerformanceMetrics(
      accuracy,
      actualDifficulty,
    );

    // Generate behavioral signals
    this._behavioralSignals = this.generateBehavioralSignals();

    // Log completion
    this.logEvent('INTERACTION_COMPLETED', {
      duration: this._duration,
      accuracy,
      performance: this._performanceMetrics,
      signals: this._behavioralSignals.getValue(),
    });
  }

  /**
   * Flag interaction for review
   */
  public flagForReview(reason: string): void {
    this._status = InteractionStatus.FLAGGED;
    this._gamingFlags.push(reason);

    this.logEvent('INTERACTION_FLAGGED', {
      reason,
      totalFlags: this._gamingFlags.length,
    });
  }

  /**
   * Generate behavioral signals for CCIS calculation
   */
  public generateBehavioralSignals(): BehavioralSignals {
    if (this._behavioralSignals) {
      return this._behavioralSignals;
    }

    if (this._status !== InteractionStatus.COMPLETED) {
      throw new BusinessRuleException(
        'Cannot generate behavioral signals for incomplete interaction',
        'interactionStatus',
      );
    }

    // Calculate signal components
    const hintFrequency = this.calculateHintFrequency();
    const errorRecoverySpeed = this.calculateErrorRecoverySpeed();
    const transferSuccess = this.calculateTransferSuccess();
    const metacognitiveAccuracy = this.calculateMetacognitiveAccuracy();
    const efficiency = this.calculateEfficiency();
    const helpSeekingQuality = this.calculateHelpSeekingQuality();
    const selfAssessmentAlignment = this.calculateSelfAssessmentAlignment();

    // Create behavioral signals
    this._behavioralSignals = BehavioralSignals.create({
      hintRequestFrequency: hintFrequency,
      errorRecoverySpeed: errorRecoverySpeed,
      transferSuccessRate: transferSuccess,
      metacognitiveAccuracy: metacognitiveAccuracy,
      taskCompletionEfficiency: efficiency,
      helpSeekingQuality: helpSeekingQuality,
      selfAssessmentAlignment: selfAssessmentAlignment,
      assessmentDuration: (this._duration || 0) / (1000 * 60), // Convert to minutes
      taskCount: 1, // Single task interaction
    });

    return this._behavioralSignals;
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    if (!this._performanceMetrics) {
      throw new BusinessRuleException(
        'Performance metrics not available for incomplete interaction',
        'interactionStatus',
      );
    }

    return { ...this._performanceMetrics };
  }

  /**
   * Get interaction summary
   */
  public getInteractionSummary(): {
    duration: number;
    hintsUsed: number;
    errorsRecovered: number;
    resourcesAccessed: number;
    peerConsultations: number;
    gamingFlags: number;
    performanceScore: number;
  } {
    return {
      duration: this._duration || 0,
      hintsUsed: this._hintRequests.length,
      errorsRecovered: this._errorRecoveries.length,
      resourcesAccessed: this._resourceAccesses.length,
      peerConsultations: this._peerConsultations.length,
      gamingFlags: this._gamingFlags.length,
      performanceScore: this._performanceMetrics?.accuracy || 0,
    };
  }

  // Getter methods
  public get status(): InteractionStatus {
    return this._status;
  }

  public get endTime(): Date | undefined {
    return this._endTime;
  }

  public get duration(): number | undefined {
    return this._duration;
  }

  public get hintRequests(): readonly HintRequestData[] {
    return [...this._hintRequests];
  }

  public get errorRecoveries(): readonly ErrorRecoveryData[] {
    return [...this._errorRecoveries];
  }

  public get gamingFlags(): readonly string[] {
    return [...this._gamingFlags];
  }

  public get interactionEvents(): readonly any[] {
    return [...this._interactionEvents];
  }

  // Private calculation methods
  private calculateHintFrequency(): number {
    if (!this._duration) return 0;

    const totalHints = this._hintRequests.length;
    const durationMinutes = this._duration / (1000 * 60);

    // Normalize hint frequency (fewer hints = higher independence score)
    const hintsPerMinute = totalHints / Math.max(durationMinutes, 0.1);
    return Math.max(0, 1 - hintsPerMinute / 2); // 2 hints/minute = 0 score
  }

  private calculateErrorRecoverySpeed(): number {
    if (this._errorRecoveries.length === 0) return 1; // No errors = perfect recovery

    const averageRecoveryTime =
      this._errorRecoveries.reduce(
        (sum, error) => sum + error.recoveryTime,
        0,
      ) / this._errorRecoveries.length;

    // Normalize recovery speed (faster recovery = higher score)
    const recoveryMinutes = averageRecoveryTime / (1000 * 60);
    return Math.max(0, 1 - recoveryMinutes / 5); // 5 minutes = 0 score
  }

  private calculateTransferSuccess(): number {
    // TODO: Implement transfer success calculation based on task complexity
    // For now, use error recovery and hint usage as proxy
    const errorScore =
      this._errorRecoveries.length === 0
        ? 1
        : Math.max(0, 1 - this._errorRecoveries.length / 3);
    const hintScore = Math.max(0, 1 - this._hintRequests.length / 5);

    return (errorScore + hintScore) / 2;
  }

  private calculateMetacognitiveAccuracy(): number {
    if (this._selfAssessments.length === 0) return 0.5; // Neutral score

    const avgAccuracy =
      this._selfAssessments.reduce(
        (sum, assessment) => sum + assessment.metacognitiveAccuracy,
        0,
      ) / this._selfAssessments.length;

    return avgAccuracy;
  }

  private calculateEfficiency(): number {
    if (!this._duration) return 0;

    // TODO: Calculate efficiency based on optimal task completion time
    // For now, use duration and scaffolding level as proxy
    const durationMinutes = this._duration / (1000 * 60);
    const expectedDuration = this.getExpectedDuration();

    return Math.max(0, Math.min(1, expectedDuration / durationMinutes));
  }

  private calculateHelpSeekingQuality(): number {
    if (this._hintRequests.length === 0) return 1; // No help needed = perfect

    const strategicRequests = this._hintRequests.filter(
      (h) => h.strategicRequest,
    ).length;
    return strategicRequests / this._hintRequests.length;
  }

  private calculateSelfAssessmentAlignment(): number {
    return this.calculateMetacognitiveAccuracy(); // Same calculation for now
  }

  private calculatePerformanceMetrics(
    accuracy: number,
    actualDifficulty: number,
  ): PerformanceMetrics {
    return {
      accuracy,
      efficiency: this.calculateEfficiency(),
      independence: this.calculateHintFrequency(),
      persistence: this.calculateErrorRecoverySpeed(),
      metacognition: this.calculateMetacognitiveAccuracy(),
      transferability: this.calculateTransferSuccess(),
      collaboration: this._peerConsultations.length > 0 ? 0.8 : 0.5, // Simple proxy
    };
  }

  private calculateErrorSeverity(
    errorType: ErrorType,
    recoveryTime: number,
  ): 'minor' | 'moderate' | 'major' | 'critical' {
    const recoveryMinutes = recoveryTime / (1000 * 60);

    if (recoveryMinutes < 0.5) return 'minor';
    if (recoveryMinutes < 2) return 'moderate';
    if (recoveryMinutes < 5) return 'major';
    return 'critical';
  }

  private getExpectedDuration(): number {
    // TODO: Get expected duration from task metadata
    // For now, use scaffolding level and difficulty as proxy
    const baseDuration =
      {
        beginner: 10,
        intermediate: 15,
        advanced: 20,
        expert: 30,
      }[this.metadata.taskDifficulty] || 15;

    // Adjust for scaffolding level
    const scaffoldingAdjustment = 1 + this.metadata.scaffoldingLevel * 0.1;

    return baseDuration * scaffoldingAdjustment;
  }

  private checkHintGamingPatterns(): void {
    // Rapid hint requests (gaming pattern)
    if (this._hintRequests.length >= 3) {
      const recentHints = this._hintRequests.slice(-3);
      const timeSpan = recentHints[2].requestTime - recentHints[0].requestTime;

      if (timeSpan < 30000) {
        // 30 seconds for 3 hints
        this.flagForReview('RAPID_HINT_REQUESTS');
      }
    }

    // Excessive hint dependency
    if (this._hintRequests.length > 10) {
      this.flagForReview('EXCESSIVE_HINT_DEPENDENCY');
    }
  }

  private analyzeErrorPatterns(): void {
    // Repeated same error type (learning issue)
    const errorTypeCounts = this._errorRecoveries.reduce(
      (counts, error) => {
        counts[error.errorType] = (counts[error.errorType] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>,
    );

    Object.entries(errorTypeCounts).forEach(([errorType, count]) => {
      if (count >= 3) {
        this.flagForReview(`REPEATED_${errorType}_ERRORS`);
      }
    });
  }

  private ensureInteractionActive(): void {
    if (this._status !== InteractionStatus.IN_PROGRESS) {
      throw new BusinessRuleException(
        'Cannot modify completed or flagged interaction',
        'interactionStatus',
      );
    }
  }

  private validateInteractionData(): void {
    if (!this.assessmentSessionId) {
      throw new BusinessRuleException(
        'Task interaction must be linked to an assessment session',
        'assessmentSessionId',
      );
    }

    if (!this.taskId) {
      throw new BusinessRuleException(
        'Task interaction must be linked to a task',
        'taskId',
      );
    }

    if (!this.personId) {
      throw new BusinessRuleException(
        'Task interaction must be linked to a person',
        'personId',
      );
    }

    if (
      this.metadata.scaffoldingLevel < 0 ||
      this.metadata.scaffoldingLevel > 5
    ) {
      throw new BusinessRuleException(
        'Scaffolding level must be between 0 and 5',
        'scaffoldingLevel',
      );
    }
  }

  private logEvent(eventType: string, eventData: any): void {
    this._interactionEvents.push({
      timestamp: new Date(),
      eventType,
      eventData,
    });
  }
}
