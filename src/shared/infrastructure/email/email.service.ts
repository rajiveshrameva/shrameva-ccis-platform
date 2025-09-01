import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailConfig {
  from: string;
  replyTo?: string;
  template?: string;
}

export interface EmailData {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  templateData?: Record<string, any>;
}

export enum EmailTemplate {
  ASSESSMENT_STARTED = 'assessment_started',
  CCIS_LEVEL_ACHIEVED = 'ccis_level_achieved',
  COMPETENCY_COMPLETED = 'competency_completed',
  PLACEMENT_MATCH = 'placement_match',
  WEEKLY_PROGRESS = 'weekly_progress',

  // NEW: Person lifecycle email templates
  WELCOME_ONBOARDING = 'welcome_onboarding',
  VERIFICATION_CONFIRMED = 'verification_confirmed',
  ACCOUNT_DELETION_CONFIRMED = 'account_deletion_confirmed',
  SKILL_PASSPORT_WELCOME = 'skill_passport_welcome',

  // NEW: Assessment workflow email templates
  ASSESSMENT_COMPLETED = 'assessment_completed',
  GAMING_DETECTED_ALERT = 'gaming_detected_alert',
  GAMING_DETECTED_WARNING = 'gaming_detected_warning',
  INTERVENTION_TRIGGERED = 'intervention_triggered',
  INTERVENTION_STUDENT_GUIDANCE = 'intervention_student_guidance',
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendAssessmentStartedEmail(
    studentEmail: string,
    studentName: string,
    competency: string,
  ): Promise<void> {
    const emailData: EmailData = {
      to: studentEmail,
      subject: `Your ${competency} Assessment Has Started`,
      templateId: EmailTemplate.ASSESSMENT_STARTED,
      templateData: {
        studentName,
        competency,
        dashboardUrl: this.getDashboardUrl(),
        supportEmail: this.getSupportEmail(),
      },
    };

    await this.sendEmail(emailData);
  }

  async sendCCISLevelAchievedEmail(
    studentEmail: string,
    studentName: string,
    competency: string,
    newLevel: number,
    achievements: string[],
  ): Promise<void> {
    const emailData: EmailData = {
      to: studentEmail,
      subject: `🎉 You've reached CCIS Level ${newLevel} in ${competency}!`,
      templateId: EmailTemplate.CCIS_LEVEL_ACHIEVED,
      templateData: {
        studentName,
        competency,
        newLevel,
        achievements,
        nextSteps: this.getNextSteps(competency, newLevel),
        shareUrl: this.getShareUrl(competency, newLevel),
      },
    };

    await this.sendEmail(emailData);
  }

  async sendCompetencyCompletedEmail(
    studentEmail: string,
    studentName: string,
    competency: string,
    finalLevel: number,
    certificateUrl: string,
  ): Promise<void> {
    const emailData: EmailData = {
      to: studentEmail,
      subject: `Certificate Ready: ${competency} Mastery Achieved`,
      templateId: EmailTemplate.COMPETENCY_COMPLETED,
      templateData: {
        studentName,
        competency,
        finalLevel,
        certificateUrl,
        jobMatchUrl: this.getJobMatchUrl(),
        nextCompetency: this.getNextRecommendedCompetency(),
      },
    };

    await this.sendEmail(emailData);
  }

  async sendPlacementMatchEmail(
    studentEmail: string,
    studentName: string,
    jobMatches: Array<{
      company: string;
      role: string;
      salary: string;
      matchPercentage: number;
    }>,
  ): Promise<void> {
    const emailData: EmailData = {
      to: studentEmail,
      subject: `${jobMatches.length} Job Matches Found - Apply Now!`,
      templateId: EmailTemplate.PLACEMENT_MATCH,
      templateData: {
        studentName,
        jobMatches: jobMatches.slice(0, 3), // Top 3 matches
        totalMatches: jobMatches.length,
        applicationUrl: this.getApplicationUrl(),
        interviewPrepUrl: this.getInterviewPrepUrl(),
      },
    };

    await this.sendEmail(emailData);
  }

