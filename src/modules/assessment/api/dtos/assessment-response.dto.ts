/**
 * Assessment Response DTO
 *
 * Data Transfer Object for returning assessment session data and results.
 * This DTO provides comprehensive assessment information including real-time
 * progress, CCIS levels, behavioral insights, and system recommendations.
 *
 * Key Features:
 * 1. **Complete Session Data**: Full assessment session information
 * 2. **Real-time CCIS**: Current competency levels and progress
 * 3. **Behavioral Insights**: Gaming detection and learning patterns
 * 4. **Adaptive Recommendations**: Next steps and interventions
 * 5. **Privacy Controls**: Configurable data exposure levels
 * 6. **Cultural Context**: Culture-aware response formatting
 *
 * @example
 * ```typescript
 * const response = {
 *   sessionId: "session-123",
 *   personId: "person-456",
 *   status: "in_progress",
 *   currentProgress: { communication: 2.8, problemSolving: 3.1 },
 *   timeRemaining: 1800,
 *   nextRecommendations: ["focus_on_teamwork", "increase_difficulty"]
 * };
 * ```
 */

export class AssessmentResponseDto {
  /**
   * Assessment session identifier
   */
  sessionId: string;

  /**
   * Person being assessed
   */
  personId: string;

  /**
   * Current assessment status
   */
  status:
    | 'initializing'
    | 'in_progress'
    | 'paused'
    | 'completed'
    | 'terminated'
    | 'error';

  /**
   * Assessment configuration and context
   */
  assessmentInfo: {
    /**
     * Type of assessment being conducted
     */
    assessmentType: 'comprehensive' | 'targeted' | 'progress' | 'remediation';

    /**
     * Competencies being assessed
     */
    targetCompetencies: string[];

    /**
     * Cultural and language context
     */
    culturalContext: 'INDIA' | 'UAE' | 'INTERNATIONAL';
    languagePreference: string;

    /**
     * Assessment timing
     */
    startTime: string; // ISO 8601
    estimatedEndTime?: string; // ISO 8601
    maxDuration: number; // minutes
    timeElapsed: number; // minutes
    timeRemaining?: number; // minutes

    /**
     * Assessment purpose and context
     */
    assessmentPurpose: string;
    institutionId?: string;
    courseId?: string;
    instructorId?: string;
  };

  /**
   * Current CCIS progress and levels
   */
  currentProgress: {
    /**
     * Overall assessment completion percentage
     */
    overallCompletion: number; // 0-100

    /**
     * Individual competency levels and progress
     */
    competencyLevels: {
      communication?: {
        currentLevel: number; // 1-4 CCIS scale
        progress: number; // 0-100% toward next level
        confidence: number; // 0-1 confidence score
        evidenceCount: number; // number of evidence points
        lastUpdated: string; // ISO 8601
      };
      problemSolving?: {
        currentLevel: number;
        progress: number;
        confidence: number;
        evidenceCount: number;
        lastUpdated: string;
      };
      teamwork?: {
        currentLevel: number;
        progress: number;
        confidence: number;
        evidenceCount: number;
        lastUpdated: string;
      };
      adaptability?: {
        currentLevel: number;
        progress: number;
        confidence: number;
        evidenceCount: number;
        lastUpdated: string;
      };
      timeManagement?: {
        currentLevel: number;
        progress: number;
        confidence: number;
        evidenceCount: number;
        lastUpdated: string;
      };
      technicalSkills?: {
        currentLevel: number;
        progress: number;
        confidence: number;
        evidenceCount: number;
        lastUpdated: string;
      };
      leadership?: {
        currentLevel: number;
        progress: number;
        confidence: number;
        evidenceCount: number;
        lastUpdated: string;
      };
    };

    /**
     * Progress trends and analytics
     */
    progressTrends: {
      improvementRate: number; // levels per hour
      consistencyScore: number; // 0-1 scale
      accelerationFactor: number; // positive = accelerating, negative = decelerating
    };

    /**
     * Comparative analytics
     */
    benchmarkComparison?: {
      peerPercentile: number; // 0-100
      institutionalPercentile: number; // 0-100
      nationalPercentile: number; // 0-100
    };
  };

