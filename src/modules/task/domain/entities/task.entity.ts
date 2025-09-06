import { AggregateRoot } from '../../../../shared/base/aggregate.root';
import { DomainEvent } from '../../../../shared/base/domain-event.base';
import { TaskId } from '../value-objects/task-id.value-object';
import { CompetencyId } from '../value-objects/competency-id.value-object';
import { TaskType } from '../value-objects/task-type.value-object';
import { TaskCategory } from '../value-objects/task-category.value-object';
import { TaskDifficulty } from '../value-objects/task-difficulty.value-object';
import { TaskDuration } from '../value-objects/task-duration.value-object';
import {
  InvalidTaskConfigurationError,
  InvalidCCISLevelError,
  InvalidTaskContentError,
  HintGenerationError,
  TaskRecommendationError,
} from '../exceptions/task.exceptions';
import {
  TaskCreatedEvent,
  TaskCompletedEvent,
  TaskDifficultyRecalibrationEvent,
  TaskContentUpdatedEvent,
  TaskRecommendationGeneratedEvent,
  TaskTransferVariationCreatedEvent,
  TaskDeprecatedEvent,
} from '../events/task.events';

/**
 * Task Content Blocks Interface
 * Structured content for rendering tasks in the UI
 */
export interface TaskContentBlocks {
  introduction?: {
    type: 'text' | 'video' | 'image';
    content: string;
    metadata?: Record<string, any>;
  };
  instructions: {
    type: 'text' | 'numbered_list' | 'checklist';
    content: string | string[];
    formatting?: 'markdown' | 'html' | 'plain';
  };
  examples?: Array<{
    type: 'text' | 'code' | 'scenario' | 'case_study';
    title: string;
    content: string;
    explanation?: string;
  }>;
  resources?: Array<{
    type: 'link' | 'document' | 'video' | 'tool';
    title: string;
    url: string;
    description?: string;
  }>;
  interactive?: {
    type: 'form' | 'code_editor' | 'canvas' | 'simulation';
    config: Record<string, any>;
  };
}

/**
 * Success Criteria Interface
 * Defines measurable outcomes for task completion
 */
export interface SuccessCriteria {
  passingThreshold: number; // 0.0-1.0
  criteria: Array<{
    id: string;
    description: string;
    weight: number; // 0.0-1.0
    type: 'automated' | 'manual' | 'ai_assessed';
    validator?: string; // Function name or AI prompt
  }>;
  bonusCriteria?: Array<{
    id: string;
    description: string;
    points: number;
  }>;
}

/**
 * Assessment Rubric Interface
 * Detailed scoring criteria for qualitative assessment
 */
export interface AssessmentRubric {
  dimensions: Array<{
    id: string;
    name: string;
    description: string;
    weight: number; // 0.0-1.0
    levels: Array<{
      score: number;
      label: string;
      description: string;
      indicators: string[];
    }>;
  }>;
  scoringMethod: 'weighted_average' | 'holistic' | 'threshold';
  passingScore: number;
}

/**
 * CCIS Level Hints Interface
 * Adaptive hints based on student independence level
 */
export interface CCISLevelHints {
  level1: Array<{
    trigger: 'time_delay' | 'incorrect_attempt' | 'request';
    delay: number; // seconds
    content: string;
    type: 'step_by_step' | 'example' | 'guidance';
  }>;
  level2: Array<{
    trigger: 'time_delay' | 'incorrect_attempt' | 'request';
    delay: number;
    content: string;
    type: 'strategic_question' | 'framework' | 'checklist';
  }>;
  level3: Array<{
    trigger: 'request' | 'multiple_attempts';
    content: string;
    type: 'validation_check' | 'resource_pointer' | 'alternative_approach';
  }>;
  level4: []; // No hints for autonomous learners
}

/**
 * Scaffolding Configuration Interface
 * Adaptive support configuration by CCIS level
 */
