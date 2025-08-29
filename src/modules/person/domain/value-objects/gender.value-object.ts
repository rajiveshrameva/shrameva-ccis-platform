// src/modules/person/domain/value-objects/gender.value-object.ts

import { ValueObject } from '../../../../shared/base/value-object.base';
import {
  ValidationException,
  BusinessRuleException,
} from '../../../../shared/domain/exceptions/domain-exception.base';

/**
 * Gender Value Object Properties
 *
 * Represents gender identity in the Indian context with sensitivity to
 * cultural norms, legal requirements, and inclusive practices.
 */
export interface GenderProps {
  /** Primary gender identity */
  gender: GenderType;

  /** Preferred pronouns for communication */
  pronouns: string;

  /** Whether gender information should be visible in public profiles */
  isPublic: boolean;

  /** Additional context or notes (optional) */
  notes?: string;
}

/**
 * Gender Types
 *
 * Comprehensive gender options supporting Indian legal framework and
 * modern inclusive practices as per Supreme Court recognition.
 */
export enum GenderType {
  /** Male */
  MALE = 'MALE',

  /** Female */
  FEMALE = 'FEMALE',

  /** Transgender - legally recognized in India since 2014 */
  TRANSGENDER = 'TRANSGENDER',

  /** Non-binary - inclusive category for non-traditional gender identities */
  NON_BINARY = 'NON_BINARY',

  /** Prefer not to disclose */
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',

  /** Other - for additional gender identities */
  OTHER = 'OTHER',
}

/**
 * Common Pronoun Sets
 *
 * Standard pronoun options with cultural sensitivity for Indian context.
 */
export enum CommonPronouns {
  HE_HIM = 'he/him',
  SHE_HER = 'she/her',
  THEY_THEM = 'they/them',
  PREFER_NAME = 'use my name',
  PREFER_NOT_TO_SAY = 'prefer not to say',
}

/**
 * Gender Value Object
 *
 * Manages gender identity information for the Shrameva CCIS platform with
 * focus on inclusivity, privacy, and compliance with Indian legal framework.
 *
 * Key Features:
 * - Comprehensive gender options including transgender recognition
 * - Pronoun handling for respectful communication
 * - Privacy controls for gender information visibility
 * - Cultural sensitivity for Indian educational/workplace context
 * - Legal compliance with Indian gender recognition laws
 * - Statistical analysis support while preserving privacy
 *
 * Business Rules:
 * - Gender selection is optional (can choose "prefer not to say")
 * - Default pronouns are inferred from gender but can be customized
 * - Public visibility is controlled by user preference
 * - Notes field for additional context (max 200 characters)
 * - Respectful handling of all gender identities
 * - Special considerations for workplace placement matching
 *
 * Critical for Shrameva Platform:
 * - Inclusive student and professional profiles
 * - Respectful AI agent communication (using correct pronouns)
 * - Diversity reporting for educational institutions
 * - Employer preference matching while avoiding discrimination
 * - Legal compliance for equal opportunity requirements
 * - Safe space creation for all gender identities
 *
 * Indian Context Considerations:
 * - Supreme Court recognition of transgender rights (2014)
 * - Traditional cultural concepts vs. modern inclusive practices
 * - Workplace diversity and inclusion initiatives
 * - Educational institution support for diverse students
 * - Government scheme accessibility for all genders
 * - Family and social acceptance considerations
 *
 * @example
 * ```typescript
 * // Traditional gender identity
 * const maleGender = Gender.create({
 *   gender: GenderType.MALE,
 *   pronouns: CommonPronouns.HE_HIM,
 *   isPublic: true
 * });
 *
 * // Transgender identity with custom pronouns
 * const transGender = Gender.create({
 *   gender: GenderType.TRANSGENDER,
 *   pronouns: 'she/her',
 *   isPublic: false,
 *   notes: 'Please use my preferred name in communications'
 * });
 *
 * // Privacy-focused approach
 * const privateGender = Gender.create({
 *   gender: GenderType.PREFER_NOT_TO_SAY,
 *   pronouns: CommonPronouns.PREFER_NAME,
 *   isPublic: false
 * });
 * ```
 */
export class Gender extends ValueObject<GenderProps> {
  /** Maximum length for notes field */
  private static readonly MAX_NOTES_LENGTH = 200;

  /** Maximum length for custom pronouns */
  private static readonly MAX_PRONOUNS_LENGTH = 50;

  /**
   * Creates a new Gender instance
   */
  public static create(props: GenderProps): Gender {
    return new Gender(props);
  }

  /**
   * Creates Gender with default settings for a given gender type
   */
  public static createWithDefaults(genderType: GenderType): Gender {
    const defaultPronouns = Gender.getDefaultPronouns(genderType);

    return new Gender({
      gender: genderType,
      pronouns: defaultPronouns,
      isPublic: true, // Default to public unless privacy is specifically requested
    });
  }

  /**
   * Creates Gender with privacy-first approach
   */
  public static createPrivate(): Gender {
    return new Gender({
      gender: GenderType.PREFER_NOT_TO_SAY,
      pronouns: CommonPronouns.PREFER_NAME,
      isPublic: false,
    });
  }

