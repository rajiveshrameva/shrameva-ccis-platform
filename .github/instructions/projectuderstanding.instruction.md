# AI-Powered Career Platform: Multi-Agent Architecture & LLM Strategy

## Executive Summary

This document outlines the 7-agent AI architecture for our CCIS-based career transformation platform, built on NestJS with a hybrid LLM strategy optimizing for educational quality and cost efficiency.

**Core Technology Stack:**

- Backend: NestJS + TypeScript + Prisma ORM + PostgreSQL
- Primary LLM: Anthropic Claude 3.5 Sonnet (75% usage)
- Secondary LLM: Perplexity Pro (15% usage)
- Backup LLM: OpenAI GPT-4o (10% usage)

**Strategic Goal:** 70% placement rate for CCIS Level 3+ students through AI-powered competency assessment and personalized learning.

---

## 🤖 7-Agent Architecture Overview

### Agent Priority & Implementation Sequence

**Phase 1 (Months 1-2): Core Foundation**

1. **Assessment Agent** (Anthropic Claude) - CRITICAL PATH
2. **Content Generation Agent** (Hybrid: Perplexity + Claude)

**Phase 2 (Month 3): Intelligence Layer** 3. **Intervention Detection Agent** (Anthropic Claude) 4. **Supervisor Agent** (Anthropic Claude)

**Phase 3 (Month 4): Advanced Features** 5. **Progression Agent** (Anthropic Claude) 6. **Curriculum Agent** (Perplexity Pro)

**Phase 4 (Month 5+): Integration** 7. **Fusion Task Orchestrator** (Anthropic Claude)

---

## 🎯 Agent Specifications

### 1. Assessment Agent (CCIS Controller)

**Priority:** 🔴 CRITICAL - Build First  
**LLM:** Anthropic Claude 3.5 Sonnet  
**Purpose:** Core competitive differentiator - measures genuine student independence

**Primary Responsibilities:**

- Determine current CCIS level (1-4) for each competency
- Measure independence signals (hint requests, error recovery, transfer success)
- Adjust scaffolding dynamically based on student performance
- Trigger level progression events when mastery demonstrated
- Generate placement readiness scores
- Detect learning plateaus and intervention needs

**Key Outputs:**

- CCIS level assignments with confidence intervals
- Scaffolding configuration (hint frequency, guidance level)
- Independence score (0.0-1.0) for placement prediction
- Intervention triggers for human mentor handoff

**Success Metrics:**

- 85% accuracy in CCIS level assignments
- 90% consistency in assessment decisions
- <2 seconds response time for scaffolding adjustments
- 70% correlation between CCIS Level 3+ and placement success

### 2. Content Generation Agent

**Priority:** 🟡 HIGH - Build Second  
**LLM:** Hybrid (Perplexity + Anthropic)  
**Purpose:** Create personalized, current learning content

**Primary Responsibilities:**

- Generate micro-concepts (120-second skill introductions)
- Create micro-tasks (5-minute practical exercises)
- Adapt content tone and examples for Indian students
- Generate CCIS-appropriate hints and guidance
- Create fusion challenges combining multiple competencies

**Hybrid LLM Strategy:**

- **Perplexity:** Industry trends, current examples, job market data
- **Anthropic:** Pedagogical structure, educational quality, assessment alignment

**Key Outputs:**

- Structured micro-learning content with clear objectives
- Difficulty-calibrated tasks based on CCIS levels
- Culturally relevant examples for Indian engineering context
- Progressive hint sequences that maintain learning challenge

### 3. Intervention Detection Agent

**Priority:** 🟡 HIGH - Build Third  
**LLM:** Anthropic Claude 3.5 Sonnet  
**Purpose:** Prevent student dropouts and learning failures

**Primary Responsibilities:**

- Monitor behavioral patterns for dropout risk detection
- Analyze engagement data and motivation indicators
- Trigger human mentor handoff when AI support insufficient
- Suggest learning path adjustments for struggling students
- Track student well-being and anxiety levels

**Key Signals Monitored:**

- Session frequency and duration trends
- Task completion rate decline
- Excessive hint requests or avoidance patterns
- Emotional indicators in communication
- Cross-competency performance correlations

### 4. Supervisor Agent (Orchestrator)

**Priority:** 🟠 MEDIUM - Build Fourth  
**LLM:** Anthropic Claude 3.5 Sonnet  
**Purpose:** Coordinate agent interactions and maintain system coherence

