# Shrameva CCIS Platform - Postman Collections

Welcome to the comprehensive Postman collections for the **Shrameva CCIS (Cognitive Competency Intelligence System) Platform**. These collections provide complete API testing and documentation for all platform endpoints.

## 📚 About Shrameva

Shrameva revolutionizes skill assessment and placement for engineering students through AI-powered competency measurement and personalized learning paths.

### 🎯 Key Features

- **7-Competency Framework**: Comprehensive skill assessment across technical and soft skills
- **CCIS Levels**: 4-tier progression system with evidence-based advancement
- **AI-Powered Assessment**: Intelligent task generation and automated evaluation
- **Multi-Country Support**: Localized for India and UAE markets
- **Privacy-First Design**: Configurable data sharing and consent management

### 🏆 Core Competencies Measured

1. **Communication** - Written, verbal, and presentation skills
2. **Problem Solving** - Analytical thinking and solution development
3. **Teamwork** - Collaboration and interpersonal effectiveness
4. **Adaptability** - Flexibility and change management
5. **Time Management** - Planning, prioritization, and execution
6. **Technical Skills** - Domain-specific technical competencies
7. **Leadership** - Influence, decision-making, and team guidance

## 📦 Collections Overview

### 1. **Person Management APIs**

Complete CRUD operations for person profiles and skill passports.

**Endpoints:**

- `POST /persons` - Create new person with skill passport
- `GET /persons/:id` - Retrieve person profile (privacy-aware)
- `PUT /persons/:id` - Update person with optimistic concurrency
- `GET /persons` - List persons with filtering and pagination
- `DELETE /persons/:id` - Soft delete with audit trail
- `GET /persons/:id/analytics` - Personal skill analytics

### 2. **Platform Analytics**

Global platform statistics and insights.

**Endpoints:**

- `GET /persons/analytics/summary` - Platform-wide statistics

## 🚀 Getting Started

### Prerequisites

