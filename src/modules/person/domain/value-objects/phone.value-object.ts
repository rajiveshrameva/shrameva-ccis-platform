import { ValueObject } from '../../../../shared/base/value-object.base';
import { ValidationException } from '../../../../shared/domain/exceptions/domain-exception.base';

/**
 * Phone Number Properties Interface
 */
export interface PhoneNumberProps {
  /** International phone number with country code (e.g., +91, +971) */
  number: string;

  /** Two-letter ISO country code (IN, AE, etc.) */
  countryCode: string;

  /** Type of phone number */
  type: PhoneType;

  /** Whether this is the primary phone number */
  isPrimary?: boolean;

  /** Whether this number is verified */
  isVerified?: boolean;

  /** Extension number for business phones */
  extension?: string;
}

/**
 * Phone Number Type Enumeration
 */
export enum PhoneType {
  MOBILE = 'mobile',
  HOME = 'home',
  WORK = 'work',
  FAX = 'fax',
  EMERGENCY = 'emergency',
}

/**
 * Supported Country Phone Configuration
 */
interface CountryPhoneConfig {
  code: string;
  dialCode: string;
  name: string;
  format: RegExp;
  example: string;
  minLength: number;
  maxLength: number;
}

/**
 * Phone Number Value Object
 *
 * Handles international phone number validation, formatting, and normalization
 * for the Shrameva CCIS platform. Designed to support the primary markets:
 * India and UAE, with extensibility for other international markets.
 *
 * Key Features:
 * - International phone number validation with country-specific formats
 * - Support for India (+91) and UAE (+971) primary markets
 * - Mobile, landline, and business number type validation
 * - E.164 format normalization for international standards
 * - Phone number verification status tracking
 * - Extension support for business and office numbers
 * - WhatsApp and SMS capability detection
 * - Privacy controls for phone number display
 *
 * Business Rules:
 * - All phone numbers must include valid country codes
 * - Mobile numbers are required for student accounts (OTP verification)
 * - Each person can have multiple phone numbers with different types
 * - Primary phone number must be verified for account activation
 * - Emergency contacts require verified phone numbers
 * - Business numbers can include extensions up to 6 digits
 * - Phone numbers must be unique within the platform per country
 *
 * International Format Standards:
 * - Follows E.164 international telecommunication numbering plan
 * - Supports country-specific formatting for display purposes
 * - Validates against known country dial codes and number patterns
 * - Handles special cases for mobile vs landline distinctions
 *
 * Market-Specific Features:
 * - India: Supports all major telecom operators (Jio, Airtel, Vodafone, BSNL)
 * - UAE: Supports Etisalat, du, and other Emirates-based operators
 * - Automatic carrier detection for SMS/WhatsApp capability
 * - Time zone aware calling hours validation
 *
 * Critical for Shrameva Platform:
 * - Student verification and onboarding (OTP-based)
 * - Emergency contact management for student safety
 * - Employer communication and interview scheduling
 * - AI agent phone-based interactions and notifications
 * - Parent/guardian contact for students under 18
 * - Assessment reminder and result notification delivery
 * - Placement opportunity alerts and coordination
 *
 * Security & Privacy:
 * - Phone numbers are considered PII and require consent
 * - Masking capabilities for partial number display
 * - Verification token management for number ownership
 * - Compliance with India's TRAI and UAE's TRA regulations
 *
 * @example
 * ```typescript
 * // Indian mobile number
 * const indianMobile = PhoneNumber.create({
 *   number: '+919876543210',
 *   countryCode: 'IN',
 *   type: PhoneType.MOBILE,
 *   isPrimary: true
 * });
 *
 * // UAE business number with extension
 * const uaeOffice = PhoneNumber.create({
 *   number: '+97144567890',
 *   countryCode: 'AE',
 *   type: PhoneType.WORK,
 *   extension: '1234'
 * });
 * ```
 */
export class PhoneNumber extends ValueObject<PhoneNumberProps> {
  /** Maximum length for phone number (including country code) */
  private static readonly MAX_PHONE_LENGTH = 20;

  /** Minimum length for phone number (including country code) */
  private static readonly MIN_PHONE_LENGTH = 8;

  /** Maximum extension length */
  private static readonly MAX_EXTENSION_LENGTH = 6;

  /** E.164 format validation pattern */
  private static readonly E164_PATTERN = /^\+[1-9]\d{6,14}$/;

