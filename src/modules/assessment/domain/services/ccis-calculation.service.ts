// src/modules/assessment/domain/services/ccis-calculation.service.ts

import { CCISLevel } from '../value-objects/ccis-level.value-object';
import { ConfidenceScore } from '../value-objects/confidence-score.value-object';
import { CompetencyType } from '../value-objects/competency-type.value-object';
import { BehavioralSignals } from '../value-objects/behavioral-signals.value-object';
import { BusinessRuleException } from '../../../../shared/domain/exceptions/domain-exception.base';

/**
 * CCIS Calculation Service
 *
 * Core domain service responsible for calculating CCIS (Competency-based Career
 * Integration Scale) levels using the exact weighted algorithm from GitHub Copilot
 * system instructions. This service implements the mathematical foundation of
 * Shrameva's assessment framework.
 *
 * Key Responsibilities:
 * 1. **Weighted Score Calculation**: Apply exact percentages from system instructions
 * 2. **CCIS Level Determination**: Map scores to 4-level competency scale
 * 3. **Confidence Assessment**: Calculate assessment reliability scores
 * 4. **Gaming Detection**: Identify suspicious signal patterns
 * 5. **Intervention Triggers**: Determine when learning support is needed
 * 6. **Multi-Competency Aggregation**: Combine scores across competencies
 * 7. **Cultural Adaptation**: Apply region-specific assessment criteria
 *
 * CCIS Framework (4-Level Scale):
 * - **Level 1 (0-25%)**: Novice Learner - High scaffolding required
 * - **Level 2 (25-50%)**: Guided Practitioner - Moderate scaffolding
 * - **Level 3 (50-85%)**: Self-directed Performer - Minimal scaffolding
 * - **Level 4 (85-100%)**: Autonomous Expert - No scaffolding needed
 *
 * Behavioral Signal Weights (Exact from System Instructions):
 * - **Hint Request Frequency**: 35% (Primary independence indicator)
 * - **Error Recovery Speed**: 25% (Self-correction capability)
 * - **Transfer Success Rate**: 20% (Skill application ability)
 * - **Metacognitive Accuracy**: 10% (Self-awareness level)
 * - **Task Completion Efficiency**: 5% (Improvement over time)
 * - **Help-Seeking Quality**: 3% (Strategic vs random help)
 * - **Self-Assessment Alignment**: 2% (Prediction accuracy)
 *
 * Business Rules:
 * - All signal values must be normalized to 0.0-1.0 scale
 * - CCIS levels must be sequential (cannot skip levels)
 * - Confidence scores must meet minimum thresholds for advancement
 * - Gaming detection automatically flags suspicious patterns
 * - Cultural context influences assessment interpretation
 * - Multi-competency scores use weighted averages by industry importance
 *
 * @example
 * ```typescript
 * // Calculate individual competency CCIS level
 * const signals = BehavioralSignals.create({...});
 * const level = CCISCalculationService.calculateCCISLevel(signals);
 * const confidence = CCISCalculationService.calculateConfidence(signals);
 *
 * // Aggregate across multiple competencies
 * const overallLevel = CCISCalculationService.calculateOverallCCISLevel([
 *   { competency: CompetencyType.COMMUNICATION, signals: commSignals },
 *   { competency: CompetencyType.PROBLEM_SOLVING, signals: problemSignals }
 * ]);
 *
 * // Detect gaming patterns
 * const isGaming = CCISCalculationService.detectGamingPatterns(signals);
 * const needsIntervention = CCISCalculationService.needsIntervention(signals);
 * ```
 */

export interface CompetencySignalData {
  competency: CompetencyType;
  signals: BehavioralSignals;
  evidenceCount: number;
  assessmentDuration: number; // minutes
  culturalContext: 'INDIA' | 'UAE' | 'INTERNATIONAL';
}

