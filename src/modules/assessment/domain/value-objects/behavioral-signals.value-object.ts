// src/modules/assessment/domain/value-objects/behavioral-signals.value-object.ts

import { ValueObject } from '../../../../shared/base/value-object.base';
import { BusinessRuleException } from '../../../../shared/domain/exceptions/domain-exception.base';

/**
 * Behavioral Signals Value Object
 *
 * Implements the core weighted algorithm for CCIS (Confidence-Competence Independence Scale)
 * assessment based on behavioral data collected during task interactions.
 *
 * Behavioral Signals (Weighted Algorithm from GitHub Copilot Instructions):
 * 1. Hint Request Frequency (35%) - Primary independence indicator
 * 2. Error Recovery Speed (25%) - Self-correction capability
 * 3. Transfer Success Rate (20%) - Apply skills to novel problems
 * 4. Metacognitive Accuracy (10%) - Self-assessment alignment
 * 5. Task Completion Efficiency (5%) - Improvement over time
 * 6. Help-Seeking Quality (3%) - Strategic vs generic questions
 * 7. Self-Assessment Alignment (2%) - Prediction accuracy
 *
 * This value object is critical for:
 * - Real-time CCIS level calculation during assessments
 * - Gaming detection (inconsistent signal patterns)
 * - Intervention triggering (concerning signal combinations)
 * - Progress validation (signal improvement over time)
 * - Claude 3.5 Sonnet integration (behavioral context for AI assessment)
 *
 * The weighted score directly maps to CCIS levels:
 * - 0.0-0.25 (0-25%) → CCIS Level 1 (Dependent learner)
 * - 0.25-0.50 (25-50%) → CCIS Level 2 (Guided practitioner)
 * - 0.50-0.85 (50-85%) → CCIS Level 3 (Self-directed performer)
 * - 0.85-1.0 (85-100%) → CCIS Level 4 (Autonomous expert)
 *
 * Usage Examples:
 * ```typescript
 * // Create behavioral signals
 * const signals = BehavioralSignals.create({
 *   hintRequestFrequency: 0.2,
 *   errorRecoverySpeed: 0.8,
 *   transferSuccessRate: 0.6,
 *   // ... other signals
 * });
 *
 * // Calculate CCIS
 * const ccisScore = signals.calculateWeightedScore();
 * const ccisLevel = signals.calculateCCISLevel();
 * const confidence = signals.getAssessmentConfidence();
 *
 * // Detect issues
 * const isGaming = signals.detectsGaming();
 * const needsIntervention = signals.needsIntervention();
 * ```
 */

export interface BehavioralSignalsProps {
  // Core Behavioral Signals (0.0 - 1.0 normalized scores)
  hintRequestFrequency: number; // 35% weight - Lower is better (independence)
  errorRecoverySpeed: number; // 25% weight - Higher is better (self-correction)
  transferSuccessRate: number; // 20% weight - Higher is better (skill application)
  metacognitiveAccuracy: number; // 10% weight - Higher is better (self-awareness)
  taskCompletionEfficiency: number; // 5% weight - Higher is better (improvement)
  helpSeekingQuality: number; // 3% weight - Higher is better (strategic help)
  selfAssessmentAlignment: number; // 2% weight - Higher is better (prediction accuracy)

  // Metadata
  assessmentDuration: number; // Total assessment time in minutes
  taskCount: number; // Number of tasks completed
  timestamp: Date; // When signals were collected
}

export class BehavioralSignals extends ValueObject<BehavioralSignalsProps> {
  // Signal Weights (Exact from GitHub Copilot Instructions)
  public static readonly HINT_FREQUENCY_WEIGHT = 0.35; // 35%
  public static readonly ERROR_RECOVERY_WEIGHT = 0.25; // 25%
  public static readonly TRANSFER_SUCCESS_WEIGHT = 0.2; // 20%
  public static readonly METACOGNITIVE_WEIGHT = 0.1; // 10%
  public static readonly EFFICIENCY_WEIGHT = 0.05; // 5%
  public static readonly HELP_SEEKING_WEIGHT = 0.03; // 3%
  public static readonly SELF_ASSESSMENT_WEIGHT = 0.02; // 2%