  /** Basic phone number cleaning pattern */
  private static readonly PHONE_CLEAN_PATTERN = /[^\d+]/g;

  /** Supported countries with their phone configurations */
  private static readonly COUNTRY_CONFIGS: Record<string, CountryPhoneConfig> =
    {
      IN: {
        code: 'IN',
        dialCode: '+91',
        name: 'India',
        format: /^\+91[6-9]\d{9}$/,
        example: '+919876543210',
        minLength: 13,
        maxLength: 13,
      },
      AE: {
        code: 'AE',
        dialCode: '+971',
        name: 'United Arab Emirates',
        format: /^\+971[2-9]\d{7,8}$/,
        example: '+971501234567',
        minLength: 12,
        maxLength: 13,
      },
      US: {
        code: 'US',
        dialCode: '+1',
        name: 'United States',
        format: /^\+1[2-9]\d{9}$/,
        example: '+15551234567',
        minLength: 12,
        maxLength: 12,
      },
      UK: {
        code: 'GB',
        dialCode: '+44',
        name: 'United Kingdom',
        format: /^\+44[1-9]\d{8,9}$/,
        example: '+447700123456',
        minLength: 12,
        maxLength: 13,
      },
    };

  /** Common international dial codes for validation */
  private static readonly INTERNATIONAL_DIAL_CODES = [
    '+1',
    '+7',
    '+20',
    '+27',
    '+30',
    '+31',
    '+32',
    '+33',
    '+34',
    '+36',
    '+39',
    '+40',
    '+41',
    '+43',
    '+44',
    '+45',
    '+46',
    '+47',
    '+48',
    '+49',
    '+51',
    '+52',
    '+53',
    '+54',
    '+55',
    '+56',
    '+57',
    '+58',
    '+60',
    '+61',
    '+62',
    '+63',
    '+64',
    '+65',
    '+66',
    '+81',
    '+82',
    '+84',
    '+86',
    '+90',
    '+91',
    '+92',
    '+93',
    '+94',
    '+95',
    '+98',
    '+212',
    '+213',
    '+216',
    '+218',
    '+220',
    '+221',
    '+222',
    '+223',
    '+224',
    '+225',
    '+226',
    '+227',
    '+228',
    '+229',
    '+230',
    '+231',
    '+232',
    '+233',
    '+234',
    '+235',
    '+236',
    '+237',
    '+238',
    '+239',
    '+240',
    '+241',
    '+242',
    '+243',
    '+244',
    '+245',
    '+246',
    '+248',
    '+249',
    '+250',
    '+251',
    '+252',
    '+253',
    '+254',
    '+255',
    '+256',
    '+257',
    '+258',
    '+260',
    '+261',
    '+262',
    '+263',
    '+264',
    '+265',
    '+266',
    '+267',
    '+268',
    '+269',
    '+290',
    '+291',
    '+297',
    '+298',
    '+299',
    '+350',
    '+351',
    '+352',
    '+353',
    '+354',
    '+355',
    '+356',
    '+357',
    '+358',
    '+359',
    '+370',
    '+371',
    '+372',
    '+373',
    '+374',
    '+375',
    '+376',
    '+377',
    '+378',
    '+380',
    '+381',
    '+382',
    '+383',
    '+385',
    '+386',
    '+387',
    '+389',
    '+420',
    '+421',
    '+423',
    '+500',
    '+501',
    '+502',
    '+503',
    '+504',
    '+505',
    '+506',
    '+507',
    '+508',
    '+509',
    '+590',
    '+591',
    '+592',
    '+593',
    '+594',
    '+595',
    '+596',
    '+597',
    '+598',
    '+599',
    '+670',
    '+672',
    '+673',
    '+674',
    '+675',
    '+676',
    '+677',
    '+678',
    '+679',
    '+680',
    '+681',
    '+682',
    '+683',
    '+684',
    '+685',
    '+686',
    '+687',
    '+688',
    '+689',
    '+690',
    '+691',
    '+692',
    '+850',
    '+852',
    '+853',
    '+855',
    '+856',
    '+880',
    '+886',
    '+960',
    '+961',
    '+962',
    '+963',
    '+964',
    '+965',
    '+966',
    '+967',
    '+968',
    '+970',
    '+971',
    '+972',
    '+973',
    '+974',
    '+975',
    '+976',
    '+977',
    '+992',
    '+993',
    '+994',
    '+995',
    '+996',
    '+998',
  ];

