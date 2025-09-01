// src/modules/assessment/domain/value-objects/competency-type.value-object.ts

import { ValueObject } from '../../../../shared/base/value-object.base';
import { BusinessRuleException } from '../../../../shared/domain/exceptions/domain-exception.base';

/**
 * Competency Type Value Object
 *
 * Represents the 7 core competencies in Shrameva's CCIS framework that
 * define workplace readiness for GenZ engineering students.
 *
 * 7 Core Competencies (Based on Industry Requirements):
 * 1. Communication - Written, verbal, and presentation skills
 * 2. Problem Solving - Analytical thinking and solution development
 * 3. Teamwork - Collaboration and interpersonal effectiveness
 * 4. Adaptability - Learning agility and change management
 * 5. Time Management - Planning, prioritization, and efficiency
 * 6. Technical Skills - Domain expertise and tool proficiency
 * 7. Leadership - Initiative, mentoring, and decision-making
 *
 * Each competency has:
 * - Specific assessment criteria and tasks
 * - Industry weight/importance (for overall CCIS calculation)
 * - Career stage relevance (entry-level vs experienced)
 * - Cultural adaptation (India vs UAE markets)
 *
 * This value object provides:
 * - Type safety for competency references
 * - Competency metadata and descriptions
 * - Industry weighting and importance
 * - Assessment task categorization
 * - Career progression mapping
 *
 * Usage Examples:
 * ```typescript
 * // Create competency types
 * const comm = CompetencyType.fromString('communication');
 * const problemSolving = CompetencyType.PROBLEM_SOLVING;
 *
 * // Competency operations
 * const weight = comm.getIndustryWeight();
 * const tasks = comm.getAssessmentTasks();
 * const isCritical = comm.isCriticalForEntry();
 *
 * // Competency comparison
 * const isHigherPriority = comm.hasHigherPriorityThan(teamwork);
 * const allTypes = CompetencyType.getAllCompetencies();
 * ```
 */

export interface CompetencyTypeProps {
  type: CompetencyTypeEnum;
  name: string;
  description: string;
  industryWeight: number; // 0.0-1.0 for weighted CCIS calculation
  isCoreTechnical: boolean;
  isCoreSoft: boolean;
}

export enum CompetencyTypeEnum {
  COMMUNICATION = 'communication',
  PROBLEM_SOLVING = 'problem_solving',
  TEAMWORK = 'teamwork',
  ADAPTABILITY = 'adaptability',
  TIME_MANAGEMENT = 'time_management',
  TECHNICAL_SKILLS = 'technical_skills',
  LEADERSHIP = 'leadership',
}

export class CompetencyType extends ValueObject<CompetencyTypeProps> {
  // Static Competency Instances (Singleton Pattern)
  public static readonly COMMUNICATION = new CompetencyType({
    type: CompetencyTypeEnum.COMMUNICATION,
    name: 'Communication',
    description:
      'Written, verbal, and presentation skills for effective workplace interaction',
    industryWeight: 0.2, // 20% - Highest weight (critical for all roles)
    isCoreTechnical: false,
    isCoreSoft: true,
  });

  public static readonly PROBLEM_SOLVING = new CompetencyType({
    type: CompetencyTypeEnum.PROBLEM_SOLVING,
    name: 'Problem Solving',
    description:
      'Analytical thinking, debugging, and systematic solution development',
    industryWeight: 0.18, // 18% - Very high (core engineering skill)
    isCoreTechnical: true,
    isCoreSoft: false,
  });

  public static readonly TEAMWORK = new CompetencyType({
    type: CompetencyTypeEnum.TEAMWORK,
    name: 'Teamwork',
    description: 'Collaboration, interpersonal skills, and team contribution',
    industryWeight: 0.16, // 16% - High (essential for team environments)
    isCoreTechnical: false,
    isCoreSoft: true,
  });

  public static readonly ADAPTABILITY = new CompetencyType({
    type: CompetencyTypeEnum.ADAPTABILITY,
    name: 'Adaptability',
    description: 'Learning agility, change management, and resilience',
    industryWeight: 0.15, // 15% - High (critical in fast-changing tech)
    isCoreTechnical: false,
    isCoreSoft: true,
  });

