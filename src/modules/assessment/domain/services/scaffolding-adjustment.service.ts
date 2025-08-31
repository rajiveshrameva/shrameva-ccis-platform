// src/modules/assessment/domain/services/scaffolding-adjustment.service.ts

import { CCISLevel } from '../value-objects/ccis-level.value-object';
import { CompetencyType } from '../value-objects/competency-type.value-object';
import { BehavioralSignals } from '../value-objects/behavioral-signals.value-object';
import {
  GamingAnalysisResult,
  GamingRiskLevel,
} from './gaming-detection.service';
import { BusinessRuleException } from '../../../../shared/domain/exceptions/domain-exception.base';

/**
 * Scaffolding Adjustment Service
 *
 * Advanced domain service responsible for dynamically adjusting assessment
 * scaffolding (support level) based on learner performance, CCIS level progression,
 * and gaming detection results. This service implements adaptive learning
 * principles to optimize the zone of proximal development for each learner.
 *
 * Key Responsibilities:
 * 1. **Dynamic Difficulty Adjustment**: Real-time scaffolding modification
 * 2. **CCIS-Based Adaptation**: Level-appropriate support provision
 * 3. **Gaming Response**: Anti-fraud scaffolding adjustments
 * 4. **Learning Optimization**: Maximize competency development
 * 5. **Cultural Adaptation**: Region-specific learning preferences
 * 6. **Progress Acceleration**: Efficient advancement through levels
 * 7. **Intervention Integration**: Coordinated learning support
 *
 * Scaffolding Dimensions:
 * - **Hint Availability**: Quantity and quality of assistance
 * - **Task Complexity**: Cognitive load and difficulty
 * - **Time Pressure**: Temporal constraints and pacing
 * - **Feedback Frequency**: Immediate vs delayed responses
 * - **Example Provision**: Worked examples and demonstrations
 * - **Error Tolerance**: Mistake handling and recovery
 * - **Self-Regulation Support**: Metacognitive scaffolding
 *
 * Adaptation Triggers:
 * - **Performance Plateaus**: Stagnant progress detection
 * - **Rapid Advancement**: Accelerated learning recognition
 * - **Gaming Detection**: Fraud prevention adjustments
 * - **Frustration Indicators**: Emotional state management
 * - **Confidence Fluctuations**: Self-efficacy support
 * - **Cultural Factors**: Regional learning style preferences
 * - **Time Constraints**: Deadline-based modifications
 *
 * CCIS Level Scaffolding:
 * - **Level 1 (Novice)**: Maximum scaffolding, extensive hints
 * - **Level 2 (Guided)**: Moderate scaffolding, strategic hints
 * - **Level 3 (Self-directed)**: Minimal scaffolding, on-demand hints
 * - **Level 4 (Autonomous)**: No scaffolding, independent operation
 *
 * @example
 * ```typescript
 * // Dynamic scaffolding adjustment
 * const adjustment = ScaffoldingAdjustmentService.calculateOptimalScaffolding(
 *   currentLevel,
 *   performanceData,
 *   competencyType,
 *   culturalContext
 * );
 *
 * // Apply gaming-based adjustments
 * const gameAdjustment = ScaffoldingAdjustmentService.adjustForGaming(
 *   baseScaffolding,
 *   gamingResults
 * );
 *
 * // Optimize for rapid advancement
 * const optimized = ScaffoldingAdjustmentService.optimizeForAdvancement(
 *   currentScaffolding,
 *   learningVelocity
 * );
 * ```
 */

export enum ScaffoldingType {
  HINTS = 'HINTS',
  EXAMPLES = 'EXAMPLES',
  FEEDBACK = 'FEEDBACK',
  TIME_EXTENSION = 'TIME_EXTENSION',
  COMPLEXITY_REDUCTION = 'COMPLEXITY_REDUCTION',
  METACOGNITIVE_PROMPTS = 'METACOGNITIVE_PROMPTS',
  ERROR_GUIDANCE = 'ERROR_GUIDANCE',
  PEER_COLLABORATION = 'PEER_COLLABORATION',
}

