import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for cross-origin requests
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:4200',
      'https://shrameva.com',
      'https://www.shrameva.com',
      'https://app.shrameva.com',
      // Add more origins as needed for production
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
    ],
    credentials: true,
  });

  // Global validation pipe for automatic DTO validation (disabled for manual validation)
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     transform: true,
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //     disableErrorMessages: false,
  //     validationError: {
  //       target: false,
  //       value: false,
  //     },
  //   }),
  // );

  // Swagger API Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Shrameva CCIS Platform API')
    .setDescription(
      `
      The Shrameva CCIS (Cognitive Competency Intelligence System) Platform API
      
      ## About Shrameva
      Shrameva is revolutionizing skill assessment and placement for engineering students
      through AI-powered competency measurement and personalized learning paths.
      
      ## Key Features
      - **7-Competency Framework**: Comprehensive skill assessment across technical and soft skills
      - **CCIS Levels**: 4-tier progression system with evidence-based advancement
      - **AI-Powered Assessment**: Intelligent task generation and automated evaluation
      - **Multi-Country Support**: Localized for India and UAE markets
      - **Privacy-First Design**: Configurable data sharing and consent management
      
      ## Core Competencies Measured
      1. **Communication** - Written, verbal, and presentation skills
      2. **Problem Solving** - Analytical thinking and solution development
      3. **Teamwork** - Collaboration and interpersonal effectiveness
      4. **Adaptability** - Flexibility and change management
      5. **Time Management** - Planning, prioritization, and execution
      6. **Technical Skills** - Domain-specific technical competencies
      7. **Leadership** - Influence, decision-making, and team guidance
      
      ## API Categories
      - **Person Management**: User profiles and skill passports
      - **Assessment Engine**: CCIS-based competency evaluation
      - **Learning Paths**: Personalized skill development journeys
      - **Placement Services**: Industry partnerships and job matching
      
      For more information, visit [shrameva.com](https://shrameva.com)
    `,
    )
    .setVersion('1.0.0')
    .setContact(
      'Shrameva API Support',
      'https://shrameva.com/support',
      'api-support@shrameva.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Development Server')
    .addServer('https://api.shrameva.com', 'Production Server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token for authentication',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description: 'API Key for service-to-service authentication',
      },
      'API-Key',
    )
    .addTag('Person', 'Person management and skill passport operations')
    .addTag('Student', 'Student-specific academic and placement tracking')
    .addTag('Assessment', 'CCIS competency assessment and evaluation')
    .addTag('Learning Path', 'Personalized learning journey management')
    .addTag('Placement', 'Industry partnerships and job placement services')
    .addTag('Analytics', 'Performance metrics and insights')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey}_${methodKey}`,
  });

  // Customize Swagger UI
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'Shrameva CCIS Platform API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info h1 { color: #1976d2 }
      .swagger-ui .scheme-container { background: #fafafa; padding: 10px; border-radius: 4px; }
    `,
  });

  // Also serve API docs at /docs for convenience
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(
    `🚀 Shrameva CCIS Platform API is running on: http://localhost:${port}`,
  );
  console.log(
    `📚 API Documentation available at: http://localhost:${port}/api`,
  );
  console.log(`📖 Alternative docs URL: http://localhost:${port}/docs`);
  console.log(`🌍 CORS enabled for cross-origin requests`);
}

bootstrap().catch((error) => {
  console.error('❌ Error starting the Shrameva CCIS Platform:', error);
  process.exit(1);
});
