// src/shared/domain/value-objects/date-range.value-object.ts

import { ValueObject } from '../../base/value-object.base';
import {
  ValidationException,
  BusinessRuleException,
} from '../exceptions/domain-exception.base';

/**
 * Date Range Value Object
 *
 * Represents a period between two dates with comprehensive validation
 * and business logic for the Shrameva CCIS platform. Handles various
 * date range scenarios including course durations, assessment periods,
 * placement cycles, and CCIS evaluation windows.
 *
 * Business Rules:
 * - Start date must be before or equal to end date
 * - Both dates must be valid Date objects
 * - Supports open-ended ranges (null end date for ongoing periods)
 * - Provides overlap detection for scheduling conflicts
 * - Calculates duration in various units (days, weeks, months)
 * - Timezone-aware for global student programs
 * - Immutable once created (create new instance for changes)
 *
 * Use Cases in Shrameva Platform:
 * - Course enrollment periods and durations
 * - Assessment windows and deadlines
 * - CCIS evaluation cycles (weekly, monthly assessments)
 * - Placement drive scheduling and timelines
 * - Student availability periods for jobs
 * - Mentor assignment durations
 * - College partnership agreement periods
 * - AI agent assessment batch processing windows
 *
 * @example
 * ```typescript
 * // Course duration
 * const coursePeriod = DateRange.create(
 *   new Date('2024-01-15'),
 *   new Date('2024-06-15')
 * );
 *
 * // Assessment window
 * const assessmentWindow = DateRange.create(
 *   new Date('2024-03-01'),
 *   new Date('2024-03-07')
 * );
 *
 * // Open-ended enrollment
 * const enrollmentPeriod = DateRange.createOpenEnded(
 *   new Date('2024-01-01')
 * );
 *
 * // Check operations
 * console.log(coursePeriod.getDurationInDays()); // 151 days
 * console.log(coursePeriod.contains(new Date('2024-03-15'))); // true
 * console.log(coursePeriod.overlaps(assessmentWindow)); // true
 * ```
 */
export class DateRange extends ValueObject<DateRangeData> {
  private constructor(value: DateRangeData) {
    super(value);
  }

  /**
   * Creates a new DateRange with start and end dates
   *
   * @param startDate - Beginning of the date range
   * @param endDate - End of the date range
   * @returns DateRange instance
   * @throws ValidationException if dates are invalid
   * @throws BusinessRuleException if start > end
   */
  public static create(startDate: Date, endDate: Date): DateRange {
    const data: DateRangeData = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isOpenEnded: false,
    };

