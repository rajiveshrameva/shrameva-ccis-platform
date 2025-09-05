import { Injectable, Logger } from '@nestjs/common';
import { IEventHandler } from '../../../../shared/domain/events/event-handler.interface';
import { PersonCreatedEvent } from '../../domain/events/person-created.event';
import { EmailService } from '../../../../shared/infrastructure/email/email.service';
import { AuditService } from '../../../../shared/infrastructure/audit/audit.service';

/**
 * Person Created Event Handler
 *
 * Handles the PersonCreatedEvent and orchestrates all necessary side effects
 * when a new person is created in the system.
 *
 * Key Responsibilities:
 * - Send welcome email to new person
 * - Initialize user profile settings
 * - Create audit log entry
 * - Trigger onboarding workflow
 * - Notify relevant stakeholders (if applicable)
 * - Initialize privacy settings to default values
 * - Set up initial skill passport framework
 *
 * Integration Points:
 * - Email service for welcome communications
 * - Audit service for compliance tracking
 * - Notification service for stakeholder alerts
 * - Onboarding service for guided setup
 * - Analytics service for user acquisition metrics
 */
@Injectable()
export class PersonCreatedHandler implements IEventHandler<PersonCreatedEvent> {
  private readonly logger = new Logger(PersonCreatedHandler.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly auditService: AuditService,
  ) {
    // TODO: Inject additional services when implementing infrastructure
    // private readonly notificationService: NotificationService,
    // private readonly onboardingService: OnboardingService,
    // private readonly analyticsService: AnalyticsService,
  }

  /**
   * Gets the human-readable name of this handler
   */
  getHandlerName(): string {
    return 'PersonCreatedHandler';
  }

  /**
   * Gets the event type this handler processes
   */
  getEventType(): string {
    return 'PersonCreated';
  }

  /**
   * Handle PersonCreatedEvent
   *
   * Processes the person creation event and triggers all necessary
   * downstream operations for successful onboarding.
   *
   * @param event - The PersonCreatedEvent containing person details
   */
  async handle(event: PersonCreatedEvent): Promise<void> {
    const eventData = event.getEventData();
    this.logger.log(
      `Handling PersonCreatedEvent for person: ${eventData.personId}`,
    );

    try {
      // 1. Send welcome email
      await this.sendWelcomeEmail(event);

      // 2. Initialize user profile settings
      await this.initializeProfileSettings(event);

      // 3. Create audit log for compliance
      await this.createAuditLogEntry(event);

      // 4. Trigger onboarding workflow
      await this.triggerOnboardingWorkflow(event);

      // 5. Initialize CCIS skill passport framework
      await this.initializeSkillPassportFramework(event);

      // 6. Record analytics for user acquisition tracking
      await this.recordUserAcquisitionMetrics(event);

      // 7. Notify institutional stakeholders (for organizational accounts)
      if (eventData.countryCode && this.isInstitutionalAccount(event)) {
        await this.notifyInstitutionalStakeholders(event);
      }

      this.logger.log(
        `Successfully processed PersonCreatedEvent for person: ${eventData.personId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process PersonCreatedEvent for person: ${eventData.personId}`,
        error,
      );
      // Note: In production, implement dead letter queue or retry mechanism
      throw error;
    }
  }

  /**
   * Sends a personalized welcome email to the newly registered person
   */
  private async sendWelcomeEmail(event: PersonCreatedEvent): Promise<void> {
    const eventData = event.getEventData();
    this.logger.debug(`Sending welcome email to: ${eventData.email}`);

    try {
      // TODO: Implement EmailService integration
      // await this.emailService.sendWelcomeEmail(
      //   eventData.email,
      //   eventData.name,
      //   {
      //     country: eventData.countryCode === 'AE' ? 'UAE' : 'India',
      //     // Add localization context based on country
      //   },
      // );

      this.logger.log(
        `✅ Welcome onboarding email sent successfully to: ${eventData.email}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to send welcome email to ${eventData.email}:`,
        error.stack,
      );
      // Don't throw - email failure shouldn't break person creation
    }
  }

  /**
   * Initialize default profile settings for new person
   */
  private async initializeProfileSettings(
    event: PersonCreatedEvent,
  ): Promise<void> {
    const eventData = event.getEventData();
    this.logger.debug(
      `Initializing profile settings for person: ${eventData.personId}`,
    );

    // TODO: Implement profile settings initialization
    // const defaultSettings = {
    //   privacy: {
    //     profileVisibility: 'PRIVATE',
    //     skillPassportSharing: 'RESTRICTED',
    //     contactInfoSharing: 'PRIVATE',
    //     allowInstitutionalAccess: this.isInstitutionalAccount(event)
    //   },
    //   notifications: {
    //     emailNotifications: true,
    //     skillProgressUpdates: true,
    //     assessmentReminders: true,
    //     placementOpportunities: true
    //   },
    //   preferences: {
    //     language: eventData.preferredLanguage || 'en_IN',
    //     timezone: eventData.countryCode === 'UAE' ? 'Asia/Dubai' : 'Asia/Kolkata',
    //     country: eventData.countryCode || 'INDIA'
    //   }
    // };
    //
    // await this.profileSettingsService.initialize(eventData.personId, defaultSettings);

    this.logger.debug(
      `Profile settings initialized for person: ${eventData.personId}`,
    );
  }

