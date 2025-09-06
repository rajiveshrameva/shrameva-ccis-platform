import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Task } from '../../domain/entities/task.entity';

/**
 * Basic Task Response DTO
 * Standard response for task data
 */
export class TaskResponseDto {
  @ApiProperty({
    description: 'Task ID',
    example: 'cid_V1StGXR8_Z5jdHi6B-myT',
  })
  id: string;

  @ApiProperty({
    description: 'Task title',
    example: 'Client Email Crisis Response',
  })
  title: string;

  @ApiProperty({
    description: 'Task description',
    example:
      'Learn to handle difficult client communications with professionalism and clarity',
  })
  description: string;

  @ApiProperty({
    description: 'Expected duration in minutes',
    example: 5,
  })
  expectedDuration: number;

  @ApiProperty({
    description: 'Difficulty level (0.1-1.0)',
    example: 0.6,
  })
  difficultyLevel: number;

  @ApiProperty({
    description: 'Target CCIS level',
    example: 2,
  })
  targetCCISLevel: number;

  @ApiProperty({
    description: 'CCIS level range [min, max]',
    example: [1, 3],
  })
  ccisLevelRange: [number, number];

  @ApiProperty({
    description: 'Task type',
    example: 'MICRO_TASK',
  })
  taskType: string;

  @ApiProperty({
    description: 'Task category',
    example: 'EMAIL_WRITING',
  })
  taskCategory: string;

  @ApiProperty({
    description: 'Competency information',
    example: {
      id: 'cid_competency_id',
      name: 'Communication',
      description: 'Workplace communication skills',
    },
  })
  competency: {
    id: string;
    name?: string;
    description?: string;
  };

  @ApiProperty({
    description: 'Content blocks for task rendering',
    example: {
      instructions: {
        type: 'numbered_list',
        content: ['Step 1: Read the scenario', 'Step 2: Draft response'],
        formatting: 'markdown',
      },
    },
  })
  contentBlocks: Record<string, any>;

  @ApiProperty({
    description: 'Success criteria for completion',
    example: {
      passingThreshold: 0.7,
      criteria: [
        {
          id: 'email_tone',
          description: 'Professional and empathetic tone',
          weight: 0.4,
          type: 'ai_assessed',
        },
      ],
    },
  })
  successCriteria: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Task tags',
    type: [String],
    example: ['client_communication', 'crisis_management'],
  })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Industry scenario context',
    example: 'Based on real situations at Goldman Sachs',
  })
  industryScenario?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: string;

  @ApiProperty({
    description: 'Publication status',
    example: true,
  })
  isPublished: boolean;

  @ApiPropertyOptional({
    description: 'Average completion time from student data',
    example: 4.2,
  })
  averageCompletionTime?: number;

  @ApiPropertyOptional({
    description: 'Average success rate',
    example: 0.78,
  })
  averageSuccessRate?: number;

  @ApiPropertyOptional({
    description: 'Total attempts across all students',
    example: 156,
  })
  totalAttempts?: number;

  /**
   * Creates TaskResponseDto from domain entity
   */
  public static fromDomain(task: Task): TaskResponseDto {
    return {
      id: task.getId().getValue(),
      title: task.title,
      description: task.description,
      expectedDuration: task.expectedDuration.getValue(),
      difficultyLevel: task.difficultyLevel.getValue(),
      targetCCISLevel: task.targetCCISLevel,
      ccisLevelRange: task.ccisLevelRange,
      taskType: task.taskType.getValue(),
      taskCategory: task.taskCategory.getValue(),
      competency: {
        id: task.competencyId.getValue(),
        name: undefined, // Will be populated by service layer
        description: undefined,
      },
      contentBlocks: task.contentBlocks,
      successCriteria: task.successCriteria,
      tags: task.tags,
      industryScenario: task.industryScenario,
      createdAt: task.getCreatedAt().toISOString(),
      updatedAt: task.getUpdatedAt().toISOString(),
      isPublished: task.isAvailable(),
      averageCompletionTime: task.averageCompletionTime,
      averageSuccessRate: task.averageSuccessRate,
      totalAttempts: task.totalAttempts,
    };
  }
}

/**
 * Detailed Task Response DTO
 * Includes additional details for task editors/creators
 */
