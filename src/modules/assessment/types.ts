/**
 * Assessment Types Index
 *
 * Central type definitions for the assessment module.
 * These types are used across all layers for consistency.
 */

// Domain Types
export interface AssessmentSessionData {
  id: string;
  personId: string;
  status: string;
  startTime: Date;
  endTime?: Date;
  assessmentType: string;
  culturalContext: string;
}

export interface TaskInteractionData {
  id: string;
  sessionId: string;
  taskId: string;
  interactionType: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
}

export interface BehavioralSignalsData {
  hintsUsed: number;
  errorsCommitted: number;
  selfCorrectedErrors: number;
  confidencePrediction: number;
  confidenceActual?: number;
}

// Application Types
export interface AssessmentCommand {
  type: string;
  payload: any;
  metadata?: Record<string, any>;
}

export interface AssessmentQuery {
  type: string;
  parameters: any;
  options?: Record<string, any>;
}

export interface AssessmentResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

// API Types
export interface AssessmentRequest {
  personId: string;
  assessmentType: string;
  culturalContext?: string;
  languagePreference?: string;
}

export interface AssessmentResponse {
  sessionId: string;
  status: string;
  progress: number;
  currentLevel?: number;
  recommendations?: string[];
}

export interface ProgressAnalytics {
  personId: string;
  competencyProgress: Array<{
    competency: string;
    currentLevel: number;
    confidence: number;
  }>;
  overallProgress: number;
  insights: string[];
}
