// src/modules/person/application/commands/update-person.command.ts

import { PersonID } from '../../../../shared/value-objects/id.value-object';
import { PersonName } from '../../domain/value-objects/person-name.value-object';
import { PersonAge } from '../../domain/value-objects/person-age.value-object';
import { Gender } from '../../domain/value-objects/gender.value-object';
import { Address } from '../../domain/value-objects/address.value-object';
import { Email } from '../../../../shared/value-objects/email.value-object';
import { PhoneNumber } from '../../../../shared/domain/value-objects/phone.value-object';

/**
 * Update Person Command
 *
 * Command object for updating an existing person in the Shrameva CCIS platform.
 * Supports partial updates with careful handling of sensitive information
 * and business rule validation.
 *
 * Features:
 * - Partial update support (only provided fields are updated)
 * - Optimistic concurrency control via version number
 * - Sensitive field protection (email/phone require special verification)
 * - Audit trail support for compliance
 * - Privacy setting updates
 * - International data handling (India/UAE)
 *
 * This command maintains data integrity while allowing flexible profile
 * updates to support the platform's goal of comprehensive person management.
 */
export class UpdatePersonCommand {
  // Identity and Version Control
  public readonly personId: string;
  public readonly version: number; // For optimistic concurrency control
  public readonly reason?: string; // Update reason for audit trail

  // Personal Information (all optional for partial updates)
  public readonly firstName?: string;
  public readonly lastName?: string;
  public readonly middleName?: string;
  public readonly preferredName?: string;

  // Sensitive Contact Information (requires verification workflow)
  public readonly email?: string;
  public readonly phone?: string;

  // Address Information
  public readonly addressLine1?: string;
  public readonly addressLine2?: string;
  public readonly city?: string;
  public readonly state?: string;
  public readonly postalCode?: string;
  public readonly country?: string;

  // Privacy & Profile Settings
  public readonly profileVisibility?: string;
  public readonly dataSharing?: Record<string, boolean>;
  public readonly marketingOptIn?: boolean;

  // Platform Settings
  public readonly onboardingCompleted?: boolean;
  public readonly profileCompleteness?: number;

  // Metadata
  public readonly updatedBy: string; // ID of person making the update
  public readonly updateSource?: string; // 'web', 'mobile', 'admin', 'system'
  public readonly metadata?: Record<string, any>;

  constructor(data: UpdatePersonCommandData) {
    // Required fields
    this.personId = data.personId;
    this.version = data.version;
    this.updatedBy = data.updatedBy;

    // Optional fields with validation
    this.reason = data.reason?.trim();

    // Personal information
    this.firstName = data.firstName?.trim();
    this.lastName = data.lastName?.trim();
    this.middleName = data.middleName?.trim();
    this.preferredName = data.preferredName?.trim();

    // Contact information
    this.email = data.email?.toLowerCase()?.trim();
    this.phone = data.phone?.trim();

    // Address information
    this.addressLine1 = data.addressLine1?.trim();
    this.addressLine2 = data.addressLine2?.trim();
    this.city = data.city?.trim();
    this.state = data.state?.trim();
    this.postalCode = data.postalCode?.trim();
    this.country = data.country;

    // Privacy & settings
    this.profileVisibility = data.profileVisibility;
    this.dataSharing = data.dataSharing;
    this.marketingOptIn = data.marketingOptIn;

    // Platform settings
    this.onboardingCompleted = data.onboardingCompleted;
    this.profileCompleteness = data.profileCompleteness;

    // Metadata
    this.updateSource = data.updateSource || 'web';
    this.metadata = data.metadata || {};

    this.validate();
  }

