// src/modules/assessment/domain/entities/competency-assessment.entity.ts

import { Entity } from '../../../../shared/base/entity.base';
import {
  CompetencyAssessmentID,
  AssessmentID,
  PersonID,
} from '../../../../shared/value-objects/id.value-object';
import { BusinessRuleException } from '../../../../shared/domain/exceptions/domain-exception.base';
import { CCISLevel } from '../value-objects/ccis-level.value-object';
import { ConfidenceScore } from '../value-objects/confidence-score.value-object';
import { CompetencyType } from '../value-objects/competency-type.value-object';
import { BehavioralSignals } from '../value-objects/behavioral-signals.value-object';

/**
 * Competency Assessment Entity
 *
 * Tracks per-competency assessment state and progress within the CCIS framework.
 * This entity manages the assessment journey for each of the 7 core competencies,
 * providing detailed progression tracking and evidence-based level determination.
 *
 * Key Responsibilities:
 * 1. **Competency Progress Tracking**: Monitor progression through CCIS levels
 * 2. **Evidence Accumulation**: Collect and analyze behavioral signals
 * 3. **Level Determination**: Calculate and validate CCIS level achievements
 * 4. **Plateau Detection**: Identify when learners need intervention
 * 5. **Confidence Assessment**: Track assessment reliability and confidence
 * 6. **Certification Readiness**: Determine when competency is certification-ready
 *
 * 7 Core Competencies (CCIS Framework):
 * - **COMMUNICATION**: Written, verbal, and digital communication skills
 * - **PROBLEM_SOLVING**: Analytical thinking and solution development
 * - **TEAMWORK**: Collaboration and interpersonal effectiveness
 * - **ADAPTABILITY**: Flexibility and resilience in changing environments
 * - **TIME_MANAGEMENT**: Planning, prioritization, and execution
 * - **TECHNICAL_SKILLS**: Domain-specific technical competencies
 * - **LEADERSHIP**: Influence, decision-making, and team guidance
 *
 * CCIS Levels (4-Point Scale):
 * - **Level 1 (Novice Learner)**: 0-25% mastery with high scaffolding
 * - **Level 2 (Guided Practitioner)**: 25-50% mastery with moderate scaffolding
 * - **Level 3 (Self-directed Performer)**: 50-85% mastery with minimal scaffolding
 * - **Level 4 (Autonomous Expert)**: 85-100% mastery with no scaffolding
 *
 * Assessment States:
 * - **INITIAL**: Competency assessment not yet started
 * - **IN_PROGRESS**: Active assessment and skill development
 * - **PLATEAU**: Learning plateau detected, intervention needed
 * - **ADVANCING**: Consistent progress toward next level
 * - **LEVEL_ACHIEVED**: CCIS level successfully achieved
 * - **CERTIFICATION_READY**: Ready for external certification
 * - **MASTERED**: Competency fully mastered (Level 4 achieved)
 *
 * Business Rules:
 * - Each competency assessment must be linked to an assessment session
 * - CCIS level progression must be sequential (cannot skip levels)
 * - Level achievement requires consistent performance over time
 * - Confidence scores must meet minimum thresholds for level advancement
 * - Plateau detection triggers automatic intervention recommendations
 * - Certification readiness requires sustained Level 3+ performance
 * - Competency mastery requires Level 4 achievement with high confidence
 *
 * Evidence Requirements:
 * - **Level 1 → Level 2**: 5+ task interactions with 60%+ performance
 * - **Level 2 → Level 3**: 10+ task interactions with 70%+ performance
 * - **Level 3 → Level 4**: 15+ task interactions with 85%+ performance
 * - **Certification Ready**: 20+ task interactions with 90%+ performance
 *
 * Integration Points:
 * - **Assessment Session**: Reports competency-specific progress
 * - **Task Interactions**: Receives behavioral signals for analysis
 * - **Skill Passport**: Updates competency levels and achievements
 * - **Intervention Engine**: Triggers scaffolding and support adjustments
 * - **Analytics Engine**: Provides competency-specific insights
 * - **Certification Module**: Validates certification readiness
 *
 * @example
 * ```typescript
 * // Create competency assessment
 * const competencyAssessment = CompetencyAssessment.create({
 *   assessmentSessionId: sessionId,
 *   personId: personId,
 *   competencyType: CompetencyType.PROBLEM_SOLVING,
 *   currentLevel: CCISLevel.LEVEL_1,
 *   targetLevel: CCISLevel.LEVEL_3
 * });
 *
 * // Add task interaction evidence
 * competencyAssessment.addTaskEvidence(taskInteraction);
 * competencyAssessment.updateProgress();
 *
 * // Check level advancement
 * if (competencyAssessment.canAdvanceLevel()) {
 *   competencyAssessment.advanceToNextLevel();
 * }
 *
 * // Check certification readiness
 * if (competencyAssessment.isCertificationReady()) {
 *   const certification = competencyAssessment.generateCertificationEvidence();
 * }
 * ```
 */

