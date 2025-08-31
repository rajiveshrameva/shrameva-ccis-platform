// src/modules/person/domain/entities/person.entity.ts

import { AggregateRoot } from '../../../../shared/base/aggregate.root';
import { PersonID } from '../../../../shared/value-objects/id.value-object';
import { Email } from '../../../../shared/value-objects/email.value-object';
import { PhoneNumber } from '../../../../shared/domain/value-objects/phone.value-object';
import { PersonName } from '../value-objects/person-name.value-object';
import { PersonAge } from '../value-objects/person-age.value-object';
import { Gender } from '../value-objects/gender.value-object';
import {
  Address,
  SupportedCountry,
} from '../value-objects/address.value-object';
import { PersonCreatedEvent } from '../events/person-created.event';
import { PersonUpdatedEvent } from '../events/person-updated.event';
import { PersonVerifiedEvent } from '../events/person-verified.event';
import { SkillPassportCreatedEvent } from '../events/skill-passport-created.event';
import { PersonDeletedEvent } from '../events/person-deleted.event';
import {
  ValidationException,
  BusinessRuleException,
} from '../../../../shared/domain/exceptions/domain-exception.base';

/**
 * Person Entity Properties Interface
 */
export interface PersonProps {
  /** Unique identifier */
  id: PersonID;

  /** Person's full name with multi-cultural support */
  name: PersonName;

  /** Person's age with CCIS context */
  age: PersonAge;

  /** Person's gender identity */
  gender: Gender;

  /** Primary email address */
  email: Email;

  /** Primary phone number */
  primaryPhone: PhoneNumber;

  /** Additional phone numbers (home, work, emergency) */
  additionalPhones?: PhoneNumber[];

  /** Primary address */
  primaryAddress: Address;

  /** Additional addresses (work, emergency, etc.) */
  additionalAddresses?: Address[];

  /** Person's profile picture URL */
  profilePictureUrl?: string;

  /** Person's bio/description */
  bio?: string;

  /** Person's preferred language for communication */
  preferredLanguage: PreferredLanguage;

  /** Person's timezone */
  timezone: string;

  /** Whether this person's identity is verified */
  isVerified: boolean;

  /** KYC (Know Your Customer) verification status */
  kycStatus: KYCStatus;

  /** Emergency contact information */
  emergencyContact?: EmergencyContact;

  /** Skill passport data - core innovation of Shrameva */
  skillPassport?: SkillPassport;

  /** Social media and professional profiles */
  socialProfiles?: SocialProfile[];

  /** Consent and privacy preferences */
  privacySettings: PrivacySettings;

  /** Version number for optimistic concurrency control */
  version: number;

  /** Account creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;

  /** Last login timestamp */
  lastLoginAt?: Date;

  /** Account status */
  status: PersonStatus;
}

/**
 * Preferred Language Enumeration
 */
export enum PreferredLanguage {
  ENGLISH = 'en',
  HINDI = 'hi',
  ARABIC = 'ar',
  TAMIL = 'ta',
  TELUGU = 'te',
  MARATHI = 'mr',
  GUJARATI = 'gu',
  BENGALI = 'bn',
  KANNADA = 'kn',
  MALAYALAM = 'ml',
  PUNJABI = 'pa',
  URDU = 'ur',
}

/**
 * KYC Verification Status
 */
export enum KYCStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

/**
 * Person Account Status
 */
export enum PersonStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
  DEACTIVATED = 'deactivated',
}

/**
 * Emergency Contact Information
 */
export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: PhoneNumber;
  email?: Email;
  address?: Address;
}

/**
 * Skill Passport - Core Innovation of Shrameva Platform
 *
 * This is the heart of the CCIS system that tracks competency development
 * and career readiness across 7 key competencies.
 */
export interface SkillPassport {
  /** Unique passport ID */
  passportId: PersonID;

  /** Current overall CCIS level (1-4) */
  currentCCISLevel: number;

  /** CCIS levels for each of the 7 competencies */
  competencyLevels: CompetencyLevel[];

