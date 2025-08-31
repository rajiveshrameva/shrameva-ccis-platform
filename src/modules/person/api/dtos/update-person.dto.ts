// src/modules/person/api/dtos/update-person.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Update Person DTO
 *
 * Data Transfer Object for updating an existing person in the Shrameva CCIS platform.
 * Supports partial updates with validation, audit trails, and sensitive data protection.
 *
 * Note: Runtime validation is handled manually in the static validate() method.
 */
export class UpdatePersonDto {
  @ApiProperty({
    description: 'Person ID to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  personId: string;

  @ApiProperty({
    description: 'Current version number for optimistic concurrency control',
    example: 1,
    minimum: 1,
  })
  version: number;

  @ApiProperty({
    description: 'ID of person making the update (for audit trail)',
    example: '123e4567-e89b-12d3-a456-426614174001',
    format: 'uuid',
  })
  updatedBy: string;

  @ApiPropertyOptional({
    description: 'Reason for the update (required for sensitive changes)',
    example: 'Profile completion during onboarding',
    maxLength: 500,
  })
  reason?: string;

  @ApiPropertyOptional({
    description: 'First name of the person',
    example: 'Rajesh',
    minLength: 1,
    maxLength: 100,
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name of the person',
    example: 'Kumar',
    minLength: 1,
    maxLength: 100,
  })
  lastName?: string;

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

  @ApiPropertyOptional({
    description: 'Email address (requires verification workflow)',
    example: 'rajesh.kumar@newemail.com',
    format: 'email',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number with country code (requires verification)',
    example: '+919876543210',
    pattern: '^\\+[1-9]\\d{1,14}$',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Address line 1 (street address)',
    example: '456 New Street',
    maxLength: 255,
  })
  addressLine1?: string;

  @ApiPropertyOptional({
    description: 'Address line 2 (apartment, suite, etc.)',
    example: 'Suite 10A',
    maxLength: 255,
  })
  addressLine2?: string;

  @ApiPropertyOptional({
    description: 'City name',
    example: 'Delhi',
    maxLength: 100,
  })
  city?: string;

  @ApiPropertyOptional({
    description: 'State or province',
    example: 'Delhi',
    maxLength: 100,
  })
  state?: string;

  @ApiPropertyOptional({
    description: 'Postal/ZIP code',
    example: '110001',
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
    example: 'PUBLIC',
  })
  profileVisibility?: string;

  @ApiPropertyOptional({
    description: 'Data sharing preferences (granular control)',
    example: {
      analytics: true,
      marketing: true,
      thirdParty: false,
      research: true,
    },
  })
  dataSharing?: Record<string, boolean>;

  @ApiPropertyOptional({
    description: 'Marketing communication consent',
    example: true,
  })
  marketingOptIn?: boolean;

  @ApiPropertyOptional({
    description: 'Onboarding completion status',
    example: true,
  })
  onboardingCompleted?: boolean;

  @ApiPropertyOptional({
    description: 'Profile completeness percentage',
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  profileCompleteness?: number;

  @ApiPropertyOptional({
    description: 'Update source (web, mobile, admin, system)',
    example: 'web',
    enum: ['web', 'mobile', 'admin', 'system'],
  })
  updateSource?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata for the update',
    example: {
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
      feature: 'profile-completion',
    },
  })
  metadata?: Record<string, any>;

  /**
   * Validates that sensitive changes include a reason
   */
  static validateSensitiveChanges(dto: UpdatePersonDto): boolean {
    const hasSensitiveChanges =
      dto.email !== undefined || dto.phone !== undefined;

    if (hasSensitiveChanges && !dto.reason) {
      return false;
    }

    return true;
  }

  /**
   * Validates phone number format for supported countries
   */
  static validatePhoneForCountry(phone: string, country?: string): boolean {
    if (!country) return true;

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
   * Gets the list of fields being updated
   */
  static getUpdatedFields(dto: UpdatePersonDto): string[] {
    const fields: string[] = [];

    if (dto.firstName !== undefined) fields.push('firstName');
    if (dto.lastName !== undefined) fields.push('lastName');
    if (dto.middleName !== undefined) fields.push('middleName');
    if (dto.preferredName !== undefined) fields.push('preferredName');
    if (dto.email !== undefined) fields.push('email');
    if (dto.phone !== undefined) fields.push('phone');
    if (dto.addressLine1 !== undefined) fields.push('addressLine1');
    if (dto.addressLine2 !== undefined) fields.push('addressLine2');
    if (dto.city !== undefined) fields.push('city');
    if (dto.state !== undefined) fields.push('state');
    if (dto.postalCode !== undefined) fields.push('postalCode');
    if (dto.country !== undefined) fields.push('country');
    if (dto.profileVisibility !== undefined) fields.push('profileVisibility');
    if (dto.dataSharing !== undefined) fields.push('dataSharing');
    if (dto.marketingOptIn !== undefined) fields.push('marketingOptIn');
    if (dto.onboardingCompleted !== undefined)
      fields.push('onboardingCompleted');
    if (dto.profileCompleteness !== undefined)
      fields.push('profileCompleteness');

    return fields;
  }

  /**
   * Checks if the update contains personal information changes
   */
  static hasPersonalInfoChanges(dto: UpdatePersonDto): boolean {
    return !!(
      dto.firstName !== undefined ||
      dto.lastName !== undefined ||
      dto.middleName !== undefined ||
      dto.preferredName !== undefined
    );
  }

  /**
   * Checks if the update contains address changes
   */
  static hasAddressChanges(dto: UpdatePersonDto): boolean {
    return !!(
      dto.addressLine1 !== undefined ||
      dto.addressLine2 !== undefined ||
      dto.city !== undefined ||
      dto.state !== undefined ||
      dto.postalCode !== undefined ||
      dto.country !== undefined
    );
  }

  /**
   * Checks if the update contains privacy setting changes
   */
  static hasPrivacyChanges(dto: UpdatePersonDto): boolean {
    return !!(
      dto.profileVisibility !== undefined ||
      dto.dataSharing !== undefined ||
      dto.marketingOptIn !== undefined
    );
  }

  /**
   * Manual validation method to replace class-validator decorators
   */
  static validate(dto: UpdatePersonDto): string[] {
    const errors: string[] = [];

    // Required field validation
    if (!dto.personId) {
      errors.push('Person ID is required');
    }
    if (dto.version === undefined || dto.version === null || dto.version < 1) {
      errors.push('Valid version number is required for concurrency control');
    }
    if (!dto.updatedBy) {
      errors.push('Updated by person ID is required for audit trail');
    }

    // UUID format validation
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (dto.personId && !uuidRegex.test(dto.personId)) {
      errors.push('Invalid person ID format');
    }
    if (dto.updatedBy && !uuidRegex.test(dto.updatedBy)) {
      errors.push('Invalid updated by person ID format');
    }

    // Name length validation
    if (dto.firstName !== undefined) {
      if (!dto.firstName || dto.firstName.length === 0) {
        errors.push('First name cannot be empty');
      }
      if (dto.firstName && dto.firstName.length > 100) {
        errors.push('First name cannot exceed 100 characters');
      }
    }

    if (dto.lastName !== undefined) {
      if (!dto.lastName || dto.lastName.length === 0) {
        errors.push('Last name cannot be empty');
      }
      if (dto.lastName && dto.lastName.length > 100) {
        errors.push('Last name cannot exceed 100 characters');
      }
    }

    // Email validation
    if (dto.email !== undefined) {
      if (!dto.email || !dto.email.includes('@')) {
        errors.push('Valid email address is required');
      }
      if (dto.email && dto.email.length > 255) {
        errors.push('Email address cannot exceed 255 characters');
      }
    }

    // Phone validation
    if (dto.phone !== undefined) {
      if (!dto.phone || !dto.phone.startsWith('+')) {
        errors.push('Phone number must include country code (e.g., +91, +971)');
      }
      if (dto.phone && dto.phone.length > 20) {
        errors.push('Phone number cannot exceed 20 characters');
      }
    }

    // Sensitive changes validation
    if (!this.validateSensitiveChanges(dto)) {
      errors.push(
        'Update reason is required when changing email or phone number',
      );
    }

    return errors;
  }
}