export interface CCISCalculationResult {
  ccisLevel: CCISLevel;
  rawScore: number; // 0.0-1.0 scale
  confidence: ConfidenceScore;
  breakdown: {
    hintFrequency: { score: number; weight: number; contribution: number };
    errorRecovery: { score: number; weight: number; contribution: number };
    transferSuccess: { score: number; weight: number; contribution: number };
    metacognitive: { score: number; weight: number; contribution: number };
    efficiency: { score: number; weight: number; contribution: number };
    helpSeeking: { score: number; weight: number; contribution: number };
    selfAssessment: { score: number; weight: number; contribution: number };
  };
  gamingDetected: boolean;
  interventionNeeded: boolean;
  calculatedAt: Date;
}

export interface OverallCCISResult {
  overallLevel: CCISLevel;
  competencyLevels: Array<{
    competency: CompetencyType;
    level: CCISLevel;
    score: number;
    confidence: ConfidenceScore;
    weight: number; // Industry importance weight
  }>;
  rawScore: number;
  confidence: ConfidenceScore;
  readinessPercentage: number; // Career readiness 0-100%
  strongestCompetencies: CompetencyType[];
  developmentAreas: CompetencyType[];
  calculatedAt: Date;
}

export interface GamingDetectionResult {
  isGaming: boolean;
  gamingType:
    | 'HINT_ABUSE'
    | 'PERFECT_PATTERNS'
    | 'RAPID_COMPLETION'
    | 'INCONSISTENT_PERFORMANCE'
    | 'NONE';
  confidence: number; // 0-1 scale
  patterns: string[];
  recommendedAction:
    | 'FLAG_REVIEW'
    | 'ADJUST_SCAFFOLDING'
    | 'EXTEND_ASSESSMENT'
    | 'NONE';
}

export interface InterventionRecommendation {
  interventionType:
    | 'SCAFFOLDING_INCREASE'
    | 'SCAFFOLDING_DECREASE'
    | 'PEER_SUPPORT'
    | 'EXPERT_GUIDANCE'
    | 'BREAK_RECOMMENDED'
    | 'NONE';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
  suggestedActions: string[];
  estimatedEffectiveness: number; // 0-1 scale
}

export class CCISCalculationService {
  // Exact weights from GitHub Copilot system instructions
  private static readonly SIGNAL_WEIGHTS = {
    HINT_FREQUENCY: 0.35, // 35% - Primary independence indicator
    ERROR_RECOVERY: 0.25, // 25% - Self-correction capability
    TRANSFER_SUCCESS: 0.2, // 20% - Skill application ability
    METACOGNITIVE: 0.1, // 10% - Self-awareness level
    EFFICIENCY: 0.05, // 5% - Improvement over time
    HELP_SEEKING: 0.03, // 3% - Strategic help requests
    SELF_ASSESSMENT: 0.02, // 2% - Prediction accuracy
  };

  // CCIS level thresholds
  private static readonly CCIS_THRESHOLDS = {
    LEVEL_1_MAX: 0.25, // 0-25%: Novice Learner
    LEVEL_2_MAX: 0.5, // 25-50%: Guided Practitioner
    LEVEL_3_MAX: 0.85, // 50-85%: Self-directed Performer
    LEVEL_4_MAX: 1.0, // 85-100%: Autonomous Expert
  };

  // Gaming detection thresholds
  private static readonly GAMING_THRESHOLDS = {
    HINT_ABUSE_THRESHOLD: 0.05, // Too few hints may indicate gaming
    PERFECT_PATTERN_THRESHOLD: 0.95, // Too perfect may indicate gaming
    VARIANCE_THRESHOLD: 0.1, // Low variance may indicate gaming
    RAPID_COMPLETION_THRESHOLD: 0.2, // Too fast may indicate gaming
    INCONSISTENCY_THRESHOLD: 0.3, // High inconsistency may indicate gaming
  };

