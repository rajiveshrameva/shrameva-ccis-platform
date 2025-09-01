/**
 * Assessment Domain Layer Index
 *
 * Central export point for all domain layer components including
 * entities, value objects, domain services, and repository interfaces.
 */

// Entities
export { AssessmentSession } from './entities/assessment-session.entity';
export { TaskInteraction } from './entities/task-interaction.entity';
export { CompetencyAssessment } from './entities/competency-assessment.entity';

// Value Objects
export { CCISLevel } from './value-objects/ccis-level.value-object';
export { ConfidenceScore } from './value-objects/confidence-score.value-object';
export { CompetencyType } from './value-objects/competency-type.value-object';
export { BehavioralSignals } from './value-objects/behavioral-signals.value-object';

// Domain Services
export { CCISCalculationService } from './services/ccis-calculation.service';
export { GamingDetectionService } from './services/gaming-detection.service';
export { ScaffoldingAdjustmentService } from './services/scaffolding-adjustment.service';

// Repository Interfaces
export type { AssessmentSessionRepositoryInterface } from './repositories/assessment-session.repository.interface';
export type { TaskInteractionRepositoryInterface } from './repositories/task-interaction.repository.interface';
export type { CompetencyAssessmentRepositoryInterface } from './repositories/competency-assessment.repository.interface';