export class DetailedTaskResponseDto extends TaskResponseDto {
  @ApiProperty({
    description: 'Full task instructions',
    example: 'Step 1: Carefully read the client message below...',
  })
  instructions: string;

  @ApiProperty({
    description: 'Task context/scenario',
    example:
      'You are a junior analyst at TechCorp. A major client has raised concerns...',
  })
  context: string;

  @ApiProperty({
    description: 'Assessment rubric',
    example: {
      dimensions: [
        {
          id: 'communication_clarity',
          name: 'Communication Clarity',
          weight: 0.5,
          levels: [
            {
              score: 4,
              label: 'Excellent',
              description: 'Crystal clear communication',
            },
          ],
        },
      ],
    },
  })
  assessmentRubric: Record<string, any>;

  @ApiProperty({
    description: 'Adaptive hints by CCIS level',
    example: {
      level1: [
        {
          trigger: 'time_delay',
          delay: 10,
          content: 'Start by reading the client message carefully',
          type: 'step_by_step',
        },
      ],
      level2: [],
      level3: [],
      level4: [],
    },
  })
  hintsAvailable: Record<string, any>;

  @ApiProperty({
    description: 'Scaffolding configuration',
    example: {
      level1: {
        hintStrategy: 'proactive',
        triggerDelay: 10,
        detailLevel: 'high',
        maxHints: 3,
      },
    },
  })
  scaffoldingConfig: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Prerequisite task IDs',
    type: [String],
  })
  prerequisiteTasks?: string[];

  @ApiPropertyOptional({
    description: 'Follow-up task IDs',
    type: [String],
  })
  followUpTasks?: string[];

  @ApiPropertyOptional({
    description: 'Related task IDs',
    type: [String],
  })
  relatedTasks?: string[];

  @ApiPropertyOptional({
    description: 'Publication date',
    example: '2024-01-15T10:30:00Z',
  })
  publishedAt?: string;

  @ApiPropertyOptional({
    description: 'Last validation date',
    example: '2024-01-15T10:30:00Z',
  })
  lastValidationDate?: string;

  @ApiPropertyOptional({
    description: 'Content version',
    example: '1.2.0',
  })
  contentVersion?: string;

  /**
   * Creates DetailedTaskResponseDto from domain entity
   */
  public static fromDomain(task: Task): DetailedTaskResponseDto {
    const base = TaskResponseDto.fromDomain(task);
    return {
      ...base,
      instructions: task.instructions,
      context: task.context,
      assessmentRubric: task.assessmentRubric,
      hintsAvailable: task.hintsAvailable,
      scaffoldingConfig: task.scaffoldingConfig,
      prerequisiteTasks: task.prerequisiteTasks.map((id) => id.getValue()),
      followUpTasks: task.followUpTasks.map((id) => id.getValue()),
      relatedTasks: task.relatedTasks.map((id) => id.getValue()),
      publishedAt: task.publishedAt?.toISOString(),
      lastValidationDate: task.lastValidationDate?.toISOString(),
      contentVersion: task.contentVersion,
    };
  }
}

/**
 * Task Completion Response DTO
 * Returned after student submits a task
 */
export class TaskCompletionResponseDto {
  @ApiProperty({
    description: 'Whether the task was completed successfully',
    example: true,
  })
  isSuccessful: boolean;

  @ApiProperty({
    description: 'Quality level of completion',
    example: 'GOOD',
  })
  qualityLevel: string;

  @ApiProperty({
    description: 'Overall score (0.0-1.0)',
    example: 0.82,
  })
  score: number;

  @ApiProperty({
    description: 'Detailed rubric scores',
    example: {
      totalScore: 0.82,
      dimensionScores: {
        communication_clarity: 0.9,
        professionalism: 0.8,
        problem_solving: 0.75,
      },
    },
  })
  rubricScore: Record<string, any>;

  @ApiProperty({
    description: 'Success criteria evaluation',
    example: {
      score: 0.85,
      passedCriteria: ['email_tone', 'response_structure'],
      failedCriteria: [],
    },
  })
  criteriaScore: Record<string, any>;

  @ApiProperty({
    description: 'Personalized feedback for the student',
    example:
      'Excellent work on maintaining a professional tone. Consider being more specific in your proposed solutions.',
  })
  feedback: string;

