import { ValueObject } from '../../../../shared/base/value-object.base';
import { InvalidTaskDurationError } from '../exceptions/task.exceptions';

/**
 * TaskDuration Value Object
 *
 * Represents the expected completion time for a task in minutes.
 * Aligned with GenZ attention spans and workplace efficiency requirements.
 *
 * Duration ranges by task type:
 * - MICRO_CONCEPT: 1-3 minutes (bite-sized learning)
 * - MICRO_TASK: 3-8 minutes (focused skill practice)
 * - FUSION_TASK: 15-30 minutes (complex integration)
 *
 * Durations are calibrated based on actual student completion times
 * and adjusted for different CCIS levels and difficulty settings.
 */
export class TaskDuration extends ValueObject<number> {
  private static readonly MIN_DURATION = 1; // 1 minute minimum
  private static readonly MAX_DURATION = 60; // 60 minutes maximum
  private static readonly MICRO_CONCEPT_MAX = 3;
  private static readonly MICRO_TASK_MAX = 8;
  private static readonly FUSION_TASK_MIN = 15;

  private constructor(value: number) {
    super(value);
  }

  /**
   * Creates TaskDuration from number with validation
   */
  public static fromMinutes(minutes: number): TaskDuration {
    return new TaskDuration(minutes);
  }

  /**
   * Creates TaskDuration from task type with default
   */
  public static fromTaskType(taskType: string): TaskDuration {
    switch (taskType) {
      case 'MICRO_CONCEPT':
        return new TaskDuration(2); // 2 minutes default
      case 'MICRO_TASK':
        return new TaskDuration(5); // 5 minutes default
      case 'FUSION_TASK':
        return new TaskDuration(20); // 20 minutes default
      default:
        return new TaskDuration(5); // Default to micro task duration
    }
  }

  /**
   * Creates TaskDuration from performance data
   */
  public static fromPerformanceData(
    averageCompletionTime: number,
    percentile90: number,
    taskType: string,
  ): TaskDuration {
    // Use 75th percentile as expected duration (balance between average and outliers)
    const percentile75 =
      averageCompletionTime + (percentile90 - averageCompletionTime) * 0.5;

    // Round to nearest minute
    let duration = Math.round(percentile75);

    // Ensure within task type bounds
    duration = TaskDuration.constrainByTaskType(duration, taskType);

    return new TaskDuration(duration);
  }

  /**
   * Adjusts duration based on CCIS level
   */
  public adjustForCCISLevel(ccisLevel: number): TaskDuration {
    let multiplier: number;

    switch (ccisLevel) {
      case 1: // Dependent learners need more time
        multiplier = 1.5;
        break;
      case 2: // Assisted learners need some extra time
        multiplier = 1.2;
        break;
      case 3: // Independent learners use standard time
        multiplier = 1.0;
        break;
      case 4: // Autonomous learners can be faster
        multiplier = 0.8;
        break;
      default:
        multiplier = 1.0;
    }

    const adjustedDuration = Math.round(this.value * multiplier);
    return new TaskDuration(
      Math.max(
        TaskDuration.MIN_DURATION,
        Math.min(TaskDuration.MAX_DURATION, adjustedDuration),
      ),
    );
  }

  /**
   * Adjusts duration based on difficulty level
   */
  public adjustForDifficulty(difficultyLevel: number): TaskDuration {
    // Linear relationship: higher difficulty = more time
    const multiplier = 0.7 + difficultyLevel * 0.6; // 0.7x to 1.3x

    const adjustedDuration = Math.round(this.value * multiplier);
    return new TaskDuration(
      Math.max(
        TaskDuration.MIN_DURATION,
        Math.min(TaskDuration.MAX_DURATION, adjustedDuration),
      ),
    );
  }

  /**
   * Gets the duration category
   */
  public getCategory(): string {
    if (this.value <= 3) return 'MICRO_CONCEPT';
    if (this.value <= 8) return 'MICRO_TASK';
    if (this.value <= 15) return 'SHORT_TASK';
    if (this.value <= 30) return 'FUSION_TASK';
    if (this.value <= 45) return 'EXTENDED_TASK';
    return 'LONG_TASK';
  }

  /**
   * Gets duration in different formats
   */
  public getDurationFormats() {
    return {
      minutes: this.value,
      seconds: this.value * 60,
      milliseconds: this.value * 60 * 1000,
      humanReadable: this.getHumanReadableFormat(),
    };
  }

  /**
   * Gets human-readable format
   */
  public getHumanReadableFormat(): string {
    if (this.value < 1) {
      return '< 1 minute';
    } else if (this.value === 1) {
      return '1 minute';
    } else if (this.value < 60) {
      return `${this.value} minutes`;
    } else {
      const hours = Math.floor(this.value / 60);
      const minutes = this.value % 60;
      if (minutes === 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
      } else {
        return `${hours}h ${minutes}m`;
      }
    }
  }

  /**
   * Gets expected completion time range
   */
  public getCompletionTimeRange(): [number, number] {
    // Most students complete within 50% to 150% of expected time
    const min = Math.max(1, Math.round(this.value * 0.5));
    const max = Math.round(this.value * 1.5);
    return [min, max];
  }

