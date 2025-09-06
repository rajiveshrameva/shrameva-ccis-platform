import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { AITaskGenerationService } from './ai-task-generation.service';
import { Task } from '../../domain/entities/task.entity';

/**
 * Learning Path Service
 *
 * Implements AI-powered personalized learning path generation and management.
 * Creates adaptive learning sequences based on student profile and competency goals.
 */
@Injectable()
export class LearningPathService {
  private readonly logger = new Logger(LearningPathService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiTaskGeneration: AITaskGenerationService,
  ) {}

  /**
   * Create personalized learning path
   */
  async createPersonalizedPath(request: {
    personId: string;
    competencyFocus: string[];
    targetCCISLevel: number;
    estimatedDuration: number; // hours
    studentProfile: {
      learningStyle?: string;
      currentCCISLevels?: Record<string, number>;
      industryInterest?: string;
      timeAvailability?: number; // hours per week
      preferredDifficulty?: 'gentle' | 'moderate' | 'challenging';
    };
    preferences?: {
      difficultyProgression?: 'linear' | 'adaptive' | 'spiral';
      includeTransferTasks?: boolean;
      includeIndustryScenarios?: boolean;
      checkpointFrequency?: number; // tasks between checkpoints
    };
  }): Promise<{
    pathId: string;
    milestones: any[];
    adaptationPlan: any;
    estimatedCompletion: Date;
  }> {
    try {
      this.logger.log(
        `Creating personalized learning path for person ${request.personId}`,
      );

      // Analyze current competency state
      const competencyAnalysis = await this.analyzeCurrentCompetencies(
        request.personId,
        request.competencyFocus,
      );

      // Generate adaptive milestones
      const milestones = await this.generateAdaptiveMilestones(
        request,
        competencyAnalysis,
      );

      // Create learning path record
      const pathData = {
        name: `Personalized Path: ${request.competencyFocus.join(', ')}`,
        description: `AI-generated learning path targeting CCIS Level ${request.targetCCISLevel}`,
        personId: request.personId,
        competencyFocus: request.competencyFocus,
        targetCCISLevel: request.targetCCISLevel,
        estimatedDuration: request.estimatedDuration,
        difficultyProgression:
          request.preferences?.difficultyProgression || 'adaptive',
        aiPersonalized: true,
        adaptationAlgorithm: 'reinforcement_learning',
        personalityProfile: {
          learningStyle: request.studentProfile.learningStyle,
          timeAvailability: request.studentProfile.timeAvailability,
          preferredDifficulty: request.studentProfile.preferredDifficulty,
        },
        performanceHistory: competencyAnalysis.performanceHistory,
        status: 'ACTIVE',
        currentMilestone: 0,
        progressPercent: 0,
      };

      // Store in database (mock for now)
      const pathId = `path_${Date.now()}_${request.personId}`;
      this.logger.log(`Learning path created with ID: ${pathId}`);

      // Calculate estimated completion
      const estimatedCompletion = this.calculateEstimatedCompletion(
        request.estimatedDuration,
        request.studentProfile.timeAvailability || 5,
      );

      // Generate adaptation plan
      const adaptationPlan = this.generateAdaptationPlan(
        request,
        competencyAnalysis,
        milestones,
      );

      return {
        pathId,
        milestones,
        adaptationPlan,
        estimatedCompletion,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create learning path: ${error.message}`,
        error,
      );
      throw new Error(`Learning path creation failed: ${error.message}`);
    }
  }

  /**
   * Adapt learning path based on performance
   */
  async adaptPath(
    pathId: string,
    performanceData: {
      recentTaskResults: Array<{
        taskId: string;
        competencyId: string;
        score: number;
        timeSpent: number;
        hintsUsed: number;
        difficulty: number;
      }>;
      strugglingAreas: string[];
      acceleratedAreas: string[];
      engagementMetrics: {
        sessionFrequency: number;
        averageSessionLength: number;
        dropoffRisk: number;
      };
    },
  ): Promise<{
    adaptations: any[];
    newMilestones: any[];
    adjustedDifficulty: number[];
    recommendedInterventions: string[];
  }> {
    try {
      this.logger.log(`Adapting learning path ${pathId} based on performance`);

      // Analyze performance patterns
      const performanceAnalysis =
        this.analyzePerformancePatterns(performanceData);

      // Generate adaptations
      const adaptations = await this.generateAdaptations(
        pathId,
        performanceAnalysis,
        performanceData,
      );

      // Create new milestone adjustments
      const newMilestones = await this.adjustMilestones(
        pathId,
        adaptations,
        performanceData,
      );

      // Calculate difficulty adjustments
      const adjustedDifficulty = this.calculateDifficultyAdjustments(
        performanceData.recentTaskResults,
        performanceAnalysis,
      );

      // Generate intervention recommendations
      const recommendedInterventions = this.generateInterventionRecommendations(
        performanceAnalysis,
        performanceData.engagementMetrics,
      );

      // Store adaptations
      await this.storePathAdaptations(pathId, {
        adaptations,
        adjustedDifficulty,
        recommendedInterventions,
        timestamp: new Date(),
      });

      return {
        adaptations,
        newMilestones,
        adjustedDifficulty,
        recommendedInterventions,
      };
    } catch (error) {
      this.logger.error(
        `Failed to adapt learning path: ${error.message}`,
        error,
      );
      throw new Error(`Learning path adaptation failed: ${error.message}`);
    }
  }

  /**
   * Generate milestone sequence with AI task generation
   */
  async generateMilestoneSequence(
    pathId: string,
    milestoneConfig: {
      competencyId: string;
      requiredCCISLevel: number;
      estimatedHours: number;
      previousMilestones: any[];
    },
    studentProfile: any,
  ): Promise<{
    milestone: any;
    taskSequence: Task[];
    adaptiveElements: any;
  }> {
    try {
      this.logger.log(
        `Generating milestone sequence for path ${pathId}, competency ${milestoneConfig.competencyId}`,
      );

      // Calculate optimal task count for milestone
      const taskCount = Math.ceil(milestoneConfig.estimatedHours / 0.5); // 30 min per task average

      // Generate task sequence using AI
      const { sequence, adaptationPlan } =
        await this.aiTaskGeneration.generateTaskSequence({
          competencyIds: [milestoneConfig.competencyId],
          targetCCISLevel: milestoneConfig.requiredCCISLevel,
          studentProfile,
          sequenceLength: taskCount,
          difficultyProgression: 'adaptive',
        });

      // Create milestone structure
      const milestone = {
        name: `${milestoneConfig.competencyId} - Level ${milestoneConfig.requiredCCISLevel}`,
        description: `Achieve CCIS Level ${milestoneConfig.requiredCCISLevel} in ${milestoneConfig.competencyId}`,
        competencyId: milestoneConfig.competencyId,
        requiredCCISLevel: milestoneConfig.requiredCCISLevel,
        estimatedHours: milestoneConfig.estimatedHours,
        taskSequence: {
          tasks: sequence.map((task) => ({
            taskId: task.getId().getValue(),
            order: sequence.indexOf(task),
            requiredScore: 0.7,
            maxAttempts: 3,
            adaptiveHints: true,
          })),
          adaptationRules: adaptationPlan,
        },
        aiGenerated: true,
        adaptiveAdjustments: {
          difficultyScaling: true,
          contentVariation: true,
          paceAdjustment: true,
        },
        status: 'LOCKED',
        totalTasks: sequence.length,
      };

      // Generate adaptive elements
      const adaptiveElements = {
        difficultyProgression: adaptationPlan.difficultyProgression,
        competencyFocus: adaptationPlan.competencyFocus,
        checkpoints: adaptationPlan.checkpoints,
        transferOpportunities: this.identifyTransferOpportunities(
          milestoneConfig.competencyId,
          milestoneConfig.previousMilestones,
        ),
        scaffoldingStrategy: this.generateScaffoldingStrategy(
          milestoneConfig.requiredCCISLevel,
          studentProfile,
        ),
      };

      return {
        milestone,
        taskSequence: sequence,
        adaptiveElements,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate milestone sequence: ${error.message}`,
        error,
      );
      throw new Error(`Milestone sequence generation failed: ${error.message}`);
    }
  }

