import { DomainEvent } from '../../../../shared/base/domain-event.base';
import {
  AssessmentID,
  PersonID,
} from '../../../../shared/value-objects/id.value-object';
import { CompetencyType } from '../value-objects/competency-type.value-object';
import { CCISLevel } from '../value-objects/ccis-level.value-object';

export class AssessmentCreated extends DomainEvent {
  constructor(
    public readonly assessmentId: AssessmentID,
    public readonly personId: PersonID,
    public readonly competencyType: CompetencyType,
    public readonly ccisLevel: CCISLevel,
    public readonly assessmentDate: Date,
  ) {
    super(assessmentId, 'Assessment');
  }

  public getEventData(): any {
    return {
      assessmentId: this.assessmentId.toString(),
      personId: this.personId.toString(),
      competencyType: this.competencyType.toString(),
      ccisLevel: this.ccisLevel.getLevel(),
      assessmentDate: this.assessmentDate,
    };
  }
}
