import {
  DomainExceptionBase,
  DomainExceptionCategory,
  DomainExceptionSeverity,
} from '../../../../shared/domain/exceptions/domain-exception.base';

/**
 * Base class for all Task-related domain exceptions
 */
export abstract class TaskDomainException extends DomainExceptionBase {
  constructor(
    message: string,
    code: string,
    category: DomainExceptionCategory = DomainExceptionCategory.VALIDATION,
  ) {
    super(message, code, category);
  }
}

/**
 * Thrown when TaskId format is invalid
 */
export class InvalidTaskIdError extends TaskDomainException {
  constructor(message: string) {
    super(message, 'INVALID_TASK_ID');
  }
}

/**
 * Thrown when task configuration is invalid
 */
export class InvalidTaskConfigurationError extends TaskDomainException {
  constructor(message: string) {
    super(message, 'INVALID_TASK_CONFIGURATION');
  }
}

/**
 * Thrown when task type is invalid
 */
export class InvalidTaskTypeError extends TaskDomainException {
  constructor(message: string) {
    super(message, 'INVALID_TASK_TYPE');
  }
}

/**
 * Thrown when task category is invalid
 */
export class InvalidTaskCategoryError extends TaskDomainException {
  constructor(message: string) {
    super(message, 'INVALID_TASK_CATEGORY');
  }
}

/**
 * Thrown when CCIS level is invalid for task
 */
export class InvalidCCISLevelError extends TaskDomainException {
  constructor(message: string) {
    super(message, 'INVALID_CCIS_LEVEL');
  }
}

/**
 * Thrown when task difficulty is invalid
 */
export class InvalidDifficultyLevelError extends TaskDomainException {
  constructor(message: string) {
    super(message, 'INVALID_DIFFICULTY_LEVEL');
  }
}

/**
 * Thrown when task duration is invalid
 */
export class InvalidTaskDurationError extends TaskDomainException {
  constructor(message: string) {
    super(message, 'INVALID_TASK_DURATION');
  }
}

/**
 * Thrown when task content is invalid
 */
export class InvalidTaskContentError extends TaskDomainException {
  constructor(message: string) {
    super(message, 'INVALID_TASK_CONTENT');
  }
}

/**
 * Thrown when task cannot be found
 */
export class TaskNotFoundError extends TaskDomainException {
  constructor(taskId: string) {
    super(`Task with ID ${taskId} not found`, 'TASK_NOT_FOUND');
  }
}

/**
 * Thrown when task access is not allowed
 */
export class TaskAccessDeniedError extends TaskDomainException {
  constructor(message: string) {
    super(message, 'TASK_ACCESS_DENIED');
  }
}

/**
 * Thrown when task submission is invalid
 */
export class InvalidTaskSubmissionError extends TaskDomainException {
  constructor(message: string) {
    super(message, 'INVALID_TASK_SUBMISSION');
  }
}

/**
 * Thrown when task hint generation fails
 */
export class HintGenerationError extends TaskDomainException {
  constructor(message: string) {
    super(message, 'HINT_GENERATION_ERROR');
  }
}

/**
 * Thrown when task recommendation fails
 */
export class TaskRecommendationError extends TaskDomainException {
  constructor(message: string) {
    super(message, 'TASK_RECOMMENDATION_ERROR');
  }
}

/**
 * Thrown when task difficulty calibration fails
 */
export class DifficultyCalibrationError extends TaskDomainException {
  constructor(message: string) {
    super(message, 'DIFFICULTY_CALIBRATION_ERROR');
  }
}
