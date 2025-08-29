// src/shared/domain/base/repository.interface.ts

import { Entity } from '../../base/entity.base';
import { ID } from '../../value-objects/id.value-object';
import { DomainExceptionBase } from '../exceptions/domain-exception.base';

/**
 * Base Repository Interface
 *
 * Provides the foundational contract for all domain repositories in the
 * Shrameva CCIS platform. Designed to support high-performance AI-powered
 * assessment operations with <2 second response time requirements.
 *
 * Key Design Principles:
 * - Domain-driven design compliance
 * - Performance optimization for CCIS assessment queries
 * - Support for concurrent multi-agent operations
 * - Audit trail capabilities for assessment decisions
 * - Optimistic concurrency control for data integrity
 *
 * The interface supports the platform's core mission of achieving 70%
 * placement rates through accurate CCIS level tracking and assessment.
 *
 * @template TEntity - The domain entity type
 * @template TId - The identifier type (defaults to ID value object)
 */
export interface IRepositoryBase<
  TEntity extends Entity<TId>,
  TId extends ID = ID,
> {
  /**
   * Finds an entity by its unique identifier
   *
   * Critical for CCIS assessment operations where we need fast entity retrieval
   * during scaffolding adjustments and level assessments.
   *
   * @param id - Unique identifier of the entity
   * @returns Promise resolving to entity or null if not found
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * const student = await studentRepository.findById(studentId);
   * if (student) {
   *   // Proceed with CCIS assessment
   * }
   * ```
   */
  findById(id: TId): Promise<TEntity | null>;

  /**
   * Finds an entity by its unique identifier with error throwing
   *
   * Use when entity existence is required for business operations.
   * Eliminates null checking in assessment agent operations.
   *
   * @param id - Unique identifier of the entity
   * @returns Promise resolving to entity
   * @throws ResourceNotFoundException if entity not found
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * const student = await studentRepository.findByIdOrThrow(studentId);
   * // Guaranteed to have student - safe to proceed with assessment
   * await assessmentAgent.evaluateCCISLevel(student);
   * ```
   */
  findByIdOrThrow(id: TId): Promise<TEntity>;

  /**
   * Finds multiple entities by their identifiers
   *
   * Optimized for bulk operations needed by the Assessment Agent when
   * evaluating cohorts or the Supervisor Agent coordinating multi-student
   * operations.
   *
   * @param ids - Array of unique identifiers
   * @returns Promise resolving to array of found entities
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * const students = await studentRepository.findByIds([id1, id2, id3]);
   * // Process batch CCIS assessments for efficiency
   * ```
   */
  findByIds(ids: TId[]): Promise<TEntity[]>;

  /**
   * Finds all entities with optional pagination
   *
   * Supports admin operations and reporting features. Includes pagination
   * to handle large datasets efficiently in production environments.
   *
   * @param options - Optional pagination and sorting configuration
   * @returns Promise resolving to paginated results
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * const result = await repository.findAll({
   *   page: 1,
   *   limit: 50,
   *   sortBy: 'createdAt',
   *   sortOrder: 'desc'
   * });
   * ```
   */
  findAll(options?: FindAllOptions): Promise<PaginatedResult<TEntity>>;

  /**
   * Saves an entity (create or update)
   *
   * Central persistence method for all domain entities. Supports the
   * platform's requirement for real-time CCIS level updates and assessment
   * result storage with optimistic concurrency control.
   *
   * @param entity - Domain entity to save
   * @returns Promise resolving to saved entity with updated metadata
   * @throws ConcurrencyException if entity was modified by another process
   * @throws ValidationException if entity validation fails
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * student.updateCCISLevel(competencyId, newLevel);
   * const savedStudent = await studentRepository.save(student);
   * // CCIS level change persisted and available for assessment agents
   * ```
   */
  save(entity: TEntity): Promise<TEntity>;

  /**
   * Saves multiple entities in a single transaction
   *
   * Optimized for bulk operations such as batch CCIS assessments or
   * when the Fusion Task Orchestrator updates multiple student records
   * after cross-competency evaluations.
   *
   * @param entities - Array of domain entities to save
   * @returns Promise resolving to array of saved entities
   * @throws ConcurrencyException if any entity was modified
   * @throws ValidationException if any entity validation fails
   * @throws RepositoryException if database transaction fails
   *
   * @example
   * ```typescript
   * // Bulk update after cohort assessment
   * const updatedStudents = students.map(s => s.updateProgress(results));
   * await studentRepository.saveMany(updatedStudents);
   * ```
   */
  saveMany(entities: TEntity[]): Promise<TEntity[]>;

  /**
   * Deletes an entity by its identifier
   *
   * Provides hard deletion capability. Use cautiously in production
   * as CCIS assessment history is valuable for AI model improvement
   * and compliance requirements.
   *
   * @param id - Unique identifier of entity to delete
   * @returns Promise resolving to boolean indicating success
   * @throws ResourceNotFoundException if entity not found
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * const deleted = await repository.delete(entityId);
   * if (deleted) {
   *   console.log('Entity successfully removed');
   * }
   * ```
   */
  delete(id: TId): Promise<boolean>;

  /**
   * Soft deletes an entity (marks as deleted without removing)
   *
   * Preferred deletion method for maintaining audit trails and assessment
   * history. Critical for CCIS data integrity and compliance requirements.
   *
   * @param id - Unique identifier of entity to soft delete
   * @returns Promise resolving to boolean indicating success
   * @throws ResourceNotFoundException if entity not found
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * // Preserve assessment history while marking student as inactive
   * await studentRepository.softDelete(studentId);
   * ```
   */
  softDelete(id: TId): Promise<boolean>;

  /**
   * Checks if an entity exists by its identifier
   *
   * Lightweight existence check without full entity retrieval.
   * Useful for validation operations before expensive assessments.
   *
   * @param id - Unique identifier to check
   * @returns Promise resolving to boolean indicating existence
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * const exists = await studentRepository.exists(studentId);
   * if (exists) {
   *   await initiateAssessment(studentId);
   * }
   * ```
   */
  exists(id: TId): Promise<boolean>;

  /**
   * Counts total entities matching optional criteria
   *
   * Supports analytics and reporting features for tracking platform
   * performance metrics and CCIS level distributions.
   *
   * @param criteria - Optional filtering criteria
   * @returns Promise resolving to count of matching entities
   * @throws RepositoryException if database operation fails
   *
   * @example
   * ```typescript
   * const ccisLevel3Count = await studentRepository.count({
   *   ccisLevel: 3,
   *   isActive: true
   * });
   * ```
   */
  count(criteria?: Record<string, unknown>): Promise<number>;

  /**
   * Executes a custom query with raw SQL or ORM query builder
   *
   * Escape hatch for complex assessment queries that don't fit standard
   * patterns. Use for performance-critical CCIS analytics and reporting.
   *
   * @param query - Raw query or query builder instance
   * @param parameters - Optional query parameters
   * @returns Promise resolving to query results
   * @throws RepositoryException if query execution fails
   *
   * @example
   * ```typescript
   * // Complex CCIS progression analytics
   * const progressionData = await repository.executeQuery(
   *   'SELECT competency_id, AVG(ccis_level) FROM assessments WHERE ...',
   *   { startDate, endDate }
   * );
   * ```
   */
  executeQuery<TResult = unknown>(
    query: string | object,
    parameters?: Record<string, unknown>,
  ): Promise<TResult[]>;

  /**
   * Begins a database transaction
   *
   * Essential for maintaining data consistency during complex assessment
   * operations that span multiple entities and tables.
   *
   * @returns Promise resolving to transaction context
   * @throws RepositoryException if transaction cannot be started
   *
   * @example
   * ```typescript
   * const transaction = await repository.beginTransaction();
   * try {
   *   // Multiple related updates
   *   await repository.save(student, { transaction });
   *   await assessmentRepository.save(assessment, { transaction });
   *   await transaction.commit();
   * } catch (error) {
   *   await transaction.rollback();
   *   throw error;
   * }
   * ```
   */
  beginTransaction(): Promise<ITransaction>;

  /**
   * Executes multiple operations within a transaction
   *
   * Convenience method for transactional operations with automatic
   * rollback on failure. Ideal for CCIS assessment operations that
   * must maintain consistency across multiple domain entities.
   *
   * @param operation - Function containing transactional operations
   * @returns Promise resolving to operation result
   * @throws RepositoryException if transaction fails
   *
   * @example
   * ```typescript
   * const result = await repository.withTransaction(async (tx) => {
   *   const student = await studentRepository.save(updatedStudent, { tx });
   *   const assessment = await assessmentRepository.create(newAssessment, { tx });
   *   return { student, assessment };
   * });
   * ```
   */
  withTransaction<TResult>(
    operation: (transaction: ITransaction) => Promise<TResult>,
  ): Promise<TResult>;
}

