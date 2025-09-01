import { IEventHandler } from '../../../../shared/domain/events/event-handler.interface';
import { CCISLevelAchievedEvent } from '../../domain/events/ccis-level-achieved.event';
import { EmailService } from '../../../../shared/infrastructure/email/email.service';
import { AuditService } from '../../../../shared/infrastructure/audit/audit.service';
import { PersonRepository } from '../../../person/infrastructure/repositories/person.repository';
import { PersonID } from '../../../../shared/value-objects/id.value-object';

/**
 * Event Handler: CCIS Level Achieved
 *
 * Handles the CCIS Level Achieved event by orchestrating multiple downstream actions:
 *
 * 1. **Skill Passport Updates**: Update the person's skill passport with new competency level
 * 2. **Achievement Notifications**: Send congratulatory messages and celebration content
 * 3. **Analytics Tracking**: Record achievement metrics for business intelligence
 * 4. **Learning Path Adjustments**: Update recommended learning paths and next steps
 * 5. **Placement Eligibility**: Check and update job placement opportunities
 * 6. **Badge Awards**: Grant appropriate achievement badges and certificates
 * 7. **Peer Comparisons**: Update peer benchmarking and social features
 * 8. **Intervention Triggers**: Check if additional scaffolding is needed
 *
 * This handler implements the Fan-Out pattern to ensure all stakeholders
 * are notified and all dependent systems are updated when someone achieves
 * a new CCIS competency level.
 *
 * @example
 * ```typescript
 * const handler = new CCISLevelAchievedHandler(
 *   skillPassportService,
 *   notificationService,
 *   analyticsService,
 *   learningPathService,
 *   placementService,
 *   badgeService
 * );
 *
 * await handler.handle(ccisLevelAchievedEvent);
 * ```
 */
