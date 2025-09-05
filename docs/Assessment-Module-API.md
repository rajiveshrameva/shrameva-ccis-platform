# Assessment Module Documentation

## Overview

The Assessment Module is the core innovation of the Shrameva CCIS (Confidence-Competence Independence Scale) platform. It implements an AI-powered assessment system that measures student competency across 7 key areas using behavioral signal analysis and machine learning.

## Architecture

The Assessment Module follows Clean Architecture principles with four distinct layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │           AssessmentController (REST API)              │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│  ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐  │
│  │ AssessmentService│ │ AssessmentHandlers│ │     DTOs     │  │
│  └─────────────────┘ └─────────────────┘ └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Domain Layer                             │
│  ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐  │
│  │   Assessment    │ │  Value Objects  │ │ Domain Events │  │
│  │   Aggregate     │ │ (CCIS, Signals) │ │               │  │
│  └─────────────────┘ └─────────────────┘ └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                        │
│  ┌─────────────────┐ ┌─────────────────┐                    │
│  │ Prisma Repository│ │ Claude AI Service│                   │
│  └─────────────────┘ └─────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

## Core Concepts

### CCIS Methodology

The Confidence-Competence Independence Scale (CCIS) measures student progression across 4 levels:

| Level | Name                    | Score Range | Description                                |
| ----- | ----------------------- | ----------- | ------------------------------------------ |
| 1     | Dependent Learner       | 0-25%       | Requires constant guidance and support     |
| 2     | Guided Practitioner     | 25-50%      | Can work with structured guidance          |
| 3     | Developing Practitioner | 50-75%      | Shows independence with occasional support |
| 4     | Independent Learner     | 75-100%     | Fully autonomous and self-directed         |

### Competency Framework

The platform assesses 7 core competencies:

1. **BUSINESS_COMMUNICATION** - Written and verbal communication skills
2. **DATA_ANALYSIS** - Data interpretation and analytical thinking
3. **TECHNICAL_KNOWLEDGE** - Domain-specific technical skills
4. **PROJECT_MANAGEMENT** - Planning, execution, and delivery
5. **CRITICAL_THINKING** - Problem-solving and reasoning
6. **LEADERSHIP_COLLABORATION** - Team leadership and collaboration
7. **INNOVATION_ADAPTABILITY** - Creative thinking and adaptability

### Behavioral Signals

The AI assessment analyzes 7 weighted behavioral signals:

| Signal                     | Weight | Description                         | Source             |
| -------------------------- | ------ | ----------------------------------- | ------------------ |
| Hint Request Frequency     | 35%    | Lower = better independence         | System/Task Engine |
| Error Recovery Speed       | 25%    | Higher = better self-correction     | System/Task Engine |
| Transfer Success Rate      | 20%    | Higher = better skill application   | AI/Assessment      |
| Metacognitive Accuracy     | 10%    | Higher = better self-awareness      | UI/Self-Assessment |
| Task Completion Efficiency | 5%     | Higher = better improvement         | System/Task Engine |
| Help-Seeking Quality       | 3%     | Higher = better strategic help      | AI/NLP Analysis    |
| Self-Assessment Alignment  | 2%     | Higher = better prediction accuracy | UI/Self-Assessment |

## REST API Endpoints

### Base URL

```
http://localhost:3000/api/v1/assessments
```

---

## 1. Create Assessment

**Endpoint:** `POST /api/v1/assessments`

**Description:** Creates a new CCIS assessment using AI-powered behavioral signal analysis.

### Request Parameters