**Primary Responsibilities:**

- Route student requests to appropriate specialized agents
- Maintain global session state and context across agents
- Handle emergency escalations and system coordination
- Ensure consistency in agent decision-making
- Manage resource allocation and load balancing

**Coordination Functions:**

- Agent-to-agent communication protocols
- Conflict resolution between agent recommendations
- System-wide performance monitoring
- Context preservation across agent handoffs

### 5. Progression Agent (Adaptive Pathways)

**Priority:** 🟠 MEDIUM - Build Fifth  
**LLM:** Anthropic Claude 3.5 Sonnet  
**Purpose:** Optimize learning sequences and unlock advanced content

**Primary Responsibilities:**

- Implement progressive disclosure of competencies
- Manage student choice architecture and autonomy
- Track motivation patterns and engagement optimization
- Create personalized learning roadmaps
- Balance challenge level with student confidence

**Adaptive Features:**

- Competency unlock sequences based on mastery
- Alternative learning paths for different learning styles
- Motivational milestone design and celebration
- Cross-competency learning optimization

### 6. Curriculum Agent (Dynamic Content Updates)

**Priority:** 🟢 LOW - Build Sixth  
**LLM:** Perplexity Pro (Primary)  
**Purpose:** Keep content current with industry trends

**Primary Responsibilities:**

- Monitor industry trends and skill demand changes
- Update curriculum content with latest examples and practices
- Integrate real-time job market intelligence
- Research emerging competency requirements
- Maintain relevance of certification pathways

**Perplexity Integration Focus:**

- Weekly industry trend analysis
- Current company skill requirements research
- Fresh case studies and examples
- Job market salary and demand data
- Technology adoption patterns in Indian market

### 7. Fusion Task Orchestrator (Integration)

**Priority:** 🟢 LOW - Build Last  
**LLM:** Anthropic Claude 3.5 Sonnet  
**Purpose:** Create real-world cross-competency challenges

**Primary Responsibilities:**

- Generate complex scenarios requiring multiple competencies
- Mirror actual workplace project complexity
- Adjust integrated challenges based on individual CCIS levels
- Create portfolio-worthy project experiences
- Prepare students for workplace collaboration

**Integration Capabilities:**

- Multi-competency skill application assessment
- Real workplace scenario simulation
- Team collaboration and leadership challenges
- Industry-specific project templates

---

## 💰 LLM Cost Strategy & Resource Allocation

### Monthly Cost Projection (500 Students)

**Anthropic Claude (75% of LLM calls):**

- Claude 3.5 Sonnet: ~$400/month (complex reasoning, assessment)
- Claude 3 Haiku: ~$100/month (simple tasks, fast responses)
- **Subtotal: $500/month**

**Perplexity Pro (15% of LLM calls):**

- Existing subscription: $20/month (fixed cost)
- **Subtotal: $20/month**

**OpenAI (10% of LLM calls):**

- GPT-4o: ~$75/month (backup and fallback only)
- **Subtotal: $75/month**

**Total Monthly LLM Cost: ~$595/month**
**Cost per Student: ~$1.19/month**
**Annual LLM Budget: ~$7,140**

### Smart Routing Strategy

**Route to Anthropic Claude When:**

- Educational assessment and CCIS decisions
- Student behavioral analysis and intervention
- Complex reasoning chains and scaffolding
- Consistency-critical agent communications

**Route to Perplexity When:**

- Industry trend research and current examples
- Job market intelligence and salary data
- Company skill requirement updates
- Fresh case studies and news integration

**Route to OpenAI When:**

- Anthropic API unavailable (failover)
- Structured data extraction needs
- Legacy integration requirements

---

## 🏗️ NestJS Integration Architecture

### Core Service Structure

**Agent Module Organization:**

```
src/agents/
├── assessment/          # Priority 1 - Core CCIS logic
├── content-generation/  # Priority 2 - Learning content
├── intervention/        # Priority 3 - Dropout prevention
├── supervisor/          # Priority 4 - Orchestration
├── progression/         # Priority 5 - Adaptive paths
├── curriculum/          # Priority 6 - Content updates
└── fusion/             # Priority 7 - Integration tasks
```

**Shared Services:**

- **AnthropicService:** Claude API integration and prompt management
- **PerplexityService:** Real-time search and trend analysis
- **LLMRoutingService:** Intelligent request routing between providers
- **AgentStateService:** Cross-agent context and session management
- **AssessmentCacheService:** Performance optimization for repeated queries

