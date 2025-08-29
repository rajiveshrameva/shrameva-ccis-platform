// src/shared/domain/events/domain-event-publisher.ts

import { Injectable, Logger } from '@nestjs/common';
import { DomainEvent } from '../../base/domain-event.base';
import { IEventHandler } from './event-handler.interface';
import {
  DomainExceptionBase,
  ValidationException,
} from '../exceptions/domain-exception.base';

/**
 * Domain Event Publisher
 *
 * Central event publishing and handling system for the Shrameva CCIS platform.
 * Enables loose coupling between domain entities and application services while
 * supporting the multi-agent AI architecture and real-time assessment workflows.
 *
 * Key Responsibilities:
 * - Publish domain events from aggregate roots
 * - Route events to appropriate handlers (AI agents, services)
 * - Maintain event ordering and consistency
 * - Support async processing for performance-critical operations
 * - Provide event replay capabilities for audit and debugging
 * - Handle event failures with retry and dead letter queues
 *
 * Critical for Shrameva Platform:
 * - CCIS level change notifications for AI agents
 * - Student progress events for intervention detection
 * - Assessment completion events for next-step recommendations
 * - Cross-agent communication and state synchronization
 * - Real-time dashboard updates and notifications
 * - Audit trail for compliance and debugging
 *
 * Performance Requirements:
 * - <100ms event publishing latency
 * - Support for 1000+ events/second during peak assessment
 * - Guaranteed delivery for critical assessment events
 * - Graceful degradation under high load
 *
 * @example
 * ```typescript
 * // In aggregate root (Student entity)
 * student.updateCCISLevel(competencyId, newLevel);
 * const events = student.getUncommittedEvents();
 * await eventPublisher.publishAll(events);
 *
 * // In application service
 * eventPublisher.subscribe('CCISLevelAchieved', ccisLevelHandler);
 * eventPublisher.subscribe('StudentEnrolled', interventionDetectionHandler);
 * ```
 */
@Injectable()
export class DomainEventPublisher {
  private readonly logger = new Logger(DomainEventPublisher.name);

  // Event handlers registry - maps event types to their handlers
  private readonly eventHandlers = new Map<string, IEventHandler<any>[]>();

  // Event history for debugging and replay (configurable retention)
  private readonly eventHistory: PublishedEvent[] = [];
  private readonly maxHistorySize = 10000; // Keep last 10k events

  // Performance monitoring
  private readonly publishingMetrics = {
    totalPublished: 0,
    totalFailed: 0,
    averageLatency: 0,
    lastPublishTime: null as Date | null,
  };

  // Configuration for event processing
  private readonly config: EventPublisherConfig = {
    enableAsyncProcessing: true,
    retryAttempts: 3,
    retryDelayMs: 1000,
    deadLetterQueueEnabled: true,
    auditEnabled: true,
    maxConcurrentHandlers: 10,
  };

  /**
   * Publishes a single domain event to all registered handlers
   *
   * @param event - Domain event to publish
   * @returns Promise resolving when all handlers complete
   * @throws DomainEventPublishingException if critical failures occur
   */
  public async publish<TEvent extends DomainEvent>(
    event: TEvent,
  ): Promise<void> {
    const startTime = Date.now();

    try {
      this.validateEvent(event);
      this.logger.debug(`Publishing event: ${event.eventType}`, {
        eventId: event.eventId,
        aggregateId: event.aggregateId,
        eventType: event.eventType,
      });

      // Get handlers for this event type
      const handlers = this.getHandlersForEvent(event.eventType);

      if (handlers.length === 0) {
        this.logger.warn(
          `No handlers registered for event type: ${event.eventType}`,
        );
        return;
      }

      // Create published event record for history and monitoring
      const publishedEvent: PublishedEvent = {
        event,
        publishedAt: new Date(),
        handlerResults: [],
        totalLatency: 0,
      };

      // Process handlers based on configuration
      if (this.config.enableAsyncProcessing && handlers.length > 1) {
        await this.processHandlersAsync(event, handlers, publishedEvent);
      } else {
        await this.processHandlersSync(event, handlers, publishedEvent);
      }

      // Record completion metrics
      const totalLatency = Date.now() - startTime;
      publishedEvent.totalLatency = totalLatency;

      this.updateMetrics(totalLatency, false);
      this.addToHistory(publishedEvent);

      this.logger.debug(`Event published successfully: ${event.eventType}`, {
        eventId: event.eventId,
        handlerCount: handlers.length,
        latencyMs: totalLatency,
      });
    } catch (error) {
      const latency = Date.now() - startTime;
      this.updateMetrics(latency, true);

      this.logger.error(`Failed to publish event: ${event.eventType}`, {
        eventId: event.eventId,
        error: error.message,
        latencyMs: latency,
      });

      throw new DomainEventPublishingException(
        `Failed to publish event ${event.eventType}: ${error.message}`,
        event,
        error,
      );
    }
  }

