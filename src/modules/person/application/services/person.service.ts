// src/modules/person/application/services/person.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PersonRepository } from '../../infrastructure/repositories/person.repository';
import { Person } from '../../domain/entities/person.entity';
import { PersonID } from '../../../../shared/value-objects/id.value-object';
import { PersonName } from '../../domain/value-objects/person-name.value-object';
import { UpdatePersonCommand } from '../commands/update-person.command';
import { BusinessRuleException } from '../../../../shared/domain/exceptions/domain-exception.base';

/**
 * Person Application Service
 *
 * Orchestrates person-related operations and implements the application layer
 * between the API controllers and the domain layer.
 */
@Injectable()
export class PersonService {
  private readonly logger = new Logger(PersonService.name);

  constructor(private readonly personRepository: PersonRepository) {}

  /**
   * Updates a person using the UpdatePersonCommand with optimistic concurrency control
   */
  async updatePerson(command: UpdatePersonCommand): Promise<Person> {
    this.logger.log(`Updating person: ${command.personId}`);

    try {
      // 1. Find the existing person
      const personId = PersonID.fromString(command.personId);
      const existingPerson = await this.personRepository.findById(personId);

      if (!existingPerson) {
        throw new NotFoundException(
          `Person with ID ${command.personId} not found`,
        );
      }

      // 2. Prepare the updates object
      const updates: any = {};

      // Handle name updates
      if (
        command.firstName ||
        command.lastName ||
        command.middleName ||
        command.preferredName
      ) {
        updates.name = PersonName.create({
          firstName: command.firstName || existingPerson.name.firstName,
          lastName: command.lastName || existingPerson.name.lastName,
          middleName: command.middleName || existingPerson.name.middleName,
          preferredName:
            command.preferredName || existingPerson.name.preferredName,
        });
      }

      // TODO: Add more field mappings when entity supports them
      // Currently the updateBasicInfo method supports: name, bio, profilePictureUrl, preferredLanguage, timezone
      // But UpdatePersonCommand has: firstName, lastName, middleName, preferredName, email, phone, address fields, etc.
      // We'll focus on the name update for now since that's what both support

      // 3. Update the person with version control
      existingPerson.updateBasicInfo(updates, command.version);

      // 4. Save the updated person
      const updatedPerson = await this.personRepository.save(existingPerson);

      this.logger.log(`Person updated successfully: ${command.personId}`);
      return updatedPerson;
    } catch (error) {
      if (
        error instanceof BusinessRuleException &&
        error.message.includes('Version conflict')
      ) {
        this.logger.warn(
          `Version conflict while updating person ${command.personId}: ${error.message}`,
        );
        throw error; // Re-throw to be handled by controller
      }

      this.logger.error(
        `Failed to update person ${command.personId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Finds a person by ID
   */
  async findPersonById(id: string): Promise<Person | null> {
    const personId = PersonID.fromString(id);
    return await this.personRepository.findById(personId);
  }
}
