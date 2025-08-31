import {
  ValueObject,
  ValueObjectValidationError,
} from '../base/value-object.base';

/**
 * Base ID Value Object - Strongly-typed entity identifiers using CID format
 *
 * Uses nanoid with 'cid_' prefix for:
 * - URL-friendly identifiers (cid_V1StGXR8_Z5jdHi6B-myT)
 * - Shorter than UUIDs (21 chars vs 36 chars)
 * - Collision-resistant (same security as UUID v4)
 * - Easy to read, copy, and debug
 * - Database and API efficient
 *
 * Benefits:
 * - Type safety (StudentID vs AssessmentID cannot be mixed)
 * - Clean URLs: /students/cid_2k8s9d7f vs /students/uuid...
 * - Readable in logs and support tickets
 * - Mobile-friendly deep links
 * - Efficient database storage and indexing
 *
 * Format: cid_[21-character nanoid]
 * Example: cid_V1StGXR8_Z5jdHi6B-myT
 */
export abstract class ID extends ValueObject<string> {
  private static readonly CID_PREFIX = 'cid_';
  private static readonly NANOID_LENGTH = 21; // Default nanoid length

  protected constructor(value: string) {
    super(value);
  }

  /**
   * Create new ID with generated CID
   * Each concrete ID type must override this method
   */
  protected static async generateCID(): Promise<string> {
    const { nanoid } = await import('nanoid');
    return `${ID.CID_PREFIX}${nanoid(ID.NANOID_LENGTH)}`;
  }

  /**
   * Validate CID format
   * Must be 'cid_' prefix followed by valid nanoid characters
   */
  protected validate(value: string): void {
    if (!value) {
      throw new ValueObjectValidationError(
        this.constructor.name,
        value,
        'ID cannot be null or empty',
      );
    }

    if (typeof value !== 'string') {
      throw new ValueObjectValidationError(
        this.constructor.name,
        value,
        'ID must be a string',
      );
    }

    if (!this.isValidCID(value)) {
      throw new ValueObjectValidationError(
        this.constructor.name,
        value,
        'ID must be a valid CID format (cid_[nanoid])',
      );
    }
  }

  /**
   * Generate new CID using nanoid
   * Format: cid_[21-character-nanoid]
   */
  protected static async generateCIDValue(): Promise<string> {
    const { nanoid } = await import('nanoid');
    return `${ID.CID_PREFIX}${nanoid(ID.NANOID_LENGTH)}`;
  }

  /**
   * Validate CID format
   * Must start with 'cid_' and contain valid nanoid characters
   */
  private isValidCID(cid: string): boolean {
    // Must start with cid_ prefix
    if (!cid.startsWith(ID.CID_PREFIX)) {
      return false;
    }

    // Extract nanoid part
    const nanoidPart = cid.substring(ID.CID_PREFIX.length);

    // Must have correct length
    if (nanoidPart.length !== ID.NANOID_LENGTH) {
      return false;
    }

    // Must contain only valid nanoid characters
    // nanoid uses: A-Za-z0-9_-
    const validNanoidRegex = /^[A-Za-z0-9_-]+$/;
    return validNanoidRegex.test(nanoidPart);
  }

  /**
   * Get short representation of ID (prefix + first 8 characters of nanoid)
   * Example: cid_V1StGXR8 (useful for logging and debugging)
   */
  public toShortString(): string {
    const nanoidPart = this.getValue().substring(ID.CID_PREFIX.length);
    return `${ID.CID_PREFIX}${nanoidPart.substring(0, 8)}`;
  }

  /**
   * Get the nanoid part without prefix
   * Useful for database queries or external APIs that expect just the ID
   */
  public getNanoidPart(): string {
    return this.getValue().substring(ID.CID_PREFIX.length);
  }

  /**
   * Check if this is a valid CID format (static utility)
   */
  public static isValidCIDFormat(value: string): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }

    if (!value.startsWith(ID.CID_PREFIX)) {
      return false;
    }

    const nanoidPart = value.substring(ID.CID_PREFIX.length);

    if (nanoidPart.length !== ID.NANOID_LENGTH) {
      return false;
    }

    const validNanoidRegex = /^[A-Za-z0-9_-]+$/;
    return validNanoidRegex.test(nanoidPart);
  }

  /**
   * Check if this ID equals another ID of the same type
   */
  public equals(other: ID): boolean {
    if (!other) {
      return false;
    }

    // Type checking - StudentID should not equal AssessmentID even with same CID
    if (this.constructor !== other.constructor) {
      return false;
    }

    return super.equals(other);
  }
}

/**
 * Concrete ID implementations for Shrameva platform
 * Each provides type safety and domain-specific validation
 */

/**
 * Student identifier
 * Example: cid_V1StGXR8_Z5jdHi6B-myT
 * Used throughout the system to identify students uniquely
 */
export class StudentID extends ID {
  private constructor(value: string) {
    super(value);
  }

  public static async generate(): Promise<StudentID> {
    const value = await this.generateCIDValue();
    return new StudentID(value);
  }