export interface ScaffoldingConfiguration {
  level1: {
    hintStrategy: 'proactive' | 'reactive';
    triggerDelay: number; // seconds
    detailLevel: 'high' | 'medium' | 'low';
    maxHints: number;
    supportType: 'step_by_step' | 'guided' | 'example_heavy';
  };
  level2: {
    hintStrategy: 'reactive' | 'on_request';
    triggerDelay: number;
    detailLevel: 'medium' | 'low';
    maxHints: number;
    supportType: 'strategic' | 'framework' | 'checklist';
  };
  level3: {
    hintStrategy: 'on_request';
    triggerDelay: number;
    detailLevel: 'low';
    maxHints: number;
    supportType: 'validation' | 'resource' | 'minimal';
  };
  level4: {
    hintStrategy: 'none';
    triggerDelay: 0;
    detailLevel: 'none';
    maxHints: 0;
    supportType: 'none';
  };
}

/**
 * Task Aggregate Root
 *
 * Core domain entity representing an individual learning task in the CCIS system.
 * Encapsulates all business logic for task behavior, adaptive scaffolding,
 * completion assessment, and behavioral signal collection.
 *
 * Key Responsibilities:
 * - Generate adaptive hints based on student CCIS level
 * - Assess task completion against success criteria
 * - Recommend appropriateness for students
 * - Track performance for difficulty calibration
 * - Generate transfer learning variations
 */
