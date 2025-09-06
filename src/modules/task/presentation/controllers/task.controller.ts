import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { TaskService } from '../../application/services/task.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  GetTasksQueryDto,
  PaginationDto,
  TaskSubmissionDto,
  HintRequestDto,
} from '../../application/dtos/task-request.dtos';
import {
  TaskResponseDto,
  DetailedTaskResponseDto,
  TaskCompletionResponseDto,
  HintResponseDto,
  PaginatedResponse,
} from '../../application/dtos/task-response.dtos';

/**
 * Task Controller
 * Provides REST API endpoints for task management
 */
@ApiTags('Tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  /**
   * Create a new task
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new task',
    description:
      'Creates a new task with CCIS adaptive scaffolding configuration',
  })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Task created successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid task data provided',
  })
  async createTask(
    @Body(ValidationPipe) dto: CreateTaskDto,
  ): Promise<TaskResponseDto> {
    return this.taskService.createTask(dto);
  }

  /**
   * Get all tasks with filtering and pagination
   */
  @Get()
  @ApiOperation({
    summary: 'Get tasks with filtering',
    description:
      'Retrieves tasks with optional filtering by competency, difficulty, type, etc.',
  })
  @ApiQuery({ type: GetTasksQueryDto, required: false })
  @ApiQuery({ type: PaginationDto, required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tasks retrieved successfully',
    type: PaginatedResponse<TaskResponseDto>,
  })
  async getTasks(
    @Query() queryDto: GetTasksQueryDto,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResponse<TaskResponseDto>> {
    return this.taskService.getTasks(queryDto, pagination);
  }

  /**
   * Get task by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get task by ID',
    description:
      'Retrieves detailed task information including scaffolding configuration',
  })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    example: 'cid_V1StGXR8_Z5jdHi6B-myT',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task retrieved successfully',
    type: DetailedTaskResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Task not found',
  })
  async getTaskById(@Param('id') id: string): Promise<DetailedTaskResponseDto> {
    return this.taskService.getTaskById(id);
  }

  /**
   * Update task
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Update task',
    description: 'Updates task content, difficulty, or configuration',
  })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    example: 'cid_V1StGXR8_Z5jdHi6B-myT',
  })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task updated successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Task not found',
  })
  async updateTask(
    @Param('id') id: string,
    @Body(ValidationPipe) dto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    return this.taskService.updateTask(id, dto);
  }

  /**
   * Delete task
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete task',
    description: 'Permanently deletes a task and all associated data',
  })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    example: 'cid_V1StGXR8_Z5jdHi6B-myT',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Task deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Task not found',
  })
  async deleteTask(@Param('id') id: string): Promise<void> {
    return this.taskService.deleteTask(id);
  }

  /**
   * Publish task
   */
  @Put(':id/publish')
  @ApiOperation({
    summary: 'Publish task',
    description: 'Makes task available to students',
  })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    example: 'cid_V1StGXR8_Z5jdHi6B-myT',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task published successfully',
    type: TaskResponseDto,
  })
  async publishTask(@Param('id') id: string): Promise<TaskResponseDto> {
    return this.taskService.publishTask(id);
  }

  /**
   * Unpublish task
   */
  @Put(':id/unpublish')
  @ApiOperation({
    summary: 'Unpublish task',
    description: 'Makes task unavailable to students',
  })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    example: 'cid_V1StGXR8_Z5jdHi6B-myT',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task unpublished successfully',
    type: TaskResponseDto,
  })
  async unpublishTask(@Param('id') id: string): Promise<TaskResponseDto> {
    return this.taskService.unpublishTask(id);
  }

  /**
   * Search tasks
   */
  @Get('search/:term')
  @ApiOperation({
    summary: 'Search tasks by text',
    description: 'Searches tasks by title, description, or content',
  })
  @ApiParam({
    name: 'term',
    description: 'Search term',
    example: 'email communication',
  })
  @ApiQuery({ type: GetTasksQueryDto, required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Search results retrieved successfully',
    type: [TaskResponseDto],
  })
  async searchTasks(
    @Param('term') searchTerm: string,
    @Query() queryDto: GetTasksQueryDto,
  ): Promise<TaskResponseDto[]> {
    return this.taskService.searchTasks(searchTerm, queryDto);
  }

  /**
   * Get tasks by competency
   */
  @Get('competency/:competencyId')
  @ApiOperation({
    summary: 'Get tasks by competency',
    description: 'Retrieves all tasks for a specific competency',
  })
  @ApiParam({
    name: 'competencyId',
    description: 'Competency ID',
    example: 'cid_communication',
  })
  @ApiQuery({ type: GetTasksQueryDto, required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Competency tasks retrieved successfully',
    type: [TaskResponseDto],
  })
  async getTasksByCompetency(
    @Param('competencyId') competencyId: string,
    @Query() queryDto: GetTasksQueryDto,
  ): Promise<TaskResponseDto[]> {
    return this.taskService.getTasksByCompetency(competencyId, queryDto);
  }

  /**
   * Calibrate task difficulty
   */
  @Post(':id/calibrate')
  @ApiOperation({
    summary: 'Calibrate task difficulty',
    description:
      'Recalibrates task difficulty based on student performance data',
  })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    example: 'cid_V1StGXR8_Z5jdHi6B-myT',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task difficulty calibrated successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Insufficient data for calibration',
  })
  async calibrateDifficulty(@Param('id') id: string): Promise<void> {
    return this.taskService.calibrateDifficulty(id);
  }

  /**
   * Generate content variation
   */
  @Post(':id/variations')
  @ApiOperation({
    summary: 'Generate content variation',
    description: 'Creates AI-generated variation of task content',
  })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    example: 'cid_V1StGXR8_Z5jdHi6B-myT',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        variationType: {
          type: 'string',
          example: 'industry_context',
          description: 'Type of variation to generate',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Content variation generated successfully',
  })
  async generateContentVariation(
    @Param('id') id: string,
    @Body('variationType') variationType: string,
  ): Promise<any> {
    return this.taskService.generateContentVariation(id, variationType);
  }

  /**
   * Get task quality analysis
   */
  @Get(':id/analytics/quality')
  @ApiOperation({
    summary: 'Get task quality analysis',
    description: 'Retrieves quality metrics and analysis for the task',
  })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    example: 'cid_V1StGXR8_Z5jdHi6B-myT',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Quality analysis retrieved successfully',
  })
  async getTaskQualityAnalysis(@Param('id') id: string): Promise<any> {
    return this.taskService.getTaskQualityAnalysis(id);
  }
}

