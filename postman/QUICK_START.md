# 🚀 Quick Setup Guide - Postman Collections

Get started with Shrameva CCIS Platform APIs in under 5 minutes!

## ⚡ Quick Start

### 1. Import Everything (30 seconds)

```bash
# Download these files:
- Shrameva-CCIS-Platform-APIs.postman_collection.json
- Shrameva-Development.postman_environment.json
- Shrameva-Production.postman_environment.json

# In Postman:
1. Click "Import" → Select all 3 files → Import
2. Select "Shrameva CCIS - Development" environment
```

### 2. Test the APIs (2 minutes)

```bash
# Make sure your local server is running:
npm run start:dev

# In Postman:
1. Open "Person Management" folder
2. Click "Create Person" → Send
3. Watch the magic! ✨
   - Person created with ID
   - Skill passport initialized
   - Environment variable auto-populated
```

### 3. Run the Full Suite (2 minutes)

```bash
# Execute in order:
1. Create Person ✅
2. Get Person by ID ✅
3. Update Person ✅
4. Get Person Analytics ✅
5. List Persons ✅
6. Get Platform Summary ✅
7. Delete Person ✅
```

## 🎯 What You'll See

### ✅ Successful Responses

- **Person Created**: 201 status, full profile with skill passport
- **Skill Passport**: 7 competencies initialized at level 1
- **Privacy Controls**: Email/phone masking based on settings
- **CCIS Framework**: Complete competency tracking system

### 🔍 Test Results

- All automated tests passing ✅
- Business rules validated ✅
- Data integrity confirmed ✅
- Privacy settings enforced ✅

## 🛠️ Troubleshooting

### Port 3000 in use?

```bash
# Check what's using port 3000:
lsof -ti:3000

# Kill the process:
kill -9 $(lsof -ti:3000)

# Or use different port:
PORT=3001 npm run start:dev
# Update base_url to http://localhost:3001
```

### Environment not working?

```bash
# Verify environment selected:
Top-right dropdown should show "Shrameva CCIS - Development"

# Check variables:
Click eye icon → Should see base_url, person_id, etc.
```

### Tests failing?

```bash
# Check server logs for errors
# Verify request body format
# Ensure all required fields present
```

## 📊 Expected Test Results

### Create Person

```
✅ Status code is 201
✅ Response has person data
✅ Skill passport is created
✅ Environment variable set
```

### Get Person

```
✅ Status code is 200
✅ Person data is complete
✅ Skill passport has competencies
✅ Privacy settings respected
```

### Platform Summary

```
✅ Status code is 200
✅ Summary data present
✅ Country breakdown available
✅ Competency stats present
```

## 🎉 Success Indicators

You'll know everything is working when you see:

1. **All tests passing** in the Postman Test Results tab
2. **person_id** automatically populated in environment
3. **Skill passport with 7 competencies** in responses
4. **Privacy-aware data masking** in email/phone fields
5. **CCIS levels and evidence counts** in analytics

## 📋 Quick Reference

### Essential Endpoints

```
POST   /persons              → Create new person
GET    /persons/:id          → Get person details
PUT    /persons/:id          → Update person
GET    /persons/:id/analytics → Personal analytics
GET    /persons              → List all persons
DELETE /persons/:id          → Delete person
```

### Key Environment Variables

```
base_url     → http://localhost:3000
person_id    → Auto-populated from create
test_email   → test@shrameva.com
test_phone   → +919876543210
```

### Test Data Examples

```json
{
  "firstName": "Rajesh",
  "lastName": "Kumar",
  "email": "rajesh.kumar@example.com",
  "phone": "+919876543210",
  "country": "INDIA",
  "termsAccepted": true
}
```

---

**Need help?** Check the full README.md or contact api-support@shrameva.com