  // Validation Constants
  public static readonly MIN_SIGNAL_VALUE = 0.0;
  public static readonly MAX_SIGNAL_VALUE = 1.0;
  public static readonly MIN_ASSESSMENT_DURATION = 1; // At least 1 minute
  public static readonly MIN_TASK_COUNT = 1;

  // Gaming Detection Thresholds
  public static readonly GAMING_HINT_THRESHOLD = 0.05; // Too few hints may indicate gaming
  public static readonly GAMING_RECOVERY_THRESHOLD = 0.95; // Perfect recovery may indicate gaming
  public static readonly GAMING_VARIANCE_THRESHOLD = 0.1; // Too consistent signals may indicate gaming

  // Intervention Thresholds
  public static readonly INTERVENTION_HINT_THRESHOLD = 0.8; // Too many hints
  public static readonly INTERVENTION_RECOVERY_THRESHOLD = 0.2; // Poor error recovery
  public static readonly INTERVENTION_TRANSFER_THRESHOLD = 0.3; // Poor skill transfer

  private constructor(props: BehavioralSignalsProps) {
    super(props);
  }

  /**
   * Creates behavioral signals from individual measurements
   */
  public static create(
    props: Omit<BehavioralSignalsProps, 'timestamp'> & { timestamp?: Date },
  ): BehavioralSignals {
    const signalsProps: BehavioralSignalsProps = {
      ...props,
      timestamp: props.timestamp || new Date(),
    };

    return new BehavioralSignals(signalsProps);
  }

  /**
   * Creates signals from raw assessment data with automatic normalization
   */
  public static fromRawData(rawData: {
    hintsRequested: number;
    totalAvailableHints: number;
    errorRecoveryTimeMs: number;
    maxRecoveryTimeMs: number;
    transferTasksSuccessful: number;
    totalTransferTasks: number;
    selfAssessmentScore: number;
    actualPerformanceScore: number;
    taskCompletionTimeMs: number;
    optimalCompletionTimeMs: number;
    strategicHelpRequests: number;
    totalHelpRequests: number;
    selfPredictionAccuracy: number;
    assessmentDurationMinutes: number;
    taskCount: number;
  }): BehavioralSignals {
    // Normalize each signal to 0.0-1.0 range
    const hintRequestFrequency = Math.min(
      rawData.hintsRequested / rawData.totalAvailableHints,
      1.0,
    );

    // For error recovery: faster recovery = higher score (invert time ratio)
    const errorRecoverySpeed =
      1.0 -
      Math.min(rawData.errorRecoveryTimeMs / rawData.maxRecoveryTimeMs, 1.0);

    const transferSuccessRate =
      rawData.transferTasksSuccessful / rawData.totalTransferTasks;

    // Metacognitive accuracy: alignment between self-assessment and actual performance
    const metacognitiveAccuracy =
      1.0 -
      Math.abs(rawData.selfAssessmentScore - rawData.actualPerformanceScore);

    // Task efficiency: optimal time / actual time (capped at 1.0)
    const taskCompletionEfficiency = Math.min(
      rawData.optimalCompletionTimeMs / rawData.taskCompletionTimeMs,
      1.0,
    );

    // Help-seeking quality: strategic requests / total requests
    const helpSeekingQuality =
      rawData.totalHelpRequests > 0
        ? rawData.strategicHelpRequests / rawData.totalHelpRequests
        : 1.0;

    const selfAssessmentAlignment = rawData.selfPredictionAccuracy;

    return BehavioralSignals.create({
      hintRequestFrequency,
      errorRecoverySpeed,
      transferSuccessRate,
      metacognitiveAccuracy,
      taskCompletionEfficiency,
      helpSeekingQuality,
      selfAssessmentAlignment,
      assessmentDuration: rawData.assessmentDurationMinutes,
      taskCount: rawData.taskCount,
    });
  }

  // Core CCIS Calculation Methods