export enum CompetencyAssessmentState {
  INITIAL = 'INITIAL',
  IN_PROGRESS = 'IN_PROGRESS',
  PLATEAU = 'PLATEAU',
  ADVANCING = 'ADVANCING',
  LEVEL_ACHIEVED = 'LEVEL_ACHIEVED',
  CERTIFICATION_READY = 'CERTIFICATION_READY',
  MASTERED = 'MASTERED',
}

export enum ProgressTrend {
  IMPROVING = 'IMPROVING',
  STABLE = 'STABLE',
  DECLINING = 'DECLINING',
  STAGNANT = 'STAGNANT',
}

export interface CompetencyAssessmentData {
  id: CompetencyAssessmentID;
  assessmentSessionId: AssessmentID;
  personId: PersonID;
  competencyType: CompetencyType;
  currentLevel: CCISLevel;
  targetLevel: CCISLevel;
  state: CompetencyAssessmentState;
  createdAt: Date;
  lastUpdated: Date;
  metadata: {
    culturalContext: 'INDIA' | 'UAE' | 'INTERNATIONAL';
    learningStyle: 'VISUAL' | 'AUDITORY' | 'KINESTHETIC' | 'MIXED';
    priorExperience: 'NONE' | 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
    assessmentMode: 'SELF_PACED' | 'GUIDED' | 'STRUCTURED' | 'ADAPTIVE';
    interventionPreferences: string[];
  };
}

export interface TaskEvidenceData {
  taskInteractionId: string;
  performanceScore: number; // 0-1 scale
  behavioralSignals: BehavioralSignals;
  confidenceScore: ConfidenceScore;
  completionTime: number; // milliseconds
  scaffoldingUsed: number; // 0-5 scale
  evidenceWeight: number; // 0-1 scale (newer evidence weighted higher)
  timestamp: Date;
}

export interface LevelAdvancementCriteria {
  minTaskCount: number;
  minPerformanceThreshold: number;
  minConfidenceThreshold: number;
  minConsistencyPeriod: number; // days
  requiredSignalStrength: number; // 0-1 scale
}

export interface CertificationEvidence {
  competencyType: CompetencyType;
  achievedLevel: CCISLevel;
  evidenceCount: number;
  averagePerformance: number;
  confidenceScore: ConfidenceScore;
  assessmentPeriod: {
    startDate: Date;
    endDate: Date;
    durationDays: number;
  };
  keyEvidence: TaskEvidenceData[];
  culturalContext: string;
  learningJourney: {
    initialLevel: CCISLevel;
    progressMilestones: Date[];
    interventionsUsed: string[];
    plateausPeriods: number;
  };
}

export class CompetencyAssessment extends Entity<CompetencyAssessmentID> {
  // Core competency properties
  public readonly assessmentSessionId: AssessmentID;
  public readonly personId: PersonID;
  public readonly competencyType: CompetencyType;
  public readonly createdAt: Date;
  public readonly metadata: CompetencyAssessmentData['metadata'];

