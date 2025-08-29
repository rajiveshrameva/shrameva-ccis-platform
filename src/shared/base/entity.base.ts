import { ID } from '../value-objects/id.value-object';
import { DomainEvent } from './domain-event.base';

/**
 * Base Entity Class - Foundation for all domain entities
 *
 * Implements DDD Entity pattern with:
 * - Identity-based equality (entities are equal if IDs match)
 * - Domain event collection (events published by aggregate roots)
 * - Creation/modification tracking
 * - Type-safe ID management
 * - Immutable identity after creation
 *
 * Used by: Student, Assessment, Task, College, Employer entities
 */
export abstract class Entity<T extends ID = ID> {
  private readonly _id: T;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _domainEvents: DomainEvent[] = [];

  protected constructor(id: T) {
    this._id = id;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  /**
   * Get entity ID - immutable identifier
   * Each entity has a unique identity that never changes
   */
  public getId(): T {
    return this._id;
  }

  /**
   * Get creation timestamp - when entity was first created
   */
  public getCreatedAt(): Date {
    return new Date(this._createdAt);
  }

  /**
   * Get last modification timestamp
   */
  public getUpdatedAt(): Date {
    return new Date(this._updatedAt);
  }

  /**
   * Get all pending domain events
   * Events are collected here and published by aggregate roots
   */
  public getDomainEvents(): DomainEvent[] {
    return [...this._domainEvents]; // Return copy to prevent external mutation
  }

  /**
   * Add a domain event to be published
   * Protected - only the entity itself can add events
   */
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * Clear all domain events (called after publishing)
   * Protected - only aggregate roots should clear events
   */
  protected clearDomainEvents(): void {
    this._domainEvents = [];
  }

  /**
   * Mark entity as modified (updates timestamp)
   * Protected - called by entity methods when state changes
   */
  protected markAsModified(): void {
    this._updatedAt = new Date();
  }

  /**
   * Entity equality based on ID
   * Two entities are equal if they have the same ID and type
   */
  public equals(entity: Entity<T>): boolean {
    if (!entity) {
      return false;
    }

    if (this.constructor.name !== entity.constructor.name) {
      return false;
    }

    return this._id.equals(entity._id);
  }

  /**
   * Get string representation of entity
   * Useful for debugging and logging
   */
  public toString(): string {
    return `${this.constructor.name}(${this._id.toString()})`;
  }

  /**
   * Validate entity state (template method)
   * Override in concrete entities to add business rule validation
   */
  protected validate(): void {
    // Default: no validation
    // Override in concrete entities as needed
  }
}
