// src/shared/domain/value-objects/percentage.value-object.ts

import { ValueObject } from '../base/value-object.base';
import {
  ValidationException,
  BusinessRuleException,
} from '../domain/exceptions/domain-exception.base';

/**
 * Percentage Value Object
 *
 * Represents a percentage value with comprehensive validation
 * specifically designed for CCIS (Confidence-Competence Independence Scale)
 * scores and other percentage-based metrics in the platform.
 *
 * Business Rules:
 * - Must be between 0 and 100 (inclusive)
 * - Supports decimal precision up to 2 places
 * - Provides CCIS level mapping functionality
 * - Immutable once created
 * - Type-safe operations and comparisons
 *
 * CCIS Level Mapping:
 * - Level 1: 0-25% (Dependent Learner)
 * - Level 2: 25-50% (Guided Practitioner)
 * - Level 3: 50-85% (Self-Directed Performer)
 * - Level 4: 85-100% (Autonomous Expert)
 *
 * @example
 * ```typescript
 * const score = Percentage.create(75.5);
 * console.log(score.getValue()); // 75.5
 * console.log(score.getCCISLevel()); // 3
 * console.log(score.getDisplayString()); // "75.5%"
 * ```
 */
export class Percentage extends ValueObject<number> {
  private static readonly MIN_VALUE = 0;
  private static readonly MAX_VALUE = 100;
  private static readonly DECIMAL_PLACES = 2;

  // CCIS Level boundaries
  private static readonly CCIS_LEVEL_BOUNDARIES = {
    LEVEL_1_MAX: 25,
    LEVEL_2_MAX: 50,
    LEVEL_3_MAX: 85,
    LEVEL_4_MAX: 100,
  };

  private constructor(value: number) {
    super(value);
  }

  /**
   * Creates a new Percentage value object
   *
   * @param value - Percentage value (0-100)
   * @returns Percentage instance
   * @throws ValidationException if validation fails
   */
  public static create(value: number): Percentage {
    return new Percentage(value);
  }

  /**
   * Creates a Percentage from a decimal ratio (0.0-1.0)
   *
   * @param ratio - Decimal ratio to convert
   * @returns Percentage instance
   * @throws ValidationException if validation fails
   *
   * @example
   * ```typescript
   * const percentage = Percentage.fromRatio(0.75); // 75%
   * ```
   */
  public static fromRatio(ratio: number): Percentage {
    if (ratio < 0 || ratio > 1) {
      throw new ValidationException('Ratio must be between 0.0 and 1.0');
    }

    const percentage = Number((ratio * 100).toFixed(this.DECIMAL_PLACES));
    return new Percentage(percentage);
  }

  /**
   * Creates a Percentage representing a CCIS level midpoint
   *
   * @param ccisLevel - CCIS level (1-4)
   * @returns Percentage representing the midpoint of that level
   * @throws BusinessRuleException if invalid level
   *
   * @example
   * ```typescript
   * const level3Mid = Percentage.fromCCISLevel(3); // 67.5% (midpoint of 50-85%)
   * ```
   */
  public static fromCCISLevel(ccisLevel: 1 | 2 | 3 | 4): Percentage {
    let midpoint: number;

    switch (ccisLevel) {
      case 1:
        midpoint = 12.5; // Midpoint of 0-25%
        break;
      case 2:
        midpoint = 37.5; // Midpoint of 25-50%
        break;
      case 3:
        midpoint = 67.5; // Midpoint of 50-85%
        break;
      case 4:
        midpoint = 92.5; // Midpoint of 85-100%
        break;
      default:
        throw new BusinessRuleException(
          'CCIS level must be 1, 2, 3, or 4',
          'INVALID_CCIS_LEVEL',
        );
    }

    return new Percentage(midpoint);
  }

  /**
   * Validates the percentage value according to business rules
   *
   * @param value - Percentage value to validate
   * @throws ValidationException if validation fails
   */
  protected validate(value: number): void {
    if (value == null || value === undefined) {
      throw new ValidationException(
        'Percentage value cannot be null or undefined',
        'percentage',
        value,
      );
    }

    if (typeof value !== 'number') {
      throw new ValidationException(
        'Percentage value must be a number',
        'percentage',
        value,
      );
    }

    if (isNaN(value)) {
      throw new ValidationException(
        'Percentage value cannot be NaN',
        'percentage',
        value,
      );
    }

    if (!isFinite(value)) {
      throw new ValidationException(
        'Percentage value must be finite',
        'percentage',
        value,
      );
    }

    if (value < Percentage.MIN_VALUE || value > Percentage.MAX_VALUE) {
      throw new ValidationException(
        `Percentage must be between ${Percentage.MIN_VALUE} and ${Percentage.MAX_VALUE}, got ${value}`,
        'percentage',
        value,
      );
    }

    // Validate decimal places
    const decimalPlaces = this.countDecimalPlaces(value);
    if (decimalPlaces > Percentage.DECIMAL_PLACES) {
      throw new ValidationException(
        `Percentage cannot have more than ${Percentage.DECIMAL_PLACES} decimal places, got ${decimalPlaces}`,
        'percentage',
        value,
      );
    }
  }