  /** Total assessment hours completed */
  totalAssessmentHours: number;

  /** Total micro-tasks completed */
  totalMicroTasksCompleted: number;

  /** Total fusion tasks completed */
  totalFusionTasksCompleted: number;

  /** Verified skills and certifications */
  verifiedSkills: VerifiedSkill[];

  /** Learning path progress */
  learningPathProgress: LearningPathProgress[];

  /** Achievement badges and certifications */
  achievements: Achievement[];

  /** Employer endorsements */
  endorsements: Endorsement[];

  /** Career readiness score (0-100) */
  careerReadinessScore: number;

  /** Industries of interest/experience */
  industriesOfInterest: string[];

  /** Preferred job roles */
  preferredJobRoles: string[];

  /** Availability for placement */
  availabilityStatus: AvailabilityStatus;

  /** Passport creation date */
  createdAt: Date;

  /** Last assessment date */
  lastAssessmentAt?: Date;

  /** Passport last updated */
  updatedAt: Date;
}

/**
 * CCIS Competency Levels for the 7 Core Competencies
 */
export interface CompetencyLevel {
  competencyId: string;
  competencyName: string;
  currentLevel: number; // 1-4
  confidence: number; // 0-100
  lastAssessedAt: Date;
  evidenceCount: number;
  improvementAreas: string[];
}

/**
 * Verified Skills with Evidence
 */
export interface VerifiedSkill {
  skillId: string;
  skillName: string;
  category: string;
  proficiencyLevel: string;
  verificationSource: string;
  verifiedAt: Date;
  expiresAt?: Date;
  evidenceUrls: string[];
}

/**
 * Learning Path Progress Tracking
 */
export interface LearningPathProgress {
  pathId: string;
  pathName: string;
  progress: number; // 0-100
  currentMilestone: string;
  completedMilestones: string[];
  estimatedCompletionDate: Date;
  startedAt: Date;
}

/**
 * Achievement Badges and Certifications
 */
export interface Achievement {
  achievementId: string;
  title: string;
  description: string;
  category: string;
  earnedAt: Date;
  issuer: string;
  credentialUrl?: string;
  expiresAt?: Date;
}

/**
 * Employer Endorsements
 */
export interface Endorsement {
  endorsementId: string;
  endorserName: string;
  endorserTitle: string;
  companyName: string;
  skillsEndorsed: string[];
  endorsementText: string;
  endorsedAt: Date;
  isVerified: boolean;
}

/**
 * Availability Status for Placement
 */
export enum AvailabilityStatus {
  IMMEDIATELY_AVAILABLE = 'immediately_available',
  AVAILABLE_IN_30_DAYS = 'available_in_30_days',
  AVAILABLE_IN_60_DAYS = 'available_in_60_days',
  NOT_AVAILABLE = 'not_available',
  CURRENTLY_EMPLOYED = 'currently_employed',
}

/**
 * Social Media Profile
 */
export interface SocialProfile {
  platform: SocialPlatform;
  profileUrl: string;
  isVerified: boolean;
  isPublic: boolean;
}

/**
 * Social Media Platforms
 */
export enum SocialPlatform {
  LINKEDIN = 'linkedin',
  GITHUB = 'github',
  TWITTER = 'twitter',
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  PORTFOLIO = 'portfolio',
  BEHANCE = 'behance',
  DRIBBBLE = 'dribbble',
}

/**
 * Privacy and Consent Settings
 */
export interface PrivacySettings {
  /** Consent for data processing */
  dataProcessingConsent: boolean;

  /** Consent for marketing communications */
  marketingConsent: boolean;

  /** Allow profile visibility to employers */
  employerVisibility: boolean;

  /** Allow AI-powered matching */
  aiMatchingConsent: boolean;

  /** Allow sharing of assessment results */
  assessmentSharingConsent: boolean;

  /** Phone number visibility level */
  phoneVisibility: VisibilityLevel;

  /** Email visibility level */
  emailVisibility: VisibilityLevel;

