import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Create Assessment Request DTO
 *
 * Data Transfer Object for creating a new assessment.
 * Contains all the data needed to perform CCIS assessment.
 */
export class CreateAssessmentRequestDto {
  @IsNotEmpty()
  @IsString()
  personId: string;

  @IsNotEmpty()
  @IsString()
  competencyType: string; // Will be validated against CompetencyType enum

  @IsArray()
  @IsString({ each: true })
  taskIds: string[];

  @IsNumber()
  @Min(0)
  sessionDuration: number; // minutes

  @IsNumber()
  @Min(0)
  distractionEvents: number;

  // Behavioral Signals
  @IsNumber()
  @Min(0)
  hintRequestFrequency: number;

  @IsNumber()
  @Min(0)
  errorRecoveryTime: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  transferSuccessRate: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  metacognitiveAccuracy: number;

  @IsNumber()
  @Min(0)
  taskCompletionTime: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  helpSeekingQuality: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  selfAssessmentAlignment: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4)
  previousCcisLevel?: number;
}

/**
 * Assessment Response DTO
 *
 * Data Transfer Object for assessment results.
 */
export class AssessmentResponseDto {
  id: string;
  personId: string;
  competencyType: string;
  ccisLevel: number;
  confidenceScore: number;
  assessmentDate: string;

  // AI Context
  aiReasoningTrace: string;
  aiModelUsed: string;
  aiPromptVersion: string;

  // Context
  taskIds: string[];
  sessionDuration: number;
  distractionEvents: number;

  // Progression
  previousCcisLevel?: number;
  nextLevelRequirements: string[];
  isLevelProgression: boolean;

  // Validation
  validationFlags: string[];
  humanReviewRequired: boolean;
  humanReviewNotes?: string;

  // Behavioral Signals
  behavioralSignals: {
    hintRequestFrequency: number;
    errorRecoveryTime: number;
    transferSuccessRate: number;
    metacognitiveAccuracy: number;
    taskCompletionTime: number;
    helpSeekingQuality: number;
    selfAssessmentAlignment: number;
    signalStrength: number;
  };
}

/**
 * Assessment Summary DTO
 *
 * Simplified assessment data for listings and dashboards.
 */
export class AssessmentSummaryDto {
  id: string;
  personId: string;
  competencyType: string;
  ccisLevel: number;
  confidenceScore: number;
  assessmentDate: string;
  isValid: boolean;
  requiresReview: boolean;
}

/**
 * Human Review Request DTO
 */
export class HumanReviewRequestDto {
  @IsNotEmpty()
  @IsString()
  assessmentId: string;

  @IsNotEmpty()
  @IsString()
  reviewNotes: string;

  @IsBoolean()
  approved: boolean;
}

/**
 * Assessment Query DTO
 */
export class AssessmentQueryDto {
  @IsOptional()
  @IsString()
  personId?: string;

  @IsOptional()
  @IsString()
  competencyType?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4)
  ccisLevel?: number;

  @IsOptional()
  @IsBoolean()
  requiresReview?: boolean;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}