export enum ScaffoldingIntensity {
  NONE = 'NONE', // No scaffolding (Level 4)
  MINIMAL = 'MINIMAL', // Basic support (Level 3)
  MODERATE = 'MODERATE', // Standard support (Level 2)
  EXTENSIVE = 'EXTENSIVE', // Maximum support (Level 1)
  EMERGENCY = 'EMERGENCY', // Crisis intervention
}

export enum AdjustmentReason {
  CCIS_LEVEL_CHANGE = 'CCIS_LEVEL_CHANGE',
  PERFORMANCE_PLATEAU = 'PERFORMANCE_PLATEAU',
  RAPID_ADVANCEMENT = 'RAPID_ADVANCEMENT',
  GAMING_DETECTION = 'GAMING_DETECTION',
  FRUSTRATION_INDICATORS = 'FRUSTRATION_INDICATORS',
  TIME_CONSTRAINTS = 'TIME_CONSTRAINTS',
  CULTURAL_ADAPTATION = 'CULTURAL_ADAPTATION',
  ERROR_PATTERN_CHANGE = 'ERROR_PATTERN_CHANGE',
  CONFIDENCE_FLUCTUATION = 'CONFIDENCE_FLUCTUATION',
}

export interface ScaffoldingConfiguration {
  hintAvailability: {
    enabled: boolean;
    frequency: 'unlimited' | 'limited' | 'strategic' | 'none';
    quality: 'basic' | 'detailed' | 'adaptive' | 'minimal';
    timing: 'immediate' | 'delayed' | 'request_only';
  };
  taskComplexity: {
    level: 'basic' | 'intermediate' | 'advanced' | 'expert';
    adaptiveDifficulty: boolean;
    multiStep: boolean;
    abstractionLevel: 'concrete' | 'semi_abstract' | 'abstract';
  };
  feedbackSettings: {
    frequency: 'continuous' | 'milestone' | 'completion' | 'none';
    detail: 'minimal' | 'standard' | 'comprehensive';
    errorCorrection: 'immediate' | 'guided' | 'self_discovery';
    reinforcement: 'positive' | 'constructive' | 'neutral';
  };
  timeManagement: {
    pressure: 'none' | 'light' | 'moderate' | 'high';
    extensions: boolean;
    warnings: boolean;
    pacing: 'self_paced' | 'guided' | 'fixed';
  };
  culturalAdaptations: {
    communicationStyle: 'direct' | 'indirect' | 'contextual';
    authorityStructure: 'hierarchical' | 'collaborative' | 'individual';
    learningPreference: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  };
}

export interface PerformanceIndicators {
  currentCCISLevel: CCISLevel;
  targetCCISLevel: CCISLevel;
  competencyType: CompetencyType;
  currentSignals: BehavioralSignals;
  recentPerformanceTrend: 'improving' | 'stable' | 'declining';
  frustrationLevel: number; // 0-1 scale
  confidenceLevel: number; // 0-1 scale
  engagementLevel: number; // 0-1 scale
  learningVelocity: number; // Tasks completed per hour
  errorRecoveryRate: number; // 0-1 scale
  helpSeekingEfficiency: number; // 0-1 scale
  timePressure: number; // 0-1 scale
}

export interface CulturalContext {
  region: 'INDIA' | 'UAE' | 'GLOBAL';
  languagePreference: string;
  educationalBackground: 'traditional' | 'progressive' | 'mixed';
  technicalFamiliarity: 'low' | 'medium' | 'high';
  learningStyle: 'individual' | 'collaborative' | 'competitive';
  communicationPreference: 'formal' | 'informal' | 'adaptive';
}

export interface ScaffoldingAdjustment {
  adjustmentId: string;
  reason: AdjustmentReason;
  previousConfiguration: ScaffoldingConfiguration;
  newConfiguration: ScaffoldingConfiguration;
  expectedOutcome: string;
  confidenceLevel: number; // 0-1 scale
  implementationTimestamp: Date;
  estimatedEffectDuration: number; // minutes
  monitoringMetrics: string[];
  rollbackCriteria: string[];
}

export interface OptimizationResult {
  recommendedConfiguration: ScaffoldingConfiguration;
  adjustmentReasoning: string[];
  predictedImpact: {
    learningVelocity: number; // expected change %
    competencyGrowth: number; // expected change %
    engagementLevel: number; // expected change %
    frustrationReduction: number; // expected change %
  };
  implementationPriority: 'immediate' | 'high' | 'medium' | 'low';
  culturalSensitivity: number; // 0-1 scale
  adaptationConfidence: number; // 0-1 scale
}

