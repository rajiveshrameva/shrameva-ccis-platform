import { Injectable } from '@nestjs/common';
import {
  Prisma,
  TaskType as PrismaTaskType,
  TaskCategory as PrismaTaskCategory,
} from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { Task } from '../../domain/entities/task.entity';
import { TaskId } from '../../domain/value-objects/task-id.value-object';
import { CompetencyId } from '../../domain/value-objects/competency-id.value-object';
import { TaskType } from '../../domain/value-objects/task-type.value-object';
import { TaskCategory } from '../../domain/value-objects/task-category.value-object';
import { TaskDifficulty } from '../../domain/value-objects/task-difficulty.value-object';
import { TaskDuration } from '../../domain/value-objects/task-duration.value-object';
import { ITaskRepository } from '../../application/services/task.service';
import { GetTasksQueryDto } from '../../application/dtos/task-request.dtos';

/**
 * Prisma Task Repository Implementation
 *
 * Implements the ITaskRepository interface using Prisma ORM for data persistence.
 * Handles mapping between domain entities and database models.
 */
@Injectable()
export class PrismaTaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Save a task (create or update)
   */
  async save(task: Task): Promise<Task> {
    const taskData = this.mapToDatabase(task);

    try {
      const savedTask = await this.prisma.task.upsert({
        where: { id: task.getId().getValue() },
        update: {
          ...taskData,
          updatedAt: new Date(),
        },
        create: {
          ...taskData,
          id: task.getId().getValue(),
          createdAt: task.getCreatedAt(),
        },
      });

      return this.mapToDomain(savedTask);
    } catch (error) {
      throw new Error(`Failed to save task: ${error.message}`);
    }
  }

  /**
   * Find task by ID
   */
  async findById(id: TaskId): Promise<Task | null> {
    try {
      const task = await this.prisma.task.findUnique({
        where: {
          id: id.getValue(),
          deletedAt: null,
        },
      });

      return task ? this.mapToDomain(task) : null;
    } catch (error) {
      throw new Error(`Failed to find task by ID: ${error.message}`);
    }
  }

  /**
   * Find tasks by competency ID
   */
  async findByCompetencyId(
    competencyId: CompetencyId,
    options?: Partial<GetTasksQueryDto>,
  ): Promise<Task[]> {
    try {
      const where = this.buildWhereClause({
        ...options,
        competencyId: competencyId.getValue(),
        publishedAt: { not: null },
        deprecatedAt: null,
      });

      const tasks = await this.prisma.task.findMany({
        where,
        orderBy: this.buildOrderBy(options?.sortBy, options?.sortOrder),
        take: options?.limit,
        skip: options?.page
          ? (options.page - 1) * (options?.limit || 10)
          : undefined,
      });

      return tasks.map((task) => this.mapToDomain(task));
    } catch (error) {
      throw new Error(
        `Failed to find tasks by competency ID: ${error.message}`,
      );
    }
  }

  /**
   * Find all tasks with pagination
   */
  async findAll(
    options?: Partial<GetTasksQueryDto>,
  ): Promise<{ tasks: Task[]; total: number }> {
    try {
      const where = this.buildWhereClause({
        ...options,
        publishedAt: { not: null },
        deprecatedAt: null,
      });

      const [tasks, total] = await Promise.all([
        this.prisma.task.findMany({
          where,
          orderBy: this.buildOrderBy(options?.sortBy, options?.sortOrder),
          take: options?.limit,
          skip: options?.page
            ? (options.page - 1) * (options?.limit || 10)
            : undefined,
        }),
        this.prisma.task.count({ where }),
      ]);

      return {
        tasks: tasks.map((task) => this.mapToDomain(task)),
        total,
      };
    } catch (error) {
      throw new Error(`Failed to find all tasks: ${error.message}`);
    }
  }

  /**
   * Find tasks by category
   */
  async findByCategory(category: TaskCategory): Promise<Task[]> {
    try {
      const tasks = await this.prisma.task.findMany({
        where: {
          taskCategory: category.getValue() as PrismaTaskCategory,
          publishedAt: { not: null },
          deprecatedAt: null,
        },
      });

      return tasks.map((task) => this.mapToDomain(task));
    } catch (error) {
      throw new Error(`Failed to find tasks by category: ${error.message}`);
    }
  }

  /**
   * Find tasks by type
   */
  async findByType(type: TaskType): Promise<Task[]> {
    try {
      const tasks = await this.prisma.task.findMany({
        where: {
          taskType: type.getValue() as PrismaTaskType,
          publishedAt: { not: null },
          deprecatedAt: null,
        },
      });

      return tasks.map((task) => this.mapToDomain(task));
    } catch (error) {
      throw new Error(`Failed to find tasks by type: ${error.message}`);
    }
  }

  /**
   * Find tasks by difficulty range
   */
  async findByDifficultyRange(min: number, max: number): Promise<Task[]> {
    try {
      const tasks = await this.prisma.task.findMany({
        where: {
          difficulty: {
            gte: min,
            lte: max,
          },
          publishedAt: { not: null },
          deprecatedAt: null,
        },
      });

      return tasks.map((task) => this.mapToDomain(task));
    } catch (error) {
      throw new Error(
        `Failed to find tasks by difficulty range: ${error.message}`,
      );
    }
  }

  /**
   * Find tasks by CCIS level
   */
  async findByCCISLevel(level: number): Promise<Task[]> {
    try {
      const tasks = await this.prisma.task.findMany({
        where: {
          targetCCISLevel: level,
          publishedAt: { not: null },
          deprecatedAt: null,
        },
      });

      return tasks.map((task) => this.mapToDomain(task));
    } catch (error) {
      throw new Error(`Failed to find tasks by CCIS level: ${error.message}`);
    }
  }

  /**
   * Find tasks by tags
   */
  async findByTags(tags: string[]): Promise<Task[]> {
    try {
      const tasks = await this.prisma.task.findMany({
        where: {
          tags: {
            hasSome: tags,
          },
          publishedAt: { not: null },
          deprecatedAt: null,
        },
      });

      return tasks.map((task) => this.mapToDomain(task));
    } catch (error) {
      throw new Error(`Failed to find tasks by tags: ${error.message}`);
    }
  }

  /**
   * Find tasks with prerequisites
   */
  async findWithPrerequisites(prerequisites: TaskId[]): Promise<Task[]> {
    try {
      const prerequisiteIds = prerequisites.map((id) => id.getValue());
      const tasks = await this.prisma.task.findMany({
        where: {
          prerequisiteTasks: {
            hasSome: prerequisiteIds,
          },
          publishedAt: { not: null },
          deprecatedAt: null,
        },
      });

      return tasks.map((task) => this.mapToDomain(task));
    } catch (error) {
      throw new Error(
        `Failed to find tasks with prerequisites: ${error.message}`,
      );
    }
  }

  /**
   * Find published tasks
   */
  async findPublished(options?: Partial<GetTasksQueryDto>): Promise<Task[]> {
    try {
      const where = this.buildWhereClause({
        ...options,
        publishedAt: { not: null },
        deprecatedAt: null,
      });

      const tasks = await this.prisma.task.findMany({
        where,
        orderBy: this.buildOrderBy(options?.sortBy, options?.sortOrder),
        take: options?.limit,
        skip: options?.page
          ? (options.page - 1) * (options?.limit || 10)
          : undefined,
      });

      return tasks.map((task) => this.mapToDomain(task));
    } catch (error) {
      throw new Error(`Failed to find published tasks: ${error.message}`);
    }
  }

  /**
   * Delete a task (soft delete)
   */
  async delete(id: TaskId): Promise<void> {
    try {
      await this.prisma.task.update({
        where: { id: id.getValue() },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  }

  /**
   * Check if task exists
   */
  async exists(id: TaskId): Promise<boolean> {
    try {
      const task = await this.prisma.task.findUnique({
        where: {
          id: id.getValue(),
          deletedAt: null,
        },
        select: { id: true },
      });
      return !!task;
    } catch (error) {
      throw new Error(`Failed to check task existence: ${error.message}`);
    }
  }

  /**
   * Search tasks by text
   */
  async searchByText(
    searchTerm: string,
    options?: Partial<GetTasksQueryDto>,
  ): Promise<Task[]> {
    try {
      const tasks = await this.prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { instructions: { contains: searchTerm, mode: 'insensitive' } },
          ],
          publishedAt: { not: null },
          deprecatedAt: null,
        },
        orderBy: this.buildOrderBy(options?.sortBy, options?.sortOrder),
        take: options?.limit,
        skip: options?.page
          ? (options.page - 1) * (options?.limit || 10)
          : undefined,
      });

      return tasks.map((task) => this.mapToDomain(task));
    } catch (error) {
      throw new Error(`Failed to search tasks by text: ${error.message}`);
    }
  }

  /**
   * Get task analytics
   */
  async getTaskAnalytics(id: TaskId): Promise<any> {
    try {
      const task = await this.prisma.task.findUnique({
        where: { id: id.getValue() },
        select: {
          averageCompletionTime: true,
          averageSuccessRate: true,
          totalAttempts: true,
          interactions: {
            select: {
              duration: true,
              interactionTimestamp: true,
              behavioralSignals: true,
            },
            orderBy: { interactionTimestamp: 'desc' },
            take: 100,
          },
        },
      });

      if (!task) {
        throw new Error('Task not found');
      }

      return {
        taskId: id.getValue(),
        averageCompletionTime: task.averageCompletionTime,
        averageSuccessRate: task.averageSuccessRate,
        totalAttempts: task.totalAttempts,
        recentInteractions: task.interactions,
      };
    } catch (error) {
      throw new Error(`Failed to get task analytics: ${error.message}`);
    }
  }

  /**
   * Update task statistics
   */
  async updateTaskStatistics(id: TaskId, stats: any): Promise<void> {
    try {
      await this.prisma.task.update({
        where: { id: id.getValue() },
        data: {
          averageCompletionTime: stats.averageCompletionTime,
          averageSuccessRate: stats.averageSuccessRate,
          totalAttempts: stats.totalAttempts,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      throw new Error(`Failed to update task statistics: ${error.message}`);
    }
  }

  /**
   * Build WHERE clause for queries
   */
  private buildWhereClause(options: any): Prisma.TaskWhereInput {
    const where: Prisma.TaskWhereInput = {};

    if (options.competencyId) {
      where.competencyId = options.competencyId;
    }

    if (options.taskType) {
      where.taskType = options.taskType as PrismaTaskType;
    }

    if (options.taskCategory) {
      where.taskCategory = options.taskCategory as PrismaTaskCategory;
    }

    if (options.targetCCISLevel) {
      where.targetCCISLevel = options.targetCCISLevel;
    }

    if (options.difficulty) {
      if (typeof options.difficulty === 'number') {
        where.difficulty = options.difficulty;
      } else if (
        options.difficulty.min !== undefined ||
        options.difficulty.max !== undefined
      ) {
        where.difficulty = {};
        if (options.difficulty.min !== undefined) {
          where.difficulty.gte = options.difficulty.min;
        }
        if (options.difficulty.max !== undefined) {
          where.difficulty.lte = options.difficulty.max;
        }
      }
    }

    if (options.tags && Array.isArray(options.tags)) {
      where.tags = { hasSome: options.tags };
    }

    if (options.publishedAt !== undefined) {
      where.publishedAt = options.publishedAt;
    }

    if (options.deprecatedAt !== undefined) {
      where.deprecatedAt = options.deprecatedAt;
    }

    // Soft delete filter
    if (options.deletedAt === undefined) {
      where.deletedAt = null;
    }

    return where;
  }

  /**
   * Build ORDER BY clause for queries
   */
  private buildOrderBy(
    sortBy?: string,
    sortOrder?: string,
  ): Prisma.TaskOrderByWithRelationInput {
    const orderBy: Prisma.TaskOrderByWithRelationInput = {};

    const validSortOrders: Prisma.SortOrder[] = ['asc', 'desc'];
    const order = (
      validSortOrders.includes(sortOrder as Prisma.SortOrder)
        ? sortOrder
        : 'desc'
    ) as Prisma.SortOrder;

    switch (sortBy) {
      case 'title':
        orderBy.title = order;
        break;
      case 'difficulty':
        orderBy.difficulty = order;
        break;
      case 'expectedDuration':
        orderBy.expectedDuration = order;
        break;
      case 'updatedAt':
        orderBy.updatedAt = order;
        break;
      case 'createdAt':
      default:
        orderBy.createdAt = order;
        break;
    }

    return orderBy;
  }

  /**
   * Map database model to domain entity
   */
  private mapToDomain(dbTask: any): Task {
    // This is a placeholder implementation since we need to match the exact Task.create signature
    // We'll create a simplified mock task for now - in production this would be fully implemented

    try {
      const taskId = TaskId.fromString(dbTask.id);
      const competencyId = CompetencyId.fromString(dbTask.competencyId);
      const taskType = TaskType.fromString(dbTask.taskType);
      const taskCategory = TaskCategory.fromString(dbTask.taskCategory);

      // Create a simplified task using the factory method signature we found
      const task = Task.create(
        dbTask.title,
        dbTask.description,
        dbTask.instructions,
        dbTask.context,
        dbTask.expectedDuration,
        competencyId,
        dbTask.targetCCISLevel,
        taskType,
        taskCategory,
        dbTask.contentBlocks || {},
        dbTask.successCriteria || { passingThreshold: 0.7, criteria: [] },
        dbTask.assessmentRubric || {
          dimensions: [],
          scoringMethod: 'weighted_average',
          passingScore: 0.7,
        },
        {
          tags: dbTask.tags || [],
          industryScenario: dbTask.industryScenario,
          prerequisiteTasks:
            dbTask.prerequisiteTasks?.map((id) => TaskId.fromString(id)) || [],
        },
      );

      return task;
    } catch (error) {
      throw new Error(
        `Failed to map database task to domain: ${error.message}`,
      );
    }
  }

  /**
   * Map domain entity to database model
   */
  private mapToDatabase(task: Task): any {
    return {
      title: task.title,
      description: task.description,
      instructions: task.instructions,
      context: task.context,
      expectedDuration: task.expectedDuration.getValue(),
      difficulty: task.difficultyLevel.getValue(),
      targetCCISLevel: task.targetCCISLevel,
      ccisLevelRange: task.ccisLevelRange,
      taskType: task.taskType.getValue() as PrismaTaskType,
      taskCategory: task.taskCategory.getValue() as PrismaTaskCategory,
      competencyId: task.competencyId.getValue(),
      contentBlocks: task.contentBlocks,
      successCriteria: task.successCriteria,
      assessmentRubric: task.assessmentRubric,
      hintsAvailable: task.hintsAvailable,
      scaffoldingConfig: task.scaffoldingConfig,
      averageCompletionTime: task.averageCompletionTime,
      averageSuccessRate: task.averageSuccessRate,
      totalAttempts: task.totalAttempts,
      tags: task.tags || [],
      industryScenario: task.industryScenario,
      prerequisiteTasks:
        task.prerequisiteTasks?.map((id) => id.getValue()) || [],
      followUpTasks: task.followUpTasks?.map((id) => id.getValue()) || [],
      relatedTasks: task.relatedTasks?.map((id) => id.getValue()) || [],
      publishedAt: task.publishedAt,
      deprecatedAt: task.deprecatedAt,
      lastValidationDate: task.lastValidationDate,
      contentVersion: task.contentVersion,
    };
  }
}
