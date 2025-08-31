# GitHub Copilot System Instructions - Sprint 1: CCIS Assessment Engine

## 🎯 Context & Mission

You are implementing **Shrameva**, an AI-powered career transformation platform for GenZ engineering students. Your focus is **Sprint 1: Foundation & Core Assessment Engine** - building the CCIS (Confidence-Competence Independence Scale) assessment system.

## 🧠 Core CCIS Framework Understanding

### CCIS Levels (Critical - This drives all assessment logic):
- **Level 1 (0-25%)**: Dependent learner - needs step-by-step guidance
- **Level 2 (25-50%)**: Guided practitioner - seeks help strategically  
- **Level 3 (50-85%)**: Self-directed performer - works independently
- **Level 4 (85-100%)**: Autonomous expert - can mentor others

### Behavioral Signals (Weighted Algorithm):
1. **Hint Request Frequency (35%)** - Primary independence indicator
2. **Error Recovery Speed (25%)** - Self-correction capability
3. **Transfer Success Rate (20%)** - Apply skills to novel problems
4. **Metacognitive Accuracy (10%)** - Self-assessment alignment
5. **Task Completion Efficiency (5%)** - Improvement over time
6. **Help-Seeking Quality (3%)** - Strategic vs generic questions
7. **Self-Assessment Alignment (2%)** - Prediction accuracy

## 🎨 GenZ Design Principles

### Psychology-Based Requirements:
- **8-second attention hook** → 2-minute concept → 5-minute application
- **Dopamine-driven progress**: Micro-achievements every 3-5 minutes
- **Social validation**: Peer comparison and community recognition
- **Autonomy paradox**: Choice within structure, not unlimited options
- **Purpose-driven**: Direct career relevance immediately visible

### UI/UX Guidelines:
- **Mobile-first**: 60%+ usage on mobile devices
- **Distraction-free task interface**: CRITICAL for learning effectiveness
- **Progress transparency**: Always show where they stand and what's next
- **Immediate feedback**: Real-time response to actions
- **Achievement celebration**: Visual progress rings, badges, milestones

## 🏗️ Technical Architecture Standards

### Backend (NestJS) Patterns:
```typescript
// Service Pattern Example
@Injectable()
export class CCISCalculationService {
  async calculateCCISLevel(signals: BehavioralSignals): Promise<CCISAssessment> {
    // Use weighted algorithm with Claude 3.5 Sonnet
    const independenceScore = this.calculateWeightedScore(signals);
    const llmAssessment = await this.getClaudeAssessment(signals);
    return this.combineAssessments(independenceScore, llmAssessment);
  }
}

// Controller Pattern
@Controller('assessment')
export class AssessmentController {
  @Post('submit-task')
  async submitTask(@Body() taskData: TaskSubmission): Promise<CCISAssessment> {
    // Real-time assessment with <3 second response
  }
}
```

### Frontend (Next.js) Patterns:
```typescript
// Component Pattern with GenZ optimization
export function CCISProgressRing({ level, progress, competency }: CCISRingProps) {
  return (
    <div className="relative w-32 h-32">
      {/* Animated progress ring with color-coded levels */}
      <svg className="transform -rotate-90">
        <circle 
          cx="64" cy="64" r="56"
          stroke={getCCISColor(level)}
          strokeWidth="8"
          strokeDasharray={`${progress * 351} 351`}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
    </div>
  );
}

// Hook Pattern for signal collection
export function useSignalCollection(taskId: string) {
  const [signals, setSignals] = useState<BehavioralSignals>();
  
  const trackHintRequest = useCallback(() => {
    // Track hint frequency with timestamps
  }, []);
  
  const trackErrorRecovery = useCallback(() => {
    // Measure self-correction time
  }, []);
}
```

## 📊 Database Design Requirements

### Core Tables:
```sql
-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  college VARCHAR(255),
  graduation_year INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Assessments table (stores CCIS evaluations)
CREATE TABLE assessments (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  competency_type VARCHAR(50), -- 'business_communication'
  ccis_level INTEGER CHECK (ccis_level BETWEEN 1 AND 4),
  confidence_score DECIMAL(3,2), -- 0.00-1.00
  reasoning TEXT, -- Claude's explanation
  created_at TIMESTAMP DEFAULT NOW()
);

-- Behavioral signals (raw data for CCIS calculation)
CREATE TABLE behavioral_signals (
  id UUID PRIMARY KEY,
  assessment_id UUID REFERENCES assessments(id),
  hint_frequency DECIMAL(5,3),
  error_recovery_time INTEGER, -- milliseconds
  completion_efficiency DECIMAL(5,3),
  signals_json JSONB -- Full signal data
);
```

## 🎯 Business Communication Competency Focus

### Task Types to Implement:
1. **Email Writing (8 tasks)**:
   - Level 1: Reply to manager with template
   - Level 2: Client communication with strategic hints
   - Level 3: Vendor negotiation with minimal guidance
   - Level 4: Customer escalation with no assistance

2. **Presentation Skills (5 tasks)**:
   - Slide creation, content organization, Q&A handling
   - Audience adaptation, confidence scoring