/**
 * Transaction interface for managing database transactions
 *
 * Provides the necessary operations for maintaining ACID properties
 * during complex CCIS assessment and student data operations.
 */
export interface ITransaction {
  /**
   * Commits the current transaction
   * Makes all changes permanent in the database
   */
  commit(): Promise<void>;

  /**
   * Rolls back the current transaction
   * Reverts all changes made within the transaction
   */
  rollback(): Promise<void>;

  /**
   * Checks if the transaction is still active
   * Useful for error handling and cleanup operations
   */
  isActive(): boolean;
}

/**
 * Options for finding all entities with pagination and sorting
 *
 * Supports efficient data retrieval for admin interfaces and reporting
 * features in the CCIS platform.
 */
export interface FindAllOptions {
  /**
   * Page number for pagination (1-based)
   * @default 1
   */
  page?: number;

  /**
   * Number of items per page
   * @default 20
   */
  limit?: number;

  /**
   * Field to sort by
   * @example 'createdAt', 'ccisLevel', 'name'
   */
  sortBy?: string;

  /**
   * Sort order direction
   * @default 'asc'
   */
  sortOrder?: 'asc' | 'desc';

  /**
   * Optional filtering criteria
   * Key-value pairs for field-based filtering
   */
  where?: Record<string, unknown>;

