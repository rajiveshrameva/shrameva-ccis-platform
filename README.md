# 🎓 Shrameva CCIS Platform

**Cognitive Competency Intelligence System** - Revolutionizing engineering student skill assessment and placement through AI-powered competency measurement.

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11.0.1-red?style=for-the-badge&logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-5.1.3-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-blue?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-5.19.1-darkgreen?style=for-the-badge&logo=prisma" alt="Prisma" />
</p>

## 🚀 About Shrameva

Shrameva is transforming how engineering students develop and demonstrate their competencies through our innovative **CCIS (Cognitive Competency Intelligence System)**. Our platform bridges the gap between academic learning and industry requirements, targeting **70% placement rates** through personalized skill development.

### 🎯 Core Innovation: CCIS Framework

Our **7-Competency Framework** with **4-Level Progression System**:

1. **Communication** - Written, verbal, and presentation skills
2. **Problem Solving** - Analytical thinking and solution development
3. **Teamwork** - Collaboration and interpersonal effectiveness
4. **Adaptability** - Flexibility and change management
5. **Time Management** - Planning, prioritization, and execution
6. **Technical Skills** - Domain-specific technical competencies
7. **Leadership** - Influence, decision-making, and team guidance

### 🌍 Market Focus

- **Primary**: India (70% of users)
- **Expansion**: UAE and GCC countries (30% of users)
- **Target**: Engineering students and recent graduates

## ✨ Key Features

- **🤖 AI-Powered Assessment**: Intelligent task generation and automated evaluation
- **📊 Evidence-Based Progression**: CCIS level advancement through practical demonstrations
- **🔒 Privacy-First Design**: Configurable data sharing and consent management
- **🌐 Multi-Country Support**: Localized validation and cultural considerations
- **📈 Real-Time Analytics**: Comprehensive progress tracking and insights
- **🎯 Placement Readiness**: Industry-aligned skill development and job matching

## 🏗️ Architecture Overview

Built using **Domain-Driven Design (DDD)** with **Clean Architecture** principles:

```
src/
├── shared/                 # Shared domain primitives
│   ├── domain/            # Base entities, value objects, events
│   ├── infrastructure/    # Database, external services
│   └── application/       # Cross-cutting concerns
├── modules/               # Domain modules
│   ├── person/           # ✅ Person profiles & skill passports
│   ├── student/          # 🔄 Student academic tracking
│   ├── assessment/       # 🔄 CCIS evaluation engine
│   ├── competency/       # 🔄 Skill taxonomy & frameworks
│   ├── task/            # 🔄 Micro-tasks & fusion tasks
│   └── placement/       # 🔄 Industry partnerships
└── api/                  # REST API layer
```

## 📊 Current Status

### ✅ **Person Domain (100% Complete)**

- **Domain Layer**: Complete entity model with skill passport integration
- **Infrastructure**: Repository pattern with Prisma ORM setup
- **Application**: CQRS command/query handlers and event-driven architecture
- **API Layer**: Full REST endpoints with OpenAPI documentation
- **Published APIs**: 7 endpoints with comprehensive validation

### 🔄 **In Development**

- Student domain entities and academic tracking
- CCIS assessment engine and AI integration
- Learning path recommendation system
- Industry placement matching algorithms

## 🌐 Published APIs

### Person Management

```
POST   /persons              - Create new person with skill passport
GET    /persons/:id          - Get person profile (privacy-aware)
PUT    /persons/:id          - Update person with optimistic concurrency
GET    /persons              - List persons with filtering/pagination
DELETE /persons/:id          - Soft delete with audit trail
GET    /persons/:id/analytics - Personal skill development analytics
GET    /persons/analytics/summary - Platform-wide statistics
```

**API Documentation**: Available at `/api` and `/docs` endpoints

## 🧪 Testing with Postman

We provide comprehensive **Postman collections** for API testing:

### 📦 Collections Available

- **`postman/Shrameva-CCIS-Platform-APIs.postman_collection.json`** - Complete API collection
- **`postman/Shrameva-Development.postman_environment.json`** - Development environment
- **`postman/Shrameva-Production.postman_environment.json`** - Production environment

### 🚀 Quick Start

```bash
# 1. Import collections into Postman
# 2. Select "Shrameva CCIS - Development" environment
# 3. Run "Create Person" to get started
# 4. Execute full test suite with automated validations
```