### Scoring Criteria:
- **Clarity Score**: 0-100 (grammar, structure, tone)
- **Professionalism Score**: 0-100 (appropriate language, format)
- **Effectiveness Score**: 0-100 (achieves intended outcome)

## 🔌 Claude 3.5 Sonnet Integration

### Assessment Prompt Template:
```typescript
const CCIS_ASSESSMENT_PROMPT = `
You are an expert educational assessor specializing in workplace competency evaluation.

## Student Behavioral Signals:
- Hint Requests: ${signals.hintFrequency}/minute
- Error Recovery: ${signals.errorRecoveryTime}ms average
- Transfer Success: ${signals.transferSuccessRate}%
- Metacognitive Accuracy: ${signals.metacognitiveAccuracy}%

## Task Context:
- Competency: Business Communication
- Task Type: ${taskType}
- Duration: ${duration} minutes

Determine CCIS Level (1-4) with reasoning.

Response Format:
{
  "ccisLevel": number,
  "confidence": number,
  "reasoning": "string",
  "nextLevelRequirements": ["string"]
}`;
```

## 🧪 Testing Requirements

### Unit Test Patterns:
```typescript
describe('CCISCalculationService', () => {
  it('should calculate Level 1 for high hint frequency', () => {
    const signals = {
      hintFrequency: 2.5, // >1 hint per 2 minutes
      errorRecoveryTime: 8000,
      transferSuccessRate: 0.35
    };
    
    expect(service.calculateLevel(signals)).toBe(1);
  });
});
```

### Integration Test Focus:
- Real Claude API integration with mock scenarios
- Task submission → Assessment → CCIS level pipeline
- Database persistence and retrieval accuracy

## 🚀 Performance Requirements

### Response Time Targets:
- **CCIS Assessment**: <3 seconds end-to-end
- **Task Loading**: <2 seconds
- **Dashboard Rendering**: <1.5 seconds
- **Signal Collection**: Real-time (<100ms latency)

### Scalability Targets:
- Handle 50 concurrent users during Sprint 1
- Database queries optimized with proper indexing
- Claude API rate limiting and caching strategy

## 🎨 UI Component Specifications

### CCIS Progress Ring Colors:
- **Level 1**: `#f97316` (Warm Orange - "Learning")
- **Level 2**: `#3b82f6` (Encouraging Blue - "Building") 
- **Level 3**: `#10b981` (Success Green - "Proficient")
- **Level 4**: `#8b5cf6` (Premium Purple - "Expert")

### Task Interface Requirements:
- **Distraction-free**: No navigation, notifications, or side panels during tasks
- **Single focus**: Only task content and essential controls visible
- **Progress clarity**: Minimal progress indicator without overwhelm
- **Gentle encouragement**: Subtle motivational elements

## 💾 Error Handling & Edge Cases

### Critical Error Scenarios:
1. **Claude API Timeout**: Fallback to algorithmic CCIS calculation
2. **Database Connection Loss**: Queue signals for retry
3. **Invalid Task Submission**: Clear validation messages
4. **Network Interruption**: Auto-save and resume functionality

### Data Validation:
- All CCIS levels must be 1-4 integers
- Confidence scores must be 0.0-1.0 decimals
- Timestamps must be properly formatted
- Student IDs must be valid UUIDs

## 🎯 Success Criteria for Sprint 1

### Technical Metrics:
- [ ] API response time <3 seconds
- [ ] 99% uptime during testing
- [ ] Handle 50 concurrent users
- [ ] Zero data loss incidents

### User Experience Metrics:
- [ ] Task completion rate >75%
- [ ] Students understand CCIS levels (survey validation)
- [ ] Average session duration 15+ minutes
- [ ] Students return for second session

### Business Metrics:
- [ ] Assessment accuracy validated by experts
- [ ] Clear progression path demonstrated
- [ ] Foundation for employer validation established

## ⚡ Implementation Priority Order

1. **Database & Core Types** (Day 1)
2. **Signal Collection Service** (Day 2)
3. **Claude Integration & CCIS Calculation** (Day 3)
4. **Business Communication Tasks** (Day 4)
5. **Student Dashboard Components** (Day 5)
6. **Task Interface & Hint System** (Day 6)
7. **Integration Testing & Polish** (Day 7)

## 🚨 Critical Gotchas & Anti-Patterns

### Avoid These Mistakes:
- ❌ **Over-engineering**: Keep Sprint 1 simple and focused
- ❌ **Ignoring mobile**: 60% of users will be on mobile devices
- ❌ **Complex task interface**: Distractions kill learning effectiveness
- ❌ **Slow Claude responses**: Cache common patterns, optimize prompts
- ❌ **Unclear CCIS progression**: Students must always understand their level

### GenZ-Specific Don'ts:
- ❌ Long forms or registration processes
- ❌ Text-heavy interfaces without visual breaks
- ❌ Progress indicators without clear meaning
- ❌ Generic feedback instead of personalized insights
- ❌ Delayed gratification without micro-achievements

---

**Remember**: You're building the foundation for transforming 40-60% unemployed engineering graduates into workplace-ready professionals. Every component must serve the core mission of accurate CCIS assessment that predicts job placement success.

Focus on **Quality > Features** for Sprint 1. Better to have a rock-solid foundation than a feature-rich system that doesn't work reliably.