  async sendWeeklyProgressEmail(
    studentEmail: string,
    studentName: string,
    weeklyStats: {
      tasksCompleted: number;
      ccisProgressions: Array<{
        competency: string;
        oldLevel: number;
        newLevel: number;
      }>;
      totalLearningTime: number;
      streakDays: number;
      peerRanking: number;
    },
  ): Promise<void> {
    const emailData: EmailData = {
      to: studentEmail,
      subject: `Your Weekly Progress: ${weeklyStats.tasksCompleted} tasks completed`,
      templateId: EmailTemplate.WEEKLY_PROGRESS,
      templateData: {
        studentName,
        ...weeklyStats,
        motivationalMessage: this.getMotivationalMessage(weeklyStats),
      },
    };

    await this.sendEmail(emailData);
  }

  // ============================================================================
  // NEW: Person Lifecycle Email Templates
  // ============================================================================

  /**
   * Send welcome email to newly registered person
   * Triggered by PersonCreatedEvent
   */
  async sendWelcomeOnboardingEmail(
    personEmail: string,
    personName: string,
    personData: {
      country: 'India' | 'UAE';
      hasSkillPassport: boolean;
      registrationSource: string;
    },
  ): Promise<void> {
    const emailData: EmailData = {
      to: personEmail,
      subject: `Welcome to Shrameva! Your Journey to Industry Readiness Begins`,
      templateId: EmailTemplate.WELCOME_ONBOARDING,
      templateData: {
        personName,
        country: personData.country,
        localizedWelcome: this.getLocalizedWelcome(personData.country),
        hasSkillPassport: personData.hasSkillPassport,
        onboardingSteps: this.getOnboardingSteps(personData),
        dashboardUrl: this.getDashboardUrl(),
        gettingStartedUrl: this.getGettingStartedUrl(),
        communityUrl: this.getCommunityUrl(personData.country),
        supportEmail: this.getSupportEmail(),
        registrationSource: personData.registrationSource,
        localBusinessContext: this.getLocalBusinessContext(personData.country),
      },
    };

    await this.sendEmail(emailData);
  }

  /**
   * Send verification confirmation email
   * Triggered by PersonVerifiedEvent
   */
  async sendVerificationConfirmedEmail(
    personEmail: string,
    personName: string,
    verificationData: {
      verificationType: 'email' | 'phone' | 'identity' | 'academic';
      country: 'India' | 'UAE';
      unlockedFeatures: string[];
      trustScoreImprovement: number;
    },
  ): Promise<void> {
    const emailData: EmailData = {
      to: personEmail,
      subject: `✅ Verification Complete - New Features Unlocked!`,
      templateId: EmailTemplate.VERIFICATION_CONFIRMED,
      templateData: {
        personName,
        verificationType: verificationData.verificationType,
        country: verificationData.country,
        unlockedFeatures: verificationData.unlockedFeatures,
        trustScoreImprovement: verificationData.trustScoreImprovement,
        nextSteps: this.getPostVerificationSteps(verificationData),
        profileUrl: this.getProfileUrl(),
        placementEligibilityUrl: this.getPlacementEligibilityUrl(),
        verificationBadgeUrl: this.getVerificationBadgeUrl(
          verificationData.verificationType,
        ),
        securityTipsUrl: this.getSecurityTipsUrl(),
      },
    };

    await this.sendEmail(emailData);
  }

  /**
   * Send account deletion confirmation email
   * Triggered by PersonDeletedEvent
   */
  async sendAccountDeletionConfirmedEmail(
    personEmail: string,
    personName: string,
    deletionData: {
      deletionDate: Date;
      dataRetentionPeriod: number; // days
      appealDeadline: Date;
      country: 'India' | 'UAE';
      hasActiveAssessments: boolean;
    },
  ): Promise<void> {
    const emailData: EmailData = {
      to: personEmail,
      subject: `Account Deletion Confirmed - Important Information`,
      templateId: EmailTemplate.ACCOUNT_DELETION_CONFIRMED,
      templateData: {
        personName,
        deletionDate: deletionData.deletionDate.toLocaleDateString(),
        dataRetentionPeriod: deletionData.dataRetentionPeriod,
        appealDeadline: deletionData.appealDeadline.toLocaleDateString(),
        country: deletionData.country,
        hasActiveAssessments: deletionData.hasActiveAssessments,
        dataPrivacyUrl: this.getDataPrivacyUrl(deletionData.country),
        appealProcessUrl: this.getAppealProcessUrl(),
        alternativePlatformsUrl: this.getAlternativePlatformsUrl(),
        feedbackUrl: this.getFeedbackUrl(),
        reactivationUrl: this.getReactivationUrl(),
        legalComplianceInfo: this.getLegalComplianceInfo(deletionData.country),
      },
    };

    await this.sendEmail(emailData);
  }

