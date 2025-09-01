import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './shared/infrastructure/database';
import { PersonModule } from './modules/person/person.module';
import { AssessmentModule } from './modules/assessment/assessment.module';

@Module({
  imports: [DatabaseModule, PersonModule, AssessmentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
