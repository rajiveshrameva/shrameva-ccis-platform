# Sprint 1: File Structure & Dependencies

## 📁 Complete Folder Structure

```
shrameva-platform/
├── backend/ (NestJS)
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── shared/
│   │   │   ├── database/
│   │   │   │   ├── database.module.ts
│   │   │   │   ├── database.providers.ts
│   │   │   │   └── migrations/
│   │   │   │       ├── 001_create_students.sql
│   │   │   │       ├── 002_create_assessments.sql
│   │   │   │       ├── 003_create_behavioral_signals.sql
│   │   │   │       ├── 004_create_tasks.sql
│   │   │   │       └── 005_create_task_submissions.sql
│   │   │   ├── anthropic/
│   │   │   │   ├── anthropic.module.ts
│   │   │   │   ├── anthropic.service.ts
│   │   │   │   └── anthropic.config.ts
│   │   │   ├── types/
│   │   │   │   ├── ccis.types.ts
│   │   │   │   ├── competency.types.ts
│   │   │   │   └── assessment.types.ts
│   │   │   └── utils/
│   │   │       ├── signal-calculator.util.ts
│   │   │       └── ccis-prompt-builder.util.ts
│   │   ├── assessment/
│   │   │   ├── assessment.module.ts
│   │   │   ├── controllers/
│   │   │   │   └── assessment.controller.ts
│   │   │   ├── services/
│   │   │   │   ├── signal-collection.service.ts
│   │   │   │   ├── ccis-calculation.service.ts
│   │   │   │   └── task-recommendation.service.ts
│   │   │   └── entities/
│   │   │       ├── assessment.entity.ts
│   │   │       ├── behavioral-signals.entity.ts
│   │   │       └── task-submission.entity.ts
│   │   ├── competency/
│   │   │   ├── competency.module.ts
│   │   │   ├── business-communication/
│   │   │   │   ├── business-communication.module.ts
│   │   │   │   ├── controllers/
│   │   │   │   │   └── business-communication.controller.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── email-task.service.ts
│   │   │   │   │   ├── presentation-task.service.ts
│   │   │   │   │   └── communication-scoring.service.ts
│   │   │   │   ├── entities/
│   │   │   │   │   ├── communication-task.entity.ts
│   │   │   │   │   └── communication-submission.entity.ts
│   │   │   │   └── data/
│   │   │   │       ├── email-tasks.json
│   │   │   │       ├── presentation-tasks.json
│   │   │   │       └── scoring-rubrics.json
│   │   │   └── shared/
│   │   │       ├── entities/
│   │   │       │   └── task.entity.ts
│   │   │       └── interfaces/
│   │   │           ├── competency.interface.ts
│   │   │           └── task.interface.ts
│   │   ├── student/
│   │   │   ├── student.module.ts
│   │   │   ├── controllers/
│   │   │   │   └── student.controller.ts
│   │   │   ├── services/
│   │   │   │   ├── student.service.ts
│   │   │   │   └── student-progress.service.ts
│   │   │   └── entities/
│   │   │       └── student.entity.ts
│   │   └── auth/
│   │       ├── auth.module.ts
│   │       ├── controllers/
│   │       │   └── auth.controller.ts
│   │       ├── services/
│   │       │   └── auth.service.ts
│   │       └── guards/
│   │           └── jwt-auth.guard.ts
│   ├── test/
│   │   ├── unit/
│   │   │   ├── signal-collection.service.spec.ts
│   │   │   ├── ccis-calculation.service.spec.ts
│   │   │   └── email-task.service.spec.ts
│   │   └── integration/
│   │       ├── assessment.e2e-spec.ts
│   │       └── communication.e2e-spec.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/ (Next.js + React)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── assessment/
│   │   │   │   ├── [competency]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── task/
│   │   │   │       └── [taskId]/
│   │   │   │           └── page.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/ (shadcn components)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── progress.tsx
│   │   │   │   └── badge.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── CCISProgressRing.tsx
│   │   │   │   ├── CompetencyCard.tsx
│   │   │   │   └── TaskRecommendations.tsx
│   │   │   ├── assessment/
│   │   │   │   ├── TaskInterface.tsx
│   │   │   │   ├── HintSystem.tsx
│   │   │   │   ├── FeedbackDisplay.tsx
│   │   │   │   └── TaskTimer.tsx
│   │   │   └── layout/
│   │   │       ├── StudentHeader.tsx
│   │   │       ├── NavigationSidebar.tsx
│   │   │       └── MobileNavigation.tsx
│   │   ├── lib/
│   │   │   ├── api/
│   │   │   │   ├── assessment.api.ts
│   │   │   │   ├── student.api.ts
│   │   │   │   └── competency.api.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useAssessment.ts
│   │   │   │   ├── useStudentProgress.ts
│   │   │   │   └── useTaskTimer.ts
│   │   │   ├── utils/
│   │   │   │   ├── ccis-helpers.ts
│   │   │   │   ├── signal-tracker.ts
│   │   │   │   └── format-helpers.ts
│   │   │   └── types/
│   │   │       ├── assessment.types.ts
│   │   │       ├── student.types.ts
│   │   │       └── competency.types.ts
│   │   ├── store/
│   │   │   ├── assessment-store.ts
│   │   │   ├── student-store.ts
│   │   │   └── ui-store.ts
│   │   └── styles/
│   │       ├── globals.css
│   │       └── components.css
│   ├── public/
│   │   ├── icons/
│   │   │   ├── competency-icons/
│   │   │   └── ccis-level-icons/
│   │   └── images/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
├── shared/
│   ├── types/
│   │   ├── ccis.types.ts
│   │   ├── assessment.types.ts
│   │   └── competency.types.ts
│   └── constants/
│       ├── ccis-levels.constants.ts
│       └── competency.constants.ts
├── docker/
│   ├── docker-compose.yml
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── postgres.Dockerfile
└── README.md

```

