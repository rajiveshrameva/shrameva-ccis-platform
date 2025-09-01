import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './shared/infrastructure/database';
import { SharedInfrastructureModule } from './shared/infrastructure/shared-infrastructure.module';
import { PersonModule } from './modules/person/person.module';
import { AssessmentModule } from './modules/assessment/assessment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    SharedInfrastructureModule,
    PersonModule,
    AssessmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