export class Task extends AggregateRoot<TaskId> {
  private constructor(
    id: TaskId,
    private readonly _title: string,
    private readonly _description: string,
    private readonly _instructions: string,
    private readonly _context: string,
    private _expectedDuration: TaskDuration,
    private _difficultyLevel: TaskDifficulty,
    private readonly _competencyId: CompetencyId,
    private readonly _targetCCISLevel: number,
    private readonly _ccisLevelRange: [number, number],
    private readonly _taskType: TaskType,
    private readonly _taskCategory: TaskCategory,
    private readonly _contentBlocks: TaskContentBlocks,
    private readonly _successCriteria: SuccessCriteria,
    private readonly _assessmentRubric: AssessmentRubric,
    private readonly _hintsAvailable: CCISLevelHints,
    private readonly _scaffoldingConfig: ScaffoldingConfiguration,
    private _averageCompletionTime?: number,
    private _averageSuccessRate?: number,
    private _totalAttempts?: number,
    private _tags?: string[],
    private _industryScenario?: string,
    private _prerequisiteTasks?: TaskId[],
    private _followUpTasks?: TaskId[],
    private _relatedTasks?: TaskId[],
    private _publishedAt?: Date,
    private _deprecatedAt?: Date,
    private _lastValidationDate?: Date,
    private _contentVersion?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id);
    this.validateTaskConfiguration();
  }

  /**
   * Creates a new Task with validation
   */
  public static create(
    title: string,
    description: string,
    instructions: string,
    context: string,
    expectedDuration: number,
    competencyId: CompetencyId,
    targetCCISLevel: number,
    taskType: TaskType,
    taskCategory: TaskCategory,
    contentBlocks: TaskContentBlocks,
    successCriteria: SuccessCriteria,
    assessmentRubric: AssessmentRubric,
    options?: {
      industryScenario?: string;
      prerequisiteTasks?: TaskId[];
      tags?: string[];
    },
  ): Task {
    const taskId = TaskId.generateSync();
    const duration = TaskDuration.fromMinutes(expectedDuration);
    const difficulty = TaskDifficulty.fromCCISLevelAndType(
      targetCCISLevel,
      taskType.getValue(),
    );

    // Generate CCIS level range (target level ± 1, clamped to 1-4)
    const ccisLevelRange: [number, number] = [
      Math.max(1, targetCCISLevel - 1),
      Math.min(4, targetCCISLevel + 1),
    ];

    // Generate default hints and scaffolding
    const hintsAvailable = Task.generateDefaultHints(taskType, taskCategory);
    const scaffoldingConfig = Task.generateDefaultScaffolding();

    const task = new Task(
      taskId,
      title,
      description,
      instructions,
      context,
      duration,
      difficulty,
      competencyId,
      targetCCISLevel,
      ccisLevelRange,
      taskType,
      taskCategory,
      contentBlocks,
      successCriteria,
      assessmentRubric,
      hintsAvailable,
      scaffoldingConfig,
      undefined, // averageCompletionTime
      undefined, // averageSuccessRate
      0, // totalAttempts
      options?.tags || [],
      options?.industryScenario,
      options?.prerequisiteTasks || [],
      [], // followUpTasks
      [], // relatedTasks
      undefined, // publishedAt
      undefined, // deprecatedAt
      undefined, // lastValidationDate
      '1.0.0', // contentVersion
    );

    task.addDomainEvent(
      new TaskCreatedEvent(
        taskId,
        competencyId,
        targetCCISLevel,
        'system', // createdBy - will be properly set in application layer
      ),
    );

    return task;
  }

  /**
   * Reconstructs Task from persistence
   */
  public static fromPersistence(
    id: TaskId,
    title: string,
    description: string,
    instructions: string,
    context: string,
    expectedDuration: TaskDuration,
    difficultyLevel: TaskDifficulty,
    competencyId: CompetencyId,
    targetCCISLevel: number,
    ccisLevelRange: [number, number],
    taskType: TaskType,
    taskCategory: TaskCategory,
    contentBlocks: TaskContentBlocks,
    successCriteria: SuccessCriteria,
    assessmentRubric: AssessmentRubric,
    hintsAvailable: CCISLevelHints,
    scaffoldingConfig: ScaffoldingConfiguration,
    metadata: {
      averageCompletionTime?: number;
      averageSuccessRate?: number;
      totalAttempts?: number;
      tags?: string[];
      industryScenario?: string;
      prerequisiteTasks?: TaskId[];
      followUpTasks?: TaskId[];
      relatedTasks?: TaskId[];
      publishedAt?: Date;
      deprecatedAt?: Date;
      lastValidationDate?: Date;
      contentVersion?: string;
    },
    createdAt?: Date,
    updatedAt?: Date,
  ): Task {
    return new Task(
      id,
      title,
      description,
      instructions,
      context,
      expectedDuration,
      difficultyLevel,
      competencyId,
      targetCCISLevel,
      ccisLevelRange,
      taskType,
      taskCategory,
      contentBlocks,
      successCriteria,
      assessmentRubric,
      hintsAvailable,
      scaffoldingConfig,
      metadata.averageCompletionTime,
      metadata.averageSuccessRate,
      metadata.totalAttempts,
      metadata.tags,
      metadata.industryScenario,
      metadata.prerequisiteTasks,
      metadata.followUpTasks,
      metadata.relatedTasks,
      metadata.publishedAt,
      metadata.deprecatedAt,
      metadata.lastValidationDate,
      metadata.contentVersion,
      createdAt,
      updatedAt,
    );
  }

  // Getters
  public get title(): string {
    return this._title;
  }
  public get description(): string {
    return this._description;
  }
  public get instructions(): string {
    return this._instructions;
  }
  public get context(): string {
    return this._context;
  }
  public get expectedDuration(): TaskDuration {
    return this._expectedDuration;
  }
  public get difficultyLevel(): TaskDifficulty {
    return this._difficultyLevel;
  }
  public get competencyId(): CompetencyId {
    return this._competencyId;
  }
  public get targetCCISLevel(): number {
    return this._targetCCISLevel;
  }
  public get ccisLevelRange(): [number, number] {
    return this._ccisLevelRange;
  }
  public get taskType(): TaskType {
    return this._taskType;
  }
  public get taskCategory(): TaskCategory {
    return this._taskCategory;
  }
  public get contentBlocks(): TaskContentBlocks {
    return this._contentBlocks;
  }
  public get successCriteria(): SuccessCriteria {
    return this._successCriteria;
  }
  public get assessmentRubric(): AssessmentRubric {
    return this._assessmentRubric;
  }
  public get hintsAvailable(): CCISLevelHints {
    return this._hintsAvailable;
  }
  public get scaffoldingConfig(): ScaffoldingConfiguration {
    return this._scaffoldingConfig;
  }
  public get averageCompletionTime(): number | undefined {
    return this._averageCompletionTime;
  }
  public get averageSuccessRate(): number | undefined {
    return this._averageSuccessRate;
  }
  public get totalAttempts(): number | undefined {
    return this._totalAttempts;
  }
  public get tags(): string[] {
    return this._tags || [];
  }
  public get industryScenario(): string | undefined {
    return this._industryScenario;
  }
  public get prerequisiteTasks(): TaskId[] {
    return this._prerequisiteTasks || [];
  }
  public get followUpTasks(): TaskId[] {
    return this._followUpTasks || [];
  }
  public get relatedTasks(): TaskId[] {
    return this._relatedTasks || [];
  }
  public get publishedAt(): Date | undefined {
    return this._publishedAt;
  }
  public get deprecatedAt(): Date | undefined {
    return this._deprecatedAt;
  }
  public get lastValidationDate(): Date | undefined {
    return this._lastValidationDate;
  }
  public get contentVersion(): string | undefined {
    return this._contentVersion;
  }

  /**
   * Core behavior: Generate adaptive hints based on student CCIS level
   */
  public generateAdaptiveHints(
    studentCCISLevel: number,
    struggleDuration: number,
    context?: string,
  ): AdaptiveHintResponse {
    try {
      const hintStrategy = this.getHintStrategyForLevel(studentCCISLevel);

      if (struggleDuration < hintStrategy.triggerDelay) {
        return AdaptiveHintResponse.noHint(
          "Continue working - you're doing well!",
        );
      }

      const availableHints = this.getHintsForLevel(studentCCISLevel);
      const contextualHint = this.selectContextualHint(availableHints, context);

      return new AdaptiveHintResponse(
        contextualHint.content,
        hintStrategy.detailLevel,
        this.calculateNextHintTiming(studentCCISLevel, struggleDuration),
        contextualHint.type,
      );
    } catch (error) {
      throw new HintGenerationError(
        `Failed to generate hint: ${error.message}`,
      );
    }
  }

  /**
   * Core behavior: Assess task completion
   */
  public assessCompletion(
    submissionData: TaskSubmissionData,
  ): TaskCompletionAssessment {
    const rubricScore = this.evaluateRubric(submissionData);
    const criteriaScore = this.evaluateSuccessCriteria(submissionData);

    const isSuccessful =
      criteriaScore.score >= this._successCriteria.passingThreshold;
    const qualityLevel = this.determineQualityLevel(rubricScore.totalScore);

    // Emit domain event for CCIS assessment
    this.addDomainEvent(
      new TaskCompletedEvent(
        this.getId(),
        submissionData.studentId,
        isSuccessful,
        rubricScore,
        submissionData.behavioralSignals || {},
      ),
    );

    return new TaskCompletionAssessment(
      isSuccessful,
      qualityLevel,
      rubricScore,
      criteriaScore,
      this.generateCompletionFeedback(rubricScore, criteriaScore),
      this.collectBehavioralSignals(submissionData),
    );
  }

  /**
   * Core behavior: Determine task appropriateness for student
   */
  public shouldRecommendToStudent(
    studentProfile: StudentProfile,
  ): TaskRecommendationResult {
    try {
      // Check prerequisite completion
      if (!this.arePrerequisitesMet(studentProfile)) {
        return TaskRecommendationResult.notRecommended(
          'Some prerequisite tasks are not yet completed',
        );
      }

      // Check CCIS level appropriateness
      const studentCCISLevel = studentProfile.getCCISLevel(this._competencyId);
      if (!this.isAppropriateForCCISLevel(studentCCISLevel)) {
        return TaskRecommendationResult.notRecommended(
          `Task is designed for CCIS levels ${this._ccisLevelRange[0]}-${this._ccisLevelRange[1]}, student is at level ${studentCCISLevel}`,
        );
      }

      // Calculate recommendation strength
      const recommendationStrength =
        this.calculateRecommendationStrength(studentProfile);

      const result = TaskRecommendationResult.recommended(
        recommendationStrength,
        this.generateRecommendationReason(studentProfile),
      );

      // Emit domain event for analytics
      this.addDomainEvent(
        new TaskRecommendationGeneratedEvent(
          this.getId(),
          studentProfile.studentId,
          recommendationStrength,
          [result.reason],
        ),
      );

      return result;
    } catch (error) {
      throw new TaskRecommendationError(
        `Failed to generate recommendation: ${error.message}`,
      );
    }
  }

  /**
   * Core behavior: Update difficulty calibration based on performance
   */
  public updateDifficultyCalibration(
    performanceData: TaskPerformanceData,
  ): void {
    if (!performanceData.hasEnoughData()) {
      return; // Need more data for calibration
    }

    const newDifficulty = TaskDifficulty.fromPerformanceData(
      performanceData.successRate,
      performanceData.averageAttempts,
      performanceData.timeVariance,
    );

    const calibrationDrift = Math.abs(
      newDifficulty.getValue() - this._difficultyLevel.getValue(),
    );

    if (calibrationDrift > 0.1) {
      // Significant drift threshold
      const previousDifficulty = this._difficultyLevel.getValue();
      this._difficultyLevel = newDifficulty;

      this.addDomainEvent(
        new TaskDifficultyRecalibrationEvent(
          this.getId(),
          previousDifficulty,
          newDifficulty.getValue(),
          calibrationDrift,
        ),
      );
    }

    // Update performance metrics
    this._averageCompletionTime = performanceData.averageCompletionTime;
    this._averageSuccessRate = performanceData.successRate;
    this._totalAttempts = performanceData.totalAttempts;
  }

  /**
   * Core behavior: Generate transfer learning variation
   */
  public generateTransferVariation(): Task {
    const transferId = TaskId.generateSync();
    const novelContext = this.generateNovelContext();
    const adaptedInstructions = this.adaptInstructionsForTransfer();

    // Slightly increase difficulty for transfer challenges
    const transferDifficulty = TaskDifficulty.fromNumber(
      Math.min(1.0, this._difficultyLevel.getValue() * 1.1),
    );

    const transferTask = new Task(
      transferId,
      `${this._title} - Transfer Challenge`,
      this._description,
      adaptedInstructions,
      novelContext,
      this._expectedDuration.adjustForDifficulty(transferDifficulty.getValue()),
      transferDifficulty,
      this._competencyId,
      this._targetCCISLevel,
      this._ccisLevelRange,
      this._taskType,
      this._taskCategory,
      this.adaptContentForTransfer(),
      this._successCriteria,
      this._assessmentRubric,
      this._hintsAvailable,
      this._scaffoldingConfig,
      undefined, // New task, no performance data
      undefined,
      0,
      [...(this._tags || []), 'transfer_variation'],
      this._industryScenario,
    );

    this.addDomainEvent(
      new TaskTransferVariationCreatedEvent(
        this.getId(),
        transferId,
        'contextual_transfer',
      ),
    );

    return transferTask;
  }

  /**
   * Publishes the task for student access
   */
  public publish(): void {
    if (this._publishedAt) {
      throw new InvalidTaskConfigurationError('Task is already published');
    }

    this.validateReadinessForPublication();
    this._publishedAt = new Date();
  }

  /**
   * Deprecates the task (soft delete)
   */
  public deprecate(reason: string): void {
    if (this._deprecatedAt) {
      throw new InvalidTaskConfigurationError('Task is already deprecated');
    }

    this._deprecatedAt = new Date();
    this.addDomainEvent(new TaskDeprecatedEvent(this.getId(), reason));
  }

  /**
   * Checks if task is published and available
   */
  public isAvailable(): boolean {
    return this._publishedAt !== undefined && this._deprecatedAt === undefined;
  }

  /**
   * Checks if task is deprecated
   */
  public isDeprecated(): boolean {
    return this._deprecatedAt !== undefined;
  }

  /**
   * Create domain event for task deletion (required by AggregateRoot)
   */
  protected createDeletedEvent(): DomainEvent {
    return new TaskDeprecatedEvent(this.getId(), 'Task deleted');
  }

  // Private helper methods

  private validateTaskConfiguration(): void {
    if (!this._title?.trim()) {
      throw new InvalidTaskConfigurationError('Task title cannot be empty');
    }

    if (!this._description?.trim()) {
      throw new InvalidTaskConfigurationError(
        'Task description cannot be empty',
      );
    }

    if (!this._instructions?.trim()) {
      throw new InvalidTaskConfigurationError(
        'Task instructions cannot be empty',
      );
    }

    if (!this._context?.trim()) {
      throw new InvalidTaskConfigurationError('Task context cannot be empty');
    }

    if (this._targetCCISLevel < 1 || this._targetCCISLevel > 4) {
      throw new InvalidCCISLevelError('Target CCIS level must be between 1-4');
    }

    if (
      !this._expectedDuration.isCompatibleWithTaskType(
        this._taskType.getValue(),
      )
    ) {
      throw new InvalidTaskConfigurationError(
        `Duration ${this._expectedDuration.getValue()} minutes is not compatible with task type ${this._taskType.getValue()}`,
      );
    }

    this.validateContentBlocks();
    this.validateSuccessCriteria();
    this.validateAssessmentRubric();
  }

  private validateContentBlocks(): void {
    if (!this._contentBlocks?.instructions) {
      throw new InvalidTaskContentError(
        'Content blocks must include instructions',
      );
    }
  }

  private validateSuccessCriteria(): void {
    if (!this._successCriteria?.criteria?.length) {
      throw new InvalidTaskContentError(
        'Success criteria must include at least one criterion',
      );
    }

    const totalWeight = this._successCriteria.criteria.reduce(
      (sum, criterion) => sum + criterion.weight,
      0,
    );
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      throw new InvalidTaskContentError(
        'Success criteria weights must sum to 1.0',
      );
    }
  }

  private validateAssessmentRubric(): void {
    if (!this._assessmentRubric?.dimensions?.length) {
      throw new InvalidTaskContentError(
        'Assessment rubric must include at least one dimension',
      );
    }

    const totalWeight = this._assessmentRubric.dimensions.reduce(
      (sum, dim) => sum + dim.weight,
      0,
    );
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      throw new InvalidTaskContentError(
        'Assessment rubric dimension weights must sum to 1.0',
      );
    }
  }

  private validateReadinessForPublication(): void {
    if (!this._industryScenario) {
      throw new InvalidTaskConfigurationError(
        'Industry scenario required before publication',
      );
    }

    if (!this._lastValidationDate) {
      throw new InvalidTaskConfigurationError(
        'Task must be validated before publication',
      );
    }

    // Check if validation is recent (within 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    if (this._lastValidationDate < sixMonthsAgo) {
      throw new InvalidTaskConfigurationError(
        'Task validation is outdated, re-validation required',
      );
    }
  }

  // Helper methods will be implemented in the next part due to length constraints
  private static generateDefaultHints(
    taskType: TaskType,
    taskCategory: TaskCategory,
  ): CCISLevelHints {
    // Simplified default hints - in real implementation, this would use LLM
    return {
      level1: [
        {
          trigger: 'time_delay',
          delay: 10,
          content: 'Start by reading the instructions carefully...',
          type: 'step_by_step',
        },
      ],
      level2: [
        {
          trigger: 'time_delay',
          delay: 30,
          content: 'What approach would you take to solve this?',
          type: 'strategic_question',
        },
      ],
      level3: [
        {
          trigger: 'request',
          content: 'Check if your solution addresses all requirements',
          type: 'validation_check',
        },
      ],
      level4: [],
    };
  }

  private static generateDefaultScaffolding(): ScaffoldingConfiguration {
    return {
      level1: {
        hintStrategy: 'proactive',
        triggerDelay: 10,
        detailLevel: 'high',
        maxHints: 3,
        supportType: 'step_by_step',
      },
      level2: {
        hintStrategy: 'reactive',
        triggerDelay: 30,
        detailLevel: 'medium',
        maxHints: 2,
        supportType: 'strategic',
      },
      level3: {
        hintStrategy: 'on_request',
        triggerDelay: 60,
        detailLevel: 'low',
        maxHints: 1,
        supportType: 'validation',
      },
      level4: {
        hintStrategy: 'none',
        triggerDelay: 0,
        detailLevel: 'none',
        maxHints: 0,
        supportType: 'none',
      },
    };
  }

  private getHintStrategyForLevel(ccisLevel: number) {
    switch (ccisLevel) {
      case 1:
        return this._scaffoldingConfig.level1;
      case 2:
        return this._scaffoldingConfig.level2;
      case 3:
        return this._scaffoldingConfig.level3;
      case 4:
        return this._scaffoldingConfig.level4;
      default:
        return this._scaffoldingConfig.level2;
    }
  }

  private getHintsForLevel(ccisLevel: number) {
    switch (ccisLevel) {
      case 1:
        return this._hintsAvailable.level1;
      case 2:
        return this._hintsAvailable.level2;
      case 3:
        return this._hintsAvailable.level3;
      case 4:
        return this._hintsAvailable.level4;
      default:
        return this._hintsAvailable.level2;
    }
  }

  private selectContextualHint(hints: any[], context?: string) {
    // Simplified selection - in real implementation, this would use AI
    return hints[0] || { content: 'Keep working!', type: 'encouragement' };
  }

  private calculateNextHintTiming(
    ccisLevel: number,
    currentStruggleDuration: number,
  ): number {
    const strategy = this.getHintStrategyForLevel(ccisLevel);
    return currentStruggleDuration + strategy.triggerDelay;
  }

  private evaluateRubric(submissionData: TaskSubmissionData): RubricScore {
    // Placeholder - real implementation would include AI assessment
    return {
      totalScore: 0.8,
      dimensionScores: {},
      feedback: [],
    };
  }

  private evaluateSuccessCriteria(
    submissionData: TaskSubmissionData,
  ): CriteriaScore {
    // Placeholder - real implementation would evaluate each criterion
    return {
      score: 0.85,
      details: {},
      passedCriteria: [],
      failedCriteria: [],
    };
  }

  private determineQualityLevel(score: number): string {
    if (score >= 0.9) return 'EXCELLENT';
    if (score >= 0.8) return 'GOOD';
    if (score >= 0.7) return 'SATISFACTORY';
    if (score >= 0.6) return 'NEEDS_IMPROVEMENT';
    return 'POOR';
  }

  private generateCompletionFeedback(
    rubricScore: RubricScore,
    criteriaScore: CriteriaScore,
  ): string {
    return `Task completed with ${Math.round(criteriaScore.score * 100)}% success rate. Good work!`;
  }

  private collectBehavioralSignals(
    submissionData: TaskSubmissionData,
  ): Record<string, any> {
    return {
      timeSpent: submissionData.timeSpent,
      hintsRequested: submissionData.hintsRequested || 0,
      attempts: submissionData.attempts || 1,
      confidenceRating: submissionData.confidenceRating,
    };
  }

  private arePrerequisitesMet(studentProfile: StudentProfile): boolean {
    if (!this._prerequisiteTasks?.length) return true;
    // Simplified check - real implementation would verify completion
    return true;
  }

  private isAppropriateForCCISLevel(studentCCISLevel: number): boolean {
    return (
      studentCCISLevel >= this._ccisLevelRange[0] &&
      studentCCISLevel <= this._ccisLevelRange[1]
    );
  }

  private calculateRecommendationStrength(
    studentProfile: StudentProfile,
  ): number {
    // Simplified calculation - real implementation would be more sophisticated
    const ccisLevel = studentProfile.getCCISLevel(this._competencyId);
    const levelMatch = 1 - Math.abs(ccisLevel - this._targetCCISLevel) * 0.2;
    return Math.max(0.1, Math.min(1.0, levelMatch));
  }

  private generateRecommendationReason(studentProfile: StudentProfile): string {
    const ccisLevel = studentProfile.getCCISLevel(this._competencyId);
    return `This task is well-suited for your current CCIS level ${ccisLevel} in ${this._taskCategory.getDisplayName()}`;
  }

  private generateNovelContext(): string {
    // Simplified - real implementation would use LLM for context generation
    return this._context
      .replace(/company A/gi, 'company B')
      .replace(/scenario 1/gi, 'scenario 2');
  }

  private adaptInstructionsForTransfer(): string {
    // Simplified - real implementation would use LLM for instruction adaptation
    return (
      this._instructions +
      '\n\nNote: Apply the same principles in this new context.'
    );
  }

  private adaptContentForTransfer(): TaskContentBlocks {
    // Simplified - real implementation would adapt all content blocks
    return { ...this._contentBlocks };
  }
}

