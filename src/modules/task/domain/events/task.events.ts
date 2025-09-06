import { DomainEvent } from '../../../../shared/base/domain-event.base';
import { TaskId } from '../value-objects/task-id.value-object';
import { CompetencyId } from '../value-objects/competency-id.value-object';

/**
 * Task Lifecycle Events
 */

export class TaskCreatedEvent extends DomainEvent {
  constructor(
    public readonly taskId: TaskId,
    public readonly competencyId: CompetencyId,
    public readonly targetCCISLevel: number,
    public readonly createdBy: string,
  ) {
    super(taskId, 'Task');
  }

  public getEventData(): Record<string, any> {
    return {
      taskId: this.taskId.getValue(),
      competencyId: this.competencyId.getValue(),
      targetCCISLevel: this.targetCCISLevel,
      createdBy: this.createdBy,
    };
  }
}

export class TaskPublishedEvent extends DomainEvent {
  constructor(
    public readonly taskId: TaskId,
    public readonly publishedBy: string,
    public readonly validationStatus: string,
  ) {
    super(taskId, 'Task');
  }

  public getEventData(): Record<string, any> {
    return {
      taskId: this.taskId.getValue(),
      publishedBy: this.publishedBy,
      validationStatus: this.validationStatus,
    };
  }
}

export class TaskDeprecatedEvent extends DomainEvent {
  constructor(
    public readonly taskId: TaskId,
    public readonly reason: string,
    public readonly replacementTaskId?: TaskId,
  ) {
    super(taskId, 'Task');
  }

  public getEventData(): Record<string, any> {
    return {
      taskId: this.taskId.getValue(),
      reason: this.reason,
      replacementTaskId: this.replacementTaskId?.getValue(),
    };
  }
}

/**
 * Task Performance Events
 */

export class TaskCompletedEvent extends DomainEvent {
  constructor(
    public readonly taskId: TaskId,
    public readonly studentId: string,
    public readonly isSuccessful: boolean,
    public readonly rubricScore: any, // RubricScore interface
    public readonly behavioralSignals: Record<string, any>,
  ) {
    super(taskId, 'Task');
  }

  public getEventData(): Record<string, any> {
    return {
      taskId: this.taskId.getValue(),
      studentId: this.studentId,
      isSuccessful: this.isSuccessful,
      rubricScore: this.rubricScore,
      behavioralSignals: this.behavioralSignals,
    };
  }
}

export class TaskDifficultyRecalibrationEvent extends DomainEvent {
  constructor(
    public readonly taskId: TaskId,
    public readonly previousDifficulty: number,
    public readonly newDifficulty: number,
    public readonly calibrationDrift: number,
  ) {
    super(taskId, 'Task');
  }

  public getEventData(): Record<string, any> {
    return {
      taskId: this.taskId.getValue(),
      previousDifficulty: this.previousDifficulty,
      newDifficulty: this.newDifficulty,
      calibrationDrift: this.calibrationDrift,
    };
  }
}

/**
 * Content Management Events
 */

export class TaskContentUpdatedEvent extends DomainEvent {
  constructor(
    public readonly taskId: TaskId,
    public readonly updatedBy: string,
    public readonly changedFields: string[],
    public readonly previousVersion: string,
    public readonly newVersion: string,
  ) {
    super(taskId, 'Task');
  }

  public getEventData(): Record<string, any> {
    return {
      taskId: this.taskId.getValue(),
      updatedBy: this.updatedBy,
      changedFields: this.changedFields,
      previousVersion: this.previousVersion,
      newVersion: this.newVersion,
    };
  }
}

export class TaskValidationRequiredEvent extends DomainEvent {
  constructor(
    public readonly taskId: TaskId,
    public readonly validationType: string,
    public readonly reason: string,
  ) {
    super(taskId, 'Task');
  }

  public getEventData(): Record<string, any> {
    return {
      taskId: this.taskId.getValue(),
      validationType: this.validationType,
      reason: this.reason,
    };
  }
}

/**
 * Learning Analytics Events
 */

export class TaskRecommendationGeneratedEvent extends DomainEvent {
  constructor(
    public readonly taskId: TaskId,
    public readonly studentId: string,
    public readonly recommendationStrength: number,
    public readonly reasons: string[],
  ) {
    super(taskId, 'Task');
  }

  public getEventData(): Record<string, any> {
    return {
      taskId: this.taskId.getValue(),
      studentId: this.studentId,
      recommendationStrength: this.recommendationStrength,
      reasons: this.reasons,
    };
  }
}

