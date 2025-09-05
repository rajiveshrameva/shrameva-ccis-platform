import { ValueObject } from '../../../../shared/base/value-object.base';

export interface CCISLevelProps {
  level: number;
}

/**
 * CCIS Level Value Object
 *
 * Represents the Confidence-Competence Independence Scale level (1-4).
 * Each level represents increasing independence and competency.
 */
export class CCISLevel extends ValueObject<CCISLevelProps> {
  private static readonly MIN_LEVEL = 1;
  private static readonly MAX_LEVEL = 4;

  private constructor(props: CCISLevelProps) {
    super(props);
  }

  public static create(level: number): CCISLevel {
    return new CCISLevel({ level });
  }

  protected validate(props: CCISLevelProps): void {
    if (
      !Number.isInteger(props.level) ||
      props.level < CCISLevel.MIN_LEVEL ||
      props.level > CCISLevel.MAX_LEVEL
    ) {
      throw new Error(
        `CCIS level must be an integer between ${CCISLevel.MIN_LEVEL} and ${CCISLevel.MAX_LEVEL}`,
      );
    }
  }

  public getLevel(): number {
    return this.getValue().level;
  }

  public getDisplayName(): string {
    const displayNames: Record<number, string> = {
      1: 'Dependent Learner',
      2: 'Guided Practitioner',
      3: 'Self-directed Performer',
      4: 'Autonomous Expert',
    };

    return displayNames[this.getValue().level];
  }

  public getDescription(): string {
    const descriptions: Record<number, string> = {
      1: '0-25% mastery with high scaffolding needed',
      2: '25-50% mastery with moderate scaffolding needed',
      3: '50-85% mastery with minimal scaffolding needed',
      4: '85-100% mastery with no scaffolding needed',
    };

    return descriptions[this.getValue().level];
  }

  public getPercentageRange(): { min: number; max: number } {
    const ranges: Record<number, { min: number; max: number }> = {
      1: { min: 0, max: 25 },
      2: { min: 25, max: 50 },
      3: { min: 50, max: 85 },
      4: { min: 85, max: 100 },
    };

    return ranges[this.getValue().level];
  }

  public canAdvanceTo(nextLevel: CCISLevel): boolean {
    return nextLevel.getValue().level === this.getValue().level + 1;
  }

  public isMaxLevel(): boolean {
    return this.getValue().level === CCISLevel.MAX_LEVEL;
  }

  public isMinLevel(): boolean {
    return this.getValue().level === CCISLevel.MIN_LEVEL;
  }

  public toString(): string {
    return `Level ${this.getValue().level}: ${this.getDisplayName()}`;
  }
}
