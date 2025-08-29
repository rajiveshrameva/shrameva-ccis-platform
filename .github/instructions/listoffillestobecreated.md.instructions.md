---
applyTo: '**'
---

# Shrameva MVP: Complete File Structure & Implementation Checklist

## **🏗️ Project Structure Overview**

```
src/
├── shared/
│   ├── domain/
│   │   ├── base/
│   │   ├── events/
│   │   └── value-objects/
│   ├── infrastructure/
│   └── application/
├── modules/
│   ├── person/
│   ├── student/
│   ├── assessment/
│   ├── competency/
│   ├── task/
│   ├── learning-path/
│   └── placement/
└── api/
```

---

## **📋 COMPREHENSIVE IMPLEMENTATION CHECKLIST**

### **Phase 1: Foundation & Shared Components** ⭐ START HERE

#### **1.1 Shared Domain Base Classes**

- [x] `src/shared/base/entity.base.ts` - Base Entity with ID management ✅
- [x] `src/shared/base/aggregate.root.ts` - Base Aggregate Root ✅
- [x] `src/shared/base/value-object.base.ts` - Base Value Object ✅
- [x] `src/shared/base/domain-event.base.ts` - Base Domain Event ✅
- [x] `src/shared/domain/base/repository.interface.ts` - Base Repository Interface ✅

#### **1.2 Shared Value Objects**

- [x] `src/shared/value-objects/id.value-object.ts` - UUID generation ✅
- [x] `src/shared/value-objects/email.value-object.ts` - Email validation ✅
- [x] `src/shared/domain/value-objects/phone.value-object.ts` - Phone validation ✅
- [x] `src/shared/domain/value-objects/date-range.value-object.ts` - Date validation ✅
- [x] `src/shared/value-objects/percentage.value-object.ts` - Percentage (0-100) ✅

#### **1.3 Shared Events Infrastructure**

- [x] `src/shared/domain/events/domain-event-publisher.ts` - Event publishing ✅
- [x] `src/shared/domain/events/event-handler.interface.ts` - Event handler contract ✅

#### **1.4 Shared Domain Exceptions**

- [x] `src/shared/domain/exceptions/domain-exception.base.ts` - Domain Exception Infrastructure ✅

---

### **Phase 2: Person Domain**

#### **2.1 Person Value Objects**

- [ ] `src/modules/person/domain/value-objects/person-name.value-object.ts`
- [ ] `src/modules/person/domain/value-objects/person-age.value-object.ts`
- [ ] `src/modules/person/domain/value-objects/gender.value-object.ts`
- [ ] `src/modules/person/domain/value-objects/address.value-object.ts`

#### **2.2 Person Entity & Events**

- [ ] `src/modules/person/domain/entities/person.entity.ts`
- [ ] `src/modules/person/domain/events/person-created.event.ts`
- [ ] `src/modules/person/domain/events/person-updated.event.ts`

#### **2.3 Person Infrastructure**

- [ ] `src/modules/person/domain/repositories/person.repository.interface.ts`
- [ ] `src/modules/person/infrastructure/repositories/person.repository.ts`
- [ ] `src/modules/person/infrastructure/entities/person.entity.orm.ts` - TypeORM

#### **2.4 Person Application Layer**

- [ ] `src/modules/person/application/commands/create-person.command.ts`
- [ ] `src/modules/person/application/commands/update-person.command.ts`
- [ ] `src/modules/person/application/handlers/create-person.handler.ts`
- [ ] `src/modules/person/application/handlers/update-person.handler.ts`

#### **2.5 Person API Layer**

- [ ] `src/modules/person/api/person.controller.ts`
- [ ] `src/modules/person/api/dtos/create-person.dto.ts`
- [ ] `src/modules/person/api/dtos/person-response.dto.ts`

---

### **Phase 3: Student Domain**

#### **3.1 Student Value Objects**

- [ ] `src/modules/student/domain/value-objects/student-id.value-object.ts`
- [ ] `src/modules/student/domain/value-objects/enrollment-status.value-object.ts`
- [ ] `src/modules/student/domain/value-objects/college.value-object.ts`
- [ ] `src/modules/student/domain/value-objects/program.value-object.ts`
- [ ] `src/modules/student/domain/value-objects/year-of-study.value-object.ts`

#### **3.2 Student Entity & Events**

