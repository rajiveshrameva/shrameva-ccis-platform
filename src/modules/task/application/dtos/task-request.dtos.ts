import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsObject,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskType } from '../../domain/value-objects/task-type.value-object';
import { TaskCategory } from '../../domain/value-objects/task-category.value-object';

/**
 * Task Creation DTO
 * Used for creating new tasks through the API
 */
export class CreateTaskDto {
  @ApiProperty({
    description: 'Task title',
    example: 'Client Email Crisis Response',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Brief overview of what the task teaches and why it matters',
    example:
      'Learn to handle difficult client communications with professionalism and clarity',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Detailed step-by-step guidance for task completion',
    example: 'Step 1: Read the client concern carefully...',
  })
  @IsString()
  @IsNotEmpty()
  instructions: string;

  @ApiProperty({
    description: 'Real workplace scenario that frames the task',
    example:
      'You are a junior analyst at a fintech startup. A major client has raised concerns...',
  })
  @IsString()
  @IsNotEmpty()
  context: string;

  @ApiProperty({
    description: 'Expected completion time in minutes',
    minimum: 1,
    maximum: 60,
    example: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(60)
  expectedDuration: number;

  @ApiProperty({
    description: 'Competency ID this task belongs to',
    example: 'cid_V1StGXR8_Z5jdHi6B-myT',
  })
  @IsString()
  @IsNotEmpty()
  competencyId: string;

  @ApiProperty({
    description: 'Target CCIS level (1-4)',
    minimum: 1,
    maximum: 4,
    example: 2,
  })
  @IsNumber()
  @Min(1)
  @Max(4)
  targetCCISLevel: number;

  @ApiProperty({
    description: 'Task difficulty level (0.0-1.0)',
    minimum: 0.0,
    maximum: 1.0,
    example: 0.5,
  })
  @IsNumber()
  @Min(0.0)
  @Max(1.0)
  difficulty: number;

  @ApiProperty({
    enum: ['MICRO_CONCEPT', 'MICRO_TASK', 'FUSION_TASK'],
    description: 'Type of task',
    example: 'MICRO_TASK',
  })
  @IsEnum(['MICRO_CONCEPT', 'MICRO_TASK', 'FUSION_TASK'])
  taskType: string;

  @ApiProperty({
    enum: [
      'EMAIL_WRITING',
      'PRESENTATION_SKILLS',
      'MEETING_FACILITATION',
      'CLIENT_COMMUNICATION',
      'EXCEL_ANALYSIS',
      'SQL_QUERIES',
      'DATA_VISUALIZATION',
      'INSIGHT_GENERATION',
      'PROGRAMMING_EXERCISE',
      'SYSTEM_DESIGN',
      'DEBUGGING_CHALLENGE',
      'TECHNICAL_DOCUMENTATION',
      'PROJECT_PLANNING',
      'TIMELINE_CREATION',
      'RISK_ASSESSMENT',
      'STAKEHOLDER_COMMUNICATION',
      'ROOT_CAUSE_ANALYSIS',
      'DECISION_FRAMEWORK',
      'SCENARIO_ANALYSIS',
      'CREATIVE_PROBLEM_SOLVING',
      'TEAM_COORDINATION',
      'CONFLICT_RESOLUTION',
      'DELEGATION_EXERCISE',
      'MENTORING_SIMULATION',
      'PROCESS_IMPROVEMENT',
      'TECHNOLOGY_ADOPTION',
      'CHANGE_MANAGEMENT',
      'CREATIVE_IDEATION',
    ],
    description: 'Task category',
    example: 'EMAIL_WRITING',
  })
  @IsEnum([
    'EMAIL_WRITING',
    'PRESENTATION_SKILLS',
    'MEETING_FACILITATION',
    'CLIENT_COMMUNICATION',
    'EXCEL_ANALYSIS',
    'SQL_QUERIES',
    'DATA_VISUALIZATION',
    'INSIGHT_GENERATION',
    'PROGRAMMING_EXERCISE',
    'SYSTEM_DESIGN',
    'DEBUGGING_CHALLENGE',
    'TECHNICAL_DOCUMENTATION',
    'PROJECT_PLANNING',
    'TIMELINE_CREATION',
    'RISK_ASSESSMENT',
    'STAKEHOLDER_COMMUNICATION',
    'ROOT_CAUSE_ANALYSIS',
    'DECISION_FRAMEWORK',
    'SCENARIO_ANALYSIS',
    'CREATIVE_PROBLEM_SOLVING',
    'TEAM_COORDINATION',
    'CONFLICT_RESOLUTION',
    'DELEGATION_EXERCISE',
    'MENTORING_SIMULATION',
    'PROCESS_IMPROVEMENT',
    'TECHNOLOGY_ADOPTION',
    'CHANGE_MANAGEMENT',
    'CREATIVE_IDEATION',
  ])
  taskCategory: string;

  @ApiProperty({
    description: 'Structured content blocks for task rendering',
    example: {
      instructions: {
        type: 'numbered_list',
        content: ['Step 1: ...', 'Step 2: ...'],
        formatting: 'markdown',
      },
    },
  })
  @IsObject()
  contentBlocks: Record<string, any>;

  @ApiProperty({
    description: 'Success criteria definition',
    example: {
      passingThreshold: 0.7,
      criteria: [
        {
          id: 'email_tone',
          description: 'Email maintains professional and empathetic tone',
          weight: 0.4,
          type: 'ai_assessed',
        },
      ],
    },
  })
  @IsObject()
  successCriteria: Record<string, any>;

  @ApiProperty({
    description: 'Assessment rubric for detailed evaluation',
    example: {
      dimensions: [
        {
          id: 'communication_clarity',
          name: 'Communication Clarity',
          description: 'How clear and understandable is the communication',
          weight: 0.5,
          levels: [
            {
              score: 4,
              label: 'Excellent',
              description: 'Communication is crystal clear and easy to follow',
            },
          ],
        },
      ],
      scoringMethod: 'weighted_average',
      passingScore: 0.7,
    },
  })
  @IsObject()
  assessmentRubric: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Industry scenario context for authenticity',
    example: 'Based on real situations at Goldman Sachs client services team',
  })
  @IsOptional()
  @IsString()
  industryScenario?: string;

