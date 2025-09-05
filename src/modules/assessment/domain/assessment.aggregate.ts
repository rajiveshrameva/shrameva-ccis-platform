import { AggregateRoot } from '../../../shared/base/aggregate.root';
import {
  AssessmentID,
  PersonID,
} from '../../../shared/value-objects/id.value-object';
import { CompetencyType } from './value-objects/competency-type.value-object';
import { CCISLevel } from './value-objects/ccis-level.value-object';
import { ConfidenceScore } from './value-objects/confidence-score.value-object';
import { BehavioralSignals } from './value-objects/behavioral-signals.value-object';
import { BusinessRuleException } from '../../../shared/domain/exceptions/domain-exception.base';

export interface AssessmentData {
  personId: PersonID;
  competencyType: CompetencyType;
  ccisLevel: CCISLevel;
  confidenceScore: ConfidenceScore;
  behavioralSignals: BehavioralSignals;
  aiReasoningTrace: string;
  aiModelUsed: string;
  aiPromptVersion: string;
  taskIds: string[];
  sessionDuration: number; // minutes
  distractionEvents: number;
  previousCcisLevel?: CCISLevel;
  nextLevelRequirements: string[];
  isLevelProgression: boolean;
  validationFlags: string[];
  humanReviewRequired: boolean;
  humanReviewNotes?: string;
  assessmentDate: Date;
}

/**
 * Assessment Aggregate Root
 *
 * The core domain entity that captures and measures a student's competency level
 * using the CCIS (Confidence-Competence Independence Scale) methodology.
 *
 * This entity represents a single assessment instance for a specific competency,
 * containing behavioral signals, AI-generated CCIS level determination, and progression tracking.
 */
export class Assessment extends AggregateRoot<AssessmentID> {
  // Core Properties
  public readonly personId: PersonID;
  public readonly competencyType: CompetencyType;
  public readonly assessmentDate: Date;

  // Assessment Results
  private _ccisLevel: CCISLevel;
  private _confidenceScore: ConfidenceScore;
  private _behavioralSignals: BehavioralSignals;

  // AI Decision Context
  private _aiReasoningTrace: string;
  private _aiModelUsed: string;
  private _aiPromptVersion: string;

  // Assessment Context
  private _taskIds: string[];
  private _sessionDuration: number;
  private _distractionEvents: number;

  // Progression Tracking
  private _previousCcisLevel?: CCISLevel;
  private _nextLevelRequirements: string[];
  private _isLevelProgression: boolean;

  // Validation & Quality
  private _validationFlags: string[];
  private _humanReviewRequired: boolean;
  private _humanReviewNotes?: string;

  private constructor(data: AssessmentData, id: AssessmentID) {
    super(id);

    // Core Properties
    this.personId = data.personId;
    this.competencyType = data.competencyType;
    this.assessmentDate = data.assessmentDate;

    // Assessment Results
    this._ccisLevel = data.ccisLevel;
    this._confidenceScore = data.confidenceScore;
    this._behavioralSignals = data.behavioralSignals;

    // AI Decision Context
    this._aiReasoningTrace = data.aiReasoningTrace;
    this._aiModelUsed = data.aiModelUsed;
    this._aiPromptVersion = data.aiPromptVersion;

    // Assessment Context
    this._taskIds = [...data.taskIds];
    this._sessionDuration = data.sessionDuration;
    this._distractionEvents = data.distractionEvents;

    // Progression Tracking
    this._previousCcisLevel = data.previousCcisLevel;
    this._nextLevelRequirements = [...data.nextLevelRequirements];
    this._isLevelProgression = data.isLevelProgression;

    // Validation & Quality
    this._validationFlags = [...data.validationFlags];
    this._humanReviewRequired = data.humanReviewRequired;
    this._humanReviewNotes = data.humanReviewNotes;

    this.validateInvariants();
  }