- [Postman](https://www.postman.com/downloads/) installed
- Shrameva CCIS Platform running (development or production)

### 1. Import Collections

1. Open Postman
2. Click **Import** button
3. Select the collection file: `Shrameva-CCIS-Platform-APIs.postman_collection.json`
4. Import the environment files:
   - `Shrameva-Development.postman_environment.json`
   - `Shrameva-Production.postman_environment.json`

### 2. Configure Environment

1. Select the appropriate environment (Development/Production)
2. Update the `base_url` if needed:
   - **Development**: `http://localhost:3000`
   - **Production**: `https://api.shrameva.com`
3. Set authentication tokens if required

### 3. Run the Collection

1. Start with **Person Management** folder
2. Execute **Create Person** first to populate `person_id`
3. Run subsequent requests in sequence
4. Check response data and test results

## 🔧 Environment Variables

### Development Environment

```json
{
  "base_url": "http://localhost:3000",
  "api_key": "",
  "jwt_token": "",
  "person_id": "",
  "test_email": "test@shrameva.com",
  "test_phone": "+919876543210"
}
```

### Production Environment

```json
{
  "base_url": "https://api.shrameva.com",
  "api_key": "your-production-api-key",
  "jwt_token": "your-jwt-token",
  "person_id": "",
  "test_email": "demo@shrameva.com",
  "test_phone": "+919000000000"
}
```

## 🧪 Test Scenarios

### Complete Person Lifecycle

1. **Create Person**: Full profile with skill passport initialization
2. **Get Person**: Verify creation and skill passport structure
3. **Update Person**: Modify preferences and profile data
4. **Get Analytics**: View skill development progress
5. **List Persons**: Test filtering and pagination
6. **Delete Person**: Clean removal with audit trail

### Data Validation Tests

- Age validation (16-65 years)
- Phone format validation by country
- Email uniqueness checks
- Privacy settings enforcement
- CCIS level progression tracking

### Multi-Country Support

- India (`+91`) phone validation
- UAE (`+971`) phone validation
- Country-specific business rules
- Cultural sensitivity features

## 📊 Test Automation

Each request includes comprehensive test scripts:

### Automated Checks

- ✅ HTTP status code validation
- ✅ Response structure verification
- ✅ Data type validation
- ✅ Business rule enforcement
- ✅ Privacy setting compliance
- ✅ CCIS competency structure
- ✅ Error handling validation

### Example Test Script

```javascript
// Validate successful person creation
pm.test('Status code is 201', function () {
  pm.response.to.have.status(201);
});

pm.test('Skill passport created', function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData.skillPassport.competencies).to.have.lengthOf(7);
});

// Auto-populate environment variables
if (pm.response.code === 201) {
  const jsonData = pm.response.json();
  pm.environment.set('person_id', jsonData.id);
}
```

## 🔐 Authentication

### API Key Authentication

```javascript
// Add to request headers
{
  "X-API-Key": "{{api_key}}"
}
```

### JWT Bearer Token

```javascript
// Add to request headers
{
  "Authorization": "Bearer {{jwt_token}}"
}
```

## 📝 Request Examples

### Create Person

```json
{
  "firstName": "Rajesh",
  "lastName": "Kumar",
  "email": "rajesh.kumar@example.com",
  "phone": "+919876543210",
  "dateOfBirth": "1995-08-15",
  "gender": "MALE",
  "country": "INDIA",
  "profileVisibility": "CONTACTS_ONLY",
  "termsAccepted": true,
  "privacyPolicyAccepted": true
}
```

### Update Person

```json
{
  "personId": "{{person_id}}",
  "preferredName": "RK",
  "profileVisibility": "PUBLIC",
  "version": 1,
  "reason": "Profile enhancement"
}
```

### List Persons with Filters

```
GET /persons?page=1&limit=10&country=INDIA&verified=true&includeSkillPassport=true
```

## 🏗️ Response Structure

### Person Response

```json
{
  "id": "uuid",
  "fullName": "Rajesh Kumar",
  "email": "r***@example.com",
  "phone": "+91***",
  "skillPassport": {
    "competencies": [
      {
        "type": "COMMUNICATION",
        "ccisLevel": 2,
        "evidenceCount": 5,
        "lastAssessed": "2025-08-30T10:00:00Z"
      }
    ],
    "overallLevel": 2.1,
    "completionPercentage": 75.5
  },
  "privacy": {
    "profileVisibility": "CONTACTS_ONLY",
    "dataSharing": {
      "analytics": true,
      "marketing": false
    }
  }
}
```

## 🎯 Business Rules Tested

### Person Management

- Age validation (16-65 years)
- Email uniqueness enforcement
- Phone format by country validation
- Terms and privacy acceptance required
- Profile visibility controls
- Data sharing preferences

### Skill Passport

- 7 competency framework initialization
- CCIS level progression (1-4)
- Evidence-based advancement
- Privacy-aware data exposure

### Multi-Country Support

- India-specific validation rules
- UAE market compliance
- Cultural sensitivity features
- Localized business logic

## 🔄 Collection Maintenance

### Adding New Endpoints

1. Create new request in appropriate folder
2. Add comprehensive test scripts
3. Update environment variables if needed
4. Document business rules and validation
5. Update this README

### Environment Updates

- Keep URLs current for all environments
- Rotate API keys regularly
- Update test data as needed
- Maintain variable consistency

## 📞 Support & Documentation

- **API Documentation**: Available at `/api` and `/docs` endpoints
- **Platform Website**: [shrameva.com](https://shrameva.com)
- **Support Email**: api-support@shrameva.com
- **Developer Portal**: [docs.shrameva.com](https://docs.shrameva.com)

## 🏷️ Version History

- **v1.0.0** (2025-08-30): Initial Person Management APIs
- **Future**: Student, Assessment, Learning Path modules

---

**© 2025 Shrameva Technologies. All rights reserved.**

_Empowering engineering students through AI-powered skill assessment and personalized learning paths._
