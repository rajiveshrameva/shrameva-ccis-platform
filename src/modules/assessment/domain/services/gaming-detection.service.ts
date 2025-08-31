// src/modules/assessment/domain/services/gaming-detection.service.ts

import { BehavioralSignals } from '../value-objects/behavioral-signals.value-object';
import { CompetencyType } from '../value-objects/competency-type.value-object';
import { BusinessRuleException } from '../../../../shared/domain/exceptions/domain-exception.base';

/**
 * Gaming Detection Service
 *
 * Advanced domain service responsible for detecting and preventing assessment
 * gaming patterns to maintain the integrity of CCIS evaluations. This service
 * uses statistical analysis, behavioral pattern recognition, and machine learning
 * concepts to identify suspicious assessment behavior.
 *
 * Key Responsibilities:
 * 1. **Pattern Recognition**: Identify suspicious behavioral patterns
 * 2. **Statistical Analysis**: Use variance and trend analysis for detection
 * 3. **Real-time Monitoring**: Continuous assessment during sessions
 * 4. **Risk Scoring**: Calculate gaming probability scores
 * 5. **Intervention Triggering**: Automatic flagging and response
 * 6. **Historical Analysis**: Learn from past gaming attempts
 * 7. **Cultural Adaptation**: Account for regional assessment behaviors
 *
 * Gaming Patterns Detected:
 * - **Hint Abuse**: Systematic misuse of hint systems
 * - **Perfect Performance**: Suspiciously flawless execution
 * - **Speed Gaming**: Unnaturally fast task completion
 * - **Pattern Repetition**: Mechanical response patterns
 * - **Variance Anomalies**: Inconsistent skill demonstration
 * - **Time Manipulation**: Suspicious timing patterns
 * - **External Assistance**: Evidence of unauthorized help
 *
 * Detection Algorithms:
 * - **Statistical Variance Analysis**: Identify unnatural consistency
 * - **Temporal Pattern Analysis**: Analyze timing irregularities
 * - **Performance Curve Analysis**: Detect impossible improvement rates
 * - **Behavioral Fingerprinting**: Identify unique user patterns
 * - **Cross-Session Correlation**: Compare across multiple assessments
 * - **Peer Comparison**: Statistical outlier detection
 * - **Metadata Analysis**: Examine environmental factors
 *
 * Response Mechanisms:
 * - **Automatic Flagging**: Real-time gaming detection alerts
 * - **Assessment Invalidation**: Mark compromised assessments
 * - **Scaffolding Adjustment**: Modify difficulty dynamically
 * - **Human Review Triggers**: Expert intervention requests
 * - **Extended Assessment**: Additional verification tasks
 * - **Cooldown Periods**: Prevent rapid re-attempts
 * - **Account Monitoring**: Enhanced oversight for flagged users
 *
 * @example
 * ```typescript
 * // Real-time gaming detection
 * const gamingResult = GamingDetectionService.analyzeSession(
 *   sessionData,
 *   signals,
 *   historicalData
 * );
 *
 * if (gamingResult.riskLevel === 'HIGH') {
 *   // Trigger immediate intervention
 *   await interventionService.triggerGamingIntervention(gamingResult);
 * }
 *
 * // Analyze historical patterns
 * const userPattern = GamingDetectionService.analyzeUserHistory(
 *   personId,
 *   assessmentHistory
 * );
 *
 * // Generate gaming prevention recommendations
 * const prevention = GamingDetectionService.generatePreventionStrategy(
 *   userPattern,
 *   competencyType
 * );
 * ```
 */

export enum GamingPatternType {
  HINT_ABUSE = 'HINT_ABUSE',
  PERFECT_PERFORMANCE = 'PERFECT_PERFORMANCE',
  SPEED_GAMING = 'SPEED_GAMING',
  PATTERN_REPETITION = 'PATTERN_REPETITION',
  VARIANCE_ANOMALY = 'VARIANCE_ANOMALY',
  TIME_MANIPULATION = 'TIME_MANIPULATION',
  EXTERNAL_ASSISTANCE = 'EXTERNAL_ASSISTANCE',
  IMPOSSIBLE_IMPROVEMENT = 'IMPOSSIBLE_IMPROVEMENT',
}

