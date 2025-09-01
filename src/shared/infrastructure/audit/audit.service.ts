import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import * as crypto from 'crypto';

export enum AuditEventType {
  // Assessment Events
  ASSESSMENT_STARTED = 'assessment_started',
  ASSESSMENT_COMPLETED = 'assessment_completed',
  CCIS_LEVEL_CHANGED = 'ccis_level_changed',
  TASK_SUBMITTED = 'task_submitted',
  GAMING_DETECTED = 'gaming_detected',

  // Student Events
  STUDENT_REGISTERED = 'student_registered',
  STUDENT_PROFILE_UPDATED = 'student_profile_updated',
  COMPETENCY_ACHIEVED = 'competency_achieved',

  // System Events
  AI_DECISION_MADE = 'ai_decision_made',
  HUMAN_INTERVENTION = 'human_intervention',
  DATA_EXPORT_REQUESTED = 'data_export_requested',
  PRIVACY_SETTING_CHANGED = 'privacy_setting_changed',
}

export interface AuditEventData {
  eventType: AuditEventType;
  entityId: string; // studentId, assessmentId, etc.
  entityType: string; // 'student', 'assessment', 'session'
  userId?: string; // Acting user (for admin actions)
  timestamp: Date;
  metadata: Record<string, any>;
  sensitiveData?: Record<string, any>; // Encrypted/hashed sensitive info
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface CCISDecisionAudit {
  assessmentId: string;
  studentId: string;
  competencyType: string;
  previousLevel?: number;
  newLevel: number;
  confidenceScore: number;
  behavioralSignals: {
    hintFrequency: number;
    errorRecoveryTime: number;
    transferSuccessRate: number;
    metacognitiveAccuracy: number;
    completionEfficiency: number;
    helpSeekingQuality: number;
    selfAssessmentAlignment: number;
  };
  aiReasoning: string;
  validationChecks: {
    consistencyCheck: boolean;
    gamingDetection: boolean;
    crossValidation: boolean;
  };
  reviewRequired: boolean;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private readonly encryptionKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.encryptionKey =
      this.configService.get('ENCRYPTION_KEY') ||
      'default-dev-key-change-in-production';
  }

  async logAssessmentStarted(
    studentId: string,
    assessmentId: string,
    competencyType: string,
    metadata: Record<string, any> = {},
  ): Promise<void> {
    const auditEvent: AuditEventData = {
      eventType: AuditEventType.ASSESSMENT_STARTED,
      entityId: assessmentId,
      entityType: 'assessment',
      timestamp: new Date(),
      metadata: {
        studentId,
        competencyType,
        platform: metadata.platform || 'web',
        ...metadata,
      },
    };

    await this.persistAuditEvent(auditEvent);
  }

  async logAssessmentCompleted(
    studentId: string,
    assessmentId: string,
    competencyType: string,
    finalLevel: number,
    tasksCompleted: number,
    totalDuration: number,
  ): Promise<void> {
    const auditEvent: AuditEventData = {
      eventType: AuditEventType.ASSESSMENT_COMPLETED,
      entityId: assessmentId,
      entityType: 'assessment',
      timestamp: new Date(),
      metadata: {
        studentId,
        competencyType,
        finalLevel,
        tasksCompleted,
        totalDuration,
        completionRate: tasksCompleted / 25, // Assuming 25 tasks per competency
      },
    };

    await this.persistAuditEvent(auditEvent);
  }

  async logCCISDecision(
    studentId: string,
    assessmentId: string,
    decisionData: CCISDecisionAudit,
  ): Promise<void> {
    const auditEvent: AuditEventData = {
      eventType: AuditEventType.CCIS_LEVEL_CHANGED,
      entityId: assessmentId,
      entityType: 'assessment',
      timestamp: new Date(),
      metadata: {
        studentId,
        competencyType: decisionData.competencyType,
        levelChange: {
          from: decisionData.previousLevel,
          to: decisionData.newLevel,
        },
        confidenceScore: decisionData.confidenceScore,
        reviewRequired: decisionData.reviewRequired,
      },
      sensitiveData: {
        // Encrypt/hash sensitive behavioral data
        behavioralSignalsHash: this.hashSensitiveData(
          decisionData.behavioralSignals,
        ),
        aiReasoningHash: this.hashSensitiveData(decisionData.aiReasoning),
        validationResults: decisionData.validationChecks,
      },
    };

    await this.persistAuditEvent(auditEvent);

    // Special handling for significant decisions
    if (decisionData.reviewRequired || decisionData.confidenceScore < 0.7) {
      await this.flagForHumanReview(studentId, assessmentId, decisionData);
    }
  }

