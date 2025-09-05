// src/modules/person/domain/repositories/person.repository.interface.ts

import {
  IRepositoryBase,
  PaginatedResult,
  FindAllOptions,
} from '../../../../shared/domain/base/repository.interface';
import { Person } from '../entities/person.entity';
import { PersonID } from '../../../../shared/value-objects/id.value-object';
import { Email } from '../../../../shared/value-objects/email.value-object';
import { PhoneNumber } from '../../../../shared/domain/value-objects/phone.value-object';
import { PersonAge } from '../value-objects/person-age.value-object';
import { Gender, GenderType } from '../value-objects/gender.value-object';
import {
  Address,
  SupportedCountry,
} from '../value-objects/address.value-object';

/**
 * Person Repository Interface
 *
 * Specialized repository contract for Person aggregate operations in the
 * Shrameva CCIS platform. Extends base repository with Person-specific
 * queries and operations optimized for:
 *
 * - Identity verification workflows (KYC processes)
 * - Skill passport management and CCIS level tracking
 * - Multi-country user base (India, UAE) with localized queries
 * - Privacy-compliant data access patterns
 * - High-performance person lookup for assessment operations
 *
 * Key Performance Requirements:
 * - Person lookup by email/phone: <100ms
 * - Skill passport queries: <200ms
 * - Verification status checks: <50ms
 * - Bulk person operations: <500ms per 100 records
 *
 * The interface supports the platform's core mission of achieving 70%
 * placement rates through accurate person identity management and skill
 * passport tracking across international markets.
 */
export interface IPersonRepository extends IRepositoryBase<Person, PersonID> {
  // ===================================================================
  // CORE IDENTITY QUERIES
  // ===================================================================

  /**
   * Finds a person by their email address
   *
   * Critical for authentication, login flows, and preventing duplicate
   * registrations. Supports case-insensitive lookup for better UX.
   *
   * @param email - Email address to search for
   * @returns Promise resolving to person or null if not found
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * const person = await personRepository.findByEmail(
   *   Email.create('student@example.com')
   * );
   * if (person) {
   *   await initiateLoginProcess(person);
   * }
   * ```
   */
  findByEmail(email: Email): Promise<Person | null>;

  /**
   * Finds a person by their primary phone number
   *
   * Supports SMS-based authentication and verification workflows.
   * Essential for India/UAE markets where phone-first authentication
   * is preferred.
   *
   * @param phone - Phone number to search for
   * @returns Promise resolving to person or null if not found
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * const person = await personRepository.findByPhone(
   *   PhoneNumber.create('+919876543210', 'IN')
   * );
   * if (person) {
   *   await sendSMSVerification(person);
   * }
   * ```
   */
  findByPhone(phone: PhoneNumber): Promise<Person | null>;

  /**
   * Finds a person by email or phone (unified lookup)
   *
   * Convenience method for flexible authentication where users can
   * login with either email or phone. Optimized single query.
   *
   * @param email - Email address to search for
   * @param phone - Phone number to search for
   * @returns Promise resolving to person or null if not found
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * const person = await personRepository.findByEmailOrPhone(
   *   userEmail, userPhone
   * );
   * if (person) {
   *   await authenticateUser(person);
   * }
   * ```
   */
  findByEmailOrPhone(email: Email, phone: PhoneNumber): Promise<Person | null>;

  /**
   * Checks if an email is already registered
   *
   * Lightweight check for preventing duplicate registrations and
   * providing immediate feedback during signup flows.
   *
   * @param email - Email address to check
   * @returns Promise resolving to boolean indicating if email exists
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * const emailExists = await personRepository.emailExists(newEmail);
   * if (emailExists) {
   *   throw new ValidationException('Email already registered');
   * }
   * ```
   */
  emailExists(email: Email): Promise<boolean>;

  /**
   * Checks if a phone number is already registered
   *
   * Prevents duplicate phone registrations and supports phone-based
   * verification workflows in international markets.
   *
   * @param phone - Phone number to check
   * @returns Promise resolving to boolean indicating if phone exists
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * const phoneExists = await personRepository.phoneExists(newPhone);
   * if (phoneExists) {
   *   throw new ValidationException('Phone number already registered');
   * }
   * ```
   */
  phoneExists(phone: PhoneNumber): Promise<boolean>;

  // ===================================================================
  // VERIFICATION & KYC QUERIES
  // ===================================================================