  /**
   * Send skill passport welcome email
   * Triggered by SkillPassportCreatedEvent
   */
  async sendSkillPassportWelcomeEmail(
    personEmail: string,
    personName: string,
    skillPassportData: {
      passportId: string;
      country: 'India' | 'UAE';
      initialCompetencies: string[];
      ccisFrameworkVersion: string;
      nextAssessmentDate?: Date;
    },
  ): Promise<void> {
    const emailData: EmailData = {
      to: personEmail,
      subject: `🎯 Your Skill Passport is Ready - Start Your CCIS Journey!`,
      templateId: EmailTemplate.SKILL_PASSPORT_WELCOME,
      templateData: {
        personName,
        passportId: skillPassportData.passportId,
        country: skillPassportData.country,
        initialCompetencies: skillPassportData.initialCompetencies,
        ccisFrameworkVersion: skillPassportData.ccisFrameworkVersion,
        nextAssessmentDate:
          skillPassportData.nextAssessmentDate?.toLocaleDateString(),
        skillPassportUrl: this.getSkillPassportUrl(
          skillPassportData.passportId,
        ),
        assessmentScheduleUrl: this.getAssessmentScheduleUrl(),
        competencyGuideUrl: this.getCompetencyGuideUrl(),
        progressTrackingUrl: this.getProgressTrackingUrl(),
        ccisFrameworkUrl: this.getCCISFrameworkUrl(),
        localIndustryInsightsUrl: this.getLocalIndustryInsightsUrl(
          skillPassportData.country,
        ),
        mentorshipUrl: this.getMentorshipUrl(),
      },
    };

    await this.sendEmail(emailData);
  }

  private async sendEmail(emailData: EmailData): Promise<void> {
    try {
      // Implementation would integrate with email provider (SendGrid, AWS SES, etc.)
      // For now, log the email data for development
      this.logger.log(`Email sent to ${emailData.to}: ${emailData.subject}`);

      if (this.configService.get('NODE_ENV') === 'development') {
        this.logger.debug('Email content:', {
          ...emailData,
          templateData: JSON.stringify(emailData.templateData, null, 2),
        });
      }

      // TODO: Replace with actual email service integration
      // await this.emailProvider.send(emailData);
    } catch (error) {
      this.logger.error(`Failed to send email to ${emailData.to}:`, error);
      // Don't throw - email failures shouldn't break the main flow
    }
  }

  /**
   * Send assessment completion summary email
   * Triggered by AssessmentCompletedEvent
   */
  async sendAssessmentCompletedEmail(
    studentEmail: string,
    studentName: string,
    assessmentData: {
      assessmentType: string;
      completionDate: Date;
      overallScore: number;
      ccisProgressions: Array<{
        competency: string;
        previousLevel: number;
        newLevel: number;
        improvement: number;
      }>;
      nextSteps: string[];
      country: 'India' | 'UAE';
    },
  ): Promise<void> {
    const emailData: EmailData = {
      to: studentEmail,
      subject: `🎯 Assessment Complete - Your CCIS Progress Report`,
      templateId: EmailTemplate.ASSESSMENT_COMPLETED,
      templateData: {
        studentName,
        assessmentType: assessmentData.assessmentType,
        completionDate: assessmentData.completionDate.toLocaleDateString(),
        overallScore: assessmentData.overallScore,
        ccisProgressions: assessmentData.ccisProgressions,
        nextSteps: assessmentData.nextSteps,
        country: assessmentData.country,
        dashboardUrl: this.getDashboardUrl(),
        progressUrl: this.getProgressTrackingUrl(),
        nextAssessmentUrl: this.getDashboardUrl(), // TODO: Create specific next assessment URL
        improvementTips: this.getLocalBusinessContext(assessmentData.country),
      },
    };

    await this.sendEmail(emailData);
  }