  public static async create(data: AssessmentData): Promise<Assessment> {
    const id = await AssessmentID.generate();
    const assessment = new Assessment(data, id);

    // TODO: Uncomment when domain events are ready
    // assessment.addDomainEvent(new AssessmentCreated(
    //   assessment.getId(),
    //   data.personId,
    //   data.competencyType,
    //   data.ccisLevel,
    //   data.assessmentDate
    // ));

    return assessment;
  }

  // Required by AggregateRoot
  protected createDeletedEvent(): any {
    return {
      assessmentId: this.getId().toString(),
      personId: this.personId.toString(),
      competencyType: this.competencyType.toString(),
      deletedAt: new Date(),
    };
  }

  // Getters
  public getCcisLevel(): CCISLevel {
    return this._ccisLevel;
  }

  public getConfidenceScore(): ConfidenceScore {
    return this._confidenceScore;
  }

  public getBehavioralSignals(): BehavioralSignals {
    return this._behavioralSignals;
  }

  public getAiReasoningTrace(): string {
    return this._aiReasoningTrace;
  }

  public getAiModelUsed(): string {
    return this._aiModelUsed;
  }

  public getAiPromptVersion(): string {
    return this._aiPromptVersion;
  }

  public getTaskIds(): string[] {
    return [...this._taskIds];
  }

  public getSessionDuration(): number {
    return this._sessionDuration;
  }

  public getDistractionEvents(): number {
    return this._distractionEvents;
  }

  public getPreviousCcisLevel(): CCISLevel | undefined {
    return this._previousCcisLevel;
  }

  public getNextLevelRequirements(): string[] {
    return [...this._nextLevelRequirements];
  }

  public isLevelProgression(): boolean {
    return this._isLevelProgression;
  }

  public getValidationFlags(): string[] {
    return [...this._validationFlags];
  }

  public isHumanReviewRequired(): boolean {
    return this._humanReviewRequired;
  }

  public getHumanReviewNotes(): string | undefined {
    return this._humanReviewNotes;
  }

  // Business Logic Methods
  public validateAssessment(): boolean {
    // Check confidence threshold
    if (this._confidenceScore.requiresHumanReview()) {
      this._humanReviewRequired = true;
      this._validationFlags.push('LOW_CONFIDENCE');
    }

    // Check for gaming patterns (simplified)
    const hintFreq = this._behavioralSignals.getHintRequestFrequency();
    if (hintFreq > 15) {
      this._validationFlags.push('GAMING_DETECTED');
      this._humanReviewRequired = true;
    }

    return this._validationFlags.length === 0;
  }

  public addHumanReviewNotes(notes: string): void {
    this._humanReviewNotes = notes;
  }

  public approveAfterHumanReview(): void {
    this._humanReviewRequired = false;
    this._validationFlags = this._validationFlags.filter(
      (flag) => flag !== 'LOW_CONFIDENCE' && flag !== 'GAMING_DETECTED',
    );
  }

  public getAssessmentSummary(): {
    ccisLevel: number;
    confidenceScore: number;
    competencyType: string;
    isValid: boolean;
    requiresReview: boolean;
  } {
    return {
      ccisLevel: this._ccisLevel.getLevel(),
      confidenceScore: this._confidenceScore.getScore(),
      competencyType: this.competencyType.toString(),
      isValid: this._validationFlags.length === 0,
      requiresReview: this._humanReviewRequired,
    };
  }

  private validateInvariants(): void {
    if (!this.personId) {
      throw new BusinessRuleException(
        'Assessment must have a valid person ID',
        'assessment',
      );
    }

    if (!this.competencyType) {
      throw new BusinessRuleException(
        'Assessment must have a valid competency type',
        'assessment',
      );
    }

    if (this._taskIds.length === 0) {
      throw new BusinessRuleException(
        'Assessment must include at least one task',
        'assessment',
      );
    }

    if (this._sessionDuration <= 0) {
      throw new BusinessRuleException(
        'Assessment session duration must be positive',
        'assessment',
      );
    }

    if (this._aiReasoningTrace.length === 0) {
      throw new BusinessRuleException(
        'Assessment must include AI reasoning trace',
        'assessment',
      );
    }
  }
}