// Supporting types and classes (to be defined in separate files)
export interface TaskSubmissionData {
  studentId: string;
  responses: Record<string, any>;
  timeSpent: number;
  hintsRequested?: number;
  attempts?: number;
  confidenceRating?: number;
  behavioralSignals?: Record<string, any>;
}

export interface StudentProfile {
  studentId: string;
  getCCISLevel(competencyId: CompetencyId): number;
}

export interface TaskPerformanceData {
  successRate: number;
  averageAttempts: number;
  timeVariance: number;
  averageCompletionTime: number;
  totalAttempts: number;
  hasEnoughData(): boolean;
}

export class AdaptiveHintResponse {
  constructor(
    public readonly content: string,
    public readonly detailLevel: string,
    public readonly nextHintTiming: number,
    public readonly type: string,
  ) {}

  public static noHint(message: string): AdaptiveHintResponse {
    return new AdaptiveHintResponse(message, 'none', 0, 'none');
  }
}

export interface RubricScore {
  totalScore: number;
  dimensionScores: Record<string, number>;
  feedback: string[];
}

export interface CriteriaScore {
  score: number;
  details: Record<string, any>;
  passedCriteria: string[];
  failedCriteria: string[];
}

export class TaskCompletionAssessment {
  constructor(
    public readonly isSuccessful: boolean,
    public readonly qualityLevel: string,
    public readonly rubricScore: RubricScore,
    public readonly criteriaScore: CriteriaScore,
    public readonly feedback: string,
    public readonly behavioralSignals: Record<string, any>,
  ) {}
}

export class TaskRecommendationResult {
  private constructor(
    public readonly isRecommended: boolean,
    public readonly strength: number,
    public readonly reason: string,
  ) {}

  public static recommended(
    strength: number,
    reason: string,
  ): TaskRecommendationResult {
    return new TaskRecommendationResult(true, strength, reason);
  }

  public static notRecommended(reason: string): TaskRecommendationResult {
    return new TaskRecommendationResult(false, 0, reason);
  }
}
