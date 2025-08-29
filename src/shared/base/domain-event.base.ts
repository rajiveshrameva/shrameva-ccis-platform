import { ID } from '../value-objects/id.value-object';

/**
 * Base Domain Event Class - Event-Driven Architecture Foundation
 *
 * Implements Domain Event pattern with:
 * - Immutable event data (events never change after creation)
 * - Event metadata (timestamp, aggregate ID, version, correlation)
 * - Unique event identification for idempotency
 * - Serialization support for event storage and messaging
 *
 * Key Responsibilities:
 * - Capture what happened in the domain
 * - Enable decoupled communication between bounded contexts
 * - Support event sourcing and audit logging
 * - Facilitate integration with external systems
 *
 * Used by: StudentLevelAdvanced, AssessmentCompleted, PartnershipEstablished, etc.
 */
export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly eventType: string;
  public readonly aggregateId: string;
  public readonly aggregateType: string;
  public readonly occurredAt: Date;
  public readonly eventVersion: number;
  public readonly correlationId?: string;
  public readonly causationId?: string;
  public readonly userId?: string;

  /**
   * Protected constructor ensures events are created through concrete implementations
   */
  protected constructor(
    aggregateId: ID,
    aggregateType: string,
    eventData?: {
      correlationId?: string;
      causationId?: string;
      userId?: string;
    },
  ) {
    this.eventId = this.generateEventId();
    this.eventType = this.constructor.name;
    this.aggregateId = aggregateId.toString();
    this.aggregateType = aggregateType;
    this.occurredAt = new Date();
    this.eventVersion = 1; // Can be incremented for event schema evolution
    this.correlationId = eventData?.correlationId;
    this.causationId = eventData?.causationId;
    this.userId = eventData?.userId;

    // Freeze the event to make it immutable
    Object.freeze(this);
  }

  /**
   * Get event payload - the business data specific to this event type
   * Must be implemented by concrete event classes
   */
  public abstract getEventData(): Record<string, any>;

  /**
   * Get complete event envelope for serialization
   * Includes metadata + event-specific data
   */
  public toEventEnvelope(): EventEnvelope {
    return {
      eventId: this.eventId,
      eventType: this.eventType,
      aggregateId: this.aggregateId,
      aggregateType: this.aggregateType,
      occurredAt: this.occurredAt.toISOString(),
      eventVersion: this.eventVersion,
      correlationId: this.correlationId,
      causationId: this.causationId,
      userId: this.userId,
      eventData: this.getEventData(),
    };
  }

  /**
   * Serialize event to JSON string
   * Used for message queues, event store, etc.
   */
  public serialize(): string {
    return JSON.stringify(this.toEventEnvelope());
  }

  /**
   * Check if this event is related to another event
   * Based on correlation ID or causation chain
   */
  public isRelatedTo(otherEvent: DomainEvent): boolean {
    if (this.correlationId && otherEvent.correlationId) {
      return this.correlationId === otherEvent.correlationId;
    }

    if (this.causationId && otherEvent.eventId) {
      return this.causationId === otherEvent.eventId;
    }

    return false;
  }

  /**
   * Get event age in milliseconds
   * Useful for event processing and cleanup
   */
  public getAgeInMs(): number {
    return Date.now() - this.occurredAt.getTime();
  }

  /**
   * Check if event is older than specified duration
   */
  public isOlderThan(durationMs: number): boolean {
    return this.getAgeInMs() > durationMs;
  }

  /**
   * String representation for logging and debugging
   */
  public toString(): string {
    return `${this.eventType}(${this.eventId}) for ${this.aggregateType}(${this.aggregateId}) at ${this.occurredAt.toISOString()}`;
  }

  /**
   * Generate unique event ID
   * Uses timestamp + random component for uniqueness
   */
  private generateEventId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `event_${timestamp}_${randomPart}`;
  }
}

/**
 * Event envelope for serialization and transport
 * Standard format for all domain events
 */
export interface EventEnvelope {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  occurredAt: string; // ISO string
  eventVersion: number;
  correlationId?: string;
  causationId?: string;
  userId?: string;
  eventData: Record<string, any>;
}

/**
 * Event metadata for event handlers and processors
 */
export interface EventMetadata {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  occurredAt: Date;
  correlationId?: string;
  causationId?: string;
  userId?: string;
}

/**
 * Factory for creating events with proper correlation/causation tracking
 */
export class EventFactory {
  /**
   * Create event with correlation tracking
   * Used when one event causes another (saga patterns)
   */
  public static createCorrelated<T extends DomainEvent>(
    EventClass: new (aggregateId: ID, ...args: any[]) => T,
    aggregateId: ID,
    correlationId: string,
    causationId?: string,
    userId?: string,
    ...eventArgs: any[]
  ): T {
    // This is a simplified factory - concrete implementation would need proper typing
    const event = new EventClass(aggregateId, ...eventArgs);

    // Set correlation metadata (would need to be done in constructor)
    (event as any).correlationId = correlationId;
    (event as any).causationId = causationId;
    (event as any).userId = userId;

    return event;
  }
}

/**
 * Event processing result
 * Used by event handlers to indicate processing status
 */
export interface EventProcessingResult {
  success: boolean;
  error?: Error;
  retryable?: boolean;
  nextRetryAt?: Date;
}
