// src/shared/domain/exceptions/domain-exception.base.ts

/**
 * Base Domain Exception
 *
 * Base class for all domain-specific exceptions in the Shrameva platform.
 * Provides common functionality for error handling, logging context,
 * and error categorization for the AI-powered assessment system.
 *
 * Design Principles:
 * - Domain exceptions should be meaningful to business stakeholders
 * - Include enough context for debugging and user feedback
 * - Support error categorization for different handling strategies
 * - Maintain error correlation for distributed system tracing
 */
export abstract class DomainExceptionBase extends Error {
  /**
   * Unique error code for this exception type
   * Used for error categorization and automated handling
   */
  public readonly errorCode: string;

  /**
   * Error category for handling strategy determination
   */
  public readonly category: DomainExceptionCategory;

  /**
   * Additional context data for debugging and logging
   */
  public readonly context: Record<string, unknown>;

  /**
   * Correlation ID for tracing across system boundaries
   */
  public readonly correlationId: string;

  /**
   * Whether this error should be logged (some validation errors may be expected)
   */
  public readonly shouldLog: boolean;

  /**
   * Severity level for monitoring and alerting
   */
  public readonly severity: DomainExceptionSeverity;

  /**
   * Timestamp when the exception was created
   */
  public readonly timestamp: Date;

