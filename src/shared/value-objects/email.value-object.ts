// src/shared/domain/value-objects/email.value-object.ts

import { ValueObject } from '../base/value-object.base';

/**
 * Email Value Object
 *
 * Represents a validated email address with comprehensive validation
 * following RFC 5322 standards with practical constraints for the
 * Indian engineering student context.
 *
 * Business Rules:
 * - Must be a valid email format
 * - Must not exceed 254 characters (RFC limit)
 * - Must not contain dangerous characters for security
 * - Should handle common Indian domain patterns
 * - Case-insensitive storage (normalized to lowercase)
 *
 * @example
 * ```typescript
 * const email = Email.create('student@vtu.ac.in');
 * console.log(email.getValue()); // 'student@vtu.ac.in'
 * ```
 */
export class Email extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  /**
   * Creates a new Email value object
   *
   * @param value - Email string to validate and create
   * @returns Email instance
   * @throws DomainException if validation fails
   */
  public static create(value: string): Email {
    const normalizedValue = this.normalizeEmail(value);
    return new Email(normalizedValue);
  }

  /**
   * Validates the email according to business rules
   *
   * @param value - Email string to validate
   * @throws DomainException if validation fails
   */
  protected validate(value: string): void {
    if (!value) {
      throw new DomainException('Email cannot be empty');
    }

    if (typeof value !== 'string') {
      throw new DomainException('Email must be a string');
    }

    const normalizedValue = Email.normalizeEmail(value);

    // RFC 5322 length limit
    if (normalizedValue.length > 254) {
      throw new DomainException('Email address too long (max 254 characters)');
    }

    // Basic format validation using comprehensive regex
    if (!this.isValidEmailFormat(normalizedValue)) {
      throw new DomainException('Invalid email format');
    }

    // Security validation
    if (this.containsDangerousCharacters(normalizedValue)) {
      throw new DomainException('Email contains invalid characters');
    }

    // Business domain validation for educational context
    if (this.isDisposableEmail(normalizedValue)) {
      throw new DomainException('Disposable email addresses are not allowed');
    }
  }

  /**
   * Normalizes email address (lowercase, trim)
   */
  private static normalizeEmail(email: string): string {
    if (!email) return '';
    return email.trim().toLowerCase();
  }

  /**
   * Validates email format using RFC 5322 compliant regex
   * Optimized for practical use cases while maintaining security
   */
  private isValidEmailFormat(email: string): boolean {
    // Comprehensive email regex that handles most real-world cases
    // Based on RFC 5322 but practical for business use
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(email)) {
      return false;
    }

    // Additional format checks
    const parts = email.split('@');
    if (parts.length !== 2) {
      return false;
    }

    const [localPart, domain] = parts;

    // Local part validation
    if (localPart.length === 0 || localPart.length > 64) {
      return false;
    }

    // Domain validation
    if (domain.length === 0 || domain.length > 253) {
      return false;
    }

    // Check for consecutive dots
    if (email.includes('..')) {
      return false;
    }

    // Check for leading/trailing dots in local part
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return false;
    }

    return true;
  }

  /**
   * Checks for potentially dangerous characters that could indicate
   * injection attempts or malformed emails
   */
  private containsDangerousCharacters(email: string): boolean {
    // Characters that should not appear in legitimate email addresses
    const dangerousChars = /[\x00-\x1F\x7F<>()[\]\\,;:"\s]/;
    return dangerousChars.test(email);
  }

  /**
   * Checks if email is from a known disposable email provider
   * Important for educational platform to ensure legitimate student emails
   */
  private isDisposableEmail(email: string): boolean {
    const domain = email.split('@')[1];

    // Common disposable email domains (expandable list)
    const disposableDomains = [
      '10minutemail.com',
      'tempmail.org',
      'guerrillamail.com',
      'mailinator.com',
      'yopmail.com',
      'temp-mail.org',
      'throwaway.email',
    ];

    return disposableDomains.includes(domain);
  }

  /**
   * Gets the domain part of the email
   *
   * @returns Domain string (e.g., 'gmail.com')
   */
  public getDomain(): string {
    return this.value.split('@')[1];
  }

  /**
   * Gets the local part of the email (before @)
   *
   * @returns Local part string (e.g., 'student')
   */
  public getLocalPart(): string {
    return this.value.split('@')[0];
  }

  /**
   * Checks if email is from an educational institution
   * Useful for identifying students vs general users
   *
   * @returns True if from educational domain
   */
  public isEducationalEmail(): boolean {
    const domain = this.getDomain();

    // Indian educational domain patterns
    const educationalPatterns = [
      '.edu',
      '.ac.in',
      '.edu.in',
      'vtu.ac.in',
      'anna.ac.in',
      'jntua.ac.in',
      'jntuh.ac.in',
      'jntuk.ac.in',
    ];

    return educationalPatterns.some((pattern) => domain.endsWith(pattern));
  }

  /**
   * Checks if email appears to be from a student
   * Based on common naming patterns in educational emails
   *
   * @returns True if appears to be student email
   */
  public looksLikeStudentEmail(): boolean {
    const localPart = this.getLocalPart().toLowerCase();

    // Common student email patterns
    const studentPatterns = [
      /^\d{2}[a-z]{2}\d{2}[a-z]{2}\d{3}$/, // Roll number patterns like 19cs02001
      /^[a-z]+\d{4}$/, // Name with year like john2024
      /^\d{4}[a-z]+$/, // Year with name like 2024john
      /^student/, // Starts with student
      /^\d+$/, // All numbers (student ID)
    ];

    return (
      studentPatterns.some((pattern) => pattern.test(localPart)) ||
      this.isEducationalEmail()
    );
  }

  /**
   * Creates a masked version for display purposes
   * Useful for privacy in UI while maintaining some identifiability
   *
   * @returns Masked email (e.g., 'st****@gmail.com')
   */
  public getMaskedEmail(): string {
    const [localPart, domain] = this.value.split('@');

    if (localPart.length <= 2) {
      return `${localPart}@${domain}`;
    }

    const visibleChars = 2;
    const masked =
      localPart.substring(0, visibleChars) +
      '*'.repeat(Math.max(0, localPart.length - visibleChars));

    return `${masked}@${domain}`;
  }

  /**
   * String representation
   */
  public toString(): string {
    return this.value;
  }
}

/**
 * Domain Exception for email validation errors
 */
export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}
