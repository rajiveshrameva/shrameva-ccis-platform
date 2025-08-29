// src/modules/person/application/handlers/index.ts

export { PersonCreatedHandler } from './person-created.handler';
export { PersonUpdatedHandler } from './person-updated.handler';
export { PersonVerifiedHandler } from './person-verified.handler';
export { SkillPassportCreatedHandler } from './skill-passport-created.handler';
export { PersonDeletedHandler } from './person-deleted.handler';

// Import handlers for array definition
import { PersonCreatedHandler } from './person-created.handler';
import { PersonUpdatedHandler } from './person-updated.handler';
import { PersonVerifiedHandler } from './person-verified.handler';
import { SkillPassportCreatedHandler } from './skill-passport-created.handler';
import { PersonDeletedHandler } from './person-deleted.handler';

/**
 * Person Domain Event Handlers
 *
 * This module exports all event handlers for the Person domain,
 * providing a comprehensive event-driven architecture for managing
 * person lifecycle events and their side effects.
 *
 * Event Handlers:
 * - PersonCreatedHandler: Handles new person registration
 * - PersonUpdatedHandler: Handles person information updates
 * - PersonVerifiedHandler: Handles identity verification completion
 * - SkillPassportCreatedHandler: Handles skill passport initialization
 * - PersonDeletedHandler: Handles person account deletion
 *
 * Usage in Module:
 * ```typescript
 * import {
 *   PersonCreatedHandler,
 *   PersonUpdatedHandler,
 *   PersonVerifiedHandler,
 *   SkillPassportCreatedHandler,
 *   PersonDeletedHandler
 * } from './handlers';
 *
 * @Module({
 *   providers: [
 *     PersonCreatedHandler,
 *     PersonUpdatedHandler,
 *     PersonVerifiedHandler,
 *     SkillPassportCreatedHandler,
 *     PersonDeletedHandler,
 *   ],
 * })
 * export class PersonModule {}
 * ```
 */

/**
 * All Person Domain Event Handlers
 */
export const PERSON_EVENT_HANDLERS = [
  PersonCreatedHandler,
  PersonUpdatedHandler,
  PersonVerifiedHandler,
  SkillPassportCreatedHandler,
  PersonDeletedHandler,
] as const;
