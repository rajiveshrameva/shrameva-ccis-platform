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

// Store event data in WeakMap to avoid object freeze issues
const eventDataMap = new WeakMap<PersonCreatedEvent, Record<string, any>>();

export class PersonCreatedEvent extends DomainEvent {
  constructor(props: PersonCreatedEventProps) {
    const personId = PersonID.fromString(props.personId);
    super(personId, 'Person');

    // Store event data in WeakMap after object is frozen
    eventDataMap.set(this, {
      personId: props.personId,
      email: props.email,
      name: props.name,
      countryCode: props.countryCode,
      createdAt: props.createdAt.toISOString(),
    });
  }

  public getEventData(): Record<string, any> {
    return eventDataMap.get(this) || {};
  }
}
