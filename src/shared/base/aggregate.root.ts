import { Entity } from './entity.base';
import { DomainEvent } from './domain-event.base';
import { ID } from '../value-objects/id.value-object';

/**
 * Base Aggregate Root Class - DDD Aggregate Pattern
 *
 * Implements DDD Aggregate Root pattern with:
 * - Domain event publishing and clearing
 * - Business invariant enforcement
 * - Consistency boundary management
 * - Version tracking for optimistic locking
 * - Transaction boundary definition
 *
 * Key Responsibilities:
 * - Enforce business rules across the aggregate
 * - Publish domain events to notify other bounded contexts
 * - Maintain consistency within the aggregate boundary
 * - Control access to child entities
 *
 * Used by: Student, Assessment, College, Employer aggregates
 */
export abstract class AggregateRoot<T extends ID = ID> extends Entity<T> {
  private _version: number = 0;
  private _isDeleted: boolean = false;

  protected constructor(id: T) {
    super(id);
  }

  /**
   * Get current version for optimistic locking
   * Incremented on every change to prevent concurrent modification conflicts
   */
  public getVersion(): number {
    return this._version;
  }

  /**
   * Check if aggregate is marked for deletion
   */
  public isDeleted(): boolean {
    return this._isDeleted;
  }

  /**
   * Publish all pending domain events
   * This is called by the repository after successful persistence
   * Returns events for the infrastructure to publish
   */
  public pullDomainEvents(): DomainEvent[] {
    const events = this.getDomainEvents();
    this.clearDomainEvents();
    return events;
  }

  /**
   * Mark aggregate as deleted (soft delete)
   * Adds DomainEvent and prevents further modifications
   */
  public markAsDeleted(): void {
    if (this._isDeleted) {
      return; // Already deleted
    }

    this._isDeleted = true;
    this.incrementVersion();
    this.markAsModified();

    // Add domain event for deletion
    this.addDomainEvent(this.createDeletedEvent());
  }

  /**
   * Apply a command to the aggregate
   * Template method that enforces validation and version increment
   */
  protected applyCommand(commandHandler: () => void): void {
    this.ensureNotDeleted();
    this.validate(); // Validate current state

    commandHandler(); // Execute the business logic

    this.validate(); // Validate resulting state
    this.incrementVersion();
    this.markAsModified();
  }

  /**
   * Increment version for optimistic locking
   * Called whenever aggregate state changes
   */
  private incrementVersion(): void {
    this._version++;
  }

  /**
   * Ensure aggregate is not deleted before allowing operations
   */
  private ensureNotDeleted(): void {
    if (this._isDeleted) {
      throw new Error(
        `Cannot modify deleted ${this.constructor.name}: ${this.getId().toString()}`,
      );
    }
  }

  /**
   * Create domain event for aggregate deletion
   * Override in concrete aggregates to provide specific event types
   */
  protected abstract createDeletedEvent(): DomainEvent;

  /**
   * Validate aggregate business invariants
   * Override in concrete aggregates to implement business rules
   *
   * Example for Student aggregate:
   * - CCIS levels can only increase
   * - Student must have valid email
   * - Assessment scores must be within valid ranges
   */
  protected validate(): void {
    super.validate();
    // Additional aggregate-level validation goes here
    // This is where complex business rules spanning multiple entities are enforced
  }

  /**
   * Apply domain event to aggregate (for event sourcing)
   * Override in concrete aggregates if using event sourcing
   */
  protected applyEvent(event: DomainEvent): void {
    // Default implementation does nothing
    // Override for event-sourced aggregates
  }

  /**
   * Get aggregate state summary for debugging
   * Useful for logging and troubleshooting
   */
  public getStateSummary(): string {
    return `${this.toString()}, Version: ${this._version}, Deleted: ${this._isDeleted}, Events: ${this.getDomainEvents().length}`;
  }

  /**
   * Equality comparison including version
   * Two aggregates are equal if they have same ID and version
   */
  public equalsWithVersion(other: AggregateRoot<T>): boolean {
    return this.equals(other) && this._version === other._version;
  }
}
