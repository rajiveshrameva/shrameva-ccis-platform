import { ConsoleLogger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAIAssessmentService } from '../../application/assessment.service';
import { CompetencyType } from '../../domain/value-objects/competency-type.value-object';
import { CCISLevel } from '../../domain/value-objects/ccis-level.value-object';
import { ConfidenceScore } from '../../domain/value-objects/confidence-score.value-object';
import { BehavioralSignals } from '../../domain/value-objects/behavioral-signals.value-object';

/**
 * Claude AI Assessment Service
 *
 * Implements AI-powered CCIS level determination using Anthropic's Claude API.
 * This service sends behavioral signals and context to Claude and receives
 * CCIS level assessment with reasoning trace.
 */
@Injectable()
export class ClaudeAIAssessmentService implements IAIAssessmentService {
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.anthropic.com/v1/messages';
  private readonly modelName = 'claude-3-5-haiku-20241022';
  private readonly promptVersion = 'v1.0.0';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ANTHROPIC_API_KEY') || '';
  }

  async determineCCISLevel(
    competencyType: CompetencyType,
    behavioralSignals: BehavioralSignals,
    context: {
      taskIds: string[];
      sessionDuration: number;
      distractionEvents: number;
      previousLevel?: CCISLevel;
    },
  ): Promise<{
    ccisLevel: CCISLevel;
    confidenceScore: ConfidenceScore;
    reasoningTrace: string;
    modelUsed: string;
    promptVersion: string;
    nextLevelRequirements: string[];
  }> {
    try {
      const prompt = this.buildPrompt(
        competencyType,
        behavioralSignals,
        context,
      );
      const response = await this.callClaudeAPI(prompt);

      return this.parseResponse(response);
    } catch (error) {
      // Fallback to behavioral signals calculation
      const ccisLevelNumber = behavioralSignals.calculateCCISLevel();
      const ccisLevel = CCISLevel.create(ccisLevelNumber);
      const confidenceScore = ConfidenceScore.create(
        behavioralSignals.getAssessmentConfidence(),
      );

      return {
        ccisLevel,
        confidenceScore,
        reasoningTrace: `Fallback assessment due to AI service error: ${error.message}. Used behavioral signals weighted calculation.`,
        modelUsed: 'fallback-behavioral-signals',
        promptVersion: this.promptVersion,
        nextLevelRequirements:
          this.getGenericNextLevelRequirements(ccisLevelNumber),
      };
    }
  }

  private buildPrompt(
    competencyType: CompetencyType,
    behavioralSignals: BehavioralSignals,
    context: {
      taskIds: string[];
      sessionDuration: number;
      distractionEvents: number;
      previousLevel?: CCISLevel;
    },
  ): string {
    return `You are an expert educational assessment AI specializing in the CCIS (Confidence-Competence Independence Scale) methodology. Your task is to determine a student's CCIS level based on their behavioral signals during task completion.

CCIS LEVELS:
1. Dependent Learner (0-25% mastery): Requires high scaffolding, frequent hints, struggles with error recovery
2. Guided Practitioner (25-50% mastery): Needs moderate scaffolding, developing self-correction skills
3. Self-directed Performer (50-85% mastery): Minimal scaffolding needed, good metacognitive awareness
4. Autonomous Expert (85-100% mastery): No scaffolding needed, excellent transfer and metacognition

COMPETENCY: ${competencyType.toString()}

BEHAVIORAL SIGNALS:
- Hint Request Frequency: ${behavioralSignals.getHintRequestFrequency()} (weight: 35%)
- Error Recovery Speed: ${behavioralSignals.getErrorRecoverySpeed()} (weight: 25%)
- Transfer Success Rate: ${behavioralSignals.getTransferSuccessRate()} (weight: 20%)
- Metacognitive Accuracy: ${behavioralSignals.getMetacognitiveAccuracy()} (weight: 10%)
- Task Completion Efficiency: ${behavioralSignals.getTaskCompletionEfficiency()} (weight: 5%)
- Help Seeking Quality: ${behavioralSignals.getHelpSeekingQuality()} (weight: 3%)
- Self Assessment Alignment: ${behavioralSignals.getSelfAssessmentAlignment()} (weight: 2%)

CONTEXT:
- Tasks Completed: ${context.taskIds.length}
- Session Duration: ${context.sessionDuration} minutes
- Distraction Events: ${context.distractionEvents}
- Previous CCIS Level: ${context.previousLevel?.getLevel() || 'N/A'}

BEHAVIORAL ANALYSIS:
- Weighted Score: ${behavioralSignals.calculateWeightedScore()}
- Assessment Confidence: ${behavioralSignals.getAssessmentConfidence()}

Please provide your assessment in the following JSON format:
{
  "ccisLevel": [1-4],
  "confidenceScore": [0.0-1.0],
  "reasoningTrace": "Detailed explanation of your decision process",
  "nextLevelRequirements": ["requirement1", "requirement2", "requirement3"]
}

Focus on:
1. The weighted behavioral signals and their implications for independence
2. Consistency patterns across different signal types
3. Evidence of scaffolding dependency vs. autonomous performance
4. Metacognitive awareness and transfer capability
5. Specific, actionable requirements for advancing to the next level`;
  }

  private async callClaudeAPI(prompt: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.modelName,
        max_tokens: 1000,
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

    const data = await response.json();
    return data.content[0].text;
  }

  private parseResponse(response: string): {
    ccisLevel: CCISLevel;
    confidenceScore: ConfidenceScore;
    reasoningTrace: string;
    modelUsed: string;
    promptVersion: string;
    nextLevelRequirements: string[];
  } {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate and create domain objects
      const ccisLevel = CCISLevel.create(parsed.ccisLevel);
      const confidenceScore = ConfidenceScore.create(parsed.confidenceScore);

      return {
        ccisLevel,
        confidenceScore,
        reasoningTrace: parsed.reasoningTrace || response,
        modelUsed: this.modelName,
        promptVersion: this.promptVersion,
        nextLevelRequirements: parsed.nextLevelRequirements || [],
      };
    } catch (error) {
      throw new Error(`Failed to parse Claude response: ${error.message}`);
    }
  }

  private getGenericNextLevelRequirements(currentLevel: number): string[] {
    const requirements: Record<number, string[]> = {
      1: [
        'Reduce hint request frequency to less than 10 per session',
        'Achieve error self-correction within 30 seconds',
        'Complete at least 60% of tasks independently',
      ],
      2: [
        'Reduce hint requests to less than 5 per session',
        'Demonstrate consistent error recovery patterns',
        'Show improved metacognitive self-assessment accuracy',
      ],
      3: [
        'Achieve 85%+ transfer success rate on novel problems',
        'Demonstrate autonomous error detection and correction',
        'Show expert-level help-seeking behavior (strategic questions)',
      ],
      4: [
        'Maintain current level of autonomous performance',
        'Mentor others effectively',
        'Lead complex problem-solving initiatives',
      ],
    };

    return requirements[currentLevel] || [];
  }
}
