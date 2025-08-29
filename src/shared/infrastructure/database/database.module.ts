// src/shared/infrastructure/database/database.module.ts

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Global Database Module for Shrameva CCIS Platform
 * 
 * Provides Prisma service as a global singleton across the application.
 * This module is marked as @Global, so PrismaService can be injected
 * in any module without importing DatabaseModule.
 * 
 * Usage:
 * - Import this module in AppModule
 * - Inject PrismaService in any service/repository
 * - Use for all database operations
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