| Parameter                 | Type     | Required | Source             | Description                           | Example                                  |
| ------------------------- | -------- | -------- | ------------------ | ------------------------------------- | ---------------------------------------- |
| `personId`                | string   | ✅       | UI/System          | UUID of the person being assessed     | `"550e8400-e29b-41d4-a716-446655440000"` |
| `competencyType`          | string   | ✅       | UI/System          | Competency being assessed             | `"BUSINESS_COMMUNICATION"`               |
| `taskIds`                 | string[] | ✅       | System/Task Engine | Array of task IDs completed           | `["task-1", "task-2", "task-3"]`         |
| `sessionDuration`         | number   | ✅       | System/Timer       | Assessment duration in minutes        | `25`                                     |
| `distractionEvents`       | number   | ✅       | System/Analytics   | Number of distraction events detected | `2`                                      |
| `hintRequestFrequency`    | number   | ✅       | System/Task Engine | Normalized hint requests (0.0-1.0)    | `0.3`                                    |
| `errorRecoveryTime`       | number   | ✅       | System/Task Engine | Error recovery speed (0.0-1.0)        | `0.8`                                    |
| `transferSuccessRate`     | number   | ✅       | AI/Assessment      | Skill transfer success (0.0-1.0)      | `0.7`                                    |
| `metacognitiveAccuracy`   | number   | ✅       | UI/Self-Assessment | Self-awareness accuracy (0.0-1.0)     | `0.6`                                    |
| `taskCompletionTime`      | number   | ✅       | System/Task Engine | Task completion efficiency (0.0-1.0)  | `0.9`                                    |
| `helpSeekingQuality`      | number   | ✅       | AI/NLP Analysis    | Help-seeking quality (0.0-10.0)       | `7.5`                                    |
| `selfAssessmentAlignment` | number   | ✅       | UI/Self-Assessment | Prediction accuracy (0.0-1.0)         | `0.65`                                   |
| `previousCcisLevel`       | number   | ❌       | System/Database    | Previous CCIS level (1-4)             | `2`                                      |

### Example Request

```bash
curl -X POST http://localhost:3000/api/v1/assessments \
  -H "Content-Type: application/json" \
  -d '{
    "personId": "550e8400-e29b-41d4-a716-446655440000",
    "competencyType": "BUSINESS_COMMUNICATION",
    "taskIds": ["task-1", "task-2", "task-3"],
    "sessionDuration": 25,
    "distractionEvents": 2,
    "hintRequestFrequency": 0.3,
    "errorRecoveryTime": 0.8,
    "transferSuccessRate": 0.7,
    "metacognitiveAccuracy": 0.6,
    "taskCompletionTime": 0.9,
    "helpSeekingQuality": 7.5,
    "selfAssessmentAlignment": 0.65,
    "previousCcisLevel": 2
  }'
```

### Example Response

```json
{
  "id": "assessment-550e8400-e29b-41d4-a716-446655440001",
  "personId": "550e8400-e29b-41d4-a716-446655440000",
  "competencyType": "BUSINESS_COMMUNICATION",
  "ccisLevel": 3,
  "confidenceScore": 0.85,
  "assessmentDate": "2025-09-05T13:20:00.000Z",
  "aiReasoningTrace": "Analysis: Strong error recovery (0.8) and transfer success (0.7) indicate developing independence. Moderate hint requests (0.3) suggest guided practice level. Overall weighted score: 0.73 → CCIS Level 3",
  "aiModelUsed": "claude-3-5-sonnet-20240620",
  "aiPromptVersion": "1.0.0",
  "taskIds": ["task-1", "task-2", "task-3"],
  "sessionDuration": 25,
  "distractionEvents": 2,
  "previousCcisLevel": 2,
  "nextLevelRequirements": [
    "Reduce hint request frequency to below 0.2",
    "Maintain error recovery speed above 0.8",
    "Demonstrate consistent transfer success above 0.8"
  ],
  "isLevelProgression": true,
  "validationFlags": [],
  "humanReviewRequired": false,
  "behavioralSignals": {
    "hintRequestFrequency": 0.3,
    "errorRecoveryTime": 0.8,
    "transferSuccessRate": 0.7,
    "metacognitiveAccuracy": 0.6,
    "taskCompletionTime": 0.9,
    "helpSeekingQuality": 7.5,
    "selfAssessmentAlignment": 0.65,
    "signalStrength": 0.73
  }
}
```

---

## 2. Get Assessment by ID

**Endpoint:** `GET /api/v1/assessments/{id}`

**Description:** Retrieves a specific assessment by its ID.

### Path Parameters