  /**
   * Send gaming detection alert to integrity team
   * Triggered by GamingDetectedEvent
   */
  async sendGamingDetectedAlertEmail(
    alertRecipients: string[],
    studentDetails: {
      studentId: string;
      studentName: string;
      studentEmail: string;
    },
    gamingData: {
      detectionType: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      evidence: string[];
      timestamp: Date;
      assessmentContext: string;
    },
  ): Promise<void> {
    const emailData: EmailData = {
      to: alertRecipients,
      subject: `🚨 Gaming Detection Alert - ${gamingData.severity} Severity`,
      templateId: EmailTemplate.GAMING_DETECTED_ALERT,
      templateData: {
        studentId: studentDetails.studentId,
        studentName: studentDetails.studentName,
        studentEmail: studentDetails.studentEmail,
        detectionType: gamingData.detectionType,
        severity: gamingData.severity,
        evidence: gamingData.evidence,
        timestamp: gamingData.timestamp.toISOString(),
        assessmentContext: gamingData.assessmentContext,
        adminDashboardUrl: this.getDashboardUrl(), // TODO: Create admin-specific dashboard URL
        investigationUrl: this.getDashboardUrl(), // TODO: Create investigation-specific URL
      },
    };

    await this.sendEmail(emailData);
  }

  /**
   * Send gaming detection warning to student
   * Triggered by GamingDetectedEvent (educational approach)
   */
  async sendGamingDetectedWarningEmail(
    studentEmail: string,
    studentName: string,
    warningData: {
      detectionType: string;
      guidanceMessage: string;
      improvementTips: string[];
      country: 'India' | 'UAE';
    },
  ): Promise<void> {
    const emailData: EmailData = {
      to: studentEmail,
      subject: `📚 Assessment Guidance - Let's Improve Together`,
      templateId: EmailTemplate.GAMING_DETECTED_WARNING,
      templateData: {
        studentName,
        detectionType: warningData.detectionType,
        guidanceMessage: warningData.guidanceMessage,
        improvementTips: warningData.improvementTips,
        country: warningData.country,
        supportUrl: this.getDashboardUrl(), // TODO: Create support-specific URL
        learningResourcesUrl: this.getDashboardUrl(), // TODO: Create learning resources URL
        mentorshipUrl: this.getMentorshipUrl(),
        practiceUrl: this.getDashboardUrl(), // TODO: Create practice assessment URL
      },
    };

    await this.sendEmail(emailData);
  }

  /**
   * Send intervention triggered alert to support team
   * Triggered by InterventionTriggeredEvent
   */
  async sendInterventionTriggeredEmail(
    supportTeamEmails: string[],
    studentDetails: {
      studentId: string;
      studentName: string;
      studentEmail: string;
    },
    interventionData: {
      triggerType: string;
      urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      requiredActions: string[];
      deadline: Date;
      context: string;
    },
  ): Promise<void> {
    const emailData: EmailData = {
      to: supportTeamEmails,
      subject: `🚨 Intervention Required - ${interventionData.urgencyLevel} Priority`,
      templateId: EmailTemplate.INTERVENTION_TRIGGERED,
      templateData: {
        studentId: studentDetails.studentId,
        studentName: studentDetails.studentName,
        studentEmail: studentDetails.studentEmail,
        triggerType: interventionData.triggerType,
        urgencyLevel: interventionData.urgencyLevel,
        requiredActions: interventionData.requiredActions,
        deadline: interventionData.deadline.toLocaleDateString(),
        context: interventionData.context,
        supportDashboardUrl: this.getDashboardUrl(), // TODO: Create support dashboard URL
        studentProfileUrl: this.getDashboardUrl(), // TODO: Create student profile URL
      },
    };

    await this.sendEmail(emailData);
  }