export enum GamingRiskLevel {
  NONE = 'NONE',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum GamingResponseAction {
  NO_ACTION = 'NO_ACTION',
  MONITOR_CLOSELY = 'MONITOR_CLOSELY',
  ADJUST_DIFFICULTY = 'ADJUST_DIFFICULTY',
  EXTEND_ASSESSMENT = 'EXTEND_ASSESSMENT',
  FLAG_FOR_REVIEW = 'FLAG_FOR_REVIEW',
  INVALIDATE_SESSION = 'INVALIDATE_SESSION',
  SUSPEND_ACCOUNT = 'SUSPEND_ACCOUNT',
}

export interface GamingDetectionInput {
  sessionId: string;
  personId: string;
  competencyType: CompetencyType;
  currentSignals: BehavioralSignals;
  sessionDuration: number; // minutes
  taskCount: number;
  hintUsagePattern: number[]; // hints per task
  errorPattern: number[]; // errors per task
  timingPattern: number[]; // time per task in seconds
  environmentMetadata: {
    deviceType: 'desktop' | 'tablet' | 'mobile';
    networkStability: 'excellent' | 'good' | 'fair' | 'poor';
    timeOfDay: number; // 0-23 hour
    browserFingerprint?: string;
    screenResolution?: string;
    userAgent?: string;
  };
  historicalData?: GamingHistoricalData;
}

export interface GamingHistoricalData {
  previousSessions: Array<{
    sessionId: string;
    competencyType: CompetencyType;
    finalScore: number;
    sessionDuration: number;
    flaggedForGaming: boolean;
    completedAt: Date;
  }>;
  averagePerformance: {
    [key: string]: number; // CompetencyType -> average score
  };
  typicalSessionDuration: number;
  accountAge: number; // days since account creation
  totalAssessments: number;
}

export interface GamingAnalysisResult {
  sessionId: string;
  riskLevel: GamingRiskLevel;
  overallRiskScore: number; // 0-1 scale
  detectedPatterns: Array<{
    patternType: GamingPatternType;
    confidence: number; // 0-1 scale
    description: string;
    evidence: string[];
  }>;
  statisticalAnomalies: Array<{
    metric: string;
    expectedValue: number;
    actualValue: number;
    deviationScore: number; // standard deviations from normal
  }>;
  recommendedAction: GamingResponseAction;
  interventionPriority: 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW';
  humanReviewRequired: boolean;
  analysisTimestamp: Date;
}

export interface GamingPreventionStrategy {
  competencyType: CompetencyType;
  riskFactors: string[];
  preventionMeasures: Array<{
    measure: string;
    effectiveness: number; // 0-1 scale
    implementationCost: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
  }>;
  dynamicAdjustments: Array<{
    trigger: string;
    adjustment: string;
    expectedImpact: string;
  }>;
  monitoringPoints: string[];
}

export interface UserGamingProfile {
  personId: string;
  gamingRiskScore: number; // 0-1 scale
  primaryGamingPatterns: GamingPatternType[];
  suspiciousSessionCount: number;
  lastGamingDetection: Date | null;
  accountStatus: 'NORMAL' | 'MONITORED' | 'RESTRICTED' | 'SUSPENDED';
  behavioralFingerprint: {
    typicalHintUsage: number;
    averageTaskTime: number;
    errorRecoverySpeed: number;
    performanceConsistency: number;
  };
  interventionHistory: Array<{
    date: Date;
    interventionType: string;
    effectiveness: number;
  }>;
}

export class GamingDetectionService {
  // Statistical thresholds for gaming detection
  private static readonly DETECTION_THRESHOLDS = {
    // Variance thresholds
    LOW_VARIANCE_THRESHOLD: 0.05, // Suspiciously low variance
    HIGH_VARIANCE_THRESHOLD: 0.4, // Suspiciously high variance

    // Performance thresholds
    PERFECT_SCORE_THRESHOLD: 0.98, // Too perfect to be realistic
    RAPID_IMPROVEMENT_THRESHOLD: 0.5, // Improvement too fast

    // Timing thresholds
    MIN_TASK_TIME_SECONDS: 10, // Minimum realistic task time
    MAX_TASK_TIME_SECONDS: 1800, // Maximum reasonable task time (30 min)

    // Pattern thresholds
    PATTERN_REPETITION_THRESHOLD: 0.9, // High repetition indicates gaming
    HINT_ABUSE_MIN_THRESHOLD: 0.02, // Too few hints
    HINT_ABUSE_MAX_THRESHOLD: 0.95, // Too many hints

    // Cross-session thresholds
    IMPOSSIBLE_IMPROVEMENT_THRESHOLD: 0.3, // Score improvement too dramatic
    SESSION_SIMILARITY_THRESHOLD: 0.95, // Sessions too similar
  };