  /**
   * Calculates the weighted CCIS score (0.0-1.0)
   * Uses exact weights from GitHub Copilot instructions
   */
  public calculateWeightedScore(): number {
    const signals = this.value;

    // Note: Hint frequency is inverted (lower frequency = higher independence)
    const independenceScore = 1.0 - signals.hintRequestFrequency;

    const weightedScore =
      independenceScore * BehavioralSignals.HINT_FREQUENCY_WEIGHT +
      signals.errorRecoverySpeed * BehavioralSignals.ERROR_RECOVERY_WEIGHT +
      signals.transferSuccessRate * BehavioralSignals.TRANSFER_SUCCESS_WEIGHT +
      signals.metacognitiveAccuracy * BehavioralSignals.METACOGNITIVE_WEIGHT +
      signals.taskCompletionEfficiency * BehavioralSignals.EFFICIENCY_WEIGHT +
      signals.helpSeekingQuality * BehavioralSignals.HELP_SEEKING_WEIGHT +
      signals.selfAssessmentAlignment *
        BehavioralSignals.SELF_ASSESSMENT_WEIGHT;

    return Math.min(Math.max(weightedScore, 0.0), 1.0);
  }

  /**
   * Calculates CCIS level (1-4) based on weighted score
   */
  public calculateCCISLevel(): number {
    const score = this.calculateWeightedScore();

    if (score < 0.25) return 1; // Dependent learner
    if (score < 0.5) return 2; // Guided practitioner
    if (score < 0.85) return 3; // Self-directed performer
    return 4; // Autonomous expert
  }

  /**
   * Gets assessment confidence based on signal consistency and coverage
   */
  public getAssessmentConfidence(): number {
    const signals = this.value;

    // Calculate signal variance (lower variance = higher confidence)
    const allSignals = [
      1.0 - signals.hintRequestFrequency, // Normalize for consistency
      signals.errorRecoverySpeed,
      signals.transferSuccessRate,
      signals.metacognitiveAccuracy,
      signals.taskCompletionEfficiency,
      signals.helpSeekingQuality,
      signals.selfAssessmentAlignment,
    ];

    const mean =
      allSignals.reduce((sum, signal) => sum + signal, 0) / allSignals.length;
    const variance =
      allSignals.reduce((sum, signal) => sum + Math.pow(signal - mean, 2), 0) /
      allSignals.length;

    // Lower variance = higher confidence, with task count and duration factors
    const consistencyFactor = Math.max(0.0, 1.0 - variance * 2); // Scale variance impact
    const coverageFactor = Math.min(signals.taskCount / 5, 1.0); // Ideal: 5+ tasks
    const durationFactor = Math.min(signals.assessmentDuration / 15, 1.0); // Ideal: 15+ minutes

    const confidence =
      consistencyFactor * 0.6 + coverageFactor * 0.25 + durationFactor * 0.15;

    return Math.min(Math.max(confidence, 0.0), 1.0);
  }

  // Gaming Detection Methods

  /**
   * Detects potential gaming or manipulation of the assessment
   */
  public detectsGaming(): boolean {
    const signals = this.value;

    // Pattern 1: Suspiciously perfect performance
    const isPerfectRecovery =
      signals.errorRecoverySpeed > BehavioralSignals.GAMING_RECOVERY_THRESHOLD;
    const isTooFewHints =
      signals.hintRequestFrequency < BehavioralSignals.GAMING_HINT_THRESHOLD;

    // Pattern 2: Inconsistent skill demonstration
    const skillGap = Math.abs(
      signals.transferSuccessRate - signals.errorRecoverySpeed,
    );
    const hasLargeSkillGap = skillGap > 0.4;

    // Pattern 3: Too consistent signals (unnatural)
    const confidence = this.getAssessmentConfidence();
    const isTooConsistent =
      confidence > 0.95 && this.calculateWeightedScore() > 0.8;

    // Pattern 4: Metacognitive mismatch
    const metacognitiveGap = Math.abs(
      signals.metacognitiveAccuracy - signals.transferSuccessRate,
    );
    const hasMetacognitiveMismatch = metacognitiveGap > 0.5;

    return (
      isPerfectRecovery ||
      (isTooFewHints && hasLargeSkillGap) ||
      isTooConsistent ||
      hasMetacognitiveMismatch
    );
  }

  /**
   * Determines if intervention is needed based on concerning signal patterns
   */
  public needsIntervention(): boolean {
    const signals = this.value;

    // High hint frequency indicates struggling
    const strugglingWithHints =
      signals.hintRequestFrequency >
      BehavioralSignals.INTERVENTION_HINT_THRESHOLD;

    // Poor error recovery indicates fundamental issues
    const strugglingWithRecovery =
      signals.errorRecoverySpeed <
      BehavioralSignals.INTERVENTION_RECOVERY_THRESHOLD;

    // Poor transfer indicates learning difficulties
    const strugglingWithTransfer =
      signals.transferSuccessRate <
      BehavioralSignals.INTERVENTION_TRANSFER_THRESHOLD;

    // Multiple concerning signals
    const multipleIssues =
      [
        strugglingWithHints,
        strugglingWithRecovery,
        strugglingWithTransfer,
      ].filter(Boolean).length >= 2;

    return multipleIssues;
  }

