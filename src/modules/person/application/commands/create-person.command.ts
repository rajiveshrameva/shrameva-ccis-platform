// src/modules/person/application/commands/create-person.command.ts

import { PersonName } from '../../domain/value-objects/person-name.value-object';
import { PersonAge } from '../../domain/value-objects/person-age.value-object';
import { Gender } from '../../domain/value-objects/gender.value-object';
import { Address } from '../../domain/value-objects/address.value-object';
import { Email } from '../../../../shared/value-objects/email.value-object';
import { PhoneNumber } from '../../../../shared/domain/value-objects/phone.value-object';

/**
 * Create Person Command
 *
 * Command object for creating a new person in the Shrameva CCIS platform.
 * Contains all necessary information to create a Person aggregate with
 * proper validation and business rules.
 *
 * Features:
 * - Complete personal information capture
 * - Multi-country support (India/UAE)
 * - Optional fields for progressive data collection
 * - Validation through value objects
 * - Privacy and compliance settings
 *
 * This command supports the platform's goal of achieving 70% placement
 * rates by ensuring comprehensive person profile creation from onboarding.
 */
export class CreatePersonCommand {
  // Required Core Information
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly email: string;
  public readonly phone: string;
  public readonly dateOfBirth: Date;
  public readonly gender: string;

  // Optional Personal Information
  public readonly middleName?: string;
  public readonly preferredName?: string;

  // Contact & Address Information (Optional for progressive profile building)
  public readonly addressLine1?: string;
  public readonly addressLine2?: string;
  public readonly city?: string;
  public readonly state?: string;
  public readonly postalCode?: string;
  public readonly country?: string;

  // Privacy & Consent Settings
  public readonly profileVisibility?: string; // 'PUBLIC' | 'PRIVATE' | 'CONTACTS_ONLY' | 'INSTITUTIONS_ONLY'
  public readonly dataSharing?: Record<string, boolean>; // Granular data sharing preferences
  public readonly termsAccepted: boolean;
  public readonly privacyPolicyAccepted: boolean;
  public readonly marketingOptIn?: boolean;

  // Platform Context
  public readonly source?: string; // Registration source: 'web', 'mobile', 'institution', 'referral'
  public readonly referralCode?: string;
  public readonly institutionCode?: string; // For institutional registrations
  public readonly metadata?: Record<string, any>; // Additional context data

  constructor(data: CreatePersonCommandData) {
    // Required fields
    this.firstName = data.firstName?.trim();
    this.lastName = data.lastName?.trim();
    this.email = data.email?.toLowerCase()?.trim();
    this.phone = data.phone?.trim();
    this.dateOfBirth = data.dateOfBirth;
    this.gender = data.gender;

    // Optional personal information
    this.middleName = data.middleName?.trim();
    this.preferredName = data.preferredName?.trim();

    // Contact & address
    this.addressLine1 = data.addressLine1?.trim();
    this.addressLine2 = data.addressLine2?.trim();
    this.city = data.city?.trim();
    this.state = data.state?.trim();
    this.postalCode = data.postalCode?.trim();
    this.country = data.country;

    // Privacy & consent
    this.profileVisibility = data.profileVisibility || 'PRIVATE';
    this.dataSharing = data.dataSharing || {};
    this.termsAccepted = data.termsAccepted;
    this.privacyPolicyAccepted = data.privacyPolicyAccepted;
    this.marketingOptIn = data.marketingOptIn || false;

    // Platform context
    this.source = data.source || 'web';
    this.referralCode = data.referralCode?.trim();
    this.institutionCode = data.institutionCode?.trim();
    this.metadata = data.metadata || {};

    this.validate();
  }

