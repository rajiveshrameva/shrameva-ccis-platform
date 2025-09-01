import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email/email.service';
import { AuditService } from './audit/audit.service';
import { DatabaseModule } from './database';

@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [EmailService, AuditService],
  exports: [EmailService, AuditService],
})
export class SharedInfrastructureModule {}
