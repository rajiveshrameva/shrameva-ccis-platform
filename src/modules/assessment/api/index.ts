/**
 * Assessment API Index
 *
 * Central export point for the complete Assessment API layer.
 * This module provides RESTful API endpoints for the CCIS assessment
 * system with comprehensive features for assessment management,
 * real-time interaction tracking, and analytics.
 *
 * API Structure:
 * ├── Controllers/
 * │   ├── AssessmentController - Core assessment operations
 * │   ├── SessionController - Session management
 * │   └── AnalyticsController - Analytics and reporting
 * ├── DTOs/
 * │   ├── StartAssessmentDto - Assessment configuration
 * │   ├── SubmitTaskInteractionDto - Interaction data
 * │   ├── AssessmentResponseDto - Real-time responses
 * │   └── ProgressResponseDto - Progress analytics
 * └── Guards/
 *     └── AssessmentAuthGuard - Security and authorization
 *
 * Key Features:
 * 1. **Comprehensive Assessment API**: Full CRUD operations for assessments
 * 2. **Real-time Interaction Tracking**: Live behavioral signal collection
 * 3. **Advanced Analytics**: Multi-level analytics and reporting
 * 4. **Session Management**: Fine-grained session control
 * 5. **Security**: Robust authentication and authorization
 * 6. **Validation**: Comprehensive input validation and business rules
 *
 * Usage:
 * ```typescript
 * import {
 *   AssessmentController,
 *   SessionController,
 *   AnalyticsController,
 *   StartAssessmentDto,
 *   AssessmentResponseDto,
 *   AssessmentAuthGuard
 * } from './api';
 * ```
 */

// Controllers
export * from './controllers';
export { AssessmentController } from './controllers/assessment.controller';
export { SessionController } from './controllers/session.controller';
export { AnalyticsController } from './controllers/analytics.controller';

// DTOs
export * from './dtos';
export { StartAssessmentDto } from './dtos/start-assessment.dto';
export { SubmitTaskInteractionDto } from './dtos/submit-interaction.dto';
export { AssessmentResponseDto } from './dtos/assessment-response.dto';
export { ProgressResponseDto } from './dtos/progress-response.dto';

// Guards
export * from './guards';
export { AssessmentAuthGuard } from './guards/assessment-auth.guard';

// API Configuration and Metadata
export const ASSESSMENT_API_VERSION = '1.0.0';
export const ASSESSMENT_API_PREFIX = 'assessment';

export const ASSESSMENT_API_METADATA = {
  version: ASSESSMENT_API_VERSION,
  title: 'CCIS Assessment API',
  description:
    'Comprehensive API for CCIS (Confidence-Competence Independence Scale) assessment system',
  contact: {
    name: 'Shrameva CCIS Team',
    email: 'ccis-support@shrameva.com',
  },
  license: {
    name: 'Proprietary',
    url: 'https://shrameva.com/license',
  },
  servers: [
    {
      url: 'https://api.shrameva.com/v1',
      description: 'Production API',
    },
    {
      url: 'https://staging-api.shrameva.com/v1',
      description: 'Staging API',
    },
    {
      url: 'http://localhost:3000/v1',
      description: 'Development API',
    },
  ],
  tags: [
    {
      name: 'Assessment',
      description: 'Core assessment operations and lifecycle management',
    },
    {
      name: 'Session Management',
      description: 'Real-time session control and monitoring',
    },
    {
      name: 'Analytics',
      description: 'Advanced analytics, reporting, and insights',
    },
  ],
};

// API Route Definitions
export const ASSESSMENT_ROUTES = {
  // Core Assessment Routes
  START_ASSESSMENT: '/assessment/start',
  SUBMIT_INTERACTION: '/assessment/:sessionId/interact',
  COMPLETE_ASSESSMENT: '/assessment/:sessionId/complete',
  GET_ASSESSMENT: '/assessment/:sessionId',
  GET_LIVE_DATA: '/assessment/:sessionId/live',
  GET_PROGRESS: '/assessment/person/:personId/progress',
  DELETE_ASSESSMENT: '/assessment/:sessionId',

  // Session Management Routes
  GET_SESSION: '/session/:sessionId',
  PAUSE_SESSION: '/session/:sessionId/pause',
  RESUME_SESSION: '/session/:sessionId/resume',
  EXTEND_SESSION: '/session/:sessionId/extend',
  SESSION_ANALYTICS: '/session/:sessionId/analytics',
  SESSION_INTERVENTION: '/session/:sessionId/intervention',
  RESET_SESSION: '/session/:sessionId/reset',

  // Analytics Routes
  PERSON_ANALYTICS: '/analytics/person/:personId',
  COHORT_ANALYTICS: '/analytics/cohort/:cohortId',
  INSTITUTIONAL_ANALYTICS: '/analytics/institution/:institutionId',
  COMPETENCY_ANALYTICS: '/analytics/competency/:competencyType',
  SYSTEM_TRENDS: '/analytics/trends',
  GENERATE_REPORTS: '/analytics/reports',
  CUSTOM_ANALYTICS: '/analytics/custom',
};

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API Error Types
export enum ApiErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_REQUIRED = 'AUTHENTICATION_REQUIRED',
  AUTHORIZATION_DENIED = 'AUTHORIZATION_DENIED',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

// API Configuration Options
export interface ApiConfiguration {
  enableAuthentication: boolean;
  enableRateLimit: boolean;
  enableCaching: boolean;
  enableSwagger: boolean;
  enableLogging: boolean;
  enableMetrics: boolean;
  corsOptions?: {
    origin: string | string[];
    credentials: boolean;
    methods: string[];
  };
  rateLimitOptions?: {
    windowMs: number;
    max: number;
    message: string;
  };
}

export const DEFAULT_API_CONFIG: ApiConfiguration = {
  enableAuthentication: true,
  enableRateLimit: true,
  enableCaching: true,
  enableSwagger: true,
  enableLogging: true,
  enableMetrics: true,
  corsOptions: {
    origin: ['http://localhost:3000', 'https://app.shrameva.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  },
  rateLimitOptions: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
  },
};