| Parameter | Type   | Description     | Example                                           |
| --------- | ------ | --------------- | ------------------------------------------------- |
| `id`      | string | Assessment UUID | `assessment-550e8400-e29b-41d4-a716-446655440001` |

### Example Request

```bash
curl -X GET http://localhost:3000/api/v1/assessments/assessment-550e8400-e29b-41d4-a716-446655440001
```

---

## 3. Get Assessments by Person

**Endpoint:** `GET /api/v1/assessments/person/{personId}`

**Description:** Retrieves all assessments for a specific person.

### Path Parameters

| Parameter  | Type   | Description | Example                                |
| ---------- | ------ | ----------- | -------------------------------------- |
| `personId` | string | Person UUID | `550e8400-e29b-41d4-a716-446655440000` |

### Query Parameters

| Parameter        | Type   | Required | Description               | Example                  |
| ---------------- | ------ | -------- | ------------------------- | ------------------------ |
| `competencyType` | string | ❌       | Filter by competency type | `BUSINESS_COMMUNICATION` |

### Example Request

```bash
curl -X GET "http://localhost:3000/api/v1/assessments/person/550e8400-e29b-41d4-a716-446655440000?competencyType=BUSINESS_COMMUNICATION"
```

---

## 4. Get Latest Assessment

**Endpoint:** `GET /api/v1/assessments/person/{personId}/latest/{competencyType}`

**Description:** Gets the most recent assessment for a person in a specific competency.

### Path Parameters

| Parameter        | Type   | Description     | Example                                |
| ---------------- | ------ | --------------- | -------------------------------------- |
| `personId`       | string | Person UUID     | `550e8400-e29b-41d4-a716-446655440000` |
| `competencyType` | string | Competency type | `BUSINESS_COMMUNICATION`               |

### Example Request

```bash
curl -X GET http://localhost:3000/api/v1/assessments/person/550e8400-e29b-41d4-a716-446655440000/latest/BUSINESS_COMMUNICATION
```

---

## 5. Get Review Queue (Admin)

**Endpoint:** `GET /api/v1/assessments/admin/review-queue`

**Description:** Retrieves assessments requiring human review (admin endpoint).

### Example Request

```bash
curl -X GET http://localhost:3000/api/v1/assessments/admin/review-queue
```

---

## 6. Submit Assessment Review

**Endpoint:** `PUT /api/v1/assessments/{id}/review`

**Description:** Submits a human review for an assessment.

### Path Parameters

| Parameter | Type   | Description     | Example                                           |
| --------- | ------ | --------------- | ------------------------------------------------- |
| `id`      | string | Assessment UUID | `assessment-550e8400-e29b-41d4-a716-446655440001` |

### Request Parameters

| Parameter      | Type    | Required | Source            | Description            | Example                                             |
| -------------- | ------- | -------- | ----------------- | ---------------------- | --------------------------------------------------- |
| `assessmentId` | string  | ✅       | System            | Assessment UUID        | `"assessment-550e8400-e29b-41d4-a716-446655440001"` |
| `reviewNotes`  | string  | ✅       | UI/Human Reviewer | Review comments        | `"Confirmed CCIS level after manual verification"`  |
| `approved`     | boolean | ✅       | UI/Human Reviewer | Review approval status | `true`                                              |

### Example Request

```bash
curl -X PUT http://localhost:3000/api/v1/assessments/assessment-550e8400-e29b-41d4-a716-446655440001/review \
  -H "Content-Type: application/json" \
  -d '{
    "assessmentId": "assessment-550e8400-e29b-41d4-a716-446655440001",
    "reviewNotes": "Confirmed CCIS level after manual verification",
    "approved": true
  }'
```

---

## 7. Query Assessments

**Endpoint:** `GET /api/v1/assessments`

**Description:** Retrieves assessments with various filters and pagination.

### Query Parameters