  /**
   * Send intervention student guidance email
   * Triggered by InterventionTriggeredEvent
   */
  async sendInterventionStudentGuidanceEmail(
    studentEmail: string,
    studentName: string,
    guidanceData: {
      supportType: string;
      guidanceMessage: string;
      actionItems: string[];
      supportContactInfo: {
        name: string;
        email: string;
        phone?: string;
      };
      country: 'India' | 'UAE';
    },
  ): Promise<void> {
    const emailData: EmailData = {
      to: studentEmail,
      subject: `🤝 Personalized Support Available - We're Here to Help`,
      templateId: EmailTemplate.INTERVENTION_STUDENT_GUIDANCE,
      templateData: {
        studentName,
        supportType: guidanceData.supportType,
        guidanceMessage: guidanceData.guidanceMessage,
        actionItems: guidanceData.actionItems,
        supportContact: guidanceData.supportContactInfo,
        country: guidanceData.country,
        scheduleMeetingUrl: this.getDashboardUrl(), // TODO: Create meeting scheduling URL
        supportResourcesUrl: this.getDashboardUrl(), // TODO: Create support resources URL
        faqUrl: this.getDashboardUrl(), // TODO: Create FAQ URL
        communityUrl: this.getCommunityUrl(guidanceData.country),
      },
    };

    await this.sendEmail(emailData);
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private getDashboardUrl(): string {
    return `${this.configService.get('FRONTEND_URL')}/dashboard`;
  }

  private getSupportEmail(): string {
    return this.configService.get('SUPPORT_EMAIL', 'support@shrameva.com');
  }

  private getShareUrl(competency: string, level: number): string {
    return `${this.configService.get('FRONTEND_URL')}/share/${competency}/${level}`;
  }

  private getJobMatchUrl(): string {
    return `${this.configService.get('FRONTEND_URL')}/jobs`;
  }

  private getApplicationUrl(): string {
    return `${this.configService.get('FRONTEND_URL')}/apply`;
  }

  private getInterviewPrepUrl(): string {
    return `${this.configService.get('FRONTEND_URL')}/interview-prep`;
  }

  private getNextSteps(competency: string, currentLevel: number): string[] {
    const nextStepsMap = {
      communication: {
        1: [
          'Practice email writing daily',
          'Join presentation skills workshop',
        ],
        2: ['Lead team meetings', 'Practice client communication'],
        3: ['Mentor others in communication', 'Handle difficult conversations'],
        4: ['Create communication standards', 'Train new hires'],
      },
      data_analysis: {
        1: ['Master Excel formulas', 'Learn basic SQL'],
        2: ['Create dashboards', 'Practice hypothesis testing'],
        3: ['Lead data projects', 'Present to executives'],
        4: ['Design analytical frameworks', 'Mentor junior analysts'],
      },
      // Add other competencies...
    };

    return (
      nextStepsMap[competency]?.[currentLevel] || [
        'Continue practicing',
        'Seek feedback',
      ]
    );
  }

  private getNextRecommendedCompetency(): string {
    // Logic to determine next competency based on student progress
    return 'Critical Thinking & Problem Solving';
  }

  private getMotivationalMessage(stats: any): string {
    if (stats.streakDays >= 7) {
      return "You're on fire! 🔥 Your consistency is building real competence.";
    } else if (stats.ccisProgressions.length > 0) {
      return "Amazing progress! 🚀 You're moving closer to workplace readiness.";
    } else {
      return 'Every expert was once a beginner. Keep going! 💪';
    }
  }

  private generateNextWeekGoals(stats: any): string[] {
    return [
      `Complete ${Math.max(stats.tasksCompleted + 2, 10)} tasks`,
      'Maintain daily learning streak',
      'Try a fusion challenge',
      'Help a peer in the community',
    ];
  }

  // ============================================================================
  // NEW: Helper Methods for Person Lifecycle Email Templates
  // ============================================================================

  private getLocalizedWelcome(country: 'India' | 'UAE'): string {
    const welcomeMessages = {
      India:
        'नमस्ते! Welcome to Shrameva - Your gateway to Industry 4.0 readiness',
      UAE: 'مرحبا! Welcome to Shrameva - Empowering your career in the UAE market',
    };
    return welcomeMessages[country];
  }

  private getOnboardingSteps(personData: {
    hasSkillPassport: boolean;
    country: string;
  }): string[] {
    const baseSteps = [
      'Complete your profile',
      'Set learning preferences',
      'Take initial competency assessment',
    ];

    if (!personData.hasSkillPassport) {
      baseSteps.unshift('Create your Skill Passport');
    }

    if (personData.country === 'UAE') {
      baseSteps.push('Connect with UAE industry partners');
    } else {
      baseSteps.push('Explore placement opportunities in India');
    }

    return baseSteps;
  }

  private getGettingStartedUrl(): string {
    return `${this.configService.get('FRONTEND_URL')}/getting-started`;
  }

  private getCommunityUrl(country: 'India' | 'UAE'): string {
    return `${this.configService.get('FRONTEND_URL')}/community/${country.toLowerCase()}`;
  }

  private getLocalBusinessContext(
    country: 'India' | 'UAE',
  ): Record<string, any> {
    const contexts = {
      India: {
        industryFocus: [
          'IT Services',
          'Manufacturing',
          'Financial Services',
          'Healthcare',
        ],
        keyEmployers: ['TCS', 'Infosys', 'Wipro', 'Tech Mahindra', 'HCL'],
        growthSectors: ['EdTech', 'FinTech', 'HealthTech', 'AgriTech'],
        averageSalaryCurrency: 'INR',
        placementSeasons: ['July-September', 'February-April'],
      },
      UAE: {
        industryFocus: [
          'Oil & Gas',
          'Finance',
          'Technology',
          'Tourism',
          'Healthcare',
        ],
        keyEmployers: ['Emirates', 'ADNOC', 'Dubai Holding', 'Careem', 'Noon'],
        growthSectors: [
          'FinTech',
          'AI/ML',
          'Sustainability Tech',
          'Smart Cities',
        ],
        averageSalaryCurrency: 'AED',
        placementSeasons: ['Year-round', 'Peak: September-November'],
      },
    };
    return contexts[country];
  }

  private getPostVerificationSteps(verificationData: {
    verificationType: string;
    country: string;
  }): string[] {
    const steps = [
      'Update your public profile visibility',
      'Share your verification badge',
      'Explore premium features',
    ];

    if (verificationData.verificationType === 'identity') {
      steps.push('Apply for placement opportunities');
      steps.push('Access mentor network');
    }

    if (verificationData.country === 'UAE') {
      steps.push('Connect with UAE visa consultants');
    }

    return steps;
  }

  private getProfileUrl(): string {
    return `${this.configService.get('FRONTEND_URL')}/profile`;
  }

  private getPlacementEligibilityUrl(): string {
    return `${this.configService.get('FRONTEND_URL')}/placement/eligibility`;
  }

  private getVerificationBadgeUrl(verificationType: string): string {
    return `${this.configService.get('FRONTEND_URL')}/verification/badge/${verificationType}`;
  }

  private getSecurityTipsUrl(): string {
    return `${this.configService.get('FRONTEND_URL')}/security/tips`;
  }

  private getDataPrivacyUrl(country: 'India' | 'UAE'): string {
    return `${this.configService.get('FRONTEND_URL')}/privacy/${country.toLowerCase()}`;
  }

  private getAppealProcessUrl(): string {
    return `${this.configService.get('FRONTEND_URL')}/account/appeal`;
  }

  private getAlternativePlatformsUrl(): string {
    return `${this.configService.get('FRONTEND_URL')}/alternatives`;
  }

  private getFeedbackUrl(): string {
    return `${this.configService.get('FRONTEND_URL')}/feedback`;
  }

  private getReactivationUrl(): string {
    return `${this.configService.get('FRONTEND_URL')}/account/reactivate`;
  }

  private getLegalComplianceInfo(
    country: 'India' | 'UAE',
  ): Record<string, any> {
    const compliance = {
      India: {
        dataProtectionLaw: 'Digital Personal Data Protection Act, 2023',
        retentionPeriod:
          '90 days for personal data, 2 years for educational records',
        rightsInfo:
          'Right to erasure, Right to correction, Right to data portability',
        contactAuthority: 'Data Protection Board of India',
      },
      UAE: {
        dataProtectionLaw:
          'UAE Data Protection Law (Federal Law No. 45 of 2021)',
        retentionPeriod:
          '90 days for personal data, 3 years for educational records',
        rightsInfo: 'Right to access, Right to rectification, Right to erasure',
        contactAuthority: 'UAE Data Office',
      },
    };
    return compliance[country];
  }

  private getSkillPassportUrl(passportId: string): string {
    return `${this.configService.get('FRONTEND_URL')}/skill-passport/${passportId}`;
  }

  private getAssessmentScheduleUrl(): string {
    return `${this.configService.get('FRONTEND_URL')}/assessments/schedule`;
  }

  private getCompetencyGuideUrl(): string {
    return `${this.configService.get('FRONTEND_URL')}/competencies/guide`;
  }

  private getProgressTrackingUrl(): string {
    return `${this.configService.get('FRONTEND_URL')}/progress`;
  }

  private getCCISFrameworkUrl(): string {
    return `${this.configService.get('FRONTEND_URL')}/ccis/framework`;
  }

  private getLocalIndustryInsightsUrl(country: 'India' | 'UAE'): string {
    return `${this.configService.get('FRONTEND_URL')}/insights/${country.toLowerCase()}`;
  }

  private getMentorshipUrl(): string {
    return `${this.configService.get('FRONTEND_URL')}/mentorship`;
  }
}
