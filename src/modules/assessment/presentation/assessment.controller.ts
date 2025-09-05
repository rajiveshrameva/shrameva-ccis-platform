import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { AssessmentService } from '../application/assessment.service';
import {
  CreateAssessmentRequestDto,
  AssessmentResponseDto,
  AssessmentSummaryDto,
  HumanReviewRequestDto,
  AssessmentQueryDto,
} from '../application/dtos/assessment.dto';

/**
 * Assessment Controller
 *
 * REST API endpoints for the assessment domain.
 * Provides CRUD operations and specialized assessment workflows.
 */
@Controller('api/v1/assessments')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  /**
   * Create a new assessment using AI-powered CCIS determination
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAssessment(
    @Body(ValidationPipe) request: CreateAssessmentRequestDto,
  ): Promise<AssessmentResponseDto> {
    return this.assessmentService.createAssessment(request);
  }

  /**
   * Get assessment by ID
   */
  @Get(':id')
  async getAssessment(@Param('id') id: string): Promise<AssessmentResponseDto> {
    return this.assessmentService.getAssessmentById(id);
  }

  /**
   * Get assessments for a person
   */
  @Get('person/:personId')
  async getAssessmentsForPerson(
    @Param('personId') personId: string,
    @Query('competencyType') competencyType?: string,
  ): Promise<AssessmentSummaryDto[]> {
    return this.assessmentService.getAssessmentsForPerson(
      personId,
      competencyType,
    );
  }

  /**
   * Get latest assessment for a person and competency
   */
  @Get('person/:personId/latest/:competencyType')
  async getLatestAssessment(
    @Param('personId') personId: string,
    @Param('competencyType') competencyType: string,
  ): Promise<AssessmentResponseDto | null> {
    return this.assessmentService.getLatestAssessment(personId, competencyType);
  }

  /**
   * Get assessments requiring human review
   */
  @Get('admin/review-queue')
  async getAssessmentsRequiringReview(): Promise<AssessmentSummaryDto[]> {
    return this.assessmentService.getAssessmentsRequiringReview();
  }

  /**
   * Submit human review for an assessment
   */
  @Put(':id/review')
  async submitHumanReview(
    @Param('id') id: string,
    @Body(ValidationPipe) request: HumanReviewRequestDto,
  ): Promise<AssessmentResponseDto> {
    // Ensure the assessment ID matches
    const reviewRequest = { ...request, assessmentId: id };
    return this.assessmentService.submitHumanReview(reviewRequest);
  }

  /**
   * Query assessments with filters
   */
  @Get()
  async queryAssessments(
    @Query(ValidationPipe) query: AssessmentQueryDto,
  ): Promise<AssessmentSummaryDto[]> {
    return this.assessmentService.queryAssessments(query);
  }

  /**
   * Get assessment progression for a person
   */
  @Get('person/:personId/progression')
  async getAssessmentProgression(
    @Param('personId') personId: string,
  ): Promise<AssessmentSummaryDto[]> {
    return this.assessmentService.getAssessmentProgression(personId);
  }

  /**
   * Get assessment analytics summary
   */
  @Get('analytics/summary')
  async getAnalyticsSummary(): Promise<{
    totalAssessments: number;
    ccisLevelDistribution: Record<number, number>;
    avgConfidenceScore: number;
    reviewQueueSize: number;
  }> {
    // TODO: Implement analytics service
    return {
      totalAssessments: 0,
      ccisLevelDistribution: { 1: 0, 2: 0, 3: 0, 4: 0 },
      avgConfidenceScore: 0,
      reviewQueueSize: 0,
    };
  }
}
