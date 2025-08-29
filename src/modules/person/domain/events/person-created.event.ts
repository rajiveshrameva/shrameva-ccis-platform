// src/modules/person/domain/events/person-created.event.ts

import { DomainEvent } from '../../../../shared/base/domain-event.base';
import { PersonID } from '../../../../shared/value-objects/id.value-object';

/**
 * Person Created Domain Event
 *
 * Published when a new person is created in the system.
 * This event triggers various downstream processes like welcome emails,
 * account setup workflows, and notification preferences initialization.
 */
export interface PersonCreatedEventProps {
  /** Person's unique identifier */
  personId: string;

  /** Person's email address */
  email: string;

  /** Person's display name */
  name: string;

  /** Country code for market-specific processing */
  countryCode: string;

  /** Preferred language for communications */
  preferredLanguage: string;

  /** Timestamp when person was created */
  createdAt: Date;
}

export class PersonCreatedEvent extends DomainEvent {
  public readonly payload: PersonCreatedEventProps;

  constructor(props: PersonCreatedEventProps) {
    const personId = PersonID.fromString(props.personId);
    super(personId, 'Person');
    this.payload = props;
  }

  public getEventData(): Record<string, any> {
    return {
      personId: this.payload.personId,
      email: this.payload.email,
      name: this.payload.name,
      countryCode: this.payload.countryCode,
      preferredLanguage: this.payload.preferredLanguage,
      createdAt: this.payload.createdAt.toISOString(),
    };
  }
}
