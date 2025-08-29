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
}

export class PersonUpdatedEvent extends DomainEvent {
  public readonly payload: PersonUpdatedEventProps;

  constructor(props: PersonUpdatedEventProps) {
    const personId = PersonID.fromString(props.personId);
    super(personId, 'Person');
    this.payload = props;
  }

  public getEventData(): Record<string, any> {
    return {
      personId: this.payload.personId,
      updatedFields: this.payload.updatedFields,
      updatedAt: this.payload.updatedAt.toISOString(),
    };
  }
}