export class TaskTransferVariationCreatedEvent extends DomainEvent {
  constructor(
    public readonly originalTaskId: TaskId,
    public readonly transferTaskId: TaskId,
    public readonly novelContextType: string,
  ) {
    super(originalTaskId, 'Task');
  }

  public getEventData(): Record<string, any> {
    return {
      originalTaskId: this.originalTaskId.getValue(),
      transferTaskId: this.transferTaskId.getValue(),
      novelContextType: this.novelContextType,
    };
  }
}

/**
 * Task Interaction Events
 */

export class TaskHintRequestedEvent extends DomainEvent {
  constructor(
    public readonly taskId: TaskId,
    public readonly studentId: string,
    public readonly ccisLevel: number,
    public readonly struggleDuration: number,
    public readonly hintType: string,
  ) {
    super(taskId, 'Task');
  }

  public getEventData(): Record<string, any> {
    return {
      taskId: this.taskId.getValue(),
      studentId: this.studentId,
      ccisLevel: this.ccisLevel,
      struggleDuration: this.struggleDuration,
      hintType: this.hintType,
    };
  }
}

export class TaskAttemptStartedEvent extends DomainEvent {
  constructor(
    public readonly taskId: TaskId,
    public readonly studentId: string,
    public readonly attemptNumber: number,
    public readonly studentCCISLevel: number,
  ) {
    super(taskId, 'Task');
  }

  public getEventData(): Record<string, any> {
    return {
      taskId: this.taskId.getValue(),
      studentId: this.studentId,
      attemptNumber: this.attemptNumber,
      studentCCISLevel: this.studentCCISLevel,
    };
  }
}

export class TaskAttemptAbandonedEvent extends DomainEvent {
  constructor(
    public readonly taskId: TaskId,
    public readonly studentId: string,
    public readonly timeSpent: number,
    public readonly progressPercentage: number,
    public readonly abandonReason?: string,
  ) {
    super(taskId, 'Task');
  }

  public getEventData(): Record<string, any> {
    return {
      taskId: this.taskId.getValue(),
      studentId: this.studentId,
      timeSpent: this.timeSpent,
      progressPercentage: this.progressPercentage,
      abandonReason: this.abandonReason,
    };
  }
}

/**
 * Quality Assurance Events
 */

export class TaskQualityIssueDetectedEvent extends DomainEvent {
  constructor(
    public readonly taskId: TaskId,
    public readonly issueType: string,
    public readonly severity: string,
    public readonly description: string,
    public readonly detectionMethod: string,
  ) {
    super(taskId, 'Task');
  }

  public getEventData(): Record<string, any> {
    return {
      taskId: this.taskId.getValue(),
      issueType: this.issueType,
      severity: this.severity,
      description: this.description,
      detectionMethod: this.detectionMethod,
    };
  }
}

export class TaskGamingPatternDetectedEvent extends DomainEvent {
  constructor(
    public readonly taskId: TaskId,
    public readonly studentId: string,
    public readonly patternType: string,
    public readonly confidence: number,
    public readonly evidenceData: Record<string, any>,
  ) {
    super(taskId, 'Task');
  }

  public getEventData(): Record<string, any> {
    return {
      taskId: this.taskId.getValue(),
      studentId: this.studentId,
      patternType: this.patternType,
      confidence: this.confidence,
      evidenceData: this.evidenceData,
    };
  }
}

/**
 * Integration Events
 */

export class TaskLinkedToLearningPathEvent extends DomainEvent {
  constructor(
    public readonly taskId: TaskId,
    public readonly learningPathId: string,
    public readonly position: number,
    public readonly isOptional: boolean,
  ) {
    super(taskId, 'Task');
  }

  public getEventData(): Record<string, any> {
    return {
      taskId: this.taskId.getValue(),
      learningPathId: this.learningPathId,
      position: this.position,
      isOptional: this.isOptional,
    };
  }
}

export class TaskIndustryValidationCompletedEvent extends DomainEvent {
  constructor(
    public readonly taskId: TaskId,
    public readonly validatorId: string,
    public readonly validatorCompany: string,
    public readonly validationScore: number,
    public readonly feedback: string,
    public readonly recommendations: string[],
  ) {
    super(taskId, 'Task');
  }

  public getEventData(): Record<string, any> {
    return {
      taskId: this.taskId.getValue(),
      validatorId: this.validatorId,
      validatorCompany: this.validatorCompany,
      validationScore: this.validationScore,
      feedback: this.feedback,
      recommendations: this.recommendations,
    };
  }
}