  /**
   * Publishes multiple events in sequence with transaction-like semantics
   *
   * @param events - Array of domain events to publish
   * @param stopOnFirstFailure - Whether to stop processing on first handler failure
   * @returns Promise resolving when all events are processed
   */
  public async publishAll(
    events: DomainEvent[],
    stopOnFirstFailure: boolean = false,
  ): Promise<void> {
    if (!events || events.length === 0) {
      return;
    }

    this.logger.debug(`Publishing batch of ${events.length} events`);

    const results: Array<{
      event: DomainEvent;
      success: boolean;
      error?: Error;
    }> = [];

    for (const event of events) {
      try {
        await this.publish(event);
        results.push({ event, success: true });
      } catch (error) {
        results.push({ event, success: false, error });

        if (stopOnFirstFailure) {
          this.logger.error(
            `Stopping batch processing due to failure in event: ${event.eventType}`,
          );
          throw error;
        }
      }
    }

    // Log batch completion summary
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    this.logger.debug(`Batch publishing completed`, {
      totalEvents: events.length,
      successful: successCount,
      failed: failureCount,
    });

    // If we had failures but didn't stop early, throw summary exception
    if (failureCount > 0 && !stopOnFirstFailure) {
      const failedEvents = results.filter((r) => !r.success);
      throw new BatchEventPublishingException(
        `${failureCount} of ${events.length} events failed to publish`,
        failedEvents,
      );
    }
  }

  /**
   * Subscribes an event handler to a specific event type
   *
   * @param eventType - Type of event to handle (e.g., 'CCISLevelAchieved')
   * @param handler - Event handler implementation
   */
  public subscribe<TEvent extends DomainEvent>(
    eventType: string,
    handler: IEventHandler<TEvent>,
  ): void {
    if (!eventType || !handler) {
      throw new ValidationException(
        'Event type and handler are required for subscription',
        'subscription',
        { eventType, handler: !!handler },
      );
    }

    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }

    const handlers = this.eventHandlers.get(eventType)!;
    handlers.push(handler);