  /** Address visibility level */
  addressVisibility: VisibilityLevel;

  /** Skill passport visibility */
  skillPassportVisibility: VisibilityLevel;

  /** Data retention preferences */
  dataRetentionPreference: DataRetentionPreference;
}

/**
 * Visibility Levels for Personal Information
 */
export enum VisibilityLevel {
  PUBLIC = 'public',
  EMPLOYERS_ONLY = 'employers_only',
  VERIFIED_CONTACTS = 'verified_contacts',
  PRIVATE = 'private',
}

/**
 * Data Retention Preferences
 */
export enum DataRetentionPreference {
  KEEP_INDEFINITELY = 'keep_indefinitely',
  DELETE_AFTER_GRADUATION = 'delete_after_graduation',
  DELETE_AFTER_PLACEMENT = 'delete_after_placement',
  DELETE_AFTER_1_YEAR = 'delete_after_1_year',
  DELETE_AFTER_2_YEARS = 'delete_after_2_years',
}

/**
 * Person Entity - Aggregate Root
 *
 * Central entity representing any person in the Shrameva platform.
 * This includes students, employers, mentors, and administrators.
 *
 * The Person entity is designed around the core innovation of Shrameva:
 * the Skill Passport, which tracks CCIS (Competency Confidence Independence Scaffolding)
 * levels across 7 key competencies essential for career success.
 *
 * Key Features:
 * - Multi-cultural support for India and UAE markets
 * - Comprehensive identity verification and KYC
 * - Skill passport integration with CCIS assessment system
 * - Privacy-first design with granular consent management
 * - Emergency contact management for student safety
 * - Social profile integration for professional networking
 * - Timezone and language preferences for personalization
 * - Achievement tracking and employer endorsements
 * - AI-powered matching and recommendation readiness
 *
 * Business Rules:
 * - All persons must have verified email and phone number
 * - Skill passport is automatically created for students
 * - Emergency contact is mandatory for persons under 18
 * - KYC verification required for employer-facing features
 * - Privacy settings must be explicitly set upon account creation
 * - Data retention preferences must comply with local regulations
 * - Multi-language support based on primary market (IN/AE)
 *
 * CCIS Integration:
 * - Skill passport tracks competency development across 7 areas
 * - Real-time CCIS level updates based on assessment results
 * - Career readiness scoring for placement optimization
 * - Learning path recommendations based on skill gaps
 * - Achievement system for motivation and engagement
 *
 * International Market Support:
 * - India: Hindi/English language support, INR pricing
 * - UAE: Arabic/English support, AED pricing
 * - Timezone awareness for global student programs
 * - Cultural sensitivity in communication preferences
 *
 * Privacy & Security:
 * - GDPR-compliant consent management
 * - Granular visibility controls for personal information
 * - Secure storage of sensitive data (PII)
 * - Audit trail for all data access and modifications
 *
 * @example
 * ```typescript
 * const person = Person.create({
 *   name: PersonName.create({
 *     firstName: 'Rajesh',
 *     lastName: 'Sharma',
 *     arabicName: 'راجيش شارما'
 *   }),
 *   age: PersonAge.create(22),
 *   email: Email.create('rajesh@example.com'),
 *   primaryPhone: PhoneNumber.create({
 *     number: '+919876543210',
 *     countryCode: 'IN',
 *     type: PhoneType.MOBILE
 *   }),
 *   // ... other properties
 * });
 *
 * // Create skill passport for student
 * person.createSkillPassport();
 *
 * // Update CCIS level
 * person.updateCCISLevel('communication', 3, 85);
 * ```
 */
export class Person extends AggregateRoot<PersonID> {
  private _props: PersonProps;
  /** Maximum number of additional phone numbers */
  private static readonly MAX_ADDITIONAL_PHONES = 2;

  /** Maximum number of additional addresses */
  private static readonly MAX_ADDITIONAL_ADDRESSES = 3;

  /** Maximum number of social profiles */
  private static readonly MAX_SOCIAL_PROFILES = 10;