export interface LearningTrajectory {
  currentPosition: {
    ccisLevel: CCISLevel;
    competencyScore: number;
    masteryIndicators: string[];
  };
  targetPosition: {
    ccisLevel: CCISLevel;
    estimatedTimeToAchieve: number; // hours
    requiredInterventions: string[];
  };
  trajectory: Array<{
    milestone: string;
    estimatedTime: number; // minutes
    requiredScaffolding: ScaffoldingIntensity;
    successProbability: number; // 0-1 scale
  }>;
  riskFactors: string[];
  accelerationOpportunities: string[];
}

export class ScaffoldingAdjustmentService {
  // CCIS Level Default Configurations
  private static readonly CCIS_DEFAULT_SCAFFOLDING: Record<
    string,
    ScaffoldingConfiguration
  > = {
    LEVEL_1: {
      hintAvailability: {
        enabled: true,
        frequency: 'unlimited',
        quality: 'detailed',
        timing: 'immediate',
      },
      taskComplexity: {
        level: 'basic',
        adaptiveDifficulty: true,
        multiStep: false,
        abstractionLevel: 'concrete',
      },
      feedbackSettings: {
        frequency: 'continuous',
        detail: 'comprehensive',
        errorCorrection: 'immediate',
        reinforcement: 'positive',
      },
      timeManagement: {
        pressure: 'none',
        extensions: true,
        warnings: true,
        pacing: 'self_paced',
      },
      culturalAdaptations: {
        communicationStyle: 'contextual',
        authorityStructure: 'collaborative',
        learningPreference: 'mixed',
      },
    },
    LEVEL_2: {
      hintAvailability: {
        enabled: true,
        frequency: 'limited',
        quality: 'adaptive',
        timing: 'delayed',
      },
      taskComplexity: {
        level: 'intermediate',
        adaptiveDifficulty: true,
        multiStep: true,
        abstractionLevel: 'semi_abstract',
      },
      feedbackSettings: {
        frequency: 'milestone',
        detail: 'standard',
        errorCorrection: 'guided',
        reinforcement: 'constructive',
      },
      timeManagement: {
        pressure: 'light',
        extensions: true,
        warnings: true,
        pacing: 'guided',
      },
      culturalAdaptations: {
        communicationStyle: 'direct',
        authorityStructure: 'collaborative',
        learningPreference: 'visual',
      },
    },
    LEVEL_3: {
      hintAvailability: {
        enabled: true,
        frequency: 'strategic',
        quality: 'minimal',
        timing: 'request_only',
      },
      taskComplexity: {
        level: 'advanced',
        adaptiveDifficulty: false,
        multiStep: true,
        abstractionLevel: 'abstract',
      },
      feedbackSettings: {
        frequency: 'completion',
        detail: 'minimal',
        errorCorrection: 'self_discovery',
        reinforcement: 'neutral',
      },
      timeManagement: {
        pressure: 'moderate',
        extensions: false,
        warnings: false,
        pacing: 'fixed',
      },
      culturalAdaptations: {
        communicationStyle: 'direct',
        authorityStructure: 'individual',
        learningPreference: 'mixed',
      },
    },
    LEVEL_4: {
      hintAvailability: {
        enabled: false,
        frequency: 'none',
        quality: 'minimal',
        timing: 'request_only',
      },
      taskComplexity: {
        level: 'expert',
        adaptiveDifficulty: false,
        multiStep: true,
        abstractionLevel: 'abstract',
      },
      feedbackSettings: {
        frequency: 'completion',
        detail: 'minimal',
        errorCorrection: 'self_discovery',
        reinforcement: 'neutral',
      },
      timeManagement: {
        pressure: 'high',
        extensions: false,
        warnings: false,
        pacing: 'fixed',
      },
      culturalAdaptations: {
        communicationStyle: 'direct',
        authorityStructure: 'individual',
        learningPreference: 'mixed',
      },
    },
  };

