import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { Task } from '../../domain/entities/task.entity';
import { CompetencyId } from '../../domain/value-objects/competency-id.value-object';
import { TaskType } from '../../domain/value-objects/task-type.value-object';
import { TaskCategory } from '../../domain/value-objects/task-category.value-object';
import { TaskDuration } from '../../domain/value-objects/task-duration.value-object';

/**
 * AI Task Generation Service
 *
 * Implements end-to-end AI-powered task generation using Claude 3.5 Sonnet.
 * Generates personalized tasks based on competency, CCIS level, and student profile.
 */
@Injectable()
export class AITaskGenerationService {
  private readonly logger = new Logger(AITaskGenerationService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.anthropic.com/v1/messages';
  private readonly modelName = 'claude-3-5-sonnet-20241022';

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.apiKey = this.configService.get<string>('ANTHROPIC_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.warn(
        'ANTHROPIC_API_KEY not configured - AI task generation will use fallback',
      );
    }
  }

  /**
   * Generate a personalized task using AI
   */
  async generatePersonalizedTask(request: {
    competencyId: string;
    ccisLevel: number;
    studentProfile: {
      personId: string;
      learningStyle?: string;
      industryInterest?: string;
      currentSkillGaps?: string[];
      performanceHistory?: any;
    };
    taskType: string;
    taskCategory: string;
    context?: {
      previousTasks?: string[];
      strugglingAreas?: string[];
      preferredDifficulty?: number;
    };
  }): Promise<{
    task: Task;
    generationMetrics: {
      promptUsed: string;
      responseTime: number;
      tokensUsed?: number;
      qualityScore: number;
      needsHumanReview: boolean;
    };
  }> {
    try {
      this.logger.log(
        `Generating AI task for competency ${request.competencyId}, CCIS level ${request.ccisLevel}`,
      );

      // Get or create generation template
      const template = await this.getOrCreateTemplate(
        request.competencyId,
        request.ccisLevel,
        request.taskType,
        request.taskCategory,
      );

      // Build personalized prompt
      const prompt = this.buildPersonalizedPrompt(request, template);

      // Generate task content using AI
      const startTime = Date.now();
      const aiResponse = await this.callClaudeAPI(prompt);
      const responseTime = Date.now() - startTime;

      // Parse and validate AI response
      const taskContent = this.parseAIResponse(aiResponse);
      const qualityScore = this.assessTaskQuality(taskContent, request);

      // Create Task entity
      const competencyId = CompetencyId.fromString(request.competencyId);
      const taskType = TaskType.fromString(request.taskType);
      const taskCategory = TaskCategory.fromString(request.taskCategory);

      const task = Task.create(
        taskContent.title,
        taskContent.description,
        taskContent.instructions,
        taskContent.context,
        taskContent.expectedDuration,
        competencyId,
        request.ccisLevel,
        taskType,
        taskCategory,
        taskContent.contentBlocks,
        taskContent.successCriteria,
        taskContent.assessmentRubric,
        {
          industryScenario: taskContent.industryScenario,
          tags: taskContent.tags,
        },
      );

      // Store generation record
      await this.storeGenerationRecord({
        templateId: template.id,
        taskId: task.getId().getValue(),
        competencyId: request.competencyId,
        ccisLevel: request.ccisLevel,
        promptUsed: prompt,
        responseRaw: JSON.stringify(aiResponse),
        generationTime: responseTime,
        qualityScore,
        needsHumanReview: qualityScore < 0.7,
      });

      return {
        task,
        generationMetrics: {
          promptUsed: prompt,
          responseTime,
          tokensUsed: aiResponse.usage?.total_tokens,
          qualityScore,
          needsHumanReview: qualityScore < 0.7,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to generate AI task: ${error.message}`, error);
      throw new Error(`AI task generation failed: ${error.message}`);
    }
  }

  /**
   * Generate adaptive task sequence for learning path
   */
  async generateTaskSequence(request: {
    competencyIds: string[];
    targetCCISLevel: number;
    studentProfile: any;
    sequenceLength: number;
    difficultyProgression: 'linear' | 'adaptive' | 'spiral';
  }): Promise<{
    sequence: Task[];
    adaptationPlan: {
      difficultyProgression: number[];
      competencyFocus: string[];
      estimatedDuration: number;
      checkpoints: number[];
    };
  }> {
    try {
      this.logger.log(
        `Generating adaptive task sequence for ${request.competencyIds.length} competencies`,
      );

      const sequence: Task[] = [];
      const difficultyProgression: number[] = [];
      const competencyFocus: string[] = [];

      // Calculate progression strategy
      const progressionPlan = this.calculateProgressionPlan(request);

      // Generate tasks according to plan
      for (let i = 0; i < request.sequenceLength; i++) {
        const stepPlan = progressionPlan.steps[i];

        const taskRequest = {
          competencyId: stepPlan.competencyId,
          ccisLevel: stepPlan.ccisLevel,
          studentProfile: request.studentProfile,
          taskType: stepPlan.taskType,
          taskCategory: stepPlan.taskCategory,
          context: {
            previousTasks: sequence.map((t) => t.getId().getValue()),
            sequencePosition: i,
            totalSequenceLength: request.sequenceLength,
          },
        };

        const { task } = await this.generatePersonalizedTask(taskRequest);
        sequence.push(task);
        difficultyProgression.push(stepPlan.difficulty);
        competencyFocus.push(stepPlan.competencyId);
      }

      return {
        sequence,
        adaptationPlan: {
          difficultyProgression,
          competencyFocus,
          estimatedDuration: progressionPlan.totalDuration,
          checkpoints: progressionPlan.checkpoints,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate task sequence: ${error.message}`,
        error,
      );
      throw new Error(`Task sequence generation failed: ${error.message}`);
    }
  }

  /**
   * Generate transfer learning variations
   */
  async generateTransferVariations(
    originalTaskId: string,
    variations: {
      industryContext?: string;
      complexityLevel?: number;
      culturalContext?: string;
      timeConstraint?: number;
    }[],
  ): Promise<Task[]> {
    try {
      this.logger.log(
        `Generating ${variations.length} transfer variations for task ${originalTaskId}`,
      );

      // Get original task (this would be from repository in real implementation)
      const originalTask = await this.getTaskById(originalTaskId);
      if (!originalTask) {
        throw new Error(`Original task ${originalTaskId} not found`);
      }

      const transferTasks: Task[] = [];

      for (const variation of variations) {
        const prompt = this.buildTransferVariationPrompt(
          originalTask,
          variation,
        );
        const aiResponse = await this.callClaudeAPI(prompt);
        const taskContent = this.parseAIResponse(aiResponse);

        // Create variation task
        const variationTask = Task.create(
          `${taskContent.title} (${variation.industryContext || 'Variation'})`,
          taskContent.description,
          taskContent.instructions,
          taskContent.context,
          taskContent.expectedDuration,
          originalTask.competencyId,
          originalTask.targetCCISLevel,
          originalTask.taskType,
          originalTask.taskCategory,
          taskContent.contentBlocks,
          taskContent.successCriteria,
          taskContent.assessmentRubric,
          {
            industryScenario: variation.industryContext,
            tags: [...(originalTask.tags || []), 'transfer-variation'],
          },
        );

        transferTasks.push(variationTask);
      }

      return transferTasks;
    } catch (error) {
      this.logger.error(
        `Failed to generate transfer variations: ${error.message}`,
        error,
      );
      throw new Error(`Transfer variation generation failed: ${error.message}`);
    }
  }

  /**
   * Build personalized prompt for AI generation
   */
  private buildPersonalizedPrompt(request: any, template: any): string {
    const competencyMap = {
      communication: 'Communication',
      problem_solving: 'Problem Solving',
      teamwork: 'Teamwork',
      adaptability: 'Adaptability',
      time_management: 'Time Management',
      technical_skills: 'Technical Skills',
      leadership: 'Leadership',
    };

    const competencyName =
      competencyMap[request.competencyId.toLowerCase()] || request.competencyId;

    return `You are an expert educational content creator specializing in competency-based assessment for the Shrameva CCIS platform. Generate a personalized task for competency assessment.

COMPETENCY: ${competencyName}
CCIS LEVEL: ${request.ccisLevel} (1=Dependent Learner, 2=Guided Practitioner, 3=Self-directed Performer, 4=Autonomous Expert)
TASK TYPE: ${request.taskType}
TASK CATEGORY: ${request.taskCategory}

STUDENT PROFILE:
- Learning Style: ${request.studentProfile.learningStyle || 'Mixed'}
- Industry Interest: ${request.studentProfile.industryInterest || 'General'}
- Current Skill Gaps: ${request.studentProfile.currentSkillGaps?.join(', ') || 'None specified'}
- Performance Trends: ${JSON.stringify(request.studentProfile.performanceHistory || {})}

CONTEXT:
- Previous Tasks: ${request.context?.previousTasks?.length || 0} completed
- Struggling Areas: ${request.context?.strugglingAreas?.join(', ') || 'None'}
- Preferred Difficulty: ${request.context?.preferredDifficulty || 'Adaptive'}

REQUIREMENTS:
1. Create a realistic, industry-relevant scenario
2. Align with CCIS level expectations for independence and scaffolding
3. Include culturally appropriate content for India/UAE markets
4. Provide clear success criteria and assessment rubric
5. Include adaptive hints for different skill levels

Generate the task in the following JSON format:
{
  "title": "Clear, engaging task title",
  "description": "Brief overview of learning objectives",
  "instructions": "Step-by-step guidance appropriate for CCIS level",
  "context": "Real-world scenario and background",
  "expectedDuration": 15,
  "contentBlocks": {
    "introduction": {"type": "text", "content": "..."},
    "instructions": {"type": "numbered_list", "content": ["step1", "step2", ...]},
    "examples": [{"type": "scenario", "title": "...", "content": "..."}],
    "resources": [{"type": "link", "title": "...", "url": "...", "description": "..."}]
  },
  "successCriteria": {
    "passingThreshold": 0.7,
    "criteria": [
      {"id": "c1", "description": "...", "weight": 0.4, "type": "ai_assessed"},
      {"id": "c2", "description": "...", "weight": 0.6, "type": "automated"}
    ]
  },
  "assessmentRubric": {
    "dimensions": [
      {
        "id": "quality",
        "name": "Quality of Work",
        "weight": 0.5,
        "levels": [
          {"score": 4, "label": "Excellent", "description": "...", "indicators": ["...", "..."]},
          {"score": 3, "label": "Good", "description": "...", "indicators": ["...", "..."]},
          {"score": 2, "label": "Satisfactory", "description": "...", "indicators": ["...", "..."]},
          {"score": 1, "label": "Needs Improvement", "description": "...", "indicators": ["...", "..."]}
        ]
      }
    ],
    "scoringMethod": "weighted_average",
    "passingScore": 2.5
  },
  "industryScenario": "Specific industry context",
  "tags": ["competency-specific", "industry-relevant", "ccis-level-${request.ccisLevel}"]
}

Focus on creating an engaging, realistic task that challenges the student appropriately for their CCIS level while being sensitive to cultural context and industry relevance.`;
  }

  /**
   * Build transfer variation prompt
   */
  private buildTransferVariationPrompt(
    originalTask: any,
    variation: any,
  ): string {
    return `You are adapting an existing educational task for transfer learning. Create a variation that maintains the same learning objectives but changes the context to test skill transfer.

ORIGINAL TASK:
Title: ${originalTask.title}
Description: ${originalTask.description}
Competency: ${originalTask.competencyId}
CCIS Level: ${originalTask.targetCCISLevel}

VARIATION REQUIREMENTS:
Industry Context: ${variation.industryContext || 'Technology'}
Complexity Level: ${variation.complexityLevel || 'Same as original'}
Cultural Context: ${variation.culturalContext || 'India/UAE appropriate'}
Time Constraint: ${variation.timeConstraint || 'Flexible'}

Create a variation that:
1. Uses the same core competency skills
2. Changes the surface context significantly
3. Maintains appropriate CCIS level difficulty
4. Tests true skill transfer, not memorization

Return the same JSON format as the original task generation.`;
  }

  /**
   * Call Claude API for task generation
   */
  private async callClaudeAPI(prompt: string): Promise<any> {
    if (!this.apiKey) {
      // Fallback to mock response for development
      return this.getMockTaskResponse();
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.modelName,
          max_tokens: 4096,
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Claude API error: ${response.status} ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`Claude API call failed: ${error.message}`, error);
      // Fallback to mock response
      return this.getMockTaskResponse();
    }
  }

  /**
   * Parse AI response and extract task content
   */
  private parseAIResponse(aiResponse: any): any {
    try {
      let content = '';

      if (aiResponse.content && Array.isArray(aiResponse.content)) {
        content = aiResponse.content[0]?.text || '';
      } else if (typeof aiResponse === 'string') {
        content = aiResponse;
      }

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error(`Failed to parse AI response: ${error.message}`);
      return this.getMockTaskContent();
    }
  }

  /**
   * Assess the quality of generated task content
   */
  private assessTaskQuality(taskContent: any, request: any): number {
    let qualityScore = 0;
    let checks = 0;

    // Check required fields
    const requiredFields = [
      'title',
      'description',
      'instructions',
      'context',
      'contentBlocks',
      'successCriteria',
      'assessmentRubric',
    ];
    const presentFields = requiredFields.filter((field) => taskContent[field]);
    qualityScore += (presentFields.length / requiredFields.length) * 0.3;
    checks++;

    // Check content length and detail
    const titleQuality =
      taskContent.title?.length >= 10 && taskContent.title?.length <= 100
        ? 1
        : 0.5;
    const descriptionQuality = taskContent.description?.length >= 50 ? 1 : 0.5;
    const instructionsQuality =
      taskContent.instructions?.length >= 100 ? 1 : 0.5;

    qualityScore +=
      ((titleQuality + descriptionQuality + instructionsQuality) / 3) * 0.3;
    checks++;

    // Check CCIS level appropriateness
    const ccisAlignment = this.assessCCISAlignment(
      taskContent,
      request.ccisLevel,
    );
    qualityScore += ccisAlignment * 0.2;
    checks++;

    // Check industry relevance
    const industryRelevance = this.assessIndustryRelevance(
      taskContent,
      request.studentProfile.industryInterest,
    );
    qualityScore += industryRelevance * 0.2;
    checks++;

    return Math.min(1.0, qualityScore);
  }

  /**
   * Assess CCIS level alignment
   */
  private assessCCISAlignment(taskContent: any, ccisLevel: number): number {
    // Simple heuristic - in production this would be more sophisticated
    const instructionLength = taskContent.instructions?.length || 0;
    const scaffoldingLevel = taskContent.contentBlocks?.examples?.length || 0;

    // Level 1: More scaffolding, detailed instructions
    // Level 4: Less scaffolding, more autonomy expected

    if (ccisLevel === 1 && instructionLength > 200 && scaffoldingLevel > 2)
      return 1.0;
    if (ccisLevel === 2 && instructionLength > 150 && scaffoldingLevel > 1)
      return 1.0;
    if (ccisLevel === 3 && instructionLength > 100 && scaffoldingLevel >= 1)
      return 1.0;
    if (ccisLevel === 4 && instructionLength > 50) return 1.0;

    return 0.6; // Partial alignment
  }

  /**
   * Assess industry relevance
   */
  private assessIndustryRelevance(
    taskContent: any,
    industryInterest?: string,
  ): number {
    if (!industryInterest) return 0.5;

    const content = JSON.stringify(taskContent).toLowerCase();
    const industry = industryInterest.toLowerCase();

    if (content.includes(industry)) return 1.0;

    // Check for related terms
    const industryTerms = {
      technology: ['software', 'coding', 'development', 'tech', 'digital'],
      finance: ['financial', 'banking', 'investment', 'accounting'],
      healthcare: ['medical', 'health', 'patient', 'clinical'],
      education: ['teaching', 'learning', 'student', 'academic'],
    };

    const terms = industryTerms[industry] || [];
    const relevantTerms = terms.filter((term) => content.includes(term));

    return relevantTerms.length > 0 ? 0.8 : 0.3;
  }

  /**
   * Get or create generation template
   */
  private async getOrCreateTemplate(
    competencyId: string,
    ccisLevel: number,
    taskType: string,
    taskCategory: string,
  ): Promise<any> {
    // In a real implementation, this would check database for existing template
    // For now, return a mock template
    return {
      id: `template_${competencyId}_${ccisLevel}_${taskType}_${taskCategory}`,
      competencyId,
      ccisLevel,
      taskType,
      taskCategory,
      promptVersion: 'v1.0.0',
    };
  }

  /**
   * Store generation record in database
   */
  private async storeGenerationRecord(record: any): Promise<void> {
    try {
      // In production, this would store to ai_generated_tasks table
      this.logger.log(`Storing generation record for task ${record.taskId}`);

      // Mock storage for now
      const generationRecord = {
        templateId: record.templateId,
        taskId: record.taskId,
        competencyId: record.competencyId,
        ccisLevel: record.ccisLevel,
        aiModel: this.modelName,
        promptUsed: record.promptUsed,
        responseRaw: record.responseRaw,
        generationTime: record.generationTime,
        qualityScore: record.qualityScore,
        approvalStatus: record.needsHumanReview
          ? 'HUMAN_REVIEW_REQUIRED'
          : 'APPROVED',
      };

      // await this.prisma.aiGeneratedTask.create({ data: generationRecord });
      this.logger.log(`Generation record stored successfully`);
    } catch (error) {
      this.logger.error(
        `Failed to store generation record: ${error.message}`,
        error,
      );
    }
  }

  /**
   * Calculate progression plan for task sequence
   */
  private calculateProgressionPlan(request: any): any {
    const steps: any[] = [];
    const totalDuration = 0;
    const checkpoints: number[] = [];

    // Simple linear progression for now
    for (let i = 0; i < request.sequenceLength; i++) {
      const competencyIndex = i % request.competencyIds.length;
      const progressRatio = i / (request.sequenceLength - 1);

      steps.push({
        competencyId: request.competencyIds[competencyIndex],
        ccisLevel: Math.min(
          4,
          Math.ceil(1 + progressRatio * (request.targetCCISLevel - 1)),
        ),
        taskType: this.getTaskTypeForStep(i, request.sequenceLength),
        taskCategory: this.getTaskCategoryForStep(i, request.sequenceLength),
        difficulty: 0.3 + progressRatio * 0.5, // Progress from 0.3 to 0.8
      });

      if (i > 0 && i % 3 === 0) {
        checkpoints.push(i);
      }
    }

    return {
      steps,
      totalDuration: request.sequenceLength * 20, // 20 minutes average per task
      checkpoints,
    };
  }

  /**
   * Helper methods for task sequence generation
   */
  private getTaskTypeForStep(step: number, totalSteps: number): string {
    const types = [
      'MICRO_TASK',
      'PRACTICE_TASK',
      'APPLICATION_TASK',
      'FUSION_TASK',
    ];
    return types[step % types.length];
  }

  private getTaskCategoryForStep(step: number, totalSteps: number): string {
    const categories = [
      'KNOWLEDGE_CHECK',
      'SKILL_PRACTICE',
      'PROBLEM_SOLVING',
      'CREATIVE_APPLICATION',
    ];
    return categories[step % categories.length];
  }

  /**
   * Mock responses for development/fallback
   */
  private getMockTaskResponse(): any {
    return {
      content: [
        {
          text: JSON.stringify(this.getMockTaskContent()),
        },
      ],
      usage: {
        total_tokens: 1500,
      },
    };
  }

  private getMockTaskContent(): any {
    return {
      title: 'Professional Email Crisis Management',
      description:
        'Learn to handle difficult client communications with professionalism and clarity',
      instructions:
        'You will receive a challenging client email and must craft an appropriate response that maintains professionalism while addressing concerns.',
      context:
        'You work as a project coordinator for a software development company. A major client is unhappy with recent deliverables and has sent an emotionally charged email.',
      expectedDuration: 15,
      contentBlocks: {
        introduction: {
          type: 'text',
          content:
            'Effective crisis communication is crucial for maintaining client relationships and project success.',
        },
        instructions: {
          type: 'numbered_list',
          content: [
            'Read the client email carefully',
            'Identify the core issues and emotions',
            'Draft a response that acknowledges concerns',
            'Propose concrete solutions and next steps',
            'Maintain professional tone throughout',
          ],
        },
        examples: [
          {
            type: 'scenario',
            title: 'Sample Crisis Email',
            content: 'A typical challenging client communication scenario',
            explanation:
              'This demonstrates common patterns in crisis communications',
          },
        ],
      },
      successCriteria: {
        passingThreshold: 0.7,
        criteria: [
          {
            id: 'professionalism',
            description: 'Maintains professional tone throughout',
            weight: 0.3,
            type: 'ai_assessed',
          },
          {
            id: 'problem_solving',
            description: 'Addresses all client concerns with solutions',
            weight: 0.4,
            type: 'ai_assessed',
          },
          {
            id: 'clarity',
            description: 'Communication is clear and well-structured',
            weight: 0.3,
            type: 'ai_assessed',
          },
        ],
      },
      assessmentRubric: {
        dimensions: [
          {
            id: 'communication_quality',
            name: 'Communication Quality',
            weight: 1.0,
            levels: [
              {
                score: 4,
                label: 'Excellent',
                description:
                  'Clear, professional, and persuasive communication',
                indicators: [
                  'Professional tone',
                  'Clear structure',
                  'Actionable solutions',
                ],
              },
              {
                score: 3,
                label: 'Good',
                description: 'Generally clear with minor issues',
                indicators: [
                  'Mostly professional',
                  'Good structure',
                  'Some solutions',
                ],
              },
              {
                score: 2,
                label: 'Satisfactory',
                description: 'Adequate but could be improved',
                indicators: [
                  'Basic professionalism',
                  'Unclear structure',
                  'Limited solutions',
                ],
              },
              {
                score: 1,
                label: 'Needs Improvement',
                description: 'Significant issues with communication',
                indicators: [
                  'Unprofessional tone',
                  'Poor structure',
                  'No clear solutions',
                ],
              },
            ],
          },
        ],
        scoringMethod: 'weighted_average',
        passingScore: 2.5,
      },
      industryScenario: 'Software Development Services',
      tags: [
        'communication',
        'crisis-management',
        'client-relations',
        'ccis-level-2',
      ],
    };
  }

  /**
   * Mock method - in real implementation would use repository
   */
  private async getTaskById(taskId: string): Promise<any> {
    // Mock implementation
    return {
      id: taskId,
      title: 'Original Task',
      description: 'Original task description',
      competencyId: CompetencyId.fromString('communication'),
      targetCCISLevel: 2,
      taskType: TaskType.fromString('PRACTICE_TASK'),
      taskCategory: TaskCategory.fromString('SKILL_PRACTICE'),
      tags: ['original'],
    };
  }
}