  /**
   * Finds all persons with a specific verification status
   *
   * Supports KYC workflow management, compliance reporting, and
   * verification queue processing for admin operations.
   *
   * @param isVerified - Verification status to filter by
   * @param options - Optional pagination and filtering options
   * @returns Promise resolving to paginated list of persons
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * // Get all unverified users for KYC processing
   * const unverifiedUsers = await personRepository.findByVerificationStatus(
   *   false,
   *   { page: 1, limit: 50, sortBy: 'createdAt' }
   * );
   * ```
   */
  findByVerificationStatus(
    isVerified: boolean,
    options?: FindAllOptions,
  ): Promise<PaginatedResult<Person>>;

  /**
   * Finds all persons with a specific KYC status
   *
   * Enables KYC workflow management and compliance reporting.
   * Critical for regulatory compliance in India and UAE markets.
   *
   * @param kycStatus - KYC status to filter by
   * @param options - Optional pagination and filtering options
   * @returns Promise resolving to paginated list of persons
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * // Get all users with rejected KYC for reprocessing
   * const rejectedKYC = await personRepository.findByKYCStatus(
   *   KYCStatus.REJECTED,
   *   { page: 1, limit: 25 }
   * );
   * ```
   */
  findByKYCStatus(
    kycStatus: string,
    options?: FindAllOptions,
  ): Promise<PaginatedResult<Person>>;

  /**
   * Finds persons pending verification (KYC in progress)
   *
   * Specialized query for verification workflow management.
   * Helps prioritize verification queues and SLA tracking.
   *
   * @param options - Optional pagination and filtering options
   * @returns Promise resolving to paginated list of persons
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * const pendingVerification = await personRepository.findPendingVerification({
   *   sortBy: 'createdAt',
   *   sortOrder: 'asc' // Oldest first for fair processing
   * });
   * ```
   */
  findPendingVerification(
    options?: FindAllOptions,
  ): Promise<PaginatedResult<Person>>;

  // ===================================================================
  // SKILL PASSPORT QUERIES
  // ===================================================================

  /**
   * Finds all persons with skill passports
   *
   * Critical for CCIS assessment operations and skill analytics.
   * Supports platform's core mission of tracking competency levels.
   *
   * @param options - Optional pagination and filtering options
   * @returns Promise resolving to paginated list of persons with skill passports
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * // Get all users with skill passports for analytics
   * const skillPassportHolders = await personRepository.findWithSkillPassports({
   *   page: 1,
   *   limit: 100,
   *   sortBy: 'skillPassport.overallLevel',
   *   sortOrder: 'desc'
   * });
   * ```
   */
  findWithSkillPassports(
    options?: FindAllOptions,
  ): Promise<PaginatedResult<Person>>;

  /**
   * Finds persons by CCIS level for a specific competency
   *
   * Enables competency-based cohort formation and assessment analytics.
   * Critical for AI agent operations and level-based task assignment.
   *
   * @param competencyType - Type of competency to filter by
   * @param ccisLevel - CCIS level (1-4) to filter by
   * @param options - Optional pagination and filtering options
   * @returns Promise resolving to paginated list of persons
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * // Find all Level 3 Communication skill holders
   * const level3Communicators = await personRepository.findByCCISLevel(
   *   'COMMUNICATION',
   *   3,
   *   { limit: 50 }
   * );
   * ```
   */
  findByCCISLevel(
    competencyType: string,
    ccisLevel: number,
    options?: FindAllOptions,
  ): Promise<PaginatedResult<Person>>;

  /**
   * Finds persons with minimum CCIS level across all competencies
   *
   * Supports placement readiness assessment and advanced cohort formation.
   * Identifies high-performing individuals ready for employment opportunities.
   *
   * @param minimumLevel - Minimum CCIS level required (1-4)
   * @param options - Optional pagination and filtering options
   * @returns Promise resolving to paginated list of qualified persons
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * // Find placement-ready candidates (Level 3+ across all competencies)
   * const placementReady = await personRepository.findByMinimumCCISLevel(
   *   3,
   *   { sortBy: 'skillPassport.overallLevel', sortOrder: 'desc' }
   * );
   * ```
   */
  findByMinimumCCISLevel(
    minimumLevel: number,
    options?: FindAllOptions,
  ): Promise<PaginatedResult<Person>>;

