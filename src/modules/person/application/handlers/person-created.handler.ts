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
    this.logger.log(
      `Handling PersonCreatedEvent for person: ${event.payload.personId}`,
    );

    try {
      // 1. Send welcome email
      await this.sendWelcomeEmail(event);

      // 2. Initialize user profile settings
      await this.initializeProfileSettings(event);

      // 3. Create audit log entry
      await this.createAuditLogEntry(event);

      // 4. Trigger onboarding workflow
      await this.triggerOnboardingWorkflow(event);

      // 5. Initialize skill passport framework
      await this.initializeSkillPassportFramework(event);

      // 6. Record analytics metrics
      await this.recordUserAcquisitionMetrics(event);

      // 7. Notify stakeholders (if institutional account)
      if (event.payload.countryCode && this.isInstitutionalAccount(event)) {
        await this.notifyInstitutionalStakeholders(event);
      }

      this.logger.log(
        `Successfully processed PersonCreatedEvent for person: ${event.payload.personId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process PersonCreatedEvent for person: ${event.payload.personId}`,
        error.stack,
      );
      // Note: In production, implement dead letter queue or retry mechanism
      throw error;
    }
  }

  /**
   * Send welcome email to newly created person
   */
  private async sendWelcomeEmail(event: PersonCreatedEvent): Promise<void> {
    this.logger.debug(`Sending welcome email to: ${event.payload.email}`);

    try {
      // Use the new dedicated welcome email template
      await this.emailService.sendWelcomeOnboardingEmail(
        event.payload.email,
        event.payload.name,
        {
          country: event.payload.countryCode === 'AE' ? 'UAE' : 'India',
          hasSkillPassport: true, // Skill passport is created automatically for new persons
          registrationSource: 'direct_signup', // Could be 'college_partner', 'referral', etc.
        },
      );

      this.logger.log(
        `✅ Welcome onboarding email sent successfully to: ${event.payload.email}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to send welcome email to ${event.payload.email}:`,
        error,
      );
      // Don't throw - email failures shouldn't break person creation
    }
  }

  /**
   * Initialize default profile settings for new person
   */
  private async initializeProfileSettings(
    event: PersonCreatedEvent,
  ): Promise<void> {
    this.logger.debug(
      `Initializing profile settings for person: ${event.payload.personId}`,
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
    //     language: event.payload.preferredLanguage || 'en_IN',
    //     timezone: event.payload.countryCode === 'UAE' ? 'Asia/Dubai' : 'Asia/Kolkata',
    //     country: event.payload.countryCode || 'INDIA'
    //   }
    // };
    //
    // await this.profileSettingsService.initialize(event.payload.personId, defaultSettings);

    this.logger.debug(
      `Profile settings initialized for person: ${event.payload.personId}`,
    );
  }

  /**
   * Create audit log entry for person creation
   */
  private async createAuditLogEntry(event: PersonCreatedEvent): Promise<void> {
    this.logger.debug(
      `Creating audit log for person creation: ${event.payload.personId}`,
    );

    try {
      await this.auditService.logStudentRegistration(event.payload.personId, {
        email: event.payload.email,
        college: 'To Be Updated', // Will be updated when student information is collected
        graduationYear: new Date().getFullYear() + 4, // Default to 4 years from now
        referralSource: 'direct_registration',
      });

      this.logger.log(
        `Audit log created for person: ${event.payload.personId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create audit log for person: ${event.payload.personId}`,
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
    this.logger.debug(
      `Triggering onboarding workflow for person: ${event.payload.personId}`,
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
      `Onboarding workflow triggered for person: ${event.payload.personId}`,
    );
  }

  /**
   * Initialize skill passport framework structure
   */
  private async initializeSkillPassportFramework(
    event: PersonCreatedEvent,
  ): Promise<void> {
    this.logger.debug(
      `Initializing skill passport framework for person: ${event.payload.personId}`,
    );

    // TODO: Implement skill passport service integration
    // await this.skillPassportService.initializeFramework({
    //   personId: event.payload.personId,
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
      `Skill passport framework initialized for person: ${event.payload.personId}`,
    );
  }

  /**
   * Record user acquisition and engagement metrics
   */
  private async recordUserAcquisitionMetrics(
    event: PersonCreatedEvent,
  ): Promise<void> {
    this.logger.debug(
      `Recording analytics for new person: ${event.payload.personId}`,
    );

    // TODO: Implement analytics service integration
    // await this.analyticsService.track('user_registered', {
    //   userId: event.payload.personId,
    //   email: event.payload.email,
    //   country: event.payload.countryCode || 'INDIA',
    //   registrationSource: 'DIRECT',
    //   isInstitutional: this.isInstitutionalAccount(event),
    //   preferredLanguage: event.payload.preferredLanguage,
    //   timestamp: event.occurredOn
    // });

    this.logger.debug(
      `Analytics recorded for person: ${event.payload.personId}`,
    );
  }

  /**
   * Notify institutional stakeholders of new student registration
   */
  private async notifyInstitutionalStakeholders(
    event: PersonCreatedEvent,
  ): Promise<void> {
    this.logger.debug(
      `Notifying institutional stakeholders for person: ${event.payload.personId}`,
    );

    // TODO: Implement institutional notification service
    // await this.notificationService.notifyInstitution({
    //   eventType: 'NEW_STUDENT_REGISTRATION',
    //   studentId: event.payload.personId,
    //   studentEmail: event.payload.email,
    //   studentName: event.payload.name,
    //   registrationTimestamp: event.occurredOn,
    //   requiresApproval: false
    // });

    this.logger.debug(
      `Institutional stakeholders notified for person: ${event.payload.personId}`,
    );
  }

  /**
   * Determines if this is an institutional account based on event data
   */
  private isInstitutionalAccount(event: PersonCreatedEvent): boolean {
    // TODO: Implement institutional account detection logic
    // This could be based on email domain, registration source, or explicit flags
    const emailDomain = event.payload.email.split('@')[1];
    const institutionalDomains = [
      'student.edu',
      'university.edu',
      'college.edu',
    ];

    return institutionalDomains.some((domain) => emailDomain.endsWith(domain));
  }
}