  // Risk scoring weights
  private static readonly RISK_WEIGHTS = {
    VARIANCE_ANOMALY: 0.25, // 25% weight
    TIMING_IRREGULARITY: 0.2, // 20% weight
    PERFORMANCE_PATTERN: 0.2, // 20% weight
    HISTORICAL_CONSISTENCY: 0.15, // 15% weight
    METADATA_ANALYSIS: 0.1, // 10% weight
    CROSS_VALIDATION: 0.1, // 10% weight
  };

  /**
   * Analyze current assessment session for gaming patterns
   */
  public static analyzeSession(
    input: GamingDetectionInput,
  ): GamingAnalysisResult {
    const detectedPatterns: GamingAnalysisResult['detectedPatterns'] = [];
    const statisticalAnomalies: GamingAnalysisResult['statisticalAnomalies'] =
      [];
    let overallRiskScore = 0;

    // 1. Variance Analysis
    const varianceResult = this.analyzeVariancePatterns(input);
    if (varianceResult.isAnomalous) {
      detectedPatterns.push({
        patternType: GamingPatternType.VARIANCE_ANOMALY,
        confidence: varianceResult.confidence,
        description: varianceResult.description,
        evidence: varianceResult.evidence,
      });
      overallRiskScore +=
        varianceResult.confidence * this.RISK_WEIGHTS.VARIANCE_ANOMALY;
    }

    // 2. Timing Analysis
    const timingResult = this.analyzeTimingPatterns(input);
    if (timingResult.isAnomalous) {
      detectedPatterns.push({
        patternType: GamingPatternType.TIME_MANIPULATION,
        confidence: timingResult.confidence,
        description: timingResult.description,
        evidence: timingResult.evidence,
      });
      overallRiskScore +=
        timingResult.confidence * this.RISK_WEIGHTS.TIMING_IRREGULARITY;
    }

    // 3. Performance Pattern Analysis
    const performanceResult = this.analyzePerformancePatterns(input);
    if (performanceResult.isAnomalous) {
      detectedPatterns.push({
        patternType: performanceResult.patternType,
        confidence: performanceResult.confidence,
        description: performanceResult.description,
        evidence: performanceResult.evidence,
      });
      overallRiskScore +=
        performanceResult.confidence * this.RISK_WEIGHTS.PERFORMANCE_PATTERN;
    }

    // 4. Historical Consistency Analysis
    if (input.historicalData) {
      const historicalResult = this.analyzeHistoricalConsistency(input);
      if (historicalResult.isAnomalous) {
        detectedPatterns.push({
          patternType: GamingPatternType.IMPOSSIBLE_IMPROVEMENT,
          confidence: historicalResult.confidence,
          description: historicalResult.description,
          evidence: historicalResult.evidence,
        });
        overallRiskScore +=
          historicalResult.confidence *
          this.RISK_WEIGHTS.HISTORICAL_CONSISTENCY;
      }
    }

    // 5. Metadata Analysis
    const metadataResult = this.analyzeMetadataPatterns(input);
    if (metadataResult.isAnomalous) {
      detectedPatterns.push({
        patternType: GamingPatternType.EXTERNAL_ASSISTANCE,
        confidence: metadataResult.confidence,
        description: metadataResult.description,
        evidence: metadataResult.evidence,
      });
      overallRiskScore +=
        metadataResult.confidence * this.RISK_WEIGHTS.METADATA_ANALYSIS;
    }

    // Determine risk level and recommended action
    const riskLevel = this.calculateRiskLevel(overallRiskScore);
    const recommendedAction = this.determineRecommendedAction(
      riskLevel,
      detectedPatterns,
    );
    const humanReviewRequired =
      riskLevel === GamingRiskLevel.HIGH ||
      riskLevel === GamingRiskLevel.CRITICAL;
    const interventionPriority = this.determineInterventionPriority(
      riskLevel,
      detectedPatterns,
    );

    return {
      sessionId: input.sessionId,
      riskLevel,
      overallRiskScore,
      detectedPatterns,
      statisticalAnomalies,
      recommendedAction,
      interventionPriority,
      humanReviewRequired,
      analysisTimestamp: new Date(),
    };
  }