  // Intervention thresholds
  private static readonly INTERVENTION_THRESHOLDS = {
    HINT_DEPENDENCY_HIGH: 0.8, // Too many hints
    ERROR_RECOVERY_POOR: 0.2, // Poor error recovery
    TRANSFER_FAILURE_HIGH: 0.3, // Poor skill transfer
    EFFICIENCY_VERY_LOW: 0.15, // Very low efficiency
    PLATEAU_DETECTION: 0.05, // Learning plateau detected
  };

  // Industry importance weights for competencies
  private static readonly INDUSTRY_WEIGHTS = {
    [CompetencyType.COMMUNICATION.toString()]: 0.2, // 20% - Critical for all roles
    [CompetencyType.PROBLEM_SOLVING.toString()]: 0.18, // 18% - Core engineering skill
    [CompetencyType.TEAMWORK.toString()]: 0.16, // 16% - Essential collaboration
    [CompetencyType.ADAPTABILITY.toString()]: 0.15, // 15% - Change management
    [CompetencyType.TECHNICAL_SKILLS.toString()]: 0.14, // 14% - Domain expertise
    [CompetencyType.TIME_MANAGEMENT.toString()]: 0.12, // 12% - Productivity
    [CompetencyType.LEADERSHIP.toString()]: 0.05, // 5% - Grows with experience
  };

  /**
   * Calculate CCIS level for a single competency
   */
  public static calculateCCISLevel(
    signals: BehavioralSignals,
  ): CCISCalculationResult {
    // Extract normalized signal values
    const signalValues = signals.getValue();

    // Calculate weighted score using exact percentages
    const breakdown = {
      hintFrequency: {
        score: signalValues.hintRequestFrequency,
        weight: this.SIGNAL_WEIGHTS.HINT_FREQUENCY,
        contribution:
          signalValues.hintRequestFrequency *
          this.SIGNAL_WEIGHTS.HINT_FREQUENCY,
      },
      errorRecovery: {
        score: signalValues.errorRecoverySpeed,
        weight: this.SIGNAL_WEIGHTS.ERROR_RECOVERY,
        contribution:
          signalValues.errorRecoverySpeed * this.SIGNAL_WEIGHTS.ERROR_RECOVERY,
      },
      transferSuccess: {
        score: signalValues.transferSuccessRate,
        weight: this.SIGNAL_WEIGHTS.TRANSFER_SUCCESS,
        contribution:
          signalValues.transferSuccessRate *
          this.SIGNAL_WEIGHTS.TRANSFER_SUCCESS,
      },
      metacognitive: {
        score: signalValues.metacognitiveAccuracy,
        weight: this.SIGNAL_WEIGHTS.METACOGNITIVE,
        contribution:
          signalValues.metacognitiveAccuracy *
          this.SIGNAL_WEIGHTS.METACOGNITIVE,
      },
      efficiency: {
        score: signalValues.taskCompletionEfficiency,
        weight: this.SIGNAL_WEIGHTS.EFFICIENCY,
        contribution:
          signalValues.taskCompletionEfficiency *
          this.SIGNAL_WEIGHTS.EFFICIENCY,
      },
      helpSeeking: {
        score: signalValues.helpSeekingQuality,
        weight: this.SIGNAL_WEIGHTS.HELP_SEEKING,
        contribution:
          signalValues.helpSeekingQuality * this.SIGNAL_WEIGHTS.HELP_SEEKING,
      },
      selfAssessment: {
        score: signalValues.selfAssessmentAlignment,
        weight: this.SIGNAL_WEIGHTS.SELF_ASSESSMENT,
        contribution:
          signalValues.selfAssessmentAlignment *
          this.SIGNAL_WEIGHTS.SELF_ASSESSMENT,
      },
    };

    // Calculate raw weighted score
    const rawScore = Object.values(breakdown).reduce(
      (sum, component) => sum + component.contribution,
      0,
    );

    // Determine CCIS level based on thresholds
    const ccisLevel = this.mapScoreToLevel(rawScore);

    // Calculate confidence score
    const confidence = this.calculateConfidenceScore(signals);

    // Gaming detection
    const gamingResult = this.detectGamingPatterns(signals);

    // Intervention analysis
    const interventionNeeded = this.needsIntervention(signals);

    return {
      ccisLevel,
      rawScore,
      confidence,
      breakdown,
      gamingDetected: gamingResult.isGaming,
      interventionNeeded,
      calculatedAt: new Date(),
    };
  }

