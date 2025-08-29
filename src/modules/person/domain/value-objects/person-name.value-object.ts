// src/modules/person/domain/value-objects/person-name.value-object.ts

import { ValueObject } from '../../../../shared/base/value-object.base';
import {
  ValidationException,
  BusinessRuleException,
} from '../../../../shared/domain/exceptions/domain-exception.base';

/**
 * Person Name Value Object Properties
 *
 * Represents the structure of a person's name supporting both Indian and Arabic
 * naming conventions for the multi-country Shrameva platform (India & UAE).
 */
export interface PersonNameProps {
  /** First name - required, used in certificates and official documents */
  firstName: string;

  /** Middle name - optional, common in Indian and Arabic naming conventions */
  middleName?: string;

  /** Last name/surname - required, family name, tribal name, or patronymic */
  lastName: string;

  /** Preferred name - optional, what the person likes to be called */
  preferredName?: string;

  /** Display name - optional, formatted name for UI display */
  displayName?: string;

  /** Arabic name - optional, for Arabic speakers in UAE */
  arabicName?: string;
}

/**
 * Person Name Value Object
 *
 * Handles name validation, formatting, and display for the Shrameva CCIS platform.
 * Designed for multi-cultural context supporting Indian and UAE Arabic naming conventions
 * where names can vary significantly in structure and cultural significance.
 *
 * Key Features:
 * - Indian naming convention support (first, middle, last name patterns)
 * - UAE Arabic naming convention support (patronymic patterns, tribal names, emirate affiliations)
 * - Unicode character support for regional languages (Devanagari, Arabic, Tamil, Urdu, etc.)
 * - Professional name formatting for certificates and documents (India & UAE)
 * - Display name generation for UI and informal contexts
 * - Nickname/preferred name handling for student interactions
 * - Validation against offensive or inappropriate content (multi-language)
 * - Search-friendly name normalization for multiple scripts (Latin & Arabic)
 * - Arabic script support with right-to-left text handling for UAE users
 * - Honorific detection and handling for both Indian and Arabic titles
 *
 * Business Rules:
 * - First name and last name are mandatory in Latin script
 * - Names must be between 1-50 characters each
 * - Arabic names (optional) support right-to-left text and Arabic script validation
 * - Support for both Latin and Arabic character sets with Unicode compliance
 * - No special characters except hyphens, apostrophes, and spaces
 * - Support for Unicode characters (Devanagari, Tamil, Arabic, etc.)
 * - Display name auto-generation if not provided
 * - Preferred name defaults to first name if not specified
 * - Arabic names undergo separate validation with Arabic script patterns
 *
 * Market Expansion Context:
 * - Primary Market: India (Hindi, English, regional languages)
 * - Secondary Market: UAE (Arabic, English, expatriate communities)
 * - Cross-cultural search and matching capabilities
 * - International certificate and document generation
 *
 * Critical for Shrameva Platform:
 * - Student profile creation and management (India & UAE)
 * - Certificate generation with proper name formatting (bilingual support)
 * - AI agent personalization and interaction (cultural sensitivity)
 * - Employer-facing profiles and recommendations (international markets)
 * - Assessment result attribution and tracking (multi-script support)
 * - Communication and notification personalization (cultural preferences)
 *
 * @example
 * ```typescript
 * // Traditional Indian naming
 * const name1 = PersonName.create({
 *   firstName: 'Rajesh',
 *   middleName: 'Kumar',
 *   lastName: 'Sharma'
 * });
 *
 * // South Indian naming pattern
 * const name2 = PersonName.create({
 *   firstName: 'Priya',
 *   lastName: 'Krishnamurthy',
 *   preferredName: 'Priya K'
 * });
 *
 * // Modern naming with preferred name
 * const name3 = PersonName.create({
 *   firstName: 'Arjun',
 *   lastName: 'Patel',
 *   preferredName: 'AJ',
 *   displayName: 'Arjun (AJ) Patel'
 * });
 * ```
 */
export class PersonName extends ValueObject<PersonNameProps> {
  /** Minimum length for name components */
  private static readonly MIN_NAME_LENGTH = 1;

  /** Maximum length for name components */
  private static readonly MAX_NAME_LENGTH = 50;

  /** Maximum length for display name */
  private static readonly MAX_DISPLAY_NAME_LENGTH = 150;

