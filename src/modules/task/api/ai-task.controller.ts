import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AITaskGenerationService } from '../infrastructure/services/ai-task-generation.service';
import { LearningPathService } from '../infrastructure/services/learning-path.service';
import { AdvancedAnalyticsService } from '../infrastructure/services/advanced-analytics.service';

/**
 * AI-Powered Task Management Controller
 *
 * Provides endpoints for AI task generation, learning path management,
 * and advanced analytics for personalized learning experiences.
 */
@ApiTags('AI Task Management')
@Controller('ai-tasks')
export class AITaskController {
  private readonly logger = new Logger(AITaskController.name);

  constructor(
    private readonly aiTaskGeneration: AITaskGenerationService,
    private readonly learningPath: LearningPathService,
    private readonly analytics: AdvancedAnalyticsService,
  ) {}

  /**
   * Generate personalized AI task
   */
  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate AI-powered personalized task',
    description:
      'Creates a personalized task using Claude 3.5 Sonnet based on student profile and competency goals.',
  })
  @ApiResponse({
    status: 201,
    description: 'Task generated successfully',
    schema: {
      type: 'object',
      properties: {
        task: { type: 'object', description: 'Generated task entity' },
        personalizationInsights: {
          type: 'object',
          description: 'AI personalization insights',
        },
        qualityMetrics: {
          type: 'object',
          description: 'Task quality assessment',
        },
        adaptationRecommendations: {
          type: 'array',
          description: 'Recommendations for task adaptation',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  @ApiResponse({ status: 500, description: 'AI service error' })
  async generatePersonalizedTask(
    @Body()
    request: {
      personId: string;
      competencyId: string;
      targetCCISLevel: number;
      studentProfile: {
        currentCCISLevel?: number;
        learningStyle?: string;
        industryInterest?: string;
        culturalContext?: string;
        timeConstraints?: number;
        difficultyPreference?: 'adaptive' | 'challenging' | 'supportive';
      };
      taskPreferences?: {
        taskType?: 'micro' | 'fusion' | 'assessment';
        includeIndustryContext?: boolean;
        includeTransferElements?: boolean;
        estimatedDuration?: number;
      };
      qualityRequirements?: {
        minQualityScore?: number;
        requiresValidation?: boolean;
        includeAlternatives?: boolean;
      };
    },
  ) {
    try {
      this.logger.log(
        `Generating personalized task for person ${request.personId}, competency ${request.competencyId}`,
      );

      const result = await this.aiTaskGeneration.generatePersonalizedTask({
        competencyId: request.competencyId,
        ccisLevel: request.targetCCISLevel,
        studentProfile: {
          personId: request.personId,
          learningStyle: request.studentProfile.learningStyle,
          industryInterest: request.studentProfile.industryInterest,
          currentSkillGaps: [], // TODO: Map from request
          performanceHistory: {}, // TODO: Fetch from database
        },
        taskType: request.taskPreferences?.taskType || 'micro',
        taskCategory: 'general', // TODO: Map from competency
        context: {
          previousTasks: [], // TODO: Fetch from database
          strugglingAreas: [], // TODO: Map from request
          preferredDifficulty:
            request.studentProfile.difficultyPreference === 'challenging'
              ? 0.8
              : request.studentProfile.difficultyPreference === 'supportive'
                ? 0.3
                : 0.5,
        },
      });

      return {
        success: true,
        data: result,
        message: 'AI task generated successfully',
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate personalized task: ${error.message}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Generate task sequence for learning progression
   */
  @Post('generate-sequence')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate AI-powered task sequence',
    description:
      'Creates a progressive sequence of tasks for skill development with adaptive difficulty.',
  })
  @ApiResponse({
    status: 201,
    description: 'Task sequence generated successfully',
    schema: {
      type: 'object',
      properties: {
        sequence: { type: 'array', description: 'Ordered task sequence' },
        adaptationPlan: {
          type: 'object',
          description: 'Sequence adaptation strategy',
        },
        progressionAnalysis: {
          type: 'object',
          description: 'Skill progression insights',
        },
      },
    },
  })
  async generateTaskSequence(
    @Body()
    request: {
      competencyIds: string[];
      targetCCISLevel: number;
      studentProfile: any;
      sequenceLength: number;
      difficultyProgression: 'linear' | 'adaptive' | 'spiral';
      includeCheckpoints?: boolean;
      transferLearningGoals?: string[];
    },
  ) {
    try {
      this.logger.log(
        `Generating task sequence for competencies: ${request.competencyIds.join(', ')}`,
      );

      const result = await this.aiTaskGeneration.generateTaskSequence(request);

      return {
        success: true,
        data: result,
        message: 'Task sequence generated successfully',
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate task sequence: ${error.message}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Generate transfer learning variations
   */
  @Post('generate-transfer-variations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate transfer learning task variations',
    description:
      'Creates task variations for cross-competency skill transfer and application.',
  })
  async generateTransferVariations(
    @Body()
    request: {
      baseTaskId: string;
      sourceCompetency: string;
      targetCompetencies: string[];
      transferType: 'near' | 'far' | 'creative';
      variationCount: number;
      complexityLevel: number;
      industryContexts?: string[];
    },
  ) {
    try {
      this.logger.log(
        `Generating transfer variations for task ${request.baseTaskId}`,
      );

      // TODO: Fetch base task from database
      const baseTaskId = request.baseTaskId;

      // Generate variations array from request
      const variations = Array.from(
        { length: request.variationCount },
        (_, index) => ({
          industryContext:
            request.industryContexts?.[
              index % (request.industryContexts?.length || 1)
            ],
          complexityLevel: request.complexityLevel,
          culturalContext: `variation_${index + 1}`,
          timeConstraint: 30, // Default 30 minutes
        }),
      );

      const result = await this.aiTaskGeneration.generateTransferVariations(
        baseTaskId,
        variations,
      );

      return {
        success: true,
        data: result,
        message: 'Transfer variations generated successfully',
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate transfer variations: ${error.message}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Create personalized learning path
   */
  @Post('learning-path')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create AI-powered learning path',
    description:
      'Generates a personalized learning path with adaptive milestones and AI-generated tasks.',
  })
  @ApiResponse({
    status: 201,
    description: 'Learning path created successfully',
    schema: {
      type: 'object',
      properties: {
        pathId: {
          type: 'string',
          description: 'Unique learning path identifier',
        },
        milestones: {
          type: 'array',
          description: 'Adaptive learning milestones',
        },
        adaptationPlan: {
          type: 'object',
          description: 'Path adaptation strategy',
        },
        estimatedCompletion: {
          type: 'string',
          format: 'date-time',
          description: 'Estimated completion date',
        },
      },
    },
  })
  async createLearningPath(
    @Body()
    request: {
      personId: string;
      competencyFocus: string[];
      targetCCISLevel: number;
      estimatedDuration: number;
      studentProfile: {
        learningStyle?: string;
        currentCCISLevels?: Record<string, number>;
        industryInterest?: string;
        timeAvailability?: number;
        preferredDifficulty?: 'gentle' | 'moderate' | 'challenging';
      };
      preferences?: {
        difficultyProgression?: 'linear' | 'adaptive' | 'spiral';
        includeTransferTasks?: boolean;
        includeIndustryScenarios?: boolean;
        checkpointFrequency?: number;
      };
    },
  ) {
    try {
      this.logger.log(`Creating learning path for person ${request.personId}`);

      const result = await this.learningPath.createPersonalizedPath(request);

      return {
        success: true,
        data: result,
        message: 'Learning path created successfully',
        createdAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to create learning path: ${error.message}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Adapt learning path based on performance
   */
  @Patch('learning-path/:pathId/adapt')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Adapt learning path based on performance',
    description:
      'Adjusts learning path milestones and difficulty based on student performance data.',
  })
  @ApiParam({ name: 'pathId', description: 'Learning path identifier' })
  async adaptLearningPath(
    @Param('pathId') pathId: string,
    @Body()
    performanceData: {
      recentTaskResults: Array<{
        taskId: string;
        competencyId: string;
        score: number;
        timeSpent: number;
        hintsUsed: number;
        difficulty: number;
      }>;
      strugglingAreas: string[];
      acceleratedAreas: string[];
      engagementMetrics: {
        sessionFrequency: number;
        averageSessionLength: number;
        dropoffRisk: number;
      };
    },
  ) {
    try {
      this.logger.log(`Adapting learning path ${pathId}`);

      const result = await this.learningPath.adaptPath(pathId, performanceData);

      return {
        success: true,
        data: result,
        message: 'Learning path adapted successfully',
        adaptedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to adapt learning path: ${error.message}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Track learning progress
   */
  @Post('learning-path/:pathId/progress')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Track learning path progress',
    description:
      'Records progress and generates recommendations for next steps.',
  })
  @ApiParam({ name: 'pathId', description: 'Learning path identifier' })
  async trackProgress(
    @Param('pathId') pathId: string,
    @Body()
    progressUpdate: {
      milestoneId: string;
      taskId: string;
      completionData: {
        score: number;
        timeSpent: number;
        hintsUsed: number;
        attempts: number;
      };
      behavioralSignals: any;
    },
  ) {
    try {
      this.logger.log(`Tracking progress for path ${pathId}`);

      const result = await this.learningPath.trackProgress(
        pathId,
        progressUpdate,
      );

      return {
        success: true,
        data: result,
        message: 'Progress tracked successfully',
        trackedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to track progress: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Generate comprehensive competency analytics
   */
  @Post('analytics/competency')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate competency analytics',
    description:
      'Provides comprehensive analytics for competency development and skill transfer.',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics generated successfully',
    schema: {
      type: 'object',
      properties: {
        competencyProgress: {
          type: 'object',
          description: 'Competency development metrics',
        },
        skillTransferAnalysis: {
          type: 'object',
          description: 'Cross-competency transfer insights',
        },
        predictiveInsights: {
          type: 'object',
          description: 'AI-powered predictions',
        },
        benchmarkComparisons: {
          type: 'object',
          description: 'Peer and industry comparisons',
        },
        recommendedInterventions: {
          type: 'array',
          description: 'Personalized intervention recommendations',
        },
      },
    },
  })
  async generateCompetencyAnalytics(
    @Body()
    request: {
      personId?: string;
      cohortId?: string;
      competencyIds: string[];
      timeRange: {
        startDate: string;
        endDate: string;
      };
      analysisType: 'individual' | 'cohort' | 'comparative';
      granularity: 'daily' | 'weekly' | 'monthly';
    },
  ) {
    try {
      this.logger.log(
        `Generating competency analytics for ${request.analysisType} analysis`,
      );

      const timeRange = {
        startDate: new Date(request.timeRange.startDate),
        endDate: new Date(request.timeRange.endDate),
      };

      const result = await this.analytics.generateCompetencyAnalytics({
        ...request,
        timeRange,
      });

      return {
        success: true,
        data: result,
        message: 'Competency analytics generated successfully',
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate competency analytics: ${error.message}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Generate cross-competency analysis
   */
  @Post('analytics/cross-competency')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate cross-competency analysis',
    description:
      'Analyzes skill transfer patterns and competency interactions.',
  })
  async generateCrossCompetencyAnalysis(
    @Body()
    request: {
      personId: string;
      primaryCompetency: string;
      timeRange: {
        startDate: string;
        endDate: string;
      };
      analysisDepth: 'surface' | 'deep' | 'comprehensive';
    },
  ) {
    try {
      this.logger.log(
        `Generating cross-competency analysis for ${request.primaryCompetency}`,
      );

      const timeRange = {
        startDate: new Date(request.timeRange.startDate),
        endDate: new Date(request.timeRange.endDate),
      };

      const result = await this.analytics.generateCrossCompetencyAnalysis({
        ...request,
        timeRange,
      });

      return {
        success: true,
        data: result,
        message: 'Cross-competency analysis generated successfully',
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate cross-competency analysis: ${error.message}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Generate learning path analytics
   */
  @Get('analytics/learning-path/:pathId')
  @ApiOperation({
    summary: 'Generate learning path analytics',
    description:
      'Provides detailed analytics for learning path efficiency and effectiveness.',
  })
  @ApiParam({ name: 'pathId', description: 'Learning path identifier' })
  @ApiQuery({
    name: 'personId',
    description: 'Person identifier',
    required: true,
  })
  @ApiQuery({
    name: 'analysisType',
    description: 'Type of analysis',
    enum: ['efficiency', 'effectiveness', 'engagement', 'comprehensive'],
    required: false,
  })
  @ApiQuery({
    name: 'includeComparisons',
    description: 'Include peer comparisons',
    type: 'boolean',
    required: false,
  })
  async generateLearningPathAnalytics(
    @Param('pathId') pathId: string,
    @Query('personId') personId: string,
    @Query('analysisType')
    analysisType:
      | 'efficiency'
      | 'effectiveness'
      | 'engagement'
      | 'comprehensive' = 'comprehensive',
    @Query('includeComparisons') includeComparisons: boolean = false,
  ) {
    try {
      this.logger.log(`Generating learning path analytics for path ${pathId}`);

      const result = await this.analytics.generateLearningPathAnalytics({
        pathId,
        personId,
        analysisType,
        includeComparisons,
      });

      return {
        success: true,
        data: result,
        message: 'Learning path analytics generated successfully',
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate learning path analytics: ${error.message}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Generate predictive modeling analytics
   */
  @Post('analytics/predictive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate predictive modeling analytics',
    description:
      'Provides AI-powered predictions for skill progression and learning outcomes.',
  })
  async generatePredictiveAnalytics(
    @Body()
    request: {
      personId: string;
      predictionHorizon: number;
      predictionTypes: (
        | 'skill_progression'
        | 'completion_likelihood'
        | 'intervention_needs'
        | 'career_readiness'
      )[];
      confidenceLevel: number;
    },
  ) {
    try {
      this.logger.log(
        `Generating predictive analytics for person ${request.personId}`,
      );

      const result =
        await this.analytics.generatePredictiveModelingAnalytics(request);

      return {
        success: true,
        data: result,
        message: 'Predictive analytics generated successfully',
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate predictive analytics: ${error.message}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Generate cohort analytics
   */
  @Post('analytics/cohort')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate cohort analytics',
    description:
      'Provides comprehensive analytics for cohort performance and comparisons.',
  })
  async generateCohortAnalytics(
    @Body()
    request: {
      cohortId: string;
      comparisonCohorts?: string[];
      analysisMetrics: (
        | 'progression_rates'
        | 'skill_gaps'
        | 'intervention_effectiveness'
        | 'outcome_prediction'
      )[];
      segmentationCriteria?: any;
    },
  ) {
    try {
      this.logger.log(
        `Generating cohort analytics for cohort ${request.cohortId}`,
      );

      const result = await this.analytics.generateCohortAnalytics(request);

      return {
        success: true,
        data: result,
        message: 'Cohort analytics generated successfully',
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate cohort analytics: ${error.message}`,
        error,
      );
      throw error;
    }
  }
}