- [ ] `src/modules/student/domain/entities/student.entity.ts`
- [ ] `src/modules/student/domain/events/student-enrolled.event.ts`
- [ ] `src/modules/student/domain/events/student-program-completed.event.ts`
- [ ] `src/modules/student/domain/events/student-placement-achieved.event.ts`

#### **3.3 Student Infrastructure & Application & API**

- [ ] Repository, Handlers, Controllers (following same pattern as Person)

---

### **Phase 4: Assessment Domain** ⭐ CORE INNOVATION

#### **4.1 Assessment Value Objects**

- [ ] `src/modules/assessment/domain/value-objects/ccis-level.value-object.ts`
- [ ] `src/modules/assessment/domain/value-objects/confidence-score.value-object.ts`
- [ ] `src/modules/assessment/domain/value-objects/competency-type.value-object.ts`
- [ ] `src/modules/assessment/domain/value-objects/independence-signals.value-object.ts`
- [ ] `src/modules/assessment/domain/value-objects/scaffolding-level.value-object.ts`
- [ ] `src/modules/assessment/domain/value-objects/assessment-criteria.value-object.ts`

#### **4.2 Assessment Entities**

- [ ] `src/modules/assessment/domain/entities/task-interaction.entity.ts`
- [ ] `src/modules/assessment/domain/entities/assessment-session.entity.ts` - Aggregate Root
- [ ] `src/modules/assessment/domain/entities/competency-assessment.entity.ts`

#### **4.3 Assessment Domain Services**

- [ ] `src/modules/assessment/domain/services/ccis-calculation.service.ts`
- [ ] `src/modules/assessment/domain/services/gaming-detection.service.ts`
- [ ] `src/modules/assessment/domain/services/scaffolding-adjustment.service.ts`

#### **4.4 Assessment Events**

- [ ] `src/modules/assessment/domain/events/ccis-level-achieved.event.ts`
- [ ] `src/modules/assessment/domain/events/assessment-completed.event.ts`
- [ ] `src/modules/assessment/domain/events/gaming-detected.event.ts`
- [ ] `src/modules/assessment/domain/events/intervention-triggered.event.ts`

---

### **Phase 5: Competency Domain**

#### **5.1 Competency Value Objects**

- [ ] `src/modules/competency/domain/value-objects/competency-definition.value-object.ts`
- [ ] `src/modules/competency/domain/value-objects/skill-taxonomy.value-object.ts`
- [ ] `src/modules/competency/domain/value-objects/learning-objective.value-object.ts`

#### **5.2 Competency Entities**

- [ ] `src/modules/competency/domain/entities/competency.entity.ts`
- [ ] `src/modules/competency/domain/entities/skill-passport.entity.ts` - Aggregate Root

---

### **Phase 6: Task Domain**

#### **6.1 Task Value Objects**

- [ ] `src/modules/task/domain/value-objects/task-type.value-object.ts`
- [ ] `src/modules/task/domain/value-objects/task-difficulty.value-object.ts`
- [ ] `src/modules/task/domain/value-objects/task-duration.value-object.ts`

#### **6.2 Task Entities**

- [ ] `src/modules/task/domain/entities/micro-task.entity.ts`
- [ ] `src/modules/task/domain/entities/fusion-task.entity.ts`
- [ ] `src/modules/task/domain/entities/task-submission.entity.ts`

---

### **Phase 7: Learning Path Domain**

#### **7.1 Learning Path Entities**

- [ ] `src/modules/learning-path/domain/entities/learning-path.entity.ts`
- [ ] `src/modules/learning-path/domain/entities/learning-milestone.entity.ts`

---

### **Phase 8: AI Agent System** ⭐ CORE TECHNOLOGY

#### **8.1 AI Infrastructure**

- [ ] `src/shared/infrastructure/ai/anthropic.service.ts`
- [ ] `src/shared/infrastructure/ai/tavily.service.ts`
- [ ] `src/shared/infrastructure/ai/perplexity.service.ts`

#### **8.2 LangGraph Agents**

- [ ] `src/modules/assessment/infrastructure/agents/supervisor.agent.ts`
- [ ] `src/modules/assessment/infrastructure/agents/assessment.agent.ts`
- [ ] `src/modules/assessment/infrastructure/agents/curriculum.agent.ts`
- [ ] `src/modules/assessment/infrastructure/agents/progression.agent.ts`
- [ ] `src/modules/assessment/infrastructure/agents/fusion-task-orchestrator.agent.ts`
- [ ] `src/modules/assessment/infrastructure/agents/content-generation.agent.ts`
- [ ] `src/modules/assessment/infrastructure/agents/intervention-detection.agent.ts`