/**
 * Student Task Controller
 * Provides REST API endpoints for student task interactions
 */
@ApiTags('Student Tasks')
@Controller('student/tasks')
export class StudentTaskController {
  constructor(private readonly taskService: TaskService) {}

  /**
   * Submit task completion
   */
  @Post(':taskId/submit')
  @ApiOperation({
    summary: 'Submit task completion',
    description:
      'Submits student responses and receives assessment with feedback',
  })
  @ApiParam({
    name: 'taskId',
    description: 'Task ID',
    example: 'cid_V1StGXR8_Z5jdHi6B-myT',
  })
  @ApiQuery({
    name: 'studentId',
    description: 'Student ID',
    example: 'student123',
  })
  @ApiBody({ type: TaskSubmissionDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task submission assessed successfully',
    type: TaskCompletionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Task not found',
  })
  async submitTaskCompletion(
    @Param('taskId') taskId: string,
    @Query('studentId') studentId: string,
    @Body(ValidationPipe) dto: TaskSubmissionDto,
  ): Promise<TaskCompletionResponseDto> {
    return this.taskService.submitTaskCompletion(taskId, studentId, dto);
  }

  /**
   * Request adaptive hint
   */
  @Post(':taskId/hint')
  @ApiOperation({
    summary: 'Request adaptive hint',
    description:
      'Requests AI-powered adaptive hint based on student profile and current progress',
  })
  @ApiParam({
    name: 'taskId',
    description: 'Task ID',
    example: 'cid_V1StGXR8_Z5jdHi6B-myT',
  })
  @ApiQuery({
    name: 'studentId',
    description: 'Student ID',
    example: 'student123',
  })
  @ApiBody({ type: HintRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Adaptive hint generated successfully',
    type: HintResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Task not found',
  })
  async requestHint(
    @Param('taskId') taskId: string,
    @Query('studentId') studentId: string,
    @Body(ValidationPipe) dto: HintRequestDto,
  ): Promise<HintResponseDto> {
    return this.taskService.requestHint(taskId, studentId, dto);
  }

  /**
   * Get task for student (with student-specific adaptations)
   */
  @Get(':taskId')
  @ApiOperation({
    summary: 'Get task for student',
    description:
      'Retrieves task with CCIS-level adaptations for specific student',
  })
  @ApiParam({
    name: 'taskId',
    description: 'Task ID',
    example: 'cid_V1StGXR8_Z5jdHi6B-myT',
  })
  @ApiQuery({
    name: 'studentId',
    description: 'Student ID',
    example: 'student123',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Adapted task retrieved successfully',
    type: DetailedTaskResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Task not found',
  })
  async getTaskForStudent(
    @Param('taskId') taskId: string,
    @Query('studentId') studentId: string,
  ): Promise<DetailedTaskResponseDto> {
    // This would include CCIS adaptations based on student profile
    return this.taskService.getTaskById(taskId);
  }

  /**
   * Get available tasks for student
   */
  @Get()
  @ApiOperation({
    summary: 'Get available tasks for student',
    description: "Retrieves tasks appropriate for student's current CCIS level",
  })
  @ApiQuery({
    name: 'studentId',
    description: 'Student ID',
    example: 'student123',
  })
  @ApiQuery({
    name: 'competencyId',
    description: 'Competency ID (optional)',
    example: 'cid_communication',
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Available tasks retrieved successfully',
    type: [TaskResponseDto],
  })
  async getAvailableTasksForStudent(
    @Query('studentId') studentId: string,
    @Query('competencyId') competencyId?: string,
  ): Promise<TaskResponseDto[]> {
    // This would filter tasks based on student's CCIS level and progress
    if (competencyId) {
      return this.taskService.getTasksByCompetency(competencyId);
    }

    // Return all available tasks for now
    const result = await this.taskService.getTasks(
      {},
      { page: 1, pageSize: 50 },
    );
    return result.data;
  }
}