  // ===================================================================
  // DEMOGRAPHIC & GEOGRAPHIC QUERIES
  // ===================================================================

  /**
   * Finds persons by age range
   *
   * Supports demographic analytics and age-appropriate content delivery.
   * Important for understanding platform user demographics.
   *
   * @param minAge - Minimum age (inclusive)
   * @param maxAge - Maximum age (inclusive)
   * @param options - Optional pagination and filtering options
   * @returns Promise resolving to paginated list of persons
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * // Find young professionals (22-28) for targeted programs
   * const youngProfessionals = await personRepository.findByAgeRange(
   *   22, 28, { limit: 100 }
   * );
   * ```
   */
  findByAgeRange(
    minAge: number,
    maxAge: number,
    options?: FindAllOptions,
  ): Promise<PaginatedResult<Person>>;

  /**
   * Finds persons by gender
   *
   * Supports diversity analytics and gender-balanced cohort formation.
   * Important for creating inclusive learning environments.
   *
   * @param gender - Gender to filter by
   * @param options - Optional pagination and filtering options
   * @returns Promise resolving to paginated list of persons
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * // Analyze gender distribution in tech skills
   * const femaleParticipants = await personRepository.findByGender(
   *   GenderType.FEMALE,
   *   { include: ['skillPassport'] }
   * );
   * ```
   */
  findByGender(
    gender: GenderType,
    options?: FindAllOptions,
  ): Promise<PaginatedResult<Person>>;

  /**
   * Finds persons by country/region
   *
   * Critical for country-specific analytics, compliance reporting,
   * and localized content delivery across India and UAE markets.
   *
   * @param country - Country code to filter by
   * @param options - Optional pagination and filtering options
   * @returns Promise resolving to paginated list of persons
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * // Get all users from UAE for region-specific analysis
   * const uaeUsers = await personRepository.findByCountry(
   *   SupportedCountry.UAE,
   *   { include: ['skillPassport', 'addresses'] }
   * );
   * ```
   */
  findByCountry(
    country: SupportedCountry,
    options?: FindAllOptions,
  ): Promise<PaginatedResult<Person>>;

  /**
   * Finds persons by city within a country
   *
   * Enables location-based services, local job opportunities,
   * and regional analytics for targeted interventions.
   *
   * @param country - Country code
   * @param city - City name
   * @param options - Optional pagination and filtering options
   * @returns Promise resolving to paginated list of persons
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * // Find all users in Mumbai for local job placement
   * const mumbaiUsers = await personRepository.findByCity(
   *   SupportedCountry.INDIA,
   *   'Mumbai',
   *   { include: ['skillPassport'] }
   * );
   * ```
   */
  findByCity(
    country: SupportedCountry,
    city: string,
    options?: FindAllOptions,
  ): Promise<PaginatedResult<Person>>;

  // ===================================================================
  // ACTIVITY & ENGAGEMENT QUERIES
  // ===================================================================

  /**
   * Finds recently active persons
   *
   * Supports engagement analytics and identifying active users for
   * targeted communications and assessment opportunities.
   *
   * @param daysBack - Number of days to look back for activity
   * @param options - Optional pagination and filtering options
   * @returns Promise resolving to paginated list of recently active persons
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * // Find users active in the last 7 days
   * const recentlyActive = await personRepository.findRecentlyActive(
   *   7,
   *   { sortBy: 'lastLoginAt', sortOrder: 'desc' }
   * );
   * ```
   */
  findRecentlyActive(
    daysBack: number,
    options?: FindAllOptions,
  ): Promise<PaginatedResult<Person>>;

  /**
   * Finds inactive persons who need re-engagement
   *
   * Identifies users who haven't been active for a specified period.
   * Supports re-engagement campaigns and churn prevention strategies.
   *
   * @param daysInactive - Minimum number of days without activity
   * @param options - Optional pagination and filtering options
   * @returns Promise resolving to paginated list of inactive persons
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * // Find users inactive for 30+ days for re-engagement campaign
   * const inactiveUsers = await personRepository.findInactiveUsers(
   *   30,
   *   { include: ['skillPassport'], limit: 200 }
   * );
   * ```
   */
  findInactiveUsers(
    daysInactive: number,
    options?: FindAllOptions,
  ): Promise<PaginatedResult<Person>>;