  /**
   * Validates the command data for business rule compliance
   */
  private validate(): void {
    const errors: string[] = [];

    // Required field validation
    if (!this.personId) {
      errors.push('Person ID is required');
    }
    if (
      this.version === undefined ||
      this.version === null ||
      this.version < 1
    ) {
      errors.push('Valid version number is required for concurrency control');
    }
    if (!this.updatedBy) {
      errors.push('Updated by person ID is required for audit trail');
    }

    // UUID format validation for IDs
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (this.personId && !uuidRegex.test(this.personId)) {
      errors.push('Invalid person ID format');
    }
    if (this.updatedBy && !uuidRegex.test(this.updatedBy)) {
      errors.push('Invalid updated by person ID format');
    }

    // Name length validation
    if (this.firstName !== undefined) {
      if (!this.firstName || this.firstName.length === 0) {
        errors.push('First name cannot be empty');
      }
      if (this.firstName && this.firstName.length > 100) {
        errors.push('First name cannot exceed 100 characters');
      }
    }

    if (this.lastName !== undefined) {
      if (!this.lastName || this.lastName.length === 0) {
        errors.push('Last name cannot be empty');
      }
      if (this.lastName && this.lastName.length > 100) {
        errors.push('Last name cannot exceed 100 characters');
      }
    }

    if (
      this.middleName !== undefined &&
      this.middleName &&
      this.middleName.length > 100
    ) {
      errors.push('Middle name cannot exceed 100 characters');
    }

    if (
      this.preferredName !== undefined &&
      this.preferredName &&
      this.preferredName.length > 100
    ) {
      errors.push('Preferred name cannot exceed 100 characters');
    }

    // Email validation (basic format check)
    if (this.email !== undefined) {
      if (!this.email || !this.email.includes('@')) {
        errors.push('Valid email address is required');
      }
      if (this.email && this.email.length > 255) {
        errors.push('Email address cannot exceed 255 characters');
      }
    }

    // Phone validation (basic format check)
    if (this.phone !== undefined) {
      if (!this.phone || !this.phone.startsWith('+')) {
        errors.push('Phone number must include country code (e.g., +91, +971)');
      }
      if (this.phone && this.phone.length > 20) {
        errors.push('Phone number cannot exceed 20 characters');
      }
    }

    // Profile visibility validation
    if (this.profileVisibility !== undefined) {
      const validVisibilities = [
        'PUBLIC',
        'PRIVATE',
        'CONTACTS_ONLY',
        'INSTITUTIONS_ONLY',
      ];
      if (!validVisibilities.includes(this.profileVisibility)) {
        errors.push('Invalid profile visibility setting');
      }
    }

    // Country validation
    if (this.country !== undefined) {
      const supportedCountries = ['INDIA', 'UAE'];
      if (!supportedCountries.includes(this.country)) {
        errors.push(
          'Country not supported. Currently supporting India and UAE',
        );
      }
    }

    // Profile completeness validation
    if (this.profileCompleteness !== undefined) {
      if (this.profileCompleteness < 0 || this.profileCompleteness > 100) {
        errors.push('Profile completeness must be between 0 and 100');
      }
    }

    // Update reason validation for sensitive changes
    if (
      (this.email !== undefined || this.phone !== undefined) &&
      !this.reason
    ) {
      errors.push(
        'Update reason is required when changing email or phone number',
      );
    }

    if (errors.length > 0) {
      throw new Error(
        `UpdatePersonCommand validation failed: ${errors.join(', ')}`,
      );
    }
  }

  /**
   * Checks if this update contains sensitive information changes
   */
  public hasSensitiveChanges(): boolean {
    return !!(this.email !== undefined || this.phone !== undefined);
  }

  /**
   * Checks if this update contains personal information changes
   */
  public hasPersonalInfoChanges(): boolean {
    return !!(
      this.firstName !== undefined ||
      this.lastName !== undefined ||
      this.middleName !== undefined ||
      this.preferredName !== undefined
    );
  }

  /**
   * Checks if this update contains address changes
   */
  public hasAddressChanges(): boolean {
    return !!(
      this.addressLine1 !== undefined ||
      this.addressLine2 !== undefined ||
      this.city !== undefined ||
      this.state !== undefined ||
      this.postalCode !== undefined ||
      this.country !== undefined
    );
  }

  /**
   * Checks if this update contains privacy setting changes
   */
  public hasPrivacyChanges(): boolean {
    return !!(
      this.profileVisibility !== undefined ||
      this.dataSharing !== undefined ||
      this.marketingOptIn !== undefined
    );
  }

  /**
   * Gets the list of fields being updated (for audit logging)
   */
  public getUpdatedFields(): string[] {
    const fields: string[] = [];

    if (this.firstName !== undefined) fields.push('firstName');
    if (this.lastName !== undefined) fields.push('lastName');
    if (this.middleName !== undefined) fields.push('middleName');
    if (this.preferredName !== undefined) fields.push('preferredName');
    if (this.email !== undefined) fields.push('email');
    if (this.phone !== undefined) fields.push('phone');
    if (this.addressLine1 !== undefined) fields.push('addressLine1');
    if (this.addressLine2 !== undefined) fields.push('addressLine2');
    if (this.city !== undefined) fields.push('city');
    if (this.state !== undefined) fields.push('state');
    if (this.postalCode !== undefined) fields.push('postalCode');
    if (this.country !== undefined) fields.push('country');
    if (this.profileVisibility !== undefined) fields.push('profileVisibility');
    if (this.dataSharing !== undefined) fields.push('dataSharing');
    if (this.marketingOptIn !== undefined) fields.push('marketingOptIn');
    if (this.onboardingCompleted !== undefined)
      fields.push('onboardingCompleted');
    if (this.profileCompleteness !== undefined)
      fields.push('profileCompleteness');

    return fields;
  }

