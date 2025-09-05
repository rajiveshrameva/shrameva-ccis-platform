// src/modules/person/application/services/person.service.ts

import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PersonRepository } from '../../infrastructure/repositories/person.repository';
import { Person } from '../../domain/entities/person.entity';
import { PersonID } from '../../../../shared/value-objects/id.value-object';
import { Email } from '../../../../shared/value-objects/email.value-object';
import {
  PhoneNumber,
  PhoneType,
} from '../../../../shared/domain/value-objects/phone.value-object';
import { PersonName } from '../../domain/value-objects/person-name.value-object';
import { PersonAge } from '../../domain/value-objects/person-age.value-object';
import {
  Gender,
  GenderType,
} from '../../domain/value-objects/gender.value-object';
import {
  Address,
  SupportedCountry,
  AddressType,
} from '../../domain/value-objects/address.value-object';
import { CreatePersonCommand } from '../commands/create-person.command';
import { UpdatePersonCommand } from '../commands/update-person.command';
import {
  BusinessRuleException,
  ValidationException,
} from '../../../../shared/domain/exceptions/domain-exception.base';
import {
  PreferredLanguage,
  VisibilityLevel,
  DataRetentionPreference,
} from '../../domain/entities/person.entity';

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
   * Creates a new person using the CreatePersonCommand
   */
  async createPerson(command: CreatePersonCommand): Promise<Person> {
    this.logger.log(`Creating person: ${command.email}`);

    try {
      // 1. Check if person with email already exists (active accounts)
      const email = Email.create(command.email);
      const existingPersonByEmail =
        await this.personRepository.findByEmail(email);
      if (existingPersonByEmail) {
        throw new ConflictException(
          `Person with email ${command.email} already exists`,
        );
      }

      // 2. Check for deleted account that can be reactivated
      const deletedPersonByEmail =
        await this.personRepository.findDeletedByEmail(command.email);
      if (deletedPersonByEmail) {
        this.logger.log(
          `Found deleted account for ${command.email}, reactivating instead of creating new`,
        );

        // Reactivate the account first (this will reset version)
        const reactivatedPerson =
          await this.personRepository.reactivate(deletedPersonByEmail);

        // Then update with new information
        const updatedName = PersonName.create({
          firstName: command.firstName,
          lastName: command.lastName,
          middleName: command.middleName,
          preferredName: command.preferredName,
        });

        reactivatedPerson.updateBasicInfo(
          {
            name: updatedName,
          },
          1,
        ); // Use version 1 since reactivation resets version

        // Save the updated person
        const finalPerson = await this.personRepository.save(reactivatedPerson);

        this.logger.log(
          `Person account reactivated successfully: ${finalPerson.id.getValue()}`,
        );
        return finalPerson;
      }

      // 3. Check for deleted account by phone
      const deletedPersonByPhone =
        await this.personRepository.findDeletedByPhone(command.phone);
      if (deletedPersonByPhone) {
        this.logger.log(
          `Found deleted account for ${command.phone}, reactivating instead of creating new`,
        );

        // Reactivate the account first (this will reset version)
        const reactivatedPerson =
          await this.personRepository.reactivate(deletedPersonByPhone);

        // Then update with new information
        const updatedName = PersonName.create({
          firstName: command.firstName,
          lastName: command.lastName,
          middleName: command.middleName,
          preferredName: command.preferredName,
        });

        reactivatedPerson.updateBasicInfo(
          {
            name: updatedName,
          },
          1,
        ); // Use version 1 since reactivation resets version

        // Save the updated person
        const finalPerson = await this.personRepository.save(reactivatedPerson);

        this.logger.log(
          `Person account reactivated successfully: ${finalPerson.id.getValue()}`,
        );
        return finalPerson;
      }

      // 2. Create value objects
      const name = PersonName.create({
        firstName: command.firstName,
        lastName: command.lastName,
        middleName: command.middleName,
        preferredName: command.preferredName,
      });

      const age = PersonAge.fromDateOfBirth(command.dateOfBirth);
      const gender = Gender.createWithDefaults(command.gender as GenderType);

      // Create phone number with proper props
      const primaryPhone = PhoneNumber.create({
        number: command.phone,
        countryCode: 'IN', // Default to India
        type: PhoneType.MOBILE,
        isPrimary: true,
        isVerified: false,
      });

      // Create address if provided, otherwise use a placeholder address
      let primaryAddress: Address;
      if (command.addressLine1 && command.addressLine1.trim()) {
        // User provided address information
        primaryAddress = Address.create({
          addressLine1: command.addressLine1,
          addressLine2: command.addressLine2,
          city: command.city || '',
          stateOrProvince: command.state || '',
          postalCode: command.postalCode || '',
          country:
            (command.country as SupportedCountry) || SupportedCountry.INDIA,
          addressType: AddressType.HOME,
          isPrimary: true,
        });
      } else {
        // Create a placeholder address since Person requires one
        primaryAddress = Address.create({
          addressLine1: 'Address not provided',
          addressLine2: undefined,
          city: 'Bangalore',
          stateOrProvince: 'Karnataka',
          postalCode: '560001',
          country: SupportedCountry.INDIA,
          addressType: AddressType.HOME,
          isPrimary: true,
        });
      }

      // Default privacy settings
      const privacySettings = {
        dataProcessingConsent: command.termsAccepted || false,
        marketingConsent: command.marketingOptIn || false,
        employerVisibility: true,
        aiMatchingConsent: true,
        assessmentSharingConsent: true,
        phoneVisibility: VisibilityLevel.EMPLOYERS_ONLY,
        emailVisibility: VisibilityLevel.EMPLOYERS_ONLY,
        addressVisibility: VisibilityLevel.PRIVATE,
        skillPassportVisibility: VisibilityLevel.EMPLOYERS_ONLY,
        dataRetentionPreference: DataRetentionPreference.KEEP_INDEFINITELY,
      };

      // 3. Create Person domain entity
      const person = await Person.create({
        name,
        age,
        gender,
        email,
        primaryPhone,
        primaryAddress,
        preferredLanguage: PreferredLanguage.ENGLISH,
        timezone: 'Asia/Kolkata', // Default to India timezone
        privacySettings,
      });

      // 4. Save to database
      const savedPerson = await this.personRepository.save(person);

      this.logger.log(
        `Person created successfully: ${savedPerson.id.getValue()}`,
      );
      return savedPerson;
    } catch (error) {
      this.logger.error(
        `Failed to create person ${command.email}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

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

      // 4. Save the updated person using update method
      const updatedPerson = await this.personRepository.update(existingPerson);

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

  /**
   * Finds all persons with pagination and filtering
   */
  async findAllPersons(options?: {
    page?: number;
    limit?: number;
    country?: string;
    status?: string;
    profileVisibility?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<any> {
    try {
      // Build find options
      const findOptions: any = {
        page: options?.page || 1,
        limit: options?.limit || 20,
        sortBy: options?.sortBy || 'createdAt',
        sortOrder: options?.sortOrder || 'desc',
        where: {},
      };

      // Add filters to where clause
      if (options?.country) {
        findOptions.where.country = options.country;
      }
      if (options?.profileVisibility) {
        findOptions.where.profileVisibility = options.profileVisibility;
      }
      if (options?.search) {
        findOptions.where.search = options.search;
      }

      const result = await this.personRepository.findAll(findOptions);

      this.logger.log(
        `Found ${result.data.length} persons (total: ${result.total})`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to find all persons: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Deletes a person (soft delete)
   */
  async deletePerson(id: string, reason?: string): Promise<void> {
    try {
      const personId = PersonID.fromString(id);

      // Check if person exists
      const person = await this.personRepository.findById(personId);
      if (!person) {
        throw new NotFoundException(`Person with ID ${id} not found`);
      }

      // Perform soft delete
      const deleted = await this.personRepository.delete(personId);

      if (!deleted) {
        throw new Error('Failed to delete person');
      }

      this.logger.log(
        `Person deleted successfully: ${id}${reason ? ` (reason: ${reason})` : ''}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete person ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
