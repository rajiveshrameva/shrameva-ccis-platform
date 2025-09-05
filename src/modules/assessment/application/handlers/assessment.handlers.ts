import { Injectable, Inject } from '@nestjs/common';

// Domain imports - use the actual Assessment aggregate we have
import { Assessment, AssessmentData } from '../../domain/assessment.aggregate';
import type { IAssessmentRepository } from '../../domain/assessment.repository.interface';

// Value object imports - these exist
import { CCISLevel } from '../../domain/value-objects/ccis-level.value-object';
import { ConfidenceScore } from '../../domain/value-objects/confidence-score.value-object';
import { CompetencyType } from '../../domain/value-objects/competency-type.value-object';

// Shared value objects
import {
  PersonID,
  AssessmentID,
} from '../../../../shared/value-objects/id.value-object';

// Application service - this exists
import { AssessmentService } from '../assessment.service';

// Simple command/query interfaces for now
export interface StartAssessmentCommand {
  personId: string;
  competencyType: string;
  taskIds: string[];
  sessionDuration: number;
  distractionEvents: number;
  behavioralSignals: {
    hintRequestFrequency: number;
    errorRecoverySpeed: number;
    transferSuccessRate: number;
    metacognitiveAccuracy: number;
    taskCompletionEfficiency: number;
    helpSeekingQuality: number;
    selfAssessmentAlignment: number;
  };
  previousCcisLevel?: number;
}

export interface SubmitTaskInteractionCommand {
  assessmentId: string;
  taskId: string;
  interactionData: any;
  behavioralMetrics: any;
}

export interface GetCCISProgressQuery {
  personId: string;
  competencyType?: string;
  fromDate?: Date;
  toDate?: Date;
}

/**
 * Assessment Application Handlers
 *
 * Simplified handlers that work with the current Assessment implementation.
 * Provides core assessment workflows using the existing domain model.
 */
@Injectable()
export class AssessmentHandlers {
  constructor(
    private readonly assessmentService: AssessmentService,
    @Inject('IAssessmentRepository')
    private readonly assessmentRepository: IAssessmentRepository,
  ) {}

  /**
   * Handle start assessment command
   */
  async handleStartAssessment(
    command: StartAssessmentCommand,
  ): Promise<Assessment> {
    // Convert command to CreateAssessmentRequestDto format
    const request = {
      personId: command.personId,
      competencyType: command.competencyType,
      taskIds: command.taskIds,
      sessionDuration: command.sessionDuration,
      distractionEvents: command.distractionEvents,
      hintRequestFrequency: command.behavioralSignals.hintRequestFrequency,
      errorRecoveryTime: command.behavioralSignals.errorRecoverySpeed,
      transferSuccessRate: command.behavioralSignals.transferSuccessRate,
      metacognitiveAccuracy: command.behavioralSignals.metacognitiveAccuracy,
      taskCompletionTime: command.behavioralSignals.taskCompletionEfficiency,
      helpSeekingQuality: command.behavioralSignals.helpSeekingQuality,
      selfAssessmentAlignment:
        command.behavioralSignals.selfAssessmentAlignment,
      previousCcisLevel: command.previousCcisLevel,
    };

    // Use the assessment service to create the assessment
    const assessmentResponse =
      await this.assessmentService.createAssessment(request);

    // Return the domain entity
    const assessmentId = await AssessmentID.fromString(assessmentResponse.id);
    const assessment = await this.assessmentRepository.findById(assessmentId);
    if (!assessment) {
      throw new Error(
        `Assessment not found after creation: ${assessmentId.toString()}`,
      );
    }
    return assessment;
  }

  /**
   * Handle submit task interaction command
   */
  async handleSubmitTaskInteraction(
    command: SubmitTaskInteractionCommand,
  ): Promise<void> {
    // For now, this is a placeholder
    // In a full implementation, this would update task interactions
    // and potentially trigger CCIS recalculation
    console.log('Task interaction submitted:', command);
  }