  @ApiProperty({
    description: 'Behavioral signals collected',
    example: {
      timeSpent: 298,
      hintsRequested: 1,
      attempts: 1,
      confidenceRating: 4,
    },
  })
  behavioralSignals: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Recommended next tasks',
    type: [String],
  })
  nextRecommendations?: string[];

  @ApiPropertyOptional({
    description: 'CCIS level progression impact',
    example: {
      competencyId: 'communication',
      levelBefore: 2.1,
      levelAfter: 2.3,
      progressMade: 0.2,
    },
  })
  ccisImpact?: Record<string, any>;

  /**
   * Creates TaskCompletionResponseDto from domain assessment
   */
  public static fromDomain(assessment: any): TaskCompletionResponseDto {
    return {
      isSuccessful: assessment.isSuccessful,
      qualityLevel: assessment.qualityLevel,
      score: assessment.criteriaScore.score,
      rubricScore: assessment.rubricScore,
      criteriaScore: assessment.criteriaScore,
      feedback: assessment.feedback,
      behavioralSignals: assessment.behavioralSignals,
      nextRecommendations: undefined, // Will be populated by service
      ccisImpact: undefined, // Will be populated by service
    };
  }
}

/**
 * Hint Response DTO
 * Returned when student requests a hint
 */
export class HintResponseDto {
  @ApiProperty({
    description: 'Hint content',
    example:
      "Consider starting your email with an acknowledgment of the client's concerns",
  })
  content: string;

  @ApiProperty({
    description: 'Detail level of the hint',
    example: 'medium',
  })
  detailLevel: string;

  @ApiProperty({
    description: 'Type of hint provided',
    example: 'strategic_question',
  })
  type: string;

  @ApiProperty({
    description: 'When the next hint will be available (seconds)',
    example: 30,
  })
  nextHintTiming: number;

  @ApiPropertyOptional({
    description: "Whether this hint is adapted for the student's CCIS level",
    example: true,
  })
  isAdaptive?: boolean;

  @ApiPropertyOptional({
    description: 'Remaining hints available',
    example: 2,
  })
  hintsRemaining?: number;

  /**
   * Creates HintResponseDto from domain hint response
   */
  public static fromDomain(hintResponse: any): HintResponseDto {
    return {
      content: hintResponse.content,
      detailLevel: hintResponse.detailLevel,
      type: hintResponse.type,
      nextHintTiming: hintResponse.nextHintTiming,
      isAdaptive: true,
      hintsRemaining: undefined, // Will be calculated by service
    };
  }
}

/**
 * Task Recommendation Response DTO
 * Used for recommended tasks for students
 */
export class TaskRecommendationDto {
  @ApiProperty({
    description: 'Recommended task',
    type: TaskResponseDto,
  })
  task: TaskResponseDto;

  @ApiProperty({
    description: 'Recommendation strength (0.0-1.0)',
    example: 0.87,
  })
  score: number;

  @ApiProperty({
    description: 'Reason for recommendation',
    example:
      'This task matches your current CCIS level and builds on recently completed skills',
  })
  reason: string;

  @ApiPropertyOptional({
    description: 'Estimated completion time for this student',
    example: 6.2,
  })
  estimatedDuration?: number;

  @ApiPropertyOptional({
    description: 'Expected difficulty for this student',
    example: 0.65,
  })
  expectedDifficulty?: number;

  @ApiPropertyOptional({
    description: 'Priority ranking among recommendations',
    example: 1,
  })
  priority?: number;

  /**
   * Creates TaskRecommendationDto from domain recommendation
   */
  public static fromDomain(recommendation: any): TaskRecommendationDto {
    return {
      task: TaskResponseDto.fromDomain(recommendation.task),
      score: recommendation.score,
      reason: recommendation.reason,
      estimatedDuration: recommendation.estimatedDuration,
      expectedDifficulty: recommendation.expectedDifficulty,
      priority: undefined, // Will be set by service
    };
  }
}

/**
 * Task Analytics Response DTO
 * Analytics data for task performance
 */
export class TaskAnalyticsDto {
  @ApiProperty({
    description: 'Task ID',
    example: 'cid_task_id',
  })
  taskId: string;

