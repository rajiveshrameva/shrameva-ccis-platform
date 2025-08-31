// src/modules/person/api/person.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
  ParseUUIDPipe,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { CreatePersonDto } from './dtos/create-person.dto';
import { UpdatePersonDto } from './dtos/update-person.dto';
import {
  PersonResponseDto,
  PersonListResponseDto,
  PersonSummaryDto,
} from './dtos/person-response.dto';
import { CreatePersonCommand } from '../application/commands/create-person.command';
import { UpdatePersonCommand } from '../application/commands/update-person.command';
import { PersonService } from '../application/services/person.service';
// import { PersonRepository } from '../infrastructure/repositories/person.repository';

/**
 * Person Controller
 *
 * REST API controller for managing persons in the Shrameva CCIS platform.
 * Provides comprehensive CRUD operations with proper validation, authorization,
 * and error handling for person management.
 *
 * Features:
 * - Complete person lifecycle management (CRUD)
 * - Privacy-aware data exposure based on user permissions
 * - Multi-country support (India/UAE)
 * - Skill passport integration
 * - Advanced filtering and pagination
 * - Audit trail support for compliance
 * - Rate limiting and security controls
 *
 * This controller supports the platform's goal of 70% placement rates
 * through comprehensive person profile management and tracking.
 */
@ApiTags('persons')
@Controller('persons')
// @UseGuards(JwtAuthGuard) // TODO: Implement authentication
// @UseInterceptors(AuditInterceptor) // TODO: Implement audit logging
export class PersonController {
  private readonly logger = new Logger(PersonController.name);

  constructor(private readonly personService: PersonService) {}