  /**
   * Current task and interaction state
   */
  currentTask?: {
    /**
     * Active task information
     */
    taskId: string;
    taskType: string;
    competencyFocus: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';

    /**
     * Task progress
     */
    taskProgress: number; // 0-100%
    timeSpentOnTask: number; // minutes
    attemptsOnTask: number;

    /**
     * Scaffolding and support
     */
    scaffoldingLevel: number; // 0-5
    hintsAvailable: number;
    hintsUsed: number;
    helpResourcesAccessed: string[];

    /**
     * Task metadata
     */
    estimatedTimeToComplete: number; // minutes
    difficultyAdjustmentRecommended?: boolean;
    nextTaskRecommendation?: string;
  };

  /**
   * Behavioral insights and analytics
   */
  behavioralInsights: {
    /**
     * Learning pattern analysis
     */
    learningPatterns: {
      preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
      attentionSpan: number; // minutes
      optimalTaskDifficulty:
        | 'beginner'
        | 'intermediate'
        | 'advanced'
        | 'expert';
      helpSeekingBehavior:
        | 'independent'
        | 'collaborative'
        | 'instructor_dependent';
    };

    /**
     * Performance indicators
     */
    performanceIndicators: {
      consistency: number; // 0-1 scale
      persistence: number; // 0-1 scale
      strategicApproach: number; // 0-1 scale
      selfRegulation: number; // 0-1 scale
    };

    /**
     * Gaming detection results
     */
    gamingDetection: {
      gamingRiskScore: number; // 0-1 scale
      flaggedBehaviors: string[];
      interventionRecommended: boolean;
      confidenceInAssessment: number; // 0-1 scale
    };

    /**
     * Cultural adaptation insights
     */
    culturalAdaptation: {
      culturalAlignmentScore: number; // 0-1 scale
      adaptationRecommendations: string[];
      culturalFactorsInfluencing: string[];
    };
  };

  /**
   * System recommendations and next steps
   */
  nextRecommendations: {
    /**
     * Immediate task recommendations
     */
    immediateActions: string[];

    /**
     * Difficulty adjustments
     */
    difficultyAdjustments: {
      increaseDifficulty?: string[]; // competencies to increase
      decreaseDifficulty?: string[]; // competencies to decrease
      maintainLevel?: string[]; // competencies at appropriate level
    };

    /**
     * Scaffolding recommendations
     */
    scaffoldingAdjustments: {
      increaseSupport?: string[]; // areas needing more support
      decreaseSupport?: string[]; // areas ready for independence
      changeStrategy?: string[]; // areas needing different approach
    };

    /**
     * Intervention recommendations
     */
    interventions: {
      motivationalSupport?: boolean;
      technicaklAssistance?: boolean;
      contentReview?: boolean;
      breakRecommended?: boolean;
      instructorNotification?: boolean;
    };

    /**
     * Long-term recommendations
     */
    longTermGuidance: {
      strengthAreas: string[];
      developmentAreas: string[];
      careerAlignmentSuggestions: string[];
      skillDevelopmentPriorities: string[];
    };
  };

  /**
   * System and quality metrics
   */
  systemMetrics: {
    /**
     * Data quality indicators
     */
    dataQuality: {
      completenessScore: number; // 0-1 scale
      consistencyScore: number; // 0-1 scale
      reliabilityScore: number; // 0-1 scale
    };

    /**
     * Assessment session metrics
     */
    sessionMetrics: {
      totalInteractions: number;
      validInteractions: number;
      flaggedInteractions: number;
      averageResponseTime: number; // seconds
      systemResponseTime: number; // milliseconds
    };

    /**
     * Error and warning information
     */
    issues: {
      warnings: string[];
      errors: string[];
      systemAlerts: string[];
    };
  };

  /**
   * Accessibility and accommodation information
   */
  accessibilityInfo?: {
    /**
     * Active accommodations
     */
    activeAccommodations: string[];

    /**
     * Accessibility effectiveness
     */
    accommodationEffectiveness: {
      accommodation: string;
      effectiveness: number; // 0-1 scale
      userSatisfaction: number; // 0-1 scale
    }[];

    /**
     * Recommended adjustments
     */
    recommendedAdjustments: string[];
  };

