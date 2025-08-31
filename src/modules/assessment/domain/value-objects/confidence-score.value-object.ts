// src/modules/assessment/domain/value-objects/confidence-score.value-object.ts

import { ValueObject } from '../../../../shared/base/value-object.base';
import { BusinessRuleException } from '../../../../shared/domain/exceptions/domain-exception.base';

/**
 * Confidence Score Value Object
 *
 * Represents the confidence level of a CCIS assessment, indicating how
 * certain the assessment algorithm is about the assigned CCIS level.
 *
 * Confidence Score Framework (0.0 - 1.0):
 * - 0.0 - 0.4: Low confidence - needs more data or re-assessment
 * - 0.4 - 0.7: Moderate confidence - acceptable for progression
 * - 0.7 - 0.9: High confidence - reliable assessment
 * - 0.9 - 1.0: Very high confidence - expert-level certainty
 *
 * This value object is critical for:
 * - Claude 3.5 Sonnet integration (assessment confidence)
 * - Gaming detection (low confidence may indicate gaming)
 * - Intervention triggering (low confidence triggers additional assessment)
 * - Progress validation (high confidence enables faster progression)
 * - UI feedback (confidence meters and progress indicators)
 *
 * Usage Examples:
 * ```typescript
 * // Create confidence scores
 * const lowConf = ConfidenceScore.fromValue(0.3);
 * const highConf = ConfidenceScore.fromPercentage(85);
 *
 * // Confidence operations
 * const isReliable = highConf.isReliable();
 * const needsMoreData = lowConf.needsMoreAssessment();
 * const level = highConf.getConfidenceLevel();
 *
 * // Comparison and combination
 * const isHigher = highConf.isHigherThan(lowConf);
 * const average = ConfidenceScore.average([conf1, conf2, conf3]);
 * ```
 */

export interface ConfidenceScoreProps {
  value: number; // 0.0 to 1.0
}

export class ConfidenceScore extends ValueObject<ConfidenceScoreProps> {
  // Confidence Level Thresholds (Based on Assessment Requirements)
  public static readonly MIN_VALUE = 0.0;
  public static readonly MAX_VALUE = 1.0;

  // Confidence Level Boundaries
  public static readonly LOW_THRESHOLD = 0.4;
  public static readonly MODERATE_THRESHOLD = 0.7;
  public static readonly HIGH_THRESHOLD = 0.9;

  // Minimum confidence for various actions
  public static readonly MIN_PROGRESSION_CONFIDENCE = 0.4;
  public static readonly MIN_RELIABLE_CONFIDENCE = 0.7;
  public static readonly MIN_EXPERT_CONFIDENCE = 0.9;

  // Confidence Level Descriptions
  private static readonly CONFIDENCE_DESCRIPTIONS = {
    low: 'Low confidence - needs more assessment data',
    moderate: 'Moderate confidence - acceptable for progression',
    high: 'High confidence - reliable assessment result',
    veryHigh: 'Very high confidence - expert-level certainty',
  } as const;

  // Confidence Colors for UI (Matching assessment confidence levels)
  private static readonly CONFIDENCE_COLORS = {
    low: '#ef4444', // Red - needs attention
    moderate: '#f59e0b', // Amber - caution
    high: '#10b981', // Green - good
    veryHigh: '#8b5cf6', // Purple - excellent
  } as const;

  private constructor(props: ConfidenceScoreProps) {
    super(props);
  }

  /**
   * Creates a confidence score from a decimal value (0.0 - 1.0)
   */
  public static fromValue(value: number): ConfidenceScore {
    ConfidenceScore.validateValue(value);
    return new ConfidenceScore({ value });
  }

  /**
   * Creates a confidence score from a percentage (0 - 100)
   */
  public static fromPercentage(percentage: number): ConfidenceScore {
    if (typeof percentage !== 'number' || isNaN(percentage)) {
      throw new BusinessRuleException(
        'Confidence percentage must be a valid number',
        'confidencePercentage',
      );
    }

    if (percentage < 0 || percentage > 100) {
      throw new BusinessRuleException(
        'Confidence percentage must be between 0 and 100',
        'confidencePercentage',
      );
    }

    const value = percentage / 100;
    return new ConfidenceScore({ value });
  }