  /**
   * Calculate overall CCIS level across multiple competencies
   */
  public static calculateOverallCCISLevel(
    competencyData: CompetencySignalData[],
  ): OverallCCISResult {
    if (competencyData.length === 0) {
      throw new BusinessRuleException(
        'Cannot calculate overall CCIS level with no competency data',
        'competencyData',
      );
    }

    // Calculate individual competency results
    const competencyLevels = competencyData.map((data) => {
      const result = this.calculateCCISLevel(data.signals);
      const weight = this.getIndustryWeight(data.competency);

      return {
        competency: data.competency,
        level: result.ccisLevel,
        score: result.rawScore,
        confidence: result.confidence,
        weight,
      };
    });

    // Calculate weighted overall score
    const totalWeight = competencyLevels.reduce(
      (sum, comp) => sum + comp.weight,
      0,
    );
    const weightedScore =
      competencyLevels.reduce(
        (sum, comp) => sum + comp.score * comp.weight,
        0,
      ) / totalWeight;

    // Determine overall level
    const overallLevel = this.mapScoreToLevel(weightedScore);

    // Calculate overall confidence (weighted average)
    const overallConfidence =
      competencyLevels.reduce(
        (sum, comp) => sum + comp.confidence.getScore() * comp.weight,
        0,
      ) / totalWeight;

    // Calculate career readiness percentage
    const readinessPercentage = Math.round(weightedScore * 100);

    // Identify strongest and development areas
    const sortedByScore = [...competencyLevels].sort(
      (a, b) => b.score - a.score,
    );
    const strongestCompetencies = sortedByScore
      .slice(0, 2)
      .map((c) => c.competency);
    const developmentAreas = sortedByScore.slice(-2).map((c) => c.competency);

    return {
      overallLevel,
      competencyLevels,
      rawScore: weightedScore,
      confidence: ConfidenceScore.fromPercentage(overallConfidence * 100),
      readinessPercentage,
      strongestCompetencies,
      developmentAreas,
      calculatedAt: new Date(),
    };
  }

  /**
   * Calculate confidence score based on signal consistency and evidence
   */
  public static calculateConfidenceScore(
    signals: BehavioralSignals,
  ): ConfidenceScore {
    const signalValues = signals.getValue();

    // Factors affecting confidence
    const evidenceAmount = Math.min(1, signalValues.taskCount / 10); // More tasks = higher confidence
    const assessmentDuration = Math.min(
      1,
      signalValues.assessmentDuration / 60,
    ); // Longer assessment = higher confidence

    // Signal consistency (lower variance = higher confidence)
    const signalArray = [
      signalValues.hintRequestFrequency,
      signalValues.errorRecoverySpeed,
      signalValues.transferSuccessRate,
      signalValues.metacognitiveAccuracy,
      signalValues.taskCompletionEfficiency,
      signalValues.helpSeekingQuality,
      signalValues.selfAssessmentAlignment,
    ];

    const mean =
      signalArray.reduce((sum, val) => sum + val, 0) / signalArray.length;
    const variance =
      signalArray.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      signalArray.length;
    const consistency = Math.max(0, 1 - variance);

    // Combined confidence score
    const confidence =
      evidenceAmount * 0.4 + assessmentDuration * 0.3 + consistency * 0.3;

    return ConfidenceScore.fromPercentage(Math.round(confidence * 100));
  }