  public static fromString(value: string): StudentID {
    return new StudentID(value);
  }

  /**
   * Create student profile URL
   * Example: /students/cid_V1StGXR8_Z5jdHi6B-myT
   */
  public toProfileURL(): string {
    return `/students/${this.getValue()}`;
  }
}

/**
 * Assessment identifier
 * Example: cid_2k8s9d7f3m1pq4r5s6t7u
 * Used to identify individual assessment attempts
 */
export class AssessmentID extends ID {
  private constructor(value: string) {
    super(value);
  }

  public static async generate(): Promise<AssessmentID> {
    const value = await this.generateCIDValue();
    return new AssessmentID(value);
  }

  public static fromString(value: string): AssessmentID {
    return new AssessmentID(value);
  }

  /**
   * Create assessment results URL
   */
  public toResultsURL(): string {
    return `/assessments/${this.getValue()}/results`;
  }
}

/**
 * Task identifier
 * Example: cid_8h2k5m7n9p1q3r4s6t7u9v
 * Used to identify individual learning tasks
 */
export class TaskID extends ID {
  private constructor(value: string) {
    super(value);
  }

  public static async generate(): Promise<TaskID> {
    const value = await this.generateCIDValue();
    return new TaskID(value);
  }

  public static fromString(value: string): TaskID {
    return new TaskID(value);
  }
}

/**
 * College identifier
 * Example: cid_3m6p9s2v5y8b1e4h7k0n3q
 * Used to identify partner colleges
 */
export class CollegeID extends ID {
  private constructor(value: string) {
    super(value);
  }

  public static async generate(): Promise<CollegeID> {
    const value = await this.generateCIDValue();
    return new CollegeID(value);
  }

  public static fromString(value: string): CollegeID {
    return new CollegeID(value);
  }

  /**
   * Create college dashboard URL
   */
  public toDashboardURL(): string {
    return `/colleges/${this.getValue()}/dashboard`;
  }
}

/**
 * Employer identifier
 * Example: cid_9v2y5b8e1h4k7n0q3s6v9y
 * Used to identify partner employers
 */
export class EmployerID extends ID {
  private constructor(value: string) {
    super(value);
  }

  public static async generate(): Promise<EmployerID> {
    const value = await this.generateCIDValue();
    return new EmployerID(value);
  }

  public static fromString(value: string): EmployerID {
    return new EmployerID(value);
  }

  /**
   * Create employer portal URL
   */
  public toPortalURL(): string {
    return `/employers/${this.getValue()}/portal`;
  }
}

/**
 * User identifier
 * Example: cid_4r7u0x3a6d9g2j5m8p1s4v
 * Used for authentication and authorization
 */
export class UserID extends ID {
  private constructor(value: string) {
    super(value);
  }

  public static async generate(): Promise<UserID> {
    const value = await this.generateCIDValue();
    return new UserID(value);
  }

  public static fromString(value: string): UserID {
    return new UserID(value);
  }
}

/**
 * CCIS Assessment identifier
 * Example: cid_7k0n3q6s9v2y5b8e1h4k7n
 * Used to track individual competency assessments
 */
export class CCISAssessmentID extends ID {
  private constructor(value: string) {
    super(value);
  }

  public static async generate(): Promise<CCISAssessmentID> {
    const value = await this.generateCIDValue();
    return new CCISAssessmentID(value);
  }

  public static fromString(value: string): CCISAssessmentID {
    return new CCISAssessmentID(value);
  }

  /**
   * Create CCIS assessment details URL
   */
  public toDetailsURL(): string {
    return `/ccis-assessments/${this.getValue()}/details`;
  }
}

/**
 * Person identifier
 * Example: cid_3k9t1d8e4n2pr6s8u9v0w
 * Used to identify individuals (students, employers, mentors, admins)
 */
export class PersonID extends ID {
  private constructor(value: string) {
    super(value);
  }

  public static async generate(): Promise<PersonID> {
    const value = await this.generateCIDValue();
    return new PersonID(value);
  }

  public static fromString(value: string): PersonID {
    return new PersonID(value);
  }

  /**
   * Create person profile URL
   * Example: /persons/cid_V1StGXR8_Z5jdHi6B-myT
   */
  public toProfileURL(): string {
    return `/persons/${this.getValue()}`;
  }
}

/**
 * Competency Assessment identifier
 * Example: cid_5n8q1t4w7z0c3f6i9l2o5r
 * Used to track individual competency assessment progress
 */
export class CompetencyAssessmentID extends ID {
  private constructor(value: string) {
    super(value);
  }

  public static async generate(): Promise<CompetencyAssessmentID> {
    const value = await this.generateCIDValue();
    return new CompetencyAssessmentID(value);
  }

  public static fromString(value: string): CompetencyAssessmentID {
    return new CompetencyAssessmentID(value);
  }

  /**
   * Create competency assessment details URL
   */
  public toDetailsURL(): string {
    return `/competency-assessments/${this.getValue()}/details`;
  }
}
