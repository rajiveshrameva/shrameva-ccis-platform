import { Assessment } from './assessment.aggregate';
import {
  AssessmentID,
  PersonID,
} from '../../../shared/value-objects/id.value-object';
import { CompetencyType } from './value-objects/competency-type.value-object';
import { CCISLevel } from './value-objects/ccis-level.value-object';

/**
 * Assessment Repository Interface
 *
 * Defines the contract for persisting and retrieving Assessment aggregates.
 * This follows the Repository pattern to abstract persistence details from the domain.
 */
export interface IAssessmentRepository {
  /**
   * Save an assessment to persistence
   */
  save(assessment: Assessment): Promise<void>;

  /**
   * Find an assessment by its unique identifier
   */
  findById(id: AssessmentID): Promise<Assessment | null>;

  /**
   * Find assessments for a specific person and competency
   */
  findByPersonAndCompetency(
    personId: PersonID,
    competencyType: CompetencyType,
  ): Promise<Assessment[]>;

  /**
   * Find the latest assessment for a person and competency
   */
  findLatestByPersonAndCompetency(
    personId: PersonID,
    competencyType: CompetencyType,
  ): Promise<Assessment | null>;

  /**
   * Find assessments that require human review
   */
  findRequiringHumanReview(): Promise<Assessment[]>;

  /**
   * Find assessments by CCIS level for analytics
   */
  findByCcisLevel(ccisLevel: CCISLevel): Promise<Assessment[]>;

  /**
   * Find progression assessments (where level increased)
   */
  findProgressionAssessments(personId: PersonID): Promise<Assessment[]>;

  /**
   * Delete an assessment (soft delete)
   */
  delete(id: AssessmentID): Promise<void>;

  /**
   * Check if assessment exists for a specific context
   */
  existsByPersonCompetencyAndDate(
    personId: PersonID,
    competencyType: CompetencyType,
    assessmentDate: Date,
  ): Promise<boolean>;
}