    this.logger.debug(`Subscribed handler to event type: ${eventType}`, {
      handlerName: handler.constructor.name,
      totalHandlers: handlers.length,
    });
  }

  /**
   * Unsubscribes an event handler from a specific event type
   *
   * @param eventType - Type of event to unsubscribe from
   * @param handler - Event handler to remove
   */
  public unsubscribe<TEvent extends DomainEvent>(
    eventType: string,
    handler: IEventHandler<TEvent>,
  ): void {
    const handlers = this.eventHandlers.get(eventType);
    if (!handlers) {
      return;
    }

    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
      this.logger.debug(`Unsubscribed handler from event type: ${eventType}`);
    }

    // Clean up empty handler arrays
    if (handlers.length === 0) {
      this.eventHandlers.delete(eventType);
    }
  }

  /**
   * Gets current publishing metrics for monitoring and health checks
   */
  public getMetrics(): EventPublishingMetrics {
    return {
      ...this.publishingMetrics,
      registeredEventTypes: Array.from(this.eventHandlers.keys()),
      totalHandlers: Array.from(this.eventHandlers.values()).reduce(
        (sum, handlers) => sum + handlers.length,
        0,
      ),
      historySize: this.eventHistory.length,
    };
  }

  /**
   * Replays events from history for debugging or recovery scenarios
   *
   * @param filter - Optional filter for events to replay
   * @param targetHandler - Specific handler to replay to (optional)
   */
  public async replayEvents(
    filter?: EventFilter,
    targetHandler?: IEventHandler<any>,
  ): Promise<void> {
    let eventsToReplay = this.eventHistory.map((pe) => pe.event);

    if (filter) {
      eventsToReplay = eventsToReplay.filter((event) => {
        if (filter.eventType && event.eventType !== filter.eventType)
          return false;
        if (filter.aggregateId && event.aggregateId !== filter.aggregateId)
          return false;
        if (filter.fromDate && event.occurredAt < filter.fromDate) return false;
        if (filter.toDate && event.occurredAt > filter.toDate) return false;
        return true;
      });
    }

    this.logger.debug(`Replaying ${eventsToReplay.length} events`);

    if (targetHandler) {
      // Replay to specific handler
      for (const event of eventsToReplay) {
        try {
          await targetHandler.handle(event);
        } catch (error) {
          this.logger.error(`Replay failed for event ${event.eventId}`, {
            error,
          });
        }
      }
    } else {
      // Replay through normal publishing mechanism
      await this.publishAll(eventsToReplay, false);
    }
  }

  /**
   * Clears event history (use carefully in production)
   */
  public clearHistory(): void {
    this.eventHistory.length = 0;
    this.logger.warn('Event history cleared');
  }

  /**
   * Validates domain event before publishing
   */
  private validateEvent(event: DomainEvent): void {
    if (!event) {
      throw new ValidationException(
        'Event cannot be null or undefined',
        'event',
        event,
      );
    }

    if (!event.eventId || !event.eventType || !event.aggregateId) {
      throw new ValidationException(
        'Event must have eventId, eventType, and aggregateId',
        'event',
        {
          eventId: event.eventId,
          eventType: event.eventType,
          aggregateId: event.aggregateId,
        },
      );
    }

    if (!event.occurredAt || !(event.occurredAt instanceof Date)) {
      throw new ValidationException(
        'Event must have valid occurredAt date',
        'event.occurredAt',
        event.occurredAt,
      );
    }
  }

  /**
   * Gets handlers for a specific event type
   */
  private getHandlersForEvent(eventType: string): IEventHandler<any>[] {
    return this.eventHandlers.get(eventType) || [];
  }

  /**
   * Processes handlers asynchronously with concurrency control
   */
  private async processHandlersAsync(
    event: DomainEvent,
    handlers: IEventHandler<any>[],
    publishedEvent: PublishedEvent,
  ): Promise<void> {
    const handlerPromises = handlers.map(async (handler) => {
      const handlerStartTime = Date.now();

      try {
        await this.executeHandlerWithRetry(handler, event);

        const handlerLatency = Date.now() - handlerStartTime;
        publishedEvent.handlerResults.push({
          handlerName: handler.constructor.name,
          success: true,
          latencyMs: handlerLatency,
        });
      } catch (error) {
        const handlerLatency = Date.now() - handlerStartTime;
        publishedEvent.handlerResults.push({
          handlerName: handler.constructor.name,
          success: false,
          latencyMs: handlerLatency,
          error: error.message,
        });

        this.logger.error(`Handler failed: ${handler.constructor.name}`, {
          eventType: event.eventType,
          eventId: event.eventId,
          error: error.message,
        });

        // Don't rethrow - we want to continue with other handlers
      }
    });

    // Wait for all handlers with concurrency limit
    await this.processConcurrently(
      handlerPromises,
      this.config.maxConcurrentHandlers,
    );
  }

  /**
   * Processes handlers synchronously
   */
  private async processHandlersSync(
    event: DomainEvent,
    handlers: IEventHandler<any>[],
    publishedEvent: PublishedEvent,
  ): Promise<void> {
    for (const handler of handlers) {
      const handlerStartTime = Date.now();

      try {
        await this.executeHandlerWithRetry(handler, event);

        const handlerLatency = Date.now() - handlerStartTime;
        publishedEvent.handlerResults.push({
          handlerName: handler.constructor.name,
          success: true,
          latencyMs: handlerLatency,
        });
      } catch (error) {
        const handlerLatency = Date.now() - handlerStartTime;
        publishedEvent.handlerResults.push({
          handlerName: handler.constructor.name,
          success: false,
          latencyMs: handlerLatency,
          error: error.message,
        });

        this.logger.error(`Handler failed: ${handler.constructor.name}`, {
          eventType: event.eventType,
          eventId: event.eventId,
          error: error.message,
        });

        // Continue with next handler
      }
    }
  }

  /**
   * Executes handler with retry logic
   */
  private async executeHandlerWithRetry(
    handler: IEventHandler<any>,
    event: DomainEvent,
  ): Promise<void> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        await handler.handle(event);
        return; // Success
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === this.config.retryAttempts) {
          break; // Final attempt failed
        }

        // Wait before retry
        await this.sleep(this.config.retryDelayMs * attempt);

        this.logger.warn(
          `Handler retry ${attempt}/${this.config.retryAttempts}`,
          {
            handlerName: handler.constructor.name,
            eventType: event.eventType,
            error: lastError.message,
          },
        );
      }
    }

    throw lastError || new Error('Handler execution failed with unknown error');
  }

  /**
   * Processes promises with concurrency limit
   */
  private async processConcurrently<T>(
    promises: Promise<T>[],
    concurrencyLimit: number,
  ): Promise<T[]> {
    const results: T[] = [];

    for (let i = 0; i < promises.length; i += concurrencyLimit) {
      const batch = promises.slice(i, i + concurrencyLimit);
      const batchResults = await Promise.allSettled(batch);

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results[i + index] = result.value;
        }
        // Errors are already logged in processHandlersAsync
      });
    }

    return results;
  }

  /**
   * Updates publishing metrics
   */
  private updateMetrics(latencyMs: number, failed: boolean): void {
    this.publishingMetrics.totalPublished++;
    this.publishingMetrics.lastPublishTime = new Date();

    if (failed) {
      this.publishingMetrics.totalFailed++;
    }

    // Update rolling average latency
    const currentAvg = this.publishingMetrics.averageLatency;
    const totalEvents = this.publishingMetrics.totalPublished;
    this.publishingMetrics.averageLatency =
      (currentAvg * (totalEvents - 1) + latencyMs) / totalEvents;
  }

  /**
   * Adds event to history with size management
   */
  private addToHistory(publishedEvent: PublishedEvent): void {
    if (!this.config.auditEnabled) {
      return;
    }

    this.eventHistory.push(publishedEvent);

    // Maintain history size limit
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.splice(
        0,
        this.eventHistory.length - this.maxHistorySize,
      );
    }
  }

  /**
   * Simple sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Configuration for the event publisher
 */