**See**: [`postman/README.md`](./postman/README.md) for detailed setup guide

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/rajiveshrameva/shrameva-ccis-platform.git
cd shrameva-ccis-platform

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Configure your database and other settings

# Setup database (when Prisma is fully configured)
npx prisma migrate dev
npx prisma generate

# Start development server
npm run start:dev
```

### 🌐 Access Points

- **API Server**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api
- **Alternative Docs**: http://localhost:3000/docs

## 🏃‍♂️ Available Scripts

```bash
# Development
npm run start:dev        # Start with hot reload
npm run start:debug      # Start with debugging

# Production
npm run build           # Build for production
npm run start:prod      # Start production server

# Code Quality
npm run lint            # ESLint checking
npm run test            # Unit tests
npm run test:e2e        # Integration tests

# Utilities
./scripts/track-todos.sh # Track implementation progress
```

## 📈 Progress Tracking

**Current Implementation Status**:

- **Foundation Layer**: ✅ 100% Complete (8/8 files)
- **Person Domain**: ✅ 100% Complete (21/21 files)
- **Student Domain**: ⏳ Pending
- **Assessment Engine**: ⏳ Pending
- **Overall MVP**: **~50% Complete**

**TODOs**: 82 items tracked across codebase
**Run**: `./scripts/track-todos.sh` for detailed progress

## 🔧 Technology Stack

### Core Framework

- **NestJS 11.0.1** - Progressive Node.js framework
- **TypeScript 5.1.3** - Type-safe development
- **Prisma 5.19.1** - Next-generation ORM
- **PostgreSQL 15** - Robust relational database

### API & Documentation

- **@nestjs/swagger** - OpenAPI/Swagger integration
- **class-validator** - Input validation (manual implementation)
- **CORS** - Cross-origin resource sharing

### Development Tools

- **ESLint** - Code linting and formatting
- **Jest** - Testing framework
- **Postman** - API testing and documentation

## 🔐 Security & Privacy

### Data Protection

- **Privacy-First Design**: Configurable data sharing preferences
- **Data Masking**: Email/phone masking based on user settings
- **Consent Management**: Granular consent tracking
- **GDPR Compliance**: Right to deletion and data portability

### Authentication & Authorization

- **JWT Bearer Tokens**: Secure user authentication
- **API Key Authentication**: Service-to-service security
- **Role-Based Access**: Granular permission system
- **Audit Trails**: Comprehensive activity logging

## 🌍 Multi-Country Support

### India Market

- **Phone Validation**: +91 format with carrier-specific rules
- **Cultural Context**: Regional preferences and behaviors
- **Regulatory Compliance**: Local data protection requirements

### UAE Market

- **Phone Validation**: +971 format support
- **Business Rules**: Middle East specific validations
- **Privacy Regulations**: Enhanced data protection

## 📚 Documentation

- **API Docs**: Available at `/api` and `/docs` endpoints
- **Postman Collections**: [`postman/README.md`](./postman/README.md)
- **Architecture Guide**: [`.github/instructions/`](./.github/instructions/)
- **Development Guide**: [`docs/development.md`](./docs/development.md)

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

**See**: [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines

## 🎯 Roadmap

### Phase 1: Foundation (✅ Complete)

- Person domain with skill passports
- Core API infrastructure
- Database schema design

### Phase 2: Assessment Engine (🔄 In Progress)

- CCIS measurement algorithms
- AI-powered task generation
- Evidence validation system

### Phase 3: Learning Paths (📋 Planned)

- Personalized skill development
- Adaptive learning recommendations
- Progress tracking and analytics

### Phase 4: Industry Integration (📋 Planned)

- Employer partnership APIs
- Job matching algorithms
- Placement tracking system

## 📞 Support & Contact

- **Website**: [shrameva.com](https://shrameva.com)
- **API Support**: api-support@shrameva.com
- **Documentation**: [docs.shrameva.com](https://docs.shrameva.com)
- **Issues**: [GitHub Issues](https://github.com/rajiveshrameva/shrameva-ccis-platform/issues)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>© 2025 Shrameva Technologies. All rights reserved.</strong><br>
  <em>Empowering engineering students through AI-powered skill assessment and personalized learning paths.</em>
</p>
$ npm run test

# e2e tests

$ npm run test:e2e

# test coverage

$ npm run test:cov

````

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
````

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