  /**
   * Track learning path progress and update analytics
   */
  async trackProgress(
    pathId: string,
    progressUpdate: {
      milestoneId: string;
      taskId: string;
      completionData: {
        score: number;
        timeSpent: number;
        hintsUsed: number;
        attempts: number;
      };
      behavioralSignals: any;
    },
  ): Promise<{
    updatedProgress: any;
    nextRecommendations: any[];
    adaptationTriggers: string[];
  }> {
    try {
      this.logger.log(
        `Tracking progress for path ${pathId}, milestone ${progressUpdate.milestoneId}`,
      );

      // Update progress metrics
      const updatedProgress = await this.updateProgressMetrics(
        pathId,
        progressUpdate,
      );

      // Analyze performance for recommendations
      const performanceAnalysis = this.analyzeTaskPerformance(
        progressUpdate.completionData,
        progressUpdate.behavioralSignals,
      );

      // Generate next recommendations
      const nextRecommendations = await this.generateNextRecommendations(
        pathId,
        progressUpdate.milestoneId,
        performanceAnalysis,
      );

      // Check for adaptation triggers
      const adaptationTriggers = this.checkAdaptationTriggers(
        performanceAnalysis,
        updatedProgress,
      );

      // Store progress analytics
      await this.storeProgressAnalytics(pathId, {
        milestoneId: progressUpdate.milestoneId,
        taskId: progressUpdate.taskId,
        performanceAnalysis,
        recommendations: nextRecommendations,
        adaptationTriggers,
        timestamp: new Date(),
      });

      return {
        updatedProgress,
        nextRecommendations,
        adaptationTriggers,
      };
    } catch (error) {
      this.logger.error(`Failed to track progress: ${error.message}`, error);
      throw new Error(`Progress tracking failed: ${error.message}`);
    }
  }