  /**
   * Handle get CCIS progress query
   */
  async handleGetCCISProgress(query: GetCCISProgressQuery): Promise<{
    personId: string;
    competencyProgression: Array<{
      competencyType: string;
      currentLevel: number;
      progressHistory: Array<{
        level: number;
        achievedAt: Date;
        confidenceScore: number;
      }>;
    }>;
    overallProgress: {
      averageLevel: number;
      totalAssessments: number;
      progressTrend: 'improving' | 'stable' | 'declining';
    };
  }> {
    const personId = await PersonID.fromString(query.personId);

    // Get all assessments for the person
    let assessments: Assessment[] = [];

    if (query.competencyType) {
      const competencyType = CompetencyType.fromString(query.competencyType);
      assessments = await this.assessmentRepository.findByPersonAndCompetency(
        personId,
        competencyType,
      );
    } else {
      // For now, we'll get progression assessments only
      assessments =
        await this.assessmentRepository.findProgressionAssessments(personId);
    }

    // Group by competency type
    const competencyGroups = new Map<string, Assessment[]>();
    assessments.forEach((assessment) => {
      const competency = assessment.competencyType.toString();
      if (!competencyGroups.has(competency)) {
        competencyGroups.set(competency, []);
      }
      competencyGroups.get(competency)!.push(assessment);
    });

    // Build competency progression
    const competencyProgression = Array.from(competencyGroups.entries()).map(
      ([competencyType, competencyAssessments]) => {
        const sortedAssessments = competencyAssessments.sort(
          (a, b) => a.assessmentDate.getTime() - b.assessmentDate.getTime(),
        );

        const latest = sortedAssessments[sortedAssessments.length - 1];

        return {
          competencyType,
          currentLevel: latest.getCcisLevel().getLevel(),
          progressHistory: sortedAssessments.map((assessment) => ({
            level: assessment.getCcisLevel().getLevel(),
            achievedAt: assessment.assessmentDate,
            confidenceScore: assessment.getConfidenceScore().getScore(),
          })),
        };
      },
    );

    // Calculate overall progress
    const totalAssessments = assessments.length;
    const averageLevel =
      assessments.length > 0
        ? assessments.reduce((sum, a) => sum + a.getCcisLevel().getLevel(), 0) /
          assessments.length
        : 0;

    // Simple trend calculation (needs more sophisticated logic in production)
    const progressTrend = this.calculateProgressTrend(assessments);

    return {
      personId: query.personId,
      competencyProgression,
      overallProgress: {
        averageLevel,
        totalAssessments,
        progressTrend,
      },
    };
  }

  /**
   * Calculate progress trend based on recent assessments
   */
  private calculateProgressTrend(
    assessments: Assessment[],
  ): 'improving' | 'stable' | 'declining' {
    if (assessments.length < 2) return 'stable';

    const sorted = assessments.sort(
      (a, b) => a.assessmentDate.getTime() - b.assessmentDate.getTime(),
    );
    const recent = sorted.slice(-3); // Last 3 assessments

    if (recent.length < 2) return 'stable';

    const firstLevel = recent[0].getCcisLevel().getLevel();
    const lastLevel = recent[recent.length - 1].getCcisLevel().getLevel();

    if (lastLevel > firstLevel) return 'improving';
    if (lastLevel < firstLevel) return 'declining';
    return 'stable';
  }

  /**
   * Get assessment statistics for analytics
   */
  async getAssessmentStatistics(): Promise<{
    totalAssessments: number;
    ccisLevelDistribution: Record<number, number>;
    averageConfidenceScore: number;
    reviewQueueSize: number;
  }> {
    // Get assessments requiring review
    const reviewQueue =
      await this.assessmentRepository.findRequiringHumanReview();

    // For full statistics, we would need additional repository methods
    // This is a placeholder implementation
    return {
      totalAssessments: 0,
      ccisLevelDistribution: { 1: 0, 2: 0, 3: 0, 4: 0 },
      averageConfidenceScore: 0,
      reviewQueueSize: reviewQueue.length,
    };
  }

  /**
   * Validate assessment readiness
   */
  async validateAssessmentReadiness(command: StartAssessmentCommand): Promise<{
    isReady: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Validate person exists (would need person service in real implementation)
    try {
      await PersonID.fromString(command.personId);
    } catch (error) {
      issues.push('Invalid person ID');
    }

    // Validate competency type
    try {
      CompetencyType.fromString(command.competencyType);
    } catch (error) {
      issues.push('Invalid competency type');
    }

    // Validate task coverage
    if (command.taskIds.length < 3) {
      issues.push('Insufficient task coverage for reliable assessment');
      recommendations.push('Include at least 3 tasks for better reliability');
    }

    // Validate session duration
    if (command.sessionDuration < 10) {
      issues.push('Session duration too short for meaningful assessment');
      recommendations.push('Extend session to at least 10 minutes');
    }

    // Validate behavioral signals quality
    const signals = command.behavioralSignals;
    if (signals.hintRequestFrequency < 0 || signals.hintRequestFrequency > 1) {
      issues.push('Invalid hint request frequency');
    }

    return {
      isReady: issues.length === 0,
      issues,
      recommendations,
    };
  }
}