  // Cultural adaptation weights for different regions
  private static readonly CULTURAL_WEIGHTS = {
    INDIA: {
      authorityStructure: 0.8, // Higher respect for guidance
      collaborative: 0.7, // Strong collaborative culture
      detailed_feedback: 0.8, // Preference for comprehensive feedback
      formal_communication: 0.7, // More formal interaction style
    },
    UAE: {
      authorityStructure: 0.7, // Moderate authority respect
      collaborative: 0.6, // Balanced individual/collaborative
      detailed_feedback: 0.6, // Moderate feedback preference
      formal_communication: 0.8, // High formality preference
    },
    GLOBAL: {
      authorityStructure: 0.5, // Balanced approach
      collaborative: 0.5, // Neutral collaborative preference
      detailed_feedback: 0.5, // Standard feedback level
      formal_communication: 0.5, // Neutral communication style
    },
  };

  /**
   * Calculate optimal scaffolding configuration based on performance indicators
   */
  public static calculateOptimalScaffolding(
    performance: PerformanceIndicators,
    culturalContext: CulturalContext,
    previousConfiguration?: ScaffoldingConfiguration,
  ): OptimizationResult {
    // Start with CCIS level default configuration
    const baseConfig = this.getBaseConfiguration(performance.currentCCISLevel);

    // Apply cultural adaptations
    const culturallyAdapted = this.applyCulturalAdaptations(
      baseConfig,
      culturalContext,
    );

    // Apply performance-based adjustments
    const performanceAdjusted = this.applyPerformanceAdjustments(
      culturallyAdapted,
      performance,
    );

    // Calculate predicted impact
    const predictedImpact = this.predictAdjustmentImpact(
      performanceAdjusted,
      previousConfiguration,
      performance,
    );

    // Generate reasoning
    const adjustmentReasoning = this.generateAdjustmentReasoning(
      performance,
      culturalContext,
      baseConfig,
      performanceAdjusted,
    );

    // Determine implementation priority
    const implementationPriority =
      this.determineImplementationPriority(performance);

    return {
      recommendedConfiguration: performanceAdjusted,
      adjustmentReasoning,
      predictedImpact,
      implementationPriority,
      culturalSensitivity: this.calculateCulturalSensitivity(culturalContext),
      adaptationConfidence: this.calculateAdaptationConfidence(
        performance,
        culturalContext,
      ),
    };
  }

  /**
   * Adjust scaffolding in response to gaming detection
   */
  public static adjustForGaming(
    currentConfiguration: ScaffoldingConfiguration,
    gamingResults: GamingAnalysisResult,
  ): ScaffoldingAdjustment {
    const adjustmentId = `gaming_adjustment_${Date.now()}`;
    const newConfiguration = { ...currentConfiguration };

    // Apply gaming-specific adjustments based on risk level
    switch (gamingResults.riskLevel) {
      case GamingRiskLevel.CRITICAL:
        // Severe restrictions
        newConfiguration.hintAvailability.enabled = false;
        newConfiguration.taskComplexity.level = 'expert';
        newConfiguration.taskComplexity.adaptiveDifficulty = false;
        newConfiguration.feedbackSettings.frequency = 'completion';
        newConfiguration.timeManagement.pressure = 'high';
        newConfiguration.timeManagement.extensions = false;
        break;

      case GamingRiskLevel.HIGH:
        // Significant restrictions
        newConfiguration.hintAvailability.frequency = 'strategic';
        newConfiguration.hintAvailability.quality = 'minimal';
        newConfiguration.taskComplexity.level = 'advanced';
        newConfiguration.feedbackSettings.frequency = 'milestone';
        newConfiguration.timeManagement.pressure = 'moderate';
        break;

      case GamingRiskLevel.MEDIUM:
        // Moderate restrictions
        newConfiguration.hintAvailability.frequency = 'limited';
        newConfiguration.hintAvailability.timing = 'delayed';
        newConfiguration.taskComplexity.adaptiveDifficulty = false;
        newConfiguration.timeManagement.pressure = 'light';
        break;

      default:
        // No changes for low or no risk
        break;
    }

    return {
      adjustmentId,
      reason: AdjustmentReason.GAMING_DETECTION,
      previousConfiguration: currentConfiguration,
      newConfiguration,
      expectedOutcome: `Mitigate gaming risk level: ${gamingResults.riskLevel}`,
      confidenceLevel: 0.9,
      implementationTimestamp: new Date(),
      estimatedEffectDuration: 30, // 30 minutes
      monitoringMetrics: [
        'task_completion_time',
        'hint_usage_pattern',
        'error_recovery_speed',
        'performance_consistency',
      ],
      rollbackCriteria: [
        'Gaming risk drops below MEDIUM',
        'Performance deteriorates beyond acceptable range',
        'User frustration exceeds threshold',
      ],
    };
  }