  public static readonly TIME_MANAGEMENT = new CompetencyType({
    type: CompetencyTypeEnum.TIME_MANAGEMENT,
    name: 'Time Management',
    description:
      'Planning, prioritization, deadline management, and efficiency',
    industryWeight: 0.12, // 12% - Moderate-high (productivity essential)
    isCoreTechnical: false,
    isCoreSoft: true,
  });

  public static readonly TECHNICAL_SKILLS = new CompetencyType({
    type: CompetencyTypeEnum.TECHNICAL_SKILLS,
    name: 'Technical Skills',
    description: 'Domain expertise, tool proficiency, and technical execution',
    industryWeight: 0.14, // 14% - High (foundational for engineering)
    isCoreTechnical: true,
    isCoreSoft: false,
  });

  public static readonly LEADERSHIP = new CompetencyType({
    type: CompetencyTypeEnum.LEADERSHIP,
    name: 'Leadership',
    description: 'Initiative, mentoring, decision-making, and influence',
    industryWeight: 0.05, // 5% - Lower (grows with experience)
    isCoreTechnical: false,
    isCoreSoft: true,
  });

  // Assessment Task Categories for Each Competency
  private static readonly ASSESSMENT_TASKS = {
    [CompetencyTypeEnum.COMMUNICATION]: [
      'email_writing',
      'presentation_creation',
      'client_communication',
      'documentation_writing',
      'meeting_facilitation',
    ],
    [CompetencyTypeEnum.PROBLEM_SOLVING]: [
      'debugging_scenarios',
      'algorithm_design',
      'system_troubleshooting',
      'requirement_analysis',
      'solution_architecture',
    ],
    [CompetencyTypeEnum.TEAMWORK]: [
      'code_review_participation',
      'collaborative_projects',
      'conflict_resolution',
      'knowledge_sharing',
      'peer_feedback',
    ],
    [CompetencyTypeEnum.ADAPTABILITY]: [
      'technology_adoption',
      'process_changes',
      'learning_new_tools',
      'requirement_pivots',
      'environment_switches',
    ],
    [CompetencyTypeEnum.TIME_MANAGEMENT]: [
      'project_planning',
      'deadline_prioritization',
      'multitasking_scenarios',
      'estimation_accuracy',
      'workflow_optimization',
    ],
    [CompetencyTypeEnum.TECHNICAL_SKILLS]: [
      'coding_challenges',
      'system_design',
      'tool_proficiency',
      'best_practices',
      'code_quality',
    ],
    [CompetencyTypeEnum.LEADERSHIP]: [
      'initiative_taking',
      'decision_making',
      'mentoring_scenarios',
      'project_ownership',
      'influence_exercise',
    ],
  } as const;

  // Career Stage Relevance (Entry-level focus)
  private static readonly ENTRY_LEVEL_CRITICALITY = {
    [CompetencyTypeEnum.COMMUNICATION]: 'critical',
    [CompetencyTypeEnum.PROBLEM_SOLVING]: 'critical',
    [CompetencyTypeEnum.TEAMWORK]: 'critical',
    [CompetencyTypeEnum.ADAPTABILITY]: 'important',
    [CompetencyTypeEnum.TIME_MANAGEMENT]: 'important',
    [CompetencyTypeEnum.TECHNICAL_SKILLS]: 'critical',
    [CompetencyTypeEnum.LEADERSHIP]: 'developing',
  } as const;

  private constructor(props: CompetencyTypeProps) {
    super(props);
  }

  /**
   * Creates a competency type from string identifier
   */
  public static fromString(competencyStr: string): CompetencyType {
    const normalizedStr = competencyStr.toLowerCase().replace(/[^a-z]/g, '_');

    switch (normalizedStr) {
      case 'communication':
      case 'communication_skills':
        return CompetencyType.COMMUNICATION;
      case 'problem_solving':
      case 'problemsolving':
      case 'analytical_thinking':
        return CompetencyType.PROBLEM_SOLVING;
      case 'teamwork':
      case 'collaboration':
      case 'team_work':
        return CompetencyType.TEAMWORK;
      case 'adaptability':
      case 'learning_agility':
      case 'flexibility':
        return CompetencyType.ADAPTABILITY;
      case 'time_management':
      case 'timemanagement':
      case 'time_planning':
        return CompetencyType.TIME_MANAGEMENT;
      case 'technical_skills':
      case 'technical':
      case 'tech_skills':
        return CompetencyType.TECHNICAL_SKILLS;
      case 'leadership':
      case 'leading':
      case 'initiative':
        return CompetencyType.LEADERSHIP;
      default:
        throw new BusinessRuleException(
          `Invalid competency type: ${competencyStr}`,
          'competencyType',
        );
    }
  }

