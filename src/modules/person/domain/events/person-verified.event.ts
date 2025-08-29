// src/modules/person/domain/events/person-verified.event.ts

import { DomainEvent } from '../../../../shared/base/domain-event.base';
import { PersonID } from '../../../../shared/value-objects/id.value-object';

/**
 * Person Verified Domain Event
 *
 * Published when a person's identity is verified.
 */
export interface PersonVerifiedEventProps {
  /** Person's unique identifier */
  personId: string;

  /** Person's email address */
  email: string;

  /** Person's display name */
  name: string;

  /** Timestamp when person was verified */
  verifiedAt: Date;
}

export class PersonVerifiedEvent extends DomainEvent {
  public readonly payload: PersonVerifiedEventProps;

  constructor(props: PersonVerifiedEventProps) {
    const personId = PersonID.fromString(props.personId);
    super(personId, 'Person');
    this.payload = props;
  }

  public getEventData(): Record<string, any> {
    return {
      personId: this.payload.personId,
      email: this.payload.email,
      name: this.payload.name,
      verifiedAt: this.payload.verifiedAt.toISOString(),
    };
  }
}
