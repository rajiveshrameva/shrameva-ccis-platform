/**
 * Assessment API DTOs Index
 *
 * Central export point for all assessment-related Data Transfer Objects.
 * This provides a clean import interface for all DTOs used in the
 * assessment API layer.
 *
 * DTOs:
 * - StartAssessmentDto: Configuration for starting new assessments
 * - SubmitTaskInteractionDto: Task interaction data and behavioral signals
 * - AssessmentResponseDto: Real-time assessment session responses
 * - ProgressResponseDto: Comprehensive progress analytics responses
 *
 * Usage:
 * ```typescript
 * import { StartAssessmentDto, AssessmentResponseDto } from './dtos';
 * ```
 */

export { StartAssessmentDto } from './start-assessment.dto';
export { SubmitTaskInteractionDto } from './submit-interaction.dto';
export { AssessmentResponseDto } from './assessment-response.dto';
export { ProgressResponseDto } from './progress-response.dto';

// Re-export for backwards compatibility
export * from './start-assessment.dto';
export * from './submit-interaction.dto';
export * from './assessment-response.dto';
export * from './progress-response.dto';
