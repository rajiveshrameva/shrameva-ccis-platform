// src/shared/domain/events/event-handler.interface.ts

import { DomainEvent } from '../../base/domain-event.base';

/**
 * Event Handler Interface
 *
 * Defines the contract for handling domain events in the Shrameva CCIS platform.
 * All event handlers must implement this interface to ensure consistent event
 * processing across the system, including AI agents and application services.
 *
 * Key Responsibilities:
 * - Process domain events asynchronously
 * - Maintain idempotency (handle duplicate events gracefully)
 * - Support error handling and recovery
 * - Enable loose coupling between domain and application layers
 *
 * Critical for Shrameva Platform:
 * - AI agent event processing (Assessment, Intervention, Supervisor agents)
 * - Cross-competency communication and state updates
 * - Real-time dashboard and notification updates
 * - Audit trail and compliance event logging
 * - Integration with external systems (colleges, employers)
 *
 * Performance Requirements:
 * - <500ms processing time for most events
 * - Graceful handling of temporary failures
 * - Support for concurrent event processing
 * - Memory-efficient for high-volume scenarios
 *
 * @template TEvent - The specific domain event type this handler processes
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class CCISLevelAchievedHandler implements IEventHandler<CCISLevelAchievedEvent> {
 *   constructor(
 *     private readonly assessmentAgent: AssessmentAgent,
 *     private readonly interventionAgent: InterventionDetectionAgent
 *   ) {}
 *
 *   async handle(event: CCISLevelAchievedEvent): Promise<void> {
 *     // Update assessment records
 *     await this.assessmentAgent.recordLevelAchievement(event);
 *
 *     // Check if intervention needed
 *     await this.interventionAgent.evaluateProgressPattern(event.studentId);
 *
 *     // Trigger next assessment if ready
 *     if (event.newLevel >= 3) {
 *       await this.assessmentAgent.scheduleAdvancedAssessment(event.studentId);
 *     }
 *   }
 *
 *   getHandlerName(): string {
 *     return 'CCISLevelAchievedHandler';
 *   }
 *
 *   getEventType(): string {
 *     return 'CCISLevelAchieved';
 *   }
 * }
 * ```
 */
export interface IEventHandler<TEvent extends DomainEvent> {
  /**
   * Handles the domain event
   *
   * This method should be idempotent - calling it multiple times with the
   * same event should produce the same result. This is critical for event
   * replay scenarios and handling duplicate events in distributed systems.
   *
   * @param event - The domain event to process
   * @returns Promise that resolves when processing is complete
   * @throws Should throw specific exceptions for different failure types
   *         to enable appropriate retry/recovery strategies
   *
   * Implementation Guidelines:
   * - Check for duplicate processing using event.eventId
   * - Validate event data before processing
   * - Use transactions for data consistency
   * - Log important steps for debugging
   * - Handle temporary failures gracefully
   * - Avoid blocking operations when possible
   */
  handle(event: TEvent): Promise<void>;

  /**
   * Gets the human-readable name of this handler
   *
   * Used for logging, debugging, and monitoring. Should be descriptive
   * enough to understand the handler's purpose from logs.
   *
   * @returns Handler name for identification
   *
   * @example
   * ```typescript
   * getHandlerName(): string {
   *   return 'StudentEnrollmentNotificationHandler';
   * }
   * ```
   */
  getHandlerName(): string;

  /**
   * Gets the event type this handler processes
   *
   * Must match the eventType property of the events this handler
   * is designed to process. Used by the event publisher for routing.
   *
   * @returns Event type string for routing
   *
   * @example
   * ```typescript
   * getEventType(): string {
   *   return 'StudentEnrolled';
   * }
   * ```
   */
  getEventType(): string;

  /**
   * Optional: Validates if this handler can process the given event
   *
   * Allows handlers to perform additional validation beyond type checking.
   * Useful for conditional processing based on event content or system state.
   *
   * @param event - Event to validate
   * @returns True if handler can process this event
   *
   * @example
   * ```typescript
   * canHandle(event: StudentEnrolledEvent): boolean {
   *   // Only handle events for active enrollment periods
   *   return event.enrollmentPeriod.isActive();
   * }
   * ```
   */
  canHandle?(event: TEvent): boolean;

  /**
   * Optional: Gets the processing priority for this handler
   *
   * Higher numbers indicate higher priority. Handlers with higher priority
   * will be processed first when multiple handlers are registered for the
   * same event type. Useful for ensuring critical operations complete first.
   *
   * @returns Processing priority (default: 0)
   *
   * @example
   * ```typescript
   * getPriority(): number {
   *   return 100; // High priority for assessment-critical operations
   * }
   * ```
   */
  getPriority?(): number;