  /**
   * Protected constructor
   */
  protected constructor(props: GenderProps) {
    // Set default pronouns if not provided
    const normalizedProps: GenderProps = {
      ...props,
      pronouns: props.pronouns || Gender.getDefaultPronouns(props.gender),
    };

    super(normalizedProps);
  }

  /**
   * Validates the gender value object
   */
  protected validate(value: GenderProps): void {
    // Validate gender type
    if (!value.gender || !Object.values(GenderType).includes(value.gender)) {
      throw new ValidationException(
        'Valid gender type is required',
        'gender',
        value.gender,
      );
    }

    // Validate pronouns
    if (!value.pronouns || typeof value.pronouns !== 'string') {
      throw new ValidationException(
        'Pronouns are required and must be a string',
        'pronouns',
        value.pronouns,
      );
    }

    const trimmedPronouns = value.pronouns.trim();
    if (trimmedPronouns.length === 0) {
      throw new ValidationException(
        'Pronouns cannot be empty',
        'pronouns',
        value.pronouns,
      );
    }

    if (trimmedPronouns.length > Gender.MAX_PRONOUNS_LENGTH) {
      throw new ValidationException(
        `Pronouns cannot exceed ${Gender.MAX_PRONOUNS_LENGTH} characters`,
        'pronouns',
        value.pronouns,
      );
    }

    // Validate isPublic
    if (typeof value.isPublic !== 'boolean') {
      throw new ValidationException(
        'isPublic must be a boolean value',
        'isPublic',
        value.isPublic,
      );
    }

    // Validate notes (optional)
    if (value.notes !== undefined) {
      if (typeof value.notes !== 'string') {
        throw new ValidationException(
          'Notes must be a string',
          'notes',
          value.notes,
        );
      }

      if (value.notes.length > Gender.MAX_NOTES_LENGTH) {
        throw new ValidationException(
          `Notes cannot exceed ${Gender.MAX_NOTES_LENGTH} characters`,
          'notes',
          value.notes,
        );
      }
    }

    // Business rule: if gender is sensitive, encourage private visibility
    if (
      (value.gender === GenderType.TRANSGENDER ||
        value.gender === GenderType.NON_BINARY ||
        value.gender === GenderType.OTHER) &&
      value.isPublic === true
    ) {
      // This is a warning, not an error - user choice is respected
      console.warn(
        'Consider setting gender visibility to private for enhanced privacy protection',
      );
    }
  }

  /**
   * Gets default pronouns for a gender type
   */
  private static getDefaultPronouns(genderType: GenderType): string {
    switch (genderType) {
      case GenderType.MALE:
        return CommonPronouns.HE_HIM;

      case GenderType.FEMALE:
        return CommonPronouns.SHE_HER;

      case GenderType.TRANSGENDER:
        return CommonPronouns.THEY_THEM; // Safe default, can be customized

      case GenderType.NON_BINARY:
        return CommonPronouns.THEY_THEM;

      case GenderType.PREFER_NOT_TO_SAY:
        return CommonPronouns.PREFER_NAME;

      case GenderType.OTHER:
        return CommonPronouns.THEY_THEM;

      default:
        return CommonPronouns.PREFER_NAME;
    }
  }

  /**
   * Gets the gender type
   */
  get gender(): GenderType {
    return this.value.gender;
  }

  /**
   * Gets the preferred pronouns
   */
  get pronouns(): string {
    return this.value.pronouns;
  }

  /**
   * Gets the public visibility setting
   */
  get isPublic(): boolean {
    return this.value.isPublic;
  }

  /**
   * Gets the additional notes
   */
  get notes(): string | undefined {
    return this.value.notes;
  }

  /**
   * Checks if gender should be displayed in public contexts
   */
  public shouldDisplayInPublic(): boolean {
    return this.isPublic && this.gender !== GenderType.PREFER_NOT_TO_SAY;
  }

  /**
   * Gets gender display text for different contexts
   */
  public getDisplayText(
    context: 'public' | 'private' | 'formal' = 'public',
  ): string {
    if (!this.shouldDisplayInPublic() && context === 'public') {
      return 'Not specified';
    }

    switch (context) {
      case 'formal':
        return this.getFormalDisplayText();

      case 'private':
        return this.getPrivateDisplayText();

      case 'public':
      default:
        return this.getPublicDisplayText();
    }
  }

  /**
   * Gets formal display text (for official documents)
   */
  private getFormalDisplayText(): string {
    switch (this.gender) {
      case GenderType.MALE:
        return 'Male';

      case GenderType.FEMALE:
        return 'Female';

      case GenderType.TRANSGENDER:
        return 'Transgender';

      case GenderType.NON_BINARY:
        return 'Non-Binary';

      case GenderType.OTHER:
        return 'Other';

      case GenderType.PREFER_NOT_TO_SAY:
        return 'Prefer not to disclose';

      default:
        return 'Not specified';
    }
  }