  // Assessment state
  private _currentLevel: CCISLevel;
  private _targetLevel: CCISLevel;
  private _state: CompetencyAssessmentState;
  private _lastUpdated: Date;

  // Evidence and progress tracking
  private _taskEvidence: TaskEvidenceData[] = [];
  private _performanceHistory: number[] = [];
  private _confidenceHistory: ConfidenceScore[] = [];
  private _progressTrend: ProgressTrend = ProgressTrend.STABLE;

  // Level advancement tracking
  private _levelAchievementDates: Map<number, Date> = new Map();
  private _plateauPeriods: {
    start: Date;
    end?: Date;
    interventions: string[];
  }[] = [];
  private _interventionHistory: string[] = [];

  // Analytical metrics
  private _averagePerformance: number = 0;
  private _consistencyScore: number = 0;
  private _improvementRate: number = 0;
  private _plateauRisk: number = 0;

  // Level advancement criteria (based on CCIS framework)
  private static readonly LEVEL_ADVANCEMENT_CRITERIA: Record<
    number,
    LevelAdvancementCriteria
  > = {
    1: {
      // Novice → Guided Practitioner
      minTaskCount: 5,
      minPerformanceThreshold: 0.6,
      minConfidenceThreshold: 0.5,
      minConsistencyPeriod: 3,
      requiredSignalStrength: 0.5,
    },
    2: {
      // Guided Practitioner → Self-directed Performer
      minTaskCount: 10,
      minPerformanceThreshold: 0.7,
      minConfidenceThreshold: 0.6,
      minConsistencyPeriod: 7,
      requiredSignalStrength: 0.6,
    },
    3: {
      // Self-directed Performer → Autonomous Expert
      minTaskCount: 15,
      minPerformanceThreshold: 0.85,
      minConfidenceThreshold: 0.8,
      minConsistencyPeriod: 14,
      requiredSignalStrength: 0.8,
    },
    4: {
      // Certification readiness
      minTaskCount: 20,
      minPerformanceThreshold: 0.9,
      minConfidenceThreshold: 0.9,
      minConsistencyPeriod: 21,
      requiredSignalStrength: 0.85,
    },
  };

  constructor(data: CompetencyAssessmentData) {
    super(data.id);

    // Initialize core properties
    this.assessmentSessionId = data.assessmentSessionId;
    this.personId = data.personId;
    this.competencyType = data.competencyType;
    this.createdAt = data.createdAt;
    this.metadata = data.metadata;

    // Initialize state
    this._currentLevel = data.currentLevel;
    this._targetLevel = data.targetLevel;
    this._state = data.state;
    this._lastUpdated = data.lastUpdated;

    // Validate assessment data
    this.validateAssessmentData();
  }

  /**
   * Create a new Competency Assessment
   */
  public static create(data: CompetencyAssessmentData): CompetencyAssessment {
    const assessment = new CompetencyAssessment(data);

    // Initialize level achievement tracking
    assessment._levelAchievementDates.set(
      data.currentLevel.getLevel(),
      data.createdAt,
    );

    return assessment;
  }

  /**
   * Add task interaction evidence
   */
  public addTaskEvidence(
    taskInteractionId: string,
    performanceScore: number,
    behavioralSignals: BehavioralSignals,
    confidenceScore: ConfidenceScore,
    completionTime: number,
    scaffoldingUsed: number,
  ): void {
    this.ensureAssessmentActive();

    // Calculate evidence weight (newer evidence weighted higher)
    const evidenceWeight = this.calculateEvidenceWeight();

    const evidence: TaskEvidenceData = {
      taskInteractionId,
      performanceScore,
      behavioralSignals,
      confidenceScore,
      completionTime,
      scaffoldingUsed,
      evidenceWeight,
      timestamp: new Date(),
    };

    this._taskEvidence.push(evidence);
    this._performanceHistory.push(performanceScore);
    this._confidenceHistory.push(confidenceScore);

    // Update analytical metrics
    this.updateAnalyticalMetrics();
    this._lastUpdated = new Date();

    // Check for level advancement
    this.checkLevelAdvancement();

    // Check for plateau detection
    this.checkPlateauDetection();
  }

