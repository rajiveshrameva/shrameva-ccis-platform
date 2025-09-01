import { PersonID } from '../../../../shared/value-objects/id.value-object';
import { CompetencyType } from '../../domain/value-objects/competency-type.value-object';
import { CCISLevel } from '../../domain/value-objects/ccis-level.value-object';

/**
 * Query: Get CCIS Progress
 *
 * Retrieves comprehensive CCIS (Confidence-Competence Independence Scale)
 * progress data for a person across all competencies, providing detailed
 * insights into learning progress, competency development, and areas
 * requiring intervention.
 *
 * This query serves as the primary interface for progress tracking,
 * analytics generation, and educational decision-making within the
 * Shrameva CCIS platform. It aggregates data from multiple assessment
 * sessions to provide a holistic view of learner development.
 *
 * Key Features:
 * 1. **Comprehensive Progress Analysis**: All 7 competencies tracked
 * 2. **Temporal Progression**: Progress over time with trend analysis
 * 3. **Intervention Identification**: Areas requiring support
 * 4. **Confidence Tracking**: Assessment reliability metrics
 * 5. **Gaming Detection History**: Behavioral integrity analysis
 * 6. **Cultural Context**: Culturally adapted progress interpretation
 * 7. **Comparative Analytics**: Peer comparison and benchmarking
 * 8. **Predictive Insights**: Future performance projections
 *
 * Progress Dimensions:
 * - Current CCIS levels (1-4) for each competency
 * - Confidence scores for assessment reliability
 * - Learning velocity and acceleration metrics
 * - Intervention history and effectiveness
 * - Behavioral pattern consistency
 * - Gaming incidents and resolution
 * - Scaffolding adjustments and outcomes
 *
 * @example
 * ```typescript
 * const query = new GetCCISProgressQuery({
 *   personId: PersonID.fromString('person-123'),
 *   competencyFilter: [CompetencyType.COMMUNICATION, CompetencyType.PROBLEM_SOLVING],
 *   timeRange: {
 *     startDate: new Date('2025-01-01'),
 *     endDate: new Date('2025-08-31')
 *   },
 *   includeDetailedHistory: true,
 *   includePredictiveAnalytics: true
 * });
 *
 * const progress = await handler.handle(query);
 * ```
 */
export class GetCCISProgressQuery {
  public readonly personId: PersonID;
  public readonly competencyFilter: CompetencyType[];
  public readonly timeRange: TimeRange;
  public readonly analysisOptions: AnalysisOptions;
  public readonly outputFormat: OutputFormat;
  public readonly queryMetadata: QueryMetadata;

  constructor(params: GetCCISProgressQueryParams) {
    // Validate required parameters
    this.validateRequiredParams(params);

    // Core query parameters
    this.personId = params.personId;
    this.competencyFilter =
      params.competencyFilter || this.getAllCompetencies();
    this.timeRange = params.timeRange || this.getDefaultTimeRange();

    // Analysis configuration
    this.analysisOptions = {
      includeDetailedHistory: params.includeDetailedHistory ?? true,
      includePredictiveAnalytics: params.includePredictiveAnalytics ?? false,
      includeComparativeAnalytics: params.includeComparativeAnalytics ?? false,
      includeBehavioralPatterns: params.includeBehavioralPatterns ?? true,
      includeInterventionHistory: params.includeInterventionHistory ?? true,
      includeGamingDetectionData: params.includeGamingDetectionData ?? false,
      includeCulturalContext: params.includeCulturalContext ?? true,
      granularity: params.granularity || 'detailed',
      confidenceThreshold: params.confidenceThreshold || 0.7,
    };

    // Output configuration
    this.outputFormat = {
      format: params.format || 'comprehensive',
      visualization: params.includeVisualization ?? false,
      exportFormat: params.exportFormat || 'json',
      aggregationLevel: params.aggregationLevel || 'competency',
      includeRawData: params.includeRawData ?? false,
    };

    // Query metadata
    this.queryMetadata = {
      queryId: this.generateQueryId(),
      requestedAt: new Date(),
      requestSource: params.requestSource || 'direct',
      priority: params.priority || 'normal',
      cachePolicy: params.cachePolicy || 'smart',
      version: '1.0.0',
      correlationId: params.correlationId,
    };

    // Post-construction validation
    this.validateQueryConfiguration();
  }