  /**
   * Gets public display text (for profiles and casual contexts)
   */
  private getPublicDisplayText(): string {
    switch (this.gender) {
      case GenderType.MALE:
        return 'Male';

      case GenderType.FEMALE:
        return 'Female';

      case GenderType.TRANSGENDER:
        return 'Transgender';

      case GenderType.NON_BINARY:
        return 'Non-binary';

      case GenderType.OTHER:
        return 'Other';

      case GenderType.PREFER_NOT_TO_SAY:
        return 'Not specified';

      default:
        return 'Not specified';
    }
  }

  /**
   * Gets private display text (for internal use with notes)
   */
  private getPrivateDisplayText(): string {
    let display = this.getFormalDisplayText();

    if (this.notes) {
      display += ` (${this.notes})`;
    }

    return display;
  }

  /**
   * Gets pronouns for sentence construction
   */
  public getPronounSet(): {
    subject: string; // he/she/they
    object: string; // him/her/them
    possessive: string; // his/her/their
    reflexive: string; // himself/herself/themselves
  } {
    const pronounLower = this.pronouns.toLowerCase();

    if (pronounLower.includes('he/him')) {
      return {
        subject: 'he',
        object: 'him',
        possessive: 'his',
        reflexive: 'himself',
      };
    }

    if (pronounLower.includes('she/her')) {
      return {
        subject: 'she',
        object: 'her',
        possessive: 'her',
        reflexive: 'herself',
      };
    }

    if (pronounLower.includes('they/them')) {
      return {
        subject: 'they',
        object: 'them',
        possessive: 'their',
        reflexive: 'themselves',
      };
    }

    // Default to gender-neutral pronouns for safety
    return {
      subject: 'they',
      object: 'them',
      possessive: 'their',
      reflexive: 'themselves',
    };
  }

  /**
   * Checks if this gender identity might face workplace discrimination
   */
  public requiresInclusivitySupport(): boolean {
    return [
      GenderType.TRANSGENDER,
      GenderType.NON_BINARY,
      GenderType.OTHER,
    ].includes(this.gender);
  }

  /**
   * Gets appropriate honorific/title suggestions
   */
  public getHonorificSuggestions(): string[] {
    switch (this.gender) {
      case GenderType.MALE:
        return ['Mr.', 'Sir'];

      case GenderType.FEMALE:
        return ['Ms.', 'Mrs.', 'Miss', 'Madam'];

      case GenderType.TRANSGENDER:
      case GenderType.NON_BINARY:
      case GenderType.OTHER:
        return ['Mx.', 'No title preferred'];

      case GenderType.PREFER_NOT_TO_SAY:
        return ['No title preferred', 'First name only'];

      default:
        return ['No title preferred'];
    }
  }

  /**
   * Creates new Gender with updated pronouns
   */
  public withPronouns(pronouns: string): Gender {
    return Gender.create({
      ...this.value,
      pronouns,
    });
  }

  /**
   * Creates new Gender with updated visibility
   */
  public withVisibility(isPublic: boolean): Gender {
    return Gender.create({
      ...this.value,
      isPublic,
    });
  }

  /**
   * Creates new Gender with additional notes
   */
  public withNotes(notes: string): Gender {
    return Gender.create({
      ...this.value,
      notes,
    });
  }

  /**
   * Checks if gender information is complete for formal contexts
   */
  public isCompleteForFormalUse(): boolean {
    return this.gender !== GenderType.PREFER_NOT_TO_SAY;
  }

  /**
   * Gets diversity category for statistical purposes (anonymized)
   */
  public getDiversityCategory():
    | 'traditional'
    | 'non_traditional'
    | 'unspecified' {
    switch (this.gender) {
      case GenderType.MALE:
      case GenderType.FEMALE:
        return 'traditional';

      case GenderType.TRANSGENDER:
      case GenderType.NON_BINARY:
      case GenderType.OTHER:
        return 'non_traditional';

      case GenderType.PREFER_NOT_TO_SAY:
        return 'unspecified';

      default:
        return 'unspecified';
    }
  }

  /**
   * Returns JSON representation for API responses
   */
  public toJSON(): GenderProps & {
    displayText: string;
    pronounSet: ReturnType<Gender['getPronounSet']>;
    honorificSuggestions: string[];
    diversityCategory: string;
  } {
    return {
      gender: this.value.gender,
      pronouns: this.value.pronouns,
      isPublic: this.value.isPublic,
      notes: this.value.notes,
      displayText: this.getDisplayText('public'),
      pronounSet: this.getPronounSet(),
      honorificSuggestions: this.getHonorificSuggestions(),
      diversityCategory: this.getDiversityCategory(),
    };
  }

  /**
   * Returns safe JSON for public API (excludes sensitive information)
   */
  public toPublicJSON(): {
    displayText: string;
    pronouns: string;
    diversityCategory: string;
  } {
    return {
      displayText: this.getDisplayText('public'),
      pronouns: this.shouldDisplayInPublic() ? this.pronouns : 'not specified',
      diversityCategory: this.getDiversityCategory(),
    };
  }

  /**
   * String representation for logging and debugging
   */
  public toString(): string {
    return this.getDisplayText('private');
  }
}
