import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { Task } from '../../domain/entities/task.entity';
import { TaskId } from '../../domain/value-objects/task-id.value-object';
import { CompetencyId } from '../../domain/value-objects/competency-id.value-object';
import { TaskType } from '../../domain/value-objects/task-type.value-object';
import { TaskCategory } from '../../domain/value-objects/task-category.value-object';
import { TaskDifficulty } from '../../domain/value-objects/task-difficulty.value-object';
import { TaskDuration } from '../../domain/value-objects/task-duration.value-object';
import {
  CreateTaskDto,
  UpdateTaskDto,
  GetTasksQueryDto,
  PaginationDto,
  TaskSubmissionDto,
  HintRequestDto,
} from '../dtos/task-request.dtos';
import {
  TaskResponseDto,
  DetailedTaskResponseDto,
  TaskCompletionResponseDto,
  HintResponseDto,
  PaginatedResponse,
} from '../dtos/task-response.dtos';
import {
  TASK_REPOSITORY,
  AI_SERVICE,
  ANALYTICS_SERVICE,
  CCIS_SERVICE,
} from '../../task.tokens';

/**
 * Task Repository Interface
 * Defines contract for task data persistence
 */
export interface ITaskRepository {
  save(task: Task): Promise<Task>;
  findById(id: TaskId): Promise<Task | null>;
  findByCompetencyId(
    competencyId: CompetencyId,
    options?: Partial<GetTasksQueryDto>,
  ): Promise<Task[]>;
  findAll(
    options?: Partial<GetTasksQueryDto>,
  ): Promise<{ tasks: Task[]; total: number }>;
  findByCategory(category: TaskCategory): Promise<Task[]>;
  findByType(type: TaskType): Promise<Task[]>;
  findByDifficultyRange(min: number, max: number): Promise<Task[]>;
  findByCCISLevel(level: number): Promise<Task[]>;
  findByTags(tags: string[]): Promise<Task[]>;
  findWithPrerequisites(prerequisites: TaskId[]): Promise<Task[]>;
  findPublished(options?: Partial<GetTasksQueryDto>): Promise<Task[]>;
  delete(id: TaskId): Promise<void>;
  exists(id: TaskId): Promise<boolean>;
  searchByText(
    searchTerm: string,
    options?: Partial<GetTasksQueryDto>,
  ): Promise<Task[]>;
  getTaskAnalytics(id: TaskId): Promise<any>;
  updateTaskStatistics(id: TaskId, stats: any): Promise<void>;
}

/**
 * AI Service Interface
 * Defines contract for AI-powered features
 */
export interface IAIService {
  generateAdaptiveHint(
    task: Task,
    studentProfile: any,
    context: any,
  ): Promise<any>;
  assessTaskCompletion(task: Task, submission: any, rubric: any): Promise<any>;
  generateContentVariation(task: Task, variation: string): Promise<any>;
  calibrateDifficulty(task: Task, performanceData: any[]): Promise<number>;
  generatePersonalizedFeedback(
    task: Task,
    submission: any,
    assessment: any,
  ): Promise<string>;
  generateRecommendations(
    studentProfile: any,
    completedTasks: Task[],
  ): Promise<Task[]>;
}

/**
 * Analytics Service Interface
 * Defines contract for behavioral signal collection and analysis
 */
export interface IAnalyticsService {
  collectBehavioralSignals(
    taskId: TaskId,
    studentId: string,
    signals: any,
  ): Promise<void>;
  getTaskPerformanceMetrics(taskId: TaskId): Promise<any>;
  getStudentProgressInsights(
    studentId: string,
    competencyId: CompetencyId,
  ): Promise<any>;
  trackHintUsage(
    taskId: TaskId,
    studentId: string,
    hintData: any,
  ): Promise<void>;
  analyzeTaskQuality(taskId: TaskId): Promise<any>;
  generateLearningReport(studentId: string, timeframe: string): Promise<any>;
}

/**
 * CCIS Service Interface
 * Defines contract for CCIS level management
 */
export interface ICCISService {
  calculateCCISLevel(
    competencyId: CompetencyId,
    studentId: string,
  ): Promise<number>;
  updateCCISLevel(
    competencyId: CompetencyId,
    studentId: string,
    newLevel: number,
  ): Promise<void>;
  getScaffoldingConfig(ccisLevel: number): Promise<any>;
  adaptTaskForLevel(task: Task, ccisLevel: number): Promise<any>;
  calculateLevelProgression(
    beforeLevel: number,
    afterLevel: number,
  ): Promise<any>;
}

/**
 * Task Service
 * Core application service for task management
 */
