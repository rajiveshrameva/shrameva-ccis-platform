import { ValueObject } from '../../../../shared/base/value-object.base';
import { InvalidTaskTypeError } from '../exceptions/task.exceptions';

/**
 * TaskType Value Object
 *
 * Represents the fundamental type of learning task in the CCIS system.
 * Each type has different characteristics in terms of duration, complexity,
 * and learning objectives.
 *
 * Types:
 * - MICRO_CONCEPT: 2-minute bite-sized learning concepts (Level 1-2)
 * - MICRO_TASK: 5-minute skill practice exercises (Level 2-3)
 * - FUSION_TASK: 15-30 minute complex multi-competency challenges (Level 3-4)
 */
export class TaskType extends ValueObject<string> {
  private static readonly VALID_TYPES = [
    'MICRO_CONCEPT',
    'MICRO_TASK',
    'FUSION_TASK',
  ] as const;

  public static readonly MICRO_CONCEPT = new TaskType('MICRO_CONCEPT');
  public static readonly MICRO_TASK = new TaskType('MICRO_TASK');
  public static readonly FUSION_TASK = new TaskType('FUSION_TASK');

  private constructor(value: string) {
    super(value);
  }

  /**
   * Creates TaskType from string with validation
   */
  public static fromString(value: string): TaskType {
    return new TaskType(value);
  }

  /**
   * Gets all valid task types
   */
  public static getValidTypes(): readonly string[] {
    return TaskType.VALID_TYPES;
  }

  /**
   * Checks if a string is a valid task type
   */
  public static isValidType(value: string): boolean {
    const validTypes = ['MICRO_CONCEPT', 'MICRO_TASK', 'FUSION_TASK'];
    return validTypes.includes(value);
  }

  /**
   * Gets the expected duration range for this task type
   */
  public getExpectedDurationRange(): [number, number] {
    switch (this.value) {
      case 'MICRO_CONCEPT':
        return [1, 3]; // 1-3 minutes
      case 'MICRO_TASK':
        return [3, 8]; // 3-8 minutes
      case 'FUSION_TASK':
        return [15, 30]; // 15-30 minutes
      default:
        throw new InvalidTaskTypeError(`Unknown task type: ${this.value}`);
    }
  }

  /**
   * Gets the primary CCIS levels this task type targets
   */
  public getTargetCCISLevels(): number[] {
    switch (this.value) {
      case 'MICRO_CONCEPT':
        return [1, 2]; // Dependent and Assisted learners
      case 'MICRO_TASK':
        return [2, 3]; // Assisted and Independent learners
      case 'FUSION_TASK':
        return [3, 4]; // Independent and Autonomous learners
      default:
        throw new InvalidTaskTypeError(`Unknown task type: ${this.value}`);
    }
  }

  /**
   * Gets the complexity level description
   */
  public getComplexityDescription(): string {
    switch (this.value) {
      case 'MICRO_CONCEPT':
        return 'Single concept introduction with guided examples';
      case 'MICRO_TASK':
        return 'Focused skill practice with immediate feedback';
      case 'FUSION_TASK':
        return 'Multi-competency integration requiring strategic thinking';
      default:
        throw new InvalidTaskTypeError(`Unknown task type: ${this.value}`);
    }
  }

  /**
   * Determines if this task type supports collaborative features
   */
  public supportsCollaboration(): boolean {
    return this.value === 'FUSION_TASK';
  }

  /**
   * Determines if this task type requires industry validation
   */
  public requiresIndustryValidation(): boolean {
    return this.value === 'FUSION_TASK';
  }

  /**
   * Gets the maximum number of hints available for this task type
   */
  public getMaxHints(): number {
    switch (this.value) {
      case 'MICRO_CONCEPT':
        return 3; // More guidance for concepts
      case 'MICRO_TASK':
        return 2; // Moderate guidance for practice
      case 'FUSION_TASK':
        return 1; // Minimal guidance for complex tasks
      default:
        throw new InvalidTaskTypeError(`Unknown task type: ${this.value}`);
    }
  }

  /**
   * Validates the task type value
   */
  protected validate(value: string): void {
    if (!value) {
      throw new InvalidTaskTypeError('Task type cannot be empty');
    }

    if (typeof value !== 'string') {
      throw new InvalidTaskTypeError('Task type must be a string');
    }

    const validTypes = ['MICRO_CONCEPT', 'MICRO_TASK', 'FUSION_TASK'];
    if (!validTypes.includes(value)) {
      throw new InvalidTaskTypeError(
        `Invalid task type: ${value}. Valid types are: ${validTypes.join(', ')}`,
      );
    }
  }

  /**
   * Equality check with enhanced type safety
   */
  public equals(other: ValueObject<string>): boolean {
    return other instanceof TaskType && this.value === other.value;
  }

  /**
   * String representation
   */
  public toString(): string {
    return this.value;
  }

  /**
   * Gets the value for database storage
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * Checks if this is a micro concept task
   */
  public isMicroConcept(): boolean {
    return this.value === 'MICRO_CONCEPT';
  }

  /**
   * Checks if this is a micro task
   */
  public isMicroTask(): boolean {
    return this.value === 'MICRO_TASK';
  }

  /**
   * Checks if this is a fusion task
   */
  public isFusionTask(): boolean {
    return this.value === 'FUSION_TASK';
  }
}