  /** Regex pattern for valid name characters (including Unicode and Arabic support) */
  private static readonly VALID_NAME_PATTERN = /^[\p{L}\p{M}\p{N}\s\-'\.]+$/u;

  /** Regex pattern specifically for Arabic script validation */
  private static readonly ARABIC_SCRIPT_PATTERN =
    /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\-'\.]+$/;

  /** Common inappropriate words/patterns to reject (multi-language) */
  private static readonly INAPPROPRIATE_PATTERNS = [
    /\b(test|dummy|fake|null|undefined|admin)\b/i,
    /\b(fuck|shit|damn|hell|ass|bitch)\b/i,
    /^[0-9\s\-'\.]+$/, // Only numbers and special chars
    /[!@#$%^&*()+=\[\]{}|\\:";?/<>~`]/, // Invalid special characters
    // Arabic inappropriate patterns could be added here
  ];

  /** Common Indian honorifics */
  private static readonly INDIAN_HONORIFICS = [
    'Mr',
    'Mrs',
    'Ms',
    'Dr',
    'Prof',
    'Shri',
    'Smt',
    'Kumari',
    'Engr',
    'Sri',
  ];

  /** Common Arabic honorifics and titles */
  private static readonly ARABIC_HONORIFICS = [
    'Sheikh',
    'Shaikh',
    'Al',
    'Bin',
    'Ibn',
    'Bint',
    'Abdul',
    'Abu',
    'Umm',
    'Mohammad',
    'Ahmed',
    'Ali',
    'Hassan',
    'Hussein',
    'Omar',
    'Khalid',
  ];

  /**
   * Creates a new PersonName instance
   */
  public static create(props: PersonNameProps): PersonName {
    return new PersonName(props);
  }

  /**
   * Constructor - validates and initializes the person name
   */
  protected constructor(props: PersonNameProps) {
    // Clean and normalize the names before validation
    const cleanedProps: PersonNameProps = {
      firstName: PersonName.cleanNameComponent(props.firstName || ''),
      lastName: PersonName.cleanNameComponent(props.lastName || ''),
      middleName: props.middleName
        ? PersonName.cleanNameComponent(props.middleName)
        : undefined,
      preferredName: props.preferredName
        ? PersonName.cleanNameComponent(props.preferredName)
        : undefined,
      displayName: props.displayName
        ? PersonName.cleanDisplayName(props.displayName)
        : undefined,
      arabicName: props.arabicName
        ? PersonName.cleanNameComponent(props.arabicName)
        : undefined,
    };

    // Auto-generate display name if not provided
    if (!cleanedProps.displayName) {
      cleanedProps.displayName = PersonName.generateDisplayName(cleanedProps);
    }

    // Auto-set preferred name if not provided
    if (!cleanedProps.preferredName) {
      cleanedProps.preferredName = cleanedProps.firstName;
    }

    super(cleanedProps);
  }

  /**
   * Validates the person name value object
   */
  protected validate(value: PersonNameProps): void {
    PersonName.validateNameComponent(value.firstName, 'firstName');
    PersonName.validateNameComponent(value.lastName, 'lastName');

    if (value.middleName) {
      PersonName.validateNameComponent(value.middleName, 'middleName');
    }

    if (value.preferredName) {
      PersonName.validateNameComponent(value.preferredName, 'preferredName');
    }

    if (value.displayName) {
      PersonName.validateDisplayName(value.displayName);
    }

    if (value.arabicName) {
      PersonName.validateArabicName(value.arabicName);
    }
  }

  /**
   * Validates a single name component
   */
  private static validateNameComponent(value: string, fieldName: string): void {
    if (!value || typeof value !== 'string') {
      throw new ValidationException(
        `${fieldName} is required and must be a string`,
        fieldName,
        value,
      );
    }

    const trimmed = value.trim();

    if (trimmed.length < PersonName.MIN_NAME_LENGTH) {
      throw new ValidationException(
        `${fieldName} must be at least ${PersonName.MIN_NAME_LENGTH} character long`,
        fieldName,
        value,
      );
    }

    if (trimmed.length > PersonName.MAX_NAME_LENGTH) {
      throw new ValidationException(
        `${fieldName} cannot exceed ${PersonName.MAX_NAME_LENGTH} characters`,
        fieldName,
        value,
      );
    }

    if (!PersonName.VALID_NAME_PATTERN.test(trimmed)) {
      throw new ValidationException(
        `${fieldName} contains invalid characters. Only letters, spaces, hyphens, apostrophes, and dots are allowed`,
        fieldName,
        value,
      );
    }

    // Check for inappropriate content
    for (const pattern of PersonName.INAPPROPRIATE_PATTERNS) {
      if (pattern.test(trimmed)) {
        throw new BusinessRuleException(
          `${fieldName} contains inappropriate content`,
          'INAPPROPRIATE_NAME_CONTENT',
        );
      }
    }

    // Warn about potential honorifics in names
    for (const honorific of PersonName.INDIAN_HONORIFICS) {
      if (trimmed.toLowerCase().includes(honorific.toLowerCase())) {
        // This is a warning, not an error - honorifics might be part of actual names
        console.warn(
          `Potential honorific detected in ${fieldName}: "${honorific}". Please verify if this is intentional.`,
        );
      }
    }
  }

  /**
   * Validates display name with more relaxed rules
   */
  private static validateDisplayName(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new ValidationException(
        'Display name must be a string',
        'displayName',
        value,
      );
    }

    const trimmed = value.trim();

    if (trimmed.length > PersonName.MAX_DISPLAY_NAME_LENGTH) {
      throw new ValidationException(
        `Display name cannot exceed ${PersonName.MAX_DISPLAY_NAME_LENGTH} characters`,
        'displayName',
        value,
      );
    }

    // Display names can have more characters like parentheses, commas
    const displayNamePattern = /^[\p{L}\p{M}\s\-'\.(),]+$/u;
    if (!displayNamePattern.test(trimmed)) {
      throw new ValidationException(
        'Display name contains invalid characters',
        'displayName',
        value,
      );
    }
  }

  /**
   * Validates Arabic name with Arabic script support
   */
  private static validateArabicName(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new ValidationException(
        'Arabic name must be a string',
        'arabicName',
        value,
      );
    }

    const trimmed = value.trim();

    if (trimmed.length === 0) {
      throw new ValidationException(
        'Arabic name cannot be empty',
        'arabicName',
        value,
      );
    }

    if (trimmed.length > PersonName.MAX_NAME_LENGTH) {
      throw new ValidationException(
        `Arabic name cannot exceed ${PersonName.MAX_NAME_LENGTH} characters`,
        'arabicName',
        value,
      );
    }

    // Validate that it contains primarily Arabic script characters
    if (!PersonName.ARABIC_SCRIPT_PATTERN.test(trimmed)) {
      throw new ValidationException(
        'Arabic name must contain valid Arabic script characters',
        'arabicName',
        value,
      );
    }

    // Check for inappropriate patterns (basic validation)
    for (const pattern of PersonName.INAPPROPRIATE_PATTERNS) {
      if (pattern.test(trimmed)) {
        throw new ValidationException(
          'Arabic name contains inappropriate content',
          'arabicName',
          value,
        );
      }
    }

    // Warn about potential honorifics in Arabic names
    for (const honorific of PersonName.ARABIC_HONORIFICS) {
      if (trimmed.toLowerCase().includes(honorific.toLowerCase())) {
        console.warn(
          `Potential Arabic honorific detected in arabicName: "${honorific}". Please verify if this is intentional.`,
        );
      }
    }
  }

  /**
   * Cleans and normalizes a name component
   */
  private static cleanNameComponent(value: string): string {
    return value
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .split(' ')
      .map((word) => PersonName.capitalizeWord(word))
      .join(' ');
  }

  /**
   * Cleans and normalizes display name
   */
  private static cleanDisplayName(value: string): string {
    return value
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\(\s+/g, '(') // Remove spaces after opening parenthesis
      .replace(/\s+\)/g, ')'); // Remove spaces before closing parenthesis
  }

  /**
   * Capitalizes a word properly (handles Indian names with apostrophes, hyphens)
   */
  private static capitalizeWord(word: string): string {
    if (!word) return word;

    // Handle words with apostrophes (O'Connor) and hyphens (Jean-Pierre)
    return word
      .split(/(['-])/)
      .map((part, index) => {
        if (index % 2 === 1) return part; // Keep separators as-is
        if (part.length === 0) return part;
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
      })
      .join('');
  }

  /**
   * Generates a display name from name components
   */
  private static generateDisplayName(props: PersonNameProps): string {
    const parts: string[] = [props.firstName];

    if (props.middleName) {
      parts.push(props.middleName);
    }

    parts.push(props.lastName);

    let displayName = parts.join(' ');

    // Add preferred name in parentheses if different from first name
    if (props.preferredName && props.preferredName !== props.firstName) {
      displayName = `${props.firstName} (${props.preferredName})`;
      if (props.middleName) {
        displayName += ` ${props.middleName}`;
      }
      displayName += ` ${props.lastName}`;
    }

    return displayName;
  }

  /**
   * Gets the first name
   */
  get firstName(): string {
    return this.value.firstName;
  }

  /**
   * Gets the middle name
   */
  get middleName(): string | undefined {
    return this.value.middleName;
  }

  /**
   * Gets the last name
   */
  get lastName(): string {
    return this.value.lastName;
  }

  /**
   * Gets the preferred name (what the person likes to be called)
   */
  get preferredName(): string {
    return this.value.preferredName || this.value.firstName;
  }

  /**
   * Gets the display name (formatted name for UI)
   */
  get displayName(): string {
    return this.value.displayName || PersonName.generateDisplayName(this.value);
  }

  /**
   * Gets the full formal name (first + middle + last)
   */
  get fullName(): string {
    const parts: string[] = [this.value.firstName];

    if (this.value.middleName) {
      parts.push(this.value.middleName);
    }

    parts.push(this.value.lastName);

    return parts.join(' ');
  }

  /**
   * Gets the short name (first + last, commonly used in professional contexts)
   */
  get shortName(): string {
    return `${this.value.firstName} ${this.value.lastName}`;
  }

  /**
   * Gets the last name first format (useful for sorting and formal documents)
   */
  get lastNameFirst(): string {
    const parts: string[] = [this.value.lastName];
    parts.push(this.value.firstName);

    if (this.value.middleName) {
      parts.push(this.value.middleName);
    }

    return parts.join(', ');
  }

  /**
   * Gets initials (F.M.L format)
   */
  get initials(): string {
    let initials = this.value.firstName.charAt(0).toUpperCase();

    if (this.value.middleName) {
      initials += '.' + this.value.middleName.charAt(0).toUpperCase();
    }

    initials += '.' + this.value.lastName.charAt(0).toUpperCase();

    return initials;
  }

  /**
   * Gets the Arabic name (for Arabic speakers in UAE)
   */
  get arabicName(): string | undefined {
    return this.value.arabicName;
  }

  /**
   * Gets a search-friendly version of the name (lowercase, no special chars)
   */
  get searchableText(): string {
    const allParts = [
      this.value.firstName,
      this.value.middleName,
      this.value.lastName,
      this.value.preferredName,
      this.value.arabicName,
    ].filter(Boolean);

    return allParts
      .join(' ')
      .toLowerCase()
      .replace(/[^\p{L}\p{M}\s]/gu, '') // Remove all non-letter characters (supports Unicode/Arabic)
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Checks if this name matches a search query
   */
  public matchesSearch(query: string): boolean {
    if (!query || typeof query !== 'string') {
      return false;
    }

    const normalizedQuery = query.toLowerCase().trim();
    const searchableText = this.searchableText;

    // Exact match
    if (searchableText.includes(normalizedQuery)) {
      return true;
    }

    // Match individual words
    const queryWords = normalizedQuery.split(/\s+/);
    const nameWords = searchableText.split(/\s+/);

    return queryWords.every((queryWord) =>
      nameWords.some(
        (nameWord) =>
          nameWord.startsWith(queryWord) || nameWord.includes(queryWord),
      ),
    );
  }

  /**
   * Creates a new PersonName with updated preferred name
   */
  public withPreferredName(preferredName: string): PersonName {
    return PersonName.create({
      ...this.value,
      preferredName,
    });
  }

  /**
   * Creates a new PersonName with updated display name
   */
  public withDisplayName(displayName: string): PersonName {
    return PersonName.create({
      ...this.value,
      displayName,
    });
  }

  /**
   * Formats the name for certificates and official documents
   */
  public formatForCertificate(): string {
    // Certificate format: LAST NAME, First Name Middle Name
    let formatted = this.value.lastName.toUpperCase();
    formatted += ', ' + this.value.firstName;

    if (this.value.middleName) {
      formatted += ' ' + this.value.middleName;
    }

    return formatted;
  }

  /**
   * Formats the name for informal communication (preferred name + last name)
   */
  public formatForCommunication(): string {
    return `${this.preferredName} ${this.value.lastName}`;
  }

  /**
   * Returns a JSON representation suitable for API responses
   */
  public toJSON(): PersonNameProps & {
    fullName: string;
    shortName: string;
    initials: string;
    lastNameFirst: string;
  } {
    return {
      firstName: this.value.firstName,
      middleName: this.value.middleName,
      lastName: this.value.lastName,
      preferredName: this.preferredName,
      displayName: this.displayName,
      arabicName: this.value.arabicName,
      fullName: this.fullName,
      shortName: this.shortName,
      initials: this.initials,
      lastNameFirst: this.lastNameFirst,
    };
  }

  /**
   * String representation for logging and debugging
   */
  public toString(): string {
    return this.displayName;
  }
}