  /**
   * Counts decimal places in a number
   */
  private countDecimalPlaces(value: number): number {
    if (Math.floor(value) === value) return 0;

    const str = value.toString();
    if (str.indexOf('.') !== -1 && str.indexOf('e-') === -1) {
      return str.split('.')[1].length;
    } else if (str.indexOf('e-') !== -1) {
      const parts = str.split('e-');
      return parseInt(parts[1], 10);
    }
    return 0;
  }

  /**
   * Gets the CCIS level corresponding to this percentage
   *
   * @returns CCIS level (1-4)
   */
  public getCCISLevel(): 1 | 2 | 3 | 4 {
    const { LEVEL_1_MAX, LEVEL_2_MAX, LEVEL_3_MAX } =
      Percentage.CCIS_LEVEL_BOUNDARIES;

    if (this.value < LEVEL_1_MAX) {
      return 1;
    } else if (this.value < LEVEL_2_MAX) {
      return 2;
    } else if (this.value < LEVEL_3_MAX) {
      return 3;
    } else {
      return 4;
    }
  }

  /**
   * Gets the CCIS level description for this percentage
   *
   * @returns Human-readable CCIS level description
   */
  public getCCISLevelDescription(): string {
    const level = this.getCCISLevel();

    const descriptions = {
      1: 'Dependent Learner',
      2: 'Guided Practitioner',
      3: 'Self-Directed Performer',
      4: 'Autonomous Expert',
    };

    return descriptions[level];
  }

  /**
   * Checks if this percentage represents workplace readiness
   * (CCIS Level 3+ indicates job readiness)
   *
   * @returns True if Level 3 or 4
   */
  public isWorkplaceReady(): boolean {
    return this.getCCISLevel() >= 3;
  }

  /**
   * Checks if this percentage represents mastery level
   * (CCIS Level 4 indicates autonomous expertise)
   *
   * @returns True if Level 4
   */
  public isMasteryLevel(): boolean {
    return this.getCCISLevel() === 4;
  }

  /**
   * Gets the percentage as a ratio (0.0-1.0)
   *
   * @returns Decimal ratio
   */
  public asRatio(): number {
    return Number((this.value / 100).toFixed(4));
  }

  /**
   * Gets the display string with percentage symbol
   *
   * @param precision - Number of decimal places (default: auto)
   * @returns Formatted percentage string
   *
   * @example
   * ```typescript
   * const p = Percentage.create(75.5);
   * p.getDisplayString(); // "75.5%"
   * p.getDisplayString(0); // "76%" (rounded)
   * ```
   */
  public getDisplayString(precision?: number): string {
    if (precision !== undefined) {
      return `${this.value.toFixed(precision)}%`;
    }

    // Auto-detect precision based on value
    return this.value % 1 === 0 ? `${this.value}%` : `${this.value}%`;
  }

  /**
   * Adds another percentage (capped at 100%)
   *
   * @param other - Percentage to add
   * @returns New Percentage instance
   */
  public add(other: Percentage): Percentage {
    const sum = Math.min(this.value + other.value, Percentage.MAX_VALUE);
    return new Percentage(Number(sum.toFixed(Percentage.DECIMAL_PLACES)));
  }

  /**
   * Subtracts another percentage (floored at 0%)
   *
   * @param other - Percentage to subtract
   * @returns New Percentage instance
   */
  public subtract(other: Percentage): Percentage {
    const difference = Math.max(this.value - other.value, Percentage.MIN_VALUE);
    return new Percentage(
      Number(difference.toFixed(Percentage.DECIMAL_PLACES)),
    );
  }

  /**
   * Multiplies by a factor
   *
   * @param factor - Multiplication factor
   * @returns New Percentage instance (capped at 100%)
   */
  public multiply(factor: number): Percentage {
    if (typeof factor !== 'number' || !isFinite(factor)) {
      throw new ValidationException(
        'Multiplication factor must be a finite number',
        'factor',
        factor,
      );
    }

    const result = Math.min(this.value * factor, Percentage.MAX_VALUE);
    return new Percentage(Number(result.toFixed(Percentage.DECIMAL_PLACES)));
  }
}