  /**
   * Create audit log entry for person creation
   */
  private async createAuditLogEntry(event: PersonCreatedEvent): Promise<void> {
    const eventData = event.getEventData();
    this.logger.debug(
      `Creating audit log for person creation: ${eventData.personId}`,
    );

    try {
      await this.auditService.logStudentRegistration(eventData.personId, {
        email: eventData.email,
        college: 'To Be Updated', // Will be updated when student information is collected
        graduationYear: new Date().getFullYear() + 4, // Default to 4 years from now
        referralSource: 'direct_registration',
      });

      this.logger.log(`Audit log created for person: ${eventData.personId}`);
    } catch (error) {
      this.logger.error(
        `Failed to create audit log for person: ${eventData.personId}`,
        error,
      );
      // Don't throw - audit failures shouldn't break person creation
    }
  }

  /**
   * Trigger onboarding workflow for new person
   */
  private async triggerOnboardingWorkflow(
    event: PersonCreatedEvent,
  ): Promise<void> {
    const eventData = event.getEventData();
    this.logger.debug(
      `Triggering onboarding workflow for person: ${eventData.personId}`,
    );

    // TODO: Implement onboarding service integration
    // const onboardingFlow = this.isInstitutionalAccount(event)
    //   ? 'INSTITUTIONAL_STUDENT'
    //   : 'INDIVIDUAL_PROFESSIONAL';
    //
    // await this.onboardingService.start({
    //   personId: event.payload.personId,
    //   flowType: onboardingFlow,
    //   personalizedSteps: {
    //     skillAssessment: true,
    //     kycVerification: true,
    //     institutionalBinding: this.isInstitutionalAccount(event),
    //     careerGoalSetting: true,
    //     profileCompletion: true
    //   },
    //   expectedDuration: this.isInstitutionalAccount(event) ? '7_DAYS' : '3_DAYS'
    // });

    this.logger.debug(
      `Onboarding workflow triggered for person: ${eventData.personId}`,
    );
  }

  /**
   * Initialize skill passport framework structure
   */
  private async initializeSkillPassportFramework(
    event: PersonCreatedEvent,
  ): Promise<void> {
    const eventData = event.getEventData();
    this.logger.debug(
      `Initializing skill passport framework for person: ${eventData.personId}`,
    );

    // TODO: Implement skill passport service integration
    // await this.skillPassportService.initializeFramework({
    //   personId: eventData.personId,
    //   initialCompetencies: [
    //     'COMMUNICATION',
    //     'PROBLEM_SOLVING',
    //     'TEAMWORK',
    //     'ADAPTABILITY',
    //     'TIME_MANAGEMENT',
    //     'TECHNICAL_SKILLS',
    //     'LEADERSHIP'
    //   ],
    //   assessmentSchedule: 'ON_DEMAND', // vs 'SCHEDULED'
    //   evidenceRequirements: this.isInstitutionalAccount(event) ? 'STRICT' : 'FLEXIBLE'
    // });

    this.logger.debug(
      `Skill passport framework initialized for person: ${eventData.personId}`,
    );
  }

  /**
   * Record user acquisition and engagement metrics
   */
  private async recordUserAcquisitionMetrics(
    event: PersonCreatedEvent,
  ): Promise<void> {
    const eventData = event.getEventData();
    this.logger.debug(
      `Recording analytics for new person: ${eventData.personId}`,
    );

    // TODO: Implement analytics service integration
    // await this.analyticsService.track('user_registered', {
    //   userId: eventData.personId,
    //   email: eventData.email,
    //   country: eventData.countryCode || 'INDIA',
    //   registrationSource: 'DIRECT',
    //   isInstitutional: this.isInstitutionalAccount(event),
    //   preferredLanguage: eventData.preferredLanguage,
    //   timestamp: event.occurredAt
    // });

    this.logger.debug(`Analytics recorded for person: ${eventData.personId}`);
  }

  /**
   * Notify institutional stakeholders of new student registration
   */
  private async notifyInstitutionalStakeholders(
    event: PersonCreatedEvent,
  ): Promise<void> {
    const eventData = event.getEventData();
    this.logger.debug(
      `Notifying institutional stakeholders for person: ${eventData.personId}`,
    );

    // TODO: Implement institutional notification service
    // await this.notificationService.notifyInstitution({
    //   eventType: 'NEW_STUDENT_REGISTRATION',
    //   studentId: eventData.personId,
    //   studentEmail: eventData.email,
    //   studentName: eventData.name,
    //   registrationTimestamp: event.occurredAt,
    //   requiresApproval: false
    // });

    this.logger.debug(
      `Institutional stakeholders notified for person: ${eventData.personId}`,
    );
  }

  /**
   * Determines if this is an institutional account based on event data
   */
  private isInstitutionalAccount(event: PersonCreatedEvent): boolean {
    // TODO: Implement institutional account detection logic
    // This could be based on email domain, registration source, or explicit flags
    const eventData = event.getEventData();
    const emailDomain = eventData.email.split('@')[1];
    const institutionalDomains = [
      'student.edu',
      'university.edu',
      'college.edu',
    ];

    return institutionalDomains.some((domain) => emailDomain.endsWith(domain));
  }
}