| Parameter        | Type    | Required | Source    | Description                  | Example                                |
| ---------------- | ------- | -------- | --------- | ---------------------------- | -------------------------------------- |
| `personId`       | string  | ❌       | UI/System | Filter by person             | `550e8400-e29b-41d4-a716-446655440000` |
| `competencyType` | string  | ❌       | UI/System | Filter by competency         | `BUSINESS_COMMUNICATION`               |
| `ccisLevel`      | number  | ❌       | UI/System | Filter by CCIS level (1-4)   | `3`                                    |
| `requiresReview` | boolean | ❌       | UI/System | Filter by review requirement | `true`                                 |
| `fromDate`       | string  | ❌       | UI/System | Filter from date (ISO 8601)  | `2025-09-01T00:00:00Z`                 |
| `toDate`         | string  | ❌       | UI/System | Filter to date (ISO 8601)    | `2025-09-30T23:59:59Z`                 |
| `limit`          | number  | ❌       | UI/System | Results per page             | `20`                                   |
| `offset`         | number  | ❌       | UI/System | Results offset               | `0`                                    |

### Example Request

```bash
curl -X GET "http://localhost:3000/api/v1/assessments?competencyType=BUSINESS_COMMUNICATION&ccisLevel=3&limit=10&offset=0"
```

---

## 8. Get Assessment Progression

**Endpoint:** `GET /api/v1/assessments/person/{personId}/progression`

**Description:** Retrieves CCIS progression analytics for a person across all competencies.

### Path Parameters

| Parameter  | Type   | Description | Example                                |
| ---------- | ------ | ----------- | -------------------------------------- |
| `personId` | string | Person UUID | `550e8400-e29b-41d4-a716-446655440000` |

### Example Request

```bash
curl -X GET http://localhost:3000/api/v1/assessments/person/550e8400-e29b-41d4-a716-446655440000/progression
```

### Example Response

```json
[
  {
    "id": "assessment-1",
    "personId": "550e8400-e29b-41d4-a716-446655440000",
    "competencyType": "BUSINESS_COMMUNICATION",
    "ccisLevel": 3,
    "confidenceScore": 0.85,
    "assessmentDate": "2025-09-05T13:20:00.000Z",
    "isValid": true,
    "requiresReview": false
  },
  {
    "id": "assessment-2",
    "personId": "550e8400-e29b-41d4-a716-446655440000",
    "competencyType": "DATA_ANALYSIS",
    "ccisLevel": 2,
    "confidenceScore": 0.72,
    "assessmentDate": "2025-09-04T10:15:00.000Z",
    "isValid": true,
    "requiresReview": false
  }
]
```

---

## 9. Get Assessment Analytics

**Endpoint:** `GET /api/v1/assessments/analytics/summary`

**Description:** Retrieves system-wide assessment analytics and metrics.

### Example Request

```bash
curl -X GET http://localhost:3000/api/v1/assessments/analytics/summary
```

### Example Response

```json
{
  "totalAssessments": 1247,
  "ccisLevelDistribution": {
    "1": 156,
    "2": 398,
    "3": 521,
    "4": 172
  },
  "avgConfidenceScore": 0.78,
  "reviewQueueSize": 23
}
```

---

## Parameter Sources

### UI (User Interface)

- **Self-Assessment Parameters**: `metacognitiveAccuracy`, `selfAssessmentAlignment`
- **User Selections**: `competencyType`, filter parameters
- **Human Review**: `reviewNotes`, `approved`

### System/Task Engine

- **Behavioral Tracking**: `hintRequestFrequency`, `errorRecoveryTime`, `taskCompletionTime`
- **Session Data**: `sessionDuration`, `distractionEvents`, `taskIds`
- **Database Lookups**: `personId`, `previousCcisLevel`

### AI/ML Analysis

- **Advanced Metrics**: `transferSuccessRate`, `helpSeekingQuality`
- **NLP Processing**: Help-seeking quality analysis
- **Pattern Recognition**: Skill transfer assessment

## Error Handling

### Common Error Responses

#### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": [
    "personId must be a non-empty string",
    "competencyType must be a valid competency type",
    "hintRequestFrequency must be between 0 and 1"
  ],
  "error": "Bad Request"
}
```

#### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Assessment not found",
  "error": "Not Found"
}
```

#### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "AI service temporarily unavailable",
  "error": "Internal Server Error"
}
```

## Validation Rules

### Behavioral Signals Validation

| Parameter                 | Min | Max  | Description                 |
| ------------------------- | --- | ---- | --------------------------- |
| `hintRequestFrequency`    | 0.0 | 1.0  | Normalized hint requests    |
| `errorRecoveryTime`       | 0.0 | 1.0  | Normalized recovery speed   |
| `transferSuccessRate`     | 0.0 | 1.0  | Skill transfer success rate |
| `metacognitiveAccuracy`   | 0.0 | 1.0  | Self-assessment accuracy    |
| `taskCompletionTime`      | 0.0 | 1.0  | Task completion efficiency  |
| `helpSeekingQuality`      | 0.0 | 10.0 | Help-seeking quality score  |
| `selfAssessmentAlignment` | 0.0 | 1.0  | Prediction accuracy         |

### Business Rules

1. **Assessment Frequency**: Maximum 1 assessment per competency per day per person
2. **Minimum Session Duration**: At least 5 minutes for valid assessment
3. **Task Coverage**: Minimum 3 tasks required for reliable assessment
4. **Human Review Triggers**:
   - Confidence score below 0.6
   - Level progression > 1 level jump
   - Conflicting behavioral signals

## Integration Examples

### Frontend Integration

```typescript
// React/TypeScript example
const createAssessment = async (assessmentData: CreateAssessmentRequest) => {
  const response = await fetch('/api/v1/assessments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(assessmentData),
  });

  if (!response.ok) {
    throw new Error('Assessment creation failed');
  }

  return await response.json();
};
```

### Task Engine Integration

```typescript
// Task completion callback
const onTaskCompleted = async (taskResult: TaskResult) => {
  const behavioralSignals = await analyzeBehavioralSignals(taskResult);

  const assessmentRequest = {
    personId: taskResult.personId,
    competencyType: taskResult.competencyType,
    taskIds: taskResult.completedTasks,
    sessionDuration: taskResult.sessionDuration,
    distractionEvents: taskResult.distractionEvents,
    ...behavioralSignals,
  };

  const assessment = await createAssessment(assessmentRequest);
  await updatePersonSkillPassport(assessment);
};
```

### Analytics Dashboard Integration

```typescript
// Dashboard data fetching
const getDashboardData = async (personId: string) => {
  const [progression, analytics] = await Promise.all([
    fetch(`/api/v1/assessments/person/${personId}/progression`),
    fetch('/api/v1/assessments/analytics/summary'),
  ]);

  return {
    userProgression: await progression.json(),
    systemAnalytics: await analytics.json(),
  };
};
```

## AI Integration

The Assessment Module integrates with Claude 3.5 Sonnet for intelligent CCIS level determination:

### AI Prompt Structure

```
Analyze the following behavioral signals for CCIS assessment:
- Competency: {competencyType}
- Previous Level: {previousCcisLevel}
- Behavioral Signals: {signals}
- Session Context: {context}

Determine CCIS level (1-4) and provide reasoning.
```

### AI Response Processing

```typescript
const processAIResponse = (aiResponse: string) => {
  const ccisLevel = extractCCISLevel(aiResponse);
  const reasoning = extractReasoning(aiResponse);
  const confidence = calculateConfidence(reasoning);

  return {
    ccisLevel,
    aiReasoningTrace: reasoning,
    confidenceScore: confidence,
    humanReviewRequired: confidence < 0.6,
  };
};
```

## Performance Considerations

- **Response Time**: Target < 2 seconds for assessment creation
- **Throughput**: Supports up to 100 concurrent assessments
- **Caching**: Assessment results cached for 24 hours
- **Rate Limiting**: 10 assessments per minute per person

## Security & Privacy

- **Data Privacy**: Behavioral signals are anonymized after 90 days
- **Access Control**: Person data accessible only to authorized users
- **Audit Trail**: All assessment modifications logged
- **GDPR Compliance**: Right to deletion and data portability supported

---

_This documentation covers the Assessment Module APIs as of September 2025. For the latest updates and additional endpoints, refer to the Swagger documentation at `/api`._