---

### **Phase 9: Application Services & Use Cases**

#### **9.1 Assessment Application Services**

- [ ] `src/modules/assessment/application/commands/start-assessment.command.ts`
- [ ] `src/modules/assessment/application/commands/submit-task-interaction.command.ts`
- [ ] `src/modules/assessment/application/queries/get-ccis-progress.query.ts`
- [ ] `src/modules/assessment/application/handlers/assessment.handlers.ts`

#### **9.2 Learning Application Services**

- [ ] Task assignment services
- [ ] Progress tracking services
- [ ] Placement preparation services

---

### **Phase 10: Infrastructure & Persistence**

#### **10.1 Database Setup**

- [ ] `src/shared/infrastructure/database/database.module.ts`
- [ ] `src/shared/infrastructure/database/migrations/` - All migrations
- [ ] TypeORM entity mappings for all domains

#### **10.2 External Integrations**

- [ ] College partnership APIs
- [ ] Employer integration services
- [ ] Certification provider integrations

---

### **Phase 11: API Layer & Controllers**

#### **11.1 Main APIs**

- [ ] Student onboarding APIs
- [ ] Assessment APIs
- [ ] Progress tracking APIs
- [ ] Dashboard APIs

---

### **Phase 12: Testing Infrastructure**

#### **12.1 Unit Tests**

- [ ] Domain entity tests
- [ ] Value object tests
- [ ] Domain service tests

#### **12.2 Integration Tests**

- [ ] Repository tests
- [ ] API tests
- [ ] End-to-end workflows

---

## **🚀 IMPLEMENTATION PRIORITY**

### **Session 1**: Start with Shared Foundation ✅ **COMPLETED**

- [x] Base classes (Entity, Value Object, Domain Event) ✅
- [x] Basic shared value objects (ID, Email, Percentage) ✅
- [x] Domain Exception Infrastructure ✅

### **Session 2-3**: Person Domain (Complete vertical slice)

- Person value objects → Entity → Repository → Application → API

### **Session 4-5**: Student Domain (Build on Person)

- Student-specific value objects and entities

### **Session 6-10**: Assessment Domain (Core Innovation)

- This is your differentiator - CCIS measurement system
- Most complex and critical part

### **Sessions 11-15**: Complete remaining domains

### **Sessions 16-20**: AI Agent integration & Testing

---

## **📝 SUCCESS CRITERIA FOR MVP**

### **Must Have**

- [ ] Student can enroll and create profile
- [ ] Basic CCIS assessment for all 7 competencies
- [ ] AI-powered level determination
- [ ] Progress tracking dashboard
- [ ] Simple task submission and feedback

### **Should Have**

- [ ] Gaming detection
- [ ] Scaffolding adjustment
- [ ] Basic placement preparation

### **Could Have**

- [ ] Advanced AI agents
- [ ] College partnerships
- [ ] Employer integrations

---

## **🎯 CURRENT STATUS: Foundation Phase Complete**

### **✅ COMPLETED ITEMS (7/7 Foundation Files)**

1. **Base Domain Classes**: All 4 base classes implemented
2. **Core Value Objects**: ID, Email, Percentage implemented
3. **Exception Infrastructure**: Comprehensive domain exception system

### **🔄 NEXT PHASE: Person Domain**

**Ready to start**: Complete vertical slice from domain → infrastructure → application → API

### **📊 PROGRESS TRACKING**

- **Phase 1 (Foundation)**: ✅ **100% Complete**
- **Phase 2 (Person)**: 🔄 **0% Complete**
- **Phase 3 (Student)**: ⏳ **Pending**
- **Phase 4 (Assessment)**: ⏳ **Pending**
- **Overall MVP Progress**: **~4% Complete**

---

**TOTAL ESTIMATED FILES: ~150-200 files for complete MVP**
**ESTIMATED SESSIONS: 15-20 sessions of focused development**
**SESSIONS COMPLETED: 1/20**

This checklist will be our north star. We'll update it as we progress, marking completed items and adjusting based on discoveries during implementation.
