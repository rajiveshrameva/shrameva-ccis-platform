// src/modules/person/person.module.ts

import { Module } from '@nestjs/common';
import { PersonController } from './api/person.controller';
import { PersonRepository } from './infrastructure/repositories/person.repository';
import { PersonService } from './application/services/person.service';
import { PersonCreatedHandler } from './application/handlers/person-created.handler';
import { PersonUpdatedHandler } from './application/handlers/person-updated.handler';
import { PersonVerifiedHandler } from './application/handlers/person-verified.handler';
import { PersonDeletedHandler } from './application/handlers/person-deleted.handler';
import { SkillPassportCreatedHandler } from './application/handlers/skill-passport-created.handler';
import { SharedInfrastructureModule } from '../../shared/infrastructure/shared-infrastructure.module';

/**
 * Person Module
 *
 * Aggregates all person-related components including:
 * - API controllers and DTOs
 * - Domain entities and value objects
 * - Application command/query handlers
 * - Infrastructure repositories
 * - Event handlers
 */
@Module({
  imports: [
    SharedInfrastructureModule,
    // DatabaseModule will be imported from shared when needed
  ],
  controllers: [PersonController],
  providers: [
    // Repository
    PersonRepository,

    // Application Services
    PersonService,

    // Event Handlers
    PersonCreatedHandler,
    PersonUpdatedHandler,
    PersonVerifiedHandler,
    PersonDeletedHandler,
    SkillPassportCreatedHandler,

    // TODO: Add command/query handlers when created
    // PersonCommandHandler,
    // PersonQueryHandler,
  ],
  exports: [
    PersonRepository,
    PersonService,
    // Export handlers for other modules that might need to trigger person events
    PersonCreatedHandler,
    PersonUpdatedHandler,
    PersonVerifiedHandler,
    PersonDeletedHandler,
    SkillPassportCreatedHandler,
  ],
})
export class PersonModule {}
