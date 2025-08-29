// src/shared/domain/value-objects/phone.value-object.ts

import { ValueObject } from '../../base/value-object.base';
import { ValidationException } from '../exceptions/domain-exception.base';

/**
 * Phone Value Object
 *
 * Handles phone number validation and formatting specifically optimized
 * for the Indian market where Shrameva operates. Supports both mobile
 * and landline numbers with proper validation and normalization.
 *
 * Business Rules:
 * - Must be valid Indian phone numbers (mobile or landline)
 * - Mobile numbers: 10 digits starting with 6, 7, 8, or 9
 * - Landline: STD code + local number (varying lengths by region)
 * - Automatically normalizes formatting (removes spaces, dashes, etc.)
 * - Stores in E.164 format with +91 country code
 * - Supports international numbers for global student programs
 *
 * Use Cases in Shrameva Platform:
 * - Student registration and verification
 * - Emergency contact information
 * - Employer communication for placement
 * - OTP verification for secure access
 * - Mentor/support team contact
 *
 * @example
 * ```typescript
 * // Indian mobile numbers
 * const mobile = Phone.create('+91 98765 43210');
 * const mobile2 = Phone.create('9876543210'); // Auto-adds +91
 *
 * // Landline numbers
 * const landline = Phone.create('+91 11 26851234'); // Delhi
 * const mumbai = Phone.create('022 24567890'); // Mumbai landline
 *
 * // Validation and formatting
 * console.log(mobile.getFormatted()); // "+91 98765 43210"
 * console.log(mobile.getDisplayFormat()); // "98765 43210"
 * console.log(mobile.isVerified()); // false (until OTP verified)
 * ```
 */
export class Phone extends ValueObject<string> {
  // Indian mobile number regex: starts with 6,7,8,9 followed by 9 digits
  private static readonly INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

  // Indian landline patterns by major cities/states
  private static readonly INDIAN_LANDLINE_PATTERNS = [
    /^(11|22|33|40|44|79|80)\d{8}$/, // Metro cities (Delhi, Mumbai, Kolkata, etc.)
    /^(124|120|129|135|141|151|161|171|172|175|177|181|183|184|186|1)\d{6,7}$/, // STD codes
    /^(0?[2-9]\d{1,3})\d{6,8}$/, // General landline pattern
  ];

  // International number regex (E.164 format)
  private static readonly INTERNATIONAL_REGEX = /^\+[1-9]\d{1,14}$/;

  // India country code
  private static readonly INDIA_COUNTRY_CODE = '+91';

  private readonly isVerified: boolean;
  private readonly phoneType: PhoneType;

  private constructor(value: string, isVerified: boolean = false) {
    super(value);
    this.isVerified = isVerified;
    this.phoneType = this.determinePhoneType(value);
  }

  /**
   * Creates a new Phone value object
   *
   * @param phoneNumber - Phone number in various formats
   * @param isVerified - Whether the phone number has been verified via OTP
   * @returns Phone instance
   * @throws ValidationException if phone number is invalid
   */
  public static create(
    phoneNumber: string,
    isVerified: boolean = false,
  ): Phone {
    const normalized = this.normalizePhoneNumber(phoneNumber);
    return new Phone(normalized, isVerified);
  }

  /**
   * Creates a verified phone number (post-OTP verification)
   *
   * @param phoneNumber - Phone number to mark as verified
   * @returns Verified Phone instance
   * @throws ValidationException if phone number is invalid
   */
  public static createVerified(phoneNumber: string): Phone {
    return this.create(phoneNumber, true);
  }

  /**
   * Creates Phone from existing verified phone for updates
   *
   * @param existingPhone - Current phone value object
   * @param newNumber - New phone number
   * @returns New Phone instance (verification status reset to false)
   */
  public static updatePhone(existingPhone: Phone, newNumber: string): Phone {
    // When phone number changes, verification status resets
    return this.create(newNumber, false);
  }