  /**
   * Creates a low confidence score (for uncertain assessments)
   */
  public static createLow(): ConfidenceScore {
    return new ConfidenceScore({ value: 0.2 });
  }

  /**
   * Creates a moderate confidence score (for standard assessments)
   */
  public static createModerate(): ConfidenceScore {
    return new ConfidenceScore({ value: 0.6 });
  }

  /**
   * Creates a high confidence score (for reliable assessments)
   */
  public static createHigh(): ConfidenceScore {
    return new ConfidenceScore({ value: 0.8 });
  }

  /**
   * Creates a very high confidence score (for expert-level assessments)
   */
  public static createVeryHigh(): ConfidenceScore {
    return new ConfidenceScore({ value: 0.95 });
  }

  // Getters
  public getScore(): number {
    return this.value.value;
  }

  public getPercentage(): number {
    return Math.round(this.value.value * 100);
  }

  public getDescription(): string {
    const level = this.getConfidenceLevel();
    return ConfidenceScore.CONFIDENCE_DESCRIPTIONS[level];
  }

  public getColor(): string {
    const level = this.getConfidenceLevel();
    return ConfidenceScore.CONFIDENCE_COLORS[level];
  }

  public getConfidenceLevel(): 'low' | 'moderate' | 'high' | 'veryHigh' {
    const value = this.value.value;

    if (value < ConfidenceScore.LOW_THRESHOLD) {
      return 'low';
    }
    if (value < ConfidenceScore.MODERATE_THRESHOLD) {
      return 'moderate';
    }
    if (value < ConfidenceScore.HIGH_THRESHOLD) {
      return 'high';
    }
    return 'veryHigh';
  }

  // Confidence Level Checks
  public isLow(): boolean {
    return this.value.value < ConfidenceScore.LOW_THRESHOLD;
  }

  public isModerate(): boolean {
    return (
      this.value.value >= ConfidenceScore.LOW_THRESHOLD &&
      this.value.value < ConfidenceScore.MODERATE_THRESHOLD
    );
  }

  public isHigh(): boolean {
    return (
      this.value.value >= ConfidenceScore.MODERATE_THRESHOLD &&
      this.value.value < ConfidenceScore.HIGH_THRESHOLD
    );
  }

  public isVeryHigh(): boolean {
    return this.value.value >= ConfidenceScore.HIGH_THRESHOLD;
  }

  public isReliable(): boolean {
    return this.value.value >= ConfidenceScore.MIN_RELIABLE_CONFIDENCE;
  }

  public isExpertLevel(): boolean {
    return this.value.value >= ConfidenceScore.MIN_EXPERT_CONFIDENCE;
  }

  // Assessment Action Validations
  public allowsProgression(): boolean {
    return this.value.value >= ConfidenceScore.MIN_PROGRESSION_CONFIDENCE;
  }

  public needsMoreAssessment(): boolean {
    return this.value.value < ConfidenceScore.MIN_PROGRESSION_CONFIDENCE;
  }

  public triggersIntervention(): boolean {
    return this.isLow();
  }

  public suggestsGaming(): boolean {
    // Very low confidence might indicate gaming or manipulation
    return this.value.value < 0.2;
  }

  // Comparison Methods
  public isHigherThan(other: ConfidenceScore): boolean {
    return this.value.value > other.getScore();
  }

  public isLowerThan(other: ConfidenceScore): boolean {
    return this.value.value < other.getScore();
  }

  public isEqual(other: ConfidenceScore): boolean {
    // Use small epsilon for floating point comparison
    const epsilon = 0.001;
    return Math.abs(this.value.value - other.getScore()) < epsilon;
  }

  // Mathematical Operations
  public add(other: ConfidenceScore): ConfidenceScore {
    const newValue = Math.min(
      this.value.value + other.getScore(),
      ConfidenceScore.MAX_VALUE,
    );
    return ConfidenceScore.fromValue(newValue);
  }