  /**
   * Creates domain value objects for updated fields
   */
  public toDomainValueObjects(): Partial<{
    name: PersonName;
    email: Email;
    phone: PhoneNumber;
    address: Address;
    gender: Gender;
  }> {
    const result: any = {};

    // Update name if any name fields are provided
    if (this.hasPersonalInfoChanges()) {
      // Note: This creates a new name value object, but the handler should
      // merge with existing name data for fields not being updated
      result.name = PersonName.create({
        firstName: this.firstName || '', // Handler should provide existing value
        lastName: this.lastName || '', // Handler should provide existing value
        middleName: this.middleName,
        preferredName: this.preferredName,
      });
    }

    // Update email if provided
    if (this.email !== undefined) {
      result.email = Email.create(this.email);
    }

    // Update phone if provided
    if (this.phone !== undefined) {
      result.phone = PhoneNumber.create({
        number: this.phone,
        countryCode: this.getCountryCodeFromPhone(this.phone),
        type: 'MOBILE' as any,
        isPrimary: true,
      });
    }

    // Update address if any address fields are provided
    if (this.hasAddressChanges()) {
      // Note: Handler should merge with existing address data
      if (this.hasCompleteAddressData()) {
        result.address = Address.create({
          addressLine1: this.addressLine1!,
          addressLine2: this.addressLine2,
          city: this.city!,
          stateOrProvince: this.state || this.city!,
          postalCode: this.postalCode!,
          country: this.country as any,
          addressType: 'HOME' as any,
          isPrimary: true,
        });
      }
    }

    return result;
  }

  /**
   * Checks if command has complete address data for creating new address
   */
  private hasCompleteAddressData(): boolean {
    return !!(
      this.addressLine1 &&
      this.city &&
      this.postalCode &&
      this.country
    );
  }

  /**
   * Extracts country code from international phone number
   */
  private getCountryCodeFromPhone(phone: string): string {
    if (phone.startsWith('+91')) return 'IN';
    if (phone.startsWith('+971')) return 'AE';
    if (phone.startsWith('+1')) return 'US';
    if (phone.startsWith('+44')) return 'GB';

    return 'IN'; // Default to India
  }

  /**
   * Gets privacy settings updates
   */
  public getPrivacyUpdates(): Record<string, any> {
    const updates: Record<string, any> = {};

    if (this.profileVisibility !== undefined) {
      updates.profileVisibility = this.profileVisibility;
    }
    if (this.dataSharing !== undefined) {
      updates.dataSharing = this.dataSharing;
    }
    if (this.marketingOptIn !== undefined) {
      updates.marketingOptIn = this.marketingOptIn;
    }

    return updates;
  }

  /**
   * Gets platform settings updates
   */
  public getPlatformUpdates(): Record<string, any> {
    const updates: Record<string, any> = {};

    if (this.onboardingCompleted !== undefined) {
      updates.onboardingCompleted = this.onboardingCompleted;
    }
    if (this.profileCompleteness !== undefined) {
      updates.profileCompleteness = this.profileCompleteness;
    }

    return updates;
  }

  /**
   * Gets audit information for the update
   */
  public getAuditInfo(): {
    updatedBy: string;
    updateSource: string;
    reason?: string;
    fieldsUpdated: string[];
    hasSensitiveChanges: boolean;
    metadata: Record<string, any>;
  } {
    return {
      updatedBy: this.updatedBy,
      updateSource: this.updateSource!,
      reason: this.reason,
      fieldsUpdated: this.getUpdatedFields(),
      hasSensitiveChanges: this.hasSensitiveChanges(),
      metadata: this.metadata!,
    };
  }
}

/**
 * Type definition for UpdatePersonCommand constructor data
 */
export interface UpdatePersonCommandData {
  // Required fields
  personId: string;
  version: number;
  updatedBy: string;

  // Optional update fields
  firstName?: string;
  lastName?: string;
  middleName?: string;
  preferredName?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  profileVisibility?: string;
  dataSharing?: Record<string, boolean>;
  marketingOptIn?: boolean;
  onboardingCompleted?: boolean;
  profileCompleteness?: number;

  // Metadata
  reason?: string;
  updateSource?: string;
  metadata?: Record<string, any>;
}
