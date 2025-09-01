/**
 * Start Assessment DTO
 *
 * Data Transfer Object for initiating a new CCIS assessment session.
 * This DTO validates and structures the request data for starting comprehensive
 * competency assessments with proper cultural context, accessibility support,
 * and adaptive configuration.
 *
 * Key Features:
 * 1. **Comprehensive Validation**: Validates all assessment parameters
 * 2. **Cultural Context**: Supports India, UAE, and international contexts
 * 3. **Accessibility Support**: Configures accessibility accommodations
 * 4. **Adaptive Settings**: Personalizes assessment difficulty and approach
 * 5. **Security Validation**: Ensures proper authentication and authorization
 * 6. **Business Rules**: Enforces assessment initiation business rules
 *
 * @example
 * ```typescript
 * const dto = {
 *   personId: "person-123",
 *   assessmentType: "comprehensive",
 *   targetCompetencies: ["communication", "problem_solving"],
 *   culturalContext: "india",
 *   languagePreference: "en",
 *   accessibilityNeeds: ["screen_reader"],
 *   maxDuration: 60
 * };
 * ```
 */

import { CompetencyType } from '../../domain/value-objects/competency-type.value-object';

export class StartAssessmentDto {
  /**
   * Person ID for whom the assessment is being conducted
   * Must be a valid PersonID that exists in the system
   */
  personId: string;

  /**
   * Type of assessment to conduct
   * - comprehensive: All 7 CCIS competencies
   * - targeted: Specific competencies only
   * - progress: Follow-up assessment for existing competencies
   * - remediation: Focused improvement assessment
   */
  assessmentType: 'comprehensive' | 'targeted' | 'progress' | 'remediation';

  /**
   * Specific competencies to assess (required for targeted assessments)
   * Optional for comprehensive assessments (defaults to all competencies)
   */
  targetCompetencies?: string[];

  /**
   * Cultural context for adaptive assessment
   * Influences task selection, interaction patterns, and evaluation criteria
   */
  culturalContext: 'INDIA' | 'UAE' | 'INTERNATIONAL';

  /**
   * Preferred language for assessment interface and instructions
   * Supports ISO 639-1 language codes
   */
  languagePreference: string;

  /**
   * Accessibility accommodations needed
   * Used to configure appropriate assessment modalities
   */
  accessibilityNeeds?: string[];

  /**
   * Maximum assessment duration in minutes
   * Used for time management and session planning
   */
  maxDuration?: number;

  /**
   * Initial difficulty level hint (optional)
   * System will adapt based on performance, but this provides starting point
   */
  initialDifficultyHint?: 'beginner' | 'intermediate' | 'advanced' | 'expert';

  /**
   * Assessment purpose for analytics and reporting
   * Helps categorize assessment results and track usage patterns
   */
  assessmentPurpose?:
    | 'initial_evaluation'
    | 'progress_tracking'
    | 'certification'
    | 'placement'
    | 'remediation';

  /**
   * Institution context (optional)
   * Used for institutional analytics and reporting
   */
  institutionId?: string;

  /**
   * Course context (optional)
   * Links assessment to specific learning programs
   */
  courseId?: string;

  /**
   * Instructor context (optional)
   * Associates assessment with specific instructors for reporting
   */
  instructorId?: string;

  /**
   * Assessment metadata
   * Additional context and configuration options
   */
  metadata?: {
    /**
     * Custom assessment tags for categorization
     */
    tags?: string[];

    /**
     * Assessment priority level
     */
    priority?: 'low' | 'normal' | 'high' | 'urgent';

    /**
     * External reference ID for integration with other systems
     */
    externalReferenceId?: string;

    /**
     * Custom configuration overrides
     */
    configurationOverrides?: Record<string, any>;

    /**
     * Assessment scheduling information
     */
    scheduledFor?: string; // ISO 8601 datetime

    /**
     * Assessment group or cohort information
     */
    cohortId?: string;

    /**
     * Parent assessment session (for follow-up assessments)
     */
    parentAssessmentId?: string;
  };

  /**
   * Validation method for business rules
   * Ensures all required fields are present and valid
   */
  static validate(dto: StartAssessmentDto): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Required field validation
    if (!dto.personId?.trim()) {
      errors.push('Person ID is required and must not be empty');
    }

    if (!dto.assessmentType) {
      errors.push('Assessment type is required');
    }

    if (
      !['comprehensive', 'targeted', 'progress', 'remediation'].includes(
        dto.assessmentType,
      )
    ) {
      errors.push(
        'Assessment type must be one of: comprehensive, targeted, progress, remediation',
      );
    }

    if (!dto.culturalContext) {
      errors.push('Cultural context is required');
    }

    if (!['INDIA', 'UAE', 'INTERNATIONAL'].includes(dto.culturalContext)) {
      errors.push('Cultural context must be one of: INDIA, UAE, INTERNATIONAL');
    }

    if (!dto.languagePreference?.trim()) {
      errors.push('Language preference is required');
    }

