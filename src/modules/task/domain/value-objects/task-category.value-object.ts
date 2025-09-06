import { ValueObject } from '../../../../shared/base/value-object.base';
import { InvalidTaskCategoryError } from '../exceptions/task.exceptions';

/**
 * TaskCategory Value Object
 *
 * Represents specific workplace skill categories that align with
 * real industry requirements and job responsibilities.
 *
 * Categories are organized by competency areas to enable
 * targeted skill development and accurate CCIS assessment.
 */
export class TaskCategory extends ValueObject<string> {
  private static readonly VALID_CATEGORIES = [
    // Communication
    'EMAIL_WRITING',
    'PRESENTATION_SKILLS',
    'MEETING_FACILITATION',
    'CLIENT_COMMUNICATION',

    // Data Analysis & Insights
    'EXCEL_ANALYSIS',
    'SQL_QUERIES',
    'DATA_VISUALIZATION',
    'INSIGHT_GENERATION',

    // Academic/Technical Knowledge
    'PROGRAMMING_EXERCISE',
    'SYSTEM_DESIGN',
    'DEBUGGING_CHALLENGE',
    'TECHNICAL_DOCUMENTATION',

    // Project Management
    'PROJECT_PLANNING',
    'TIMELINE_CREATION',
    'RISK_ASSESSMENT',
    'STAKEHOLDER_COMMUNICATION',

    // Critical Thinking & Problem Solving
    'ROOT_CAUSE_ANALYSIS',
    'DECISION_FRAMEWORK',
    'SCENARIO_ANALYSIS',
    'PROCESS_OPTIMIZATION',

    // Innovation & Creativity
    'CREATIVE_BRAINSTORMING',
    'PRODUCT_IDEATION',
    'DESIGN_THINKING',
    'INNOVATION_CHALLENGE',

    // Leadership & Team Management
    'TEAM_COORDINATION',
    'CONFLICT_RESOLUTION',
    'PERFORMANCE_REVIEW',
    'CHANGE_MANAGEMENT',

    // Industry-Specific
    'FINANCE_MODELING',
    'MARKETING_CAMPAIGN',
    'HR_POLICY_DEVELOPMENT',
    'SUPPLY_CHAIN_OPTIMIZATION',
  ] as const;

  // Communication Categories
  public static readonly EMAIL_WRITING = new TaskCategory('EMAIL_WRITING');
  public static readonly PRESENTATION_SKILLS = new TaskCategory(
    'PRESENTATION_SKILLS',
  );
  public static readonly MEETING_FACILITATION = new TaskCategory(
    'MEETING_FACILITATION',
  );
  public static readonly CLIENT_COMMUNICATION = new TaskCategory(
    'CLIENT_COMMUNICATION',
  );

  // Data Analysis & Insights Categories
  public static readonly EXCEL_ANALYSIS = new TaskCategory('EXCEL_ANALYSIS');
  public static readonly SQL_QUERIES = new TaskCategory('SQL_QUERIES');
  public static readonly DATA_VISUALIZATION = new TaskCategory(
    'DATA_VISUALIZATION',
  );
  public static readonly INSIGHT_GENERATION = new TaskCategory(
    'INSIGHT_GENERATION',
  );

  // Academic/Technical Knowledge Categories
  public static readonly PROGRAMMING_EXERCISE = new TaskCategory(
    'PROGRAMMING_EXERCISE',
  );
  public static readonly SYSTEM_DESIGN = new TaskCategory('SYSTEM_DESIGN');
  public static readonly DEBUGGING_CHALLENGE = new TaskCategory(
    'DEBUGGING_CHALLENGE',
  );
  public static readonly TECHNICAL_DOCUMENTATION = new TaskCategory(
    'TECHNICAL_DOCUMENTATION',
  );

  // Project Management Categories
  public static readonly PROJECT_PLANNING = new TaskCategory(
    'PROJECT_PLANNING',
  );
  public static readonly TIMELINE_CREATION = new TaskCategory(
    'TIMELINE_CREATION',
  );
  public static readonly RISK_ASSESSMENT = new TaskCategory('RISK_ASSESSMENT');
  public static readonly STAKEHOLDER_COMMUNICATION = new TaskCategory(
    'STAKEHOLDER_COMMUNICATION',
  );

