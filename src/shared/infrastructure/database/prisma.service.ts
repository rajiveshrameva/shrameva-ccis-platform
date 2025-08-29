// src/shared/infrastructure/database/prisma.service.ts

import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma Service for Shrameva CCIS Platform
 *
 * Provides database connection management and query execution
 * for the Shrameva CCIS platform using Prisma ORM with PostgreSQL.
 *
 * Features:
 * - Automatic connection management
 * - Connection pooling
 * - Graceful shutdown handling
 * - Query logging in development
 * - Error handling and monitoring
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
      errorFormat: 'colorless',
    });
  }

  /**
   * Initialize database connection when module starts
   */
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to PostgreSQL database');

      // Log database info in development
      if (process.env.NODE_ENV === 'development') {
        const result = (await this.$queryRaw`SELECT version()`) as Array<{
          version: string;
        }>;
        this.logger.debug(
          `Database version: ${result[0]?.version?.split(' ')[0] || 'Unknown'}`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  /**
   * Cleanup database connection when module shuts down
   */
  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Disconnected from database');
    } catch (error) {
      this.logger.error('Error disconnecting from database:', error);
    }
  }

  /**
   * Execute raw SQL queries with proper error handling
   */
  async executeRaw(query: string, ...values: any[]): Promise<any> {
    try {
      this.logger.debug(`Executing raw query: ${query}`);
      return await this.$queryRawUnsafe(query, ...values);
    } catch (error) {
      this.logger.error(`Raw query failed: ${query}`, error);
      throw error;
    }
  }

  /**
   * Health check for database connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Get database statistics for monitoring
   */
  async getDatabaseStats(): Promise<{
    totalPersons: number;
    totalStudents: number;
    totalSkillPassports: number;
    verifiedPersons: number;
  }> {
    try {
      const [persons, students, skillPassports, verified] = await Promise.all([
        this.person.count(),
        this.student.count(),
        this.skillPassport.count(),
        this.person.count({ where: { isVerified: true } }),
      ]);

      return {
        totalPersons: persons,
        totalStudents: students,
        totalSkillPassports: skillPassports,
        verifiedPersons: verified,
      };
    } catch (error) {
      this.logger.error('Failed to get database statistics:', error);
      throw error;
    }
  }

  /**
   * Clean up soft-deleted records older than specified days
   */
  async cleanupSoftDeleted(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await this.person.deleteMany({
        where: {
          deletedAt: {
            lte: cutoffDate,
          },
        },
      });

      this.logger.log(
        `Cleaned up ${result.count} soft-deleted records older than ${daysOld} days`,
      );
      return result.count;
    } catch (error) {
      this.logger.error('Failed to cleanup soft-deleted records:', error);
      throw error;
    }
  }
}
