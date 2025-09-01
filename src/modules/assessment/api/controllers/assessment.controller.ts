/**
 * Assessment Controller
 *
 * REST API controller for managing CCIS assessment sessions and interactions.
 * This controller provides comprehensive endpoints for assessment lifecycle
 * management, real-time progress tracking, and analytics retrieval.
 *
 * Key Features:
 * 1. **Session Management**: Start, monitor, and complete assessment sessions
 * 2. **Real-time Interaction**: Submit and process task interactions
 * 3. **Progress Tracking**: Retrieve current progress and analytics
 * 4. **Gaming Detection**: Monitor and respond to gaming patterns
 * 5. **Cultural Adaptation**: Support for multiple cultural contexts
 * 6. **Accessibility**: Comprehensive accessibility accommodation support
 *
 * Endpoints:
 * - POST /assessment/start - Start new assessment session
 * - POST /assessment/:id/interact - Submit task interaction
 * - PUT /assessment/:id/complete - Complete assessment session
 * - GET /assessment/:id - Get assessment session details
 * - GET /assessment/:id/live - Real-time session monitoring
 * - GET /assessment/person/:personId/progress - Get progress analytics
 *
 * @example
 * ```typescript
 * // Start assessment
 * POST /assessment/start
 * {
 *   "personId": "person-123",
 *   "assessmentType": "comprehensive",
 *   "culturalContext": "INDIA"
 * }
 *
 * // Submit interaction
 * POST /assessment/session-456/interact
 * {
 *   "taskId": "task-789",
 *   "interactionType": "task_attempt",
 *   "interactionData": { ... }
 * }
 * ```
 */

import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ValidationPipe,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
  ApiProduces,
} from '@nestjs/swagger';

// DTOs
import { StartAssessmentDto } from '../dtos/start-assessment.dto';
import { SubmitTaskInteractionDto } from '../dtos/submit-interaction.dto';
import { AssessmentResponseDto } from '../dtos/assessment-response.dto';
import { ProgressResponseDto } from '../dtos/progress-response.dto';

// Application Layer
import { AssessmentHandlers } from '../../application/handlers/assessment.handlers';
import { StartAssessmentCommand } from '../../application/commands/start-assessment.command';
import { SubmitTaskInteractionCommand } from '../../application/commands/submit-task-interaction.command';
import {
  GetCCISProgressQuery,
  TimeRange,
} from '../../application/queries/get-ccis-progress.query';

// Domain
import { PersonID } from '../../../../shared/value-objects/id.value-object';

// Guards and Auth
import { AssessmentAuthGuard } from '../guards/assessment-auth.guard';

@ApiTags('Assessment')
@Controller('assessment')
@ApiBearerAuth()
@UseGuards(AssessmentAuthGuard)
export class AssessmentController {
  private readonly logger = new Logger(AssessmentController.name);

  constructor(private readonly assessmentHandlers: AssessmentHandlers) {}