  // Critical Thinking & Problem Solving Categories
  public static readonly ROOT_CAUSE_ANALYSIS = new TaskCategory(
    'ROOT_CAUSE_ANALYSIS',
  );
  public static readonly DECISION_FRAMEWORK = new TaskCategory(
    'DECISION_FRAMEWORK',
  );
  public static readonly SCENARIO_ANALYSIS = new TaskCategory(
    'SCENARIO_ANALYSIS',
  );
  public static readonly CREATIVE_PROBLEM_SOLVING = new TaskCategory(
    'CREATIVE_PROBLEM_SOLVING',
  );

  // Leadership & Collaboration Categories
  public static readonly TEAM_COORDINATION = new TaskCategory(
    'TEAM_COORDINATION',
  );
  public static readonly CONFLICT_RESOLUTION = new TaskCategory(
    'CONFLICT_RESOLUTION',
  );
  public static readonly DELEGATION_EXERCISE = new TaskCategory(
    'DELEGATION_EXERCISE',
  );
  public static readonly MENTORING_SIMULATION = new TaskCategory(
    'MENTORING_SIMULATION',
  );

  // Innovation & Adaptability Categories
  public static readonly PROCESS_IMPROVEMENT = new TaskCategory(
    'PROCESS_IMPROVEMENT',
  );
  public static readonly TECHNOLOGY_ADOPTION = new TaskCategory(
    'TECHNOLOGY_ADOPTION',
  );
  public static readonly CHANGE_MANAGEMENT = new TaskCategory(
    'CHANGE_MANAGEMENT',
  );
  public static readonly CREATIVE_IDEATION = new TaskCategory(
    'CREATIVE_IDEATION',
  );

  /**
   * Competency mappings for each category
   */
  private static readonly COMPETENCY_MAPPINGS = {
    // Communication
    EMAIL_WRITING: 'COMMUNICATION',
    PRESENTATION_SKILLS: 'COMMUNICATION',
    MEETING_FACILITATION: 'COMMUNICATION',
    CLIENT_COMMUNICATION: 'COMMUNICATION',

    // Data Analysis & Insights
    EXCEL_ANALYSIS: 'TECHNICAL_SKILLS',
    SQL_QUERIES: 'TECHNICAL_SKILLS',
    DATA_VISUALIZATION: 'TECHNICAL_SKILLS',
    INSIGHT_GENERATION: 'PROBLEM_SOLVING',

    // Academic/Technical Knowledge
    PROGRAMMING_EXERCISE: 'TECHNICAL_SKILLS',
    SYSTEM_DESIGN: 'TECHNICAL_SKILLS',
    DEBUGGING_CHALLENGE: 'PROBLEM_SOLVING',
    TECHNICAL_DOCUMENTATION: 'COMMUNICATION',

    // Project Management
    PROJECT_PLANNING: 'TIME_MANAGEMENT',
    TIMELINE_CREATION: 'TIME_MANAGEMENT',
    RISK_ASSESSMENT: 'PROBLEM_SOLVING',
    STAKEHOLDER_COMMUNICATION: 'COMMUNICATION',

    // Critical Thinking & Problem Solving
    ROOT_CAUSE_ANALYSIS: 'PROBLEM_SOLVING',
    DECISION_FRAMEWORK: 'PROBLEM_SOLVING',
    SCENARIO_ANALYSIS: 'PROBLEM_SOLVING',
    CREATIVE_PROBLEM_SOLVING: 'PROBLEM_SOLVING',

    // Leadership & Collaboration
    TEAM_COORDINATION: 'TEAMWORK',
    CONFLICT_RESOLUTION: 'TEAMWORK',
    DELEGATION_EXERCISE: 'LEADERSHIP',
    MENTORING_SIMULATION: 'LEADERSHIP',

    // Innovation & Adaptability
    PROCESS_IMPROVEMENT: 'ADAPTABILITY',
    TECHNOLOGY_ADOPTION: 'ADAPTABILITY',
    CHANGE_MANAGEMENT: 'ADAPTABILITY',
    CREATIVE_IDEATION: 'ADAPTABILITY',
  } as const;

  private constructor(value: string) {
    super(value);
  }

  /**
   * Creates TaskCategory from string with validation
   */
  public static fromString(value: string): TaskCategory {
    return new TaskCategory(value);
  }

  /**
   * Gets all valid task categories
   */
  public static getValidCategories(): readonly string[] {
    return TaskCategory.VALID_CATEGORIES;
  }

