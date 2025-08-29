/**
 * Base Value Object Class - DDD Value Object Pattern
 *
 * Implements DDD Value Object pattern with:
 * - Immutability (no setters, objects never change after creation)
 * - Value-based equality (objects are equal if all properties match)
 * - Validation on creation (invalid objects cannot be created)
 * - Self-validation (objects validate their own invariants)
 *
 * Key Characteristics:
 * - No identity - defined by their attributes
 * - Immutable - cannot be changed after creation
 * - Side-effect free - methods don't modify state
 * - Replaceable - swap objects with same value freely
 *
 * Used by: Email, PersonName, CCISLevel, Percentage, etc.
 */
export abstract class ValueObject<T> {
  /**
   * Protected constructor forces creation through static factory methods
   * This ensures validation happens before object creation
   */
  protected constructor(protected readonly value: T) {
    this.validate(value);
    Object.freeze(this); // Make entire object immutable
  }

  /**
   * Get the underlying value
   * Returns copy for complex types to prevent mutation
   */
  public getValue(): T {
    // For primitive types, return directly
    if (this.isPrimitive(this.value)) {
      return this.value;
    }

    // For complex types, return deep copy to prevent mutation
    return this.deepCopy(this.value);
  }

  /**
   * Value-based equality comparison
   * Two value objects are equal if all their properties are equal
   */
  public equals(other: ValueObject<T>): boolean {
    if (!other) {
      return false;
    }

    if (this.constructor !== other.constructor) {
      return false;
    }

    return this.deepEquals(this.value, other.value);
  }

  /**
   * Get hash code for this value object
   * Objects that are equal should have the same hash
   */
  public hashCode(): string {
    return this.calculateHash(this.value);
  }

  /**
   * String representation of the value object
   * Useful for debugging and logging
   */
  public toString(): string {
    if (typeof this.value === 'string') {
      return this.value;
    }

    if (typeof this.value === 'object' && this.value !== null) {
      return JSON.stringify(this.value);
    }

    return String(this.value);
  }

  /**
   * Validate the value object's invariants
   * Must be implemented by concrete value objects
   * Should throw descriptive errors for invalid values
   */
  protected abstract validate(value: T): void;

  /**
   * Check if value is a primitive type
   */
  private isPrimitive(value: any): boolean {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value === null ||
      value === undefined
    );
  }

  /**
   * Deep copy for complex objects
   */
  private deepCopy(value: T): T {
    if (this.isPrimitive(value)) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.deepCopy(item)) as unknown as T;
    }

    if (typeof value === 'object' && value !== null) {
      const copied = {} as T;
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          (copied as any)[key] = this.deepCopy((value as any)[key]);
        }
      }
      return copied;
    }

    return value;
  }

  /**
   * Deep equality comparison
   */
  private deepEquals(a: T, b: T): boolean {
    if (a === b) {
      return true;
    }

    if (a == null || b == null) {
      return a === b;
    }

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) {
        return false;
      }
      for (let i = 0; i < a.length; i++) {
        if (!this.deepEquals(a[i] as any, b[i] as any)) {
          return false;
        }
      }
      return true;
    }

    if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);

      if (keysA.length !== keysB.length) {
        return false;
      }

      for (const key of keysA) {
        if (!keysB.includes(key)) {
          return false;
        }

        if (!this.deepEquals((a as any)[key], (b as any)[key])) {
          return false;
        }
      }

      return true;
    }

    return false;
  }

  /**
   * Calculate hash for any value
   */
  private calculateHash(value: T): string {
    const str = JSON.stringify(value, Object.keys(value as any).sort());
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return hash.toString();
  }
}

/**
 * Error thrown when value object validation fails
 */
export class ValueObjectValidationError extends Error {
  constructor(
    public readonly valueObjectType: string,
    public readonly invalidValue: any,
    message: string,
  ) {
    super(
      `${valueObjectType} validation failed: ${message}. Invalid value: ${JSON.stringify(invalidValue)}`,
    );
    this.name = 'ValueObjectValidationError';
  }
}