  /**
   * Privacy and data controls
   */
  privacyControls: {
    /**
     * Data sharing preferences
     */
    dataSharing: {
      shareWithInstructor: boolean;
      shareWithInstitution: boolean;
      shareForResearch: boolean;
      shareForImprovement: boolean;
    };

    /**
     * Data retention settings
     */
    dataRetention: {
      retainBehavioralData: boolean;
      retainPerformanceData: boolean;
      anonymizeAfterCompletion: boolean;
    };

    /**
     * Export and download options
     */
    exportOptions: {
      personalReport: boolean;
      detailedAnalytics: boolean;
      rawDataExport: boolean;
    };
  };

  /**
   * Convert from domain entity
   * Transforms assessment session entity to API response format
   */
  static fromDomainEntity(
    session: any,
    options?: {
      includeDetailedAnalytics?: boolean;
      includeBehavioralData?: boolean;
      includeSystemMetrics?: boolean;
      privacyLevel?: 'minimal' | 'standard' | 'detailed';
    },
  ): AssessmentResponseDto {
    // Implementation will map domain entity data to DTO format
    // This is a placeholder structure for now
    return {
      sessionId: session.id?.getValue() || '',
      personId: session.personId?.getValue() || '',
      status: session.status || 'initializing',
      assessmentInfo: {
        assessmentType: session.assessmentType || 'comprehensive',
        targetCompetencies:
          session.targetCompetencies?.map((c: any) => c.getType()) || [],
        culturalContext: session.culturalContext || 'INTERNATIONAL',
        languagePreference: session.languagePreference || 'en',
        startTime: session.startTime?.toISOString() || new Date().toISOString(),
        maxDuration: session.maxDuration || 60,
        timeElapsed: 0, // Calculate from session data
        assessmentPurpose: session.assessmentPurpose || 'initial_evaluation',
      },
      currentProgress: {
        overallCompletion: 0, // Calculate from session data
        competencyLevels: {}, // Map from session competency assessments
        progressTrends: {
          improvementRate: 0,
          consistencyScore: 0,
          accelerationFactor: 0,
        },
      },
      behavioralInsights: {
        learningPatterns: {
          preferredLearningStyle: 'mixed',
          attentionSpan: 30,
          optimalTaskDifficulty: 'intermediate',
          helpSeekingBehavior: 'independent',
        },
        performanceIndicators: {
          consistency: 0.5,
          persistence: 0.5,
          strategicApproach: 0.5,
          selfRegulation: 0.5,
        },
        gamingDetection: {
          gamingRiskScore: 0,
          flaggedBehaviors: [],
          interventionRecommended: false,
          confidenceInAssessment: 1.0,
        },
        culturalAdaptation: {
          culturalAlignmentScore: 1.0,
          adaptationRecommendations: [],
          culturalFactorsInfluencing: [],
        },
      },
      nextRecommendations: {
        immediateActions: [],
        difficultyAdjustments: {},
        scaffoldingAdjustments: {},
        interventions: {},
        longTermGuidance: {
          strengthAreas: [],
          developmentAreas: [],
          careerAlignmentSuggestions: [],
          skillDevelopmentPriorities: [],
        },
      },
      systemMetrics: {
        dataQuality: {
          completenessScore: 1.0,
          consistencyScore: 1.0,
          reliabilityScore: 1.0,
        },
        sessionMetrics: {
          totalInteractions: 0,
          validInteractions: 0,
          flaggedInteractions: 0,
          averageResponseTime: 0,
          systemResponseTime: 0,
        },
        issues: {
          warnings: [],
          errors: [],
          systemAlerts: [],
        },
      },
      privacyControls: {
        dataSharing: {
          shareWithInstructor: true,
          shareWithInstitution: true,
          shareForResearch: false,
          shareForImprovement: true,
        },
        dataRetention: {
          retainBehavioralData: true,
          retainPerformanceData: true,
          anonymizeAfterCompletion: false,
        },
        exportOptions: {
          personalReport: true,
          detailedAnalytics: false,
          rawDataExport: false,
        },
      },
    };
  }
}
