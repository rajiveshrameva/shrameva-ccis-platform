import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Application Layer
import {
  AssessmentService,
  IAIAssessmentService,
} from './application/assessment.service';
import { AssessmentHandlers } from './application/handlers/assessment.handlers';

// Infrastructure Layer
import { IAssessmentRepository } from './domain/assessment.repository.interface';
import { PrismaAssessmentRepository } from './infrastructure/repositories/prisma-assessment.repository';
import { ClaudeAIAssessmentService } from './infrastructure/services/claude-ai-assessment.service';

// Presentation Layer
import { AssessmentController } from './presentation/assessment.controller';

// Shared Services
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';

/**
 * Assessment Module
 *
 * Main module for the Assessment domain following Clean Architecture principles.
 * Configures dependency injection for all layers.
 */
@Module({
  imports: [ConfigModule],
  controllers: [AssessmentController],
  providers: [
    // Shared Services
    PrismaService,

    // Application Services
    AssessmentService,
    AssessmentHandlers,

    // Infrastructure Services - Repository
    {
      provide: 'IAssessmentRepository',
      useClass: PrismaAssessmentRepository,
    },

    // Infrastructure Services - AI Service
    {
      provide: 'IAIAssessmentService',
      useClass: ClaudeAIAssessmentService,
    },
  ],
  exports: [
    AssessmentService,
    AssessmentHandlers,
    'IAssessmentRepository',
    'IAIAssessmentService',
  ],
})
export class AssessmentModule {}