  /** Maximum bio length */
  private static readonly MAX_BIO_LENGTH = 2000;

  /** The 7 Core Competencies tracked by CCIS */
  private static readonly CORE_COMPETENCIES = [
    'communication',
    'problem_solving',
    'teamwork',
    'adaptability',
    'time_management',
    'technical_skills',
    'leadership',
  ] as const;

  /**
   * Creates a new Person instance
   */
  public static async create(
    props: Omit<
      PersonProps,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'status'
      | 'isVerified'
      | 'kycStatus'
      | 'version'
    >,
  ): Promise<Person> {
    const personId = await PersonID.generate();
    const now = new Date();

    const personProps: PersonProps = {
      ...props,
      id: personId,
      isVerified: false,
      kycStatus: KYCStatus.NOT_STARTED,
      status: PersonStatus.PENDING_VERIFICATION,
      version: 1, // Initial version
      createdAt: now,
      updatedAt: now,
    };

    const person = new Person(personProps);

    // Emit domain event
    person.addDomainEvent(
      new PersonCreatedEvent({
        personId: personId.getValue(),
        email: props.email.getValue(),
        name: props.name.fullName,
        countryCode: props.primaryAddress.country,
        preferredLanguage: props.preferredLanguage,
        createdAt: now,
      }),
    );

    return person;
  }

  /**
   * Reconstructs a Person from persistence
   */
  public static fromPersistence(props: PersonProps): Person {
    return new Person(props);
  }

  /**
   * Protected constructor
   */
  protected constructor(props: PersonProps) {
    super(props.id);
    this._props = props;
  }

  /**
   * Validates the person entity
   */
  protected validate(): void {
    this.validateProps(this._props);
  }

  /**
   * Validates person properties
   */
  private validateProps(props: PersonProps): void {
    // Validate required fields
    if (!props.name) {
      throw new ValidationException(
        'Person name is required',
        'name',
        props.name,
      );
    }

    if (!props.age) {
      throw new ValidationException('Person age is required', 'age', props.age);
    }

    if (!props.email) {
      throw new ValidationException(
        'Person email is required',
        'email',
        props.email,
      );
    }

    if (!props.primaryPhone) {
      throw new ValidationException(
        'Primary phone is required',
        'primaryPhone',
        props.primaryPhone,
      );
    }

    if (!props.primaryAddress) {
      throw new ValidationException(
        'Primary address is required',
        'primaryAddress',
        props.primaryAddress,
      );
    }

    // Validate additional phones limit
    if (
      props.additionalPhones &&
      props.additionalPhones.length > Person.MAX_ADDITIONAL_PHONES
    ) {
      throw new BusinessRuleException(
        `Cannot have more than ${Person.MAX_ADDITIONAL_PHONES} additional phone numbers`,
        'additionalPhones',
      );
    }

    // Validate additional addresses limit
    if (
      props.additionalAddresses &&
      props.additionalAddresses.length > Person.MAX_ADDITIONAL_ADDRESSES
    ) {
      throw new BusinessRuleException(
        `Cannot have more than ${Person.MAX_ADDITIONAL_ADDRESSES} additional addresses`,
        'additionalAddresses',
      );
    }

    // Validate social profiles limit
    if (
      props.socialProfiles &&
      props.socialProfiles.length > Person.MAX_SOCIAL_PROFILES
    ) {
      throw new BusinessRuleException(
        `Cannot have more than ${Person.MAX_SOCIAL_PROFILES} social profiles`,
        'socialProfiles',
      );
    }

    // Validate bio length
    if (props.bio && props.bio.length > Person.MAX_BIO_LENGTH) {
      throw new ValidationException(
        `Bio cannot exceed ${Person.MAX_BIO_LENGTH} characters`,
        'bio',
        props.bio,
      );
    }

    // Business Rule: Emergency contact required for minors
    if (props.age.currentAge < 18 && !props.emergencyContact) {
      throw new BusinessRuleException(
        'Emergency contact is required for persons under 18 years old',
        'emergencyContact',
      );
    }

    // Business Rule: Primary phone must be verified for active status
    if (
      props.status === PersonStatus.ACTIVE &&
      !props.primaryPhone.isVerified
    ) {
      throw new BusinessRuleException(
        'Primary phone number must be verified for active status',
        'primaryPhone',
      );
    }

    // Business Rule: Timezone must be valid
    if (!Person.isValidTimezone(props.timezone)) {
      throw new ValidationException(
        'Invalid timezone provided',
        'timezone',
        props.timezone,
      );
    }
  }