  /**
   * Update assessment progress and state
   */
  public updateProgress(): void {
    this.updateAnalyticalMetrics();
    this.updateProgressTrend();
    this.updateAssessmentState();
    this._lastUpdated = new Date();
  }

  /**
   * Check if can advance to next level
   */
  public canAdvanceLevel(): boolean {
    const currentLevelNum = this._currentLevel.getLevel();
    if (currentLevelNum >= 4) return false; // Already at max level

    const criteria =
      CompetencyAssessment.LEVEL_ADVANCEMENT_CRITERIA[currentLevelNum];
    if (!criteria) return false;

    // Check task count
    if (this._taskEvidence.length < criteria.minTaskCount) return false;

    // Check performance threshold
    if (this._averagePerformance < criteria.minPerformanceThreshold)
      return false;

    // Check confidence threshold
    const avgConfidence = this.getAverageConfidence();
    if (avgConfidence < criteria.minConfidenceThreshold) return false;

    // Check consistency period
    if (!this.hasConsistentPerformance(criteria.minConsistencyPeriod))
      return false;

    // Check signal strength
    const signalStrength = this.getAverageSignalStrength();
    if (signalStrength < criteria.requiredSignalStrength) return false;

    return true;
  }

  /**
   * Advance to next CCIS level
   */
  public advanceToNextLevel(): void {
    if (!this.canAdvanceLevel()) {
      throw new BusinessRuleException(
        'Criteria not met for level advancement',
        'levelAdvancement',
      );
    }

    const currentLevelNum = this._currentLevel.getLevel();
    const nextLevel = CCISLevel.fromLevel(currentLevelNum + 1);

    this._currentLevel = nextLevel;
    this._levelAchievementDates.set(nextLevel.getLevel(), new Date());
    this._state = CompetencyAssessmentState.LEVEL_ACHIEVED;
    this._lastUpdated = new Date();

    // Check if mastered or certification ready
    if (nextLevel.getLevel() >= 4) {
      this._state = CompetencyAssessmentState.MASTERED;
    } else if (nextLevel.getLevel() >= 3 && this.isCertificationReady()) {
      this._state = CompetencyAssessmentState.CERTIFICATION_READY;
    }
  }

  /**
   * Check if ready for certification
   */
  public isCertificationReady(): boolean {
    // Must be at Level 3 or higher
    if (this._currentLevel.getLevel() < 3) return false;

    const criteria = CompetencyAssessment.LEVEL_ADVANCEMENT_CRITERIA[4]; // Certification criteria

    // Check evidence requirements
    if (this._taskEvidence.length < criteria.minTaskCount) return false;
    if (this._averagePerformance < criteria.minPerformanceThreshold)
      return false;
    if (this.getAverageConfidence() < criteria.minConfidenceThreshold)
      return false;

    // Check sustained performance
    return this.hasSustainedPerformance(criteria.minConsistencyPeriod);
  }

  /**
   * Generate certification evidence
   */
  public generateCertificationEvidence(): CertificationEvidence {
    if (!this.isCertificationReady()) {
      throw new BusinessRuleException(
        'Competency not ready for certification',
        'certificationReadiness',
      );
    }

    // Get key evidence (top performing interactions)
    const keyEvidence = this._taskEvidence
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 10);

    // Calculate assessment period
    const startDate = this.createdAt;
    const endDate = new Date();
    const durationDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Get progress milestones
    const progressMilestones = Array.from(
      this._levelAchievementDates.values(),
    ).sort();