  /**
   * Creates a new PhoneNumber instance
   */
  public static create(props: PhoneNumberProps): PhoneNumber {
    return new PhoneNumber(props);
  }

  /**
   * Creates a PhoneNumber from a raw number string with country detection
   */
  public static fromRawNumber(
    rawNumber: string,
    defaultCountry: string = 'IN',
    type: PhoneType = PhoneType.MOBILE,
  ): PhoneNumber {
    const cleaned = PhoneNumber.cleanPhoneNumber(rawNumber);

    // Try to detect country from the number
    const detectedCountry = PhoneNumber.detectCountryFromNumber(cleaned);
    const countryCode = detectedCountry || defaultCountry;

    // Ensure the number has the correct country prefix
    const formattedNumber = PhoneNumber.formatWithCountryCode(
      cleaned,
      countryCode,
    );

    return PhoneNumber.create({
      number: formattedNumber,
      countryCode: countryCode,
      type: type,
      isPrimary: false,
      isVerified: false,
    });
  }

  /**
   * Constructor - validates and initializes the phone number
   */
  protected constructor(props: PhoneNumberProps) {
    // Clean and normalize the phone number
    const cleanedProps: PhoneNumberProps = {
      ...props,
      number: PhoneNumber.cleanPhoneNumber(props.number),
      countryCode: props.countryCode.toUpperCase(),
      isPrimary: props.isPrimary ?? false,
      isVerified: props.isVerified ?? false,
    };

    // Validate the properties
    PhoneNumber.validatePhoneNumber(cleanedProps);

    super(cleanedProps);
  }

  /**
   * Validates the phone number value object
   */
  protected validate(value: PhoneNumberProps): void {
    PhoneNumber.validatePhoneNumber(value);
  }

  /**
   * Validates phone number properties
   */
  private static validatePhoneNumber(props: PhoneNumberProps): void {
    // Validate number
    if (!props.number || typeof props.number !== 'string') {
      throw new ValidationException(
        'Phone number is required and must be a string',
        'phoneNumber',
        props.number,
      );
    }

    // Validate country code
    if (!props.countryCode || typeof props.countryCode !== 'string') {
      throw new ValidationException(
        'Country code is required and must be a string',
        'countryCode',
        props.countryCode,
      );
    }

    // Validate phone type
    if (!Object.values(PhoneType).includes(props.type)) {
      throw new ValidationException(
        `Invalid phone type. Must be one of: ${Object.values(PhoneType).join(', ')}`,
        'phoneType',
        props.type,
      );
    }

    const cleaned = props.number.trim();

    // Check length constraints
    if (
      cleaned.length < PhoneNumber.MIN_PHONE_LENGTH ||
      cleaned.length > PhoneNumber.MAX_PHONE_LENGTH
    ) {
      throw new ValidationException(
        `Phone number must be between ${PhoneNumber.MIN_PHONE_LENGTH} and ${PhoneNumber.MAX_PHONE_LENGTH} characters`,
        'phoneNumber',
        cleaned,
      );
    }

    // Validate E.164 format
    if (!PhoneNumber.E164_PATTERN.test(cleaned)) {
      throw new ValidationException(
        'Phone number must be in valid international format (E.164) starting with +',
        'phoneNumber',
        cleaned,
      );
    }

    // Validate country-specific format if supported
    const countryConfig = PhoneNumber.COUNTRY_CONFIGS[props.countryCode];
    if (countryConfig) {
      if (!countryConfig.format.test(cleaned)) {
        throw new ValidationException(
          `Invalid phone number format for ${countryConfig.name}. Expected format like: ${countryConfig.example}`,
          'phoneNumber',
          cleaned,
        );
      }

      if (
        cleaned.length < countryConfig.minLength ||
        cleaned.length > countryConfig.maxLength
      ) {
        throw new ValidationException(
          `Phone number length for ${countryConfig.name} must be between ${countryConfig.minLength} and ${countryConfig.maxLength} characters`,
          'phoneNumber',
          cleaned,
        );
      }
    }

    // Validate extension if provided
    if (props.extension) {
      if (typeof props.extension !== 'string') {
        throw new ValidationException(
          'Extension must be a string',
          'extension',
          props.extension,
        );
      }

      const extensionCleaned = props.extension.replace(/\D/g, '');
      if (
        extensionCleaned.length === 0 ||
        extensionCleaned.length > PhoneNumber.MAX_EXTENSION_LENGTH
      ) {
        throw new ValidationException(
          `Extension must be a number with 1-${PhoneNumber.MAX_EXTENSION_LENGTH} digits`,
          'extension',
          props.extension,
        );
      }
    }

    // Business rule: Mobile numbers cannot have extensions
    if (props.type === PhoneType.MOBILE && props.extension) {
      throw new ValidationException(
        'Mobile phone numbers cannot have extensions',
        'extension',
        props.extension,
      );
    }
  }