  /**
   * Finds persons by registration date range
   *
   * Supports cohort analysis, registration analytics, and understanding
   * platform growth patterns over time.
   *
   * @param startDate - Start of date range (inclusive)
   * @param endDate - End of date range (inclusive)
   * @param options - Optional pagination and filtering options
   * @returns Promise resolving to paginated list of persons
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * // Analyze registrations from last month
   * const lastMonthRegistrations = await personRepository.findByRegistrationDateRange(
   *   new Date('2024-07-01'),
   *   new Date('2024-07-31'),
   *   { sortBy: 'createdAt', sortOrder: 'asc' }
   * );
   * ```
   */
  findByRegistrationDateRange(
    startDate: Date,
    endDate: Date,
    options?: FindAllOptions,
  ): Promise<PaginatedResult<Person>>;

  // ===================================================================
  // ADVANCED ANALYTICS QUERIES
  // ===================================================================

  /**
   * Gets competency level distribution statistics
   *
   * Provides aggregated statistics for CCIS level distribution across
   * all competencies. Critical for platform analytics and AI model training.
   *
   * @param competencyType - Optional specific competency to analyze
   * @param country - Optional country filter for regional analysis
   * @returns Promise resolving to competency statistics
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * // Get overall CCIS level distribution
   * const levelStats = await personRepository.getCompetencyLevelDistribution();
   * console.log('Level 3 Communication:', levelStats.communication.level3Count);
   * ```
   */
  getCompetencyLevelDistribution(
    competencyType?: string,
    country?: SupportedCountry,
  ): Promise<CompetencyLevelStats>;

  /**
   * Gets user demographic summary statistics
   *
   * Provides high-level demographic breakdown for platform analytics,
   * reporting, and strategic decision making.
   *
   * @param country - Optional country filter
   * @returns Promise resolving to demographic statistics
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * // Get demographic breakdown for India
   * const indiaStats = await personRepository.getDemographicStats(
   *   SupportedCountry.INDIA
   * );
   * console.log('Average age:', indiaStats.averageAge);
   * console.log('Gender distribution:', indiaStats.genderDistribution);
   * ```
   */
  getDemographicStats(country?: SupportedCountry): Promise<DemographicStats>;

  /**
   * Gets verification workflow metrics
   *
   * Provides metrics for KYC and verification processes to monitor
   * workflow efficiency and identify bottlenecks.
   *
   * @param dateRange - Optional date range for analysis
   * @returns Promise resolving to verification metrics
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * // Monitor verification performance
   * const verificationMetrics = await personRepository.getVerificationMetrics({
   *   startDate: new Date('2024-08-01'),
   *   endDate: new Date('2024-08-31')
   * });
   * console.log('Average verification time:', verificationMetrics.averageVerificationTime);
   * ```
   */
  getVerificationMetrics(dateRange?: {
    startDate: Date;
    endDate: Date;
  }): Promise<VerificationMetrics>;

  // ===================================================================
  // BULK OPERATIONS
  // ===================================================================

  /**
   * Bulk updates verification status for multiple persons
   *
   * Optimized for batch verification operations and admin workflow
   * management. Maintains audit trail for compliance.
   *
   * @param personIds - Array of person IDs to update
   * @param isVerified - New verification status
   * @param verifiedBy - ID of person/system performing verification
   * @returns Promise resolving to number of successfully updated persons
   * @throws RepositoryException if bulk operation fails
   *
   * @example
   * ```typescript
   * // Bulk verify users after KYC review
   * const updatedCount = await personRepository.bulkUpdateVerificationStatus(
   *   [id1, id2, id3],
   *   true,
   *   adminUserId
   * );
   * console.log(`Verified ${updatedCount} users`);
   * ```
   */
  bulkUpdateVerificationStatus(
    personIds: PersonID[],
    isVerified: boolean,
    verifiedBy: PersonID,
  ): Promise<number>;

  /**
   * Bulk updates KYC status for multiple persons
   *
   * Supports batch KYC processing and workflow automation.
   * Essential for efficient compliance management.
   *
   * @param personIds - Array of person IDs to update
   * @param kycStatus - New KYC status
   * @param updatedBy - ID of person/system performing update
   * @returns Promise resolving to number of successfully updated persons
   * @throws RepositoryException if bulk operation fails
   *
   * @example
   * ```typescript
   * // Bulk update KYC status after document review
   * const updatedCount = await personRepository.bulkUpdateKYCStatus(
   *   rejectedIds,
   *   KYCStatus.REJECTED,
   *   reviewerUserId
   * );
   * ```
   */
  bulkUpdateKYCStatus(
    personIds: PersonID[],
    kycStatus: string,
    updatedBy: PersonID,
  ): Promise<number>;