  /**
   * Analyze current competency state
   */
  private async analyzeCurrentCompetencies(
    personId: string,
    competencyFocus: string[],
  ): Promise<any> {
    // Mock implementation - in production would query database
    const mockAnalysis = {
      currentLevels: competencyFocus.reduce(
        (acc, comp) => {
          acc[comp] = Math.floor(Math.random() * 3) + 1; // Random 1-3
          return acc;
        },
        {} as Record<string, number>,
      ),
      strengthAreas: competencyFocus.slice(0, 2),
      improvementAreas: competencyFocus.slice(2),
      performanceHistory: {
        totalAssessments: 10,
        averageScore: 0.75,
        improvementTrend: 'positive',
      },
      learningVelocity: 0.8, // Learning speed indicator
    };

    return mockAnalysis;
  }

  /**
   * Generate adaptive milestones based on analysis
   */
  private async generateAdaptiveMilestones(
    request: any,
    competencyAnalysis: any,
  ): Promise<any[]> {
    const milestones: any[] = [];

    for (let i = 0; i < request.competencyFocus.length; i++) {
      const competencyId = request.competencyFocus[i];
      const currentLevel = competencyAnalysis.currentLevels[competencyId] || 1;
      const targetLevel = request.targetCCISLevel;

      // Create progression milestones for this competency
      for (let level = currentLevel + 1; level <= targetLevel; level++) {
        const milestone = await this.generateMilestoneSequence(
          `path_${request.personId}`,
          {
            competencyId,
            requiredCCISLevel: level,
            estimatedHours: this.calculateMilestoneHours(level, competencyId),
            previousMilestones: milestones,
          },
          request.studentProfile,
        );

        milestones.push({
          ...milestone.milestone,
          order: milestones.length,
        });
      }
    }

    return milestones;
  }

  /**
   * Generate adaptation plan
   */
  private generateAdaptationPlan(
    request: any,
    competencyAnalysis: any,
    milestones: any[],
  ): any {
    return {
      adaptationStrategy: 'reinforcement_learning',
      triggerConditions: {
        performanceThreshold: 0.6,
        engagementThreshold: 0.7,
        difficultyAdjustmentThreshold: 0.8,
      },
      adaptationTypes: [
        'difficulty_scaling',
        'content_variation',
        'pace_adjustment',
        'scaffolding_modification',
      ],
      feedbackLoop: {
        evaluationFrequency: 'after_each_task',
        adaptationFrequency: 'every_3_tasks',
        majorReviewFrequency: 'every_milestone',
      },
      personalizationFactors: {
        learningStyle: request.studentProfile.learningStyle,
        currentStrengths: competencyAnalysis.strengthAreas,
        improvementAreas: competencyAnalysis.improvementAreas,
        learningVelocity: competencyAnalysis.learningVelocity,
      },
    };
  }

  /**
   * Helper methods for various calculations
   */
  private calculateEstimatedCompletion(
    estimatedHours: number,
    hoursPerWeek: number,
  ): Date {
    const weeksNeeded = estimatedHours / hoursPerWeek;
    const completion = new Date();
    completion.setDate(completion.getDate() + weeksNeeded * 7);
    return completion;
  }

  private calculateMilestoneHours(level: number, competencyId: string): number {
    // Base hours with scaling by level
    const baseHours = { 1: 4, 2: 6, 3: 8, 4: 12 };
    return baseHours[level] || 8;
  }