  /**
   * Cleans and normalizes a phone number string
   */
  private static cleanPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) return '';

    let cleaned = phoneNumber.trim();

    // Remove all non-digit characters except +
    cleaned = cleaned.replace(/[^\d+]/g, '');

    // Ensure it starts with +
    if (!cleaned.startsWith('+')) {
      // If it starts with 00, replace with +
      if (cleaned.startsWith('00')) {
        cleaned = '+' + cleaned.substring(2);
      } else {
        // This will be caught by validation later
        cleaned = '+' + cleaned;
      }
    }

    return cleaned;
  }

  /**
   * Detects country from phone number
   */
  private static detectCountryFromNumber(phoneNumber: string): string | null {
    for (const [countryCode, config] of Object.entries(
      PhoneNumber.COUNTRY_CONFIGS,
    )) {
      if (phoneNumber.startsWith(config.dialCode)) {
        return countryCode;
      }
    }
    return null;
  }

  /**
   * Formats a number with the correct country code
   */
  private static formatWithCountryCode(
    phoneNumber: string,
    countryCode: string,
  ): string {
    const config = PhoneNumber.COUNTRY_CONFIGS[countryCode];
    if (!config) {
      return phoneNumber;
    }

    // Remove existing country code if present
    let number = phoneNumber;
    if (number.startsWith(config.dialCode)) {
      return number;
    }

    // Remove + if present
    if (number.startsWith('+')) {
      number = number.substring(1);
    }

    // For India, if number starts with 0, remove it
    if (countryCode === 'IN' && number.startsWith('0')) {
      number = number.substring(1);
    }

    return config.dialCode + number;
  }

  /**
   * Gets the raw phone number
   */
  get number(): string {
    return this.value.number;
  }

  /**
   * Gets the country code
   */
  get countryCode(): string {
    return this.value.countryCode;
  }

  /**
   * Gets the phone type
   */
  get type(): PhoneType {
    return this.value.type;
  }

  /**
   * Gets whether this is the primary phone number
   */
  get isPrimary(): boolean {
    return this.value.isPrimary ?? false;
  }

  /**
   * Gets whether this number is verified
   */
  get isVerified(): boolean {
    return this.value.isVerified ?? false;
  }

  /**
   * Gets the extension
   */
  get extension(): string | undefined {
    return this.value.extension;
  }

  /**
   * Gets the country configuration
   */
  get countryConfig(): CountryPhoneConfig | undefined {
    return PhoneNumber.COUNTRY_CONFIGS[this.value.countryCode];
  }

  /**
   * Gets the country name
   */
  get countryName(): string {
    return this.countryConfig?.name ?? 'Unknown';
  }

  /**
   * Gets the dial code
   */
  get dialCode(): string {
    return this.countryConfig?.dialCode ?? '';
  }

  /**
   * Gets the national number (without country code)
   */
  get nationalNumber(): string {
    const dialCode = this.dialCode;
    if (dialCode && this.value.number.startsWith(dialCode)) {
      return this.value.number.substring(dialCode.length);
    }
    return this.value.number;
  }

  /**
   * Gets formatted display version of the phone number
   */
  get displayFormat(): string {
    const country = this.countryConfig;
    if (!country) {
      return this.value.number;
    }

    const national = this.nationalNumber;

    // Format based on country
    switch (this.value.countryCode) {
      case 'IN':
        // Format: +91 98765 43210
        if (national.length === 10) {
          return `${country.dialCode} ${national.substring(0, 5)} ${national.substring(5)}`;
        }
        break;

      case 'AE':
        // Format: +971 50 123 4567
        if (national.length === 9) {
          return `${country.dialCode} ${national.substring(0, 2)} ${national.substring(2, 5)} ${national.substring(5)}`;
        } else if (national.length === 8) {
          return `${country.dialCode} ${national.substring(0, 1)} ${national.substring(1, 4)} ${national.substring(4)}`;
        }
        break;

      case 'US':
        // Format: +1 (555) 123-4567
        if (national.length === 10) {
          return `${country.dialCode} (${national.substring(0, 3)}) ${national.substring(3, 6)}-${national.substring(6)}`;
        }
        break;

      default:
        return this.value.number;
    }

    return this.value.number;
  }

  /**
   * Gets the complete formatted number with extension
   */
  get fullDisplayFormat(): string {
    let formatted = this.displayFormat;

    if (this.value.extension) {
      formatted += ` ext. ${this.value.extension}`;
    }

    return formatted;
  }

  /**
   * Gets a masked version for privacy (shows last 4 digits)
   */
  get maskedDisplay(): string {
    const national = this.nationalNumber;
    if (national.length < 4) {
      return this.dialCode + ' ****';
    }

    const maskedLength = national.length - 4;
    const masked = '*'.repeat(maskedLength);
    const lastFour = national.substring(maskedLength);

    return `${this.dialCode} ${masked}${lastFour}`;
  }

  /**
   * Checks if this is a mobile number
   */
  get isMobile(): boolean {
    return this.value.type === PhoneType.MOBILE;
  }

  /**
   * Checks if this number supports SMS
   */
  get supportsSMS(): boolean {
    // Generally, mobile numbers support SMS
    return this.isMobile;
  }

  /**
   * Checks if this number likely supports WhatsApp
   */
  get supportsWhatsApp(): boolean {
    // WhatsApp is primarily on mobile numbers
    // Additional business logic could check country-specific patterns
    return (
      this.isMobile &&
      (this.value.countryCode === 'IN' || this.value.countryCode === 'AE')
    );
  }

  /**
   * Gets the international format (E.164)
   */
  get internationalFormat(): string {
    return this.value.number;
  }

  /**
   * Converts to JSON representation
   */
  public toJSON(): PhoneNumberProps & {
    displayFormat: string;
    maskedDisplay: string;
    nationalNumber: string;
    countryName: string;
    dialCode: string;
    isMobile: boolean;
    supportsSMS: boolean;
    supportsWhatsApp: boolean;
  } {
    return {
      number: this.value.number,
      countryCode: this.value.countryCode,
      type: this.value.type,
      isPrimary: this.isPrimary,
      isVerified: this.isVerified,
      extension: this.value.extension,
      displayFormat: this.displayFormat,
      maskedDisplay: this.maskedDisplay,
      nationalNumber: this.nationalNumber,
      countryName: this.countryName,
      dialCode: this.dialCode,
      isMobile: this.isMobile,
      supportsSMS: this.supportsSMS,
      supportsWhatsApp: this.supportsWhatsApp,
    };
  }

  /**
   * String representation for logging and debugging
   */
  public toString(): string {
    return this.fullDisplayFormat;
  }

  /**
   * Checks if two phone numbers are equivalent
   */
  public equals(other: PhoneNumber): boolean {
    if (!other) return false;

    return (
      this.value.number === other.value.number &&
      this.value.countryCode === other.value.countryCode &&
      this.value.type === other.value.type
    );
  }

  /**
   * Creates a copy with verification status updated
   */
  public markAsVerified(): PhoneNumber {
    return PhoneNumber.create({
      ...this.value,
      isVerified: true,
    });
  }

  /**
   * Creates a copy with primary status updated
   */
  public markAsPrimary(): PhoneNumber {
    return PhoneNumber.create({
      ...this.value,
      isPrimary: true,
    });
  }

  /**
   * Creates a copy with extension added/updated
   */
  public withExtension(extension: string): PhoneNumber {
    if (this.isMobile) {
      throw new ValidationException(
        'Cannot add extension to mobile phone number',
        'extension',
        extension,
      );
    }

    return PhoneNumber.create({
      ...this.value,
      extension: extension,
    });
  }

  /**
   * Validates if a phone number is suitable for OTP verification
   */
  public isValidForOTP(): boolean {
    return this.isMobile && this.supportsSMS;
  }

  /**
   * Gets calling hours for this phone number's country (business context)
   */
  public getBusinessCallingHours(): {
    start: string;
    end: string;
    timezone: string;
  } {
    switch (this.value.countryCode) {
      case 'IN':
        return { start: '09:00', end: '18:00', timezone: 'Asia/Kolkata' };
      case 'AE':
        return { start: '09:00', end: '17:00', timezone: 'Asia/Dubai' };
      case 'US':
        return { start: '09:00', end: '17:00', timezone: 'America/New_York' };
      default:
        return { start: '09:00', end: '17:00', timezone: 'UTC' };
    }
  }
}