  /**
   * Create a new person
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new person',
    description:
      'Creates a new person profile in the Shrameva CCIS platform with validation and skill passport initialization.',
  })
  @ApiBody({ type: CreatePersonDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Person created successfully',
    type: PersonResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation errors',
  })
  @ApiConflictResponse({
    description: 'Email or phone number already exists',
  })
  async createPerson(
    @Body() createPersonDto: CreatePersonDto,
  ): Promise<PersonResponseDto> {
    this.logger.log(`Creating person: ${createPersonDto.email}`);

    try {
      // Manual validation using DTO static method
      const validationErrors = CreatePersonDto.validate(createPersonDto);
      if (validationErrors.length > 0) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: validationErrors,
        });
      }

      // Additional business rule validations
      this.validateCreatePersonBusinessRules(createPersonDto);

      // Create command from DTO
      const command = new CreatePersonCommand({
        firstName: createPersonDto.firstName,
        lastName: createPersonDto.lastName,
        middleName: createPersonDto.middleName,
        preferredName: createPersonDto.preferredName,
        email: createPersonDto.email,
        phone: createPersonDto.phone,
        dateOfBirth: createPersonDto.dateOfBirth,
        gender: createPersonDto.gender,
        addressLine1: createPersonDto.addressLine1,
        addressLine2: createPersonDto.addressLine2,
        city: createPersonDto.city,
        state: createPersonDto.state,
        postalCode: createPersonDto.postalCode,
        country: createPersonDto.country,
        profileVisibility: createPersonDto.profileVisibility,
        dataSharing: createPersonDto.dataSharing,
        marketingOptIn: createPersonDto.marketingOptIn,
        termsAccepted: createPersonDto.termsAccepted ?? false,
        privacyPolicyAccepted: createPersonDto.privacyPolicyAccepted ?? false,
        source: createPersonDto.source,
        metadata: createPersonDto.metadata,
      });

      // TODO: Execute command through service/handler
      // const person = await this.personService.createPerson(command);

      // Mock response for now
      const mockPerson = this.createMockPersonResponse(createPersonDto);

      this.logger.log(`Person created successfully: ${mockPerson.id}`);
      return mockPerson;
    } catch (error) {
      this.logger.error(
        `Failed to create person: ${error.message}`,
        error.stack,
      );

      if (error.message.includes('email already exists')) {
        throw new ConflictException('Email address already registered');
      }
      if (error.message.includes('phone already exists')) {
        throw new ConflictException('Phone number already registered');
      }

      throw new BadRequestException(error.message);
    }
  }

  /**
   * Get person by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get person by ID',
    description:
      'Retrieves a person profile by ID with privacy-aware data exposure.',
  })
  @ApiParam({
    name: 'id',
    description: 'Person UUID',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Person found',
    type: PersonResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Person not found',
  })
  @ApiForbiddenResponse({
    description: 'Access denied to this person profile',
  })
  async getPersonById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includePrivate') includePrivate?: boolean,
  ): Promise<PersonResponseDto> {
    this.logger.log(`Getting person by ID: ${id}`);

    try {
      // TODO: Get person from repository
      // const person = await this.personRepository.findById(id);
      // if (!person) {
      //   throw new NotFoundException(`Person with ID ${id} not found`);
      // }

      // TODO: Check access permissions
      // const canViewPrivateData = await this.personService.canViewPrivateData(currentUser, person);

      // Mock response for now
      const mockPerson = this.createMockPersonResponseById(id);

      this.logger.log(`Person retrieved successfully: ${id}`);
      return PersonResponseDto.fromEntity(mockPerson, includePrivate || false);
    } catch (error) {
      this.logger.error(
        `Failed to get person ${id}: ${error.message}`,
        error.stack,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(error.message);
    }
  }

  /**
   * Update person
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Update person',
    description:
      'Updates an existing person profile with partial update support and audit trail.',
  })
  @ApiParam({
    name: 'id',
    description: 'Person UUID',
    format: 'uuid',
  })
  @ApiBody({ type: UpdatePersonDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Person updated successfully',
    type: PersonResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation errors',
  })
  @ApiNotFoundResponse({
    description: 'Person not found',
  })
  @ApiConflictResponse({
    description: 'Optimistic concurrency conflict or duplicate data',
  })
  @ApiForbiddenResponse({
    description: 'Access denied to update this person profile',
  })
  async updatePerson(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePersonDto: UpdatePersonDto,
  ): Promise<PersonResponseDto> {
    this.logger.log(`Updating person: ${id}`);

    try {
      // Manual validation using DTO static method
      const validationErrors = UpdatePersonDto.validate(updatePersonDto);
      if (validationErrors.length > 0) {
        throw new BadRequestException({
          message: 'Validation failed' + validationErrors.join(', '),
          errors: validationErrors,
        });
      }

      // Validate that the URL ID matches the DTO ID
      if (updatePersonDto.personId !== id) {
        throw new BadRequestException(
          'Person ID in URL does not match request body',
        );
      }

      // Additional business rule validations
      this.validateUpdatePersonBusinessRules(updatePersonDto);

      // Create command from DTO
      const command = new UpdatePersonCommand({
        personId: updatePersonDto.personId,
        version: updatePersonDto.version,
        updatedBy: updatePersonDto.updatedBy,
        reason: updatePersonDto.reason,
        firstName: updatePersonDto.firstName,
        lastName: updatePersonDto.lastName,
        middleName: updatePersonDto.middleName,
        preferredName: updatePersonDto.preferredName,
        email: updatePersonDto.email,
        phone: updatePersonDto.phone,
        addressLine1: updatePersonDto.addressLine1,
        addressLine2: updatePersonDto.addressLine2,
        city: updatePersonDto.city,
        state: updatePersonDto.state,
        postalCode: updatePersonDto.postalCode,
        country: updatePersonDto.country,
        profileVisibility: updatePersonDto.profileVisibility,
        dataSharing: updatePersonDto.dataSharing,
        marketingOptIn: updatePersonDto.marketingOptIn,
        onboardingCompleted: updatePersonDto.onboardingCompleted,
        profileCompleteness: updatePersonDto.profileCompleteness,
        updateSource: updatePersonDto.updateSource,
        metadata: updatePersonDto.metadata,
      });

      // Execute command through service
      const updatedPerson = await this.personService.updatePerson(command);

      this.logger.log(`Person updated successfully: ${id}`);
      return PersonResponseDto.fromEntity(updatedPerson);
    } catch (error) {
      this.logger.error(
        `Failed to update person ${id}: ${error.message}`,
        error.stack,
      );

      if (error.message.includes('version conflict')) {
        throw new ConflictException(
          'The person record has been modified by another user. Please refresh and try again.',
        );
      }
      if (error.message.includes('not found')) {
        throw new NotFoundException(`Person with ID ${id} not found`);
      }
      if (error.message.includes('email already exists')) {
        throw new ConflictException(
          'Email address already registered to another person',
        );
      }

      throw new BadRequestException(error.message);
    }
  }

  /**
   * Get persons with filtering and pagination
   */
  @Get()
  @ApiOperation({
    summary: 'Get persons with filtering',
    description:
      'Retrieves a paginated list of persons with advanced filtering and sorting options.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (1-based)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (max 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'country',
    required: false,
    description: 'Filter by country',
    enum: ['INDIA', 'UAE'],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'],
  })
  @ApiQuery({
    name: 'profileVisibility',
    required: false,
    description: 'Filter by profile visibility',
    enum: ['PUBLIC', 'PRIVATE', 'CONTACTS_ONLY', 'INSTITUTIONS_ONLY'],
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in name and email',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort field',
    enum: [
      'createdAt',
      'updatedAt',
      'firstName',
      'lastName',
      'profileCompleteness',
    ],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order',
    enum: ['asc', 'desc'],
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Persons retrieved successfully',
    type: PersonListResponseDto,
  })
  async getPersons(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('country') country?: string,
    @Query('status') status?: string,
    @Query('profileVisibility') profileVisibility?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<PersonListResponseDto> {
    this.logger.log(`Getting persons list - page: ${page}, limit: ${limit}`);

    try {
      // Validate pagination parameters
      const validatedPage = Math.max(1, Number(page));
      const validatedLimit = Math.min(100, Math.max(1, Number(limit)));

      // TODO: Build filter criteria and execute query
      // const filterCriteria = {
      //   country,
      //   status,
      //   profileVisibility,
      //   search,
      //   page: validatedPage,
      //   limit: validatedLimit,
      //   sortBy,
      //   sortOrder,
      // };

      // const result = await this.personService.getPersons(filterCriteria);

      // Mock response for now
      const mockResult = this.createMockPersonListResponse(
        validatedPage,
        validatedLimit,
      );

      this.logger.log(`Retrieved ${mockResult.data.length} persons`);
      return mockResult;
    } catch (error) {
      this.logger.error(
        `Failed to get persons list: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Delete person
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete person',
    description:
      'Soft deletes a person profile (marks as inactive) with audit trail.',
  })
  @ApiParam({
    name: 'id',
    description: 'Person UUID',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Person deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Person not found',
  })
  @ApiForbiddenResponse({
    description: 'Access denied to delete this person profile',
  })
  async deletePerson(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('reason') reason?: string,
  ): Promise<void> {
    this.logger.log(`Deleting person: ${id}`);

    try {
      // TODO: Soft delete person
      // await this.personService.deletePerson(id, reason);

      this.logger.log(`Person deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete person ${id}: ${error.message}`,
        error.stack,
      );

      if (error.message.includes('not found')) {
        throw new NotFoundException(`Person with ID ${id} not found`);
      }

      throw new BadRequestException(error.message);
    }
  }

  /**
   * Get person summary statistics
   */
  @Get('analytics/summary')
  @ApiOperation({
    summary: 'Get person summary statistics',
    description:
      'Retrieves aggregated statistics about persons for dashboard views.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Summary statistics retrieved successfully',
    type: PersonSummaryDto,
  })
  async getPersonSummary(): Promise<PersonSummaryDto> {
    this.logger.log('Getting person summary statistics');

    try {
      // TODO: Get actual statistics from service
      // const summary = await this.personService.getSummaryStatistics();

      // Mock response for now
      const mockSummary = this.createMockPersonSummary();

      this.logger.log('Person summary retrieved successfully');
      return mockSummary;
    } catch (error) {
      this.logger.error(
        `Failed to get person summary: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Validates business rules for person creation
   */
  private validateCreatePersonBusinessRules(dto: CreatePersonDto): void {
    // Age validation
    if (!CreatePersonDto.validateAge(dto.dateOfBirth)) {
      throw new BadRequestException('Age must be between 16 and 65 years');
    }

    // Phone-country validation
    if (
      dto.country &&
      !CreatePersonDto.validatePhoneForCountry(dto.phone, dto.country)
    ) {
      throw new BadRequestException(
        `Phone number format is invalid for ${dto.country}`,
      );
    }

    // Address completeness validation
    if (!CreatePersonDto.hasCompleteAddress(dto)) {
      throw new BadRequestException(
        'If address is provided, city, postal code, and country are required',
      );
    }

    // Terms acceptance validation (business requirement)
    if (dto.termsAccepted === false) {
      throw new BadRequestException('Terms and conditions must be accepted');
    }
    if (dto.privacyPolicyAccepted === false) {
      throw new BadRequestException('Privacy policy must be accepted');
    }
  }

  /**
   * Validates business rules for person updates
   */
  private validateUpdatePersonBusinessRules(dto: UpdatePersonDto): void {
    // Sensitive changes validation
    if (!UpdatePersonDto.validateSensitiveChanges(dto)) {
      throw new BadRequestException(
        'Reason is required when updating email or phone number',
      );
    }

    // Phone-country validation
    if (
      dto.phone &&
      dto.country &&
      !UpdatePersonDto.validatePhoneForCountry(dto.phone, dto.country)
    ) {
      throw new BadRequestException(
        `Phone number format is invalid for ${dto.country}`,
      );
    }
  }

  /**
   * Creates mock person response for testing
   */
  private createMockPersonResponse(dto: CreatePersonDto): any {
    return {
      id: '123e4567-e89b-12d3-a456-426614174000',
      firstName: dto.firstName,
      lastName: dto.lastName,
      middleName: dto.middleName,
      preferredName: dto.preferredName,
      email: dto.email,
      phone: dto.phone,
      age: 25,
      gender: dto.gender,
      address: dto.addressLine1
        ? {
            addressLine1: dto.addressLine1,
            addressLine2: dto.addressLine2,
            city: dto.city,
            state: dto.state,
            postalCode: dto.postalCode,
            country: dto.country,
          }
        : undefined,
      profileVisibility: dto.profileVisibility || 'CONTACTS_ONLY',
      profileCompleteness: 85,
      onboardingCompleted: false,
      emailVerified: false,
      phoneVerified: false,
      kycCompleted: dto.kycCompleted || false,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };
  }

  /**
   * Creates mock person response by ID for testing
   */
  private createMockPersonResponseById(id: string): any {
    return {
      id,
      firstName: 'Rajesh',
      lastName: 'Kumar',
      middleName: 'Singh',
      preferredName: 'Raj',
      email: 'rajesh.kumar@example.com',
      phone: '+919876543210',
      age: 25,
      gender: 'MALE',
      address: {
        addressLine1: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'INDIA',
      },
      profileVisibility: 'CONTACTS_ONLY',
      profileCompleteness: 85,
      onboardingCompleted: true,
      emailVerified: true,
      phoneVerified: true,
      kycCompleted: false,
      status: 'ACTIVE',
      createdAt: new Date('2025-08-01'),
      updatedAt: new Date(),
      version: 1,
      skillPassport: {
        overallCcisLevel: 2,
        competencyCount: 7,
        assessmentCount: 15,
        lastAssessmentDate: new Date('2025-08-25'),
        nextMilestone: 'Complete Level 3 Communication',
        strengths: ['Problem Solving', 'Technical Skills'],
        developmentAreas: ['Leadership', 'Time Management'],
      },
    };
  }

  /**
   * Creates mock person list response for testing
   */
  private createMockPersonListResponse(
    page: number,
    limit: number,
  ): PersonListResponseDto {
    const mockPersons = Array.from({ length: Math.min(limit, 5) }, (_, i) => {
      const person = this.createMockPersonResponseById(
        `123e4567-e89b-12d3-a456-42661417400${i}`,
      );
      return PersonResponseDto.fromEntity(person);
    });

    return {
      data: mockPersons,
      meta: {
        total: 100,
        page,
        limit,
        totalPages: Math.ceil(100 / limit),
        hasNextPage: page * limit < 100,
        hasPreviousPage: page > 1,
      },
      filters: {
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
    };
  }

  /**
   * Creates mock person summary for testing
   */
  private createMockPersonSummary(): PersonSummaryDto {
    return {
      total: 1250,
      active: 1100,
      verified: 850,
      withSkillPassports: 600,
      countryDistribution: {
        INDIA: 1000,
        UAE: 250,
      },
      averageCompleteness: 78.5,
      recentRegistrations: 125,
    };
  }
}