@Injectable()
export class TaskService {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
    @Inject(AI_SERVICE)
    private readonly aiService: IAIService,
    @Inject(ANALYTICS_SERVICE)
    private readonly analyticsService: IAnalyticsService,
    @Inject(CCIS_SERVICE)
    private readonly ccisService: ICCISService,
  ) {}

  /**
   * Create a new task
   */
  async createTask(dto: CreateTaskDto): Promise<TaskResponseDto> {
    // Create value objects with static factory methods
    const competencyId = CompetencyId.fromString(dto.competencyId);
    const taskType = TaskType.fromString(dto.taskType);
    const taskCategory = TaskCategory.fromString(dto.taskCategory);

    // Create task entity with proper factory method
    const task = Task.create(
      dto.title,
      dto.description,
      dto.instructions,
      dto.context,
      dto.expectedDuration,
      competencyId,
      dto.targetCCISLevel,
      taskType,
      taskCategory,
      dto.contentBlocks as any, // TODO: Add proper type validation
      dto.successCriteria as any, // TODO: Add proper type validation
      dto.assessmentRubric as any, // TODO: Add proper type validation
      {
        industryScenario: dto.industryScenario,
        tags: dto.tags,
        prerequisiteTasks: dto.prerequisiteTasks?.map((id) =>
          TaskId.fromString(id),
        ),
      },
    );

    // Save task
    const savedTask = await this.taskRepository.save(task);

    return TaskResponseDto.fromDomain(savedTask);
  }

  /**
   * Update an existing task
   * Note: Task entity is designed to be largely immutable.
   * Only certain operations like publish/deprecate are supported.
   */
  async updateTask(id: string, dto: UpdateTaskDto): Promise<TaskResponseDto> {
    const taskId = TaskId.fromString(id);
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Since Task entity properties are mostly readonly (immutable design),
    // updates that change core properties require creating a new task.
    // For now, we'll only support updating mutable properties and
    // return validation errors for readonly property attempts.

    if (
      dto.title !== undefined ||
      dto.description !== undefined ||
      dto.instructions !== undefined ||
      dto.context !== undefined ||
      dto.difficulty !== undefined ||
      dto.expectedDuration !== undefined
    ) {
      throw new BadRequestException(
        'Core task properties (title, description, instructions, context, difficulty, duration) cannot be updated due to immutable design. ' +
          'Create a new task version instead.',
      );
    }

    // Only operations supported on immutable tasks are publish/deprecate
    // Since these aren't in the UpdateTaskDto, we just return the existing task
    console.warn(
      'Task updates not implemented - entity follows immutable design pattern',
    );

    const updatedTask = await this.taskRepository.save(task);
    return TaskResponseDto.fromDomain(updatedTask);
  }

  /**
   * Get task by ID
   */
  async getTaskById(id: string): Promise<DetailedTaskResponseDto> {
    const taskId = TaskId.fromString(id);
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return DetailedTaskResponseDto.fromDomain(task);
  }

  /**
   * Get tasks with filtering and pagination
   */
  async getTasks(
    queryDto: GetTasksQueryDto,
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<TaskResponseDto>> {
    const { tasks, total } = await this.taskRepository.findAll({
      ...queryDto,
      ...pagination,
    });

    const taskDtos = tasks.map((task) => TaskResponseDto.fromDomain(task));

    return new PaginatedResponse(
      taskDtos,
      total,
      pagination.page || 1,
      pagination.pageSize || 10,
    );
  }

  /**
   * Get tasks by competency
   */
  async getTasksByCompetency(
    competencyId: string,
    queryDto?: Partial<GetTasksQueryDto>,
  ): Promise<TaskResponseDto[]> {
    const competency = CompetencyId.fromString(competencyId);
    const tasks = await this.taskRepository.findByCompetencyId(
      competency,
      queryDto,
    );

    return tasks.map((task) => TaskResponseDto.fromDomain(task));
  }

  /**
   * Search tasks by text
   */
  async searchTasks(
    searchTerm: string,
    queryDto?: Partial<GetTasksQueryDto>,
  ): Promise<TaskResponseDto[]> {
    const tasks = await this.taskRepository.searchByText(searchTerm, queryDto);

    return tasks.map((task) => TaskResponseDto.fromDomain(task));
  }

  /**
   * Submit task completion
   */
  async submitTaskCompletion(
    taskId: string,
    studentId: string,
    dto: TaskSubmissionDto,
  ): Promise<TaskCompletionResponseDto> {
    const task = await this.taskRepository.findById(TaskId.fromString(taskId));

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    // Collect behavioral signals
    const behavioralSignals = {
      taskId: taskId,
      studentId: studentId,
      timeSpent: dto.timeSpent,
      hintsRequested: dto.hintsRequested,
      attempts: dto.attempts || 1,
      confidenceRating: dto.confidenceRating,
      submissionTimestamp: new Date(),
      responses: dto.responses,
    };

    await this.analyticsService.collectBehavioralSignals(
      TaskId.fromString(taskId),
      studentId,
      behavioralSignals,
    );

    // Assess task completion using AI
    const submissionData = {
      studentId: studentId,
      responses: dto.responses,
      timeSpent: dto.timeSpent,
      hintsRequested: dto.hintsRequested,
      attempts: 1, // TODO: Track actual attempts
      confidenceRating: dto.confidenceRating,
      behavioralSignals: behavioralSignals,
    };

    const assessment = task.assessCompletion(submissionData);

    // Generate personalized feedback
    const feedback = await this.aiService.generatePersonalizedFeedback(
      task,
      dto.responses,
      assessment,
    );

    // Update task statistics
    await this.taskRepository.updateTaskStatistics(TaskId.fromString(taskId), {
      completionTime: dto.timeSpent,
      success: assessment.isSuccessful,
      score: assessment.criteriaScore.score,
      hintsUsed: dto.hintsRequested,
    });

    // Create response
    const response = TaskCompletionResponseDto.fromDomain(assessment);
    response.feedback = feedback;
    response.behavioralSignals = behavioralSignals;

    return response;
  }

  /**
   * Request adaptive hint
   */
  async requestHint(
    taskId: string,
    studentId: string,
    dto: HintRequestDto,
  ): Promise<HintResponseDto> {
    const task = await this.taskRepository.findById(TaskId.fromString(taskId));

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    // Get student's CCIS level
    const ccisLevel = await this.ccisService.calculateCCISLevel(
      task.competencyId,
      studentId,
    );

    // Generate adaptive hint using correct method signature
    const hintResponse = task.generateAdaptiveHints(
      ccisLevel,
      dto.struggleDuration,
      dto.context,
    );

    // Track hint usage
    await this.analyticsService.trackHintUsage(
      TaskId.fromString(taskId),
      studentId,
      {
        hintContent: hintResponse.content,
        hintType: hintResponse.type,
        ccisLevel,
        struggleDuration: dto.struggleDuration,
        requestTimestamp: new Date(),
      },
    );

    return HintResponseDto.fromDomain(hintResponse);
  }

  /**
   * Calibrate task difficulty based on performance data
   */
  async calibrateDifficulty(taskId: string): Promise<void> {
    const task = await this.taskRepository.findById(TaskId.fromString(taskId));

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    // Get performance data for calibration
    const performanceData =
      await this.analyticsService.getTaskPerformanceMetrics(
        TaskId.fromString(taskId),
      );

    if (performanceData.attempts < 10) {
      throw new BadRequestException(
        'Insufficient data for difficulty calibration. Need at least 10 attempts.',
      );
    }

    // Transform analytics data to TaskPerformanceData interface
    const taskPerformanceData = {
      successRate: performanceData.successRate || 0,
      averageAttempts: performanceData.averageAttempts || 0,
      timeVariance: performanceData.timeVariance || 0,
      averageCompletionTime: performanceData.averageCompletionTime || 0,
      totalAttempts: performanceData.totalAttempts || 0,
      hasEnoughData: () => (performanceData.totalAttempts || 0) >= 10, // Need at least 10 attempts
    };

    // Update task difficulty using domain method
    task.updateDifficultyCalibration(taskPerformanceData);

    await this.taskRepository.save(task);
  }

  /**
   * Publish task
   */
  async publishTask(id: string): Promise<TaskResponseDto> {
    const taskId = TaskId.fromString(id);
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    task.publish();
    const updatedTask = await this.taskRepository.save(task);

    return TaskResponseDto.fromDomain(updatedTask);
  }

  /**
   * Unpublish task (deprecates the task)
   */
  async unpublishTask(id: string): Promise<TaskResponseDto> {
    const taskId = TaskId.fromString(id);
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Since there's no unpublish method, we deprecate the task
    task.deprecate('Task unpublished by administrator');
    const updatedTask = await this.taskRepository.save(task);

    return TaskResponseDto.fromDomain(updatedTask);
  }

  /**
   * Delete task
   */
  async deleteTask(id: string): Promise<void> {
    const taskId = TaskId.fromString(id);
    const exists = await this.taskRepository.exists(taskId);

    if (!exists) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    await this.taskRepository.delete(taskId);
  }

  /**
   * Generate content variation
   */
  async generateContentVariation(
    taskId: string,
    variationType: string,
  ): Promise<any> {
    const task = await this.taskRepository.findById(TaskId.fromString(taskId));

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    const variation = await this.aiService.generateContentVariation(
      task,
      variationType,
    );

    return variation;
  }

  /**
   * Get task quality analysis
   */
  async getTaskQualityAnalysis(taskId: string): Promise<any> {
    const qualityAnalysis = await this.analyticsService.analyzeTaskQuality(
      TaskId.fromString(taskId),
    );

    return qualityAnalysis;
  }
}