  /**
   * Normalizes and validates phone number input
   *
   * @param input - Raw phone number input
   * @returns Normalized phone number in E.164 format
   * @throws ValidationException if invalid
   */
  private static normalizePhoneNumber(input: string): string {
    if (!input || typeof input !== 'string') {
      throw new ValidationException(
        'Phone number cannot be empty',
        'phone',
        input,
      );
    }

    // Remove all non-digit characters except +
    let cleaned = input.replace(/[^\d+]/g, '');

    if (cleaned.length === 0) {
      throw new ValidationException(
        'Phone number must contain digits',
        'phone',
        input,
      );
    }

    // Handle different input formats
    if (cleaned.startsWith('+91')) {
      // Already has India country code
      return this.validateAndFormatIndianNumber(cleaned);
    } else if (cleaned.startsWith('91') && cleaned.length === 12) {
      // India code without + (mobile numbers)
      return this.validateAndFormatIndianNumber('+' + cleaned);
    } else if (cleaned.startsWith('0') && cleaned.length === 11) {
      // Indian number with leading 0 (remove 0, add +91)
      const withoutZero = cleaned.substring(1);
      return this.validateAndFormatIndianNumber('+91' + withoutZero);
    } else if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
      // 10-digit Indian mobile number
      return this.validateAndFormatIndianNumber('+91' + cleaned);
    } else if (cleaned.startsWith('+')) {
      // International number
      return this.validateInternationalNumber(cleaned);
    } else {
      // Try to parse as Indian landline or invalid format
      return this.validateAndFormatIndianNumber('+91' + cleaned);
    }
  }

  /**
   * Validates and formats Indian phone numbers
   */
  private static validateAndFormatIndianNumber(phoneNumber: string): string {
    if (!phoneNumber.startsWith('+91')) {
      throw new ValidationException(
        'Indian phone numbers must start with +91',
        'phone',
        phoneNumber,
      );
    }

    const numberPart = phoneNumber.substring(3); // Remove +91

    // Check if it's a valid Indian mobile number
    if (this.INDIAN_MOBILE_REGEX.test(numberPart)) {
      return phoneNumber; // Valid mobile number
    }

    // Check if it's a valid Indian landline
    const isValidLandline = this.INDIAN_LANDLINE_PATTERNS.some((pattern) =>
      pattern.test(numberPart),
    );

    if (isValidLandline) {
      return phoneNumber; // Valid landline number
    }

    throw new ValidationException(
      'Invalid Indian phone number format. Mobile numbers must start with 6, 7, 8, or 9 and be 10 digits. Landlines must include valid STD codes.',
      'phone',
      phoneNumber,
    );
  }

  /**
   * Validates international phone numbers
   */
  private static validateInternationalNumber(phoneNumber: string): string {
    if (!this.INTERNATIONAL_REGEX.test(phoneNumber)) {
      throw new ValidationException(
        'Invalid international phone number format. Must be in E.164 format (+country code + number).',
        'phone',
        phoneNumber,
      );
    }

    return phoneNumber;
  }

  /**
   * Determines the type of phone number
   */
  private determinePhoneType(phoneNumber: string): PhoneType {
    if (phoneNumber.startsWith('+91')) {
      const numberPart = phoneNumber.substring(3);
      if (Phone.INDIAN_MOBILE_REGEX.test(numberPart)) {
        return PhoneType.INDIAN_MOBILE;
      } else {
        return PhoneType.INDIAN_LANDLINE;
      }
    } else {
      return PhoneType.INTERNATIONAL;
    }
  }

  /**
   * Validates phone number according to business rules
   */
  protected validate(value: string): void {
    if (!value) {
      throw new ValidationException(
        'Phone number cannot be empty',
        'phone',
        value,
      );
    }

    if (typeof value !== 'string') {
      throw new ValidationException(
        'Phone number must be a string',
        'phone',
        value,
      );
    }

    // Validation is already done in normalization,
    // but we double-check the stored format
    if (!value.startsWith('+')) {
      throw new ValidationException(
        'Stored phone number must be in E.164 format',
        'phone',
        value,
      );
    }
  }

  /**
   * Gets the phone number in E.164 format (+91xxxxxxxxxx)
   */
  public getE164Format(): string {
    return this.value;
  }

  /**
   * Gets formatted phone number for display (+91 xxxxx xxxxx)
   */
  public getFormatted(): string {
    if (this.phoneType === PhoneType.INDIAN_MOBILE) {
      // Format: +91 98765 43210
      const numberPart = this.value.substring(3);
      return `+91 ${numberPart.substring(0, 5)} ${numberPart.substring(5)}`;
    } else if (this.phoneType === PhoneType.INDIAN_LANDLINE) {
      // Format: +91 11 26851234 (varies by STD code)
      const numberPart = this.value.substring(3);
      if (numberPart.length === 10) {
        // Metro cities (2-digit STD code)
        return `+91 ${numberPart.substring(0, 2)} ${numberPart.substring(2)}`;
      } else {
        // Other cities (variable STD code)
        return `+91 ${numberPart}`;
      }
    } else {
      // International numbers - basic formatting
      return this.value;
    }
  }

  /**
   * Gets display format without country code (for Indian numbers)
   */
  public getDisplayFormat(): string {
    if (this.phoneType === PhoneType.INDIAN_MOBILE) {
      const numberPart = this.value.substring(3);
      return `${numberPart.substring(0, 5)} ${numberPart.substring(5)}`;
    } else if (this.phoneType === PhoneType.INDIAN_LANDLINE) {
      const numberPart = this.value.substring(3);
      if (numberPart.length === 10) {
        return `${numberPart.substring(0, 2)} ${numberPart.substring(2)}`;
      } else {
        return numberPart;
      }
    } else {
      return this.value; // Keep full international format
    }
  }

  /**
   * Gets the phone type (mobile, landline, international)
   */
  public getPhoneType(): PhoneType {
    return this.phoneType;
  }

  /**
   * Checks if the phone number has been verified
   */
  public isPhoneVerified(): boolean {
    return this.isVerified;
  }

  /**
   * Checks if this is an Indian phone number
   */
  public isIndianNumber(): boolean {
    return (
      this.phoneType === PhoneType.INDIAN_MOBILE ||
      this.phoneType === PhoneType.INDIAN_LANDLINE
    );
  }

  /**
   * Checks if this is a mobile number (for SMS/OTP capability)
   */
  public isMobileNumber(): boolean {
    return (
      this.phoneType === PhoneType.INDIAN_MOBILE ||
      (this.phoneType === PhoneType.INTERNATIONAL && this.couldBeMobile())
    );
  }

  /**
   * Heuristic to determine if international number could be mobile
   */
  private couldBeMobile(): boolean {
    // Simple heuristic: most mobile numbers are 10-15 digits total
    const digitCount = this.value.replace(/\D/g, '').length;
    return digitCount >= 10 && digitCount <= 15;
  }

  /**
   * Creates a new Phone instance marked as verified
   */
  public markAsVerified(): Phone {
    if (this.isVerified) {
      return this; // Already verified
    }
    return new Phone(this.value, true);
  }

  /**
   * Gets the last 4 digits for display in UI (privacy)
   */
  public getLastFourDigits(): string {
    const digits = this.value.replace(/\D/g, '');
    return digits.slice(-4);
  }

  /**
   * Gets a masked version for display (privacy protection)
   * Example: +91 98765 **210
   */
  public getMaskedFormat(): string {
    if (this.phoneType === PhoneType.INDIAN_MOBILE) {
      const numberPart = this.value.substring(3);
      const firstPart = numberPart.substring(0, 5);
      const lastPart = numberPart.slice(-3);
      return `+91 ${firstPart} **${lastPart}`;
    } else {
      // Generic masking for other types
      const lastFour = this.getLastFourDigits();
      return `***-***-${lastFour}`;
    }
  }

  /**
   * Checks if two phone numbers are likely the same person
   * (useful for duplicate detection in student registration)
   */
  public isSimilarTo(other: Phone): boolean {
    // Exact match
    if (this.equals(other)) {
      return true;
    }

    // Check if one is landline and other is mobile with same area
    if (this.isIndianNumber() && other.isIndianNumber()) {
      const thisDigits = this.value.replace(/\D/g, '');
      const otherDigits = other.value.replace(/\D/g, '');

      // If last 7 digits match, could be same household/person
      const thisLast7 = thisDigits.slice(-7);
      const otherLast7 = otherDigits.slice(-7);

      return thisLast7 === otherLast7;
    }

    return false;
  }

  /**
   * Gets country code for international SMS/calling
   */
  public getCountryCode(): string {
    if (this.value.startsWith('+91')) {
      return '+91';
    }

    // Extract country code from international numbers
    const match = this.value.match(/^\+(\d{1,3})/);
    return match ? `+${match[1]}` : '+91'; // Default to India
  }

  /**
   * Validates that phone number is suitable for OTP delivery
   */
  public canReceiveOTP(): boolean {
    // Only mobile numbers can reliably receive OTP via SMS
    return this.isMobileNumber();
  }

  /**
   * Gets the national format (without country code) for local display
   */
  public getNationalFormat(): string {
    if (this.phoneType === PhoneType.INDIAN_MOBILE) {
      return this.value.substring(3); // Remove +91
    } else if (this.phoneType === PhoneType.INDIAN_LANDLINE) {
      const numberPart = this.value.substring(3);
      return `0${numberPart}`; // Add leading 0 for Indian landlines
    } else {
      // International - keep as is since we don't know local format
      return this.value;
    }
  }
}

/**
 * Phone number type enumeration
 */
export enum PhoneType {
  INDIAN_MOBILE = 'INDIAN_MOBILE',
  INDIAN_LANDLINE = 'INDIAN_LANDLINE',
  INTERNATIONAL = 'INTERNATIONAL',
}

/**
 * Phone verification status for OTP workflows
 */
export interface PhoneVerificationInfo {
  phone: Phone;
  verifiedAt: Date | null;
  verificationType: 'OTP' | 'CALL' | 'MANUAL' | null;
  verificationAttempts: number;
  lastVerificationAttempt: Date | null;
}
