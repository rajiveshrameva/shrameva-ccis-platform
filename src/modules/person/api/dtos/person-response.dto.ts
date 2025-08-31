// src/modules/person/api/dtos/person-response.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Person Response DTO
 *
 * Data Transfer Object for returning person information from the Shrameva CCIS platform.
 * Provides controlled data exposure with privacy protection and flexible field inclusion.
 *
 * Features:
 * - Privacy-aware data serialization
 * - Configurable field exposure based on user permissions
 * - Sensitive data protection (email/phone masking)
 * - Skill passport integration
 * - Multi-country support
 * - Audit trail information
 *
 * This DTO ensures proper data exposure while maintaining privacy and security
 * standards essential for the platform's compliance requirements.
 */
export class PersonResponseDto {
  @ApiProperty({
    description: 'Unique person identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Person full name',
    example: 'Rajesh Kumar Singh',
  })
  fullName: string;

  @ApiProperty({
    description: 'First name',
    example: 'Rajesh',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Kumar',
  })
  lastName: string;

  @ApiPropertyOptional({
    description: 'Middle name',
    example: 'Singh',
  })
  middleName?: string;

  @ApiPropertyOptional({
    description: 'Preferred name',
    example: 'Raj',
  })
  preferredName?: string;

  @ApiProperty({
    description: 'Email address (may be masked based on privacy settings)',
    example: 'r****h@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Phone number (may be masked based on privacy settings)',
    example: '+91****3210',
  })
  phone: string;

  @ApiProperty({
    description: 'Age in years',
    example: 24,
  })
  age: number;

  @ApiProperty({
    description: 'Gender identity',
    example: 'MALE',
    enum: ['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY'],
  })
  gender: string;