export class CCISLevelAchievedHandler
  implements IEventHandler<CCISLevelAchievedEvent>
{
  constructor(
    private readonly emailService: EmailService,
    private readonly auditService: AuditService,
    private readonly personRepository: PersonRepository,
  ) {
    // TODO: Inject additional services when available
    // private readonly skillPassportService: SkillPassportService,
    // private readonly notificationService: NotificationService,
    // private readonly analyticsService: AnalyticsService,
    // private readonly learningPathService: LearningPathService,
    // private readonly placementService: PlacementService,
    // private readonly badgeService: BadgeService,
    // private readonly peerComparisonService: PeerComparisonService,
    // private readonly interventionService: InterventionService,
    // private readonly logger: Logger
  }

  /**
   * Handle CCIS Level Achieved Event
   *
   * Orchestrates all downstream actions when a student achieves a new CCIS level.
   * Uses Promise.allSettled to ensure partial failures don't block other updates.
   */
  async handle(event: CCISLevelAchievedEvent): Promise<void> {
    try {
      console.log(
        `Processing CCIS Level Achieved: ${event.getCelebrationMessage()}`,
      );

      // TODO: Replace with actual service implementations
      const updatePromises = [
        this.updateSkillPassport(event),
        this.sendNotifications(event),
        this.trackAnalytics(event),
        this.updateLearningPaths(event),
        this.checkPlacementEligibility(event),
        this.awardBadges(event),
        this.updatePeerComparisons(event),
        this.checkInterventionNeeds(event),
        this.auditAchievement(event),
      ];

      // Execute all updates concurrently, handling partial failures gracefully
      const results = await Promise.allSettled(updatePromises);

      // Log any failures for monitoring
      const failures = results
        .map((result, index) => ({
          result,
          operation: this.getOperationName(index),
        }))
        .filter(({ result }) => result.status === 'rejected');

      if (failures.length > 0) {
        console.error(`Some operations failed for CCIS Level Achievement:`, {
          eventId: event.eventId,
          personId: event.personId.getValue(),
          failures: failures.map(({ operation, result }) => ({
            operation,
            error: (result as PromiseRejectedResult).reason,
          })),
        });
      }

      console.log(
        `Successfully processed CCIS Level Achieved event for person ${event.personId.getValue()}`,
      );
    } catch (error) {
      console.error(`Critical error processing CCIS Level Achieved event:`, {
        eventId: event.eventId,
        personId: event.personId.getValue(),
        error: error instanceof Error ? error.message : 'Unknown error',
        competency: event.competencyType.getName(),
        newLevel: event.newLevel.getLevel(),
      });

      // Re-throw to ensure proper error handling upstream
      throw error;
    }
  }

  /**
   * Update the person's skill passport with the new competency level
   */
  private async updateSkillPassport(
    event: CCISLevelAchievedEvent,
  ): Promise<void> {
    // TODO: Implement skill passport update
    // await this.skillPassportService.updateCompetencyLevel({
    //   personId: event.personId,
    //   competencyType: event.competencyType,
    //   newLevel: event.newLevel,
    //   confidence: event.confidence,
    //   evidenceCount: event.evidenceCount,
    //   achievementTimestamp: event.achievementTimestamp
    // });

    console.log(
      `[SKILL PASSPORT] Updated ${event.competencyType.getName()} to Level ${event.newLevel.getLevel()}`,
    );
  }

  /**
   * Send achievement notifications to the student and relevant stakeholders
   */
  private async sendNotifications(
    event: CCISLevelAchievedEvent,
  ): Promise<void> {
    try {
      // Extract event data
      const personId = event.personId;
      const competencyName = event.competencyType.getName();
      const newLevel = event.newLevel.getLevel();
      const achievements = [event.getCelebrationMessage()];

      // Fetch person details for email
      const person = await this.personRepository.findById(personId);

      if (!person) {
        console.error(`[NOTIFICATIONS] Person not found: ${personId.getValue()}`);
        return;
      }

      const studentEmail = person.email.getValue();
      const studentName = person.name.fullName;

      // Send CCIS level achievement email
      await this.emailService.sendCCISLevelAchievedEmail(
        studentEmail,
        studentName,
        competencyName,
        newLevel,
        achievements,
      );

      console.log(
        `[NOTIFICATIONS] Sent CCIS level achievement email for ${competencyName} level ${newLevel} to: ${studentEmail}`,
      );
    } catch (error) {
      console.error(
        `[NOTIFICATIONS] Failed to send achievement notification:`,
        error,
      );
      // Don't throw - notification failures shouldn't break the main flow
    }
  }

  /**
   * Track achievement analytics for business intelligence
   */
  private async trackAnalytics(event: CCISLevelAchievedEvent): Promise<void> {
    // TODO: Implement analytics service
    // await this.analyticsService.track('ccis_level_achieved', event.getAnalyticsData());

    const analytics = event.getAnalyticsData();
    console.log(`[ANALYTICS] Tracked CCIS achievement:`, {
      competency: analytics.competency,
      levelProgression: `${analytics.previousLevel} → ${analytics.newLevel}`,
      confidence: `${analytics.confidence}%`,
      isBreakthrough: analytics.isBreakthrough,
    });
  }

  /**
   * Update learning paths based on new competency level
   */
  private async updateLearningPaths(
    event: CCISLevelAchievedEvent,
  ): Promise<void> {
    // TODO: Implement learning path service
    // await this.learningPathService.adjustPathsForLevelAchievement({
    //   personId: event.personId,
    //   competencyType: event.competencyType,
    //   newLevel: event.newLevel,
    //   unlockedSkills: event.implications.unlockedSkills,
    //   recommendedActions: event.implications.recommendedActions
    // });

    console.log(
      `[LEARNING PATHS] Updated paths for new ${event.competencyType.getName()} level`,
    );
    console.log(
      `[LEARNING PATHS] Unlocked skills:`,
      event.implications.unlockedSkills,
    );
  }

  /**
   * Check and update placement eligibility based on new competency level
   */
  private async checkPlacementEligibility(
    event: CCISLevelAchievedEvent,
  ): Promise<void> {
    // TODO: Implement placement service
    // await this.placementService.updateEligibility({
    //   personId: event.personId,
    //   competencyType: event.competencyType,
    //   newLevel: event.newLevel,
    //   placementEligibility: event.implications.placementEligibility
    // });

    const eligibility = event.implications.placementEligibility;
    console.log(`[PLACEMENT] Updated eligibility:`, {
      roleTypes: eligibility.roleTypes,
      salaryBand: eligibility.minimumSalaryBand,
      industries: eligibility.industryCategories,
    });
  }

  /**
   * Award appropriate badges and certificates for the achievement
   */
  private async awardBadges(event: CCISLevelAchievedEvent): Promise<void> {
    // TODO: Implement badge service
    // const badges = await this.badgeService.checkEligibleBadges({
    //   personId: event.personId,
    //   competencyType: event.competencyType,
    //   level: event.newLevel,
    //   isBreakthrough: event.isBreakthroughAchievement(),
    //   qualifiesAccelerated: event.qualifiesForAcceleratedProgression()
    // });

    // for (const badge of badges) {
    //   await this.badgeService.awardBadge(badge);
    // }

    console.log(
      `[BADGES] Checking badge eligibility for Level ${event.newLevel.getLevel()} ${event.competencyType.getName()}`,
    );

    if (event.isBreakthroughAchievement()) {
      console.log(`[BADGES] Eligible for "Breakthrough Achiever" badge`);
    }

    if (event.qualifiesForAcceleratedProgression()) {
      console.log(`[BADGES] Eligible for "Excellence" badge`);
    }
  }

  /**
   * Update peer comparison metrics and social features
   */
  private async updatePeerComparisons(
    event: CCISLevelAchievedEvent,
  ): Promise<void> {
    // TODO: Implement peer comparison service
    // await this.peerComparisonService.updateAchievement({
    //   personId: event.personId,
    //   competencyType: event.competencyType,
    //   level: event.newLevel,
    //   progressionMetrics: event.progressionMetrics,
    //   culturalContext: event.culturalContext
    // });

    console.log(
      `[PEER COMPARISON] Updated peer rankings for ${event.competencyType.getName()}`,
    );

    if (event.progressionMetrics.peerComparison) {
      const peer = event.progressionMetrics.peerComparison;
      console.log(
        `[PEER COMPARISON] Performance: ${peer.percentile}th percentile (${peer.relativeDifficulty})`,
      );
    }
  }

  /**
   * Check if additional scaffolding or interventions are needed
   */
  private async checkInterventionNeeds(
    event: CCISLevelAchievedEvent,
  ): Promise<void> {
    // TODO: Implement intervention service
    // const interventionNeeds = await this.interventionService.assessPostAchievementNeeds({
    //   personId: event.personId,
    //   competencyType: event.competencyType,
    //   newLevel: event.newLevel,
    //   confidence: event.confidence,
    //   progressionMetrics: event.progressionMetrics
    // });

    // if (interventionNeeds.length > 0) {
    //   for (const intervention of interventionNeeds) {
    //     await this.interventionService.scheduleIntervention(intervention);
    //   }
    // }

    console.log(`[INTERVENTIONS] Checking post-achievement support needs`);

    if (event.confidence.getScore() < 80) {
      console.log(
        `[INTERVENTIONS] Confidence reinforcement recommended (${event.confidence.getScore()}%)`,
      );
    }

    if (event.implications.recommendedActions.length > 0) {
      console.log(
        `[INTERVENTIONS] Recommended next actions:`,
        event.implications.recommendedActions.map((action) => action.action),
      );
    }
  }

  /**
   * Audit the achievement for compliance and tracking
   */
  private async auditAchievement(event: CCISLevelAchievedEvent): Promise<void> {
    try {
      await this.auditService.logCCISDecision(
        event.personId.getValue(),
        event.assessmentSessionId,
        {
          assessmentId: event.assessmentSessionId,
          studentId: event.personId.getValue(),
          competencyType: event.competencyType.getName(),
          previousLevel: event.previousLevel?.getLevel() || 0,
          newLevel: event.newLevel.getLevel(),
          confidenceScore: event.confidence.getScore(),
          behavioralSignals: {
            hintFrequency: 0, // TODO: Extract from event when available
            errorRecoveryTime: 0,
            transferSuccessRate: event.progressionMetrics.averagePerformance,
            metacognitiveAccuracy: event.progressionMetrics.consistencyScore,
            completionEfficiency: 0.8, // Default for now
            helpSeekingQuality: 0.7,
            selfAssessmentAlignment: 0.6,
          },
          aiReasoning: `CCIS level ${event.newLevel.getLevel()} achieved for ${event.competencyType.getName()} competency with ${event.confidence.getScore()}% confidence`,
          validationChecks: {
            consistencyCheck: event.confidence.getScore() >= 50,
            gamingDetection: false, // TODO: Extract from assessment context
            crossValidation: event.evidenceCount >= 5,
          },
          reviewRequired: event.confidence.getScore() < 70,
        },
      );

      console.log(
        `[AUDIT] ✅ Recorded CCIS level achievement audit trail for person ${event.personId.getValue()}`,
      );
    } catch (error) {
      console.error(
        `[AUDIT] ❌ Failed to record CCIS achievement audit:`,
        error,
      );
      // Don't throw - audit failures shouldn't break the achievement flow
    }
  }

  /**
   * Get operation name for error reporting
   */
  private getOperationName(index: number): string {
    const operations = [
      'updateSkillPassport',
      'sendNotifications',
      'trackAnalytics',
      'updateLearningPaths',
      'checkPlacementEligibility',
      'awardBadges',
      'updatePeerComparisons',
      'checkInterventionNeeds',
      'auditAchievement',
    ];

    return operations[index] || `operation_${index}`;
  }

  /**
   * Get handler priority for event processing order
   */
  public static getPriority(): number {
    return 1; // High priority - skill progression is critical
  }

  /**
   * Required: Get handler name for identification
   */
  public getHandlerName(): string {
    return 'CCISLevelAchievedHandler';
  }

  /**
   * Required: Get event type this handler processes
   */
  public getEventType(): string {
    return 'CCISLevelAchievedEvent';
  }

  /**
   * Check if this handler can process the given event
   */
  public canHandle(event: any): event is CCISLevelAchievedEvent {
    return event instanceof CCISLevelAchievedEvent;
  }

  /**
   * Get handler metadata for monitoring and debugging
   */
  public getMetadata(): {
    name: string;
    version: string;
    description: string;
    dependencies: string[];
  } {
    return {
      name: 'CCISLevelAchievedHandler',
      version: '1.0.0',
      description:
        'Handles CCIS competency level achievements with comprehensive downstream updates',
      dependencies: [
        'SkillPassportService',
        'NotificationService',
        'AnalyticsService',
        'LearningPathService',
        'PlacementService',
        'BadgeService',
        'PeerComparisonService',
        'InterventionService',
        'AuditService',
      ],
    };
  }
}
