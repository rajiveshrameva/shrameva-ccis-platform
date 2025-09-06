import { ValueObject } from '../../../../shared/base/value-object.base';
import { InvalidDifficultyLevelError } from '../exceptions/task.exceptions';

/**
 * TaskDifficulty Value Object
 *
 * Represents the objective difficulty level of a task based on:
 * - Item Response Theory (IRT) analysis
 * - Student performance data
 * - Cognitive load assessment
 * - Time-to-completion analysis
 *
 * Scale: 0.1 (very easy) to 1.0 (extremely difficult)
 *
 * Calibration is performed automatically based on student
 * performance data to ensure accuracy and consistency.
 */
export class TaskDifficulty extends ValueObject<number> {
  // Predefined difficulty levels for consistency
  public static readonly VERY_EASY = new TaskDifficulty(0.1);
  public static readonly EASY = new TaskDifficulty(0.25);
  public static readonly MODERATE = new TaskDifficulty(0.5);
  public static readonly HARD = new TaskDifficulty(0.75);
  public static readonly VERY_HARD = new TaskDifficulty(0.9);
  public static readonly EXTREMELY_HARD = new TaskDifficulty(1.0);

  private static readonly MIN_DIFFICULTY = 0.1;
  private static readonly MAX_DIFFICULTY = 1.0;
  private static readonly PRECISION = 0.01; // Two decimal places

  private constructor(value: number) {
    super(value);
  }

  /**
   * Creates TaskDifficulty from number with validation
   */
  public static fromNumber(value: number): TaskDifficulty {
    return new TaskDifficulty(value);
  }

  /**
   * Creates TaskDifficulty from performance data
   */
  public static fromPerformanceData(
    successRate: number,
    averageAttempts: number,
    timeVariance: number,
  ): TaskDifficulty {
    // IRT-based difficulty calculation
    let difficulty = 1 - successRate; // Base difficulty from success rate

    // Adjust for multiple attempts (indicates struggle)
    if (averageAttempts > 1) {
      difficulty += (averageAttempts - 1) * 0.1;
    }

    // Adjust for time variance (high variance indicates inconsistent difficulty)
    if (timeVariance > 0.5) {
      difficulty += timeVariance * 0.2;
    }

    // Normalize to valid range
    difficulty = Math.max(
      TaskDifficulty.MIN_DIFFICULTY,
      Math.min(TaskDifficulty.MAX_DIFFICULTY, difficulty),
    );

    // Round to precision
    difficulty =
      Math.round(difficulty / TaskDifficulty.PRECISION) *
      TaskDifficulty.PRECISION;

    return new TaskDifficulty(difficulty);
  }

  /**
   * Creates TaskDifficulty from CCIS level and task type
   */
  public static fromCCISLevelAndType(
    ccisLevel: number,
    taskType: string,
  ): TaskDifficulty {
    let baseDifficulty: number;

    // Base difficulty by CCIS level
    switch (ccisLevel) {
      case 1:
        baseDifficulty = 0.2;
        break; // Dependent learners
      case 2:
        baseDifficulty = 0.4;
        break; // Assisted learners
      case 3:
        baseDifficulty = 0.6;
        break; // Independent learners
      case 4:
        baseDifficulty = 0.8;
        break; // Autonomous learners
      default:
        baseDifficulty = 0.5;
        break;
    }

    // Adjust by task type
    switch (taskType) {
      case 'MICRO_CONCEPT':
        baseDifficulty *= 0.8; // Concepts are easier
        break;
      case 'MICRO_TASK':
        baseDifficulty *= 1.0; // Standard difficulty
        break;
      case 'FUSION_TASK':
        baseDifficulty *= 1.2; // Fusion tasks are harder
        break;
    }

    // Ensure within bounds
    baseDifficulty = Math.max(
      TaskDifficulty.MIN_DIFFICULTY,
      Math.min(TaskDifficulty.MAX_DIFFICULTY, baseDifficulty),
    );

    return new TaskDifficulty(baseDifficulty);
  }

  /**
   * Gets the difficulty category
   */
  public getCategory(): string {
    if (this.value <= 0.2) return 'VERY_EASY';
    if (this.value <= 0.35) return 'EASY';
    if (this.value <= 0.65) return 'MODERATE';
    if (this.value <= 0.8) return 'HARD';
    if (this.value <= 0.95) return 'VERY_HARD';
    return 'EXTREMELY_HARD';
  }

  /**
   * Gets the difficulty description
   */
  public getDescription(): string {
    switch (this.getCategory()) {
      case 'VERY_EASY':
        return 'Suitable for complete beginners, clear guidance provided';
      case 'EASY':
        return 'Basic skill application with some guidance';
      case 'MODERATE':
        return 'Standard workplace complexity requiring independent thinking';
      case 'HARD':
        return 'Complex scenarios requiring advanced problem-solving';
      case 'VERY_HARD':
        return 'Expert-level challenges with minimal guidance';
      case 'EXTREMELY_HARD':
        return 'Cutting-edge problems requiring innovation and mastery';
      default:
        return 'Unknown difficulty level';
    }
  }