  async logTaskSubmission(
    studentId: string,
    taskId: string,
    assessmentId: string,
    taskData: {
      competencyType: string;
      taskType: string;
      score: number;
      hintsUsed: number;
      timeSpent: number;
      errorCount: number;
    },
  ): Promise<void> {
    const auditEvent: AuditEventData = {
      eventType: AuditEventType.TASK_SUBMITTED,
      entityId: taskId,
      entityType: 'task',
      timestamp: new Date(),
      metadata: {
        studentId,
        assessmentId,
        competencyType: taskData.competencyType,
        taskType: taskData.taskType,
        performance: {
          score: taskData.score,
          hintsUsed: taskData.hintsUsed,
          timeSpent: taskData.timeSpent,
          errorCount: taskData.errorCount,
          efficiency: taskData.score / taskData.timeSpent,
        },
      },
    };

    await this.persistAuditEvent(auditEvent);
  }

  async logGamingDetection(
    studentId: string,
    assessmentId: string,
    gamingPatterns: {
      patternType: string;
      confidence: number;
      evidence: Record<string, any>;
    }[],
  ): Promise<void> {
    const auditEvent: AuditEventData = {
      eventType: AuditEventType.GAMING_DETECTED,
      entityId: studentId,
      entityType: 'student',
      timestamp: new Date(),
      metadata: {
        assessmentId,
        patternsDetected: gamingPatterns.length,
        highestConfidence: Math.max(...gamingPatterns.map((p) => p.confidence)),
        requiresImmediateAction: gamingPatterns.some((p) => p.confidence > 0.8),
      },
      sensitiveData: {
        detectedPatterns: this.encryptSensitiveData(gamingPatterns),
      },
    };

    await this.persistAuditEvent(auditEvent);

    // Auto-escalate high-confidence gaming detection
    if (gamingPatterns.some((p) => p.confidence > 0.8)) {
      await this.escalateGamingIncident(
        studentId,
        assessmentId,
        gamingPatterns,
      );
    }
  }

  async logStudentRegistration(
    studentId: string,
    registrationData: {
      email: string;
      college: string;
      graduationYear: number;
      referralSource?: string;
    },
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const auditEvent: AuditEventData = {
      eventType: AuditEventType.STUDENT_REGISTERED,
      entityId: studentId,
      entityType: 'student',
      timestamp: new Date(),
      ipAddress,
      userAgent,
      metadata: {
        college: registrationData.college,
        graduationYear: registrationData.graduationYear,
        referralSource: registrationData.referralSource || 'direct',
        emailDomain: registrationData.email.split('@')[1],
      },
      sensitiveData: {
        emailHash: this.hashSensitiveData(registrationData.email),
      },
    };

    await this.persistAuditEvent(auditEvent);
  }

  async logPrivacySettingChange(
    studentId: string,
    settingType: string,
    oldValue: any,
    newValue: any,
    userId?: string,
  ): Promise<void> {
    const auditEvent: AuditEventData = {
      eventType: AuditEventType.PRIVACY_SETTING_CHANGED,
      entityId: studentId,
      entityType: 'student',
      userId,
      timestamp: new Date(),
      metadata: {
        settingType,
        changeType: this.determineChangeType(oldValue, newValue),
        userInitiated: !userId || userId === studentId,
      },
      sensitiveData: {
        settingChangeHash: this.encryptSensitiveData({ oldValue, newValue }),
      },
    };

    await this.persistAuditEvent(auditEvent);
  }

  async logDataExportRequest(
    studentId: string,
    requestedBy: string,
    dataTypes: string[],
    justification: string,
  ): Promise<void> {
    const auditEvent: AuditEventData = {
      eventType: AuditEventType.DATA_EXPORT_REQUESTED,
      entityId: studentId,
      entityType: 'student',
      userId: requestedBy,
      timestamp: new Date(),
      metadata: {
        dataTypes,
        justification,
        isStudentRequest: requestedBy === studentId,
        requiresApproval: requestedBy !== studentId,
      },
    };

    await this.persistAuditEvent(auditEvent);
  }