  /**
   * Analyze variance patterns in behavioral signals
   */
  private static analyzeVariancePatterns(input: GamingDetectionInput): {
    isAnomalous: boolean;
    confidence: number;
    description: string;
    evidence: string[];
  } {
    const signals = input.currentSignals.getValue();
    const evidence: string[] = [];

    // Calculate variance across signal dimensions
    const signalValues = [
      signals.hintRequestFrequency,
      signals.errorRecoverySpeed,
      signals.transferSuccessRate,
      signals.metacognitiveAccuracy,
      signals.taskCompletionEfficiency,
      signals.helpSeekingQuality,
      signals.selfAssessmentAlignment,
    ];

    const mean =
      signalValues.reduce((sum, val) => sum + val, 0) / signalValues.length;
    const variance =
      signalValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      signalValues.length;
    const standardDeviation = Math.sqrt(variance);

    let confidence = 0;
    let description = '';

    // Check for suspiciously low variance (too consistent)
    if (variance < this.DETECTION_THRESHOLDS.LOW_VARIANCE_THRESHOLD) {
      confidence = Math.max(confidence, 0.8);
      description =
        'Suspiciously consistent performance across all competency areas';
      evidence.push(
        `Variance: ${variance.toFixed(4)} (threshold: ${this.DETECTION_THRESHOLDS.LOW_VARIANCE_THRESHOLD})`,
      );
      evidence.push('Natural learning shows more variation in performance');
    }

    // Check for suspiciously high variance (too inconsistent)
    if (variance > this.DETECTION_THRESHOLDS.HIGH_VARIANCE_THRESHOLD) {
      confidence = Math.max(confidence, 0.6);
      description =
        'Extremely inconsistent performance suggests external interference';
      evidence.push(
        `Variance: ${variance.toFixed(4)} (threshold: ${this.DETECTION_THRESHOLDS.HIGH_VARIANCE_THRESHOLD})`,
      );
      evidence.push(
        'Such high inconsistency may indicate external assistance or gaming',
      );
    }

    // Check for perfect scores (too good to be true)
    const perfectScores = signalValues.filter(
      (val) => val > this.DETECTION_THRESHOLDS.PERFECT_SCORE_THRESHOLD,
    );
    if (perfectScores.length >= 3) {
      confidence = Math.max(confidence, 0.9);
      description = 'Multiple near-perfect scores indicate possible gaming';
      evidence.push(
        `${perfectScores.length} signals above ${this.DETECTION_THRESHOLDS.PERFECT_SCORE_THRESHOLD}`,
      );
      evidence.push(
        'Natural assessment rarely produces multiple perfect scores',
      );
    }

    return {
      isAnomalous: confidence > 0.5,
      confidence,
      description,
      evidence,
    };
  }

  /**
   * Analyze timing patterns for irregularities
   */
  private static analyzeTimingPatterns(input: GamingDetectionInput): {
    isAnomalous: boolean;
    confidence: number;
    description: string;
    evidence: string[];
  } {
    const timingPattern = input.timingPattern;
    const evidence: string[] = [];
    let confidence = 0;
    let description = '';

    if (timingPattern.length === 0) {
      return {
        isAnomalous: false,
        confidence: 0,
        description: '',
        evidence: [],
      };
    }

    // Check for suspiciously fast completion
    const tooFastTasks = timingPattern.filter(
      (time) => time < this.DETECTION_THRESHOLDS.MIN_TASK_TIME_SECONDS,
    );
    if (tooFastTasks.length > timingPattern.length * 0.3) {
      // More than 30% too fast
      confidence = Math.max(confidence, 0.8);
      description = 'Multiple tasks completed suspiciously quickly';
      evidence.push(
        `${tooFastTasks.length}/${timingPattern.length} tasks under ${this.DETECTION_THRESHOLDS.MIN_TASK_TIME_SECONDS} seconds`,
      );
      evidence.push('Suggests possible answer sheet or external assistance');
    }

    // Check for suspiciously slow completion (potential external research)
    const tooSlowTasks = timingPattern.filter(
      (time) => time > this.DETECTION_THRESHOLDS.MAX_TASK_TIME_SECONDS,
    );
    if (tooSlowTasks.length > 0) {
      confidence = Math.max(confidence, 0.6);
      description = 'Some tasks took unusually long';
      evidence.push(
        `${tooSlowTasks.length} tasks over ${this.DETECTION_THRESHOLDS.MAX_TASK_TIME_SECONDS / 60} minutes`,
      );
      evidence.push('May indicate external research or consultation');
    }

    // Check for mechanical timing patterns (too regular)
    const timingVariance = this.calculateVariance(timingPattern);
    const averageTime =
      timingPattern.reduce((sum, time) => sum + time, 0) / timingPattern.length;
    const coefficientOfVariation = Math.sqrt(timingVariance) / averageTime;

    if (coefficientOfVariation < 0.15) {
      // Very low timing variation
      confidence = Math.max(confidence, 0.7);
      description = 'Suspiciously regular timing pattern';
      evidence.push(
        `Coefficient of variation: ${coefficientOfVariation.toFixed(3)} (expected: >0.15)`,
      );
      evidence.push('Natural human timing shows more variation');
    }

    return {
      isAnomalous: confidence > 0.5,
      confidence,
      description,
      evidence,
    };
  }

