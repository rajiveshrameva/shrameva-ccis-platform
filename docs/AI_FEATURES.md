# 🤖 Shrameva CCIS - AI-Powered Features

This implementation adds comprehensive AI-powered features to the Shrameva CCIS platform, including intelligent task generation, personalized learning paths, and advanced analytics.

## 🎯 Overview

The AI features enhance the CCIS platform with:

- **AI Task Generation**: Claude 3.5 Sonnet integration for personalized task creation
- **Learning Paths**: Adaptive learning sequences with intelligent milestone progression
- **Advanced Analytics**: Cross-competency analysis, skill transfer tracking, and predictive modeling

## 🏗️ Architecture

### New Services

#### 1. AITaskGenerationService

- **Location**: `src/modules/task/infrastructure/services/ai-task-generation.service.ts`
- **Purpose**: AI-powered task generation with Claude 3.5 Sonnet
- **Features**:
  - Personalized task creation based on student profiles
  - Adaptive task sequences with progressive difficulty
  - Transfer learning variations for cross-competency development
  - Quality assessment and validation
  - Industry-specific contextualization

#### 2. LearningPathService

- **Location**: `src/modules/task/infrastructure/services/learning-path.service.ts`
- **Purpose**: Personalized learning path management
- **Features**:
  - AI-driven path generation based on competency goals
  - Adaptive milestone progression
  - Performance-based path adjustments
  - Progress tracking with predictive analytics
  - Intervention recommendations

#### 3. AdvancedAnalyticsService

- **Location**: `src/modules/task/infrastructure/services/advanced-analytics.service.ts`
- **Purpose**: Sophisticated analytics for learning optimization
- **Features**:
  - Competency progression analysis
  - Cross-competency skill transfer mapping
  - Predictive modeling for learning outcomes
  - Cohort performance comparisons
  - Risk factor identification

### New Database Models

#### Core AI Models

```prisma
model AITaskGenerationTemplate {
  id                String   @id @default(cuid())
  competencyId      String
  ccisLevel         Int
  industryContext   String?
  templateContent   Json
  qualityScore      Float?
  usageCount        Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model AIGeneratedTask {
  id                  String   @id @default(cuid())
  taskId              String   @unique
  personId            String
  competencyId        String
  generationRequest   Json
  aiResponse          Json
  qualityMetrics      Json?
  personalizationData Json?
  createdAt           DateTime @default(now())
}
```

#### Learning Path Models

```prisma
model LearningPath {
  id                  String              @id @default(cuid())
  name                String
  description         String?
  personId            String
  competencyFocus     String[]
  targetCCISLevel     Int
  estimatedDuration   Int
  milestones          LearningMilestone[]
  // ... additional fields
}

model LearningMilestone {
  id                String       @id @default(cuid())
  pathId            String
  name              String
  description       String?
  competencyId      String
  requiredCCISLevel Int
  estimatedHours    Int
  // ... additional fields
}
```

#### Analytics Models

```prisma
model CompetencyAnalytics {
  id               String   @id @default(cuid())
  personId         String
  competencyId     String
  analysisType     AnalysisType
  timeRange        Json
  progressData     Json
  insights         Json
  recommendations  Json?
  createdAt        DateTime @default(now())
}

model CrossCompetencyAnalytics {
  id                   String   @id @default(cuid())
  personId             String
  primaryCompetency    String
  skillTransferMap     Json
  competencyInteractions Json
  transferEfficiency   Float
  crossCompetencyScore Float
  createdAt            DateTime @default(now())
}
```

## 🚀 API Endpoints

### AI Task Generation

```typescript
POST / ai - tasks / generate;
// Generate personalized AI task

POST / ai - tasks / generate - sequence;
// Generate task sequence for learning progression

POST / ai - tasks / generate - transfer - variations;
// Generate transfer learning variations
```

### Learning Paths

```typescript
POST /ai-tasks/learning-path
// Create personalized learning path

PATCH /ai-tasks/learning-path/:pathId/adapt
// Adapt path based on performance

POST /ai-tasks/learning-path/:pathId/progress
// Track learning progress
```

### Analytics

```typescript
POST /ai-tasks/analytics/competency
// Generate competency analytics

POST /ai-tasks/analytics/cross-competency
// Generate cross-competency analysis

GET /ai-tasks/analytics/learning-path/:pathId
// Generate learning path analytics

POST /ai-tasks/analytics/predictive
// Generate predictive analytics

POST /ai-tasks/analytics/cohort
// Generate cohort analytics
```