  /**
   * Validate required query parameters
   */
  private validateRequiredParams(params: GetCCISProgressQueryParams): void {
    if (!params.personId) {
      throw new Error('PersonID is required for CCIS progress query');
    }

    if (params.competencyFilter && params.competencyFilter.length === 0) {
      throw new Error('Competency filter cannot be empty when provided');
    }

    if (params.timeRange) {
      if (!params.timeRange.startDate || !params.timeRange.endDate) {
        throw new Error(
          'Both start and end dates are required when timeRange is provided',
        );
      }

      if (params.timeRange.endDate <= params.timeRange.startDate) {
        throw new Error('End date must be after start date');
      }

      // Validate reasonable time range (not too long for performance)
      const daysDiff =
        (params.timeRange.endDate.getTime() -
          params.timeRange.startDate.getTime()) /
        (1000 * 60 * 60 * 24);
      if (daysDiff > 730) {
        // 2 years
        throw new Error(
          'Time range cannot exceed 2 years for performance reasons',
        );
      }
    }

    if (
      params.confidenceThreshold &&
      (params.confidenceThreshold < 0 || params.confidenceThreshold > 1)
    ) {
      throw new Error('Confidence threshold must be between 0 and 1');
    }
  }

  /**
   * Get all available competencies
   */
  private getAllCompetencies(): CompetencyType[] {
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
   * Get default time range (last 6 months)
   */
  private getDefaultTimeRange(): TimeRange {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    return {
      startDate,
      endDate,
      granularity: 'weekly',
    };
  }

  /**
   * Validate the complete query configuration
   */
  private validateQueryConfiguration(): void {
    // Validate competency filter consistency
    if (this.competencyFilter.length > 7) {
      throw new Error('Cannot filter for more than 7 competencies');
    }

    // Validate analysis options compatibility
    if (
      this.analysisOptions.includePredictiveAnalytics &&
      this.timeRange.startDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ) {
      console.warn(
        'Predictive analytics may be less accurate with less than 30 days of data',
      );
    }

    // Validate output format consistency
    if (
      this.outputFormat.includeRawData &&
      this.outputFormat.format === 'summary'
    ) {
      throw new Error('Cannot include raw data with summary format');
    }

    if (
      this.outputFormat.visualization &&
      this.outputFormat.exportFormat === 'json'
    ) {
      console.warn(
        'Visualization requested but export format is JSON - visualization data will be included as metadata',
      );
    }

    // Validate performance considerations
    if (
      this.analysisOptions.granularity === 'detailed' &&
      this.getTimeRangeDays() > 365
    ) {
      console.warn(
        'Detailed granularity with large time range may impact performance',
      );
    }
  }

  /**
   * Calculate time range in days
   */
  private getTimeRangeDays(): number {
    return (
      (this.timeRange.endDate.getTime() - this.timeRange.startDate.getTime()) /
      (1000 * 60 * 60 * 24)
    );
  }

  /**
   * Generate unique query identifier
   */
  private generateQueryId(): string {
    return `ccis-progress-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if this query requests predictive analytics
   */
  public requiresPredictiveAnalytics(): boolean {
    return this.analysisOptions.includePredictiveAnalytics;
  }

  /**
   * Check if this query requests comparative analytics
   */
  public requiresComparativeAnalytics(): boolean {
    return this.analysisOptions.includeComparativeAnalytics;
  }

  /**
   * Check if this query includes sensitive data
   */
  public includesSensitiveData(): boolean {
    return (
      this.analysisOptions.includeGamingDetectionData ||
      this.analysisOptions.includeInterventionHistory ||
      this.outputFormat.includeRawData
    );
  }

  /**
   * Get expected data volume for performance optimization
   */
  public getExpectedDataVolume(): 'low' | 'medium' | 'high' | 'very_high' {
    let score = 0;

    // Time range factor
    const days = this.getTimeRangeDays();
    if (days > 365) score += 3;
    else if (days > 90) score += 2;
    else if (days > 30) score += 1;

    // Competency count factor
    score += Math.min(this.competencyFilter.length / 7, 1) * 2;

    // Analysis options factor
    if (this.analysisOptions.includeDetailedHistory) score += 1;
    if (this.analysisOptions.includePredictiveAnalytics) score += 2;
    if (this.analysisOptions.includeComparativeAnalytics) score += 2;
    if (this.outputFormat.includeRawData) score += 3;

    // Granularity factor
    if (this.analysisOptions.granularity === 'detailed') score += 2;
    else if (this.analysisOptions.granularity === 'standard') score += 1;

    if (score >= 8) return 'very_high';
    if (score >= 6) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }

  /**
   * Get cache key for performance optimization
   */
  public getCacheKey(): string {
    const keyComponents = [
      this.personId.getValue(),
      this.competencyFilter
        .map((c) => c.getName())
        .sort()
        .join(','),
      this.timeRange.startDate.toISOString().split('T')[0],
      this.timeRange.endDate.toISOString().split('T')[0],
      this.analysisOptions.granularity,
      this.outputFormat.format,
      this.analysisOptions.confidenceThreshold.toString(),
    ];

    return `ccis-progress:${keyComponents.join(':')}`;
  }

  /**
   * Get query complexity score for resource allocation
   */
  public getComplexityScore(): number {
    let complexity = 0;

    // Base complexity from competency count
    complexity += this.competencyFilter.length * 0.1;

    // Time range complexity
    complexity += Math.min(this.getTimeRangeDays() / 365, 1) * 0.3;

    // Analysis options complexity
    if (this.analysisOptions.includeDetailedHistory) complexity += 0.2;
    if (this.analysisOptions.includePredictiveAnalytics) complexity += 0.4;
    if (this.analysisOptions.includeComparativeAnalytics) complexity += 0.3;
    if (this.analysisOptions.includeBehavioralPatterns) complexity += 0.1;
    if (this.analysisOptions.includeInterventionHistory) complexity += 0.2;

    // Granularity complexity
    const granularityComplexity = {
      summary: 0.1,
      standard: 0.3,
      detailed: 0.5,
    };
    complexity +=
      granularityComplexity[this.analysisOptions.granularity] || 0.3;

    return Math.min(complexity, 1.0);
  }

  /**
   * Get expected query execution time estimate
   */
  public getEstimatedExecutionTime(): number {
    const baseTime = 200; // 200ms base
    const complexityMultiplier = 1 + this.getComplexityScore() * 4; // Up to 5x for complex queries
    const volumeMultiplier = {
      low: 1,
      medium: 2,
      high: 4,
      very_high: 8,
    }[this.getExpectedDataVolume()];

    return Math.round(baseTime * complexityMultiplier * volumeMultiplier);
  }

  /**
   * Get query optimization hints
   */
  public getOptimizationHints(): QueryOptimizationHint[] {
    const hints: QueryOptimizationHint[] = [];

    if (this.getTimeRangeDays() > 365) {
      hints.push({
        type: 'time_range_optimization',
        description: 'Consider reducing time range for better performance',
        impact: 'high',
        suggestion: 'Use pagination or reduce to last 12 months',
      });
    }

    if (
      this.competencyFilter.length === 7 &&
      this.analysisOptions.granularity === 'detailed'
    ) {
      hints.push({
        type: 'granularity_optimization',
        description: 'Detailed analysis of all competencies may be slow',
        impact: 'medium',
        suggestion:
          'Consider standard granularity or filter specific competencies',
      });
    }

    if (
      this.analysisOptions.includePredictiveAnalytics &&
      this.analysisOptions.includeComparativeAnalytics
    ) {
      hints.push({
        type: 'analytics_optimization',
        description: 'Multiple analytics types increase computation time',
        impact: 'medium',
        suggestion: 'Request analytics separately for faster initial results',
      });
    }

    if (this.outputFormat.includeRawData) {
      hints.push({
        type: 'data_volume_optimization',
        description: 'Raw data inclusion significantly increases response size',
        impact: 'high',
        suggestion: 'Request raw data separately or use pagination',
      });
    }

    return hints;
  }

  /**
   * Get expected result structure for response planning
   */
  public getExpectedResultStructure(): ResultStructure {
    return {
      personSummary: {
        personId: this.personId.getValue(),
        totalAssessments: 'number',
        dateRange: `${this.timeRange.startDate.toISOString()} - ${this.timeRange.endDate.toISOString()}`,
        competenciesAnalyzed: this.competencyFilter.length,
      },
      competencyProgress: this.competencyFilter.map((competency) => ({
        competency: competency.getName(),
        currentLevel: 'CCISLevel (1-4)',
        confidence: 'number (0-1)',
        progressTrend: 'improving | stable | declining',
        lastAssessment: 'Date',
        interventionsReceived: 'number',
      })),
      analytics: {
        includesPredictive: this.analysisOptions.includePredictiveAnalytics,
        includesComparative: this.analysisOptions.includeComparativeAnalytics,
        includesBehavioral: this.analysisOptions.includeBehavioralPatterns,
        granularity: this.analysisOptions.granularity,
      },
      metadata: {
        queryId: this.queryMetadata.queryId,
        executionTime: 'number (ms)',
        cacheHit: 'boolean',
        dataFreshness: 'Date',
      },
    };
  }

  /**
   * Convert query to JSON for logging and audit
   */
  public toJSON(): Record<string, any> {
    return {
      queryId: this.queryMetadata.queryId,
      personId: this.personId.getValue(),
      competencyFilter: this.competencyFilter.map((c) => c.getName()),
      timeRange: {
        startDate: this.timeRange.startDate.toISOString(),
        endDate: this.timeRange.endDate.toISOString(),
        granularity: this.timeRange.granularity,
        days: this.getTimeRangeDays(),
      },
      analysisOptions: this.analysisOptions,
      outputFormat: this.outputFormat,
      performanceMetrics: {
        complexityScore: this.getComplexityScore(),
        expectedDataVolume: this.getExpectedDataVolume(),
        estimatedExecutionTime: this.getEstimatedExecutionTime(),
        cacheKey: this.getCacheKey(),
      },
      optimizationHints: this.getOptimizationHints(),
      expectedResultStructure: this.getExpectedResultStructure(),
      metadata: {
        ...this.queryMetadata,
        requestedAt: this.queryMetadata.requestedAt.toISOString(),
      },
    };
  }
}

// Supporting types and interfaces

export interface TimeRange {
  startDate: Date;
  endDate: Date;
  granularity?: 'daily' | 'weekly' | 'monthly';
}

export interface AnalysisOptions {
  includeDetailedHistory: boolean;
  includePredictiveAnalytics: boolean;
  includeComparativeAnalytics: boolean;
  includeBehavioralPatterns: boolean;
  includeInterventionHistory: boolean;
  includeGamingDetectionData: boolean;
  includeCulturalContext: boolean;
  granularity: 'summary' | 'standard' | 'detailed';
  confidenceThreshold: number;
}

export interface OutputFormat {
  format: 'summary' | 'standard' | 'comprehensive' | 'custom';
  visualization: boolean;
  exportFormat: 'json' | 'csv' | 'pdf' | 'xlsx';
  aggregationLevel: 'overall' | 'competency' | 'session' | 'task';
  includeRawData: boolean;
}

export interface QueryMetadata {
  queryId: string;
  requestedAt: Date;
  requestSource: 'direct' | 'dashboard' | 'api' | 'scheduled' | 'analytics';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  cachePolicy: 'none' | 'smart' | 'aggressive' | 'long_term';
  version: string;
  correlationId?: string;
}

export interface QueryOptimizationHint {
  type:
    | 'time_range_optimization'
    | 'granularity_optimization'
    | 'analytics_optimization'
    | 'data_volume_optimization';
  description: string;
  impact: 'low' | 'medium' | 'high';
  suggestion: string;
}

export interface ResultStructure {
  personSummary: {
    personId: string;
    totalAssessments: string;
    dateRange: string;
    competenciesAnalyzed: number;
  };
  competencyProgress: Array<{
    competency: string;
    currentLevel: string;
    confidence: string;
    progressTrend: string;
    lastAssessment: string;
    interventionsReceived: string;
  }>;
  analytics: {
    includesPredictive: boolean;
    includesComparative: boolean;
    includesBehavioral: boolean;
    granularity: string;
  };
  metadata: {
    queryId: string;
    executionTime: string;
    cacheHit: string;
    dataFreshness: string;
  };
}

export interface GetCCISProgressQueryParams {
  personId: PersonID;
  competencyFilter?: CompetencyType[];
  timeRange?: TimeRange;
  includeDetailedHistory?: boolean;
  includePredictiveAnalytics?: boolean;
  includeComparativeAnalytics?: boolean;
  includeBehavioralPatterns?: boolean;
  includeInterventionHistory?: boolean;
  includeGamingDetectionData?: boolean;
  includeCulturalContext?: boolean;
  granularity?: 'summary' | 'standard' | 'detailed';
  confidenceThreshold?: number;
  format?: 'summary' | 'standard' | 'comprehensive' | 'custom';
  includeVisualization?: boolean;
  exportFormat?: 'json' | 'csv' | 'pdf' | 'xlsx';
  aggregationLevel?: 'overall' | 'competency' | 'session' | 'task';
  includeRawData?: boolean;
  requestSource?: 'direct' | 'dashboard' | 'api' | 'scheduled' | 'analytics';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  cachePolicy?: 'none' | 'smart' | 'aggressive' | 'long_term';
  correlationId?: string;
}