  @ApiProperty({
    description: 'Engagement metrics',
    example: {
      totalAttempts: 156,
      uniqueStudents: 89,
      completionRate: 0.78,
      averageTimeSpent: 4.2,
      abandonmentRate: 0.12,
    },
  })
  engagementMetrics: Record<string, any>;

  @ApiProperty({
    description: 'Learning outcome metrics',
    example: {
      averageScore: 0.82,
      passRate: 0.78,
      excellentRate: 0.34,
      improvementRate: 0.23,
    },
  })
  learningOutcomes: Record<string, any>;

  @ApiProperty({
    description: 'Quality metrics',
    example: {
      discriminationIndex: 0.67,
      difficultyAccuracy: 0.91,
      contentRelevance: 0.88,
    },
  })
  qualityMetrics: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Hint usage patterns',
    example: {
      averageHintsRequested: 1.2,
      hintEffectiveness: 0.73,
      levelDistribution: {
        level1: 0.45,
        level2: 0.32,
        level3: 0.18,
        level4: 0.05,
      },
    },
  })
  hintUsagePatterns?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Detected quality issues',
    type: [Object],
    example: [
      {
        type: 'LOW_DISCRIMINATION',
        severity: 'MEDIUM',
        description: 'Task may not effectively distinguish skill levels',
      },
    ],
  })
  qualityIssues?: Array<{
    type: string;
    severity: string;
    description: string;
  }>;

  @ApiProperty({
    description: 'Analysis timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  generatedAt: string;

  /**
   * Creates TaskAnalyticsDto from domain analytics
   */
  public static fromDomain(analytics: any): TaskAnalyticsDto {
    return {
      taskId: analytics.taskId,
      engagementMetrics: analytics.engagementMetrics,
      learningOutcomes: analytics.learningOutcomes,
      qualityMetrics: analytics.qualityMetrics,
      hintUsagePatterns: analytics.hintUsagePatterns,
      qualityIssues: analytics.qualityIssues,
      generatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Difficulty Calibration Response DTO
 * Response for difficulty calibration operations
 */
export class DifficultyCalibrationDto {
  @ApiProperty({
    description: 'Task ID',
    example: 'cid_task_id',
  })
  taskId: string;

  @ApiProperty({
    description: 'Previous difficulty level',
    example: 0.6,
  })
  previousDifficulty: number;

  @ApiProperty({
    description: 'New calibrated difficulty level',
    example: 0.68,
  })
  newDifficulty: number;

  @ApiProperty({
    description: 'Calibration drift amount',
    example: 0.08,
  })
  calibrationDrift: number;

  @ApiProperty({
    description: 'Confidence in calibration',
    example: 0.92,
  })
  confidence: number;

  @ApiProperty({
    description: 'Sample size used for calibration',
    example: 47,
  })
  sampleSize: number;

  @ApiPropertyOptional({
    description: 'Calibration recommendations',
    type: [String],
    example: [
      'Consider adjusting hint timing',
      'Review success criteria clarity',
    ],
  })
  recommendations?: string[];

  @ApiProperty({
    description: 'Calibration timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  calibratedAt: string;

  /**
   * Creates DifficultyCalibrationDto from domain calibration
   */
  public static fromDomain(calibration: any): DifficultyCalibrationDto {
    return {
      taskId: calibration.taskId,
      previousDifficulty: calibration.previousDifficulty,
      newDifficulty: calibration.newDifficulty,
      calibrationDrift: calibration.calibrationDrift,
      confidence: calibration.confidence,
      sampleSize: calibration.sampleSize,
      recommendations: calibration.recommendations,
      calibratedAt: new Date().toISOString(),
    };
  }
}

/**
 * Paginated Response DTO
 * Generic paginated response wrapper
 */
export class PaginatedResponse<T> {
  @ApiProperty({ description: 'Page data' })
  data: T[];

  @ApiProperty({ description: 'Total items count' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  pageSize: number;

  @ApiProperty({ description: 'Total pages' })
  totalPages: number;

  @ApiProperty({ description: 'Has next page' })
  hasNext: boolean;

  @ApiProperty({ description: 'Has previous page' })
  hasPrevious: boolean;

  constructor(data: T[], total: number, page: number, pageSize: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.pageSize = pageSize;
    this.totalPages = Math.ceil(total / pageSize);
    this.hasNext = page < this.totalPages;
    this.hasPrevious = page > 1;
  }
}