  /**
   * Optimize scaffolding for rapid CCIS level advancement
   */
  public static optimizeForAdvancement(
    performance: PerformanceIndicators,
    currentConfiguration: ScaffoldingConfiguration,
    targetLevel: CCISLevel,
  ): OptimizationResult {
    const optimizedConfig = { ...currentConfiguration };
    const adjustmentReasoning: string[] = [];

    // Analyze advancement readiness
    const advancementReadiness = this.assessAdvancementReadiness(performance);

    if (advancementReadiness > 0.8) {
      // High readiness - reduce scaffolding for challenge
      optimizedConfig.hintAvailability.frequency = 'strategic';
      optimizedConfig.taskComplexity.level = 'advanced';
      optimizedConfig.timeManagement.pressure = 'moderate';
      adjustmentReasoning.push(
        'High advancement readiness detected - reducing scaffolding for optimal challenge',
      );
    } else if (advancementReadiness > 0.6) {
      // Moderate readiness - balanced approach
      optimizedConfig.hintAvailability.frequency = 'limited';
      optimizedConfig.taskComplexity.adaptiveDifficulty = true;
      adjustmentReasoning.push(
        'Moderate advancement readiness - maintaining balanced scaffolding',
      );
    } else {
      // Low readiness - maintain or increase support
      optimizedConfig.hintAvailability.enabled = true;
      optimizedConfig.feedbackSettings.frequency = 'continuous';
      adjustmentReasoning.push(
        'Low advancement readiness - maintaining supportive scaffolding',
      );
    }

    // Calculate trajectory to target level
    const trajectory = this.calculateLearningTrajectory(
      performance,
      targetLevel,
    );

    return {
      recommendedConfiguration: optimizedConfig,
      adjustmentReasoning,
      predictedImpact: {
        learningVelocity: advancementReadiness * 0.3, // Up to 30% improvement
        competencyGrowth: advancementReadiness * 0.25, // Up to 25% growth
        engagementLevel: advancementReadiness * 0.2, // Up to 20% engagement
        frustrationReduction: advancementReadiness * 0.15, // Up to 15% frustration reduction
      },
      implementationPriority: advancementReadiness > 0.8 ? 'high' : 'medium',
      culturalSensitivity: 0.7,
      adaptationConfidence: advancementReadiness,
    };
  }