  /**
   * Gets all available competency types
   */
  public static getAllCompetencies(): CompetencyType[] {
    return [
      CompetencyType.COMMUNICATION,
      CompetencyType.PROBLEM_SOLVING,
      CompetencyType.TEAMWORK,
      CompetencyType.ADAPTABILITY,
      CompetencyType.TIME_MANAGEMENT,
      CompetencyType.TECHNICAL_SKILLS,
      CompetencyType.LEADERSHIP,
    ];
  }

  /**
   * Gets core soft skill competencies
   */
  public static getCoreSoftSkills(): CompetencyType[] {
    return CompetencyType.getAllCompetencies().filter((comp) =>
      comp.isCoreSoft(),
    );
  }

  /**
   * Gets core technical competencies
   */
  public static getCoreTechnicalSkills(): CompetencyType[] {
    return CompetencyType.getAllCompetencies().filter((comp) =>
      comp.isCoreTechnical(),
    );
  }

  /**
   * Gets competencies critical for entry-level positions
   */
  public static getEntryLevelCritical(): CompetencyType[] {
    return CompetencyType.getAllCompetencies().filter((comp) =>
      comp.isCriticalForEntry(),
    );
  }

  // Getters
  public getType(): CompetencyTypeEnum {
    return this.value.type;
  }

  public getName(): string {
    return this.value.name;
  }

  public getDescription(): string {
    return this.value.description;
  }

  public getIndustryWeight(): number {
    return this.value.industryWeight;
  }

  public isCoreTechnical(): boolean {
    return this.value.isCoreTechnical;
  }

  public isCoreSoft(): boolean {
    return this.value.isCoreSoft;
  }

  // Classification Methods
  public isCommunicationSkill(): boolean {
    return this.value.type === CompetencyTypeEnum.COMMUNICATION;
  }

  public isProblemSolvingSkill(): boolean {
    return this.value.type === CompetencyTypeEnum.PROBLEM_SOLVING;
  }

  public isTeamworkSkill(): boolean {
    return this.value.type === CompetencyTypeEnum.TEAMWORK;
  }

  public isAdaptabilitySkill(): boolean {
    return this.value.type === CompetencyTypeEnum.ADAPTABILITY;
  }

  public isTimeManagementSkill(): boolean {
    return this.value.type === CompetencyTypeEnum.TIME_MANAGEMENT;
  }

  public isTechnicalSkill(): boolean {
    return this.value.type === CompetencyTypeEnum.TECHNICAL_SKILLS;
  }

  public isLeadershipSkill(): boolean {
    return this.value.type === CompetencyTypeEnum.LEADERSHIP;
  }

  // Assessment Methods
  public getAssessmentTasks(): readonly string[] {
    return CompetencyType.ASSESSMENT_TASKS[this.value.type];
  }

  public hasAssessmentTask(taskType: string): boolean {
    return this.getAssessmentTasks().includes(taskType);
  }

  public isCriticalForEntry(): boolean {
    return (
      CompetencyType.ENTRY_LEVEL_CRITICALITY[this.value.type] === 'critical'
    );
  }

  public isImportantForEntry(): boolean {
    const criticality = CompetencyType.ENTRY_LEVEL_CRITICALITY[this.value.type];
    return criticality === 'critical' || criticality === 'important';
  }

  public isDevelopingAtEntry(): boolean {
    return (
      CompetencyType.ENTRY_LEVEL_CRITICALITY[this.value.type] === 'developing'
    );
  }

  public getEntryCriticality(): 'critical' | 'important' | 'developing' {
    return CompetencyType.ENTRY_LEVEL_CRITICALITY[this.value.type];
  }

  // Comparison Methods
  public equals(other: CompetencyType): boolean {
    return this.value.type === other.getType();
  }

  public hasHigherPriorityThan(other: CompetencyType): boolean {
    return this.value.industryWeight > other.getIndustryWeight();
  }

