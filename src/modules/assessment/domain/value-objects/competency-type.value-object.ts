import { ValueObject } from '../../../../shared/base/value-object.base';

export enum CompetencyTypeEnum {
  BUSINESS_COMMUNICATION = 'BUSINESS_COMMUNICATION',
  DATA_ANALYSIS = 'DATA_ANALYSIS',
  TECHNICAL_KNOWLEDGE = 'TECHNICAL_KNOWLEDGE',
  PROJECT_MANAGEMENT = 'PROJECT_MANAGEMENT',
  CRITICAL_THINKING = 'CRITICAL_THINKING',
  LEADERSHIP_COLLABORATION = 'LEADERSHIP_COLLABORATION',
  INNOVATION_ADAPTABILITY = 'INNOVATION_ADAPTABILITY',
}

export interface CompetencyTypeProps {
  value: CompetencyTypeEnum;
}

/**
 * CompetencyType Value Object
 *
 * Represents one of the 7 core competencies in the CCIS framework.
 * Each competency has specific characteristics and assessment criteria.
 */
export class CompetencyType extends ValueObject<CompetencyTypeProps> {
  private constructor(props: CompetencyTypeProps) {
    super(props);
  }

  public static create(value: CompetencyTypeEnum): CompetencyType {
    return new CompetencyType({ value });
  }

  public static fromString(value: string): CompetencyType {
    const normalizedValue = value.toUpperCase().replace(/\s+/g, '_');

    if (
      !Object.values(CompetencyTypeEnum).includes(
        normalizedValue as CompetencyTypeEnum,
      )
    ) {
      throw new Error(`Invalid competency type: ${value}`);
    }

    return new CompetencyType({ value: normalizedValue as CompetencyTypeEnum });
  }

  protected validate(props: CompetencyTypeProps): void {
    if (!Object.values(CompetencyTypeEnum).includes(props.value)) {
      throw new Error(`Invalid competency type: ${props.value}`);
    }
  }

  public getCompetencyType(): CompetencyTypeEnum {
    return this.getValue().value;
  }

  public toString(): string {
    return this.getValue().value;
  }

  public getDisplayName(): string {
    const displayNames: Record<CompetencyTypeEnum, string> = {
      [CompetencyTypeEnum.BUSINESS_COMMUNICATION]: 'Business Communication',
      [CompetencyTypeEnum.DATA_ANALYSIS]: 'Data Analysis',
      [CompetencyTypeEnum.TECHNICAL_KNOWLEDGE]: 'Technical Knowledge',
      [CompetencyTypeEnum.PROJECT_MANAGEMENT]: 'Project Management',
      [CompetencyTypeEnum.CRITICAL_THINKING]: 'Critical Thinking',
      [CompetencyTypeEnum.LEADERSHIP_COLLABORATION]:
        'Leadership & Collaboration',
      [CompetencyTypeEnum.INNOVATION_ADAPTABILITY]: 'Innovation & Adaptability',
    };

    return displayNames[this.getValue().value];
  }

  public getDescription(): string {
    const descriptions: Record<CompetencyTypeEnum, string> = {
      [CompetencyTypeEnum.BUSINESS_COMMUNICATION]:
        'Written, verbal, and presentation skills for effective workplace interaction',
      [CompetencyTypeEnum.DATA_ANALYSIS]:
        'Ability to collect, analyze, and interpret data to make informed decisions',
      [CompetencyTypeEnum.TECHNICAL_KNOWLEDGE]:
        'Domain-specific technical skills and technological proficiency',
      [CompetencyTypeEnum.PROJECT_MANAGEMENT]:
        'Planning, organizing, and managing resources to achieve specific goals',
      [CompetencyTypeEnum.CRITICAL_THINKING]:
        'Analytical thinking, problem-solving, and evidence-based reasoning',
      [CompetencyTypeEnum.LEADERSHIP_COLLABORATION]:
        'Leading teams, collaborating effectively, and influencing positive outcomes',
      [CompetencyTypeEnum.INNOVATION_ADAPTABILITY]:
        'Creative thinking, adaptability to change, and innovative problem-solving',
    };

    return descriptions[this.getValue().value];
  }
}