  /**
   * Validates the command data to ensure business rules are met
   */
  private validate(): void {
    const errors: string[] = [];

    // Required field validation
    if (!this.firstName) {
      errors.push('First name is required');
    }
    if (!this.lastName) {
      errors.push('Last name is required');
    }
    if (!this.email) {
      errors.push('Email is required');
    }
    if (!this.phone) {
      errors.push('Phone number is required');
    }
    if (!this.dateOfBirth) {
      errors.push('Date of birth is required');
    }
    if (!this.gender) {
      errors.push('Gender is required');
    }

    // Consent validation - required for GDPR/compliance
    if (!this.termsAccepted) {
      errors.push('Terms and conditions must be accepted');
    }
    if (!this.privacyPolicyAccepted) {
      errors.push('Privacy policy must be accepted');
    }

    // Age validation - ensure person is at least 16 years old
    if (this.dateOfBirth) {
      const age = this.calculateAge(this.dateOfBirth);
      if (age < 16) {
        errors.push('Person must be at least 16 years old');
      }
      if (age > 100) {
        errors.push(
          'Invalid date of birth - person cannot be over 100 years old',
        );
      }
    }

    // Email format basic validation (detailed validation in Email value object)
    if (this.email && !this.email.includes('@')) {
      errors.push('Invalid email format');
    }

    // Phone format basic validation (detailed validation in PhoneNumber value object)
    if (this.phone && !this.phone.startsWith('+')) {
      errors.push('Phone number must include country code (e.g., +91, +971)');
    }

    // Name length validation
    if (this.firstName && this.firstName.length > 100) {
      errors.push('First name cannot exceed 100 characters');
    }
    if (this.lastName && this.lastName.length > 100) {
      errors.push('Last name cannot exceed 100 characters');
    }
    if (this.middleName && this.middleName.length > 100) {
      errors.push('Middle name cannot exceed 100 characters');
    }

    // Profile visibility validation
    const validVisibilities = [
      'PUBLIC',
      'PRIVATE',
      'CONTACTS_ONLY',
      'INSTITUTIONS_ONLY',
    ];
    if (
      this.profileVisibility &&
      !validVisibilities.includes(this.profileVisibility)
    ) {
      errors.push('Invalid profile visibility setting');
    }

    // Gender validation
    const validGenders = [
      'MALE',
      'FEMALE',
      'NON_BINARY',
      'PREFER_NOT_TO_SAY',
      'OTHER',
    ];
    if (this.gender && !validGenders.includes(this.gender)) {
      errors.push('Invalid gender value');
    }

    // Country validation (for supported countries)
    const supportedCountries = ['INDIA', 'UAE'];
    if (this.country && !supportedCountries.includes(this.country)) {
      errors.push('Country not supported. Currently supporting India and UAE');
    }

    if (errors.length > 0) {
      throw new Error(
        `CreatePersonCommand validation failed: ${errors.join(', ')}`,
      );
    }
  }

  /**
   * Calculates age from date of birth
   */
  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Creates domain value objects from command data
   * Used by command handlers to create Person aggregate
   */
  public toDomainValueObjects() {
    return {
      name: PersonName.create({
        firstName: this.firstName,
        lastName: this.lastName,
        middleName: this.middleName,
        preferredName: this.preferredName,
      }),
      age: PersonAge.fromDateOfBirth(this.dateOfBirth),
      email: Email.create(this.email),
      phone: PhoneNumber.create({
        number: this.phone,
        countryCode: this.getCountryCodeFromPhone(this.phone),
        type: 'MOBILE' as any,
        isPrimary: true,
      }),
      gender: Gender.createWithDefaults(this.gender as any),
      address: this.hasAddressData()
        ? Address.create({
            addressLine1: this.addressLine1!,
            addressLine2: this.addressLine2,
            city: this.city!,
            stateOrProvince: this.state || this.city!,
            postalCode: this.postalCode!,
            country: this.country as any,
            addressType: 'HOME' as any,
            isPrimary: true,
          })
        : undefined,
    };
  }

  /**
   * Extracts country code from international phone number
   */
  private getCountryCodeFromPhone(phone: string): string {
    if (phone.startsWith('+91')) return 'IN';
    if (phone.startsWith('+971')) return 'AE';
    if (phone.startsWith('+1')) return 'US';
    if (phone.startsWith('+44')) return 'GB';

    // Default to India if country code not recognized
    return 'IN';
  }

  /**
   * Checks if command has sufficient address data
   */
  private hasAddressData(): boolean {
    return !!(
      this.addressLine1 &&
      this.city &&
      this.postalCode &&
      this.country
    );
  }

  /**
   * Gets privacy settings for Person creation
   */
  public getPrivacySettings(): Record<string, any> {
    return {
      profileVisibility: this.profileVisibility,
      dataSharing: this.dataSharing,
      marketingOptIn: this.marketingOptIn,
      termsAcceptedAt: new Date(),
      privacyPolicyAcceptedAt: new Date(),
    };
  }

  /**
   * Gets platform metadata for Person creation
   */
  public getPlatformMetadata(): Record<string, any> {
    return {
      source: this.source,
      referralCode: this.referralCode,
      institutionCode: this.institutionCode,
      registrationTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...this.metadata,
    };
  }
}

/**
 * Type definition for CreatePersonCommand constructor data
 */
export interface CreatePersonCommandData {
  // Required fields
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: string;

  // Optional personal information
  middleName?: string;
  preferredName?: string;

  // Optional contact & address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;

  // Privacy & consent
  profileVisibility?: string;
  dataSharing?: Record<string, boolean>;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  marketingOptIn?: boolean;

  // Platform context
  source?: string;
  referralCode?: string;
  institutionCode?: string;
  metadata?: Record<string, any>;
}
