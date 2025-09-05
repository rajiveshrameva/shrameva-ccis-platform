// src/modules/person/api/dtos/create-person.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

/**
 * Create Person DTO
 *
 * Data Transfer Object for creating a new person in the Shrameva CCIS platform.
 * Handles input validation, transformation, and API documentation for person creation.
 *
 * Note: Runtime validation is handled manually in the static validate() method.
 */
export class CreatePersonDto {
  @ApiProperty({
    description: 'First name of the person',
    example: 'Rajesh',
    minLength: 1,
    maxLength: 100,
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name of the person',
    example: 'Kumar',
    minLength: 1,
    maxLength: 100,
  })
  lastName: string;

  @ApiPropertyOptional({
    description: 'Middle name of the person',
    example: 'Singh',
    maxLength: 100,
  })
  middleName?: string;

  @ApiPropertyOptional({
    description: 'Preferred name for informal communication',
    example: 'Raj',
    maxLength: 100,
  })
  preferredName?: string;

  @ApiProperty({
    description: 'Email address (must be unique)',
    example: 'rajesh.kumar@example.com',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: 'Phone number with country code',
    example: '+919876543210',
    pattern: '^\\+[1-9]\\d{1,14}$',
  })
  phone: string;

  @ApiProperty({
    description: 'Date of birth in ISO 8601 format',
    example: '1995-08-15',
    format: 'date',
  })
  @Type(() => Date)
  @Transform(({ value }) => value ? new Date(value) : value)
  dateOfBirth: Date;

  @ApiProperty({
    description: 'Gender identity',
    enum: ['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY'],
    example: 'MALE',
  })
  gender: string;

  @ApiPropertyOptional({
    description: 'Address line 1 (street address)',
    example: '123 Main Street',
    maxLength: 255,
  })
  addressLine1?: string;

  @ApiPropertyOptional({
    description: 'Address line 2 (apartment, suite, etc.)',
    example: 'Apt 4B',
    maxLength: 255,
  })
  addressLine2?: string;

  @ApiPropertyOptional({
    description: 'City name',
    example: 'Mumbai',
    maxLength: 100,
  })
  city?: string;

  @ApiPropertyOptional({
    description: 'State or province',
    example: 'Maharashtra',
    maxLength: 100,
  })
  state?: string;