  // ===================================================================
  // SEARCH OPERATIONS
  // ===================================================================

  /**
   * Performs full-text search across person profiles
   *
   * Enables admin search functionality and user discovery features.
   * Searches across name, email, bio, and other searchable fields.
   *
   * @param searchTerm - Search query string
   * @param options - Optional search configuration and pagination
   * @returns Promise resolving to paginated search results
   * @throws RepositoryException if search operation fails
   *
   * @example
   * ```typescript
   * // Search for persons by name or email
   * const searchResults = await personRepository.searchPersons(
   *   'john doe',
   *   { page: 1, limit: 20, include: ['skillPassport'] }
   * );
   * ```
   */
  searchPersons(
    searchTerm: string,
    options?: SearchOptions,
  ): Promise<PaginatedResult<Person>>;

  /**
   * Advanced search with multiple criteria
   *
   * Supports complex queries with multiple filters for admin operations
   * and advanced analytics. Combines multiple search criteria efficiently.
   *
   * @param criteria - Advanced search criteria object
   * @param options - Optional pagination and sorting options
   * @returns Promise resolving to paginated search results
   * @throws RepositoryException if search operation fails
   *
   * @example
   * ```typescript
   * // Complex search for placement-ready candidates
   * const candidates = await personRepository.advancedSearch({
   *   minAge: 22,
   *   maxAge: 30,
   *   isVerified: true,
   *   country: SupportedCountry.INDIA,
   *   minimumCCISLevel: 3,
   *   skills: ['communication', 'problem-solving']
   * });
   * ```
   */
  advancedSearch(
    criteria: AdvancedSearchCriteria,
    options?: FindAllOptions,
  ): Promise<PaginatedResult<Person>>;

  // ===================================================================
  // DELETION AND REACTIVATION OPERATIONS
  // ===================================================================

  /**
   * Finds a deleted person by email address for reactivation
   *
   * Enables re-registration workflows by locating soft-deleted accounts
   * that can be reactivated instead of creating duplicates.
   *
   * @param email - Email address to search for in deleted accounts
   * @returns Promise resolving to deleted person or null if not found
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * const deletedPerson = await repository.findDeletedByEmail('user@example.com');
   * if (deletedPerson) {
   *   // Reactivate existing account instead of creating new
   *   await repository.reactivate(deletedPerson);
   * }
   * ```
   */
  findDeletedByEmail(email: string): Promise<Person | null>;

  /**
   * Finds a deleted person by phone number for reactivation
   *
   * Enables re-registration workflows by locating soft-deleted accounts
   * that can be reactivated instead of creating duplicates.
   *
   * @param phone - Phone number to search for in deleted accounts
   * @returns Promise resolving to deleted person or null if not found
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * const deletedPerson = await repository.findDeletedByPhone('+919876543210');
   * if (deletedPerson) {
   *   // Reactivate existing account instead of creating new
   *   await repository.reactivate(deletedPerson);
   * }
   * ```
   */
  findDeletedByPhone(phone: string): Promise<Person | null>;

  /**
   * Reactivates a soft-deleted person account
   *
   * Restores a previously deleted account by clearing deletion timestamp,
   * reactivating account status, and resetting verification states for security.
   *
   * @param person - The deleted person entity to reactivate
   * @returns Promise resolving to the reactivated person
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * const deletedPerson = await repository.findDeletedByEmail('user@example.com');
   * if (deletedPerson) {
   *   const reactivatedPerson = await repository.reactivate(deletedPerson);
   *   // Send reactivation notification email
   * }
   * ```
   */
  reactivate(person: Person): Promise<Person>;
}

// ===================================================================
// SUPPORTING TYPES AND INTERFACES
// ===================================================================

/**
 * Competency level distribution statistics
 *
 * Provides aggregated data about CCIS level distribution across
 * the platform for analytics and reporting purposes.
 */
export interface CompetencyLevelStats {
  /** Total number of persons with skill passports */
  totalPersons: number;

  /** Breakdown by competency type */
  competencies: Record<string, CompetencyBreakdown>;