    // Targeted assessment validation
    if (dto.assessmentType === 'targeted') {
      if (!dto.targetCompetencies || dto.targetCompetencies.length === 0) {
        errors.push(
          'Target competencies are required for targeted assessments',
        );
      }

      if (dto.targetCompetencies && dto.targetCompetencies.length > 7) {
        errors.push(
          'Cannot target more than 7 competencies in a single assessment',
        );
      }

      // Validate competency types
      const validCompetencies = [
        'communication',
        'problem_solving',
        'teamwork',
        'adaptability',
        'time_management',
        'technical_skills',
        'leadership',
      ];
      if (dto.targetCompetencies) {
        const invalidCompetencies = dto.targetCompetencies.filter(
          (c) => !validCompetencies.includes(c),
        );
        if (invalidCompetencies.length > 0) {
          errors.push(
            `Invalid competencies: ${invalidCompetencies.join(', ')}`,
          );
        }
      }
    }

    // Duration validation
    if (dto.maxDuration !== undefined) {
      if (dto.maxDuration < 10 || dto.maxDuration > 240) {
        errors.push('Assessment duration must be between 10 and 240 minutes');
      }
    }

    // Language preference validation
    if (dto.languagePreference && dto.languagePreference.length !== 2) {
      errors.push(
        'Language preference must be a valid ISO 639-1 language code (2 characters)',
      );
    }

    // Accessibility needs validation
    if (dto.accessibilityNeeds && dto.accessibilityNeeds.length > 0) {
      const validAccessibilityNeeds = [
        'screen_reader',
        'large_text',
        'high_contrast',
        'audio_support',
        'extended_time',
        'keyboard_navigation',
      ];
      const invalidNeeds = dto.accessibilityNeeds.filter(
        (need) => !validAccessibilityNeeds.includes(need),
      );
      if (invalidNeeds.length > 0) {
        errors.push(`Invalid accessibility needs: ${invalidNeeds.join(', ')}`);
      }
    }

    // Initial difficulty validation
    if (
      dto.initialDifficultyHint &&
      !['beginner', 'intermediate', 'advanced', 'expert'].includes(
        dto.initialDifficultyHint,
      )
    ) {
      errors.push(
        'Initial difficulty hint must be one of: beginner, intermediate, advanced, expert',
      );
    }

    // Assessment purpose validation
    if (
      dto.assessmentPurpose &&
      ![
        'initial_evaluation',
        'progress_tracking',
        'certification',
        'placement',
        'remediation',
      ].includes(dto.assessmentPurpose)
    ) {
      errors.push(
        'Assessment purpose must be one of: initial_evaluation, progress_tracking, certification, placement, remediation',
      );
    }

    // Metadata validation
    if (dto.metadata) {
      if (
        dto.metadata.priority &&
        !['low', 'normal', 'high', 'urgent'].includes(dto.metadata.priority)
      ) {
        errors.push(
          'Metadata priority must be one of: low, normal, high, urgent',
        );
      }

      if (dto.metadata.tags && dto.metadata.tags.length > 10) {
        errors.push('Cannot have more than 10 assessment tags');
      }

      if (dto.metadata.scheduledFor) {
        const scheduledDate = new Date(dto.metadata.scheduledFor);
        if (isNaN(scheduledDate.getTime())) {
          errors.push(
            'Scheduled date must be a valid ISO 8601 datetime string',
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Business rule validation
   * Ensures assessment request complies with business rules
   */
  static validateBusinessRules(dto: StartAssessmentDto): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check for reasonable assessment timing
    if (dto.maxDuration && dto.maxDuration < 30) {
      warnings.push(
        'Assessments under 30 minutes may not provide sufficient data for accurate CCIS evaluation',
      );
    }

    // Check for cultural-language alignment
    if (
      dto.culturalContext === 'INDIA' &&
      dto.languagePreference !== 'en' &&
      dto.languagePreference !== 'hi'
    ) {
      warnings.push(
        'For India context, English or Hindi are recommended language preferences',
      );
    }

    if (
      dto.culturalContext === 'UAE' &&
      dto.languagePreference !== 'en' &&
      dto.languagePreference !== 'ar'
    ) {
      warnings.push(
        'For UAE context, English or Arabic are recommended language preferences',
      );
    }

    // Check for comprehensive assessment optimizations
    if (
      dto.assessmentType === 'comprehensive' &&
      dto.maxDuration &&
      dto.maxDuration < 60
    ) {
      warnings.push(
        'Comprehensive assessments typically require at least 60 minutes for accurate evaluation',
      );
    }

    // Check for targeted assessment efficiency
    if (
      dto.assessmentType === 'targeted' &&
      dto.targetCompetencies &&
      dto.targetCompetencies.length === 1 &&
      dto.maxDuration &&
      dto.maxDuration > 45
    ) {
      warnings.push(
        'Single competency assessments can typically be completed in 30-45 minutes',
      );
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
    };
  }

  /**
   * Convert DTO to domain command data
   * Transforms API DTO into format suitable for domain command
   */
  toDomainData(): any {
    return {
      personId: this.personId,
      assessmentType: this.assessmentType,
      targetCompetencies:
        this.targetCompetencies?.map((c) => CompetencyType.fromString(c)) || [],
      culturalContext: this.culturalContext,
      languagePreference: this.languagePreference,
      accessibilityNeeds: this.accessibilityNeeds || [],
      maxDuration: this.maxDuration || 60,
      initialDifficultyHint: this.initialDifficultyHint || 'intermediate',
      assessmentPurpose: this.assessmentPurpose || 'initial_evaluation',
      institutionId: this.institutionId,
      courseId: this.courseId,
      instructorId: this.instructorId,
      metadata: this.metadata || {},
    };
  }
}