    return new DateRange(data);
  }

  /**
   * Creates an open-ended date range (no end date)
   *
   * Useful for ongoing enrollments, permanent employment,
   * or indefinite assessment periods.
   *
   * @param startDate - Beginning of the date range
   * @returns DateRange instance with no end date
   * @throws ValidationException if start date is invalid
   */
  public static createOpenEnded(startDate: Date): DateRange {
    const data: DateRangeData = {
      startDate: new Date(startDate),
      endDate: null,
      isOpenEnded: true,
    };

    return new DateRange(data);
  }

  /**
   * Creates a DateRange for a specific number of days from start
   *
   * @param startDate - Beginning of the date range
   * @param durationInDays - Number of days for the range
   * @returns DateRange instance
   * @throws ValidationException if inputs are invalid
   */
  public static createForDuration(
    startDate: Date,
    durationInDays: number,
  ): DateRange {
    if (durationInDays <= 0) {
      throw new ValidationException(
        'Duration must be positive',
        'durationInDays',
        durationInDays,
      );
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationInDays);

    return this.create(startDate, endDate);
  }

  /**
   * Creates a DateRange for current academic year (April to March in India)
   *
   * @param year - Calendar year for the academic year start (e.g., 2024 for 2024-25)
   * @returns DateRange for the academic year
   */
  public static createAcademicYear(year: number): DateRange {
    const startDate = new Date(year, 3, 1); // April 1st
    const endDate = new Date(year + 1, 2, 31); // March 31st next year

    return this.create(startDate, endDate);
  }

  /**
   * Creates a DateRange for current week (Monday to Sunday)
   *
   * Useful for weekly CCIS assessments and progress tracking.
   *
   * @param referenceDate - Date within the desired week
   * @returns DateRange for the week containing the reference date
   */
  public static createWeek(referenceDate: Date = new Date()): DateRange {
    const date = new Date(referenceDate);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(date);
    monday.setDate(date.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return this.create(monday, sunday);
  }

  /**
   * Creates a DateRange for current month
   *
   * @param referenceDate - Date within the desired month
   * @returns DateRange for the month containing the reference date
   */
  public static createMonth(referenceDate: Date = new Date()): DateRange {
    const startOfMonth = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      1,
    );
    const endOfMonth = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() + 1,
      0,
    );
    endOfMonth.setHours(23, 59, 59, 999);

    return this.create(startOfMonth, endOfMonth);
  }

  /**
   * Creates a DateRange from today extending for specified days
   *
   * @param daysFromToday - Number of days from today (positive for future, negative for past)
   * @returns DateRange from today to the target date
   */
  public static createFromToday(daysFromToday: number): DateRange {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysFromToday);

    if (daysFromToday >= 0) {
      return this.create(today, targetDate);
    } else {
      return this.create(targetDate, today);
    }
  }

  /**
   * Validates the date range according to business rules
   */
  protected validate(value: DateRangeData): void {
    if (!value) {
      throw new ValidationException(
        'DateRange data cannot be null or undefined',
        'dateRange',
        value,
      );
    }

    if (!value.startDate || !(value.startDate instanceof Date)) {
      throw new ValidationException(
        'Start date must be a valid Date object',
        'startDate',
        value.startDate,
      );
    }

    if (isNaN(value.startDate.getTime())) {
      throw new ValidationException(
        'Start date must be a valid date',
        'startDate',
        value.startDate,
      );
    }

    if (!value.isOpenEnded) {
      if (!value.endDate || !(value.endDate instanceof Date)) {
        throw new ValidationException(
          'End date must be a valid Date object for closed ranges',
          'endDate',
          value.endDate,
        );
      }

      if (isNaN(value.endDate.getTime())) {
        throw new ValidationException(
          'End date must be a valid date',
          'endDate',
          value.endDate,
        );
      }

      if (value.startDate > value.endDate) {
        throw new BusinessRuleException(
          'Start date cannot be after end date',
          'INVALID_DATE_ORDER',
          {
            context: {
              startDate: value.startDate,
              endDate: value.endDate,
            },
          },
        );
      }
    }

    // Business rule: Date ranges cannot be more than 10 years
    if (!value.isOpenEnded && value.endDate) {
      const maxDuration = 10 * 365 * 24 * 60 * 60 * 1000; // 10 years in milliseconds
      const duration = value.endDate.getTime() - value.startDate.getTime();

      if (duration > maxDuration) {
        throw new BusinessRuleException(
          'Date range cannot exceed 10 years',
          'RANGE_TOO_LONG',
          {
            context: {
              durationYears: duration / (365 * 24 * 60 * 60 * 1000),
              maxYears: 10,
            },
          },
        );
      }
    }
  }

  /**
   * Gets the start date of the range
   */
  public getStartDate(): Date {
    return new Date(this.value.startDate);
  }

  /**
   * Gets the end date of the range (null if open-ended)
   */
  public getEndDate(): Date | null {
    return this.value.endDate ? new Date(this.value.endDate) : null;
  }

  /**
   * Checks if the range is open-ended (no end date)
   */
  public isOpenEnded(): boolean {
    return this.value.isOpenEnded;
  }

  /**
   * Checks if a specific date falls within this range
   *
   * @param date - Date to check
   * @param inclusive - Whether to include boundary dates (default: true)
   * @returns True if date is within range
   */
  public contains(date: Date, inclusive: boolean = true): boolean {
    const checkDate = new Date(date);
    const startDate = this.value.startDate;
    const endDate = this.value.endDate;

    if (inclusive) {
      const afterStart = checkDate >= startDate;
      const beforeEnd =
        this.value.isOpenEnded || (endDate !== null && checkDate <= endDate);
      return afterStart && beforeEnd;
    } else {
      const afterStart = checkDate > startDate;
      const beforeEnd =
        this.value.isOpenEnded || (endDate !== null && checkDate < endDate);
      return afterStart && beforeEnd;
    }
  }

  /**
   * Checks if this range overlaps with another range
   *
   * @param other - Another DateRange to check against
   * @returns True if ranges overlap
   */
  public overlaps(other: DateRange): boolean {
    const thisStart = this.value.startDate;
    const thisEnd = this.value.endDate;
    const otherStart = other.value.startDate;
    const otherEnd = other.value.endDate;

    // If either range is open-ended, check if they could overlap
    if (this.value.isOpenEnded) {
      return otherEnd === null || thisStart <= otherEnd;
    }

    if (other.value.isOpenEnded) {
      return thisEnd === null || otherStart <= thisEnd;
    }

    // Both ranges have end dates
    if (!thisEnd || !otherEnd) return false;

    return thisStart <= otherEnd && otherStart <= thisEnd;
  }

  /**
   * Gets the duration of the range in milliseconds
   *
   * @returns Duration in milliseconds (null if open-ended)
   */
  public getDurationInMilliseconds(): number | null {
    if (this.value.isOpenEnded || !this.value.endDate) {
      return null;
    }

    return this.value.endDate.getTime() - this.value.startDate.getTime();
  }

  /**
   * Gets the duration of the range in days
   *
   * @returns Duration in days (null if open-ended)
   */
  public getDurationInDays(): number | null {
    const ms = this.getDurationInMilliseconds();
    return ms ? Math.ceil(ms / (24 * 60 * 60 * 1000)) : null;
  }

  /**
   * Gets the duration of the range in weeks
   *
   * @returns Duration in weeks (null if open-ended)
   */
  public getDurationInWeeks(): number | null {
    const days = this.getDurationInDays();
    return days ? Math.ceil(days / 7) : null;
  }

  /**
   * Gets the duration of the range in months (approximate)
   *
   * @returns Duration in months (null if open-ended)
   */
  public getDurationInMonths(): number | null {
    if (this.value.isOpenEnded || !this.value.endDate) {
      return null;
    }

    const startYear = this.value.startDate.getFullYear();
    const startMonth = this.value.startDate.getMonth();
    const endYear = this.value.endDate.getFullYear();
    const endMonth = this.value.endDate.getMonth();

    return (endYear - startYear) * 12 + (endMonth - startMonth);
  }

  /**
   * Checks if the range includes the current date/time
   */
  public isActive(): boolean {
    return this.contains(new Date());
  }

  /**
   * Checks if the range is in the future
   */
  public isFuture(): boolean {
    return this.value.startDate > new Date();
  }

  /**
   * Checks if the range is in the past
   */
  public isPast(): boolean {
    if (this.value.isOpenEnded) {
      return false; // Open-ended ranges are considered current/ongoing
    }

    return this.value.endDate ? this.value.endDate < new Date() : false;
  }

  /**
   * Gets the overlap period with another range
   *
   * @param other - Another DateRange
   * @returns DateRange of the overlapping period, or null if no overlap
   */
  public getOverlap(other: DateRange): DateRange | null {
    if (!this.overlaps(other)) {
      return null;
    }

    const overlapStart = new Date(
      Math.max(this.value.startDate.getTime(), other.value.startDate.getTime()),
    );

    // Handle open-ended ranges
    if (this.value.isOpenEnded && other.value.isOpenEnded) {
      return DateRange.createOpenEnded(overlapStart);
    }

    if (this.value.isOpenEnded && other.value.endDate) {
      return DateRange.create(overlapStart, other.value.endDate);
    }

    if (other.value.isOpenEnded && this.value.endDate) {
      return DateRange.create(overlapStart, this.value.endDate);
    }

    // Both have end dates
    if (this.value.endDate && other.value.endDate) {
      const overlapEnd = new Date(
        Math.min(this.value.endDate.getTime(), other.value.endDate.getTime()),
      );

      return DateRange.create(overlapStart, overlapEnd);
    }

    return null;
  }

  /**
   * Extends the range by a specified number of days
   *
   * @param days - Number of days to extend (positive to extend end, negative to move start)
   * @returns New DateRange instance
   */
  public extend(days: number): DateRange {
    if (this.value.isOpenEnded) {
      throw new BusinessRuleException(
        'Cannot extend an open-ended range',
        'CANNOT_EXTEND_OPEN_RANGE',
      );
    }

    if (!this.value.endDate) {
      throw new BusinessRuleException(
        'Cannot extend range without end date',
        'MISSING_END_DATE',
      );
    }

    const newEndDate = new Date(this.value.endDate);
    newEndDate.setDate(newEndDate.getDate() + days);

    return DateRange.create(this.value.startDate, newEndDate);
  }

  /**
   * Splits the range into smaller periods
   *
   * @param intervalDays - Number of days for each split period
   * @returns Array of DateRange instances
   */
  public split(intervalDays: number): DateRange[] {
    if (this.value.isOpenEnded) {
      throw new BusinessRuleException(
        'Cannot split an open-ended range',
        'CANNOT_SPLIT_OPEN_RANGE',
      );
    }

    if (intervalDays <= 0) {
      throw new ValidationException(
        'Interval must be positive',
        'intervalDays',
        intervalDays,
      );
    }

    const ranges: DateRange[] = [];
    let currentStart = new Date(this.value.startDate);
    const endDate = this.value.endDate!;

    while (currentStart < endDate) {
      const currentEnd = new Date(currentStart);
      currentEnd.setDate(currentEnd.getDate() + intervalDays);

      // Don't exceed the original end date
      if (currentEnd > endDate) {
        currentEnd.setTime(endDate.getTime());
      }

      ranges.push(DateRange.create(currentStart, currentEnd));

      // Move to next interval
      currentStart = new Date(currentEnd);
      currentStart.setDate(currentStart.getDate() + 1);
    }

    return ranges;
  }

  /**
   * Gets a human-readable description of the date range
   */
  public getDescription(): string {
    const startStr = this.value.startDate.toLocaleDateString();

    if (this.value.isOpenEnded) {
      return `From ${startStr} (ongoing)`;
    }

    const endStr = this.value.endDate?.toLocaleDateString();
    const duration = this.getDurationInDays();

    return `${startStr} to ${endStr} (${duration} days)`;
  }

  /**
   * Formats the range for API responses and storage
   */
  public toJSON(): DateRangeJSON {
    return {
      startDate: this.value.startDate.toISOString(),
      endDate: this.value.endDate?.toISOString() || null,
      isOpenEnded: this.value.isOpenEnded,
      durationInDays: this.getDurationInDays(),
      description: this.getDescription(),
    };
  }

  /**
   * Creates DateRange from JSON representation
   */
  public static fromJSON(json: DateRangeJSON): DateRange {
    const startDate = new Date(json.startDate);

    if (json.isOpenEnded) {
      return DateRange.createOpenEnded(startDate);
    }

    if (!json.endDate) {
      throw new ValidationException(
        'End date required for non-open-ended ranges',
        'endDate',
        json.endDate,
      );
    }

    const endDate = new Date(json.endDate);
    return DateRange.create(startDate, endDate);
  }
}

/**
 * Internal data structure for DateRange
 */
interface DateRangeData {
  startDate: Date;
  endDate: Date | null;
  isOpenEnded: boolean;
}

/**
 * JSON representation of DateRange for API responses
 */
export interface DateRangeJSON {
  startDate: string; // ISO string
  endDate: string | null; // ISO string or null
  isOpenEnded: boolean;
  durationInDays: number | null;
  description: string;
}

/**
 * Date range comparison result
 */
export enum DateRangeRelation {
  BEFORE = 'BEFORE', // This range is completely before other
  AFTER = 'AFTER', // This range is completely after other
  OVERLAPS = 'OVERLAPS', // Ranges overlap partially
  CONTAINS = 'CONTAINS', // This range contains other completely
  CONTAINED_BY = 'CONTAINED_BY', // This range is contained by other
  IDENTICAL = 'IDENTICAL', // Ranges are identical
}