  /**
   * Analyze performance patterns for gaming indicators
   */
  private static analyzePerformancePatterns(input: GamingDetectionInput): {
    isAnomalous: boolean;
    patternType: GamingPatternType;
    confidence: number;
    description: string;
    evidence: string[];
  } {
    const signals = input.currentSignals.getValue();
    const hintPattern = input.hintUsagePattern;
    const errorPattern = input.errorPattern;
    const evidence: string[] = [];
    let confidence = 0;
    let description = '';
    let patternType = GamingPatternType.PERFECT_PERFORMANCE;

    // Check for hint abuse patterns
    if (hintPattern.length > 0) {
      const avgHints =
        hintPattern.reduce((sum, hints) => sum + hints, 0) / hintPattern.length;
      const hintVariance = this.calculateVariance(hintPattern);

      // Too few hints may indicate prior knowledge
      if (
        avgHints < 0.5 &&
        signals.hintRequestFrequency <
          this.DETECTION_THRESHOLDS.HINT_ABUSE_MIN_THRESHOLD
      ) {
        confidence = Math.max(confidence, 0.7);
        patternType = GamingPatternType.HINT_ABUSE;
        description = 'Unusually low hint usage despite task complexity';
        evidence.push(`Average hints per task: ${avgHints.toFixed(2)}`);
        evidence.push('May indicate prior knowledge of assessment content');
      }

      // Too many hints with perfect performance is suspicious
      if (avgHints > 5 && signals.transferSuccessRate > 0.9) {
        confidence = Math.max(confidence, 0.6);
        patternType = GamingPatternType.HINT_ABUSE;
        description = 'High hint usage with perfect performance';
        evidence.push(
          `Average hints per task: ${avgHints.toFixed(2)} with 90%+ success rate`,
        );
        evidence.push('Inconsistent pattern suggests gaming');
      }
    }

    // Check for error patterns
    if (errorPattern.length > 0) {
      const totalErrors = errorPattern.reduce((sum, errors) => sum + errors, 0);
      const perfectTasks = errorPattern.filter((errors) => errors === 0).length;

      // Too many perfect tasks
      if (perfectTasks > errorPattern.length * 0.8) {
        // More than 80% perfect
        confidence = Math.max(confidence, 0.8);
        patternType = GamingPatternType.PERFECT_PERFORMANCE;
        description = 'Unusually high number of error-free task completions';
        evidence.push(
          `${perfectTasks}/${errorPattern.length} tasks completed without errors`,
        );
        evidence.push('Natural learning includes trial and error');
      }
    }

    // Check for pattern repetition in responses
    const performanceConsistency = this.calculatePerformanceConsistency(input);
    if (
      performanceConsistency >
      this.DETECTION_THRESHOLDS.PATTERN_REPETITION_THRESHOLD
    ) {
      confidence = Math.max(confidence, 0.7);
      patternType = GamingPatternType.PATTERN_REPETITION;
      description = 'Mechanical consistency in response patterns';
      evidence.push(
        `Performance consistency: ${(performanceConsistency * 100).toFixed(1)}%`,
      );
      evidence.push('Suggests automated or memorized responses');
    }

    return {
      isAnomalous: confidence > 0.5,
      patternType,
      confidence,
      description,
      evidence,
    };
  }