  // Individual Signal Getters
  public getHintRequestFrequency(): number {
    return this.value.hintRequestFrequency;
  }

  public getErrorRecoverySpeed(): number {
    return this.value.errorRecoverySpeed;
  }

  public getTransferSuccessRate(): number {
    return this.value.transferSuccessRate;
  }

  public getMetacognitiveAccuracy(): number {
    return this.value.metacognitiveAccuracy;
  }

  public getTaskCompletionEfficiency(): number {
    return this.value.taskCompletionEfficiency;
  }

  public getHelpSeekingQuality(): number {
    return this.value.helpSeekingQuality;
  }

  public getSelfAssessmentAlignment(): number {
    return this.value.selfAssessmentAlignment;
  }

  public getAssessmentDuration(): number {
    return this.value.assessmentDuration;
  }

  public getTaskCount(): number {
    return this.value.taskCount;
  }

  public getTimestamp(): Date {
    return this.value.timestamp;
  }

  // Analysis Methods
  public getStrongestSignal(): {
    signal: string;
    value: number;
    weight: number;
  } {
    const signals = [
      {
        signal: 'independence',
        value: 1.0 - this.value.hintRequestFrequency,
        weight: BehavioralSignals.HINT_FREQUENCY_WEIGHT,
      },
      {
        signal: 'errorRecovery',
        value: this.value.errorRecoverySpeed,
        weight: BehavioralSignals.ERROR_RECOVERY_WEIGHT,
      },
      {
        signal: 'transferSuccess',
        value: this.value.transferSuccessRate,
        weight: BehavioralSignals.TRANSFER_SUCCESS_WEIGHT,
      },
      {
        signal: 'metacognitive',
        value: this.value.metacognitiveAccuracy,
        weight: BehavioralSignals.METACOGNITIVE_WEIGHT,
      },
      {
        signal: 'efficiency',
        value: this.value.taskCompletionEfficiency,
        weight: BehavioralSignals.EFFICIENCY_WEIGHT,
      },
      {
        signal: 'helpSeeking',
        value: this.value.helpSeekingQuality,
        weight: BehavioralSignals.HELP_SEEKING_WEIGHT,
      },
      {
        signal: 'selfAssessment',
        value: this.value.selfAssessmentAlignment,
        weight: BehavioralSignals.SELF_ASSESSMENT_WEIGHT,
      },
    ];

    return signals.reduce((strongest, current) =>
      current.value > strongest.value ? current : strongest,
    );
  }

  public getWeakestSignal(): { signal: string; value: number; weight: number } {
    const signals = [
      {
        signal: 'independence',
        value: 1.0 - this.value.hintRequestFrequency,
        weight: BehavioralSignals.HINT_FREQUENCY_WEIGHT,
      },
      {
        signal: 'errorRecovery',
        value: this.value.errorRecoverySpeed,
        weight: BehavioralSignals.ERROR_RECOVERY_WEIGHT,
      },
      {
        signal: 'transferSuccess',
        value: this.value.transferSuccessRate,
        weight: BehavioralSignals.TRANSFER_SUCCESS_WEIGHT,
      },
      {
        signal: 'metacognitive',
        value: this.value.metacognitiveAccuracy,
        weight: BehavioralSignals.METACOGNITIVE_WEIGHT,
      },
      {
        signal: 'efficiency',
        value: this.value.taskCompletionEfficiency,
        weight: BehavioralSignals.EFFICIENCY_WEIGHT,
      },
      {
        signal: 'helpSeeking',
        value: this.value.helpSeekingQuality,
        weight: BehavioralSignals.HELP_SEEKING_WEIGHT,
      },
      {
        signal: 'selfAssessment',
        value: this.value.selfAssessmentAlignment,
        weight: BehavioralSignals.SELF_ASSESSMENT_WEIGHT,
      },
    ];

    return signals.reduce((weakest, current) =>
      current.value < weakest.value ? current : weakest,
    );
  }