  /**
   * Gets expected success rate for average student
   */
  public getExpectedSuccessRate(): number {
    // Inverse relationship with difficulty
    return Math.max(0.1, 1 - this.value);
  }

  /**
   * Gets expected completion time multiplier
   */
  public getTimeMultiplier(): number {
    // Harder tasks take longer
    return 0.5 + this.value * 1.5; // 0.5x to 2.0x base time
  }

  /**
   * Gets recommended CCIS levels for this difficulty
   */
  public getRecommendedCCISLevels(): number[] {
    if (this.value <= 0.3) return [1, 2]; // Easy tasks for beginners
    if (this.value <= 0.5) return [2, 3]; // Moderate tasks for developing learners
    if (this.value <= 0.7) return [3, 4]; // Hard tasks for advanced learners
    return [4]; // Very hard tasks only for autonomous learners
  }

  /**
   * Checks if difficulty needs recalibration
   */
  public needsRecalibration(
    actualSuccessRate: number,
    sampleSize: number,
  ): boolean {
    if (sampleSize < 10) {
      return false; // Not enough data
    }

    const expectedSuccessRate = this.getExpectedSuccessRate();
    const drift = Math.abs(actualSuccessRate - expectedSuccessRate);

    // Significant drift threshold increases with difficulty
    const threshold = 0.2 + this.value * 0.1;

    return drift > threshold;
  }

  /**
   * Adjusts difficulty based on performance data
   */
  public adjustFromPerformance(
    actualSuccessRate: number,
    adjustmentFactor: number = 0.1,
  ): TaskDifficulty {
    const expectedSuccessRate = this.getExpectedSuccessRate();
    const drift = actualSuccessRate - expectedSuccessRate;

    // If actual success rate is higher, task is easier (lower difficulty)
    // If actual success rate is lower, task is harder (higher difficulty)
    let adjustedDifficulty = this.value - drift * adjustmentFactor;

    // Clamp to valid range
    adjustedDifficulty = Math.max(
      TaskDifficulty.MIN_DIFFICULTY,
      Math.min(TaskDifficulty.MAX_DIFFICULTY, adjustedDifficulty),
    );

    // Round to precision
    adjustedDifficulty =
      Math.round(adjustedDifficulty / TaskDifficulty.PRECISION) *
      TaskDifficulty.PRECISION;

    return new TaskDifficulty(adjustedDifficulty);
  }

  /**
   * Compares difficulty levels
   */
  public isHarderThan(other: TaskDifficulty): boolean {
    return this.value > other.value;
  }

  /**
   * Compares difficulty levels
   */
  public isEasierThan(other: TaskDifficulty): boolean {
    return this.value < other.value;
  }

  /**
   * Checks if difficulty is within a range
   */
  public isWithinRange(min: number, max: number): boolean {
    return this.value >= min && this.value <= max;
  }

  /**
   * Gets the confidence interval for this difficulty level
   */
  public getConfidenceInterval(sampleSize: number): [number, number] {
    // Statistical confidence interval based on sample size
    const margin =
      1.96 * Math.sqrt((this.value * (1 - this.value)) / sampleSize);

    return [
      Math.max(TaskDifficulty.MIN_DIFFICULTY, this.value - margin),
      Math.min(TaskDifficulty.MAX_DIFFICULTY, this.value + margin),
    ];
  }

  /**
   * Validates the difficulty value
   */
  protected validate(value: number): void {
    if (value === null || value === undefined) {
      throw new InvalidDifficultyLevelError(
        'Task difficulty cannot be null or undefined',
      );
    }

    if (typeof value !== 'number') {
      throw new InvalidDifficultyLevelError('Task difficulty must be a number');
    }

    if (isNaN(value)) {
      throw new InvalidDifficultyLevelError('Task difficulty cannot be NaN');
    }

    if (!isFinite(value)) {
      throw new InvalidDifficultyLevelError('Task difficulty must be finite');
    }

    if (
      value < TaskDifficulty.MIN_DIFFICULTY ||
      value > TaskDifficulty.MAX_DIFFICULTY
    ) {
      throw new InvalidDifficultyLevelError(
        `Task difficulty must be between ${TaskDifficulty.MIN_DIFFICULTY} and ${TaskDifficulty.MAX_DIFFICULTY}, got: ${value}`,
      );
    }
  }

  /**
   * Equality check
   */
  public equals(other: ValueObject<number>): boolean {
    return (
      other instanceof TaskDifficulty &&
      Math.abs(this.value - other.value) < TaskDifficulty.PRECISION
    );
  }

  /**
   * String representation
   */
  public toString(): string {
    return `${this.value.toFixed(2)} (${this.getCategory()})`;
  }

  /**
   * Gets the numeric value
   */
  public getValue(): number {
    return this.value;
  }

  /**
   * Gets rounded value for display
   */
  public getDisplayValue(): string {
    return this.value.toFixed(2);
  }

  /**
   * Gets percentage representation
   */
  public toPercentage(): string {
    return `${Math.round(this.value * 100)}%`;
  }
}