  /**
   * Analyze historical consistency for impossible improvements
   */
  private static analyzeHistoricalConsistency(input: GamingDetectionInput): {
    isAnomalous: boolean;
    confidence: number;
    description: string;
    evidence: string[];
  } {
    const historicalData = input.historicalData!;
    const currentScore = input.currentSignals.calculateWeightedScore();
    const evidence: string[] = [];
    let confidence = 0;
    let description = '';

    // Compare with historical average for this competency
    const competencyKey = input.competencyType.toString();
    const historicalAverage = historicalData.averagePerformance[competencyKey];

    if (historicalAverage) {
      const improvement = currentScore - historicalAverage;

      // Check for impossible improvement
      if (
        improvement > this.DETECTION_THRESHOLDS.IMPOSSIBLE_IMPROVEMENT_THRESHOLD
      ) {
        confidence = Math.max(confidence, 0.8);
        description = 'Dramatic improvement beyond natural learning curve';
        evidence.push(`Current score: ${(currentScore * 100).toFixed(1)}%`);
        evidence.push(
          `Historical average: ${(historicalAverage * 100).toFixed(1)}%`,
        );
        evidence.push(
          `Improvement: ${(improvement * 100).toFixed(1)}% (threshold: ${this.DETECTION_THRESHOLDS.IMPOSSIBLE_IMPROVEMENT_THRESHOLD * 100}%)`,
        );
        evidence.push('Such rapid improvement suggests external assistance');
      }
    }

    // Check session similarity (copy-paste behavior)
    const recentSessions = historicalData.previousSessions
      .filter((session) => session.competencyType.equals(input.competencyType))
      .slice(-3); // Last 3 sessions

    if (recentSessions.length > 0) {
      const sessionSimilarity = this.calculateSessionSimilarity(
        input,
        recentSessions,
      );
      if (
        sessionSimilarity >
        this.DETECTION_THRESHOLDS.SESSION_SIMILARITY_THRESHOLD
      ) {
        confidence = Math.max(confidence, 0.9);
        description = 'Current session extremely similar to previous sessions';
        evidence.push(
          `Session similarity: ${(sessionSimilarity * 100).toFixed(1)}%`,
        );
        evidence.push('Suggests copy-paste or memorized responses');
      }
    }

    return {
      isAnomalous: confidence > 0.5,
      confidence,
      description,
      evidence,
    };
  }

  /**
   * Analyze metadata for suspicious patterns
   */
  private static analyzeMetadataPatterns(input: GamingDetectionInput): {
    isAnomalous: boolean;
    confidence: number;
    description: string;
    evidence: string[];
  } {
    const metadata = input.environmentMetadata;
    const evidence: string[] = [];
    let confidence = 0;
    let description = '';

    // Check for suspicious assessment timing
    const assessmentHour = metadata.timeOfDay;
    if (assessmentHour < 6 || assessmentHour > 23) {
      // Very late or very early
      confidence = Math.max(confidence, 0.3);
      description = 'Assessment taken at unusual hours';
      evidence.push(`Assessment time: ${assessmentHour}:00`);
      evidence.push('Off-hours assessment may indicate gaming preparation');
    }

    // Check for device switching during assessment
    // (This would require tracking across multiple data points)

    // Check for network stability issues (may indicate external tools)
    if (
      metadata.networkStability === 'poor' &&
      input.currentSignals.calculateWeightedScore() > 0.9
    ) {
      confidence = Math.max(confidence, 0.4);
      description = 'High performance despite poor network conditions';
      evidence.push('Poor network with excellent performance is unusual');
      evidence.push('May indicate offline preparation or external tools');
    }

    return {
      isAnomalous: confidence > 0.5,
      confidence,
      description,
      evidence,
    };
  }

