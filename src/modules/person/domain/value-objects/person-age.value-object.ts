// src/modules/person/domain/value-objects/person-age.value-object.ts

import { ValueObject } from '../../../../shared/base/value-object.base';
import {
  ValidationException,
  BusinessRuleException,
} from '../../../../shared/domain/exceptions/domain-exception.base';

/**
 * Person Age Value Object Properties
 *
 * Represents age information for a person in the Indian educational context,
 * supporting both current age and birth date for accurate tracking.
 */
export interface PersonAgeProps {
  /** Date of birth - primary source of truth for age */
  dateOfBirth: Date;

  /** Current calculated age in years */
  currentAge: number;

  /** Age category for educational and regulatory purposes */
  ageCategory: AgeCategory;
}

/**
 * Age Categories for Indian Educational Context
 *
 * Based on Indian education system requirements and employment laws.
 */
export enum AgeCategory {
  /** Below 18 - Minor, requires guardian consent */
  MINOR = 'MINOR',

  /** 18-25 - Primary higher education and early career */
  YOUNG_ADULT = 'YOUNG_ADULT',

  /** 26-35 - Career development and specialization */
  ADULT = 'ADULT',

  /** 36-50 - Senior professional and leadership roles */
  SENIOR_ADULT = 'SENIOR_ADULT',

  /** Above 50 - Experienced professional and mentoring roles */
  VETERAN = 'VETERAN',
}

/**
 * Person Age Value Object
 *
 * Manages age-related information for the Shrameva CCIS platform with focus
 * on Indian educational and employment context requirements.
 *
 * Key Features:
 * - Birth date validation and age calculation
 * - Age category determination for regulatory compliance
 * - Educational eligibility validation (minimum age requirements)
 * - Employment eligibility checks (legal working age)
 * - CCIS assessment age-appropriate customization
 * - Statistical age group analysis for platform metrics
 *
 * Business Rules:
 * - Minimum age: 16 years (for skill assessment participation)
 * - Maximum age: 75 years (reasonable upper limit for platform usage)
 * - Date of birth must be in the past
 * - Age calculation based on current system date
 * - Age category automatically determined from current age
 * - Special handling for minor students (parental consent required)
 *
 * Critical for Shrameva Platform:
 * - Student eligibility verification for courses and assessments
 * - Age-appropriate CCIS level expectations and benchmarks
 * - Employment placement age criteria compliance
 * - Legal compliance for minor student data protection
 * - Insurance and liability considerations for different age groups
 * - Personalized career guidance based on life stage
 *
 * Indian Context Considerations:
 * - Early career start culture (engineering graduates at 21-22)
 * - Extended family support allowing later career changes
 * - Government scheme eligibility often age-dependent
 * - Industry preferences for specific age ranges
 *
 * @example
 * ```typescript
 * // Young engineering graduate
 * const studentAge = PersonAge.fromDateOfBirth(new Date('2002-05-15'));
 * console.log(studentAge.currentAge); // 22
 * console.log(studentAge.ageCategory); // YOUNG_ADULT
 * console.log(studentAge.isEligibleForFreshGraduatePrograms()); // true
 *
 * // Working professional
 * const professionalAge = PersonAge.fromDateOfBirth(new Date('1990-08-20'));
 * console.log(professionalAge.isEligibleForSeniorRoles()); // true
 *
 * // Minor student
 * const minorAge = PersonAge.fromDateOfBirth(new Date('2007-03-10'));
 * console.log(minorAge.requiresGuardianConsent()); // true
 * ```
 */
export class PersonAge extends ValueObject<PersonAgeProps> {
  /** Minimum age for platform participation */
  private static readonly MIN_AGE = 16;

  /** Maximum reasonable age for platform usage */
  private static readonly MAX_AGE = 75;

  /** Age threshold for legal majority in India */
  private static readonly MAJORITY_AGE = 18;

  /** Fresh graduate age range (typical in India) */
  private static readonly FRESH_GRADUATE_MAX_AGE = 25;

  /** Senior role eligibility age threshold */
  private static readonly SENIOR_ROLE_MIN_AGE = 28;

  /**
   * Creates PersonAge from date of birth (most common usage)
   */
  public static fromDateOfBirth(dateOfBirth: Date): PersonAge {
    const currentAge = PersonAge.calculateAge(dateOfBirth);
    const ageCategory = PersonAge.determineAgeCategory(currentAge);

    return new PersonAge({
      dateOfBirth,
      currentAge,
      ageCategory,
    });
  }