  public multiply(factor: number): ConfidenceScore {
    if (factor < 0) {
      throw new BusinessRuleException(
        'Confidence score factor must be non-negative',
        'confidenceFactor',
      );
    }

    const newValue = Math.min(
      this.value.value * factor,
      ConfidenceScore.MAX_VALUE,
    );
    return ConfidenceScore.fromValue(newValue);
  }

  public boost(amount: number): ConfidenceScore {
    ConfidenceScore.validateValue(amount);
    const newValue = Math.min(
      this.value.value + amount,
      ConfidenceScore.MAX_VALUE,
    );
    return ConfidenceScore.fromValue(newValue);
  }

  public reduce(amount: number): ConfidenceScore {
    ConfidenceScore.validateValue(amount);
    const newValue = Math.max(
      this.value.value - amount,
      ConfidenceScore.MIN_VALUE,
    );
    return ConfidenceScore.fromValue(newValue);
  }

  // Static Utility Methods
  public static average(scores: ConfidenceScore[]): ConfidenceScore {
    if (scores.length === 0) {
      throw new BusinessRuleException(
        'Cannot calculate average of empty confidence scores array',
        'confidenceScores',
      );
    }

    const sum = scores.reduce((acc, score) => acc + score.getScore(), 0);
    const average = sum / scores.length;
    return ConfidenceScore.fromValue(average);
  }

  public static weightedAverage(
    scores: ConfidenceScore[],
    weights: number[],
  ): ConfidenceScore {
    if (scores.length !== weights.length) {
      throw new BusinessRuleException(
        'Confidence scores and weights arrays must have the same length',
        'confidenceWeights',
      );
    }

    if (scores.length === 0) {
      throw new BusinessRuleException(
        'Cannot calculate weighted average of empty arrays',
        'confidenceScores',
      );
    }

    const weightSum = weights.reduce((acc, weight) => acc + weight, 0);
    if (weightSum === 0) {
      throw new BusinessRuleException(
        'Sum of weights cannot be zero',
        'confidenceWeights',
      );
    }

    const weightedSum = scores.reduce((acc, score, index) => {
      return acc + score.getScore() * weights[index];
    }, 0);

    const weightedAverage = weightedSum / weightSum;
    return ConfidenceScore.fromValue(weightedAverage);
  }

  public static max(scores: ConfidenceScore[]): ConfidenceScore {
    if (scores.length === 0) {
      throw new BusinessRuleException(
        'Cannot find maximum of empty confidence scores array',
        'confidenceScores',
      );
    }

    const maxValue = Math.max(...scores.map((score) => score.getScore()));
    return ConfidenceScore.fromValue(maxValue);
  }

  public static min(scores: ConfidenceScore[]): ConfidenceScore {
    if (scores.length === 0) {
      throw new BusinessRuleException(
        'Cannot find minimum of empty confidence scores array',
        'confidenceScores',
      );
    }

    const minValue = Math.min(...scores.map((score) => score.getScore()));
    return ConfidenceScore.fromValue(minValue);
  }

  // Validation
  private static validateValue(value: number): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new BusinessRuleException(
        'Confidence score must be a valid number',
        'confidenceScore',
      );
    }

    if (
      value < ConfidenceScore.MIN_VALUE ||
      value > ConfidenceScore.MAX_VALUE
    ) {
      throw new BusinessRuleException(
        `Confidence score must be between ${ConfidenceScore.MIN_VALUE} and ${ConfidenceScore.MAX_VALUE}`,
        'confidenceScore',
      );
    }
  }

  // Value Object Implementation
  protected validate(props: ConfidenceScoreProps): void {
    ConfidenceScore.validateValue(props.value);
  }

  public toJSON(): {
    value: number;
    percentage: number;
    level: string;
    description: string;
    color: string;
    isReliable: boolean;
    allowsProgression: boolean;
  } {
    return {
      value: this.value.value,
      percentage: this.getPercentage(),
      level: this.getConfidenceLevel(),
      description: this.getDescription(),
      color: this.getColor(),
      isReliable: this.isReliable(),
      allowsProgression: this.allowsProgression(),
    };
  }

  public toString(): string {
    return `Confidence ${this.getPercentage()}% (${this.getConfidenceLevel()}): ${this.getDescription()}`;
  }
}
