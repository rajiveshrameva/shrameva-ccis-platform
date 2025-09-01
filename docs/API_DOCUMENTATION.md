# CCIS Assessment API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Sample User Flows](#sample-user-flows)
5. [Error Handling](#error-handling)
6. [Postman Collection](#postman-collection)

## Overview

The CCIS (Confidence-Competence Independence Scale) Assessment API is a comprehensive system for evaluating student competencies across 7 core areas:

1. **Communication** - Written, verbal, and presentation skills
2. **Problem Solving** - Analytical thinking and solution development
3. **Teamwork** - Collaboration and interpersonal effectiveness
4. **Adaptability** - Flexibility and change management
5. **Time Management** - Planning and organizational skills
6. **Technical Skills** - Domain-specific technical competencies
7. **Leadership** - Influence and team guidance capabilities

### Key Features

- **Real-time Assessment**: Live behavioral signal collection during tasks
- **Adaptive Learning**: Dynamic difficulty adjustment based on performance
- **Gaming Detection**: Advanced pattern recognition to prevent cheating
- **Cultural Adaptation**: Context-aware assessment for different regions (India, UAE, International)
- **Comprehensive Analytics**: Multi-level insights and reporting
- **Session Management**: Fine-grained control over assessment sessions

### Base URL

- **Development**: `http://localhost:1905`
- **Staging**: `https://staging-api.shrameva.com/v1`
- **Production**: `https://api.shrameva.com/v1`

## Authentication

All API endpoints require Bearer token authentication:

```bash
Authorization: Bearer <your-jwt-token>
```

### Authentication Flow

1. User logs in through authentication service
2. Receives JWT token with role-based permissions
3. Include token in Authorization header for all requests
4. Token automatically refreshed when near expiration

### Supported Roles

- **Student**: Can start, interact with, and view own assessments
- **Educator**: Can view student assessments and analytics (with permissions)
- **Administrator**: Full access to all assessment operations
- **System**: Internal system access for automated processes

## API Endpoints

### Core Assessment Endpoints

#### 1. Start Assessment Session

**POST** `/assessment/start`

Initiates a new CCIS assessment session with adaptive configuration.

**Request Body:**

```json
{
  "personId": "person-123",
  "assessmentType": "comprehensive",
  "culturalContext": "INDIA",
  "languagePreference": "en",
  "maxDuration": 75,
  "assessmentPurpose": "initial_evaluation",
  "targetCompetencies": ["communication", "problem_solving", "teamwork"],
  "accessibilityNeeds": ["extended_time"],
  "metadata": {
    "tags": ["new_student", "engineering"],
    "priority": "normal"
  }
}
```

**Response:**

```json
{
  "sessionId": "session-789",
  "personId": "person-123",
  "status": "initializing",
  "assessmentInfo": {
    "assessmentType": "comprehensive",
    "targetCompetencies": [
      "communication",
      "problem_solving",
      "teamwork",
      "adaptability",
      "time_management",
      "technical_skills",
      "leadership"
    ],
    "culturalContext": "INDIA",
    "startTime": "2025-09-01T10:00:00Z",
    "maxDuration": 75,
    "estimatedTasks": 15,
    "currentTask": null
  },
  "configuration": {
    "difficultyLevel": "adaptive",
    "scaffoldingEnabled": true,
    "gamingDetectionActive": true,
    "culturalAdaptations": ["indian_educational_context"]
  },
  "progress": {
    "tasksCompleted": 0,
    "totalTasks": 15,
    "completionPercentage": 0,
    "timeElapsed": 0,
    "timeRemaining": 4500
  }
}
```

**Usage Example:**

```bash
curl -X POST http://localhost:1905/assessment/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "personId": "person-123",
    "assessmentType": "comprehensive",
    "culturalContext": "INDIA"
  }'
```

#### 2. Submit Task Interaction

**POST** `/assessment/{sessionId}/interact`

Records task interaction data during an assessment session for real-time CCIS calculation.

**Request Body:**

```json
{
  "sessionId": "session-789",
  "taskId": "task-456",
  "interactionType": "task_attempt",
  "competencyType": "communication",
  "startTime": "2025-09-01T10:15:00Z",
  "endTime": "2025-09-01T10:22:00Z",
  "duration": 420000,
  "interactionData": {
    "responses": ["answer1", "answer2"],
    "completionStatus": "completed",
    "qualityIndicators": {
      "accuracy": 0.85,
      "completeness": 1.0,
      "creativity": 0.7
    }
  },
  "behavioralSignals": {
    "hintsUsed": 1,
    "errorsCommitted": 2,
    "selfCorrectedErrors": 1,
    "confidencePrediction": 0.7,
    "confidenceActual": 0.8,
    "helpSeekingBehavior": {
      "resourcesAccessed": ["help_documentation"],
      "peersConsulted": false
    },
    "engagementMetrics": {
      "focusTime": 380000,
      "distractionEvents": 1,
      "taskSwitching": 0
    }
  },
  "metadata": {
    "taskDifficulty": "intermediate",
    "scaffoldingLevel": 2,
    "priorAttempts": 0,
    "culturalContext": "INDIA",
    "deviceInfo": "Chrome 128 on Windows 11"
  }
}
```

**Response:**

```json
{
  "sessionId": "session-789",
  "interactionId": "interaction-101",
  "status": "processed",
  "updatedProgress": {
    "tasksCompleted": 3,
    "totalTasks": 15,
    "completionPercentage": 20,
    "timeElapsed": 1200000,
    "timeRemaining": 3300000
  },
  "competencyUpdates": {
    "communication": {
      "previousLevel": 2.1,
      "currentLevel": 2.3,
      "confidence": 0.82,
      "evidenceStrength": "moderate"
    }
  },
  "recommendations": [
    "Consider attempting more complex communication tasks",
    "Practice peer review and feedback skills"
  ],
  "nextTask": {
    "taskId": "task-457",
    "competency": "problem_solving",
    "difficulty": "intermediate",
    "estimatedDuration": 8
  },
  "systemMetrics": {
    "responseTime": 145,
    "gamingRisk": "low",
    "dataQuality": "high"
  }
}
```

#### 3. Get Assessment Progress

**GET** `/assessment/person/{personId}/progress`

Retrieves comprehensive CCIS progress analytics for a person.

**Query Parameters:**

- `timeRange` (optional): "30d", "90d", "1y" (default: "90d")
- `includeComparative` (optional): Include peer comparisons (default: false)
- `includePredictive` (optional): Include predictive analytics (default: false)
- `includeHistorical` (optional): Include historical trends (default: false)

**Response:**

```json
{
  "personId": "person-123",
  "queryId": "progress-query-456",
  "generatedAt": "2025-09-01T10:30:00Z",
  "timeRange": {
    "startDate": "2025-06-01T00:00:00Z",
    "endDate": "2025-09-01T00:00:00Z",
    "days": 90
  },
  "overallSummary": {
    "averageLevel": 2.4,
    "averageConfidence": 0.76,
    "totalAssessments": 8,
    "assessmentHours": 12.5,
    "lastActivity": "2025-08-30T14:22:00Z",
    "progressTrend": "improving"
  },
  "competencyProgress": [
    {
      "competency": "communication",
      "currentLevel": 2.8,
      "confidence": 0.84,
      "progressTrend": "steady_improvement",
      "lastAssessment": "2025-08-30T14:22:00Z",
      "totalAssessments": 3,
      "interventionsReceived": 1,
      "strengths": ["written_communication", "presentation_skills"],
      "improvementAreas": ["active_listening", "cross_cultural_communication"]
    },
    {
      "competency": "problem_solving",
      "currentLevel": 2.1,
      "confidence": 0.71,
      "progressTrend": "gradual_improvement",
      "lastAssessment": "2025-08-28T11:15:00Z",
      "totalAssessments": 2,
      "interventionsReceived": 2,
      "strengths": ["analytical_thinking"],
      "improvementAreas": ["creative_problem_solving", "systems_thinking"]
    }
  ],
  "learningInsights": {
    "learningVelocity": "moderate",
    "optimalTaskDifficulty": "intermediate_to_advanced",
    "preferredLearningModalities": ["visual", "hands_on"],
    "peakPerformanceTimes": ["morning", "early_afternoon"],
    "effectiveInterventions": ["strategic_hints", "peer_collaboration"]
  },
  "achievements": [
    {
      "milestone": "communication_level_2_mastery",
      "achievedAt": "2025-08-15T09:30:00Z",
      "description": "Demonstrated consistent Level 2 communication competency"
    }
  ],
  "recommendations": [
    "Focus on advanced problem-solving scenarios",
    "Practice leadership skills in team settings",
    "Explore cross-cultural communication techniques"
  ]
}
```

### Session Management Endpoints

#### 4. Pause Assessment Session

**PUT** `/session/{sessionId}/pause`

Temporarily pauses an active assessment session while preserving state.

**Request Body:**

```json
{
  "reason": "technical_difficulty",
  "estimatedResumeTime": "2025-09-01T10:30:00Z",
  "metadata": {
    "issueType": "network_connectivity",
    "deviceInfo": "Chrome 128 on Windows 11",
    "errorCode": "NET_ERR_INTERNET_DISCONNECTED"
  }
}
```

**Response:**

```json
{
  "sessionId": "session-789",
  "status": "paused",
  "pausedAt": "2025-09-01T10:25:00Z",
  "reason": "technical_difficulty",
  "statePreserved": true,
  "resumeInstructions": "Session can be resumed within 24 hours",
  "progress": {
    "tasksCompleted": 5,
    "timeElapsedBeforePause": 1800000,
    "timeRemainingWhenResumed": 2700000
  }
}
```

#### 5. Resume Assessment Session

**PUT** `/session/{sessionId}/resume`

Resumes a paused assessment session with state validation.

**Response:**

```json
{
  "sessionId": "session-789",
  "status": "active",
  "resumedAt": "2025-09-01T10:35:00Z",
  "pauseDuration": 600000,
  "stateValidated": true,
  "continuityCheckPassed": true,
  "adjustments": {
    "timeExtensionGranted": 300000,
    "difficultyMaintained": true,
    "behavioralContextRestored": true
  }
}
```

### Analytics Endpoints

#### 6. Individual Analytics

**GET** `/analytics/person/{personId}`

Comprehensive analytics for individual learner progress.

**Query Parameters:**

- `timeRange`: Time period for analysis
- `includeComparative`: Include peer comparisons
- `includePredictive`: Include future projections
- `format`: Detail level (summary, detailed, comprehensive)

**Response:**

```json
{
  "personId": "person-123",
  "analyticsType": "individual_comprehensive",
  "generatedAt": "2025-09-01T10:40:00Z",
  "learningProfile": {
    "primaryLearningStyle": "visual_kinesthetic",
    "cognitiveLoad": "optimal",
    "motivationLevel": "high",
    "resilienceScore": 0.78,
    "adaptabilityIndex": 0.73
  },
  "performancePatterns": {
    "optimalPerformanceWindows": ["09:00-11:00", "14:00-16:00"],
    "difficultyPreference": "moderate_challenge",
    "feedbackResponsiveness": "high",
    "helpSeekingPattern": "strategic",
    "errorRecoveryRate": 0.85
  },
  "competencyTrajectories": [
    {
      "competency": "communication",
      "trajectory": "accelerating",
      "projectedLevel": 3.2,
      "timeToMastery": "4-6 weeks",
      "confidenceGrowth": "steady"
    }
  ],
  "interventionEffectiveness": {
    "mostEffective": ["strategic_hints", "peer_collaboration"],
    "leastEffective": ["direct_instruction"],
    "optimalTiming": "early_in_task",
    "preferredDelivery": "contextual"
  }
}
```

#### 7. Custom Analytics Query

**POST** `/analytics/custom`

Execute custom analytics queries with flexible parameters.

**Request Body:**

```json
{
  "dimensions": ["competency", "cultural_context"],
  "metrics": ["average_level", "completion_rate", "confidence_score"],
  "filters": {
    "timeRange": {
      "startDate": "2025-01-01T00:00:00Z",
      "endDate": "2025-12-31T23:59:59Z"
    },
    "ageGroup": "18-25",
    "institutionType": "engineering"
  },
  "groupBy": ["competency"],
  "orderBy": "average_level DESC",
  "limit": 10
}
```

**Response:**

```json
{
  "queryId": "custom-analytics-789",
  "executedAt": "2025-09-01T10:45:00Z",
  "dimensions": ["competency", "cultural_context"],
  "metrics": ["average_level", "completion_rate", "confidence_score"],
  "data": [
    {
      "competency": "communication",
      "cultural_context": "INDIA",
      "average_level": 2.65,
      "completion_rate": 0.89,
      "confidence_score": 0.82,
      "sample_size": 1247
    },
    {
      "competency": "technical_skills",
      "cultural_context": "INDIA",
      "average_level": 2.58,
      "completion_rate": 0.85,
      "confidence_score": 0.79,
      "sample_size": 1156
    }
  ],
  "summary": {
    "totalRecords": 21,
    "aggregations": {
      "overall_average_level": 2.34,
      "overall_completion_rate": 0.83,
      "overall_confidence": 0.76
    },
    "insights": [
      "Communication competency shows highest average levels across cultures",
      "Technical skills show strong performance in Indian context",
      "Confidence scores correlate strongly with completion rates"
    ]
  },
  "metadata": {
    "executionTime": 234,
    "dataFreshness": "2025-09-01T10:30:00Z",
    "cacheHit": false
  }
}
```

## Sample User Flows

### Flow 1: Complete Student Assessment Journey

```mermaid
sequenceDiagram
    participant Student
    participant API
    participant AssessmentEngine
    participant Analytics

    Student->>API: POST /assessment/start
    API->>AssessmentEngine: Initialize session
    AssessmentEngine->>API: Session created
    API->>Student: Return session details

    loop For each task
        Student->>API: POST /assessment/{sessionId}/interact
        API->>AssessmentEngine: Process interaction
        AssessmentEngine->>Analytics: Update CCIS calculations
        Analytics->>AssessmentEngine: Return updated levels
        AssessmentEngine->>API: Interaction processed
        API->>Student: Return progress update
    end

    Student->>API: PUT /assessment/{sessionId}/complete
    API->>AssessmentEngine: Finalize assessment
    AssessmentEngine->>Analytics: Generate final report
    Analytics->>API: Complete analytics
    API->>Student: Final results and recommendations
```

#### Step-by-Step Implementation:

**Step 1: Start Assessment**

```bash
curl -X POST http://localhost:1905/assessment/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "personId": "student-001",
    "assessmentType": "comprehensive",
    "culturalContext": "INDIA",
    "languagePreference": "en"
  }'
```

**Step 2: Submit Multiple Interactions**

```bash
# First task interaction
curl -X POST http://localhost:1905/assessment/session-789/interact \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "sessionId": "session-789",
    "taskId": "task-001",
    "interactionType": "task_attempt",
    "competencyType": "communication",
    "interactionData": {
      "responses": ["Written communication response"],
      "completionStatus": "completed"
    },
    "behavioralSignals": {
      "hintsUsed": 0,
      "errorsCommitted": 1,
      "confidencePrediction": 0.8
    }
  }'

# Second task interaction
curl -X POST http://localhost:1905/assessment/session-789/interact \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "sessionId": "session-789",
    "taskId": "task-002",
    "interactionType": "task_attempt",
    "competencyType": "problem_solving",
    "interactionData": {
      "responses": ["Problem solution approach"],
      "completionStatus": "completed"
    },
    "behavioralSignals": {
      "hintsUsed": 2,
      "errorsCommitted": 0,
      "confidencePrediction": 0.6
    }
  }'
```

**Step 3: Complete Assessment**

```bash
curl -X PUT http://localhost:1905/assessment/session-789/complete \
  -H "Authorization: Bearer your-token"
```

**Step 4: Get Progress Analytics**

```bash
curl -X GET "http://localhost:1905/assessment/person/student-001/progress?includeComparative=true&includePredictive=true" \
  -H "Authorization: Bearer your-token"
```

### Flow 2: Educator Monitoring Student Progress

```mermaid
sequenceDiagram
    participant Educator
    participant API
    participant Analytics
    participant Database

    Educator->>API: GET /analytics/person/{studentId}
    API->>Analytics: Request individual analytics
    Analytics->>Database: Query assessment data
    Database->>Analytics: Return data
    Analytics->>API: Processed analytics
    API->>Educator: Individual student insights

    Educator->>API: GET /analytics/cohort/{cohortId}
    API->>Analytics: Request cohort analytics
    Analytics->>Database: Query cohort data
    Database->>Analytics: Return aggregated data
    Analytics->>API: Cohort insights
    API->>Educator: Class-level analytics

    Educator->>API: POST /analytics/custom
    API->>Analytics: Execute custom query
    Analytics->>Database: Custom data query
    Database->>Analytics: Custom results
    Analytics->>API: Custom analytics
    API->>Educator: Tailored insights
```

#### Implementation:

**View Individual Student Progress:**

```bash
curl -X GET "http://localhost:1905/analytics/person/student-001?timeRange=30d&includeComparative=true" \
  -H "Authorization: Bearer educator-token"
```

**View Cohort Analytics:**

```bash
curl -X GET "http://localhost:1905/analytics/cohort/engineering-2025?includeComparisons=true" \
  -H "Authorization: Bearer educator-token"
```

**Custom Analytics Query:**

```bash
curl -X POST http://localhost:1905/analytics/custom \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer educator-token" \
  -d '{
    "dimensions": ["competency", "student_year"],
    "metrics": ["average_level", "improvement_rate"],
    "filters": {
      "cohort": "engineering-2025",
      "timeRange": {
        "startDate": "2025-08-01T00:00:00Z",
        "endDate": "2025-09-01T00:00:00Z"
      }
    },
    "groupBy": ["competency"],
    "orderBy": "improvement_rate DESC"
  }'
```

### Flow 3: Session Management During Technical Issues

```mermaid
sequenceDiagram
    participant Student
    participant API
    participant SessionManager
    participant StateStore

    Student->>API: Assessment in progress
    Note over Student,API: Network issue occurs

    Student->>API: PUT /session/{sessionId}/pause
    API->>SessionManager: Pause request
    SessionManager->>StateStore: Save current state
    StateStore->>SessionManager: State saved
    SessionManager->>API: Session paused
    API->>Student: Pause confirmation

    Note over Student,API: Issue resolved

    Student->>API: PUT /session/{sessionId}/resume
    API->>SessionManager: Resume request
    SessionManager->>StateStore: Validate saved state
    StateStore->>SessionManager: State valid
    SessionManager->>API: Session resumed
    API->>Student: Resume confirmation

    Student->>API: Continue assessment
```

#### Implementation:

**Pause Session During Issues:**

```bash
curl -X PUT http://localhost:1905/session/session-789/pause \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "reason": "technical_difficulty",
    "metadata": {
      "issueType": "network_connectivity",
      "errorDescription": "Connection timeout"
    }
  }'
```

**Resume Session After Resolution:**

```bash
curl -X PUT http://localhost:1905/session/session-789/resume \
  -H "Authorization: Bearer your-token"
```

**Extend Session Time if Needed:**

```bash
curl -X PUT http://localhost:1905/session/session-789/extend \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "additionalMinutes": 15,
    "reason": "Technical difficulties caused delays",
    "justification": "Network issues required session restart"
  }'
```

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Assessment type must be one of: comprehensive, targeted, progress, remediation",
    "details": {
      "field": "assessmentType",
      "providedValue": "invalid_type",
      "allowedValues": ["comprehensive", "targeted", "progress", "remediation"]
    },
    "timestamp": "2025-09-01T10:50:00Z",
    "requestId": "req-123456"
  }
}
```

### Common Error Codes

| Code                      | Description              | HTTP Status |
| ------------------------- | ------------------------ | ----------- |
| `VALIDATION_ERROR`        | Invalid input parameters | 400         |
| `AUTHENTICATION_REQUIRED` | Missing or invalid token | 401         |
| `AUTHORIZATION_DENIED`    | Insufficient permissions | 403         |
| `RESOURCE_NOT_FOUND`      | Session/person not found | 404         |
| `RESOURCE_CONFLICT`       | Duplicate session exists | 409         |
| `RATE_LIMIT_EXCEEDED`     | Too many requests        | 429         |
| `INTERNAL_SERVER_ERROR`   | Server processing error  | 500         |

### Error Handling Examples

**Validation Error:**

```bash
# Invalid assessment type
curl -X POST http://localhost:1905/assessment/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "personId": "student-001",
    "assessmentType": "invalid_type"
  }'