  /**
   * Generate learning trajectory prediction
   */
  public static calculateLearningTrajectory(
    performance: PerformanceIndicators,
    targetLevel: CCISLevel,
  ): LearningTrajectory {
    const currentLevel = performance.currentCCISLevel;
    const levelDifference = targetLevel.getLevel() - currentLevel.getLevel();

    // Estimate time based on current learning velocity and level gap
    const baseTimePerLevel = 2; // 2 hours per level (average)
    const velocityMultiplier = Math.max(0.5, performance.learningVelocity);
    const estimatedTimeToAchieve =
      (levelDifference * baseTimePerLevel) / velocityMultiplier;

    // Generate trajectory milestones
    const trajectory: LearningTrajectory['trajectory'] = [];
    for (let i = 1; i <= levelDifference; i++) {
      const milestoneLevel = currentLevel.getLevel() + i;
      trajectory.push({
        milestone: `Reach CCIS Level ${milestoneLevel}`,
        estimatedTime: (i / levelDifference) * estimatedTimeToAchieve * 60, // Convert to minutes
        requiredScaffolding:
          this.getRequiredScaffoldingIntensity(milestoneLevel),
        successProbability: Math.max(0.3, 1 - i * 0.2), // Decreasing probability for higher levels
      });
    }

    // Identify risk factors
    const riskFactors: string[] = [];
    if (performance.frustrationLevel > 0.7) {
      riskFactors.push('High frustration level may impede progress');
    }
    if (performance.confidenceLevel < 0.4) {
      riskFactors.push('Low confidence may require additional support');
    }
    if (performance.engagementLevel < 0.5) {
      riskFactors.push('Low engagement may slow advancement');
    }

    // Identify acceleration opportunities
    const accelerationOpportunities: string[] = [];
    if (performance.learningVelocity > 1.2) {
      accelerationOpportunities.push(
        'High learning velocity - potential for accelerated progression',
      );
    }
    if (performance.helpSeekingEfficiency > 0.8) {
      accelerationOpportunities.push(
        'Efficient help-seeking - optimize hint strategies',
      );
    }
    if (performance.errorRecoveryRate > 0.9) {
      accelerationOpportunities.push(
        'Excellent error recovery - increase task complexity',
      );
    }

    return {
      currentPosition: {
        ccisLevel: currentLevel,
        competencyScore: performance.currentSignals.calculateWeightedScore(),
        masteryIndicators: this.identifyMasteryIndicators(performance),
      },
      targetPosition: {
        ccisLevel: targetLevel,
        estimatedTimeToAchieve,
        requiredInterventions: this.identifyRequiredInterventions(
          performance,
          targetLevel,
        ),
      },
      trajectory,
      riskFactors,
      accelerationOpportunities,
    };
  }

  // Private helper methods

  private static getBaseConfiguration(
    ccisLevel: CCISLevel,
  ): ScaffoldingConfiguration {
    const levelKey = `LEVEL_${ccisLevel.getLevel()}`;
    return { ...this.CCIS_DEFAULT_SCAFFOLDING[levelKey] };
  }

  private static applyCulturalAdaptations(
    baseConfig: ScaffoldingConfiguration,
    culturalContext: CulturalContext,
  ): ScaffoldingConfiguration {
    const adapted = { ...baseConfig };
    const weights = this.CULTURAL_WEIGHTS[culturalContext.region];

    // Apply cultural weights to configuration
    if (weights.authorityStructure > 0.7) {
      adapted.culturalAdaptations.authorityStructure = 'hierarchical';
      adapted.feedbackSettings.detail = 'comprehensive';
    }

    if (weights.collaborative > 0.6) {
      adapted.culturalAdaptations.learningPreference = 'mixed';
    }

    if (weights.formal_communication > 0.7) {
      adapted.culturalAdaptations.communicationStyle = 'direct';
    }

    return adapted;
  }

  private static applyPerformanceAdjustments(
    config: ScaffoldingConfiguration,
    performance: PerformanceIndicators,
  ): ScaffoldingConfiguration {
    const adjusted = { ...config };

    // Adjust based on frustration level
    if (performance.frustrationLevel > 0.7) {
      adjusted.hintAvailability.enabled = true;
      adjusted.hintAvailability.frequency = 'unlimited';
      adjusted.timeManagement.pressure = 'none';
      adjusted.feedbackSettings.reinforcement = 'positive';
    }

    // Adjust based on confidence level
    if (performance.confidenceLevel < 0.4) {
      adjusted.feedbackSettings.frequency = 'continuous';
      adjusted.feedbackSettings.detail = 'comprehensive';
      adjusted.taskComplexity.level = 'basic';
    }

    // Adjust based on engagement level
    if (performance.engagementLevel < 0.5) {
      adjusted.taskComplexity.adaptiveDifficulty = true;
      adjusted.timeManagement.pacing = 'self_paced';
    }

    return adjusted;
  }

  private static predictAdjustmentImpact(
    newConfig: ScaffoldingConfiguration,
    previousConfig: ScaffoldingConfiguration | undefined,
    performance: PerformanceIndicators,
  ) {
    // Simplified impact prediction based on configuration changes
    return {
      learningVelocity: 0.15, // 15% improvement expected
      competencyGrowth: 0.2, // 20% growth expected
      engagementLevel: 0.1, // 10% engagement improvement
      frustrationReduction: 0.25, // 25% frustration reduction
    };
  }