  /**
   * Fields to include in the result
   * Useful for performance optimization
   */
  select?: string[];

  /**
   * Relations to include (for ORM-based implementations)
   * @example ['assessments', 'competencies']
   */
  include?: string[];
}

/**
 * Paginated result wrapper
 *
 * Standard format for paginated data responses across the platform.
 * Supports efficient rendering of large datasets in admin interfaces.
 */
export interface PaginatedResult<TData> {
  /**
   * Array of entities for the current page
   */
  data: TData[];

  /**
   * Current page number (1-based)
   */
  page: number;

  /**
   * Number of items per page
   */
  limit: number;

  /**
   * Total number of items across all pages
   */
  total: number;

  /**
   * Total number of pages
   */
  totalPages: number;

  /**
   * Whether there is a next page available
   */
  hasNext: boolean;

  /**
   * Whether there is a previous page available
   */
  hasPrevious: boolean;
}

/**
 * Repository exception for database operation failures
 *
 * Specialized exception for repository-layer errors in the CCIS platform.
 * Provides detailed context for debugging and monitoring.
 */
export class RepositoryException extends DomainExceptionBase {
  constructor(
    message: string,
    operation: string,
    entityType: string,
    originalError?: Error,
  ) {
    const context = {
      operation,
      entityType,
      originalError: originalError?.message,
      stack: originalError?.stack,
    };

    super(message, 'REPOSITORY_ERROR', undefined, {
      context,
      shouldLog: true,
    });
  }
}

/**
 * Transaction operation options
 *
 * Configuration for repository operations that participate in transactions.
 */
export interface TransactionOptions {
  /**
   * Transaction context to use for the operation
   */
  transaction?: ITransaction;

  /**
   * Timeout for the operation in milliseconds
   * Important for maintaining <2 second response times
   */
  timeout?: number;
}