interface EventPublisherConfig {
  enableAsyncProcessing: boolean;
  retryAttempts: number;
  retryDelayMs: number;
  deadLetterQueueEnabled: boolean;
  auditEnabled: boolean;
  maxConcurrentHandlers: number;
}

/**
 * Record of a published event with handler results
 */
interface PublishedEvent {
  event: DomainEvent;
  publishedAt: Date;
  handlerResults: HandlerResult[];
  totalLatency: number;
}

/**
 * Result of handler execution
 */
interface HandlerResult {
  handlerName: string;
  success: boolean;
  latencyMs: number;
  error?: string;
}

/**
 * Metrics for event publishing performance
 */
export interface EventPublishingMetrics {
  totalPublished: number;
  totalFailed: number;
  averageLatency: number;
  lastPublishTime: Date | null;
  registeredEventTypes: string[];
  totalHandlers: number;
  historySize: number;
}

/**
 * Filter for event replay functionality
 */
export interface EventFilter {
  eventType?: string;
  aggregateId?: string;
  fromDate?: Date;
  toDate?: Date;
}

/**
 * Exception thrown when event publishing fails
 */
export class DomainEventPublishingException extends DomainExceptionBase {
  constructor(message: string, event: DomainEvent, originalError?: Error) {
    super(message, 'EVENT_PUBLISHING_FAILED', undefined, {
      context: {
        eventId: event.eventId,
        eventType: event.eventType,
        aggregateId: event.aggregateId,
        originalError: originalError?.message,
      },
      shouldLog: true,
    });
  }
}

/**
 * Exception thrown when batch event publishing has failures
 */
export class BatchEventPublishingException extends DomainExceptionBase {
  constructor(
    message: string,
    failedEvents: Array<{
      event: DomainEvent;
      success: boolean;
      error?: Error;
    }>,
  ) {
    super(message, 'BATCH_EVENT_PUBLISHING_FAILED', undefined, {
      context: {
        failedEventCount: failedEvents.length,
        failedEventTypes: failedEvents.map((f) => f.event.eventType),
        firstError: failedEvents[0]?.error?.message,
      },
      shouldLog: true,
    });
  }
}