  private static generateAdjustmentReasoning(
    performance: PerformanceIndicators,
    culturalContext: CulturalContext,
    baseConfig: ScaffoldingConfiguration,
    adjustedConfig: ScaffoldingConfiguration,
  ): string[] {
    const reasoning: string[] = [];

    reasoning.push(
      `Base configuration determined by CCIS Level ${performance.currentCCISLevel.getLevel()}`,
    );
    reasoning.push(
      `Cultural adaptations applied for ${culturalContext.region} context`,
    );

    if (performance.frustrationLevel > 0.6) {
      reasoning.push('Increased support due to elevated frustration levels');
    }

    if (performance.confidenceLevel < 0.5) {
      reasoning.push('Enhanced feedback and guidance for confidence building');
    }

    return reasoning;
  }

  private static determineImplementationPriority(
    performance: PerformanceIndicators,
  ): 'immediate' | 'high' | 'medium' | 'low' {
    if (
      performance.frustrationLevel > 0.8 ||
      performance.engagementLevel < 0.3
    ) {
      return 'immediate';
    }
    if (
      performance.confidenceLevel < 0.4 ||
      performance.recentPerformanceTrend === 'declining'
    ) {
      return 'high';
    }
    if (performance.learningVelocity < 0.5) {
      return 'medium';
    }
    return 'low';
  }

  private static calculateCulturalSensitivity(
    culturalContext: CulturalContext,
  ): number {
    // Simple calculation based on cultural context specificity
    const regionSpecificity = culturalContext.region !== 'GLOBAL' ? 0.8 : 0.5;
    const styleSpecificity =
      culturalContext.learningStyle !== 'collaborative' ? 0.7 : 0.5;
    return (regionSpecificity + styleSpecificity) / 2;
  }

  private static calculateAdaptationConfidence(
    performance: PerformanceIndicators,
    culturalContext: CulturalContext,
  ): number {
    // Confidence based on data completeness and consistency
    let confidence = 0.7; // Base confidence

    if (performance.recentPerformanceTrend !== 'stable') {
      confidence += 0.1;
    }

    if (culturalContext.region !== 'GLOBAL') {
      confidence += 0.1;
    }

    return Math.min(1.0, confidence);
  }

  private static assessAdvancementReadiness(
    performance: PerformanceIndicators,
  ): number {
    const signals = performance.currentSignals.getValue();

    // Weighted assessment of advancement readiness
    const readinessScore =
      signals.transferSuccessRate * 0.3 + // 30% weight
      performance.confidenceLevel * 0.2 + // 20% weight
      performance.learningVelocity * 0.2 + // 20% weight
      signals.errorRecoverySpeed * 0.15 + // 15% weight
      performance.engagementLevel * 0.15; // 15% weight

    return Math.min(1.0, readinessScore);
  }

  private static getRequiredScaffoldingIntensity(
    levelNumber: number,
  ): ScaffoldingIntensity {
    switch (levelNumber) {
      case 1:
        return ScaffoldingIntensity.EXTENSIVE;
      case 2:
        return ScaffoldingIntensity.MODERATE;
      case 3:
        return ScaffoldingIntensity.MINIMAL;
      case 4:
        return ScaffoldingIntensity.NONE;
      default:
        return ScaffoldingIntensity.MODERATE;
    }
  }

  private static identifyMasteryIndicators(
    performance: PerformanceIndicators,
  ): string[] {
    const indicators: string[] = [];
    const signals = performance.currentSignals.getValue();

    if (signals.transferSuccessRate > 0.8) {
      indicators.push('High transfer success rate');
    }
    if (signals.errorRecoverySpeed > 0.8) {
      indicators.push('Excellent error recovery');
    }
    if (performance.helpSeekingEfficiency > 0.8) {
      indicators.push('Efficient help-seeking behavior');
    }

    return indicators;
  }

  private static identifyRequiredInterventions(
    performance: PerformanceIndicators,
    targetLevel: CCISLevel,
  ): string[] {
    const interventions: string[] = [];

    if (performance.frustrationLevel > 0.6) {
      interventions.push('Frustration management support');
    }
    if (performance.confidenceLevel < 0.5) {
      interventions.push('Confidence building activities');
    }
    if (performance.engagementLevel < 0.6) {
      interventions.push('Engagement enhancement strategies');
    }

    return interventions;
  }
}