  /** Overall platform statistics */
  overall: {
    /** Average CCIS level across all competencies */
    averageLevel: number;
    /** Distribution of persons by highest achieved level */
    levelDistribution: Record<number, number>;
    /** Percentage of persons ready for placement (Level 3+) */
    placementReadyPercentage: number;
  };

  /** Analysis metadata */
  generatedAt: Date;
  /** Date range for the analysis */
  dateRange?: { startDate: Date; endDate: Date };
}

/**
 * Individual competency breakdown statistics
 */
export interface CompetencyBreakdown {
  /** Competency name */
  name: string;
  /** Total assessed persons for this competency */
  totalAssessed: number;
  /** Average level for this competency */
  averageLevel: number;
  /** Count of persons at each level */
  levelCounts: {
    level1: number;
    level2: number;
    level3: number;
    level4: number;
  };
  /** Percentage of persons at Level 3+ (placement ready) */
  placementReadyPercentage: number;
}

/**
 * Platform demographic statistics
 *
 * Provides insights into user demographics for strategic planning
 * and platform optimization.
 */
export interface DemographicStats {
  /** Total registered persons */
  totalPersons: number;

  /** Age distribution statistics */
  ageDistribution: {
    /** Average age of all users */
    averageAge: number;
    /** Age range breakdown */
    ranges: {
      under20: number;
      age20to25: number;
      age26to30: number;
      age31to35: number;
      over35: number;
    };
  };

  /** Gender distribution */
  genderDistribution: Record<GenderType, number>;

  /** Geographic distribution */
  countryDistribution: Record<SupportedCountry, number>;

  /** Verification status distribution */
  verificationStats: {
    verified: number;
    unverified: number;
    verificationRate: number; // Percentage
  };

  /** Activity statistics */
  activityStats: {
    activeLastWeek: number;
    activeLastMonth: number;
    inactiveOver30Days: number;
  };

  /** Analysis metadata */
  generatedAt: Date;
}

/**
 * Verification workflow metrics
 *
 * Provides insights into KYC and verification process performance
 * for operational optimization.
 */
export interface VerificationMetrics {
  /** Total verification requests in period */
  totalRequests: number;

  /** Verification outcomes */
  outcomes: {
    approved: number;
    rejected: number;
    pending: number;
    expired: number;
  };

  /** Timing metrics */
  timing: {
    /** Average time from request to completion (hours) */
    averageVerificationTime: number;
    /** Median verification time (hours) */
    medianVerificationTime: number;
    /** Percentage completed within 24 hours */
    completedWithin24Hours: number;
  };

  /** Quality metrics */
  quality: {
    /** Percentage of verifications that required re-review */
    reReviewRate: number;
    /** Most common rejection reasons */
    rejectionReasons: Record<string, number>;
  };

  /** Analysis metadata */
  periodStart: Date;
  periodEnd: Date;
  generatedAt: Date;
}

/**
 * Search options for person search operations
 *
 * Extends basic find options with search-specific configuration.
 */
export interface SearchOptions extends FindAllOptions {
  /**
   * Fields to search within
   * @default ['name', 'email', 'bio']
   */
  searchFields?: string[];

  /**
   * Minimum relevance score for results (0-1)
   * @default 0.1
   */
  minRelevance?: number;

  /**
   * Whether to use fuzzy matching for typos
   * @default true
   */
  fuzzyMatch?: boolean;

  /**
   * Whether to highlight matching terms in results
   * @default false
   */
  highlight?: boolean;
}

/**
 * Advanced search criteria for complex person queries
 *
 * Supports multi-criteria searches for admin operations and analytics.
 */
export interface AdvancedSearchCriteria {
  /** Text search across searchable fields */
  searchTerm?: string;

  /** Age range filter */
  minAge?: number;
  maxAge?: number;

  /** Gender filter */
  gender?: GenderType;

  /** Geographic filters */
  country?: SupportedCountry;
  city?: string;

  /** Verification status filters */
  isVerified?: boolean;
  kycStatus?: string;

  /** Skill passport filters */
  hasSkillPassport?: boolean;
  minimumCCISLevel?: number;
  specificCompetencies?: string[];

  /** Activity filters */
  registeredAfter?: Date;
  registeredBefore?: Date;
  lastActiveAfter?: Date;
  lastActiveBefore?: Date;

  /** Account status filter */
  accountStatus?: string;

  /** Custom field filters */
  customFilters?: Record<string, unknown>;
}
