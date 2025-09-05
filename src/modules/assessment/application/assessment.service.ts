import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { Assessment, AssessmentData } from '../domain/assessment.aggregate';
import type { IAssessmentRepository } from '../domain/assessment.repository.interface';
import {
  AssessmentID,
  PersonID,
} from '../../../shared/value-objects/id.value-object';
import { CompetencyType } from '../domain/value-objects/competency-type.value-object';
import { CCISLevel } from '../domain/value-objects/ccis-level.value-object';
import { ConfidenceScore } from '../domain/value-objects/confidence-score.value-object';
import { BehavioralSignals } from '../domain/value-objects/behavioral-signals.value-object';
import {
  CreateAssessmentRequestDto,
  AssessmentResponseDto,
  AssessmentSummaryDto,
  HumanReviewRequestDto,
  AssessmentQueryDto,
} from './dtos/assessment.dto';

/**
 * AI Assessment Service Interface
 *
 * Service for integrating with AI providers (Claude, GPT-4) to determine CCIS levels.
 */
export interface IAIAssessmentService {
  /**
   * Determine CCIS level using AI analysis of behavioral signals
   */
  determineCCISLevel(
    competencyType: CompetencyType,
    behavioralSignals: BehavioralSignals,
    context: {
      taskIds: string[];
      sessionDuration: number;
      distractionEvents: number;
      previousLevel?: CCISLevel;
    },
  ): Promise<{
    ccisLevel: CCISLevel;
    confidenceScore: ConfidenceScore;
    reasoningTrace: string;
    modelUsed: string;
    promptVersion: string;
    nextLevelRequirements: string[];
  }>;
}

/**
 * Assessment Application Service
 *
 * Core application service that orchestrates assessment creation, validation,
 * and business workflows. This service coordinates between the domain layer,
 * AI services, and persistence.
 */
@Injectable()
export class AssessmentService {
  constructor(
    @Inject('IAssessmentRepository')
    private readonly assessmentRepository: IAssessmentRepository,
    @Inject('IAIAssessmentService')
    private readonly aiAssessmentService: IAIAssessmentService,
  ) {}

  /**
   * Create a new assessment using AI-powered CCIS level determination
   */
  async createAssessment(
    request: CreateAssessmentRequestDto,
  ): Promise<AssessmentResponseDto> {
    try {
      // Validate and convert input data
      const personId = await PersonID.fromString(request.personId);
      const competencyType = CompetencyType.fromString(request.competencyType);

      // Create behavioral signals from request data
      const behavioralSignals = BehavioralSignals.create({
        hintRequestFrequency: request.hintRequestFrequency,
        errorRecoverySpeed: request.errorRecoveryTime,
        transferSuccessRate: request.transferSuccessRate,
        metacognitiveAccuracy: request.metacognitiveAccuracy,
        taskCompletionEfficiency: request.taskCompletionTime,
        helpSeekingQuality: request.helpSeekingQuality,
        selfAssessmentAlignment: request.selfAssessmentAlignment,
        assessmentDuration: request.sessionDuration,
        taskCount: request.taskIds.length,
        timestamp: new Date(),
      });

      // Get previous CCIS level if provided
      const previousCcisLevel = request.previousCcisLevel
        ? CCISLevel.create(request.previousCcisLevel)
        : undefined;

      // Use AI service to determine CCIS level
      const aiResult = await this.aiAssessmentService.determineCCISLevel(
        competencyType,
        behavioralSignals,
        {
          taskIds: request.taskIds,
          sessionDuration: request.sessionDuration,
          distractionEvents: request.distractionEvents,
          previousLevel: previousCcisLevel,
        },
      );

      // Check for level progression
      const isLevelProgression = previousCcisLevel
        ? aiResult.ccisLevel.getLevel() > previousCcisLevel.getLevel()
        : false;

      // Create assessment data
      const assessmentData: AssessmentData = {
        personId,
        competencyType,
        ccisLevel: aiResult.ccisLevel,
        confidenceScore: aiResult.confidenceScore,
        behavioralSignals,
        aiReasoningTrace: aiResult.reasoningTrace,
        aiModelUsed: aiResult.modelUsed,
        aiPromptVersion: aiResult.promptVersion,
        taskIds: request.taskIds,
        sessionDuration: request.sessionDuration,
        distractionEvents: request.distractionEvents,
        previousCcisLevel,
        nextLevelRequirements: aiResult.nextLevelRequirements,
        isLevelProgression,
        validationFlags: [],
        humanReviewRequired: false,
        assessmentDate: new Date(),
      };

      // Create and validate assessment
      const assessment = await Assessment.create(assessmentData);
      assessment.validateAssessment();

      // Save assessment
      await this.assessmentRepository.save(assessment);

      // Return response DTO
      return this.mapToResponseDto(assessment);
    } catch (error) {
      throw new BadRequestException(
        `Failed to create assessment: ${error.message}`,
      );
    }
  }

  /**
   * Get assessment by ID
   */
  async getAssessmentById(
    assessmentId: string,
  ): Promise<AssessmentResponseDto> {
    const id = await AssessmentID.fromString(assessmentId);
    const assessment = await this.assessmentRepository.findById(id);

    if (!assessment) {
      throw new NotFoundException(
        `Assessment with ID ${assessmentId} not found`,
      );
    }

    return this.mapToResponseDto(assessment);
  }