  /**
   * Gets categories by competency
   */
  public static getCategoriesByCompetency(competency: string): TaskCategory[] {
    return TaskCategory.VALID_CATEGORIES.filter(
      (category) => TaskCategory.COMPETENCY_MAPPINGS[category] === competency,
    ).map((category) => new TaskCategory(category));
  }

  /**
   * Checks if a string is a valid task category
   */
  public static isValidCategory(value: string): boolean {
    const validCategories = [
      'EMAIL_WRITING',
      'PRESENTATION_SKILLS',
      'MEETING_FACILITATION',
      'CLIENT_COMMUNICATION',
      'EXCEL_ANALYSIS',
      'SQL_QUERIES',
      'DATA_VISUALIZATION',
      'INSIGHT_GENERATION',
      'PROGRAMMING_EXERCISE',
      'SYSTEM_DESIGN',
      'DEBUGGING_CHALLENGE',
      'TECHNICAL_DOCUMENTATION',
      'PROJECT_PLANNING',
      'TIMELINE_CREATION',
      'RISK_ASSESSMENT',
      'STAKEHOLDER_COMMUNICATION',
      'ROOT_CAUSE_ANALYSIS',
      'DECISION_FRAMEWORK',
      'SCENARIO_ANALYSIS',
      'PROCESS_OPTIMIZATION',
      'CREATIVE_PROBLEM_SOLVING',
      'CREATIVE_BRAINSTORMING',
      'PRODUCT_IDEATION',
      'DESIGN_THINKING',
      'INNOVATION_CHALLENGE',
      'TEAM_COORDINATION',
      'CONFLICT_RESOLUTION',
      'PERFORMANCE_REVIEW',
      'CHANGE_MANAGEMENT',
      'DELEGATION_EXERCISE',
      'MENTORING_SIMULATION',
      'PROCESS_IMPROVEMENT',
      'TECHNOLOGY_ADOPTION',
      'CREATIVE_IDEATION',
      'FINANCE_MODELING',
      'MARKETING_CAMPAIGN',
      'HR_POLICY_DEVELOPMENT',
      'SUPPLY_CHAIN_OPTIMIZATION',
    ];
    return validCategories.includes(value);
  }

  /**
   * Gets the primary competency this category belongs to
   */
  public getPrimaryCompetency(): string {
    const competency =
      TaskCategory.COMPETENCY_MAPPINGS[
        this.value as keyof typeof TaskCategory.COMPETENCY_MAPPINGS
      ];
    if (!competency) {
      throw new InvalidTaskCategoryError(
        `No competency mapping found for category: ${this.value}`,
      );
    }
    return competency;
  }

  /**
   * Gets the competency group this category belongs to
   */
  public getCompetencyGroup(): string {
    const competency = this.getPrimaryCompetency();

    // Group competencies by related skills
    if (['COMMUNICATION', 'TEAMWORK', 'LEADERSHIP'].includes(competency)) {
      return 'INTERPERSONAL_SKILLS';
    }

    if (['PROBLEM_SOLVING', 'TECHNICAL_SKILLS'].includes(competency)) {
      return 'ANALYTICAL_SKILLS';
    }

    if (['TIME_MANAGEMENT', 'ADAPTABILITY'].includes(competency)) {
      return 'PERSONAL_EFFECTIVENESS';
    }

    return 'GENERAL';
  }

  /**
   * Gets the typical industry contexts for this category
   */
  public getIndustryContexts(): string[] {
    switch (this.value) {
      case 'EMAIL_WRITING':
      case 'CLIENT_COMMUNICATION':
        return ['Corporate', 'Consulting', 'Customer Service', 'Sales'];

      case 'EXCEL_ANALYSIS':
      case 'DATA_VISUALIZATION':
        return ['Finance', 'Analytics', 'Operations', 'Marketing'];

      case 'PROGRAMMING_EXERCISE':
      case 'SYSTEM_DESIGN':
        return ['Technology', 'Software Development', 'IT Services'];

      case 'PROJECT_PLANNING':
      case 'TIMELINE_CREATION':
        return ['Project Management', 'Consulting', 'Operations'];

      case 'TEAM_COORDINATION':
      case 'CONFLICT_RESOLUTION':
        return ['Management', 'Human Resources', 'Team Leadership'];

      default:
        return ['General Business', 'Corporate'];
    }
  }