# Response:
{
  "statusCode": 400,
  "message": ["Assessment type must be one of: comprehensive, targeted, progress, remediation"],
  "error": "Bad Request"
}
```

**Authentication Error:**

```bash
# Missing token
curl -X GET http://localhost:1905/assessment/person/student-001/progress

# Response:
{
  "statusCode": 401,
  "message": "Access token is required for assessment operations",
  "error": "Unauthorized"
}
```

**Authorization Error:**

```bash
# Student trying to access another student's data
curl -X GET http://localhost:1905/assessment/person/other-student/progress \
  -H "Authorization: Bearer student-token"

# Response:
{
  "statusCode": 403,
  "message": "Insufficient permissions for assessment operations",
  "error": "Forbidden"
}
```

## Testing the API

### Quick Health Check

```bash
curl -X GET http://localhost:1905/ \
  -H "Accept: application/json"
```

### API Documentation

- **Swagger UI**: http://localhost:1905/api
- **Alternative Docs**: http://localhost:1905/docs

### Environment Setup

**Development Environment:**

```bash
# Start the development server
npm run start:dev

# Access API at http://localhost:1905
# View documentation at http://localhost:1905/api
```

**Environment Variables:**

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/ccis_db"
JWT_SECRET="your-jwt-secret"
CORS_ORIGIN="http://localhost:3000,https://app.shrameva.com"
LOG_LEVEL="debug"
```

This comprehensive documentation provides everything needed to integrate with and use the CCIS Assessment API effectively. The examples show real-world usage patterns and the user flows demonstrate complete assessment scenarios from start to finish.