  /**
   * Get assessments for a person and competency
   */
  async getAssessmentsForPerson(
    personId: string,
    competencyType?: string,
  ): Promise<AssessmentSummaryDto[]> {
    const id = await PersonID.fromString(personId);
    let assessments: Assessment[];

    if (competencyType) {
      const competency = CompetencyType.fromString(competencyType);
      assessments = await this.assessmentRepository.findByPersonAndCompetency(
        id,
        competency,
      );
    } else {
      // For now, we'll need to implement a method to get all assessments for a person
      assessments = [];
    }

    return assessments.map((assessment) => this.mapToSummaryDto(assessment));
  }

  /**
   * Get latest assessment for a person and competency
   */
  async getLatestAssessment(
    personId: string,
    competencyType: string,
  ): Promise<AssessmentResponseDto | null> {
    const id = await PersonID.fromString(personId);
    const competency = CompetencyType.fromString(competencyType);

    const assessment =
      await this.assessmentRepository.findLatestByPersonAndCompetency(
        id,
        competency,
      );

    return assessment ? this.mapToResponseDto(assessment) : null;
  }

  /**
   * Get assessments requiring human review
   */
  async getAssessmentsRequiringReview(): Promise<AssessmentSummaryDto[]> {
    const assessments =
      await this.assessmentRepository.findRequiringHumanReview();
    return assessments.map((assessment) => this.mapToSummaryDto(assessment));
  }

  /**
   * Submit human review for an assessment
   */
  async submitHumanReview(
    request: HumanReviewRequestDto,
  ): Promise<AssessmentResponseDto> {
    const id = await AssessmentID.fromString(request.assessmentId);
    const assessment = await this.assessmentRepository.findById(id);

    if (!assessment) {
      throw new NotFoundException(
        `Assessment with ID ${request.assessmentId} not found`,
      );
    }

    // Add review notes
    assessment.addHumanReviewNotes(request.reviewNotes);

    // Approve if requested
    if (request.approved) {
      assessment.approveAfterHumanReview();
    }

    // Save updated assessment
    await this.assessmentRepository.save(assessment);

    return this.mapToResponseDto(assessment);
  }

  /**
   * Query assessments with filters
   */
  async queryAssessments(
    query: AssessmentQueryDto,
  ): Promise<AssessmentSummaryDto[]> {
    // TODO: Implement repository method for complex queries
    // For now, return empty array
    return [];
  }

  /**
   * Get assessment progression for a person
   */
  async getAssessmentProgression(
    personId: string,
  ): Promise<AssessmentSummaryDto[]> {
    const id = await PersonID.fromString(personId);
    const assessments =
      await this.assessmentRepository.findProgressionAssessments(id);
    return assessments.map((assessment) => this.mapToSummaryDto(assessment));
  }

  // Private mapping methods
  private mapToResponseDto(assessment: Assessment): AssessmentResponseDto {
    const behavioralSignals = assessment.getBehavioralSignals();

    return {
      id: assessment.getId().toString(),
      personId: assessment.personId.toString(),
      competencyType: assessment.competencyType.toString(),
      ccisLevel: assessment.getCcisLevel().getLevel(),
      confidenceScore: assessment.getConfidenceScore().getScore(),
      assessmentDate: assessment.assessmentDate.toISOString(),
      aiReasoningTrace: assessment.getAiReasoningTrace(),
      aiModelUsed: assessment.getAiModelUsed(),
      aiPromptVersion: assessment.getAiPromptVersion(),
      taskIds: assessment.getTaskIds(),
      sessionDuration: assessment.getSessionDuration(),
      distractionEvents: assessment.getDistractionEvents(),
      previousCcisLevel: assessment.getPreviousCcisLevel()?.getLevel(),
      nextLevelRequirements: assessment.getNextLevelRequirements(),
      isLevelProgression: assessment.isLevelProgression(),
      validationFlags: assessment.getValidationFlags(),
      humanReviewRequired: assessment.isHumanReviewRequired(),
      humanReviewNotes: assessment.getHumanReviewNotes(),
      behavioralSignals: {
        hintRequestFrequency: behavioralSignals.getHintRequestFrequency(),
        errorRecoveryTime: behavioralSignals.getErrorRecoverySpeed(),
        transferSuccessRate: behavioralSignals.getTransferSuccessRate(),
        metacognitiveAccuracy: behavioralSignals.getMetacognitiveAccuracy(),
        taskCompletionTime: behavioralSignals.getTaskCompletionEfficiency(),
        helpSeekingQuality: behavioralSignals.getHelpSeekingQuality(),
        selfAssessmentAlignment: behavioralSignals.getSelfAssessmentAlignment(),
        signalStrength: behavioralSignals.calculateWeightedScore(),
      },
    };
  }

  private mapToSummaryDto(assessment: Assessment): AssessmentSummaryDto {
    const summary = assessment.getAssessmentSummary();

    return {
      id: assessment.getId().toString(),
      personId: assessment.personId.toString(),
      competencyType: summary.competencyType,
      ccisLevel: summary.ccisLevel,
      confidenceScore: summary.confidenceScore,
      assessmentDate: assessment.assessmentDate.toISOString(),
      isValid: summary.isValid,
      requiresReview: summary.requiresReview,
    };
  }
}
