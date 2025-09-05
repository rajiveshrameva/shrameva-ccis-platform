import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { IAssessmentRepository } from '../../domain/assessment.repository.interface';
import { Assessment, AssessmentData } from '../../domain/assessment.aggregate';
import {
  AssessmentID,
  PersonID,
} from '../../../../shared/value-objects/id.value-object';
import { CompetencyType } from '../../domain/value-objects/competency-type.value-object';
import { CCISLevel } from '../../domain/value-objects/ccis-level.value-object';
import { ConfidenceScore } from '../../domain/value-objects/confidence-score.value-object';
import { BehavioralSignals } from '../../domain/value-objects/behavioral-signals.value-object';
import {
  Assessment as PrismaAssessment,
  CompetencyType as PrismaCompetencyType,
} from '@prisma/client';

/**
 * Prisma Assessment Repository Implementation
 *
 * Implements the assessment repository interface using Prisma ORM.
 * Handles mapping between domain entities and Prisma models.
 */
@Injectable()
export class PrismaAssessmentRepository implements IAssessmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(assessment: Assessment): Promise<void> {
    const data = this.mapToPrismaData(assessment);

    try {
      await this.prisma.assessment.upsert({
        where: { id: assessment.getId().toString() },
        create: data,
        update: {
          ccisLevel: data.ccisLevel,
          confidenceScore: data.confidenceScore,
          validationFlags: data.validationFlags,
          humanReviewRequired: data.humanReviewRequired,
          humanReviewNotes: data.humanReviewNotes,
        },
      });
    } catch (error) {
      throw new Error(`Failed to save assessment: ${error.message}`);
    }
  }

  async findById(id: AssessmentID): Promise<Assessment | null> {
    try {
      const prismaAssessment = await this.prisma.assessment.findUnique({
        where: { id: id.toString() },
      });

      return prismaAssessment
        ? await this.mapToDomainEntity(prismaAssessment)
        : null;
    } catch (error) {
      throw new Error(`Failed to find assessment by ID: ${error.message}`);
    }
  }

  async findByPersonAndCompetency(
    personId: PersonID,
    competencyType: CompetencyType,
  ): Promise<Assessment[]> {
    try {
      const prismaAssessments = await this.prisma.assessment.findMany({
        where: {
          personId: personId.toString(),
          competencyType: this.mapCompetencyTypeToPrisma(competencyType),
        },
        orderBy: { assessmentDate: 'desc' },
      });

      return Promise.all(
        prismaAssessments.map((assessment) =>
          this.mapToDomainEntity(assessment),
        ),
      );
    } catch (error) {
      throw new Error(`Failed to find assessments: ${error.message}`);
    }
  }

  async findLatestByPersonAndCompetency(
    personId: PersonID,
    competencyType: CompetencyType,
  ): Promise<Assessment | null> {
    try {
      const prismaAssessment = await this.prisma.assessment.findFirst({
        where: {
          personId: personId.toString(),
          competencyType: this.mapCompetencyTypeToPrisma(competencyType),
        },
        orderBy: { assessmentDate: 'desc' },
      });

      return prismaAssessment
        ? await this.mapToDomainEntity(prismaAssessment)
        : null;
    } catch (error) {
      throw new Error(`Failed to find latest assessment: ${error.message}`);
    }
  }

  async findRequiringHumanReview(): Promise<Assessment[]> {
    try {
      const prismaAssessments = await this.prisma.assessment.findMany({
        where: { humanReviewRequired: true },
        orderBy: { assessmentDate: 'desc' },
      });

      return Promise.all(
        prismaAssessments.map((assessment) =>
          this.mapToDomainEntity(assessment),
        ),
      );
    } catch (error) {
      throw new Error(
        `Failed to find assessments requiring review: ${error.message}`,
      );
    }
  }

  async findByCcisLevel(ccisLevel: CCISLevel): Promise<Assessment[]> {
    try {
      const prismaAssessments = await this.prisma.assessment.findMany({
        where: { ccisLevel: ccisLevel.getLevel() },
        orderBy: { assessmentDate: 'desc' },
      });

      return Promise.all(
        prismaAssessments.map((assessment) =>
          this.mapToDomainEntity(assessment),
        ),
      );
    } catch (error) {
      throw new Error(
        `Failed to find assessments by CCIS level: ${error.message}`,
      );
    }
  }

  async findProgressionAssessments(personId: PersonID): Promise<Assessment[]> {
    try {
      const prismaAssessments = await this.prisma.assessment.findMany({
        where: {
          personId: personId.toString(),
          isLevelProgression: true,
        },
        orderBy: { assessmentDate: 'desc' },
      });

      return Promise.all(
        prismaAssessments.map((assessment) =>
          this.mapToDomainEntity(assessment),
        ),
      );
    } catch (error) {
      throw new Error(
        `Failed to find progression assessments: ${error.message}`,
      );
    }
  }

  async delete(id: AssessmentID): Promise<void> {
    try {
      await this.prisma.assessment.delete({
        where: { id: id.toString() },
      });
    } catch (error) {
      throw new Error(`Failed to delete assessment: ${error.message}`);
    }
  }

  async existsByPersonCompetencyAndDate(
    personId: PersonID,
    competencyType: CompetencyType,
    assessmentDate: Date,
  ): Promise<boolean> {
    try {
      const count = await this.prisma.assessment.count({
        where: {
          personId: personId.toString(),
          competencyType: this.mapCompetencyTypeToPrisma(competencyType),
          assessmentDate: {
            gte: new Date(assessmentDate.toDateString()),
            lt: new Date(
              new Date(assessmentDate.toDateString()).getTime() +
                24 * 60 * 60 * 1000,
            ),
          },
        },
      });

      return count > 0;
    } catch (error) {
      throw new Error(`Failed to check assessment existence: ${error.message}`);
    }
  }

  // Private mapping methods
  private mapToPrismaData(assessment: Assessment): any {
    const behavioralSignals = assessment.getBehavioralSignals();

    return {
      id: assessment.getId().toString(),
      personId: assessment.personId.toString(),
      competencyType: this.mapCompetencyTypeToPrisma(assessment.competencyType),
      ccisLevel: assessment.getCcisLevel().getLevel(),
      confidenceScore: assessment.getConfidenceScore().getScore(),
      assessmentDate: assessment.assessmentDate,

      // Behavioral signals
      hintRequestFrequency: behavioralSignals.getHintRequestFrequency(),
      errorRecoveryTime: behavioralSignals.getErrorRecoverySpeed(),
      transferSuccessRate: behavioralSignals.getTransferSuccessRate(),
      metacognitiveAccuracy: behavioralSignals.getMetacognitiveAccuracy(),
      taskCompletionTime: behavioralSignals.getTaskCompletionEfficiency(),
      helpSeekingQuality: behavioralSignals.getHelpSeekingQuality(),
      selfAssessmentAlignment: behavioralSignals.getSelfAssessmentAlignment(),

      // AI context
      aiReasoningTrace: assessment.getAiReasoningTrace(),
      aiModelUsed: assessment.getAiModelUsed(),
      aiPromptVersion: assessment.getAiPromptVersion(),

      // Assessment context
      taskIds: assessment.getTaskIds(),
      sessionDuration: assessment.getSessionDuration(),
      distractionEvents: assessment.getDistractionEvents(),

      // Progression
      previousCcisLevel: assessment.getPreviousCcisLevel()?.getLevel(),
      nextLevelRequirements: assessment.getNextLevelRequirements(),
      isLevelProgression: assessment.isLevelProgression(),

      // Validation
      validationFlags: assessment.getValidationFlags(),
      humanReviewRequired: assessment.isHumanReviewRequired(),
      humanReviewNotes: assessment.getHumanReviewNotes(),
    };
  }

  private async mapToDomainEntity(
    prismaAssessment: PrismaAssessment,
  ): Promise<Assessment> {
    const personId = await PersonID.fromString(prismaAssessment.personId);
    const competencyType = this.mapCompetencyTypeFromPrisma(
      prismaAssessment.competencyType,
    );
    const ccisLevel = CCISLevel.create(prismaAssessment.ccisLevel);
    const confidenceScore = ConfidenceScore.create(
      prismaAssessment.confidenceScore,
    );

    const behavioralSignals = BehavioralSignals.create({
      hintRequestFrequency: prismaAssessment.hintRequestFrequency,
      errorRecoverySpeed: prismaAssessment.errorRecoveryTime,
      transferSuccessRate: prismaAssessment.transferSuccessRate,
      metacognitiveAccuracy: prismaAssessment.metacognitiveAccuracy,
      taskCompletionEfficiency: prismaAssessment.taskCompletionTime,
      helpSeekingQuality: prismaAssessment.helpSeekingQuality,
      selfAssessmentAlignment: prismaAssessment.selfAssessmentAlignment,
      assessmentDuration: prismaAssessment.sessionDuration,
      taskCount: prismaAssessment.taskIds.length,
      timestamp: prismaAssessment.assessmentDate,
    });

    const assessmentData: AssessmentData = {
      personId,
      competencyType,
      ccisLevel,
      confidenceScore,
      behavioralSignals,
      aiReasoningTrace: prismaAssessment.aiReasoningTrace,
      aiModelUsed: prismaAssessment.aiModelUsed,
      aiPromptVersion: prismaAssessment.aiPromptVersion,
      taskIds: prismaAssessment.taskIds,
      sessionDuration: prismaAssessment.sessionDuration,
      distractionEvents: prismaAssessment.distractionEvents,
      previousCcisLevel: prismaAssessment.previousCcisLevel
        ? CCISLevel.create(prismaAssessment.previousCcisLevel)
        : undefined,
      nextLevelRequirements: prismaAssessment.nextLevelRequirements,
      isLevelProgression: prismaAssessment.isLevelProgression,
      validationFlags: prismaAssessment.validationFlags,
      humanReviewRequired: prismaAssessment.humanReviewRequired,
      humanReviewNotes: prismaAssessment.humanReviewNotes || undefined,
      assessmentDate: prismaAssessment.assessmentDate,
    };

    const id = await AssessmentID.fromString(prismaAssessment.id);
    return new (Assessment as any)(assessmentData, id);
  }

  private mapCompetencyTypeToPrisma(
    competencyType: CompetencyType,
  ): PrismaCompetencyType {
    const mapping: Record<string, PrismaCompetencyType> = {
      BUSINESS_COMMUNICATION: 'BUSINESS_COMMUNICATION',
      DATA_ANALYSIS: 'DATA_ANALYSIS',
      TECHNICAL_KNOWLEDGE: 'TECHNICAL_KNOWLEDGE',
      PROJECT_MANAGEMENT: 'PROJECT_MANAGEMENT',
      CRITICAL_THINKING: 'CRITICAL_THINKING',
      LEADERSHIP_COLLABORATION: 'LEADERSHIP_COLLABORATION',
      INNOVATION_ADAPTABILITY: 'INNOVATION_ADAPTABILITY',
    };

    return mapping[competencyType.toString()];
  }

  private mapCompetencyTypeFromPrisma(
    prismaType: PrismaCompetencyType,
  ): CompetencyType {
    return CompetencyType.fromString(prismaType);
  }
}
