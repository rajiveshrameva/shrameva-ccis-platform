// src/modules/person/domain/events/person-updated.event.ts

import { DomainEvent } from '../../../../shared/base/domain-event.base';
import { PersonID } from '../../../../shared/value-objects/id.value-object';

/**
 * Person Updated Domain Event
 *
 * Published when person information is updated.
 */
export interface PersonUpdatedEventProps {
  /** Person's unique identifier */
  personId: string;

  /** Fields that were updated */
  updatedFields: string[];

  /** Timestamp when person was updated */
  updatedAt: Date;

  /** New version after update (for optimistic concurrency control) */
  version: number;
}

// WeakMap to store event data (to bypass Object.freeze() restrictions)
const eventDataMap = new WeakMap<PersonUpdatedEvent, PersonUpdatedEventProps>();

export class PersonUpdatedEvent extends DomainEvent {
  constructor(props: PersonUpdatedEventProps) {
    const personId = PersonID.fromString(props.personId);
    super(personId, 'Person');
    // Store the event data in WeakMap instead of direct property assignment
    eventDataMap.set(this, props);
  }

  public getEventData(): PersonUpdatedEventProps {
    const eventData = eventDataMap.get(this);
    if (!eventData) {
      throw new Error('Event data not found');
    }
    return eventData;
  }

  public getEventDataAsRecord(): Record<string, any> {
    const eventData = this.getEventData();
    return {
      personId: eventData.personId,
      updatedFields: eventData.updatedFields,
      updatedAt: eventData.updatedAt.toISOString(),
      version: eventData.version,
    };
  }
}
