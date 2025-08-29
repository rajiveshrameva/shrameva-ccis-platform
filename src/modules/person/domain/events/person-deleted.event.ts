// src/modules/person/domain/events/person-deleted.event.ts

import { DomainEvent } from '../../../../shared/base/domain-event.base';
import { PersonID } from '../../../../shared/value-objects/id.value-object';

/**
 * Person Deleted Domain Event
 *
 * Published when a person account is deleted (soft or hard delete).
 */
export interface PersonDeletedEventProps {
  /** Person's unique identifier */
  personId: string;

  /** Reason for deletion */
  reason?: string;

  /** Timestamp when person was deleted */
  deletedAt: Date;
}

export class PersonDeletedEvent extends DomainEvent {
  public readonly payload: PersonDeletedEventProps;

  constructor(props: PersonDeletedEventProps) {
    const personId = PersonID.fromString(props.personId);
    super(personId, 'Person');
    this.payload = props;
  }

  public getEventData(): Record<string, any> {
    return {
      personId: this.payload.personId,
      reason: this.payload.reason,
      deletedAt: this.payload.deletedAt.toISOString(),
    };
  }
}