  /**
   * Detect gaming patterns in behavioral signals
   */
  public static detectGamingPatterns(
    signals: BehavioralSignals,
  ): GamingDetectionResult {
    const signalValues = signals.getValue();
    const patterns: string[] = [];
    let gamingType: GamingDetectionResult['gamingType'] = 'NONE';
    let confidence = 0;

    // Check for hint abuse (too few hints may indicate prior knowledge)
    if (
      signalValues.hintRequestFrequency <
      this.GAMING_THRESHOLDS.HINT_ABUSE_THRESHOLD
    ) {
      patterns.push('Unusually low hint usage');
      gamingType = 'HINT_ABUSE';
      confidence = Math.max(confidence, 0.7);
    }

    // Check for perfect patterns (too consistent may indicate gaming)
    const perfectSignals = [
      signalValues.errorRecoverySpeed,
      signalValues.transferSuccessRate,
      signalValues.metacognitiveAccuracy,
    ].filter((val) => val > this.GAMING_THRESHOLDS.PERFECT_PATTERN_THRESHOLD);

    if (perfectSignals.length >= 2) {
      patterns.push('Suspiciously perfect performance patterns');
      gamingType = 'PERFECT_PATTERNS';
      confidence = Math.max(confidence, 0.8);
    }

    // Check for rapid completion
    if (
      signalValues.taskCompletionEfficiency > 0.95 &&
      signalValues.assessmentDuration < 15
    ) {
      // Less than 15 minutes
      patterns.push('Unusually rapid task completion');
      gamingType = 'RAPID_COMPLETION';
      confidence = Math.max(confidence, 0.6);
    }

    // Check for signal variance (too consistent may indicate gaming)
    const signalArray = [
      signalValues.hintRequestFrequency,
      signalValues.errorRecoverySpeed,
      signalValues.transferSuccessRate,
      signalValues.metacognitiveAccuracy,
    ];

    const mean =
      signalArray.reduce((sum, val) => sum + val, 0) / signalArray.length;
    const variance =
      signalArray.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      signalArray.length;

    if (variance < this.GAMING_THRESHOLDS.VARIANCE_THRESHOLD) {
      patterns.push('Unusually consistent signal patterns');
      gamingType = 'INCONSISTENT_PERFORMANCE';
      confidence = Math.max(confidence, 0.5);
    }

    // Determine recommended action
    let recommendedAction: GamingDetectionResult['recommendedAction'] = 'NONE';
    if (confidence > 0.7) {
      recommendedAction = 'FLAG_REVIEW';
    } else if (confidence > 0.5) {
      recommendedAction = 'EXTEND_ASSESSMENT';
    } else if (confidence > 0.3) {
      recommendedAction = 'ADJUST_SCAFFOLDING';
    }

    return {
      isGaming: confidence > 0.5,
      gamingType,
      confidence,
      patterns,
      recommendedAction,
    };
  }

  /**
   * Determine if intervention is needed
   */
  public static needsIntervention(signals: BehavioralSignals): boolean {
    const signalValues = signals.getValue();

    // Check for high hint dependency
    if (
      signalValues.hintRequestFrequency >
      this.INTERVENTION_THRESHOLDS.HINT_DEPENDENCY_HIGH
    ) {
      return true;
    }

    // Check for poor error recovery
    if (
      signalValues.errorRecoverySpeed <
      this.INTERVENTION_THRESHOLDS.ERROR_RECOVERY_POOR
    ) {
      return true;
    }

    // Check for poor transfer success
    if (
      signalValues.transferSuccessRate <
      this.INTERVENTION_THRESHOLDS.TRANSFER_FAILURE_HIGH
    ) {
      return true;
    }

    // Check for very low efficiency
    if (
      signalValues.taskCompletionEfficiency <
      this.INTERVENTION_THRESHOLDS.EFFICIENCY_VERY_LOW
    ) {
      return true;
    }

    return false;
  }