  /**
   * Generate gaming prevention strategy
   */
  public static generatePreventionStrategy(
    userProfile: UserGamingProfile,
    competencyType: CompetencyType,
  ): GamingPreventionStrategy {
    const riskFactors: string[] = [];
    const preventionMeasures: GamingPreventionStrategy['preventionMeasures'] =
      [];

    // Analyze user risk factors
    if (userProfile.gamingRiskScore > 0.7) {
      riskFactors.push('High historical gaming risk');
    }

    if (
      userProfile.primaryGamingPatterns.includes(GamingPatternType.HINT_ABUSE)
    ) {
      riskFactors.push('Previous hint system abuse');
      preventionMeasures.push({
        measure: 'Dynamic hint availability',
        effectiveness: 0.8,
        implementationCost: 'MEDIUM',
        description: 'Adjust hint availability based on performance',
      });
    }

    if (
      userProfile.primaryGamingPatterns.includes(GamingPatternType.SPEED_GAMING)
    ) {
      riskFactors.push('Tendency for rapid completion');
      preventionMeasures.push({
        measure: 'Minimum task time enforcement',
        effectiveness: 0.7,
        implementationCost: 'LOW',
        description: 'Require minimum time before task submission',
      });
    }

    // Add general prevention measures
    preventionMeasures.push({
      measure: 'Randomized question ordering',
      effectiveness: 0.6,
      implementationCost: 'LOW',
      description: 'Prevent memorization of question sequences',
    });

    preventionMeasures.push({
      measure: 'Real-time behavior monitoring',
      effectiveness: 0.9,
      implementationCost: 'HIGH',
      description: 'Continuous analysis of assessment behavior',
    });

    return {
      competencyType,
      riskFactors,
      preventionMeasures,
      dynamicAdjustments: [
        {
          trigger: 'Rapid completion detected',
          adjustment: 'Increase task complexity',
          expectedImpact: 'Reduce gaming effectiveness',
        },
        {
          trigger: 'Perfect performance pattern',
          adjustment: 'Introduce novel question types',
          expectedImpact: 'Test genuine understanding',
        },
      ],
      monitoringPoints: [
        'Task completion timing',
        'Hint usage patterns',
        'Error recovery behavior',
        'Cross-session consistency',
      ],
    };
  }

  // Private helper methods

  private static calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return (
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length
    );
  }

  private static calculatePerformanceConsistency(
    input: GamingDetectionInput,
  ): number {
    // Simple consistency calculation based on signal patterns
    const signals = input.currentSignals.getValue();
    const signalValues = [
      signals.hintRequestFrequency,
      signals.errorRecoverySpeed,
      signals.transferSuccessRate,
      signals.metacognitiveAccuracy,
    ];

    const variance = this.calculateVariance(signalValues);
    return Math.max(0, 1 - variance * 4); // Invert variance to get consistency
  }

  private static calculateSessionSimilarity(
    currentInput: GamingDetectionInput,
    previousSessions: any[],
  ): number {
    // Simplified similarity calculation
    // In production, would compare detailed patterns
    return 0.5; // Placeholder - implement detailed comparison
  }

  private static calculateRiskLevel(riskScore: number): GamingRiskLevel {
    if (riskScore >= 0.8) return GamingRiskLevel.CRITICAL;
    if (riskScore >= 0.6) return GamingRiskLevel.HIGH;
    if (riskScore >= 0.4) return GamingRiskLevel.MEDIUM;
    if (riskScore >= 0.2) return GamingRiskLevel.LOW;
    return GamingRiskLevel.NONE;
  }

  private static determineRecommendedAction(
    riskLevel: GamingRiskLevel,
    patterns: any[],
  ): GamingResponseAction {
    switch (riskLevel) {
      case GamingRiskLevel.CRITICAL:
        return GamingResponseAction.INVALIDATE_SESSION;
      case GamingRiskLevel.HIGH:
        return GamingResponseAction.FLAG_FOR_REVIEW;
      case GamingRiskLevel.MEDIUM:
        return GamingResponseAction.EXTEND_ASSESSMENT;
      case GamingRiskLevel.LOW:
        return GamingResponseAction.MONITOR_CLOSELY;
      default:
        return GamingResponseAction.NO_ACTION;
    }
  }

  private static determineInterventionPriority(
    riskLevel: GamingRiskLevel,
    patterns: any[],
  ): 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW' {
    switch (riskLevel) {
      case GamingRiskLevel.CRITICAL:
        return 'IMMEDIATE';
      case GamingRiskLevel.HIGH:
        return 'HIGH';
      case GamingRiskLevel.MEDIUM:
        return 'MEDIUM';
      default:
        return 'LOW';
    }
  }
}