  /**
   * Start Assessment Session
   *
   * Initiates a new CCIS assessment session with adaptive configuration
   * based on learner profile, cultural context, and assessment objectives.
   */
  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Start new assessment session',
    description: `
      Initiates a comprehensive CCIS assessment session with the following features:
      
      **Core Capabilities:**
      - Adaptive difficulty adjustment based on learner profile
      - Cultural context integration (India, UAE, International)
      - Real-time behavioral signal collection
      - Gaming detection and prevention
      - Accessibility accommodation support
      
      **Assessment Types:**
      - **Comprehensive**: All 7 CCIS competencies (60-90 minutes)
      - **Targeted**: Specific competencies only (30-60 minutes)
      - **Progress**: Follow-up assessment for tracking (20-40 minutes)
      - **Remediation**: Focused improvement assessment (30-45 minutes)
      
      **Cultural Contexts:**
      - **INDIA**: Optimized for Indian educational and cultural context
      - **UAE**: Adapted for UAE multicultural environment
      - **INTERNATIONAL**: Global standard assessment approach
      
      **Accessibility Support:**
      - Screen reader compatibility
      - Extended time accommodations
      - Large text and high contrast options
      - Keyboard navigation support
      - Audio assistance for instructions
    `,
    operationId: 'startAssessment',
  })
  @ApiBody({
    type: StartAssessmentDto,
    description: 'Assessment configuration and parameters',
    examples: {
      comprehensive: {
        summary: 'Comprehensive Assessment',
        description: 'Full 7-competency assessment for new students',
        value: {
          personId: 'person-123',
          assessmentType: 'comprehensive',
          culturalContext: 'INDIA',
          languagePreference: 'en',
          maxDuration: 75,
          assessmentPurpose: 'initial_evaluation',
          accessibilityNeeds: ['extended_time'],
          metadata: {
            tags: ['new_student', 'engineering'],
            priority: 'normal',
          },
        },
      },
      targeted: {
        summary: 'Targeted Assessment',
        description: 'Focus on specific competencies for skill improvement',
        value: {
          personId: 'person-456',
          assessmentType: 'targeted',
          targetCompetencies: ['communication', 'teamwork', 'leadership'],
          culturalContext: 'UAE',
          languagePreference: 'en',
          maxDuration: 45,
          assessmentPurpose: 'progress_tracking',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Assessment session created successfully',
    type: AssessmentResponseDto,
    example: {
      sessionId: 'session-789',
      personId: 'person-123',
      status: 'initializing',
      assessmentInfo: {
        assessmentType: 'comprehensive',
        targetCompetencies: [
          'communication',
          'problem_solving',
          'teamwork',
          'adaptability',
          'time_management',
          'technical_skills',
          'leadership',
        ],
        culturalContext: 'INDIA',
        startTime: '2025-09-01T10:00:00Z',
        maxDuration: 75,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid assessment parameters or validation errors',
    example: {
      statusCode: 400,
      message: [
        'Person ID is required',
        'Assessment type must be one of: comprehensive, targeted, progress, remediation',
      ],
      error: 'Bad Request',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Person not found or inactive',
    example: {
      statusCode: 404,
      message: 'Person with ID person-123 not found or inactive',
      error: 'Not Found',
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Active assessment session already exists for this person',
    example: {
      statusCode: 409,
      message: 'Person already has an active assessment session (session-456)',
      error: 'Conflict',
    },
  })
  async startAssessment(
    @Body(ValidationPipe) startAssessmentDto: StartAssessmentDto,
  ): Promise<AssessmentResponseDto> {
    try {
      this.logger.log(
        `Starting assessment for person: ${startAssessmentDto.personId}`,
      );

      // Validate DTO
      const validation = StartAssessmentDto.validate(startAssessmentDto);
      if (!validation.isValid) {
        throw new BadRequestException({
          message: validation.errors,
          error: 'Validation Failed',
        });
      }

      // Check business rules
      const businessValidation =
        StartAssessmentDto.validateBusinessRules(startAssessmentDto);
      if (!businessValidation.isValid) {
        throw new BadRequestException({
          message: businessValidation.errors,
          error: 'Business Rule Violation',
        });
      }

      // Log warnings for optimization
      if (businessValidation.warnings.length > 0) {
        this.logger.warn(
          `Assessment warnings: ${businessValidation.warnings.join(', ')}`,
        );
      }

      // Create assessment command
      const command = new StartAssessmentCommand(
        startAssessmentDto.toDomainData(),
      );

      // Execute command through application layer
      const assessmentSession =
        await this.assessmentHandlers.handleStartAssessment(command);

      // Convert to response DTO
      const response = AssessmentResponseDto.fromDomainEntity(
        assessmentSession,
        {
          includeDetailedAnalytics: false,
          includeBehavioralData: false,
          includeSystemMetrics: true,
          privacyLevel: 'standard',
        },
      );

      this.logger.log(`Assessment started successfully: ${response.sessionId}`);
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to start assessment: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException({
        message: 'Failed to start assessment session',
        error: 'Internal Server Error',
      });
    }
  }

  /**
   * Submit Task Interaction
   *
   * Records task interaction data during an assessment session for
   * real-time CCIS calculation and behavioral analysis.
   */
  @Post(':sessionId/interact')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit task interaction data',
    description: `
      Records comprehensive task interaction data for real-time CCIS assessment:
      
      **Behavioral Signal Collection:**
      - Task completion patterns and strategies
      - Help-seeking behavior and hint usage
      - Error patterns and recovery strategies
      - Time allocation and pacing
      - Self-assessment and confidence indicators
      
      **Gaming Detection:**
      - Rapid clicking or automated behavior detection
      - Copy-paste and external resource monitoring
      - Pattern recognition gaming identification
      - Answer changing behavior analysis
      - Timing anomaly detection
      
      **Cultural Adaptation:**
      - Context-aware interaction interpretation
      - Cultural learning style accommodation
      - Communication preference adaptation
      
      **Real-time Processing:**
      - Immediate CCIS level updates
      - Adaptive difficulty adjustment
      - Scaffolding modification
      - Intervention trigger evaluation
    `,
    operationId: 'submitTaskInteraction',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Assessment session identifier',
    example: 'session-789',
  })
  @ApiBody({
    type: SubmitTaskInteractionDto,
    description: 'Task interaction data and behavioral signals',
    examples: {
      taskAttempt: {
        summary: 'Task Attempt Interaction',
        description: 'Complete task attempt with behavioral signals',
        value: {
          sessionId: 'session-789',
          taskId: 'task-456',
          interactionType: 'task_attempt',
          competencyType: 'communication',
          startTime: '2025-09-01T10:15:00Z',
          endTime: '2025-09-01T10:22:00Z',
          duration: 420000,
          interactionData: {
            responses: ['answer1', 'answer2'],
            completionStatus: 'completed',
            qualityIndicators: { accuracy: 0.85, completeness: 1.0 },
          },
          behavioralSignals: {
            hintsUsed: 1,
            errorsCommitted: 2,
            selfCorrectedErrors: 1,
            confidencePrediction: 0.7,
            confidenceActual: 0.8,
          },
          metadata: {
            taskDifficulty: 'intermediate',
            scaffoldingLevel: 2,
            priorAttempts: 0,
            culturalContext: 'INDIA',
            languagePreference: 'en',
          },
        },
      },
      hintRequest: {
        summary: 'Hint Request Interaction',
        description: 'Help-seeking behavior with strategic context',
        value: {
          sessionId: 'session-789',
          taskId: 'task-456',
          interactionType: 'hint_request',
          competencyType: 'problem_solving',
          startTime: '2025-09-01T10:18:00Z',
          behavioralSignals: {
            hintTypes: ['strategic'],
            helpSeekingBehavior: {
              resourcesAccessed: ['help_documentation'],
              peersConsulted: false,
            },
          },
          metadata: {
            taskDifficulty: 'advanced',
            scaffoldingLevel: 1,
            priorAttempts: 1,
            culturalContext: 'INDIA',
            languagePreference: 'en',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Interaction recorded successfully with updated assessment state',
    type: AssessmentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid interaction data or validation errors',
  })
  @ApiResponse({
    status: 404,
    description: 'Assessment session not found or inactive',
  })
  async submitTaskInteraction(
    @Param('sessionId') sessionId: string,
    @Body(ValidationPipe) submitInteractionDto: SubmitTaskInteractionDto,
  ): Promise<AssessmentResponseDto> {
    try {
      this.logger.log(`Submitting interaction for session: ${sessionId}`);

      // Validate DTO
      const validation =
        SubmitTaskInteractionDto.validate(submitInteractionDto);
      if (!validation.isValid) {
        throw new BadRequestException({
          message: validation.errors,
          error: 'Validation Failed',
        });
      }

      // Verify session ID consistency
      if (submitInteractionDto.sessionId !== sessionId) {
        throw new BadRequestException({
          message: 'Session ID in URL does not match session ID in body',
          error: 'Session ID Mismatch',
        });
      }

      // Create submission command
      const command = new SubmitTaskInteractionCommand(
        submitInteractionDto.toDomainData(),
      );

      // Execute command through application layer
      const updatedSession =
        await this.assessmentHandlers.handleSubmitTaskInteraction(command);

      // Convert to response DTO with real-time updates
      const response = AssessmentResponseDto.fromDomainEntity(updatedSession, {
        includeDetailedAnalytics: true,
        includeBehavioralData: true,
        includeSystemMetrics: true,
        privacyLevel: 'standard',
      });

      this.logger.log(
        `Interaction submitted successfully for session: ${sessionId}`,
      );
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to submit interaction: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException({
        message: 'Failed to process task interaction',
        error: 'Internal Server Error',
      });
    }
  }

  /**
   * Complete Assessment Session
   *
   * Finalizes an assessment session and generates comprehensive results.
   */
  @Put(':sessionId/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete assessment session',
    description:
      'Finalizes assessment session and generates comprehensive CCIS results with recommendations',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Assessment session identifier to complete',
  })
  @ApiResponse({
    status: 200,
    description: 'Assessment completed successfully with final results',
    type: AssessmentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Assessment session not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Assessment session already completed or in invalid state',
  })
  async completeAssessment(
    @Param('sessionId') sessionId: string,
  ): Promise<AssessmentResponseDto> {
    try {
      this.logger.log(`Completing assessment session: ${sessionId}`);

      // TODO: Implement complete assessment command
      // const command = new CompleteAssessmentCommand({ sessionId });
      // const completedSession = await this.assessmentHandlers.handleCompleteAssessment(command);

      // Placeholder response
      throw new InternalServerErrorException(
        'Complete assessment not yet implemented',
      );
    } catch (error) {
      this.logger.error(
        `Failed to complete assessment: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get Assessment Session Details
   *
   * Retrieves current assessment session information and progress.
   */
  @Get(':sessionId')
  @ApiOperation({
    summary: 'Get assessment session details',
    description:
      'Retrieves comprehensive assessment session information including current progress and analytics',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Assessment session identifier',
  })
  @ApiQuery({
    name: 'includeAnalytics',
    required: false,
    type: 'boolean',
    description: 'Include detailed behavioral analytics',
  })
  @ApiQuery({
    name: 'includeBehavioralData',
    required: false,
    type: 'boolean',
    description: 'Include behavioral signal data',
  })
  @ApiResponse({
    status: 200,
    description: 'Assessment session details retrieved successfully',
    type: AssessmentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Assessment session not found',
  })
  async getAssessmentSession(
    @Param('sessionId') sessionId: string,
    @Query('includeAnalytics') includeAnalytics: boolean = false,
    @Query('includeBehavioralData') includeBehavioralData: boolean = false,
  ): Promise<AssessmentResponseDto> {
    try {
      this.logger.log(`Retrieving assessment session: ${sessionId}`);

      // TODO: Implement get assessment session query
      // const query = new GetAssessmentSessionQuery({ sessionId, includeAnalytics, includeBehavioralData });
      // const session = await this.assessmentHandlers.handleGetAssessmentSession(query);

      // Placeholder response
      throw new NotFoundException(`Assessment session ${sessionId} not found`);
    } catch (error) {
      this.logger.error(
        `Failed to retrieve assessment session: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get Real-time Assessment Data
   *
   * Provides live assessment session monitoring data.
   */
  @Get(':sessionId/live')
  @ApiOperation({
    summary: 'Get real-time assessment data',
    description: 'Provides live monitoring data for active assessment sessions',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Assessment session identifier',
  })
  @ApiResponse({
    status: 200,
    description: 'Real-time assessment data retrieved successfully',
  })
  async getLiveAssessmentData(
    @Param('sessionId') sessionId: string,
  ): Promise<any> {
    try {
      this.logger.log(`Retrieving live data for session: ${sessionId}`);

      // TODO: Implement live assessment data streaming
      // This would typically use Server-Sent Events or WebSocket
      throw new InternalServerErrorException(
        'Live assessment data not yet implemented',
      );
    } catch (error) {
      this.logger.error(
        `Failed to retrieve live assessment data: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get Person Progress Analytics
   *
   * Retrieves comprehensive CCIS progress and analytics for a person.
   */
  @Get('person/:personId/progress')
  @ApiOperation({
    summary: 'Get person progress analytics',
    description: `
      Retrieves comprehensive CCIS progress analytics including:
      
      **Progress Tracking:**
      - Current competency levels across all 7 CCIS areas
      - Progress trends and learning velocity
      - Milestone achievements and breakthroughs
      - Comparative peer and institutional analytics
      
      **Learning Insights:**
      - Learning patterns and preferences
      - Optimal task difficulty and modalities
      - Engagement and motivation metrics
      - Cultural adaptation effectiveness
      
      **Predictive Analytics:**
      - Projected competency development
      - Time-to-mastery estimates
      - Career readiness indicators
      - Intervention recommendations
      
      **Quality Metrics:**
      - Assessment data quality and reliability
      - Confidence intervals and validation scores
      - Gaming detection effectiveness
      - Measurement precision indicators
    `,
  })
  @ApiParam({
    name: 'personId',
    description: 'Person identifier for progress tracking',
  })
  @ApiQuery({
    name: 'includeHistorical',
    required: false,
    type: 'boolean',
    description: 'Include historical progress data and trends',
  })
  @ApiQuery({
    name: 'includeComparative',
    required: false,
    type: 'boolean',
    description: 'Include peer and institutional comparisons',
  })
  @ApiQuery({
    name: 'includePredictive',
    required: false,
    type: 'boolean',
    description: 'Include predictive analytics and projections',
  })
  @ApiQuery({
    name: 'timeRange',
    required: false,
    type: 'string',
    description: 'Time range for analytics (e.g., "30d", "90d", "1y")',
  })
  @ApiResponse({
    status: 200,
    description: 'Progress analytics retrieved successfully',
    type: ProgressResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Person not found or no assessment data available',
  })
  async getPersonProgress(
    @Param('personId') personId: string,
    @Query('includeHistorical') includeHistorical: boolean = false,
    @Query('includeComparative') includeComparative: boolean = false,
    @Query('includePredictive') includePredictive: boolean = false,
    @Query('timeRange') timeRange: string = '90d',
  ): Promise<ProgressResponseDto> {
    try {
      this.logger.log(`Retrieving progress for person: ${personId}`);

      // Parse time range string to TimeRange object
      const parsedTimeRange = this.parseTimeRange(timeRange);

      // Create progress query
      const query = new GetCCISProgressQuery({
        personId: PersonID.fromString(personId),
        includeDetailedHistory: includeHistorical,
        includeComparativeAnalytics: includeComparative,
        includePredictiveAnalytics: includePredictive,
        timeRange: parsedTimeRange,
      });

      // Execute query through application layer
      const progressData =
        await this.assessmentHandlers.handleGetCCISProgress(query);

      // Convert to response DTO
      const response = ProgressResponseDto.fromDomainData(
        personId,
        progressData.competencyProgress,
        progressData.analytics,
        {
          includeHistoricalData: includeHistorical,
          includeComparativeData: includeComparative,
          includePredictiveData: includePredictive,
          privacyLevel: 'standard',
        },
      );

      this.logger.log(`Progress analytics retrieved for person: ${personId}`);
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve progress: ${error.message}`,
        error.stack,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException({
        message: 'Failed to retrieve progress analytics',
        error: 'Internal Server Error',
      });
    }
  }

  /**
   * Delete Assessment Session
   *
   * Cancels and removes an assessment session (admin only).
   */
  @Delete(':sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete assessment session',
    description: 'Cancels and removes an assessment session (admin only)',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Assessment session identifier to delete',
  })
  @ApiResponse({
    status: 204,
    description: 'Assessment session deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Assessment session not found',
  })
  async deleteAssessmentSession(
    @Param('sessionId') sessionId: string,
  ): Promise<void> {
    try {
      this.logger.log(`Deleting assessment session: ${sessionId}`);

      // TODO: Implement delete assessment command
      // const command = new DeleteAssessmentCommand({ sessionId });
      // await this.assessmentHandlers.handleDeleteAssessment(command);

      throw new InternalServerErrorException(
        'Delete assessment not yet implemented',
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete assessment session: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Parse time range string to TimeRange object
   *
   * Supports formats:
   * - "30d" = last 30 days
   * - "90d" = last 90 days
   * - "1y" = last 1 year
   * - "custom" = requires start/end date query params
   */
  private parseTimeRange(timeRangeStr: string): {
    startDate: Date;
    endDate: Date;
  } {
    const now = new Date();
    const endDate = new Date(now);
    let startDate: Date;

    if (timeRangeStr.endsWith('d')) {
      // Days format: "30d", "90d"
      const days = parseInt(timeRangeStr.slice(0, -1));
      startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    } else if (timeRangeStr.endsWith('w')) {
      // Weeks format: "4w", "12w"
      const weeks = parseInt(timeRangeStr.slice(0, -1));
      startDate = new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);
    } else if (timeRangeStr.endsWith('m')) {
      // Months format: "3m", "6m"
      const months = parseInt(timeRangeStr.slice(0, -1));
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - months);
    } else if (timeRangeStr.endsWith('y')) {
      // Years format: "1y", "2y"
      const years = parseInt(timeRangeStr.slice(0, -1));
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - years);
    } else {
      // Default to 90 days
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate };
  }
}