  // Value Object Implementation
  protected validate(props: BehavioralSignalsProps): void {
    // Validate signal ranges
    const signals = [
      { name: 'hintRequestFrequency', value: props.hintRequestFrequency },
      { name: 'errorRecoverySpeed', value: props.errorRecoverySpeed },
      { name: 'transferSuccessRate', value: props.transferSuccessRate },
      { name: 'metacognitiveAccuracy', value: props.metacognitiveAccuracy },
      {
        name: 'taskCompletionEfficiency',
        value: props.taskCompletionEfficiency,
      },
      { name: 'helpSeekingQuality', value: props.helpSeekingQuality },
      { name: 'selfAssessmentAlignment', value: props.selfAssessmentAlignment },
    ];

    for (const signal of signals) {
      if (typeof signal.value !== 'number' || isNaN(signal.value)) {
        throw new BusinessRuleException(
          `${signal.name} must be a valid number`,
          'behavioralSignal',
        );
      }

      if (
        signal.value < BehavioralSignals.MIN_SIGNAL_VALUE ||
        signal.value > BehavioralSignals.MAX_SIGNAL_VALUE
      ) {
        throw new BusinessRuleException(
          `${signal.name} must be between ${BehavioralSignals.MIN_SIGNAL_VALUE} and ${BehavioralSignals.MAX_SIGNAL_VALUE}`,
          'behavioralSignal',
        );
      }
    }

    // Validate metadata
    if (props.assessmentDuration < BehavioralSignals.MIN_ASSESSMENT_DURATION) {
      throw new BusinessRuleException(
        `Assessment duration must be at least ${BehavioralSignals.MIN_ASSESSMENT_DURATION} minutes`,
        'assessmentDuration',
      );
    }

    if (props.taskCount < BehavioralSignals.MIN_TASK_COUNT) {
      throw new BusinessRuleException(
        `Task count must be at least ${BehavioralSignals.MIN_TASK_COUNT}`,
        'taskCount',
      );
    }

    if (
      !(props.timestamp instanceof Date) ||
      isNaN(props.timestamp.getTime())
    ) {
      throw new BusinessRuleException(
        'Timestamp must be a valid Date',
        'timestamp',
      );
    }
  }

  public toJSON(): {
    signals: {
      hintRequestFrequency: number;
      errorRecoverySpeed: number;
      transferSuccessRate: number;
      metacognitiveAccuracy: number;
      taskCompletionEfficiency: number;
      helpSeekingQuality: number;
      selfAssessmentAlignment: number;
    };
    weightedScore: number;
    ccisLevel: number;
    confidence: number;
    detectsGaming: boolean;
    needsIntervention: boolean;
    strongestSignal: { signal: string; value: number; weight: number };
    weakestSignal: { signal: string; value: number; weight: number };
    metadata: {
      assessmentDuration: number;
      taskCount: number;
      timestamp: string;
    };
  } {
    return {
      signals: {
        hintRequestFrequency: this.value.hintRequestFrequency,
        errorRecoverySpeed: this.value.errorRecoverySpeed,
        transferSuccessRate: this.value.transferSuccessRate,
        metacognitiveAccuracy: this.value.metacognitiveAccuracy,
        taskCompletionEfficiency: this.value.taskCompletionEfficiency,
        helpSeekingQuality: this.value.helpSeekingQuality,
        selfAssessmentAlignment: this.value.selfAssessmentAlignment,
      },
      weightedScore: this.calculateWeightedScore(),
      ccisLevel: this.calculateCCISLevel(),
      confidence: this.getAssessmentConfidence(),
      detectsGaming: this.detectsGaming(),
      needsIntervention: this.needsIntervention(),
      strongestSignal: this.getStrongestSignal(),
      weakestSignal: this.getWeakestSignal(),
      metadata: {
        assessmentDuration: this.value.assessmentDuration,
        taskCount: this.value.taskCount,
        timestamp: this.value.timestamp.toISOString(),
      },
    };
  }

  public toString(): string {
    const score = this.calculateWeightedScore();
    const level = this.calculateCCISLevel();
    const confidence = this.getAssessmentConfidence();
    return `Behavioral Signals: CCIS Level ${level} (${Math.round(score * 100)}%, ${Math.round(confidence * 100)}% confidence)`;
  }
}