  @ApiPropertyOptional({
    description: 'Postal/ZIP code',
    example: '400001',
    maxLength: 20,
  })
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'Country code',
    enum: ['INDIA', 'UAE'],
    example: 'INDIA',
  })
  country?: string;

  @ApiPropertyOptional({
    description: 'Profile visibility setting',
    enum: ['PUBLIC', 'PRIVATE', 'CONTACTS_ONLY', 'INSTITUTIONS_ONLY'],
    example: 'CONTACTS_ONLY',
    default: 'CONTACTS_ONLY',
  })
  profileVisibility?: string;

  @ApiPropertyOptional({
    description: 'Data sharing preferences',
    example: {
      analytics: true,
      marketing: false,
      thirdParty: false,
      research: true,
    },
  })
  dataSharing?: Record<string, boolean>;

  @ApiPropertyOptional({
    description: 'Marketing communication consent',
    example: false,
    default: false,
  })
  marketingOptIn?: boolean;

  @ApiPropertyOptional({
    description: 'Terms and conditions acceptance',
    example: true,
  })
  termsAccepted?: boolean;

  @ApiPropertyOptional({
    description: 'Privacy policy acceptance',
    example: true,
  })
  privacyPolicyAccepted?: boolean;

  @ApiPropertyOptional({
    description: 'KYC (Know Your Customer) completion status',
    example: false,
    default: false,
  })
  kycCompleted?: boolean;

  @ApiPropertyOptional({
    description: 'Platform source (web, mobile, admin)',
    example: 'web',
    default: 'web',
  })
  source?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: {
      referralCode: 'REF123',
      campaign: 'summer2025',
      device: 'mobile',
    },
  })
  metadata?: Record<string, any>;

  /**
   * Validates age requirements based on platform business rules
   */
  static validateAge(dateOfBirth: Date): boolean {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      return age - 1 >= 16; // Minimum age 16
    }

    return age >= 16 && age <= 65; // Age range 16-65
  }

  /**
   * Validates phone number format for supported countries
   */
  static validatePhoneForCountry(phone: string, country?: string): boolean {
    if (!country) return true; // Skip country-specific validation if country not provided

    switch (country) {
      case 'INDIA':
        return phone.startsWith('+91') && phone.length === 13;
      case 'UAE':
        return (
          phone.startsWith('+971') && phone.length >= 12 && phone.length <= 13
        );
      default:
        return true;
    }
  }

  /**
   * Checks if required address fields are provided together
   */
  static hasCompleteAddress(dto: Partial<CreatePersonDto>): boolean {
    if (!dto.addressLine1) return true; // No address provided is fine

    // If address line 1 is provided, require city, postal code, and country
    return !!(dto.city && dto.postalCode && dto.country);
  }

  /**
   * Gets default data sharing settings based on country
   */
  static getDefaultDataSharing(country?: string): Record<string, boolean> {
    const defaults = {
      analytics: true,
      marketing: false,
      thirdParty: false,
      research: true,
      placement: true,
      competencyTracking: true,
    };

    // Country-specific adjustments for privacy regulations
    if (country === 'UAE') {
      defaults.thirdParty = false; // Stricter third-party sharing
      defaults.marketing = false; // Opt-in required for marketing
    }

    return defaults;
  }

  /**
   * Manual validation method to replace class-validator decorators
   */
  static validate(dto: CreatePersonDto): string[] {
    const errors: string[] = [];

    // Required field validation
    if (!dto.firstName || dto.firstName.trim().length === 0) {
      errors.push('First name is required');
    }
    if (!dto.lastName || dto.lastName.trim().length === 0) {
      errors.push('Last name is required');
    }
    if (!dto.email || !dto.email.includes('@')) {
      errors.push('Valid email address is required');
    }
    if (!dto.phone || !dto.phone.startsWith('+')) {
      errors.push('Phone number with country code is required');
    }
    if (!dto.dateOfBirth) {
      errors.push('Date of birth is required');
    }
    if (!dto.gender) {
      errors.push('Gender is required');
    }

    // Length validation
    if (dto.firstName && dto.firstName.length > 100) {
      errors.push('First name cannot exceed 100 characters');
    }
    if (dto.lastName && dto.lastName.length > 100) {
      errors.push('Last name cannot exceed 100 characters');
    }
    if (dto.middleName && dto.middleName.length > 100) {
      errors.push('Middle name cannot exceed 100 characters');
    }
    if (dto.email && dto.email.length > 255) {
      errors.push('Email cannot exceed 255 characters');
    }
    if (dto.phone && dto.phone.length > 20) {
      errors.push('Phone number cannot exceed 20 characters');
    }

    // Gender validation
    const validGenders = ['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY'];
    if (dto.gender && !validGenders.includes(dto.gender)) {
      errors.push('Invalid gender value');
    }

    // Country validation
    if (dto.country) {
      const validCountries = ['INDIA', 'UAE'];
      if (!validCountries.includes(dto.country)) {
        errors.push('Invalid country value');
      }
    }

    // Profile visibility validation
    if (dto.profileVisibility) {
      const validVisibilities = [
        'PUBLIC',
        'PRIVATE',
        'CONTACTS_ONLY',
        'INSTITUTIONS_ONLY',
      ];
      if (!validVisibilities.includes(dto.profileVisibility)) {
        errors.push('Invalid profile visibility value');
      }
    }

    // Source validation
    if (dto.source) {
      const validSources = ['web', 'mobile', 'admin', 'api'];
      if (!validSources.includes(dto.source)) {
        errors.push('Invalid source value');
      }
    }

    // Business rule validations
    if (dto.dateOfBirth && !this.validateAge(dto.dateOfBirth)) {
      errors.push('Age must be between 16 and 65 years');
    }

    if (
      dto.phone &&
      dto.country &&
      !this.validatePhoneForCountry(dto.phone, dto.country)
    ) {
      errors.push(`Phone number format is invalid for ${dto.country}`);
    }

    if (!this.hasCompleteAddress(dto)) {
      errors.push(
        'If address is provided, city, postal code, and country are required',
      );
    }

    return errors;
  }
}
