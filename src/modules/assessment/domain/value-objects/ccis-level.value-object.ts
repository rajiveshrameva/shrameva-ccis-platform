// src/modules/assessment/domain/value-objects/ccis-level.value-object.ts

import { ValueObject } from '../../../../shared/base/value-object.base';
import { BusinessRuleException } from '../../../../shared/domain/exceptions/domain-exception.base';

/**
 * CCIS Level Value Object
 *
 * Represents the Confidence-Competence Independence Scale (CCIS) levels
 * that are core to Shrameva's assessment engine and learning progression.
 *
 * CCIS Framework (Critical - Drives All Assessment Logic):
 * - Level 1 (0-25%): Dependent learner - needs step-by-step guidance
 * - Level 2 (25-50%): Guided practitioner - seeks help strategically
 * - Level 3 (50-85%): Self-directed performer - works independently
 * - Level 4 (85-100%): Autonomous expert - can mentor others
 *
 * This value object encapsulates:
 * - Level validation and constraints
 * - Percentage range calculations
 * - Level progression logic
 * - Comparison operations
 * - Integration with behavioral signals weighting
 *
 * Usage Examples:
 * ```typescript
 * // Create CCIS levels
 * const level1 = CCISLevel.fromLevel(1);
 * const level3 = CCISLevel.fromPercentage(75);
 *
 * // Level operations
 * const canProgress = level1.canProgressTo(2);
 * const description = level3.getDescription();
 * const isExpert = level3.isExpertLevel();
 *
 * // Comparison
 * const isHigher = level3.isHigherThan(level1);
 * const progression = level1.getProgressionTo(level3);
 * ```
 */

export interface CCISLevelProps {
  level: number;
  percentage: number;
}

export class CCISLevel extends ValueObject<CCISLevelProps> {
  // CCIS Level Constants (Based on GitHub Copilot Instructions)
  public static readonly MIN_LEVEL = 1;
  public static readonly MAX_LEVEL = 4;

  // Percentage Ranges for Each Level (Exact from Instructions)
  public static readonly LEVEL_1_MIN = 0;
  public static readonly LEVEL_1_MAX = 25;
  public static readonly LEVEL_2_MIN = 25;
  public static readonly LEVEL_2_MAX = 50;
  public static readonly LEVEL_3_MIN = 50;
  public static readonly LEVEL_3_MAX = 85;
  public static readonly LEVEL_4_MIN = 85;
  public static readonly LEVEL_4_MAX = 100;

  // Level Descriptions (From GitHub Copilot Instructions)
  private static readonly LEVEL_DESCRIPTIONS = {
    1: 'Dependent learner - needs step-by-step guidance',
    2: 'Guided practitioner - seeks help strategically',
    3: 'Self-directed performer - works independently',
    4: 'Autonomous expert - can mentor others',
  } as const;

  // Level Colors for UI (From GitHub Copilot Instructions)
  private static readonly LEVEL_COLORS = {
    1: '#f97316', // Warm Orange - "Learning"
    2: '#3b82f6', // Encouraging Blue - "Building"
    3: '#10b981', // Success Green - "Proficient"
    4: '#8b5cf6', // Premium Purple - "Expert"
  } as const;

  private constructor(props: CCISLevelProps) {
    super(props);
  }

  /**
   * Creates a CCIS Level from a level number (1-4)
   */
  public static fromLevel(level: number): CCISLevel {
    CCISLevel.validateLevel(level);
    const percentage = CCISLevel.levelToPercentage(level);
    return new CCISLevel({ level, percentage });
  }

  /**
   * Creates a CCIS Level from a percentage (0-100)
   */
  public static fromPercentage(percentage: number): CCISLevel {
    CCISLevel.validatePercentage(percentage);
    const level = CCISLevel.percentageToLevel(percentage);
    return new CCISLevel({ level, percentage });
  }

  /**
   * Creates a CCIS Level with exact percentage within a level
   */
  public static create(level: number, exactPercentage?: number): CCISLevel {
    CCISLevel.validateLevel(level);

    let percentage: number;
    if (exactPercentage !== undefined) {
      CCISLevel.validatePercentage(exactPercentage);
      const calculatedLevel = CCISLevel.percentageToLevel(exactPercentage);
      if (calculatedLevel !== level) {
        throw new BusinessRuleException(
          `Percentage ${exactPercentage}% does not match level ${level}`,
          'ccisLevel',
        );
      }
      percentage = exactPercentage;
    } else {
      percentage = CCISLevel.levelToPercentage(level);
    }

    return new CCISLevel({ level, percentage });
  }

  // Getters
  public getLevel(): number {
    return this.value.level;
  }

  public getPercentage(): number {
    return this.value.percentage;
  }

  public getDescription(): string {
    return CCISLevel.LEVEL_DESCRIPTIONS[
      this.value.level as keyof typeof CCISLevel.LEVEL_DESCRIPTIONS
    ];
  }

  public getColor(): string {
    return CCISLevel.LEVEL_COLORS[
      this.value.level as keyof typeof CCISLevel.LEVEL_COLORS
    ];
  }

  // Level Classification Methods
  public isDependentLearner(): boolean {
    return this.value.level === 1;
  }

  public isGuidedPractitioner(): boolean {
    return this.value.level === 2;
  }

  public isSelfDirected(): boolean {
    return this.value.level === 3;
  }

  public isExpertLevel(): boolean {
    return this.value.level === 4;
  }