  async getAuditTrail(
    entityId: string,
    entityType: string,
    limit: number = 100,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AuditEventData[]> {
    try {
      const whereClause: any = {
        entityId,
        entityType,
      };

      if (startDate || endDate) {
        whereClause.timestamp = {};
        if (startDate) whereClause.timestamp.gte = startDate;
        if (endDate) whereClause.timestamp.lte = endDate;
      }

      const auditEvents = await this.prisma.auditEvent.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
        take: limit,
      });

      return auditEvents.map((event) => ({
        eventType: event.eventType as AuditEventType,
        entityId: event.entityId,
        entityType: event.entityType,
        userId: event.userId || undefined,
        timestamp: event.timestamp,
        metadata: event.metadata as Record<string, any>,
        sensitiveData: event.sensitiveDataHash
          ? { hash: event.sensitiveDataHash }
          : undefined,
        ipAddress: event.ipAddress || undefined,
        userAgent: event.userAgent || undefined,
        sessionId: event.sessionId || undefined,
      }));
    } catch (error) {
      this.logger.error(
        `Failed to retrieve audit trail for ${entityType}:${entityId}`,
        error,
      );
      throw error;
    }
  }

  async generateComplianceReport(
    studentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalEvents: number;
    assessmentDecisions: number;
    privacyEvents: number;
    gamingIncidents: number;
    humanInterventions: number;
    dataIntegrity: boolean;
  }> {
    try {
      const whereClause = {
        entityId: studentId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      };

      const [
        totalEvents,
        assessmentDecisions,
        privacyEvents,
        gamingIncidents,
        humanInterventions,
      ] = await Promise.all([
        this.prisma.auditEvent.count({ where: whereClause }),
        this.prisma.auditEvent.count({
          where: {
            ...whereClause,
            eventType: AuditEventType.CCIS_LEVEL_CHANGED,
          },
        }),
        this.prisma.auditEvent.count({
          where: {
            ...whereClause,
            eventType: AuditEventType.PRIVACY_SETTING_CHANGED,
          },
        }),
        this.prisma.auditEvent.count({
          where: {
            ...whereClause,
            eventType: AuditEventType.GAMING_DETECTED,
          },
        }),
        this.prisma.auditEvent.count({
          where: {
            ...whereClause,
            eventType: AuditEventType.HUMAN_INTERVENTION,
          },
        }),
      ]);

      // Check data integrity by looking for any missing critical events
      const dataIntegrity = await this.validateDataIntegrity(
        studentId,
        startDate,
        endDate,
      );

      return {
        totalEvents,
        assessmentDecisions,
        privacyEvents,
        gamingIncidents,
        humanInterventions,
        dataIntegrity,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate compliance report for ${studentId}`,
        error,
      );
      throw error;
    }
  }

  async searchAuditEvents(
    filters: {
      eventType?: AuditEventType;
      entityType?: string;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
      ipAddress?: string;
    },
    limit: number = 100,
    offset: number = 0,
  ): Promise<{ events: AuditEventData[]; total: number }> {
    try {
      const whereClause: any = {};

      if (filters.eventType) whereClause.eventType = filters.eventType;
      if (filters.entityType) whereClause.entityType = filters.entityType;
      if (filters.userId) whereClause.userId = filters.userId;
      if (filters.ipAddress) whereClause.ipAddress = filters.ipAddress;

      if (filters.startDate || filters.endDate) {
        whereClause.timestamp = {};
        if (filters.startDate) whereClause.timestamp.gte = filters.startDate;
        if (filters.endDate) whereClause.timestamp.lte = filters.endDate;
      }

      const [events, total] = await Promise.all([
        this.prisma.auditEvent.findMany({
          where: whereClause,
          orderBy: { timestamp: 'desc' },
          take: limit,
          skip: offset,
        }),
        this.prisma.auditEvent.count({ where: whereClause }),
      ]);

      return {
        events: events.map((event) => ({
          eventType: event.eventType as AuditEventType,
          entityId: event.entityId,
          entityType: event.entityType,
          userId: event.userId || undefined,
          timestamp: event.timestamp,
          metadata: event.metadata as Record<string, any>,
          sensitiveData: event.sensitiveDataHash
            ? { hash: event.sensitiveDataHash }
            : undefined,
          ipAddress: event.ipAddress || undefined,
          userAgent: event.userAgent || undefined,
          sessionId: event.sessionId || undefined,
        })),
        total,
      };
    } catch (error) {
      this.logger.error('Failed to search audit events', error);
      throw error;
    }
  }

  private async persistAuditEvent(event: AuditEventData): Promise<void> {
    try {
      await this.prisma.auditEvent.create({
        data: {
          eventType: event.eventType,
          entityId: event.entityId,
          entityType: event.entityType,
          userId: event.userId,
          timestamp: event.timestamp,
          metadata: event.metadata,
          sensitiveDataHash: event.sensitiveData
            ? this.encryptSensitiveData(event.sensitiveData)
            : null,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          sessionId: event.sessionId,
        },
      });

      // Log to console in development
      if (this.configService.get('NODE_ENV') === 'development') {
        this.logger.debug(`Audit Event: ${event.eventType}`, {
          entityId: event.entityId,
          entityType: event.entityType,
          metadata: event.metadata,
        });
      }
    } catch (error) {
      this.logger.error('Failed to persist audit event:', error);
      // Critical: Don't let audit failures break the main application flow
      // But do escalate persistent audit failures
      throw error;
    }
  }

  private hashSensitiveData(data: any): string {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  private encryptSensitiveData(data: any): string {
    try {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
      const iv = crypto.randomBytes(16);

      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(dataString, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Prepend IV to encrypted data
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      this.logger.error('Failed to encrypt sensitive data', error);
      // Fallback to hashing if encryption fails
      return this.hashSensitiveData(data);
    }
  }

  private decryptSensitiveData(encryptedData: string): any {
    try {
      const [ivHex, encrypted] = encryptedData.split(':');
      if (!ivHex || !encrypted) {
        throw new Error('Invalid encrypted data format');
      }

      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
      const iv = Buffer.from(ivHex, 'hex');

      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted);
    } catch (error) {
      this.logger.error('Failed to decrypt sensitive data', error);
      return null;
    }
  }

  private async flagForHumanReview(
    studentId: string,
    assessmentId: string,
    decisionData: CCISDecisionAudit,
  ): Promise<void> {
    this.logger.warn(
      `CCIS decision flagged for human review: ${assessmentId}`,
      {
        studentId,
        competency: decisionData.competencyType,
        confidence: decisionData.confidenceScore,
        newLevel: decisionData.newLevel,
      },
    );

    // Create a human review audit event
    await this.persistAuditEvent({
      eventType: AuditEventType.HUMAN_INTERVENTION,
      entityId: assessmentId,
      entityType: 'assessment',
      timestamp: new Date(),
      metadata: {
        studentId,
        competencyType: decisionData.competencyType,
        reason: 'low_confidence_ccis_decision',
        confidence: decisionData.confidenceScore,
        requiresReview: true,
        reviewStatus: 'pending',
      },
    });

    // TODO: Implement actual human review workflow
    // - Add to review queue
    // - Notify human reviewers
    // - Track review completion
  }

  private async escalateGamingIncident(
    studentId: string,
    assessmentId: string,
    gamingPatterns: any[],
  ): Promise<void> {
    this.logger.error(`High-confidence gaming detected: ${studentId}`, {
      assessmentId,
      patterns: gamingPatterns.length,
      maxConfidence: Math.max(...gamingPatterns.map((p) => p.confidence)),
    });

    // Create an escalation audit event
    await this.persistAuditEvent({
      eventType: AuditEventType.HUMAN_INTERVENTION,
      entityId: studentId,
      entityType: 'student',
      timestamp: new Date(),
      metadata: {
        assessmentId,
        reason: 'high_confidence_gaming_detection',
        patternsDetected: gamingPatterns.length,
        maxConfidence: Math.max(...gamingPatterns.map((p) => p.confidence)),
        actionRequired: 'immediate_review',
        escalationLevel: 'high',
      },
    });

    // TODO: Implement gaming incident response
    // - Suspend assessment
    // - Notify administrators
    // - Generate incident report
  }

  private determineChangeType(oldValue: any, newValue: any): string {
    if (oldValue === null || oldValue === undefined) return 'created';
    if (newValue === null || newValue === undefined) return 'deleted';
    return 'modified';
  }

  private async validateDataIntegrity(
    studentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<boolean> {
    try {
      // Check for critical missing events or data inconsistencies
      const assessmentStarted = await this.prisma.auditEvent.count({
        where: {
          entityId: studentId,
          eventType: AuditEventType.ASSESSMENT_STARTED,
          timestamp: { gte: startDate, lte: endDate },
        },
      });

      const assessmentCompleted = await this.prisma.auditEvent.count({
        where: {
          entityId: studentId,
          eventType: AuditEventType.ASSESSMENT_COMPLETED,
          timestamp: { gte: startDate, lte: endDate },
        },
      });

      // Basic integrity check: started assessments should generally be completed
      // Allow some tolerance for ongoing assessments
      const integrityRatio =
        assessmentStarted > 0 ? assessmentCompleted / assessmentStarted : 1;

      return integrityRatio >= 0.8; // 80% of assessments should be completed
    } catch (error) {
      this.logger.error('Failed to validate data integrity', error);
      return false;
    }
  }
}
