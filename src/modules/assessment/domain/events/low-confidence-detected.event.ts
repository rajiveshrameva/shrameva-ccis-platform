import { DomainEvent } from '../../../../shared/base/domain-event.base';
import {
  AssessmentID,
  PersonID,
} from '../../../../shared/value-objects/id.value-object';
import { CompetencyType } from '../value-objects/competency-type.value-object';
import { ConfidenceScore } from '../value-objects/confidence-score.value-object';

export class LowConfidenceDetected extends DomainEvent {
  constructor(
    public readonly assessmentId: AssessmentID,
    public readonly personId: PersonID,
    public readonly competencyType: CompetencyType,
    public readonly confidenceScore: ConfidenceScore,
  ) {
    super(assessmentId, 'Assessment');
  }

  public getEventData(): any {
    return {
      assessmentId: this.assessmentId.toString(),
      personId: this.personId.toString(),
      competencyType: this.competencyType.toString(),
      confidenceScore: this.confidenceScore.getScore(),
    };
  }
}