  @ApiPropertyOptional({
    description: 'Prerequisite task IDs that should be completed first',
    type: [String],
    example: ['cid_prerequisite1', 'cid_prerequisite2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisiteTasks?: string[];

  @ApiPropertyOptional({
    description: 'Content tags for categorization and search',
    type: [String],
    example: ['client_communication', 'crisis_management', 'email'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

/**
 * Task Update DTO
 * Used for updating existing tasks
 */
export class UpdateTaskDto {
  @ApiPropertyOptional({ description: 'Updated task title' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({ description: 'Updated task description' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({ description: 'Updated instructions' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  instructions?: string;

  @ApiPropertyOptional({ description: 'Updated context' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  context?: string;

  @ApiPropertyOptional({ description: 'Updated expected duration' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  expectedDuration?: number;

  @ApiPropertyOptional({ description: 'Updated task difficulty' })
  @IsOptional()
  @IsNumber()
  @Min(0.0)
  @Max(1.0)
  difficulty?: number;

  @ApiPropertyOptional({ description: 'Updated content blocks' })
  @IsOptional()
  @IsObject()
  contentBlocks?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Updated success criteria' })
  @IsOptional()
  @IsObject()
  successCriteria?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Updated assessment rubric' })
  @IsOptional()
  @IsObject()
  assessmentRubric?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Updated industry scenario' })
  @IsOptional()
  @IsString()
  industryScenario?: string;

  @ApiPropertyOptional({ description: 'Updated tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

/**
 * Task Query DTO
 * Used for filtering and searching tasks
 */
export class GetTasksQueryDto {
  @ApiPropertyOptional({ description: 'Filter by competency ID' })
  @IsOptional()
  @IsString()
  competencyId?: string;

  @ApiPropertyOptional({ description: 'Filter by CCIS level' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4)
  ccisLevel?: number;

  @ApiPropertyOptional({ description: 'Filter by task type' })
  @IsOptional()
  @IsEnum(['MICRO_CONCEPT', 'MICRO_TASK', 'FUSION_TASK'])
  taskType?: string;

  @ApiPropertyOptional({ description: 'Filter by task category' })
  @IsOptional()
  @IsString()
  taskCategory?: string;

  @ApiPropertyOptional({ description: 'Filter by minimum difficulty' })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(1.0)
  minDifficulty?: number;

  @ApiPropertyOptional({ description: 'Filter by maximum difficulty' })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(1.0)
  maxDifficulty?: number;

  @ApiPropertyOptional({ description: 'Filter by tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Only published tasks' })
  @IsOptional()
  @IsBoolean()
  publishedOnly?: boolean;

  @ApiPropertyOptional({ description: 'Page number for pagination' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Sort field' })
  @IsOptional()
  @IsEnum(['title', 'difficulty', 'duration', 'createdAt', 'updatedAt'])
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort order' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

/**
 * Task Submission DTO
 * Used when students submit task attempts
 */
export class TaskSubmissionDto {
  @ApiProperty({
    description: 'Student responses/answers to the task',
    example: {
      email_content: 'Dear Mr. Johnson, I understand your concerns about...',
      tone_rating: 'professional',
      follow_up_actions: ['Schedule call', 'Send documentation'],
    },
  })
  @IsObject()
  responses: Record<string, any>;

  @ApiProperty({
    description: 'Time spent on task in seconds',
    minimum: 0,
    example: 180,
  })
  @IsNumber()
  @Min(0)
  timeSpent: number;

  @ApiPropertyOptional({
    description: 'Number of hints requested by student',
    minimum: 0,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hintsRequested?: number;

  @ApiPropertyOptional({
    description: 'Student confidence rating (1-5)',
    minimum: 1,
    maximum: 5,
    example: 4,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  confidenceRating?: number;

  @ApiPropertyOptional({
    description: 'Self-assessment of performance (1-5)',
    minimum: 1,
    maximum: 5,
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  selfAssessment?: number;

  @ApiPropertyOptional({
    description: 'Additional student feedback about the task',
    example:
      'The scenario felt very realistic. I would like more examples of email templates.',
  })
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiPropertyOptional({
    description: 'Attempt number for this task',
    minimum: 1,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  attempts?: number;
}

/**
 * Hint Request DTO
 * Used when students request adaptive hints
 */
export class HintRequestDto {
  @ApiProperty({
    description: 'How long student has been struggling (seconds)',
    minimum: 0,
    example: 45,
  })
  @IsNumber()
  @Min(0)
  struggleDuration: number;

  @ApiPropertyOptional({
    description: 'Current context or specific area of difficulty',
    example: 'Having trouble with the email opening paragraph',
  })
  @IsOptional()
  @IsString()
  context?: string;

  @ApiPropertyOptional({
    description: 'Previous hints already shown to student',
    type: [String],
    example: ['hint_1', 'hint_2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  previousHints?: string[];
}

/**
 * Task Deprecation DTO
 * Used when deprecating tasks
 */
export class DeprecateTaskDto {
  @ApiProperty({
    description: 'Reason for deprecating the task',
    example: 'Industry practices have changed, task no longer relevant',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'ID of replacement task if available',
    example: 'cid_replacement_task_id',
  })
  @IsOptional()
  @IsString()
  replacementTaskId?: string;
}

/**
 * Pagination DTO
 * Generic pagination parameters
 */
export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;
}

/**
 * Student Profile DTO
 * Used for task recommendations (simplified version)
 */
export class StudentProfileDto {
  @ApiProperty({ description: 'Student ID' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    description: 'CCIS levels by competency',
    example: {
      communication: 2,
      problem_solving: 3,
      technical_skills: 1,
    },
  })
  @IsObject()
  ccisLevels: Record<string, number>;

  @ApiPropertyOptional({
    description: 'Completed task IDs',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  completedTasks?: string[];

  @ApiPropertyOptional({
    description: 'Preferred learning style',
    example: 'visual',
  })
  @IsOptional()
  @IsString()
  learningStyle?: string;
}