    return {
      competencyType: this.competencyType,
      achievedLevel: this._currentLevel,
      evidenceCount: this._taskEvidence.length,
      averagePerformance: this._averagePerformance,
      confidenceScore: this.getAverageConfidenceScore(),
      assessmentPeriod: {
        startDate,
        endDate,
        durationDays,
      },
      keyEvidence,
      culturalContext: this.metadata.culturalContext,
      learningJourney: {
        initialLevel: CCISLevel.fromLevel(1),
        progressMilestones,
        interventionsUsed: [...this._interventionHistory],
        plateausPeriods: this._plateauPeriods.length,
      },
    };
  }

  /**
   * Apply intervention
   */
  public applyIntervention(
    interventionType: string,
    interventionData: any,
  ): void {
    this._interventionHistory.push(
      `${interventionType}:${new Date().toISOString()}`,
    );

    // If currently in plateau, end the plateau period
    if (this._state === CompetencyAssessmentState.PLATEAU) {
      const currentPlateau =
        this._plateauPeriods[this._plateauPeriods.length - 1];
      if (currentPlateau && !currentPlateau.end) {
        currentPlateau.end = new Date();
        currentPlateau.interventions.push(interventionType);
      }

      this._state = CompetencyAssessmentState.IN_PROGRESS;
    }

    this._lastUpdated = new Date();
  }

  /**
   * Get competency assessment summary
   */
  public getAssessmentSummary(): {
    competencyType: string;
    currentLevel: number;
    targetLevel: number;
    state: string;
    progressPercentage: number;
    evidenceCount: number;
    averagePerformance: number;
    averageConfidence: number;
    progressTrend: string;
    plateauRisk: number;
    certificationReady: boolean;
    daysInAssessment: number;
  } {
    const daysInAssessment = Math.ceil(
      (new Date().getTime() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    const progressPercentage = this.calculateProgressPercentage();

    return {
      competencyType: this.competencyType.getType(),
      currentLevel: this._currentLevel.getLevel(),
      targetLevel: this._targetLevel.getLevel(),
      state: this._state,
      progressPercentage,
      evidenceCount: this._taskEvidence.length,
      averagePerformance: this._averagePerformance,
      averageConfidence: this.getAverageConfidence(),
      progressTrend: this._progressTrend,
      plateauRisk: this._plateauRisk,
      certificationReady: this.isCertificationReady(),
      daysInAssessment,
    };
  }

  // Getter methods
  public get currentLevel(): CCISLevel {
    return this._currentLevel;
  }

  public get targetLevel(): CCISLevel {
    return this._targetLevel;
  }

  public get state(): CompetencyAssessmentState {
    return this._state;
  }

  public get lastUpdated(): Date {
    return this._lastUpdated;
  }

  public get taskEvidence(): readonly TaskEvidenceData[] {
    return [...this._taskEvidence];
  }

  public get performanceHistory(): readonly number[] {
    return [...this._performanceHistory];
  }

  public get progressTrend(): ProgressTrend {
    return this._progressTrend;
  }

  public get levelAchievementDates(): ReadonlyMap<number, Date> {
    return new Map(this._levelAchievementDates);
  }

  // Private calculation methods
  private calculateEvidenceWeight(): number {
    // Newer evidence gets higher weight (exponential decay)
    const totalEvidence = this._taskEvidence.length;
    return Math.exp(-totalEvidence * 0.1); // Decay factor
  }

  private updateAnalyticalMetrics(): void {
    if (this._taskEvidence.length === 0) return;

    // Calculate weighted average performance
    const weightedPerformance = this._taskEvidence.reduce(
      (sum, evidence) =>
        sum + evidence.performanceScore * evidence.evidenceWeight,
      0,
    );
    const totalWeight = this._taskEvidence.reduce(
      (sum, evidence) => sum + evidence.evidenceWeight,
      0,
    );
    this._averagePerformance = weightedPerformance / totalWeight;

    // Calculate consistency score (lower variance = higher consistency)
    const variance = this.calculatePerformanceVariance();
    this._consistencyScore = Math.max(0, 1 - variance);

    // Calculate improvement rate
    this._improvementRate = this.calculateImprovementRate();

    // Calculate plateau risk
    this._plateauRisk = this.calculatePlateauRisk();
  }

  private updateProgressTrend(): void {
    if (this._performanceHistory.length < 3) {
      this._progressTrend = ProgressTrend.STABLE;
      return;
    }

    const recentPerformance = this._performanceHistory.slice(-5);
    const trend = this.calculateTrendSlope(recentPerformance);

    if (trend > 0.05) {
      this._progressTrend = ProgressTrend.IMPROVING;
    } else if (trend < -0.05) {
      this._progressTrend = ProgressTrend.DECLINING;
    } else if (Math.abs(trend) < 0.01) {
      this._progressTrend = ProgressTrend.STAGNANT;
    } else {
      this._progressTrend = ProgressTrend.STABLE;
    }
  }

  private updateAssessmentState(): void {
    if (this._currentLevel.getLevel() >= 4) {
      this._state = CompetencyAssessmentState.MASTERED;
    } else if (this.isCertificationReady()) {
      this._state = CompetencyAssessmentState.CERTIFICATION_READY;
    } else if (this._plateauRisk > 0.7) {
      this._state = CompetencyAssessmentState.PLATEAU;
    } else if (
      this._progressTrend === ProgressTrend.IMPROVING &&
      this.canAdvanceLevel()
    ) {
      this._state = CompetencyAssessmentState.ADVANCING;
    } else {
      this._state = CompetencyAssessmentState.IN_PROGRESS;
    }
  }

  private checkLevelAdvancement(): void {
    if (
      this.canAdvanceLevel() &&
      this._state !== CompetencyAssessmentState.ADVANCING
    ) {
      this._state = CompetencyAssessmentState.ADVANCING;
    }
  }

  private checkPlateauDetection(): void {
    const plateauThreshold = 10; // Number of interactions to check
    if (this._taskEvidence.length < plateauThreshold) return;

    const recentEvidence = this._taskEvidence.slice(-plateauThreshold);
    const performanceVariance = this.calculatePerformanceVariance(
      recentEvidence.map((e) => e.performanceScore),
    );

    // Low variance + low improvement = plateau
    if (performanceVariance < 0.01 && this._improvementRate < 0.01) {
      if (this._state !== CompetencyAssessmentState.PLATEAU) {
        this._plateauPeriods.push({
          start: new Date(),
          interventions: [],
        });
        this._state = CompetencyAssessmentState.PLATEAU;
      }
    }
  }

  private hasConsistentPerformance(days: number): boolean {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentEvidence = this._taskEvidence.filter(
      (evidence) => evidence.timestamp >= cutoffDate,
    );

    if (recentEvidence.length < 3) return false;

    const performances = recentEvidence.map((e) => e.performanceScore);
    const variance = this.calculatePerformanceVariance(performances);

    return variance < 0.05; // Low variance indicates consistency
  }

  private hasSustainedPerformance(days: number): boolean {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentEvidence = this._taskEvidence.filter(
      (evidence) => evidence.timestamp >= cutoffDate,
    );

    if (recentEvidence.length < 5) return false;

    const avgPerformance =
      recentEvidence.reduce((sum, e) => sum + e.performanceScore, 0) /
      recentEvidence.length;

    return avgPerformance >= 0.85; // High sustained performance
  }

  private getAverageConfidence(): number {
    if (this._confidenceHistory.length === 0) return 0;

    return (
      this._confidenceHistory.reduce(
        (sum, confidence) => sum + confidence.getScore(),
        0,
      ) / this._confidenceHistory.length
    );
  }

  private getAverageConfidenceScore(): ConfidenceScore {
    const avgConfidence = this.getAverageConfidence();
    return ConfidenceScore.fromPercentage(avgConfidence * 100);
  }

  private getAverageSignalStrength(): number {
    if (this._taskEvidence.length === 0) return 0;

    return (
      this._taskEvidence.reduce(
        (sum, evidence) =>
          sum + evidence.behavioralSignals.calculateWeightedScore(),
        0,
      ) / this._taskEvidence.length
    );
  }

  private calculateProgressPercentage(): number {
    const currentLevelNum = this._currentLevel.getLevel();
    const targetLevelNum = this._targetLevel.getLevel();

    if (currentLevelNum >= targetLevelNum) return 100;

    const baseProgress = ((currentLevelNum - 1) / (targetLevelNum - 1)) * 100;

    // Add progress within current level based on advancement criteria
    const nextLevelCriteria =
      CompetencyAssessment.LEVEL_ADVANCEMENT_CRITERIA[currentLevelNum];
    if (nextLevelCriteria) {
      const taskProgress = Math.min(
        1,
        this._taskEvidence.length / nextLevelCriteria.minTaskCount,
      );
      const performanceProgress = Math.min(
        1,
        this._averagePerformance / nextLevelCriteria.minPerformanceThreshold,
      );
      const withinLevelProgress = (taskProgress + performanceProgress) / 2;

      const levelIncrement = (1 / (targetLevelNum - 1)) * 100;
      return baseProgress + withinLevelProgress * levelIncrement;
    }

    return baseProgress;
  }

  private calculatePerformanceVariance(performances?: number[]): number {
    const data = performances || this._performanceHistory;
    if (data.length < 2) return 0;

    const mean = data.reduce((sum, p) => sum + p, 0) / data.length;
    const variance =
      data.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / data.length;

    return variance;
  }

  private calculateImprovementRate(): number {
    if (this._performanceHistory.length < 5) return 0;

    const recent = this._performanceHistory.slice(-5);
    return this.calculateTrendSlope(recent);
  }

  private calculatePlateauRisk(): number {
    if (this._taskEvidence.length < 10) return 0;

    const recentEvidence = this._taskEvidence.slice(-10);
    const performances = recentEvidence.map((e) => e.performanceScore);

    const variance = this.calculatePerformanceVariance(performances);
    const improvement = this.calculateTrendSlope(performances);

    // High plateau risk = low variance + no improvement
    const varianceScore = Math.max(0, 1 - variance * 10);
    const improvementScore = Math.max(0, 1 - Math.abs(improvement));

    return (varianceScore + improvementScore) / 2;
  }

  private calculateTrendSlope(data: number[]): number {
    if (data.length < 2) return 0;

    const n = data.length;
    const xSum = (n * (n - 1)) / 2; // Sum of indices
    const ySum = data.reduce((sum, y) => sum + y, 0);
    const xySum = data.reduce((sum, y, x) => sum + x * y, 0);
    const xSquaredSum = data.reduce((sum, _, x) => sum + x * x, 0);

    const slope = (n * xySum - xSum * ySum) / (n * xSquaredSum - xSum * xSum);
    return slope;
  }

  private ensureAssessmentActive(): void {
    if (this._state === CompetencyAssessmentState.MASTERED) {
      throw new BusinessRuleException(
        'Cannot modify mastered competency assessment',
        'assessmentState',
      );
    }
  }

  private validateAssessmentData(): void {
    if (!this.assessmentSessionId) {
      throw new BusinessRuleException(
        'Competency assessment must be linked to an assessment session',
        'assessmentSessionId',
      );
    }

    if (!this.personId) {
      throw new BusinessRuleException(
        'Competency assessment must be linked to a person',
        'personId',
      );
    }

    if (this._targetLevel.getLevel() <= this._currentLevel.getLevel()) {
      throw new BusinessRuleException(
        'Target level must be higher than current level',
        'targetLevel',
      );
    }
  }
}
