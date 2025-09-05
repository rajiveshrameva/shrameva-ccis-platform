// src/modules/person/infrastructure/repositories/person.repository.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import {
  Gender as PrismaGender,
  ProfileVisibility as PrismaProfileVisibility,
  SupportedCountry as PrismaSupportedCountry,
  KYCStatus as PrismaKYCStatus,
} from '@prisma/client';
import { IPersonRepository } from '../../domain/repositories/person.repository.interface';
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
  Address,
  SupportedCountry,
  AddressType,
} from '../../domain/value-objects/address.value-object';
import {
  Gender,
  GenderType,
} from '../../domain/value-objects/gender.value-object';
import {
  FindAllOptions,
  ITransaction,
  RepositoryException,
  PaginatedResult,
} from '../../../../shared/domain/base/repository.interface';
import {
  ValidationException,
  ConcurrencyException,
} from '../../../../shared/domain/exceptions/domain-exception.base';
import {
  PreferredLanguage,
  VisibilityLevel,
  DataRetentionPreference,
} from '../../domain/entities/person.entity';

/**
 * Minimal Person Repository Implementation
 *
 * Focuses on core CRUD operations for Person creation testing.
 * This is a simplified implementation to get the Person API working.
 */
@Injectable()
export class PersonRepository implements Partial<IPersonRepository> {
  private readonly logger = new Logger(PersonRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new person in the database
   */
  async save(person: Person, transaction?: ITransaction): Promise<Person> {
    this.logger.debug(`Saving person: ${person.id.getValue()}`);

    try {
      const personData = {
        // Use the person's CID directly
        id: person.id.getValue(),
        firstName: person.name.firstName,
        middleName: person.name.middleName,
        lastName: person.name.lastName,
        preferredName: person.name.preferredName,
        email: person.email.getValue(),
        phone: person.primaryPhone.number,
        phoneCountryCode: person.primaryPhone.countryCode,
        dateOfBirth: person.age.dateOfBirth,
        gender: this.mapGenderToPrisma(person.gender.gender), // Map to Prisma Gender enum
        addressLine1: person.primaryAddress.addressLine1,
        addressLine2: person.primaryAddress.addressLine2,
        city: person.primaryAddress.city,
        state: person.primaryAddress.stateOrProvince,
        postalCode: person.primaryAddress.postalCode,
        country: person.primaryAddress.country as PrismaSupportedCountry, // Should match Prisma SupportedCountry enum
        profileVisibility: person.privacySettings.employerVisibility
          ? PrismaProfileVisibility.PUBLIC
          : PrismaProfileVisibility.PRIVATE,
        dataSharing: JSON.stringify({}),
        // Map privacy settings to the privacySettings JSON field
        privacySettings: JSON.stringify({
          marketingConsent: person.privacySettings.marketingConsent,
          dataProcessingConsent: person.privacySettings.dataProcessingConsent,
          employerVisibility: person.privacySettings.employerVisibility,
        }),
        kycStatus: PrismaKYCStatus.PENDING, // Use the KYCStatus enum
        emailVerified: person.isVerified,
        phoneVerified: person.primaryPhone.isVerified,
      };

      const savedPerson = await this.prisma.person.create({
        data: personData,
      });

      this.logger.log(`✅ Person saved successfully: ${person.id.getValue()}`);

      // Return the original person for now (should reconstruct from saved data)
      return person;
    } catch (error) {
      this.logger.error(
        `❌ Failed to save person: ${person.id.getValue()}`,
        error,
      );

      if (error.code === 'P2002') {
        throw new ValidationException(
          `Person with email or phone already exists`,
          'save',
          'UNIQUE_CONSTRAINT',
        );
      }

      throw new RepositoryException(
        `Failed to save person: ${error.message}`,
        'save',
        'DATABASE_ERROR',
      );
    }
  }

  /**
   * Find person by ID
   */
  async findById(
    id: PersonID,
    transaction?: ITransaction,
  ): Promise<Person | null> {
    this.logger.debug(`Finding person by ID: ${id.getValue()}`);

    try {
      // Use the CID directly for database query
      const personData = await this.prisma.person.findUnique({
        where: {
          id: id.getValue(),
          deletedAt: null,
        },
      });

      if (!personData) {
        return null;
      }

      // Return reconstructed person
      return this.reconstructPerson(personData);
    } catch (error) {
      this.logger.error(
        `❌ Failed to find person by ID: ${id.getValue()}`,
        error,
      );
      throw new RepositoryException(
        `Failed to find person: ${error.message}`,
        'findById',
        'DATABASE_ERROR',
      );
    }
  }

  /**
   * Find person by email
   */
  async findByEmail(
    email: Email,
    transaction?: ITransaction,
  ): Promise<Person | null> {
    this.logger.debug(`Finding person by email: ${email.getValue()}`);

    try {
      const personData = await this.prisma.person.findFirst({
        where: {
          email: email.getValue(),
          deletedAt: null,
        },
      });

      if (!personData) {
        return null;
      }

      return this.reconstructPerson(personData);
    } catch (error) {
      this.logger.error(
        `❌ Failed to find person by email: ${email.getValue()}`,
        error,
      );
      throw new RepositoryException(
        `Failed to find person by email: ${error.message}`,
        'findByEmail',
        'DATABASE_ERROR',
      );
    }
  }

  /**
   * Reconstruct Person from database data
   */
  private reconstructPerson(data: any): Person {
    // Use the CID directly from the database
    const personId = PersonID.fromString(data.id);

    const name = PersonName.create({
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      preferredName: data.preferredName,
    });
    const email = Email.create(data.email);
    const primaryPhone = PhoneNumber.create({
      number: data.phone,
      countryCode: data.phoneCountryCode,
      type: PhoneType.MOBILE,
      isPrimary: true,
      isVerified: data.phoneVerified || false,
    });
    const age = PersonAge.fromDateOfBirth(data.dateOfBirth);
    const gender = Gender.create({
      gender: this.mapPrismaToGender(data.gender),
      pronouns: 'they/them', // Default pronouns
      isPublic: true,
    });

    const primaryAddress = Address.create({
      addressLine1: data.addressLine1 || '',
      addressLine2: data.addressLine2,
      city: data.city || '',
      stateOrProvince: data.state || '', // Fix: database column is 'state', not 'stateOrProvince'
      postalCode: data.postalCode || '',
      country: (data.country as SupportedCountry) || SupportedCountry.INDIA,
      addressType: AddressType.HOME,
      isPrimary: true,
    });

    const privacySettings = {
      dataProcessingConsent: data.termsAccepted || false,
      marketingConsent: data.marketingOptIn || false,
      employerVisibility: data.profileVisibility === 'PUBLIC',
      aiMatchingConsent: true,
      assessmentSharingConsent: true,
      phoneVisibility: VisibilityLevel.EMPLOYERS_ONLY,
      emailVisibility: VisibilityLevel.EMPLOYERS_ONLY,
      addressVisibility: VisibilityLevel.PRIVATE,
      skillPassportVisibility: VisibilityLevel.EMPLOYERS_ONLY,
      dataRetentionPreference: DataRetentionPreference.KEEP_INDEFINITELY,
    };

    // Use fromPersistence to reconstruct
    return Person.fromPersistence({
      id: personId,
      name,
      age,
      gender,
      email,
      primaryPhone,
      primaryAddress,
      preferredLanguage: PreferredLanguage.ENGLISH,
      timezone: 'Asia/Kolkata',
      privacySettings,
      isVerified: data.emailVerified || false,
      kycStatus: 'NOT_STARTED' as any,
      status: 'ACTIVE' as any,
      version: data.version || 1,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  /**
   * Map domain GenderType to Prisma Gender enum
   */
  private mapGenderToPrisma(genderType: GenderType): PrismaGender {
    switch (genderType) {
      case GenderType.MALE:
        return PrismaGender.MALE;
      case GenderType.FEMALE:
        return PrismaGender.FEMALE;
      case GenderType.NON_BINARY:
        return PrismaGender.NON_BINARY;
      case GenderType.PREFER_NOT_TO_SAY:
        return PrismaGender.PREFER_NOT_TO_SAY;
      default:
        return PrismaGender.OTHER;
    }
  }

  /**
   * Map Prisma Gender to domain GenderType
   */
  private mapPrismaToGender(prismaGender: PrismaGender): GenderType {
    switch (prismaGender) {
      case PrismaGender.MALE:
        return GenderType.MALE;
      case PrismaGender.FEMALE:
        return GenderType.FEMALE;
      case PrismaGender.NON_BINARY:
        return GenderType.NON_BINARY;
      case PrismaGender.PREFER_NOT_TO_SAY:
        return GenderType.PREFER_NOT_TO_SAY;
      default:
        return GenderType.PREFER_NOT_TO_SAY;
    }
  }

  // Stub implementations for interface compatibility
  async update(person: Person, transaction?: ITransaction): Promise<Person> {
    this.logger.log(`Updating person: ${person.id.getValue()}`);

    try {
      // Use the CID directly from the person ID
      const personData = {
        firstName: person.name.firstName,
        middleName: person.name.middleName,
        lastName: person.name.lastName,
        preferredName: person.name.preferredName,
        email: person.email.getValue(),
        phone: person.primaryPhone.number,
        phoneCountryCode: person.primaryPhone.countryCode,
        phoneVerified: person.primaryPhone.isVerified,
        dateOfBirth: person.age.dateOfBirth,
        gender: this.mapGenderToPrisma(person.gender.gender),
        addressLine1: person.primaryAddress.addressLine1,
        addressLine2: person.primaryAddress.addressLine2,
        city: person.primaryAddress.city,
        state: person.primaryAddress.stateOrProvince, // Use 'state' field instead of 'stateOrProvince'
        postalCode: person.primaryAddress.postalCode,
        country: person.primaryAddress.country as PrismaSupportedCountry,
        profileVisibility: person.privacySettings.employerVisibility
          ? ('PUBLIC' as PrismaProfileVisibility)
          : ('PRIVATE' as PrismaProfileVisibility),
        // Store privacy settings as JSON
        privacySettings: JSON.stringify({
          marketingConsent: person.privacySettings.marketingConsent,
          dataProcessingConsent: person.privacySettings.dataProcessingConsent,
          employerVisibility: person.privacySettings.employerVisibility,
        }),
        updatedAt: new Date(),
      };

      const updatedPersonData = await this.prisma.person.update({
        where: { id: person.id.getValue() },
        data: personData,
      });

      return this.reconstructPerson(updatedPersonData);
    } catch (error) {
      this.logger.error(
        `Failed to update person: ${error.message}`,
        error.stack,
      );
      throw new RepositoryException(
        `Failed to update person: ${error.message}`,
        'update',
        'Person',
        error,
      );
    }
  }

  async findByPhone(phone: PhoneNumber): Promise<Person | null> {
    this.logger.log(`Finding person by phone: ${phone.number}`);

    try {
      const personData = await this.prisma.person.findFirst({
        where: {
          phone: phone.number,
          phoneCountryCode: phone.countryCode,
          accountStatus: 'ACTIVE',
        },
      });

      if (!personData) {
        return null;
      }

      return this.reconstructPerson(personData);
    } catch (error) {
      this.logger.error(
        `Failed to find person by phone: ${error.message}`,
        error.stack,
      );
      throw new RepositoryException(
        `Failed to find person by phone: ${error.message}`,
        'findByPhone',
        'Person',
        error,
      );
    }
  }

  async delete(id: PersonID): Promise<boolean> {
    this.logger.log(`Soft deleting person: ${id.getValue()}`);

    try {
      // Soft delete by marking account as INACTIVE
      await this.prisma.person.update({
        where: { id: id.getValue() },
        data: {
          accountStatus: 'INACTIVE',
          deletedAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to delete person: ${error.message}`,
        error.stack,
      );
      if (error.code === 'P2025') {
        // Record not found
        return false;
      }
      throw new RepositoryException(
        `Failed to delete person: ${error.message}`,
        'delete',
        'Person',
        error,
      );
    }
  }

  async exists(id: PersonID): Promise<boolean> {
    try {
      const count = await this.prisma.person.count({
        where: {
          id: id.getValue(),
          accountStatus: 'ACTIVE',
        },
      });
      return count > 0;
    } catch (error) {
      this.logger.error(
        `Failed to check person existence: ${error.message}`,
        error.stack,
      );
      throw new RepositoryException(
        `Failed to check person existence: ${error.message}`,
        'exists',
        'Person',
        error,
      );
    }
  }

  async count(): Promise<number> {
    try {
      return await this.prisma.person.count({
        where: { accountStatus: 'ACTIVE' },
      });
    } catch (error) {
      this.logger.error(
        `Failed to count persons: ${error.message}`,
        error.stack,
      );
      throw new RepositoryException(
        `Failed to count persons: ${error.message}`,
        'count',
        'Person',
        error,
      );
    }
  }

  async findAll(options?: FindAllOptions): Promise<PaginatedResult<Person>> {
    this.logger.log(
      `Finding all persons with options: ${JSON.stringify(options)}`,
    );

    try {
      const page = options?.page || 1;
      const limit = options?.limit || 20;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
        accountStatus: 'ACTIVE',
      };

      // Add filters if provided in where clause
      if (options?.where) {
        const filter = options.where as any;
        if (filter.country) {
          where.country = filter.country;
        }
        if (filter.profileVisibility) {
          where.profileVisibility = filter.profileVisibility;
        }
        if (filter.search) {
          where.OR = [
            { firstName: { contains: filter.search, mode: 'insensitive' } },
            { lastName: { contains: filter.search, mode: 'insensitive' } },
            { email: { contains: filter.search, mode: 'insensitive' } },
          ];
        }
      }

      // Build order clause
      const orderBy: any = {};
      if (options?.sortBy) {
        orderBy[options.sortBy] = options.sortOrder || 'desc';
      } else {
        orderBy.createdAt = 'desc';
      }

      // Execute queries
      const [personsData, total] = await Promise.all([
        this.prisma.person.findMany({
          where,
          skip,
          take: limit,
          orderBy,
        }),
        this.prisma.person.count({ where }),
      ]);

      // Reconstruct persons
      const persons = personsData.map((data) => this.reconstructPerson(data));

      const totalPages = Math.ceil(total / limit);

      return {
        data: persons,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      };
    } catch (error) {
      this.logger.error(
        `Failed to find all persons: ${error.message}`,
        error.stack,
      );
      throw new RepositoryException(
        `Failed to find all persons: ${error.message}`,
        'findAll',
        'Person',
        error,
      );
    }
  }

  /**
   * Find deleted person by email (for reactivation)
   */
  async findDeletedByEmail(email: string): Promise<Person | null> {
    this.logger.debug(`Finding deleted person by email: ${email}`);

    try {
      const personData = await this.prisma.person.findFirst({
        where: {
          email: email,
          deletedAt: { not: null },
        },
      });

      if (!personData) {
        return null;
      }

      return this.reconstructPerson(personData);
    } catch (error) {
      this.logger.error(
        `Failed to find deleted person by email: ${error.message}`,
        error.stack,
      );
      throw new RepositoryException(
        `Failed to find deleted person by email: ${error.message}`,
        'findDeletedByEmail',
        'Person',
        error,
      );
    }
  }

  /**
   * Find deleted person by phone (for reactivation)
   */
  async findDeletedByPhone(phone: string): Promise<Person | null> {
    this.logger.debug(`Finding deleted person by phone: ${phone}`);

    try {
      const personData = await this.prisma.person.findFirst({
        where: {
          phone: phone,
          deletedAt: { not: null },
        },
      });

      if (!personData) {
        return null;
      }

      return this.reconstructPerson(personData);
    } catch (error) {
      this.logger.error(
        `Failed to find deleted person by phone: ${error.message}`,
        error.stack,
      );
      throw new RepositoryException(
        `Failed to find deleted person by phone: ${error.message}`,
        'findDeletedByPhone',
        'Person',
        error,
      );
    }
  }

  /**
   * Reactivate a deleted person account
   */
  async reactivate(person: Person): Promise<Person> {
    this.logger.log(`Reactivating person: ${person.id.getValue()}`);

    try {
      // Clear deletion timestamp and reactivate account
      const updatedPersonData = await this.prisma.person.update({
        where: { id: person.id.getValue() },
        data: {
          deletedAt: null,
          accountStatus: 'ACTIVE',
          updatedAt: new Date(),
          version: { increment: 1 },
          // Reset verification status for security
          emailVerified: false,
          phoneVerified: false,
          emailVerifiedAt: null,
          phoneVerifiedAt: null,
        },
      });

      return this.reconstructPerson(updatedPersonData);
    } catch (error) {
      this.logger.error(
        `Failed to reactivate person: ${error.message}`,
        error.stack,
      );
      throw new RepositoryException(
        `Failed to reactivate person: ${error.message}`,
        'reactivate',
        'Person',
        error,
      );
    }
  }
}