  @ApiPropertyOptional({
    description: 'Complete address information',
  })
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    addressType?: string;
    isPrimary?: boolean;
  };

  @ApiProperty({
    description: 'Profile visibility setting',
    example: 'CONTACTS_ONLY',
    enum: ['PUBLIC', 'PRIVATE', 'CONTACTS_ONLY', 'INSTITUTIONS_ONLY'],
  })
  profileVisibility: string;

  @ApiProperty({
    description: 'Profile completion percentage',
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  profileCompleteness: number;

  @ApiProperty({
    description: 'Onboarding completion status',
    example: true,
  })
  onboardingCompleted: boolean;

  @ApiProperty({
    description: 'Email verification status',
    example: true,
  })
  emailVerified: boolean;

  @ApiProperty({
    description: 'Phone verification status',
    example: true,
  })
  phoneVerified: boolean;

  @ApiProperty({
    description: 'KYC completion status',
    example: false,
  })
  kycCompleted: boolean;

  @ApiPropertyOptional({
    description: 'Skill passport summary',
  })
  skillPassport?: {
    overallCcisLevel: number;
    competencyCount: number;
    assessmentCount: number;
    lastAssessmentDate?: Date;
    nextMilestone?: string;
    strengths: string[];
    developmentAreas: string[];
  };

  @ApiProperty({
    description: 'Account status',
    example: 'ACTIVE',
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'],
  })
  status: string;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2025-08-29T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-08-29T15:45:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Current version number for optimistic concurrency',
    example: 3,
  })
  version: number;

  // Note: Sensitive fields are handled through controlled exposure in static methods
  // rather than decorators to avoid import issues
  private dateOfBirth?: Date;
  private dataSharing?: Record<string, boolean>;
  private marketingOptIn?: boolean;
  private metadata?: Record<string, any>;

  /**
   * Creates a PersonResponseDto from a Person entity
   */
  static fromEntity(
    person: any,
    includePrivateData = false,
  ): PersonResponseDto {
    const dto = new PersonResponseDto();

    dto.id = person.id?.value || person.id;
    dto.firstName = person.name?.firstName || person.firstName;
    dto.lastName = person.name?.lastName || person.lastName;
    dto.middleName = person.name?.middleName || person.middleName;
    dto.preferredName = person.name?.preferredName || person.preferredName;
    dto.fullName = PersonResponseDto.buildFullName(
      dto.firstName,
      dto.lastName,
      dto.middleName,
    );

    dto.email = person.email?.value || person.email;
    dto.phone = person.phone?.value || person.phone;
    dto.age = person.age?.value || person.age;
    dto.gender = person.gender?.value || person.gender;

    // Address handling
    if (person.address) {
      dto.address = {
        addressLine1: person.address.addressLine1,
        addressLine2: person.address.addressLine2,
        city: person.address.city,
        state: person.address.stateOrProvince,
        postalCode: person.address.postalCode,
        country: person.address.country,
        addressType: person.address.addressType,
        isPrimary: person.address.isPrimary,
      };
    }

    dto.profileVisibility = person.profileVisibility || 'CONTACTS_ONLY';
    dto.profileCompleteness = person.profileCompleteness || 0;
    dto.onboardingCompleted = person.onboardingCompleted || false;
    dto.emailVerified = person.emailVerified || false;
    dto.phoneVerified = person.phoneVerified || false;
    dto.kycCompleted = person.kycCompleted || false;
    dto.status = person.status || 'ACTIVE';
    dto.createdAt = person.createdAt;
    dto.updatedAt = person.updatedAt;
    dto.version = person.version || 1;

    // Skill passport summary
    if (person.skillPassport) {
      dto.skillPassport = {
        overallCcisLevel: person.skillPassport.overallCcisLevel,
        competencyCount: person.skillPassport.competencies?.length || 0,
        assessmentCount: person.skillPassport.assessments?.length || 0,
        lastAssessmentDate: person.skillPassport.lastAssessmentDate,
        nextMilestone: person.skillPassport.nextMilestone,
        strengths: person.skillPassport.strengths || [],
        developmentAreas: person.skillPassport.developmentAreas || [],
      };
    }

    // Include sensitive data only if explicitly requested and authorized
    if (includePrivateData) {
      dto.dateOfBirth = person.dateOfBirth;
      dto.dataSharing = person.dataSharing;
      dto.marketingOptIn = person.marketingOptIn;
      dto.metadata = person.metadata;
    }

    return dto;
  }

  /**
   * Creates a public profile version with limited information
   */
  static forPublicProfile(person: any): PersonResponseDto {
    const dto = PersonResponseDto.fromEntity(person, false);

    // Further restrict data for public profiles
    if (dto.profileVisibility === 'PRIVATE') {
      dto.email = PersonResponseDto.maskEmail(dto.email);
      dto.phone = PersonResponseDto.maskPhone(dto.phone);
      dto.address = undefined; // Hide address completely
    }

    return dto;
  }

  /**
   * Creates an admin view with all data included
   */
  static forAdminView(person: any): PersonResponseDto {
    return PersonResponseDto.fromEntity(person, true);
  }

  /**
   * Masks email address for privacy protection
   */
  static maskEmail(email: string): string {
    if (!email || !email.includes('@')) return '***@***.***';

    const [localPart, domain] = email.split('@');
    const maskedLocal =
      localPart.length <= 2
        ? '***'
        : localPart[0] + '***' + localPart[localPart.length - 1];
    const maskedDomain =
      domain.length <= 4
        ? '***'
        : domain
            .split('.')
            .map((part) => part[0] + '***')
            .join('.');

    return `${maskedLocal}@${maskedDomain}`;
  }

  /**
   * Masks phone number for privacy protection
   */
  static maskPhone(phone: string): string {
    if (!phone || phone.length < 6) return '+***';

    const countryCode = phone.substring(
      0,
      phone.indexOf(' ') > 0 ? phone.indexOf(' ') : 3,
    );
    const lastFour = phone.slice(-4);

    return `${countryCode}****${lastFour}`;
  }

  /**
   * Builds full name from components
   */
  static buildFullName(
    firstName: string,
    lastName: string,
    middleName?: string,
  ): string {
    const parts = [firstName, middleName, lastName].filter(Boolean);
    return parts.join(' ');
  }

  /**
   * Calculates profile completeness score
   */
  static calculateCompleteness(person: any): number {
    const fields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'dateOfBirth',
      'gender',
      'address',
      'profileVisibility',
      'emailVerified',
      'phoneVerified',
    ];

    const completedFields = fields.filter((field) => {
      const value = person[field];
      return value !== null && value !== undefined && value !== '';
    }).length;

    return Math.round((completedFields / fields.length) * 100);
  }
}

/**
 * Person List Response DTO for paginated results
 */
export class PersonListResponseDto {
  @ApiProperty({
    description: 'List of persons',
    type: [PersonResponseDto],
  })
  data: PersonResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };

  @ApiPropertyOptional({
    description: 'Filtering and sorting information',
  })
  filters?: {
    country?: string;
    status?: string;
    profileVisibility?: string;
    ageRange?: [number, number];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

/**
 * Person Summary DTO for dashboard views
 */
export class PersonSummaryDto {
  @ApiProperty({
    description: 'Total number of persons',
    example: 1250,
  })
  total: number;

  @ApiProperty({
    description: 'Active persons count',
    example: 1100,
  })
  active: number;

  @ApiProperty({
    description: 'Verified persons count',
    example: 850,
  })
  verified: number;

  @ApiProperty({
    description: 'Persons with completed skill passports',
    example: 600,
  })
  withSkillPassports: number;

  @ApiProperty({
    description: 'Country-wise distribution',
    example: { INDIA: 1000, UAE: 250 },
  })
  countryDistribution: Record<string, number>;

  @ApiProperty({
    description: 'Average profile completeness',
    example: 78.5,
  })
  averageCompleteness: number;

  @ApiProperty({
    description: 'Recent registrations (last 30 days)',
    example: 125,
  })
  recentRegistrations: number;
}