## 🔧 Configuration

### Environment Variables

```bash
# Claude API Configuration
CLAUDE_API_KEY=your_claude_api_key_here
CLAUDE_API_URL=https://api.anthropic.com/v1/messages
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# AI Features Configuration
AI_TASK_GENERATION_ENABLED=true
AI_QUALITY_THRESHOLD=0.8
AI_MAX_TOKENS=4096
AI_TEMPERATURE=0.3

# Analytics Configuration
ANALYTICS_RETENTION_DAYS=365
PREDICTIVE_MODEL_HORIZON_DAYS=90
CROSS_COMPETENCY_ANALYSIS_DEPTH=comprehensive
```

### Required Dependencies

```json
{
  "@anthropic-ai/sdk": "^0.24.3",
  "@nestjs/common": "^10.0.0",
  "@nestjs/swagger": "^7.0.0",
  "prisma": "^5.0.0"
}
```

## 📊 Usage Examples

### Generate Personalized Task

```typescript
const request = {
  personId: 'user_123',
  competencyId: 'problem_solving',
  targetCCISLevel: 3,
  studentProfile: {
    currentCCISLevel: 2,
    learningStyle: 'visual',
    industryInterest: 'technology',
    difficultyPreference: 'adaptive',
  },
  taskPreferences: {
    taskType: 'micro',
    includeIndustryContext: true,
    estimatedDuration: 30,
  },
};

const response = await fetch('/ai-tasks/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(request),
});
```

### Create Learning Path

```typescript
const pathRequest = {
  personId: 'user_123',
  competencyFocus: ['problem_solving', 'communication', 'teamwork'],
  targetCCISLevel: 4,
  estimatedDuration: 120, // hours
  studentProfile: {
    learningStyle: 'kinesthetic',
    timeAvailability: 10, // hours per week
    preferredDifficulty: 'moderate',
  },
  preferences: {
    difficultyProgression: 'adaptive',
    includeTransferTasks: true,
    checkpointFrequency: 5,
  },
};

const pathResponse = await fetch('/ai-tasks/learning-path', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(pathRequest),
});
```

### Generate Analytics

```typescript
const analyticsRequest = {
  personId: 'user_123',
  competencyIds: ['problem_solving', 'communication'],
  timeRange: {
    startDate: '2024-01-01',
    endDate: '2024-12-31',
  },
  analysisType: 'individual',
  granularity: 'weekly',
};

const analytics = await fetch('/ai-tasks/analytics/competency', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(analyticsRequest),
});
```

## 🔒 Security Considerations

- **API Keys**: Store Claude API keys securely using environment variables
- **Rate Limiting**: Implement rate limiting for AI API calls
- **Data Privacy**: Ensure student data is handled according to privacy regulations
- **Access Control**: Restrict analytics access based on user roles

## 📈 Performance Optimization

- **Caching**: Cache AI responses and analytics results
- **Batch Processing**: Process multiple analytics requests in batches
- **Async Operations**: Use background processing for heavy analytics
- **Database Indexing**: Add indexes on frequently queried fields

## 🧪 Testing

### Unit Tests

- Service method testing with mocked dependencies
- API endpoint testing with request/response validation
- Database model testing with test data

### Integration Tests

- End-to-end API workflows
- Database integration with real data
- AI service integration (with API mocking in CI/CD)

### Performance Tests

- Load testing for analytics generation
- Stress testing for AI API calls
- Database query optimization validation

## 🚀 Deployment

### Database Migration

```bash
# Run the migration script
chmod +x scripts/migrate-ai-features.sh
./scripts/migrate-ai-features.sh

# Or manually
npx prisma migrate dev --name "add-ai-features"
npx prisma generate
```

### Environment Setup

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📝 Future Enhancements

1. **Advanced AI Models**: Integration with additional AI providers
2. **Real-time Adaptation**: Live adjustment of learning paths
3. **Social Learning**: Peer collaboration recommendations
4. **Gamification**: Achievement systems based on AI analytics
5. **Mobile Optimization**: Native mobile app integration
6. **Multi-language Support**: Internationalization for global deployment

## 🤝 Contributing

1. Follow existing code patterns and architecture
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure backward compatibility
5. Consider performance implications of AI operations

## 📞 Support

For questions or issues with AI features:

- Review API documentation at `/api`
- Check service logs for debugging
- Validate environment configuration
- Test AI API connectivity

---

**Shrameva CCIS AI Features** - Empowering personalized learning through artificial intelligence.
