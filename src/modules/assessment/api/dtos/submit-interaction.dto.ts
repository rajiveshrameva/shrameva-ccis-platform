/**
 * Submit Task Interaction DTO
 *
 * Data Transfer Object for submitting task interaction data during an
 * assessment session. This DTO captures comprehensive behavioral signals,
 * performance metrics, and interaction context for CCIS calculation
 * and gaming detection.
 *
 * Key Features:
 * 1. **Behavioral Signal Capture**: Records comprehensive interaction data
 * 2. **Real-time Processing**: Supports immediate CCIS calculation updates
 * 3. **Gaming Detection**: Collects data for anti-gaming analysis
 * 4. **Cultural Context**: Maintains cultural considerations in interactions
 * 5. **Performance Tracking**: Captures efficiency and effectiveness metrics
 * 6. **Accessibility Support**: Records accessibility interaction patterns
 *
 * @example
 * ```typescript
 * const dto = {
 *   sessionId: "session-123",
 *   taskId: "task-456",
 *   interactionType: "task_attempt",
 *   startTime: new Date().toISOString(),
 *   endTime: new Date().toISOString(),
 *   interactionData: { responses: [...] },
 *   behavioralSignals: { hintsUsed: 2, errorsCommitted: 1 }
 * };
 * ```
 */

export class SubmitTaskInteractionDto {
  /**
   * Assessment session ID
   * Links interaction to active assessment session
   */
  sessionId: string;

  /**
   * Task identifier
   * Identifies the specific task being completed
   */
  taskId: string;

  /**
   * Type of interaction being submitted
   * Categorizes the interaction for proper processing
   */
  interactionType:
    | 'task_attempt'
    | 'hint_request'
    | 'help_seeking'
    | 'collaboration_request'
    | 'self_assessment'
    | 'resource_access';

  /**
   * Competency being assessed in this interaction
   * Maps to one of the 7 CCIS competencies
   */
  competencyType: string;

  /**
   * Interaction start timestamp
   * ISO 8601 formatted datetime string
   */
  startTime: string;

  /**
   * Interaction end timestamp (optional for ongoing interactions)
   * ISO 8601 formatted datetime string
   */
  endTime?: string;

  /**
   * Interaction duration in milliseconds
   * Calculated automatically if not provided
   */
  duration?: number;

  /**
   * Core interaction data
   * Contains task responses, user inputs, and interaction outcomes
   */
  interactionData: {
    /**
     * Task responses and submissions
     */
    responses?: any[];

    /**
     * User input data (text, selections, etc.)
     */
    userInputs?: Record<string, any>;

    /**
     * Task completion status
     */
    completionStatus?: 'completed' | 'partial' | 'abandoned' | 'error';

    /**
     * Quality indicators for the interaction
     */
    qualityIndicators?: {
      accuracy?: number; // 0-1 scale
      completeness?: number; // 0-1 scale
      appropriateness?: number; // 0-1 scale
    };

    /**
     * Task outcome and results
     */
    outcome?: {
      success: boolean;
      score?: number;
      feedback?: string;
      nextRecommendations?: string[];
    };
  };

  /**
   * Behavioral signals captured during interaction
   * Critical for CCIS calculation and gaming detection
   */
  behavioralSignals: {
    /**
     * Number of hints requested during interaction
     */
    hintsUsed?: number;

    /**
     * Types of hints requested
     */
    hintTypes?: ('conceptual' | 'procedural' | 'strategic' | 'confirmation')[];

    /**
     * Errors committed and recovery patterns
     */
    errorsCommitted?: number;
    errorRecoveryTime?: number;
    selfCorrectedErrors?: number;

    /**
     * Time-based behavioral indicators
     */
    timeSpentReading?: number; // milliseconds
    timeSpentThinking?: number; // milliseconds
    timeSpentExecuting?: number; // milliseconds
    timeSpentReviewing?: number; // milliseconds

    /**
     * Interaction patterns
     */
    navigationPatterns?: string[];
    scrollingBehavior?: Record<string, any>;
    focusPatterns?: Record<string, any>;

    /**
     * Persistence and effort indicators
     */
    attemptCount?: number;
    giveUpIndicators?: string[];
    persistenceScore?: number; // 0-1 scale

    /**
     * Self-assessment and confidence
     */
    confidencePrediction?: number; // 0-1 scale before task
    confidenceActual?: number; // 0-1 scale after task
    difficultyPrediction?: number; // 1-5 scale before task
    difficultyActual?: number; // 1-5 scale after task

    /**
     * Collaboration and help-seeking
     */
    helpSeekingBehavior?: {
      resourcesAccessed?: string[];
      peersConsulted?: boolean;
      instructorConsulted?: boolean;
      externalResourcesUsed?: string[];
    };
  };

  /**
   * Contextual metadata for the interaction
   */
  metadata: {
    /**
     * Device and environment context
     */
    deviceType?: 'desktop' | 'tablet' | 'mobile';
    screenResolution?: string;
    browserInfo?: string;
    networkQuality?: 'excellent' | 'good' | 'fair' | 'poor';

    /**
     * Assessment context
     */
    taskDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    scaffoldingLevel: number; // 0-5 scale
    priorAttempts: number;
    contextualFactors?: string[];

    /**
     * Cultural and accessibility context
     */
    culturalContext: 'INDIA' | 'UAE' | 'INTERNATIONAL';
    languagePreference: string;
    accessibilityFeatures?: string[];

    /**
     * Environmental factors
     */
    timeOfDay?: string; // HH:MM format
    dayOfWeek?: string;
    environmentalDistractions?: string[];

    /**
     * Learning context
     */
    learningModality?: 'individual' | 'paired' | 'group';
    instructorPresence?: boolean;
    peerCollaboration?: boolean;
  };

