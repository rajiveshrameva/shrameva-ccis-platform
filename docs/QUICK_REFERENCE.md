# CCIS Assessment API - Quick Reference

## 🚀 Base URL

- **Development**: `http://localhost:1905`
- **Production**: `https://api.shrameva.com/v1`

## 🔐 Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer <your-jwt-token>
```

## 📋 Core Endpoints Summary

| Method | Endpoint                                 | Purpose                      | Key Response                   |
| ------ | ---------------------------------------- | ---------------------------- | ------------------------------ |
| `POST` | `/assessment/start`                      | Start new assessment session | `sessionId`, configuration     |
| `POST` | `/assessment/{sessionId}/interact`       | Submit task interaction      | Updated competency levels      |
| `GET`  | `/assessment/person/{personId}/progress` | Get progress analytics       | Competency breakdown, trends   |
| `PUT`  | `/assessment/{sessionId}/complete`       | Complete assessment          | Final results, recommendations |
| `PUT`  | `/session/{sessionId}/pause`             | Pause session                | State preservation             |
| `PUT`  | `/session/{sessionId}/resume`            | Resume session               | Continuity validation          |
| `PUT`  | `/session/{sessionId}/extend`            | Extend time                  | Time adjustment                |
| `GET`  | `/analytics/person/{personId}`           | Individual analytics         | Learning profile               |
| `POST` | `/analytics/custom`                      | Custom analytics query       | Flexible data analysis         |
| `GET`  | `/analytics/cohort/{cohortId}`           | Cohort analytics             | Group performance              |

## 🎯 7 Core Competencies

1. **Communication** - Written, verbal, presentation skills
2. **Problem Solving** - Analytical thinking, solution development
3. **Teamwork** - Collaboration, interpersonal effectiveness
4. **Adaptability** - Flexibility, change management
5. **Time Management** - Planning, organizational skills
6. **Technical Skills** - Domain-specific competencies
7. **Leadership** - Influence, team guidance

## 📊 CCIS Levels

- **Level 1** (1.0-1.99): Basic/Novice competency
- **Level 2** (2.0-2.99): Developing/Intermediate competency
- **Level 3** (3.0-3.99): Proficient/Advanced competency
- **Level 4** (4.0): Expert/Mastery competency

## 🌍 Cultural Contexts

- `INDIA` - Indian educational and cultural context
- `UAE` - UAE/Middle Eastern context
- `INTERNATIONAL` - Global/Western context

## 📝 Quick Start Examples

### Start Assessment

```bash
curl -X POST http://localhost:1905/assessment/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "personId": "student-001",
    "assessmentType": "comprehensive",
    "culturalContext": "INDIA"
  }'
```

### Submit Task Interaction

```bash
curl -X POST http://localhost:1905/assessment/session-789/interact \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sessionId": "session-789",
    "taskId": "task-001",
    "interactionType": "task_attempt",
    "competencyType": "communication",
    "interactionData": {
      "responses": ["Clear written response"],
      "completionStatus": "completed"
    },
    "behavioralSignals": {
      "hintsUsed": 0,
      "errorsCommitted": 1,
      "confidencePrediction": 0.8
    }
  }'
```

### Get Progress

```bash
curl -X GET "http://localhost:1905/assessment/person/student-001/progress?timeRange=30d" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Complete Assessment

```bash
curl -X PUT http://localhost:1905/assessment/session-789/complete \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔧 Common Parameters

### Assessment Types

- `comprehensive` - All 7 competencies
- `targeted` - Specific competencies only
- `progress` - Follow-up assessment
- `remediation` - Focused improvement

### Time Ranges

- `30d` - Last 30 days
- `90d` - Last 90 days (default)
- `1y` - Last year
- Custom: `{"startDate": "2025-01-01T00:00:00Z", "endDate": "2025-12-31T23:59:59Z"}`

### Analytics Options

- `includeComparative=true` - Include peer comparisons
- `includePredictive=true` - Include future projections
- `includeHistorical=true` - Include historical trends
- `format=comprehensive` - Detail level (summary, detailed, comprehensive)

## ⚠️ Common Error Codes

| Code  | Description             | Solution                   |
| ----- | ----------------------- | -------------------------- |
| `400` | Validation Error        | Check request parameters   |
| `401` | Authentication Required | Include valid Bearer token |
| `403` | Authorization Denied    | Check user permissions     |
| `404` | Resource Not Found      | Verify session/person ID   |
| `409` | Resource Conflict       | Session already exists     |
| `429` | Rate Limit Exceeded     | Reduce request frequency   |
| `500` | Internal Server Error   | Contact support            |

## 📈 Response Time Expectations

- **Health Check**: < 50ms
- **Start Assessment**: < 500ms
- **Task Interaction**: < 200ms
- **Progress Analytics**: < 1000ms
- **Custom Analytics**: < 2000ms

## 🧪 Testing with Postman

1. Import collection: `CCIS_Assessment_API_Clean.postman_collection.json`
2. Set environment variables:
   - `baseUrl`: `http://localhost:1905`
   - `authToken`: Your JWT token
   - `personId`: Student identifier
3. Run individual requests or complete workflows

## 📚 Documentation Links

- **Complete API Docs**: `API_DOCUMENTATION.md`
- **Interactive Swagger**: `http://localhost:1905/api`
- **Postman Collection**: `postman/CCIS_Assessment_API_Clean.postman_collection.json`
- **Setup Guide**: `README.md`

## 🎯 Quick Workflow Templates

### Student Assessment Flow

1. `POST /assessment/start` → Get `sessionId`
2. Loop: `POST /assessment/{sessionId}/interact` → Submit each task
3. `PUT /assessment/{sessionId}/complete` → Finalize
4. `GET /assessment/person/{personId}/progress` → View results

### Educator Monitoring Flow

1. `GET /analytics/person/{studentId}` → Individual insights
2. `GET /analytics/cohort/{classId}` → Class overview
3. `POST /analytics/custom` → Custom analysis

### Session Recovery Flow

1. `PUT /session/{sessionId}/pause` → Handle issues
2. `PUT /session/{sessionId}/resume` → Restore session
3. `PUT /session/{sessionId}/extend` → Adjust time if needed

This quick reference provides everything needed to get started with the CCIS Assessment API efficiently.