  /**
   * Optional: Indicates if this handler should retry on failure
   *
   * Some handlers may handle non-critical operations that shouldn't
   * be retried, while others (like assessment recording) should retry
   * to ensure data consistency.
   *
   * @returns True if handler supports retries (default: true)
   *
   * @example
   * ```typescript
   * supportsRetry(): boolean {
   *   return true; // Critical assessment data - must succeed
   * }
   * ```
   */
  supportsRetry?(): boolean;

  /**
   * Optional: Gets the maximum number of retry attempts
   *
   * Allows handlers to specify their own retry limits based on the
   * criticality and nature of their operations.
   *
   * @returns Maximum retry attempts (default: uses publisher config)
   *
   * @example
   * ```typescript
   * getMaxRetries(): number {
   *   return 5; // Critical assessment operations need more retries
   * }
   * ```
   */
  getMaxRetries?(): number;
}

/**
 * Base Event Handler Abstract Class
 *
 * Provides common functionality for event handlers with sensible defaults.
 * Most handlers can extend this class instead of implementing the interface
 * directly to get standard behavior with minimal boilerplate.
 *
 * @template TEvent - The specific domain event type this handler processes
 */
export abstract class BaseEventHandler<TEvent extends DomainEvent>
  implements IEventHandler<TEvent>
{
  /**
   * Abstract method that must be implemented by concrete handlers
   */
  abstract handle(event: TEvent): Promise<void>;

  /**
   * Abstract method that must be implemented by concrete handlers
   */
  abstract getEventType(): string;

  /**
   * Default implementation returns the class name
   */
  getHandlerName(): string {
    return this.constructor.name;
  }

  /**
   * Default implementation accepts all events of the correct type
   */
  canHandle(event: TEvent): boolean {
    return event.eventType === this.getEventType();
  }

  /**
   * Default priority is neutral
   */
  getPriority(): number {
    return 0;
  }

  /**
   * Default is to support retries
   */
  supportsRetry(): boolean {
    return true;
  }

  /**
   * Default uses publisher configuration
   */
  getMaxRetries(): number {
    return 3;
  }

  /**
   * Utility method for consistent logging across handlers
   */
  protected logEventProcessing(
    event: TEvent,
    message: string,
    metadata?: any,
  ): void {
    console.log(`[${this.getHandlerName()}] ${message}`, {
      eventId: event.eventId,
      eventType: event.eventType,
      aggregateId: event.aggregateId,
      ...metadata,
    });
  }

  /**
   * Utility method for consistent error logging across handlers
   */
  protected logEventError(event: TEvent, error: Error, context?: any): void {
    console.error(`[${this.getHandlerName()}] Event processing failed`, {
      eventId: event.eventId,
      eventType: event.eventType,
      aggregateId: event.aggregateId,
      error: error.message,
      stack: error.stack,
      ...context,
    });
  }
}

/**
 * Event Handler Registry
 *
 * Utility interface for managing collections of event handlers.
 * Used by the domain event publisher and dependency injection systems.
 */
export interface IEventHandlerRegistry {
  /**
   * Registers an event handler for a specific event type
   */
  register<TEvent extends DomainEvent>(
    eventType: string,
    handler: IEventHandler<TEvent>,
  ): void;

  /**
   * Gets all handlers for a specific event type
   */
  getHandlers<TEvent extends DomainEvent>(
    eventType: string,
  ): IEventHandler<TEvent>[];

  /**
   * Removes a handler for a specific event type
   */
  unregister<TEvent extends DomainEvent>(
    eventType: string,
    handler: IEventHandler<TEvent>,
  ): void;

  /**
   * Gets all registered event types
   */
  getRegisteredEventTypes(): string[];
}

/**
 * Event Processing Context
 *
 * Additional context information available during event processing.
 * Useful for cross-cutting concerns like logging, monitoring, and debugging.
 */
export interface EventProcessingContext {
  /**
   * Unique identifier for this processing attempt
   */
  processingId: string;

  /**
   * Current retry attempt (0 for first attempt)
   */
  retryAttempt: number;

  /**
   * Processing start timestamp
   */
  startedAt: Date;

  /**
   * Correlation ID for tracing across service boundaries
   */
  correlationId?: string;

  /**
   * User context if available
   */
  userId?: string;

  /**
   * Additional metadata for debugging
   */
  metadata?: Record<string, any>;
}
