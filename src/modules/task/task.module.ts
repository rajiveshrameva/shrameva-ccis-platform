import { Module } from '@nestjs/common';
import {
  TaskController,
  StudentTaskController,
} from './presentation/controllers/task.controller';
import { AITaskController } from './api/ai-task.controller';
import {
  TaskService,
  ITaskRepository,
  IAIService,
  IAnalyticsService,
  ICCISService,
} from './application/services/task.service';

// Infrastructure imports
import { PrismaTaskRepository } from './infrastructure/repositories/prisma-task.repository';
import { AITaskService } from './infrastructure/services/ai-task.service';
import { AnalyticsTaskService } from './infrastructure/services/analytics-task.service';
import { CCISTaskService } from './infrastructure/services/ccis-task.service';
import { AITaskGenerationService } from './infrastructure/services/ai-task-generation.service';
import { LearningPathService } from './infrastructure/services/learning-path.service';
import { AdvancedAnalyticsService } from './infrastructure/services/advanced-analytics.service';

// Injection tokens
import {
  TASK_REPOSITORY,
  AI_SERVICE,
  ANALYTICS_SERVICE,
  CCIS_SERVICE,
} from './task.tokens';

/**
 * Task Module
 * Encapsulates all task-related functionality including:
 * - Domain layer: Task entity, value objects, domain events
 * - Application layer: Task service, DTOs
 * - Presentation layer: REST controllers
 * - Infrastructure layer: Repository implementations (to be added)
 */
@Module({
  controllers: [TaskController, StudentTaskController, AITaskController],
  providers: [
    // Core application service
    TaskService,

    // New AI-powered services
    AITaskGenerationService,
    LearningPathService,
    AdvancedAnalyticsService,

    // Repository implementations
    {
      provide: TASK_REPOSITORY,
      useClass: PrismaTaskRepository,
    },

    // AI service implementation
    {
      provide: AI_SERVICE,
      useClass: AITaskService,
    },

    // Analytics service implementation
    {
      provide: ANALYTICS_SERVICE,
      useClass: AnalyticsTaskService,
    },

    // CCIS service implementation
    {
      provide: CCIS_SERVICE,
      useClass: CCISTaskService,
    },
  ],
  imports: [
    // Would import shared modules, database modules, etc.
    // SharedModule,
    // DatabaseModule,
    // ExternalServicesModule
  ],
  exports: [
    TaskService,
    AITaskGenerationService,
    LearningPathService,
    AdvancedAnalyticsService,
    // Export interfaces for other modules
    // ITaskRepository,
    // IAIService,
    // IAnalyticsService,
    // ICCISService
  ],
})
export class TaskModule {
  /**
   * Configuration for the Task module
   *
   * This module provides:
   * 1. Complete Task domain implementation with CCIS adaptive scaffolding
   * 2. AI-powered hint generation and content assessment
   * 3. Behavioral signal collection and analytics
   * 4. REST API endpoints for task management and student interactions
   * 5. Integration points for external AI and analytics services
   *
   * Domain Features:
   * - Task entities with comprehensive metadata and configuration
   * - 5 value objects for type safety (TaskId, TaskType, TaskCategory, TaskDifficulty, TaskDuration)
   * - 15+ domain events for task lifecycle management
   * - Adaptive scaffolding with 4-level CCIS progression
   * - Industry-validated task categories across 7 competency areas
   *
   * Application Features:
   * - Complete CRUD operations for task management
   * - Student task submission and assessment
   * - Adaptive hint generation based on student profile
   * - Difficulty calibration using IRT-based analysis
   * - Content variation generation for transfer learning
   * - Comprehensive analytics and quality metrics
   *
   * API Features:
   * - RESTful endpoints with OpenAPI documentation
   * - Comprehensive validation and error handling
   * - Separate admin and student interfaces
   * - Paginated responses with filtering
   * - Real-time hint generation and assessment
   *
   * Integration Points:
   * - Repository pattern for data persistence (Prisma)
   * - AI service integration for content generation
   * - Analytics service for behavioral signal collection
   * - CCIS service for adaptive level management
   *
   * Next Steps:
   * 1. Implement infrastructure layer with Prisma repositories
   * 2. Create AI service implementations (OpenAI integration)
   * 3. Build analytics service for behavioral signal processing
   * 4. Add CCIS level calculation and progression services
   * 5. Create comprehensive test suites for all layers
   * 6. Add database schema migrations for Task entity
   */
}