## 🔗 Implementation Dependencies Order

### Phase 1: Core Infrastructure (Days 1-2)
1. **Database Setup**
   - `migrations/001-005_*.sql` - Database schema
   - `database.module.ts` - Database connection
   - `database.providers.ts` - DB providers

2. **Shared Types & Utils**
   - `shared/types/*.ts` - Type definitions
   - `shared/constants/*.ts` - Constants
   - `shared/utils/signal-calculator.util.ts` - Signal calculations

3. **Anthropic Integration**
   - `anthropic/anthropic.service.ts` - Claude API integration
   - `anthropic/anthropic.config.ts` - API configuration

### Phase 2: Backend Core Services (Days 3-4)
4. **Assessment Engine**
   - `assessment/entities/*.ts` - Data models
   - `signal-collection.service.ts` - Behavioral signal tracking
   - `ccis-calculation.service.ts` - CCIS level determination
   - `assessment.controller.ts` - API endpoints

5. **Student Management**
   - `student/entities/student.entity.ts` - Student model
   - `student/services/student.service.ts` - Student operations
   - `student/controllers/student.controller.ts` - Student API

### Phase 3: Business Communication (Days 4-5)
6. **Communication Tasks**
   - `business-communication/data/*.json` - Task definitions
   - `business-communication/services/email-task.service.ts` - Email tasks
   - `business-communication/services/presentation-task.service.ts` - Presentation tasks
   - `business-communication/services/communication-scoring.service.ts` - Scoring logic

### Phase 4: Frontend Core (Days 5-6)
7. **UI Foundation**
   - `components/ui/*.tsx` - Basic UI components
   - `layout/*.tsx` - Layout components
   - `globals.css` - Global styles

8. **Dashboard Components**
   - `dashboard/CCISProgressRing.tsx` - Progress visualization
   - `dashboard/CompetencyCard.tsx` - Competency display
   - `dashboard/TaskRecommendations.tsx` - Task suggestions

### Phase 5: Assessment Interface (Days 6-7)
9. **Task Interface**
   - `assessment/TaskInterface.tsx` - Main task component
   - `assessment/HintSystem.tsx` - Adaptive hints
   - `assessment/FeedbackDisplay.tsx` - Task feedback
   - `assessment/TaskTimer.tsx` - Task timing

10. **API Integration**
    - `lib/api/*.ts` - API client functions
    - `lib/hooks/*.ts` - React hooks for data fetching
    - `store/*.ts` - State management

## ⚙️ Critical Configuration Files

### Backend Configuration
- `package.json` - Dependencies (NestJS, TypeORM, Anthropic SDK)
- `.env.example` - Environment variables template
- `tsconfig.json` - TypeScript configuration

### Frontend Configuration  
- `package.json` - Dependencies (Next.js, Tailwind, Zustand)
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS setup

### Docker Configuration
- `docker-compose.yml` - Development environment
- `*.Dockerfile` - Container definitions

## 🧪 Test Files Structure
- Unit tests for each service (`*.spec.ts`)
- Integration tests for API endpoints (`*.e2e-spec.ts`)
- Frontend component tests (`*.test.tsx`)

## 📦 Key External Dependencies

### Backend
- `@nestjs/core` - NestJS framework
- `@anthropic-ai/sdk` - Claude API client
- `typeorm` - Database ORM
- `pg` - PostgreSQL driver
- `@nestjs/jwt` - JWT authentication

### Frontend
- `next` - React framework
- `@tanstack/react-query` - Data fetching
- `zustand` - State management
- `tailwindcss` - Styling
- `lucide-react` - Icons
- `recharts` - Charts for progress visualization

This structure ensures clear separation of concerns, scalability for additional competencies, and maintainable code organization.