  constructor(
    message: string,
    errorCode: string,
    category: DomainExceptionCategory = DomainExceptionCategory.VALIDATION,
    options: DomainExceptionOptions = {},
  ) {
    super(message);

    this.name = this.constructor.name;
    this.errorCode = errorCode;
    this.category = category;
    this.context = options.context || {};
    this.correlationId = options.correlationId || this.generateCorrelationId();
    this.shouldLog = options.shouldLog ?? true;
    this.severity = options.severity || DomainExceptionSeverity.MEDIUM;
    this.timestamp = new Date();

    // Maintain proper stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Generates a correlation ID for error tracking
   */
  private generateCorrelationId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Converts exception to JSON for logging and API responses
   */
  public toJSON(): DomainExceptionJSON {
    return {
      name: this.name,
      message: this.message,
      errorCode: this.errorCode,
      category: this.category,
      context: this.context,
      correlationId: this.correlationId,
      severity: this.severity,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }

  /**
   * Creates a user-friendly error message
   * Filters out technical details that shouldn't be shown to end users
   */
  public getUserMessage(): string {
    // Override in specific exception types for user-friendly messages
    return this.message;
  }

  /**
   * Determines if this exception should trigger an alert
   */
  public shouldAlert(): boolean {
    return (
      this.severity === DomainExceptionSeverity.HIGH ||
      this.severity === DomainExceptionSeverity.CRITICAL
    );
  }
}

/**
 * Exception categories for handling strategy determination
 */
export enum DomainExceptionCategory {
  VALIDATION = 'VALIDATION', // Input validation failures
  BUSINESS_RULE = 'BUSINESS_RULE', // Business logic violations
  AUTHORIZATION = 'AUTHORIZATION', // Permission/access issues
  RESOURCE_NOT_FOUND = 'NOT_FOUND', // Entity not found
  CONFLICT = 'CONFLICT', // State conflicts (e.g., duplicate)
  EXTERNAL_SERVICE = 'EXTERNAL', // Third-party service issues
  SYSTEM = 'SYSTEM', // Infrastructure/system issues
  CONCURRENCY = 'CONCURRENCY', // Race conditions, locks
  RATE_LIMIT = 'RATE_LIMIT', // Rate limiting violations
}

/**
 * Exception severity levels for monitoring and alerting
 */
export enum DomainExceptionSeverity {
  LOW = 'LOW', // Expected errors, user mistakes
  MEDIUM = 'MEDIUM', // Unexpected but recoverable
  HIGH = 'HIGH', // System degradation
  CRITICAL = 'CRITICAL', // System failure
}

/**
 * Options for creating domain exceptions
 */
export interface DomainExceptionOptions {
  context?: Record<string, unknown>;
  correlationId?: string;
  shouldLog?: boolean;
  severity?: DomainExceptionSeverity;
}

/**
 * JSON representation of domain exception
 */
export interface DomainExceptionJSON {
  name: string;
  message: string;
  errorCode: string;
  category: DomainExceptionCategory;
  context: Record<string, unknown>;
  correlationId: string;
  severity: DomainExceptionSeverity;
  timestamp: string;
  stack?: string;
}

// =============================================================================
// SPECIFIC DOMAIN EXCEPTIONS
// =============================================================================

/**
 * Validation Exception
 *
 * Thrown when input validation fails (e.g., invalid email format,
 * percentage out of range, missing required fields).
 *
 * These are typically user errors and should result in helpful
 * error messages without alerting.
 */
export class ValidationException extends DomainExceptionBase {
  constructor(
    message: string,
    fieldName?: string,
    fieldValue?: unknown,
    options: DomainExceptionOptions = {},
  ) {
    const context = {
      fieldName,
      fieldValue,
      ...options.context,
    };

    super(message, 'VALIDATION_ERROR', DomainExceptionCategory.VALIDATION, {
      ...options,
      context,
      severity: options.severity || DomainExceptionSeverity.LOW,
      shouldLog: options.shouldLog ?? false, // Usually don't log validation errors
    });
  }

  public getUserMessage(): string {
    // Provide user-friendly validation messages
    const fieldName = this.context.fieldName as string;
    if (fieldName) {
      return `Please check the ${fieldName} field: ${this.message}`;
    }
    return `Please check your input: ${this.message}`;
  }
}

/**
 * Business Rule Exception
 *
 * Thrown when business logic constraints are violated
 * (e.g., CCIS level can only increase, student already enrolled).
 *
 * These indicate logic errors or invalid state transitions.
 */
export class BusinessRuleException extends DomainExceptionBase {
  constructor(
    message: string,
    ruleCode: string,
    options: DomainExceptionOptions = {},
  ) {
    const context = {
      ruleCode,
      ...options.context,
    };

    super(
      message,
      `BUSINESS_RULE_${ruleCode}`,
      DomainExceptionCategory.BUSINESS_RULE,
      {
        ...options,
        context,
        severity: options.severity || DomainExceptionSeverity.MEDIUM,
      },
    );
  }

  public getUserMessage(): string {
    return `Business rule violation: ${this.message}`;
  }
}

/**
 * CCIS Assessment Exception
 *
 * Specific exception for CCIS-related assessment errors
 * (e.g., insufficient data for assessment, gaming detection).
 */
export class CCISAssessmentException extends DomainExceptionBase {
  constructor(
    message: string,
    assessmentContext: CCISAssessmentContext,
    options: DomainExceptionOptions = {},
  ) {
    const context = {
      studentId: assessmentContext.studentId,
      competencyId: assessmentContext.competencyId,
      taskId: assessmentContext.taskId,
      ccisLevel: assessmentContext.ccisLevel,
      ...options.context,
    };

    super(
      message,
      'CCIS_ASSESSMENT_ERROR',
      DomainExceptionCategory.BUSINESS_RULE,
      {
        ...options,
        context,
        severity: options.severity || DomainExceptionSeverity.MEDIUM,
      },
    );
  }

  public getUserMessage(): string {
    return 'Unable to complete assessment. Please try again or contact support.';
  }
}

/**
 * Context for CCIS assessment exceptions
 */
export interface CCISAssessmentContext {
  studentId: string;
  competencyId: string;
  taskId?: string;
  ccisLevel?: number;
}

/**
 * Resource Not Found Exception
 *
 * Thrown when a requested resource doesn't exist
 * (e.g., student not found, competency not found).
 */
export class ResourceNotFoundException extends DomainExceptionBase {
  constructor(
    resourceType: string,
    resourceId: string,
    options: DomainExceptionOptions = {},
  ) {
    const message = `${resourceType} with ID '${resourceId}' not found`;
    const context = {
      resourceType,
      resourceId,
      ...options.context,
    };

    super(
      message,
      'RESOURCE_NOT_FOUND',
      DomainExceptionCategory.RESOURCE_NOT_FOUND,
      {
        ...options,
        context,
        severity: options.severity || DomainExceptionSeverity.LOW,
      },
    );
  }

  public getUserMessage(): string {
    const resourceType = this.context.resourceType as string;
    return `The requested ${resourceType.toLowerCase()} could not be found.`;
  }
}

/**
 * Concurrency Exception
 *
 * Thrown when concurrent operations conflict
 * (e.g., optimistic locking failures, race conditions).
 */
export class ConcurrencyException extends DomainExceptionBase {
  constructor(
    message: string,
    resourceType: string,
    resourceId: string,
    options: DomainExceptionOptions = {},
  ) {
    const context = {
      resourceType,
      resourceId,
      ...options.context,
    };

    super(
      message,
      'CONCURRENCY_CONFLICT',
      DomainExceptionCategory.CONCURRENCY,
      {
        ...options,
        context,
        severity: options.severity || DomainExceptionSeverity.MEDIUM,
      },
    );
  }

  public getUserMessage(): string {
    return 'The item was modified by another user. Please refresh and try again.';
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Creates a validation exception for invalid value objects
 */
export function createValidationException(
  fieldName: string,
  value: unknown,
  reason: string,
  options?: DomainExceptionOptions,
): ValidationException {
  return new ValidationException(reason, fieldName, value, options);
}

/**
 * Creates a business rule exception with rule code
 */
export function createBusinessRuleException(
  ruleCode: string,
  message: string,
  context?: Record<string, unknown>,
): BusinessRuleException {
  return new BusinessRuleException(message, ruleCode, { context });
}

/**
 * Creates a CCIS assessment exception
 */
export function createCCISException(
  message: string,
  studentId: string,
  competencyId: string,
  additionalContext?: Record<string, unknown>,
): CCISAssessmentException {
  return new CCISAssessmentException(
    message,
    { studentId, competencyId },
    { context: additionalContext },
  );
}