  private analyzePerformancePatterns(performanceData: any): any {
    const scores = performanceData.recentTaskResults.map((r) => r.score);
    const times = performanceData.recentTaskResults.map((r) => r.timeSpent);

    return {
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      scoreVariance: this.calculateVariance(scores),
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      timeVariance: this.calculateVariance(times),
      learningTrend: this.calculateTrend(scores),
      strugglingPatterns: performanceData.strugglingAreas,
      accelerationOpportunities: performanceData.acceleratedAreas,
    };
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squareDiffs = numbers.map((n) => Math.pow(n - mean, 2));
    return squareDiffs.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private calculateTrend(
    scores: number[],
  ): 'improving' | 'stable' | 'declining' {
    if (scores.length < 3) return 'stable';

    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (secondAvg > firstAvg + 0.1) return 'improving';
    if (secondAvg < firstAvg - 0.1) return 'declining';
    return 'stable';
  }

  /**
   * Mock implementations for database operations
   */
  private async generateAdaptations(
    pathId: string,
    analysis: any,
    data: any,
  ): Promise<any[]> {
    return [
      {
        type: 'difficulty_adjustment',
        reason: 'Performance analysis indicates need for increased challenge',
        adjustment: 0.1,
      },
      {
        type: 'content_variation',
        reason: 'Adding industry-specific scenarios for engagement',
        variation: 'technology_focus',
      },
    ];
  }

  private async adjustMilestones(
    pathId: string,
    adaptations: any[],
    data: any,
  ): Promise<any[]> {
    return []; // Mock implementation
  }

  private calculateDifficultyAdjustments(
    results: any[],
    analysis: any,
  ): number[] {
    return results.map((_, index) => 0.5 + index * 0.1); // Mock progression
  }

  private generateInterventionRecommendations(
    analysis: any,
    engagement: any,
  ): string[] {
    const recommendations: string[] = [];

    if (analysis.averageScore < 0.6) {
      recommendations.push('Provide additional scaffolding and hints');
    }

    if (engagement.dropoffRisk > 0.7) {
      recommendations.push('Implement gamification elements');
    }

    if (analysis.timeVariance > 0.5) {
      recommendations.push(
        'Adjust pacing and provide time management guidance',
      );
    }

    return recommendations;
  }

  private identifyTransferOpportunities(
    competencyId: string,
    previousMilestones: any[],
  ): any[] {
    return [
      {
        sourceCompetency: competencyId,
        targetContext: 'cross_functional_application',
        transferType: 'skill_integration',
      },
    ];
  }

  private generateScaffoldingStrategy(
    ccisLevel: number,
    studentProfile: any,
  ): any {
    return {
      level: ccisLevel,
      strategy: ccisLevel <= 2 ? 'high_support' : 'gradual_release',
      elements: ['guided_practice', 'worked_examples', 'peer_collaboration'],
    };
  }

  private async updateProgressMetrics(
    pathId: string,
    update: any,
  ): Promise<any> {
    return {
      currentMilestone: 0,
      progressPercent: 25.5,
      tasksCompleted: 5,
      averageScore: 0.78,
    };
  }

  private analyzeTaskPerformance(completion: any, signals: any): any {
    return {
      performanceLevel:
        completion.score > 0.8
          ? 'excellent'
          : completion.score > 0.6
            ? 'good'
            : 'needs_improvement',
      efficiencyScore: completion.timeSpent < 20 ? 'efficient' : 'needs_pacing',
      independenceLevel:
        completion.hintsUsed < 3 ? 'independent' : 'needs_support',
      masteryIndicators: completion.score > 0.9 && completion.hintsUsed < 2,
    };
  }

  private async generateNextRecommendations(
    pathId: string,
    milestoneId: string,
    analysis: any,
  ): Promise<any[]> {
    return [
      {
        type: 'next_task',
        taskId: 'suggested_task_1',
        reason: 'Builds on current momentum',
        priority: 'high',
      },
      {
        type: 'review_task',
        taskId: 'review_task_1',
        reason: 'Reinforce previous concepts',
        priority: 'medium',
      },
    ];
  }

  private checkAdaptationTriggers(analysis: any, progress: any): string[] {
    const triggers: string[] = [];

    if (analysis.performanceLevel === 'excellent') {
      triggers.push('increase_difficulty');
    }

    if (analysis.performanceLevel === 'needs_improvement') {
      triggers.push('provide_additional_support');
    }

    if (
      progress.progressPercent > 50 &&
      analysis.independenceLevel === 'independent'
    ) {
      triggers.push('reduce_scaffolding');
    }

    return triggers;
  }

  private async storePathAdaptations(
    pathId: string,
    adaptations: any,
  ): Promise<void> {
    this.logger.log(`Storing adaptations for path ${pathId}`);
    // Mock storage
  }

  private async storeProgressAnalytics(
    pathId: string,
    analytics: any,
  ): Promise<void> {
    this.logger.log(`Storing progress analytics for path ${pathId}`);
    // Mock storage
  }
}