  /**
   * Checks if actual completion time is within normal range
   */
  public isNormalCompletionTime(actualMinutes: number): boolean {
    const [min, max] = this.getCompletionTimeRange();
    return actualMinutes >= min && actualMinutes <= max;
  }

  /**
   * Classifies completion time performance
   */
  public classifyCompletionTime(actualMinutes: number): string {
    const ratio = actualMinutes / this.value;

    if (ratio < 0.5) return 'VERY_FAST';
    if (ratio < 0.8) return 'FAST';
    if (ratio <= 1.2) return 'NORMAL';
    if (ratio <= 1.8) return 'SLOW';
    if (ratio <= 2.5) return 'VERY_SLOW';
    return 'EXTREMELY_SLOW';
  }

  /**
   * Gets attention span appropriateness
   */
  public getAttentionSpanAppropriateness(): string {
    if (this.value <= 5) return 'EXCELLENT'; // Perfect for micro-learning
    if (this.value <= 10) return 'GOOD'; // Good for focused tasks
    if (this.value <= 20) return 'MODERATE'; // Acceptable for complex tasks
    if (this.value <= 30) return 'CHALLENGING'; // Requires strong focus
    return 'DIFFICULT'; // May cause attention fatigue
  }

  /**
   * Calculates break recommendations
   */
  public getBreakRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.value > 15) {
      recommendations.push('Consider a 1-2 minute break halfway through');
    }

    if (this.value > 30) {
      recommendations.push('Include multiple micro-breaks');
      recommendations.push('Break into smaller sub-tasks');
    }

    if (this.value > 45) {
      recommendations.push('Strongly consider breaking into multiple sessions');
    }

    return recommendations;
  }

  /**
   * Checks compatibility with task type
   */
  public isCompatibleWithTaskType(taskType: string): boolean {
    switch (taskType) {
      case 'MICRO_CONCEPT':
        return this.value <= TaskDuration.MICRO_CONCEPT_MAX;
      case 'MICRO_TASK':
        return this.value <= TaskDuration.MICRO_TASK_MAX;
      case 'FUSION_TASK':
        return this.value >= TaskDuration.FUSION_TASK_MIN;
      default:
        return true;
    }
  }

  /**
   * Constrains duration by task type
   */
  private static constrainByTaskType(
    duration: number,
    taskType: string,
  ): number {
    switch (taskType) {
      case 'MICRO_CONCEPT':
        return Math.min(duration, TaskDuration.MICRO_CONCEPT_MAX);
      case 'MICRO_TASK':
        return Math.min(duration, TaskDuration.MICRO_TASK_MAX);
      case 'FUSION_TASK':
        return Math.max(duration, TaskDuration.FUSION_TASK_MIN);
      default:
        return duration;
    }
  }

  /**
   * Validates the duration value
   */
  protected validate(value: number): void {
    if (value === null || value === undefined) {
      throw new InvalidTaskDurationError(
        'Task duration cannot be null or undefined',
      );
    }

    if (typeof value !== 'number') {
      throw new InvalidTaskDurationError('Task duration must be a number');
    }

    if (isNaN(value)) {
      throw new InvalidTaskDurationError('Task duration cannot be NaN');
    }

    if (!isFinite(value)) {
      throw new InvalidTaskDurationError('Task duration must be finite');
    }

    if (!Number.isInteger(value)) {
      throw new InvalidTaskDurationError(
        'Task duration must be a whole number of minutes',
      );
    }

    if (value < TaskDuration.MIN_DURATION) {
      throw new InvalidTaskDurationError(
        `Task duration must be at least ${TaskDuration.MIN_DURATION} minute, got: ${value}`,
      );
    }

    if (value > TaskDuration.MAX_DURATION) {
      throw new InvalidTaskDurationError(
        `Task duration must not exceed ${TaskDuration.MAX_DURATION} minutes, got: ${value}`,
      );
    }
  }

  /**
   * Equality check
   */
  public equals(other: ValueObject<number>): boolean {
    return other instanceof TaskDuration && this.value === other.value;
  }

  /**
   * String representation
   */
  public toString(): string {
    return this.getHumanReadableFormat();
  }

  /**
   * Gets the numeric value in minutes
   */
  public getValue(): number {
    return this.value;
  }

  /**
   * Gets value in seconds
   */
  public getSeconds(): number {
    return this.value * 60;
  }

  /**
   * Gets value in milliseconds
   */
  public getMilliseconds(): number {
    return this.value * 60 * 1000;
  }

  /**
   * Compares durations
   */
  public isLongerThan(other: TaskDuration): boolean {
    return this.value > other.value;
  }

  /**
   * Compares durations
   */
  public isShorterThan(other: TaskDuration): boolean {
    return this.value < other.value;
  }

  /**
   * Adds duration
   */
  public add(minutes: number): TaskDuration {
    return new TaskDuration(this.value + minutes);
  }

  /**
   * Subtracts duration
   */
  public subtract(minutes: number): TaskDuration {
    const result = this.value - minutes;
    return new TaskDuration(Math.max(TaskDuration.MIN_DURATION, result));
  }
}