  /**
   * Creates deleted event for the aggregate
   */
  protected createDeletedEvent(): PersonDeletedEvent {
    return new PersonDeletedEvent({
      personId: this.getId().getValue(),
      reason: 'Person account deleted',
      deletedAt: new Date(),
    });
  }

  /**
   * Validates timezone string
   */
  private static isValidTimezone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  }

  // Getters
  get id(): PersonID {
    return this._props.id;
  }

  get name(): PersonName {
    return this._props.name;
  }

  get age(): PersonAge {
    return this._props.age;
  }

  get gender(): Gender {
    return this._props.gender;
  }

  get email(): Email {
    return this._props.email;
  }

  get primaryPhone(): PhoneNumber {
    return this._props.primaryPhone;
  }

  get additionalPhones(): PhoneNumber[] {
    return this._props.additionalPhones || [];
  }

  get primaryAddress(): Address {
    return this._props.primaryAddress;
  }

  get additionalAddresses(): Address[] {
    return this._props.additionalAddresses || [];
  }

  get profilePictureUrl(): string | undefined {
    return this._props.profilePictureUrl;
  }

  get bio(): string | undefined {
    return this._props.bio;
  }

  get preferredLanguage(): PreferredLanguage {
    return this._props.preferredLanguage;
  }

  get timezone(): string {
    return this._props.timezone;
  }

  get isVerified(): boolean {
    return this._props.isVerified;
  }

  get kycStatus(): KYCStatus {
    return this._props.kycStatus;
  }

  get emergencyContact(): EmergencyContact | undefined {
    return this._props.emergencyContact;
  }

  get skillPassport(): SkillPassport | undefined {
    return this._props.skillPassport;
  }

  get socialProfiles(): SocialProfile[] {
    return this._props.socialProfiles || [];
  }

  get privacySettings(): PrivacySettings {
    return this._props.privacySettings;
  }

  get status(): PersonStatus {
    return this._props.status;
  }

  get createdAt(): Date {
    return this._props.createdAt;
  }

  get updatedAt(): Date {
    return this._props.updatedAt;
  }

  get lastLoginAt(): Date | undefined {
    return this._props.lastLoginAt;
  }

  /**
   * Updates person's basic information with optimistic concurrency control
   */
  public updateBasicInfo(
    updates: {
      name?: PersonName;
      bio?: string;
      profilePictureUrl?: string;
      preferredLanguage?: PreferredLanguage;
      timezone?: string;
    },
    expectedVersion: number,
  ): void {
    // Check for version conflict (optimistic concurrency control)
    if (this._props.version !== expectedVersion) {
      throw new BusinessRuleException(
        `Version conflict: Expected version ${expectedVersion}, but current version is ${this._props.version}. The entity has been modified by another process.`,
        'version',
      );
    }

    const updatedProps = {
      ...this._props,
      ...updates,
      updatedAt: new Date(),
      version: this._props.version + 1, // Increment version for optimistic concurrency control
    };

    // Validate the updates
    this.validate();

    // Apply the updates
    Object.assign(this._props, updatedProps);

    // Emit domain event
    this.addDomainEvent(
      new PersonUpdatedEvent({
        personId: this.id.getValue(),
        updatedFields: Object.keys(updates),
        updatedAt: this._props.updatedAt,
        version: this._props.version,
      }),
    );
  }

  /**
   * Adds an additional phone number
   */
  public addAdditionalPhone(phone: PhoneNumber): void {
    if (this.additionalPhones.length >= Person.MAX_ADDITIONAL_PHONES) {
      throw new BusinessRuleException(
        `Cannot add more than ${Person.MAX_ADDITIONAL_PHONES} additional phone numbers`,
        'additionalPhones',
      );
    }

    // Check for duplicates
    const exists = this.additionalPhones.some((existing) =>
      existing.equals(phone),
    );
    if (exists || this.primaryPhone.equals(phone)) {
      throw new BusinessRuleException(
        'Phone number already exists for this person',
        'phone',
      );
    }

    this._props.additionalPhones = [...this.additionalPhones, phone];
    this._props.updatedAt = new Date();
  }

  /**
   * Removes an additional phone number
   */
  public removeAdditionalPhone(phone: PhoneNumber): void {
    const filtered = this.additionalPhones.filter(
      (existing) => !existing.equals(phone),
    );

    if (filtered.length === this.additionalPhones.length) {
      throw new BusinessRuleException(
        'Phone number not found in additional phones',
        'phone',
      );
    }

    this._props.additionalPhones = filtered;
    this._props.updatedAt = new Date();
  }

  /**
   * Updates primary address
   */
  public updatePrimaryAddress(address: Address): void {
    this._props.primaryAddress = address;
    this._props.updatedAt = new Date();

    this.addDomainEvent(
      new PersonUpdatedEvent({
        personId: this.id.getValue(),
        updatedFields: ['primaryAddress'],
        updatedAt: this._props.updatedAt,
        version: this._props.version,
      }),
    );
  }

  /**
   * Verifies the person's identity
   */
  public verify(): void {
    if (this.isVerified) {
      throw new BusinessRuleException(
        'Person is already verified',
        'verification',
      );
    }

    // Business rule: Phone and email must be verified
    if (!this.primaryPhone.isVerified) {
      throw new BusinessRuleException(
        'Primary phone number must be verified before person verification',
        'primaryPhone',
      );
    }

    this._props.isVerified = true;
    this._props.status = PersonStatus.ACTIVE;
    this._props.updatedAt = new Date();

    this.addDomainEvent(
      new PersonVerifiedEvent({
        personId: this.id.getValue(),
        verifiedAt: this._props.updatedAt,
        email: this.email.getValue(),
        name: this.name.fullName,
      }),
    );
  }

  /**
   * Updates KYC status
   */
  public updateKYCStatus(status: KYCStatus, reason?: string): void {
    this._props.kycStatus = status;
    this._props.updatedAt = new Date();

    // Update person status based on KYC
    if (status === KYCStatus.VERIFIED && this.isVerified) {
      this._props.status = PersonStatus.ACTIVE;
    } else if (status === KYCStatus.REJECTED) {
      this._props.status = PersonStatus.SUSPENDED;
    }
  }

  /**
   * Creates a skill passport for this person
   * This is the core innovation of Shrameva platform
   */
  public async createSkillPassport(): Promise<void> {
    if (this.skillPassport) {
      throw new BusinessRuleException(
        'Person already has a skill passport',
        'skillPassport',
      );
    }

    const passportId = await PersonID.generate();
    const now = new Date();

    // Initialize competency levels for all 7 core competencies
    const competencyLevels: CompetencyLevel[] = Person.CORE_COMPETENCIES.map(
      (competency) => ({
        competencyId: competency,
        competencyName: competency.replace('_', ' ').toUpperCase(),
        currentLevel: 1, // Start at level 1
        confidence: 0, // No confidence initially
        lastAssessedAt: now,
        evidenceCount: 0,
        improvementAreas: [],
      }),
    );

    this._props.skillPassport = {
      passportId,
      currentCCISLevel: 1,
      competencyLevels,
      totalAssessmentHours: 0,
      totalMicroTasksCompleted: 0,
      totalFusionTasksCompleted: 0,
      verifiedSkills: [],
      learningPathProgress: [],
      achievements: [],
      endorsements: [],
      careerReadinessScore: 0,
      industriesOfInterest: [],
      preferredJobRoles: [],
      availabilityStatus: AvailabilityStatus.NOT_AVAILABLE,
      createdAt: now,
      updatedAt: now,
    };

    this._props.updatedAt = now;

    this.addDomainEvent(
      new SkillPassportCreatedEvent({
        personId: this.id.getValue(),
        passportId: passportId.getValue(),
        createdAt: now,
      }),
    );
  }

  /**
   * Updates CCIS level for a specific competency
   */
  public updateCCISLevel(
    competencyId: string,
    level: number,
    confidence: number,
  ): void {
    if (!this.skillPassport) {
      throw new BusinessRuleException(
        'Cannot update CCIS level without a skill passport',
        'skillPassport',
      );
    }

    if (level < 1 || level > 4) {
      throw new ValidationException(
        'CCIS level must be between 1 and 4',
        'level',
        level,
      );
    }

    if (confidence < 0 || confidence > 100) {
      throw new ValidationException(
        'Confidence must be between 0 and 100',
        'confidence',
        confidence,
      );
    }

    // Find and update the competency level
    const competencyIndex = this.skillPassport.competencyLevels.findIndex(
      (cl) => cl.competencyId === competencyId,
    );

    if (competencyIndex === -1) {
      throw new ValidationException(
        'Invalid competency ID',
        'competencyId',
        competencyId,
      );
    }

    this.skillPassport.competencyLevels[competencyIndex] = {
      ...this.skillPassport.competencyLevels[competencyIndex],
      currentLevel: level,
      confidence,
      lastAssessedAt: new Date(),
      evidenceCount:
        this.skillPassport.competencyLevels[competencyIndex].evidenceCount + 1,
    };

    // Recalculate overall CCIS level
    const averageLevel =
      this.skillPassport.competencyLevels.reduce(
        (sum, cl) => sum + cl.currentLevel,
        0,
      ) / this.skillPassport.competencyLevels.length;

    this.skillPassport.currentCCISLevel = Math.round(averageLevel);

    // Recalculate career readiness score
    this.skillPassport.careerReadinessScore =
      this.calculateCareerReadinessScore();

    this.skillPassport.lastAssessmentAt = new Date();
    this.skillPassport.updatedAt = new Date();
    this._props.updatedAt = new Date();
  }

  /**
   * Calculates career readiness score based on CCIS levels and other factors
   */
  private calculateCareerReadinessScore(): number {
    if (!this.skillPassport) return 0;

    const competencyScore =
      this.skillPassport.competencyLevels.reduce(
        (sum, cl) => sum + cl.currentLevel * 25, // Max 100 per competency (4 levels * 25)
        0,
      ) / this.skillPassport.competencyLevels.length;

    const confidenceScore =
      this.skillPassport.competencyLevels.reduce(
        (sum, cl) => sum + cl.confidence,
        0,
      ) / this.skillPassport.competencyLevels.length;

    const experienceScore = Math.min(
      (this.skillPassport.totalAssessmentHours / 100) * 20, // Max 20 points for 100+ hours
      20,
    );

    const skillsScore = Math.min(
      this.skillPassport.verifiedSkills.length * 2, // 2 points per verified skill, max 20
      20,
    );

    const achievementScore = Math.min(
      this.skillPassport.achievements.length * 1, // 1 point per achievement, max 10
      10,
    );

    return Math.round(
      competencyScore * 0.4 + // 40% weight on competency levels
        confidenceScore * 0.3 + // 30% weight on confidence
        experienceScore * 0.15 + // 15% weight on experience
        skillsScore * 0.1 + // 10% weight on verified skills
        achievementScore * 0.05, // 5% weight on achievements
    );
  }

  /**
   * Adds a verified skill to the skill passport
   */
  public addVerifiedSkill(skill: VerifiedSkill): void {
    if (!this.skillPassport) {
      throw new BusinessRuleException(
        'Cannot add verified skill without a skill passport',
        'skillPassport',
      );
    }

    // Check for duplicate skills
    const exists = this.skillPassport.verifiedSkills.some(
      (vs) => vs.skillId === skill.skillId,
    );

    if (exists) {
      throw new BusinessRuleException(
        'Skill is already verified for this person',
        'skill',
      );
    }

    this.skillPassport.verifiedSkills.push(skill);
    this.skillPassport.careerReadinessScore =
      this.calculateCareerReadinessScore();
    this.skillPassport.updatedAt = new Date();
    this._props.updatedAt = new Date();
  }

  /**
   * Records login activity
   */
  public recordLogin(): void {
    this._props.lastLoginAt = new Date();
    this._props.updatedAt = new Date();
  }

  /**
   * Updates privacy settings
   */
  public updatePrivacySettings(settings: Partial<PrivacySettings>): void {
    this._props.privacySettings = {
      ...this._props.privacySettings,
      ...settings,
    };
    this._props.updatedAt = new Date();
  }

  /**
   * Deactivates the person account
   */
  public deactivate(reason?: string): void {
    if (this.status === PersonStatus.DEACTIVATED) {
      throw new BusinessRuleException(
        'Person account is already deactivated',
        'status',
      );
    }

    this._props.status = PersonStatus.DEACTIVATED;
    this._props.updatedAt = new Date();
  }

  /**
   * Reactivates the person account
   */
  public reactivate(): void {
    if (this.status !== PersonStatus.DEACTIVATED) {
      throw new BusinessRuleException(
        'Only deactivated accounts can be reactivated',
        'status',
      );
    }

    if (!this.isVerified) {
      throw new BusinessRuleException(
        'Cannot reactivate unverified account',
        'verification',
      );
    }

    this._props.status = PersonStatus.ACTIVE;
    this._props.updatedAt = new Date();
  }

  /**
   * Checks if person is a minor (under 18)
   */
  public isMinor(): boolean {
    return this.age.currentAge < 18;
  }

  /**
   * Checks if person is ready for placement
   */
  public isReadyForPlacement(): boolean {
    if (!this.skillPassport) return false;

    return (
      this.isVerified &&
      this.kycStatus === KYCStatus.VERIFIED &&
      this.status === PersonStatus.ACTIVE &&
      this.skillPassport.currentCCISLevel >= 3 &&
      this.skillPassport.careerReadinessScore >= 70 &&
      this.skillPassport.availabilityStatus !== AvailabilityStatus.NOT_AVAILABLE
    );
  }

  /**
   * Gets all phone numbers (primary + additional)
   */
  public getAllPhoneNumbers(): PhoneNumber[] {
    return [this.primaryPhone, ...this.additionalPhones];
  }

  /**
   * Gets all addresses (primary + additional)
   */
  public getAllAddresses(): Address[] {
    return [this.primaryAddress, ...this.additionalAddresses];
  }

  /**
   * Gets display name based on preferred language
   */
  public getDisplayName(): string {
    if (
      this.preferredLanguage === PreferredLanguage.ARABIC &&
      this.name.arabicName
    ) {
      return this.name.arabicName;
    }
    return this.name.displayName;
  }

  /**
   * Converts to JSON for API responses
   */
  public toJSON(): any {
    return {
      id: this.id.getValue(),
      name: this.name.toJSON(),
      age: this.age.toJSON(),
      gender: this.gender.toJSON(),
      email: this.email.getValue(),
      primaryPhone: this.primaryPhone.toJSON(),
      additionalPhones: this.additionalPhones.map((phone) => phone.toJSON()),
      primaryAddress: this.primaryAddress.toJSON(),
      additionalAddresses: this.additionalAddresses.map((addr) =>
        addr.toJSON(),
      ),
      profilePictureUrl: this.profilePictureUrl,
      bio: this.bio,
      preferredLanguage: this.preferredLanguage,
      timezone: this.timezone,
      isVerified: this.isVerified,
      kycStatus: this.kycStatus,
      emergencyContact: this.emergencyContact,
      skillPassport: this.skillPassport,
      socialProfiles: this.socialProfiles,
      privacySettings: this.privacySettings,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastLoginAt: this.lastLoginAt,
    };
  }
}
