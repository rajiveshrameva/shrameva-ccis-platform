/**
 * Assessment API Guards Index
 *
 * Central export point for all assessment-related guards.
 * This provides security and authorization guards specifically
 * designed for assessment operations.
 *
 * Guards:
 * - AssessmentAuthGuard: Authentication and authorization for assessment endpoints
 *
 * Usage:
 * ```typescript
 * import { AssessmentAuthGuard } from './guards';
 * ```
 */

export { AssessmentAuthGuard } from './assessment-auth.guard';

// Re-export for backwards compatibility
export * from './assessment-auth.guard';