  /**
   * Gaming detection flags (optional)
   * Pre-computed client-side gaming indicators
   */
  gamingFlags?: {
    /**
     * Rapid clicking or automated behavior
     */
    suspiciousClickPatterns?: boolean;

    /**
     * Copy-paste detection
     */
    copyPasteDetected?: boolean;

    /**
     * Tab switching or external resource access
     */
    tabSwitchingDetected?: boolean;

    /**
     * Unusual timing patterns
     */
    unusualTimingPatterns?: boolean;

    /**
     * Pattern recognition gaming
     */
    patternGamingDetected?: boolean;

    /**
     * Answer changing patterns
     */
    excessiveAnswerChanging?: boolean;
  };

  /**
   * Performance metrics (computed client-side)
   */
  performanceMetrics?: {
    /**
     * Task completion efficiency
     */
    efficiency?: number; // 0-1 scale

    /**
     * Independence from hints and help
     */
    independence?: number; // 0-1 scale

    /**
     * Error recovery capability
     */
    resilience?: number; // 0-1 scale

    /**
     * Strategic approach quality
     */
    strategicApproach?: number; // 0-1 scale
  };

  /**
   * Validation method for business rules
   */
  static validate(dto: SubmitTaskInteractionDto): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Required field validation
    if (!dto.sessionId?.trim()) {
      errors.push('Session ID is required and must not be empty');
    }

    if (!dto.taskId?.trim()) {
      errors.push('Task ID is required and must not be empty');
    }

    if (!dto.interactionType) {
      errors.push('Interaction type is required');
    }

    if (
      ![
        'task_attempt',
        'hint_request',
        'help_seeking',
        'collaboration_request',
        'self_assessment',
        'resource_access',
      ].includes(dto.interactionType)
    ) {
      errors.push('Invalid interaction type');
    }

    if (!dto.competencyType?.trim()) {
      errors.push('Competency type is required');
    }

    if (!dto.startTime) {
      errors.push('Start time is required');
    }

    // Validate timestamps
    const startTime = new Date(dto.startTime);
    if (isNaN(startTime.getTime())) {
      errors.push('Start time must be a valid ISO 8601 datetime string');
    }

    if (dto.endTime) {
      const endTime = new Date(dto.endTime);
      if (isNaN(endTime.getTime())) {
        errors.push('End time must be a valid ISO 8601 datetime string');
      }

      if (endTime < startTime) {
        errors.push('End time must be after start time');
      }
    }

    // Validate duration
    if (dto.duration !== undefined && dto.duration < 0) {
      errors.push('Duration cannot be negative');
    }

    // Validate required metadata
    if (!dto.metadata) {
      errors.push('Metadata is required');
    } else {
      if (!dto.metadata.taskDifficulty) {
        errors.push('Task difficulty is required in metadata');
      }

      if (
        !['beginner', 'intermediate', 'advanced', 'expert'].includes(
          dto.metadata.taskDifficulty,
        )
      ) {
        errors.push('Invalid task difficulty level');
      }

      if (
        dto.metadata.scaffoldingLevel === undefined ||
        dto.metadata.scaffoldingLevel < 0 ||
        dto.metadata.scaffoldingLevel > 5
      ) {
        errors.push('Scaffolding level must be between 0 and 5');
      }

      if (
        dto.metadata.priorAttempts === undefined ||
        dto.metadata.priorAttempts < 0
      ) {
        errors.push('Prior attempts must be a non-negative number');
      }

      if (!dto.metadata.culturalContext) {
        errors.push('Cultural context is required in metadata');
      }

      if (
        !['INDIA', 'UAE', 'INTERNATIONAL'].includes(
          dto.metadata.culturalContext,
        )
      ) {
        errors.push('Invalid cultural context');
      }

      if (!dto.metadata.languagePreference?.trim()) {
        errors.push('Language preference is required in metadata');
      }
    }

    // Validate behavioral signals
    if (dto.behavioralSignals) {
      if (
        dto.behavioralSignals.hintsUsed !== undefined &&
        dto.behavioralSignals.hintsUsed < 0
      ) {
        errors.push('Hints used cannot be negative');
      }

      if (
        dto.behavioralSignals.errorsCommitted !== undefined &&
        dto.behavioralSignals.errorsCommitted < 0
      ) {
        errors.push('Errors committed cannot be negative');
      }

      if (
        dto.behavioralSignals.confidencePrediction !== undefined &&
        (dto.behavioralSignals.confidencePrediction < 0 ||
          dto.behavioralSignals.confidencePrediction > 1)
      ) {
        errors.push('Confidence prediction must be between 0 and 1');
      }

      if (
        dto.behavioralSignals.confidenceActual !== undefined &&
        (dto.behavioralSignals.confidenceActual < 0 ||
          dto.behavioralSignals.confidenceActual > 1)
      ) {
        errors.push('Actual confidence must be between 0 and 1');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert DTO to domain command data
   */
  toDomainData(): any {
    return {
      sessionId: this.sessionId,
      taskId: this.taskId,
      interactionType: this.interactionType,
      competencyType: this.competencyType,
      startTime: new Date(this.startTime),
      endTime: this.endTime ? new Date(this.endTime) : undefined,
      duration: this.duration,
      interactionData: this.interactionData,
      behavioralSignals: this.behavioralSignals,
      metadata: this.metadata,
      gamingFlags: this.gamingFlags || {},
      performanceMetrics: this.performanceMetrics,
    };
  }
}