  public isBeginnerLevel(): boolean {
    return this.value.level <= 2;
  }

  public isAdvancedLevel(): boolean {
    return this.value.level >= 3;
  }

  // Comparison Methods
  public isHigherThan(other: CCISLevel): boolean {
    return this.value.level > other.getLevel();
  }

  public isLowerThan(other: CCISLevel): boolean {
    return this.value.level < other.getLevel();
  }

  public equals(other: CCISLevel): boolean {
    return this.value.level === other.getLevel();
  }

  // Progression Methods
  public canProgressTo(targetLevel: number): boolean {
    return targetLevel <= CCISLevel.MAX_LEVEL && targetLevel > this.value.level;
  }

  public getNextLevel(): CCISLevel | null {
    if (this.value.level >= CCISLevel.MAX_LEVEL) {
      return null;
    }
    return CCISLevel.fromLevel(this.value.level + 1);
  }

  public getPreviousLevel(): CCISLevel | null {
    if (this.value.level <= CCISLevel.MIN_LEVEL) {
      return null;
    }
    return CCISLevel.fromLevel(this.value.level - 1);
  }

  public getProgressionTo(target: CCISLevel): number {
    const levelDifference = target.getLevel() - this.value.level;
    return Math.max(0, levelDifference);
  }

  // Range Methods
  public getMinPercentageForLevel(): number {
    return CCISLevel.getLevelRange(this.value.level).min;
  }

  public getMaxPercentageForLevel(): number {
    return CCISLevel.getLevelRange(this.value.level).max;
  }

  public getPercentageWithinLevel(): number {
    const range = CCISLevel.getLevelRange(this.value.level);
    const rangeSize = range.max - range.min;
    const positionInRange = this.value.percentage - range.min;
    return (positionInRange / rangeSize) * 100;
  }

  // Static Utility Methods
  private static validateLevel(level: number): void {
    if (!Number.isInteger(level)) {
      throw new BusinessRuleException(
        'CCIS level must be an integer',
        'ccisLevel',
      );
    }

    if (level < CCISLevel.MIN_LEVEL || level > CCISLevel.MAX_LEVEL) {
      throw new BusinessRuleException(
        `CCIS level must be between ${CCISLevel.MIN_LEVEL} and ${CCISLevel.MAX_LEVEL}`,
        'ccisLevel',
      );
    }
  }

  private static validatePercentage(percentage: number): void {
    if (typeof percentage !== 'number' || isNaN(percentage)) {
      throw new BusinessRuleException(
        'CCIS percentage must be a valid number',
        'ccisPercentage',
      );
    }

    if (percentage < 0 || percentage > 100) {
      throw new BusinessRuleException(
        'CCIS percentage must be between 0 and 100',
        'ccisPercentage',
      );
    }
  }

  private static levelToPercentage(level: number): number {
    const range = CCISLevel.getLevelRange(level);
    // Return the midpoint of the range as default percentage
    return (range.min + range.max) / 2;
  }

  private static percentageToLevel(percentage: number): number {
    if (
      percentage >= CCISLevel.LEVEL_1_MIN &&
      percentage < CCISLevel.LEVEL_2_MIN
    ) {
      return 1;
    }
    if (
      percentage >= CCISLevel.LEVEL_2_MIN &&
      percentage < CCISLevel.LEVEL_3_MIN
    ) {
      return 2;
    }
    if (
      percentage >= CCISLevel.LEVEL_3_MIN &&
      percentage < CCISLevel.LEVEL_4_MIN
    ) {
      return 3;
    }
    if (
      percentage >= CCISLevel.LEVEL_4_MIN &&
      percentage <= CCISLevel.LEVEL_4_MAX
    ) {
      return 4;
    }

    throw new BusinessRuleException(
      `Invalid percentage ${percentage} for CCIS level calculation`,
      'ccisPercentage',
    );
  }

  private static getLevelRange(level: number): { min: number; max: number } {
    switch (level) {
      case 1:
        return { min: CCISLevel.LEVEL_1_MIN, max: CCISLevel.LEVEL_1_MAX };
      case 2:
        return { min: CCISLevel.LEVEL_2_MIN, max: CCISLevel.LEVEL_2_MAX };
      case 3:
        return { min: CCISLevel.LEVEL_3_MIN, max: CCISLevel.LEVEL_3_MAX };
      case 4:
        return { min: CCISLevel.LEVEL_4_MIN, max: CCISLevel.LEVEL_4_MAX };
      default:
        throw new BusinessRuleException(
          `Invalid CCIS level: ${level}`,
          'ccisLevel',
        );
    }
  }

  // Value Object Implementation
  protected validate(props: CCISLevelProps): void {
    CCISLevel.validateLevel(props.level);
    CCISLevel.validatePercentage(props.percentage);

    // Ensure percentage matches level
    const calculatedLevel = CCISLevel.percentageToLevel(props.percentage);
    if (calculatedLevel !== props.level) {
      throw new BusinessRuleException(
        `Percentage ${props.percentage}% does not match level ${props.level}`,
        'ccisLevel',
      );
    }
  }

  public toJSON(): {
    level: number;
    percentage: number;
    description: string;
    color: string;
  } {
    return {
      level: this.value.level,
      percentage: this.value.percentage,
      description: this.getDescription(),
      color: this.getColor(),
    };
  }

  public toString(): string {
    return `CCIS Level ${this.value.level} (${this.value.percentage}%): ${this.getDescription()}`;
  }
}
