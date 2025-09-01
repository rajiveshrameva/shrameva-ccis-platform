/**
 * Assessment API Controllers Index
 *
 * Central export point for all assessment-related controllers.
 * This provides a clean import interface for the assessment module
 * and ensures consistent controller organization.
 *
 * Controllers:
 * - AssessmentController: Core assessment operations (start, interact, progress)
 * - SessionController: Session management and real-time operations
 * - AnalyticsController: Advanced analytics and reporting
 *
 * Usage:
 * ```typescript
 * import { AssessmentController, SessionController, AnalyticsController } from './controllers';
 * ```
 */

export { AssessmentController } from './assessment.controller';
export { SessionController } from './session.controller';
export { AnalyticsController } from './analytics.controller';

// Re-export for backwards compatibility
export * from './assessment.controller';
export * from './session.controller';
export * from './analytics.controller';
