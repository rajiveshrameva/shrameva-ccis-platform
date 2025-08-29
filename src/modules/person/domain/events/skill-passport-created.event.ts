// src/modules/person/domain/events/skill-passport-created.event.ts

import { DomainEvent } from '../../../../shared/base/domain-event.base';
import { PersonID } from '../../../../shared/value-objects/id.value-object';

/**
 * Skill Passport Created Domain Event
 *
 * Published when a skill passport is created for a person.
 * This is the core innovation of Shrameva - the CCIS tracking system.
 */
export interface SkillPassportCreatedEventProps {
  /** Person's unique identifier */
  personId: string;

  /** Skill passport unique identifier */
  passportId: string;

  /** Timestamp when passport was created */
  createdAt: Date;
}

export class SkillPassportCreatedEvent extends DomainEvent {
  public readonly payload: SkillPassportCreatedEventProps;

  constructor(props: SkillPassportCreatedEventProps) {
    const personId = PersonID.fromString(props.personId);
    super(personId, 'Person');
    this.payload = props;
  }

  public getEventData(): Record<string, any> {
    return {
      personId: this.payload.personId,
      passportId: this.payload.passportId,
      createdAt: this.payload.createdAt.toISOString(),
    };
  }
}