  /**
   * Creates PersonAge from current age (when birth date is unknown)
   */
  public static fromCurrentAge(age: number): PersonAge {
    // Estimate birth date based on current age
    const currentDate = new Date();
    const estimatedBirthYear = currentDate.getFullYear() - age;
    const dateOfBirth = new Date(estimatedBirthYear, 0, 1); // January 1st of birth year

    const ageCategory = PersonAge.determineAgeCategory(age);

    return new PersonAge({
      dateOfBirth,
      currentAge: age,
      ageCategory,
    });
  }

  /**
   * Protected constructor
   */
  protected constructor(props: PersonAgeProps) {
    super(props);
  }

  /**
   * Validates the age value object
   */
  protected validate(value: PersonAgeProps): void {
    // Validate date of birth
    if (!value.dateOfBirth || !(value.dateOfBirth instanceof Date)) {
      throw new ValidationException(
        'Date of birth is required and must be a valid date',
        'dateOfBirth',
        value.dateOfBirth,
      );
    }

    if (isNaN(value.dateOfBirth.getTime())) {
      throw new ValidationException(
        'Date of birth must be a valid date',
        'dateOfBirth',
        value.dateOfBirth,
      );
    }

    // Date of birth must be in the past
    const currentDate = new Date();
    if (value.dateOfBirth > currentDate) {
      throw new BusinessRuleException(
        'Date of birth cannot be in the future',
        'FUTURE_BIRTH_DATE',
      );
    }

    // Validate current age
    if (typeof value.currentAge !== 'number' || value.currentAge < 0) {
      throw new ValidationException(
        'Current age must be a non-negative number',
        'currentAge',
        value.currentAge,
      );
    }

    // Age range validation
    if (value.currentAge < PersonAge.MIN_AGE) {
      throw new BusinessRuleException(
        `Age must be at least ${PersonAge.MIN_AGE} years for platform participation`,
        'AGE_TOO_LOW',
      );
    }

    if (value.currentAge > PersonAge.MAX_AGE) {
      throw new BusinessRuleException(
        `Age cannot exceed ${PersonAge.MAX_AGE} years`,
        'AGE_TOO_HIGH',
      );
    }

    // Validate age category
    if (!Object.values(AgeCategory).includes(value.ageCategory)) {
      throw new ValidationException(
        'Invalid age category',
        'ageCategory',
        value.ageCategory,
      );
    }

    // Verify age consistency
    const calculatedAge = PersonAge.calculateAge(value.dateOfBirth);
    if (Math.abs(calculatedAge - value.currentAge) > 1) {
      throw new BusinessRuleException(
        'Current age is inconsistent with date of birth',
        'AGE_INCONSISTENCY',
      );
    }

    // Verify age category consistency
    const expectedCategory = PersonAge.determineAgeCategory(value.currentAge);
    if (value.ageCategory !== expectedCategory) {
      throw new BusinessRuleException(
        'Age category is inconsistent with current age',
        'CATEGORY_INCONSISTENCY',
      );
    }
  }

