import { ValueObject } from '../../../../shared/base/value-object.base';

export interface ConfidenceScoreProps {
  score: number;
}

/**
 * Confidence Score Value Object
 *
 * Represents the AI's confidence in the assessment accuracy (0.0-1.0).
 * Higher scores indicate more reliable assessments.
 */
export class ConfidenceScore extends ValueObject<ConfidenceScoreProps> {
  private static readonly MIN_SCORE = 0.0;
  private static readonly MAX_SCORE = 1.0;

  private constructor(props: ConfidenceScoreProps) {
    super(props);
  }

  public static create(score: number): ConfidenceScore {
    return new ConfidenceScore({ score });
  }

  public static fromPercentage(percentage: number): ConfidenceScore {
    return this.create(percentage / 100);
  }

  protected validate(props: ConfidenceScoreProps): void {
    if (
      props.score < ConfidenceScore.MIN_SCORE ||
      props.score > ConfidenceScore.MAX_SCORE
    ) {
      throw new Error(
        `Confidence score must be between ${ConfidenceScore.MIN_SCORE} and ${ConfidenceScore.MAX_SCORE}`,
      );
    }
  }

  public getScore(): number {
    return this.getValue().score;
  }

  public getPercentage(): number {
    return this.getValue().score * 100;
  }

  public getDisplayValue(): string {
    return `${(this.getValue().score * 100).toFixed(1)}%`;
  }

  public getQualityLevel(): 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' {
    const score = this.getValue().score;
    if (score >= 0.9) return 'VERY_HIGH';
    if (score >= 0.7) return 'HIGH';
    if (score >= 0.5) return 'MODERATE';
    return 'LOW';
  }

  public isHighConfidence(): boolean {
    return this.getValue().score >= 0.9;
  }

  public isLowConfidence(): boolean {
    return this.getValue().score < 0.7;
  }

  public requiresHumanReview(): boolean {
    return this.getValue().score < 0.6;
  }

  public allowsEarlyTermination(): boolean {
    return this.getValue().score >= 0.95;
  }

  public toString(): string {
    return this.getDisplayValue();
  }
}