  public hasLowerPriorityThan(other: CompetencyType): boolean {
    return this.value.industryWeight < other.getIndustryWeight();
  }

  public hasSamePriorityAs(other: CompetencyType): boolean {
    const epsilon = 0.001;
    return (
      Math.abs(this.value.industryWeight - other.getIndustryWeight()) < epsilon
    );
  }

  // Utility Methods
  public getWeightedImportance(): 'very-high' | 'high' | 'moderate' | 'low' {
    const weight = this.value.industryWeight;
    if (weight >= 0.18) return 'very-high';
    if (weight >= 0.14) return 'high';
    if (weight >= 0.1) return 'moderate';
    return 'low';
  }

  public isHighPriorityCompetency(): boolean {
    return this.value.industryWeight >= 0.15; // 15% or higher
  }

  public getCompetencyCategory(): 'core-technical' | 'core-soft' | 'hybrid' {
    if (this.value.isCoreTechnical && this.value.isCoreSoft) {
      return 'hybrid';
    }
    if (this.value.isCoreTechnical) {
      return 'core-technical';
    }
    return 'core-soft';
  }

  // Value Object Implementation
  protected validate(props: CompetencyTypeProps): void {
    if (!Object.values(CompetencyTypeEnum).includes(props.type)) {
      throw new BusinessRuleException(
        `Invalid competency type enum: ${props.type}`,
        'competencyType',
      );
    }

    if (!props.name || props.name.trim().length === 0) {
      throw new BusinessRuleException(
        'Competency name cannot be empty',
        'competencyName',
      );
    }

    if (!props.description || props.description.trim().length === 0) {
      throw new BusinessRuleException(
        'Competency description cannot be empty',
        'competencyDescription',
      );
    }

    if (props.industryWeight < 0 || props.industryWeight > 1) {
      throw new BusinessRuleException(
        'Industry weight must be between 0 and 1',
        'industryWeight',
      );
    }

    // Validate that weights add up to approximately 1.0 across all competencies
    // Note: This validation is skipped during static initialization to avoid circular dependencies
    // It can be called separately using CompetencyType.validateTotalWeights() after initialization
    // const totalWeight = CompetencyType.getAllCompetencies().reduce(
    //   (sum, comp) => sum + comp.getIndustryWeight(),
    //   0,
    // );

    // const epsilon = 0.01; // Allow 1% tolerance
    // if (Math.abs(totalWeight - 1.0) > epsilon) {
    //   // Note: This validation only runs when all competencies are loaded
    //   // Individual validation doesn't check total sum
    // }
  }

  /**
   * Validate that all competency weights sum to approximately 1.0
   * This should be called after all static competencies are initialized
   */
  public static validateTotalWeights(): void {
    try {
      const totalWeight = CompetencyType.getAllCompetencies().reduce(
        (sum, comp) => sum + comp.getIndustryWeight(),
        0,
      );

      const epsilon = 0.01; // Allow 1% tolerance
      if (Math.abs(totalWeight - 1.0) > epsilon) {
        console.warn(
          `CompetencyType weights sum to ${totalWeight.toFixed(3)}, expected ~1.0. ` +
            'Consider adjusting industry weights for better balance.',
        );
      }
    } catch (error) {
      // Ignore validation errors during initialization
      console.debug(
        'CompetencyType total weight validation skipped during initialization',
      );
    }
  }

  public toJSON(): {
    type: string;
    name: string;
    description: string;
    industryWeight: number;
    weightedImportance: string;
    category: string;
    isCoreTechnical: boolean;
    isCoreSoft: boolean;
    isCriticalForEntry: boolean;
    assessmentTasks: readonly string[];
  } {
    return {
      type: this.value.type,
      name: this.value.name,
      description: this.value.description,
      industryWeight: this.value.industryWeight,
      weightedImportance: this.getWeightedImportance(),
      category: this.getCompetencyCategory(),
      isCoreTechnical: this.value.isCoreTechnical,
      isCoreSoft: this.value.isCoreSoft,
      isCriticalForEntry: this.isCriticalForEntry(),
      assessmentTasks: this.getAssessmentTasks(),
    };
  }

  public toString(): string {
    return `${this.value.name} (${Math.round(this.value.industryWeight * 100)}% weight): ${this.value.description}`;
  }
}
