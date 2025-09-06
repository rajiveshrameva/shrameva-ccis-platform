import { ID } from '../../../../shared/value-objects/id.value-object';
import { createId } from '@paralleldrive/cuid2';

/**
 * CompetencyId Value Object
 *
 * Represents a unique identifier for a competency in the CCIS framework.
 * Links tasks to specific competencies for assessment and progress tracking.
 *
 * Competencies in the Shrameva system:
 * - COMMUNICATION
 * - PROBLEM_SOLVING
 * - TEAMWORK
 * - ADAPTABILITY
 * - TIME_MANAGEMENT
 * - TECHNICAL_SKILLS
 * - LEADERSHIP
 */
export class CompetencyId extends ID {
  private constructor(value: string) {
    super(value);
  }

  /**
   * Generates a new CompetencyId with CID
   */
  public static async generate(): Promise<CompetencyId> {
    const cidValue = await CompetencyId.generateCIDValue();
    return new CompetencyId(cidValue);
  }

  /**
   * Generates a new CompetencyId synchronously using CUID2
   */
  public static generateSync(): CompetencyId {
    const cuid = createId();
    const cidValue = `cid_${cuid.substring(0, 21)}`;
    return new CompetencyId(cidValue);
  }

  /**
   * Creates CompetencyId from string with validation
   */
  public static fromString(value: string): CompetencyId {
    return new CompetencyId(value);
  }

  /**
   * Returns the string representation
   */
  public toString(): string {
    return this.getValue();
  }

  /**
   * Equality check
   */
  public equals(other: ID): boolean {
    return (
      other instanceof CompetencyId && this.getValue() === other.getValue()
    );
  }
}