### Database Schema Extensions

**New Tables for Agent System:**

- `ccis_assessments` - Student competency level tracking
- `independence_signals` - Raw behavioral data for assessment
- `scaffolding_adjustments` - Learning support configuration changes
- `agent_interactions` - Cross-agent communication logs
- `intervention_events` - Dropout prevention and support triggers

---

## 🎯 Success Metrics & Monitoring

### Agent Performance KPIs

**Assessment Agent:**

- CCIS accuracy: >85% correct level assignments
- Assessment consistency: >90% same input → same output
- Response time: <2 seconds for scaffolding decisions
- Placement correlation: >70% CCIS 3+ → job placement

**Content Generation Agent:**

- Content quality rating: >4.0/5 by students
- Task completion rate: >80% for generated content
- Engagement duration: >15 minutes average session
- Cultural relevance score: >4.5/5 for Indian examples

**Intervention Detection Agent:**

- Dropout prediction accuracy: >85% at-risk identification
- False positive rate: <15% unnecessary interventions
- Recovery success rate: >60% students return to progress
- Mentor handoff effectiveness: >75% successful outcomes

### Business Impact Metrics

**Core Business Outcomes:**

- Student placement rate: Target 70% for CCIS 3+ students
- Time to CCIS Level 3: Target <45 days average
- Program completion rate: Target >80% of enrolled students
- College partner satisfaction: Target >4.5/5 rating

**Operational Excellence:**

- System uptime: >99.5% availability
- Agent response time: <3 seconds 95th percentile
- Cost per assessment: <$0.10 per CCIS evaluation
- Support ticket volume: <5% of students need human help

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Months 1-2)

**Deliverables:**

- Assessment Agent with basic CCIS levels 1-2
- Simple Content Generation Agent
- NestJS service architecture
- Basic Anthropic integration
- Student progress tracking

**Success Criteria:**

- 100 students can progress through CCIS Level 1→2
- Basic scaffolding adjustments working
- Assessment decisions logged and auditable
- <3 second response times maintained

### Phase 2: Intelligence (Month 3)

**Deliverables:**

- Intervention Detection Agent
- Supervisor Agent for orchestration
- Advanced CCIS levels 3-4
- Perplexity integration for content freshness

**Success Criteria:**

- Dropout risk detection functional
- Cross-agent communication established
- CCIS Level 3 mastery achievable
- Industry-current examples in content

### Phase 3: Optimization (Month 4)

**Deliverables:**

- Progression Agent with adaptive pathways
- Curriculum Agent with Perplexity Pro
- Performance monitoring dashboard
- A/B testing framework for agent decisions

**Success Criteria:**

- Personalized learning paths active
- Content stays current with job market
- Agent performance metrics collected
- Cost optimization strategies implemented

### Phase 4: Integration (Month 5+)

**Deliverables:**

- Fusion Task Orchestrator
- Cross-competency challenges
- Portfolio generation capabilities
- Advanced analytics and reporting

**Success Criteria:**

- Multi-competency assessment working
- Real workplace scenario simulation
- Student portfolios demonstrate skills
- Placement pipeline fully operational

---

## ⚠️ Risk Mitigation Strategies

### Technical Risks

**LLM Provider Outages:**

- Multi-provider failover architecture
- Critical assessment caching in Redis
- Graceful degradation to cached decisions
- Real-time monitoring and alerting

**Agent Decision Inconsistency:**

- Comprehensive logging of all agent reasoning
- A/B testing for decision quality validation
- Human expert review of edge case decisions
- Confidence thresholds for automated actions

**Performance Under Load:**

- Async processing for non-real-time assessments
- Smart caching of common assessment patterns
- Queue management for peak usage periods
- Auto-scaling for high-demand scenarios

### Educational Risks

**Assessment Gaming:**

- Transfer task validation (can't game novel problems)
- Cross-competency correlation analysis
- Randomized validation questions
- Behavioral pattern anomaly detection

**Cultural Bias:**

- Indian student behavior pattern training
- Regional example adaptation
- Local educational psychology integration
- Regular bias auditing and adjustment

---

This architecture provides a solid foundation for building an AI-powered career transformation platform that genuinely measures and develops student competency while optimizing for both educational outcomes and operational efficiency.
