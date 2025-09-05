import { DomainEvent } from '../../../../shared/base/domain-event.base';
import {
  AssessmentID,
  PersonID,
} from '../../../../shared/value-objects/id.value-object';
import { CompetencyType } from '../value-objects/competency-type.value-object';
import { CCISLevel } from '../value-objects/ccis-level.value-object';
import { ConfidenceScore } from '../value-objects/confidence-score.value-object';

export class CCISLevelDetermined extends DomainEvent {
  constructor(
    public readonly assessmentId: AssessmentID,
    public readonly personId: PersonID,
    public readonly competencyType: CompetencyType,
    public readonly ccisLevel: CCISLevel,
    public readonly confidenceScore: ConfidenceScore,
  ) {
    super(assessmentId, 'Assessment');
  }

  public getEventData(): any {
    return {
      assessmentId: this.assessmentId.toString(),
      personId: this.personId.toString(),
      competencyType: this.competencyType.toString(),
      ccisLevel: this.ccisLevel.getLevel(),
      confidenceScore: this.confidenceScore.getScore(),
    };
  }
}