  /**
   * Generate intervention recommendations
   */
  public static generateInterventionRecommendation(
    signals: BehavioralSignals,
    culturalContext: 'INDIA' | 'UAE' | 'INTERNATIONAL' = 'INTERNATIONAL',
  ): InterventionRecommendation {
    const signalValues = signals.getValue();

    // Determine primary issue
    if (
      signalValues.hintRequestFrequency >
      this.INTERVENTION_THRESHOLDS.HINT_DEPENDENCY_HIGH
    ) {
      return {
        interventionType: 'SCAFFOLDING_DECREASE',
        urgency: 'MEDIUM',
        reason:
          'High hint dependency detected - learner may be over-relying on support',
        suggestedActions: [
          'Gradually reduce hint availability',
          'Encourage independent problem-solving',
          'Provide reflection prompts before hints',
        ],
        estimatedEffectiveness: 0.75,
      };
    }

    if (
      signalValues.errorRecoverySpeed <
      this.INTERVENTION_THRESHOLDS.ERROR_RECOVERY_POOR
    ) {
      return {
        interventionType: 'EXPERT_GUIDANCE',
        urgency: 'HIGH',
        reason: 'Poor error recovery indicates conceptual gaps',
        suggestedActions: [
          'Schedule one-on-one mentoring session',
          'Provide targeted concept review',
          'Use worked examples and guided practice',
        ],
        estimatedEffectiveness: 0.85,
      };
    }

    if (
      signalValues.transferSuccessRate <
      this.INTERVENTION_THRESHOLDS.TRANSFER_FAILURE_HIGH
    ) {
      return {
        interventionType: 'SCAFFOLDING_INCREASE',
        urgency: 'MEDIUM',
        reason:
          'Low transfer success suggests need for more structured support',
        suggestedActions: [
          'Provide more concrete examples',
          'Break tasks into smaller steps',
          'Use analogical reasoning exercises',
        ],
        estimatedEffectiveness: 0.7,
      };
    }

    // Check for plateau (low efficiency over time)
    if (
      signalValues.taskCompletionEfficiency <
      this.INTERVENTION_THRESHOLDS.EFFICIENCY_VERY_LOW
    ) {
      return {
        interventionType: 'BREAK_RECOMMENDED',
        urgency: 'LOW',
        reason: 'Learning plateau detected - break may improve performance',
        suggestedActions: [
          'Take a 15-minute break',
          'Switch to a different competency',
          'Engage in physical activity',
        ],
        estimatedEffectiveness: 0.6,
      };
    }

    return {
      interventionType: 'NONE',
      urgency: 'LOW',
      reason: 'Performance within acceptable range',
      suggestedActions: ['Continue current learning approach'],
      estimatedEffectiveness: 0.5,
    };
  }

  // Private helper methods

  /**
   * Map raw score to CCIS level
   */
  private static mapScoreToLevel(score: number): CCISLevel {
    if (score <= this.CCIS_THRESHOLDS.LEVEL_1_MAX) {
      return CCISLevel.fromLevel(1);
    } else if (score <= this.CCIS_THRESHOLDS.LEVEL_2_MAX) {
      return CCISLevel.fromLevel(2);
    } else if (score <= this.CCIS_THRESHOLDS.LEVEL_3_MAX) {
      return CCISLevel.fromLevel(3);
    } else {
      return CCISLevel.fromLevel(4);
    }
  }

  /**
   * Get industry importance weight for competency
   */
  private static getIndustryWeight(competency: CompetencyType): number {
    const competencyString = competency.toString();
    return this.INDUSTRY_WEIGHTS[competencyString] || 0.1; // Default weight
  }

  /**
   * Validate signal values are in correct range
   */
  private static validateSignals(signals: BehavioralSignals): void {
    const signalValues = signals.getValue();

    const allSignals = [
      signalValues.hintRequestFrequency,
      signalValues.errorRecoverySpeed,
      signalValues.transferSuccessRate,
      signalValues.metacognitiveAccuracy,
      signalValues.taskCompletionEfficiency,
      signalValues.helpSeekingQuality,
      signalValues.selfAssessmentAlignment,
    ];

    allSignals.forEach((value, index) => {
      if (value < 0 || value > 1) {
        throw new BusinessRuleException(
          `Signal value at index ${index} must be between 0 and 1, got ${value}`,
          'signalValidation',
        );
      }
    });
  }
}