  /**
   * Gets the difficulty progression for this category
   */
  public getDifficultyProgression(): string[] {
    switch (this.value) {
      case 'EMAIL_WRITING':
        return [
          'Simple status updates',
          'Client inquiry responses',
          'Complex negotiation emails',
          'Crisis communication',
        ];

      case 'EXCEL_ANALYSIS':
        return [
          'Basic formulas and charts',
          'Pivot tables and analysis',
          'Advanced functions and modeling',
          'Dashboard creation and automation',
        ];

      case 'PROGRAMMING_EXERCISE':
        return [
          'Basic syntax and logic',
          'Algorithm implementation',
          'System integration',
          'Architecture design',
        ];

      default:
        return [
          'Basic understanding',
          'Practical application',
          'Complex scenarios',
          'Expert-level execution',
        ];
    }
  }

  /**
   * Validates the task category value
   */
  protected validate(value: string): void {
    if (!value) {
      throw new InvalidTaskCategoryError('Task category cannot be empty');
    }

    if (typeof value !== 'string') {
      throw new InvalidTaskCategoryError('Task category must be a string');
    }

    const validCategories = [
      'EMAIL_WRITING',
      'PRESENTATION_SKILLS',
      'MEETING_FACILITATION',
      'CLIENT_COMMUNICATION',
      'EXCEL_ANALYSIS',
      'SQL_QUERIES',
      'DATA_VISUALIZATION',
      'INSIGHT_GENERATION',
      'PROGRAMMING_EXERCISE',
      'SYSTEM_DESIGN',
      'DEBUGGING_CHALLENGE',
      'TECHNICAL_DOCUMENTATION',
      'PROJECT_PLANNING',
      'TIMELINE_CREATION',
      'RISK_ASSESSMENT',
      'STAKEHOLDER_COMMUNICATION',
      'ROOT_CAUSE_ANALYSIS',
      'DECISION_FRAMEWORK',
      'SCENARIO_ANALYSIS',
      'PROCESS_OPTIMIZATION',
      'CREATIVE_PROBLEM_SOLVING',
      'CREATIVE_BRAINSTORMING',
      'PRODUCT_IDEATION',
      'DESIGN_THINKING',
      'INNOVATION_CHALLENGE',
      'TEAM_COORDINATION',
      'CONFLICT_RESOLUTION',
      'PERFORMANCE_REVIEW',
      'CHANGE_MANAGEMENT',
      'DELEGATION_EXERCISE',
      'MENTORING_SIMULATION',
      'PROCESS_IMPROVEMENT',
      'TECHNOLOGY_ADOPTION',
      'CREATIVE_IDEATION',
      'FINANCE_MODELING',
      'MARKETING_CAMPAIGN',
      'HR_POLICY_DEVELOPMENT',
      'SUPPLY_CHAIN_OPTIMIZATION',
    ];

    if (!validCategories.includes(value)) {
      throw new InvalidTaskCategoryError(
        `Invalid task category: ${value}. Valid categories are: ${validCategories.slice(0, 5).join(', ')}...`,
      );
    }
  }

  /**
   * Equality check
   */
  public equals(other: ValueObject<string>): boolean {
    return other instanceof TaskCategory && this.value === other.value;
  }

  /**
   * String representation
   */
  public toString(): string {
    return this.value;
  }

  /**
   * Gets the value for database storage
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * Gets human-readable display name
   */
  public getDisplayName(): string {
    return this.value
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Checks if this category requires technical skills
   */
  public requiresTechnicalSkills(): boolean {
    const technicalCategories = [
      'EXCEL_ANALYSIS',
      'SQL_QUERIES',
      'DATA_VISUALIZATION',
      'PROGRAMMING_EXERCISE',
      'SYSTEM_DESIGN',
      'DEBUGGING_CHALLENGE',
      'TECHNICAL_DOCUMENTATION',
    ];

    return technicalCategories.includes(this.value);
  }

  /**
   * Checks if this category involves interpersonal skills
   */
  public involvesInterpersonalSkills(): boolean {
    const interpersonalCategories = [
      'PRESENTATION_SKILLS',
      'MEETING_FACILITATION',
      'CLIENT_COMMUNICATION',
      'STAKEHOLDER_COMMUNICATION',
      'TEAM_COORDINATION',
      'CONFLICT_RESOLUTION',
      'DELEGATION_EXERCISE',
      'MENTORING_SIMULATION',
    ];

    return interpersonalCategories.includes(this.value);
  }
}