  /**
   * Calculates current age from date of birth
   */
  private static calculateAge(dateOfBirth: Date): number {
    const currentDate = new Date();
    let age = currentDate.getFullYear() - dateOfBirth.getFullYear();

    // Adjust if birthday hasn't occurred this year
    const monthDifference = currentDate.getMonth() - dateOfBirth.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && currentDate.getDate() < dateOfBirth.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Determines age category based on current age
   */
  private static determineAgeCategory(age: number): AgeCategory {
    if (age < 18) return AgeCategory.MINOR;
    if (age <= 25) return AgeCategory.YOUNG_ADULT;
    if (age <= 35) return AgeCategory.ADULT;
    if (age <= 50) return AgeCategory.SENIOR_ADULT;
    return AgeCategory.VETERAN;
  }

  /**
   * Gets the date of birth
   */
  get dateOfBirth(): Date {
    return new Date(this.value.dateOfBirth); // Return copy to prevent mutation
  }

  /**
   * Gets the current age
   */
  get currentAge(): number {
    return this.value.currentAge;
  }

  /**
   * Gets the age category
   */
  get ageCategory(): AgeCategory {
    return this.value.ageCategory;
  }

  /**
   * Gets the most current age (recalculated from birth date)
   */
  get actualCurrentAge(): number {
    return PersonAge.calculateAge(this.value.dateOfBirth);
  }

  /**
   * Checks if person is a legal minor
   */
  get isMinor(): boolean {
    return this.currentAge < PersonAge.MAJORITY_AGE;
  }

  /**
   * Checks if person is a legal adult
   */
  get isAdult(): boolean {
    return this.currentAge >= PersonAge.MAJORITY_AGE;
  }

  /**
   * Checks if person requires guardian consent
   */
  public requiresGuardianConsent(): boolean {
    return this.isMinor;
  }

  /**
   * Checks eligibility for fresh graduate programs
   */
  public isEligibleForFreshGraduatePrograms(): boolean {
    return this.currentAge <= PersonAge.FRESH_GRADUATE_MAX_AGE && this.isAdult;
  }

  /**
   * Checks eligibility for senior roles
   */
  public isEligibleForSeniorRoles(): boolean {
    return this.currentAge >= PersonAge.SENIOR_ROLE_MIN_AGE;
  }

  /**
   * Checks if person is in prime career development age
   */
  public isInPrimeCareerAge(): boolean {
    return this.currentAge >= 22 && this.currentAge <= 45;
  }

  /**
   * Gets age-appropriate CCIS level expectations
   */
  public getCCISExpectations(): {
    expectedMinLevel: number;
    expectedMaxLevel: number;
    description: string;
  } {
    switch (this.ageCategory) {
      case AgeCategory.MINOR:
        return {
          expectedMinLevel: 1,
          expectedMaxLevel: 2,
          description: 'Focus on foundational skills and learning independence',
        };

      case AgeCategory.YOUNG_ADULT:
        return {
          expectedMinLevel: 2,
          expectedMaxLevel: 3,
          description:
            'Developing professional competence and workplace readiness',
        };

      case AgeCategory.ADULT:
        return {
          expectedMinLevel: 3,
          expectedMaxLevel: 4,
          description: 'Professional competence and leadership development',
        };

      case AgeCategory.SENIOR_ADULT:
        return {
          expectedMinLevel: 3,
          expectedMaxLevel: 4,
          description: 'Senior professional and mentoring capabilities',
        };

      case AgeCategory.VETERAN:
        return {
          expectedMinLevel: 3,
          expectedMaxLevel: 4,
          description: 'Expert knowledge sharing and strategic guidance',
        };

      default:
        return {
          expectedMinLevel: 1,
          expectedMaxLevel: 4,
          description: 'General assessment applicable to all levels',
        };
    }
  }

  /**
   * Gets years until next significant age milestone
   */
  public getYearsToNextMilestone(): {
    milestone: string;
    yearsRemaining: number;
  } | null {
    const age = this.currentAge;

    if (age < 18) {
      return { milestone: 'Legal Adult', yearsRemaining: 18 - age };
    }

    if (age < 25) {
      return { milestone: 'Young Professional', yearsRemaining: 25 - age };
    }

    if (age < 30) {
      return { milestone: 'Career Established', yearsRemaining: 30 - age };
    }

    if (age < 35) {
      return { milestone: 'Senior Professional', yearsRemaining: 35 - age };
    }

    if (age < 50) {
      return { milestone: 'Leadership Role', yearsRemaining: 50 - age };
    }

    // No more major milestones defined
    return null;
  }

  /**
   * Creates updated PersonAge with recalculated current age
   */
  public withUpdatedAge(): PersonAge {
    return PersonAge.fromDateOfBirth(this.value.dateOfBirth);
  }

  /**
   * Checks if age needs updating (more than 30 days since last calculation)
   */
  public needsAgeUpdate(): boolean {
    const actualAge = this.actualCurrentAge;
    return actualAge !== this.currentAge;
  }

  /**
   * Gets age display text for different contexts
   */
  public getDisplayText(
    context: 'short' | 'full' | 'category' = 'short',
  ): string {
    switch (context) {
      case 'short':
        return `${this.currentAge} years`;

      case 'full':
        return `${this.currentAge} years old (born ${this.dateOfBirth.toDateString()})`;

      case 'category':
        return `${this.currentAge} years (${this.ageCategory.replace('_', ' ').toLowerCase()})`;

      default:
        return `${this.currentAge} years`;
    }
  }

  /**
   * Returns JSON representation for API responses
   */
  public toJSON(): PersonAgeProps & {
    isMinor: boolean;
    isAdult: boolean;
    displayText: string;
    ccisExpectations: ReturnType<PersonAge['getCCISExpectations']>;
  } {
    return {
      dateOfBirth: this.value.dateOfBirth,
      currentAge: this.value.currentAge,
      ageCategory: this.value.ageCategory,
      isMinor: this.isMinor,
      isAdult: this.isAdult,
      displayText: this.getDisplayText('full'),
      ccisExpectations: this.getCCISExpectations(),
    };
  }

  /**
   * String representation for logging and debugging
   */
  public toString(): string {
    return this.getDisplayText('category');
  }
}
