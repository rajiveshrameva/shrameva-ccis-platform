import { ID } from '../../../../shared/value-objects/id.value-object';
import { createId } from '@paralleldrive/cuid2';

/**
 * TaskId Value Object
 *
 * Represents a unique identifier for a task using CID format for better
 * performance and collision resistance in high-volume systems.
 *
 * Key Features:
 * - CID format compatible with system standards
 * - Collision-resistant generation
 * - URL-safe format
 * - Database-optimized length
 */
export class TaskId extends ID {
  private constructor(value: string) {
    super(value);
  }

  /**
   * Generates a new TaskId with CID
   */
  public static async generate(): Promise<TaskId> {
    const cidValue = await TaskId.generateCIDValue();
    return new TaskId(cidValue);
  }

  /**
   * Generates a new TaskId synchronously using CUID2
   */
  public static generateSync(): TaskId {
    // Generate CUID2 and convert to CID format
    const cuid = createId();
    const cidValue = `cid_${cuid.substring(0, 21)}`;
    return new TaskId(cidValue);
  }

  /**
   * Creates TaskId from string with validation
   */
  public static fromString(value: string): TaskId {
    return new TaskId(value);
  }

  /**
   * Creates TaskId from existing CUID value
   */
  public static fromCUID(value: string): TaskId {
    // Convert CUID to CID format for consistency
    const cidValue = `cid_${value.substring(0, 21)}`;
    return new TaskId(cidValue);
  }

  /**
   * Returns the string representation
   */
  public toString(): string {
    return this.getValue();
  }

  /**
   * Equality check with enhanced type safety
   */
  public equals(other: ID): boolean {
    return other instanceof TaskId && this.getValue() === other.getValue();
  }
}
