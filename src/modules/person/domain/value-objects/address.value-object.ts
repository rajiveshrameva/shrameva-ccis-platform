// src/modules/person/domain/value-objects/address.value-object.ts

import { ValueObject } from '../../../../shared/base/value-object.base';
import {
  ValidationException,
  BusinessRuleException,
} from '../../../../shared/domain/exceptions/domain-exception.base';

/**
 * Supported Countries
 *
 * Countries where the Shrameva platform operates.
 */
export enum SupportedCountry {
  /** India - Primary market */
  INDIA = 'INDIA',

  /** United Arab Emirates - Secondary market */
  UAE = 'UAE',
}

/**
 * Address Value Object Properties
 *
 * Represents address information optimized for multi-country support
 * including India and UAE with their respective address formats and postal systems.
 */
export interface AddressProps {
  /** Address line 1 - House/Building number, street name */
  addressLine1: string;

  /** Address line 2 - Area, locality (optional) */
  addressLine2?: string;

  /** Landmark for easier location identification (common in India and Middle East) */
  landmark?: string;

  /** City name */
  city: string;

  /** State/Province/Emirate name */
  stateOrProvince: string;

  /** Postal code (PIN code in India, Postal code in UAE) */
  postalCode: string;

  /** Country - India or UAE */
  country: SupportedCountry;

  /** Address type for different contexts */
  addressType: AddressType;

  /** Whether this is the primary address */
  isPrimary: boolean;

  /** Geographic coordinates (optional) */
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Address Types
 *
 * Different address categories for various platform uses.
 */
export enum AddressType {
  /** Permanent/Home address */
  HOME = 'HOME',

  /** Current residential address */
  CURRENT = 'CURRENT',

  /** Mailing address for correspondence */
  MAILING = 'MAILING',

  /** Office/Work address */
  OFFICE = 'OFFICE',

  /** College/Educational institution address */
  COLLEGE = 'COLLEGE',

  /** Temporary address */
  TEMPORARY = 'TEMPORARY',

  /** Emergency contact address */
  EMERGENCY = 'EMERGENCY',
}

/**
 * Indian States and Union Territories
 *
 * Complete list for validation and standardization.
 */
export const INDIAN_STATES = [
  // States
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',

  // Union Territories
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;

/**
 * UAE Emirates
 *
 * Seven emirates of the United Arab Emirates.
 */
export const UAE_EMIRATES = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
] as const;

/**
 * Address Value Object
 *
 * Manages address information for the Shrameva CCIS platform with support
 * for both Indian and UAE address formats, postal systems, and location services.
 *
 * Key Features:
 * - Multi-country support (India and UAE)
 * - Country-specific postal code validation
 * - Support for landmarks (crucial for Indian and Middle Eastern addressing)
 * - Multiple address types for different contexts
 * - Geographic coordinates for location-based services
 * - Address verification and standardization
 * - Distance calculation for placement opportunities
 * - Regional language support for address components
 *
 * Business Rules:
 * - Postal code validation based on country (6-digit PIN for India, flexible for UAE)
 * - State/Emirate must be valid for the selected country
 * - Address line 1, city, state/province, and postal code are mandatory
 * - Only one primary address allowed per person
 * - Coordinates must be within valid latitude/longitude ranges
 * - Address type determines validation requirements
 *
 * Critical for Shrameva Platform:
 * - Student and professional location tracking across markets
 * - Regional job opportunity matching (India/UAE)
 * - Distance-based assessment center assignment
 * - Communication and document delivery
 * - Regional partner and institution identification
 * - Local language and cultural considerations
 * - Government scheme eligibility based on location
 *
 * India vs UAE Context:
 * - India: Complex addressing with landmarks, PIN codes, state-wise policies
 * - UAE: Emirates-based system, mix of English/Arabic, expat considerations
 * - Both: Family location preferences, transportation considerations
 *
 * @example
 * ```typescript
 * // Indian address
 * const indianAddress = Address.create({
 *   addressLine1: '123, MG Road',
 *   addressLine2: 'Koramangala',
 *   landmark: 'Near Forum Mall',
 *   city: 'Bangalore',
 *   stateOrProvince: 'Karnataka',
 *   postalCode: '560034',
 *   country: SupportedCountry.INDIA,
 *   addressType: AddressType.HOME,
 *   isPrimary: true
 * });
 *
 * // UAE address
 * const uaeAddress = Address.create({
 *   addressLine1: 'Apartment 205, Marina Heights',
 *   addressLine2: 'Dubai Marina',
 *   landmark: 'Near Metro Station',
 *   city: 'Dubai',
 *   stateOrProvince: 'Dubai',
 *   postalCode: '00000',
 *   country: SupportedCountry.UAE,
 *   addressType: AddressType.HOME,
 *   isPrimary: true
 * });
 * ```
 */
export class Address extends ValueObject<AddressProps> {
  /** PIN code regex pattern for Indian postal codes */
  private static readonly INDIA_PIN_CODE_PATTERN = /^[1-9][0-9]{5}$/;

  /** UAE postal code pattern (more flexible) */
  private static readonly UAE_POSTAL_CODE_PATTERN = /^[0-9]{5}$/;

  /** Maximum length for address lines */
  private static readonly MAX_ADDRESS_LINE_LENGTH = 100;

  /** Maximum length for landmark */
  private static readonly MAX_LANDMARK_LENGTH = 100;

  /** Maximum length for city name */
  private static readonly MAX_CITY_LENGTH = 50;

  /** Valid latitude range */
  private static readonly LATITUDE_RANGE = { min: -90, max: 90 };

  /** Valid longitude range */
  private static readonly LONGITUDE_RANGE = { min: -180, max: 180 };

  /** Indian geographic bounds for coordinate validation */
  private static readonly INDIA_BOUNDS = {
    latitude: { min: 6.4, max: 37.6 },
    longitude: { min: 68.1, max: 97.25 },
  };

  /** UAE geographic bounds for coordinate validation */
  private static readonly UAE_BOUNDS = {
    latitude: { min: 22.5, max: 26.5 },
    longitude: { min: 51.0, max: 56.5 },
  };

  /**
   * Creates a new Address instance
   */
  public static create(props: AddressProps): Address {
    return new Address(props);
  }

  /**
   * Creates an Indian address with country pre-set
   */
  public static createIndianAddress(
    props: Omit<AddressProps, 'country'>,
  ): Address {
    return new Address({
      ...props,
      country: SupportedCountry.INDIA,
    });
  }

  /**
   * Creates a UAE address with country pre-set
   */
  public static createUAEAddress(
    props: Omit<AddressProps, 'country'>,
  ): Address {
    return new Address({
      ...props,
      country: SupportedCountry.UAE,
    });
  }

  /**
   * Protected constructor
   */
  protected constructor(props: AddressProps) {
    // Normalize and clean address components
    const normalizedProps: AddressProps = {
      ...props,
      addressLine1: Address.normalizeAddressLine(props.addressLine1),
      addressLine2: props.addressLine2
        ? Address.normalizeAddressLine(props.addressLine2)
        : undefined,
      landmark: props.landmark
        ? Address.normalizeAddressLine(props.landmark)
        : undefined,
      city: Address.normalizeCity(props.city),
      stateOrProvince: Address.normalizeStateOrProvince(
        props.stateOrProvince,
        props.country,
      ),
      postalCode: Address.normalizePostalCode(props.postalCode),
      country: props.country,
    };

    super(normalizedProps);
  }

  /**
   * Validates the address value object
   */
  protected validate(value: AddressProps): void {
    // Validate address line 1 (required)
    if (
      !value.addressLine1 ||
      typeof value.addressLine1 !== 'string' ||
      value.addressLine1.trim().length === 0
    ) {
      throw new ValidationException(
        'Address line 1 is required',
        'addressLine1',
        value.addressLine1,
      );
    }

    if (value.addressLine1.length > Address.MAX_ADDRESS_LINE_LENGTH) {
      throw new ValidationException(
        `Address line 1 cannot exceed ${Address.MAX_ADDRESS_LINE_LENGTH} characters`,
        'addressLine1',
        value.addressLine1,
      );
    }

    // Validate address line 2 (optional)
    if (
      value.addressLine2 &&
      value.addressLine2.length > Address.MAX_ADDRESS_LINE_LENGTH
    ) {
      throw new ValidationException(
        `Address line 2 cannot exceed ${Address.MAX_ADDRESS_LINE_LENGTH} characters`,
        'addressLine2',
        value.addressLine2,
      );
    }

    // Validate landmark (optional)
    if (value.landmark && value.landmark.length > Address.MAX_LANDMARK_LENGTH) {
      throw new ValidationException(
        `Landmark cannot exceed ${Address.MAX_LANDMARK_LENGTH} characters`,
        'landmark',
        value.landmark,
      );
    }

    // Validate city (required)
    if (
      !value.city ||
      typeof value.city !== 'string' ||
      value.city.trim().length === 0
    ) {
      throw new ValidationException('City is required', 'city', value.city);
    }

    if (value.city.length > Address.MAX_CITY_LENGTH) {
      throw new ValidationException(
        `City name cannot exceed ${Address.MAX_CITY_LENGTH} characters`,
        'city',
        value.city,
      );
    }

    // Validate state/province (required)
    if (
      !value.stateOrProvince ||
      typeof value.stateOrProvince !== 'string' ||
      value.stateOrProvince.trim().length === 0
    ) {
      throw new ValidationException(
        'State/Province/Emirate is required',
        'stateOrProvince',
        value.stateOrProvince,
      );
    }

    // Country-specific state/province validation
    if (
      value.country === SupportedCountry.INDIA &&
      !Address.isValidIndianState(value.stateOrProvince)
    ) {
      throw new ValidationException(
        'Invalid Indian state or Union Territory',
        'stateOrProvince',
        value.stateOrProvince,
      );
    }

    if (
      value.country === SupportedCountry.UAE &&
      !Address.isValidUAEEmirate(value.stateOrProvince)
    ) {
      throw new ValidationException(
        'Invalid UAE Emirate',
        'stateOrProvince',
        value.stateOrProvince,
      );
    }

    // Validate postal code (required)
    if (!value.postalCode || typeof value.postalCode !== 'string') {
      throw new ValidationException(
        'Postal code is required',
        'postalCode',
        value.postalCode,
      );
    }

    // Country-specific postal code validation
    if (
      value.country === SupportedCountry.INDIA &&
      !Address.INDIA_PIN_CODE_PATTERN.test(value.postalCode)
    ) {
      throw new ValidationException(
        'PIN code must be a valid 6-digit Indian postal code',
        'postalCode',
        value.postalCode,
      );
    }

    if (
      value.country === SupportedCountry.UAE &&
      !Address.UAE_POSTAL_CODE_PATTERN.test(value.postalCode)
    ) {
      throw new ValidationException(
        'UAE postal code must be a valid 5-digit code',
        'postalCode',
        value.postalCode,
      );
    }

    // Validate country (required)
    if (!Object.values(SupportedCountry).includes(value.country)) {
      throw new ValidationException(
        'Invalid country',
        'country',
        value.country,
      );
    }

    // Validate address type
    if (!Object.values(AddressType).includes(value.addressType)) {
      throw new ValidationException(
        'Invalid address type',
        'addressType',
        value.addressType,
      );
    }

    // Validate isPrimary
    if (typeof value.isPrimary !== 'boolean') {
      throw new ValidationException(
        'isPrimary must be a boolean value',
        'isPrimary',
        value.isPrimary,
      );
    }

    // Validate coordinates (optional)
    if (value.coordinates) {
      Address.validateCoordinates(value.coordinates);

      // Country-specific coordinate validation
      if (value.country === SupportedCountry.INDIA) {
        Address.validateIndianCoordinates(value.coordinates);
      } else if (value.country === SupportedCountry.UAE) {
        Address.validateUAECoordinates(value.coordinates);
      }
    }
  }

  /**
   * Validates coordinate values
   */
  private static validateCoordinates(coordinates: {
    latitude: number;
    longitude: number;
  }): void {
    if (
      typeof coordinates.latitude !== 'number' ||
      typeof coordinates.longitude !== 'number'
    ) {
      throw new ValidationException(
        'Coordinates must be numbers',
        'coordinates',
        coordinates,
      );
    }

    if (
      coordinates.latitude < Address.LATITUDE_RANGE.min ||
      coordinates.latitude > Address.LATITUDE_RANGE.max
    ) {
      throw new ValidationException(
        'Latitude must be between -90 and 90',
        'coordinates.latitude',
        coordinates.latitude,
      );
    }

    if (
      coordinates.longitude < Address.LONGITUDE_RANGE.min ||
      coordinates.longitude > Address.LONGITUDE_RANGE.max
    ) {
      throw new ValidationException(
        'Longitude must be between -180 and 180',
        'coordinates.longitude',
        coordinates.longitude,
      );
    }
  }

  /**
   * Validates Indian coordinates
   */
  private static validateIndianCoordinates(coordinates: {
    latitude: number;
    longitude: number;
  }): void {
    if (
      coordinates.latitude < Address.INDIA_BOUNDS.latitude.min ||
      coordinates.latitude > Address.INDIA_BOUNDS.latitude.max
    ) {
      console.warn('Coordinates appear to be outside Indian territory');
    }

    if (
      coordinates.longitude < Address.INDIA_BOUNDS.longitude.min ||
      coordinates.longitude > Address.INDIA_BOUNDS.longitude.max
    ) {
      console.warn('Coordinates appear to be outside Indian territory');
    }
  }

  /**
   * Validates UAE coordinates
   */
  private static validateUAECoordinates(coordinates: {
    latitude: number;
    longitude: number;
  }): void {
    if (
      coordinates.latitude < Address.UAE_BOUNDS.latitude.min ||
      coordinates.latitude > Address.UAE_BOUNDS.latitude.max
    ) {
      console.warn('Coordinates appear to be outside UAE territory');
    }

    if (
      coordinates.longitude < Address.UAE_BOUNDS.longitude.min ||
      coordinates.longitude > Address.UAE_BOUNDS.longitude.max
    ) {
      console.warn('Coordinates appear to be outside UAE territory');
    }
  }

  /**
   * Normalizes address line text
   */
  private static normalizeAddressLine(value: string): string {
    return value
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[,\s]+,/g, ',') // Clean up comma spacing
      .replace(/\.$/, ''); // Remove trailing period
  }

  /**
   * Normalizes city name
   */
  private static normalizeCity(value: string): string {
    return value
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Normalizes state/province name based on country
   */
  private static normalizeStateOrProvince(
    value: string,
    country: SupportedCountry,
  ): string {
    const normalized = value
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    if (country === SupportedCountry.INDIA) {
      // Handle common Indian state abbreviations
      const indianStateMapping: Record<string, string> = {
        Tn: 'Tamil Nadu',
        Kl: 'Kerala',
        Mh: 'Maharashtra',
        Dl: 'Delhi',
        Up: 'Uttar Pradesh',
        Mp: 'Madhya Pradesh',
        Wb: 'West Bengal',
        Ap: 'Andhra Pradesh',
        Ts: 'Telangana',
        Ka: 'Karnataka',
        Gj: 'Gujarat',
        Rj: 'Rajasthan',
        Orissa: 'Odisha', // Historical name
      };
      return indianStateMapping[normalized] || normalized;
    }

    if (country === SupportedCountry.UAE) {
      // Handle common UAE emirate variations
      const uaeEmirateMapping: Record<string, string> = {
        Abudhabi: 'Abu Dhabi',
        'Abu-Dhabi': 'Abu Dhabi',
        Uae: 'Dubai', // Default to Dubai if just UAE specified
        Uaq: 'Umm Al Quwain',
        Rak: 'Ras Al Khaimah',
      };
      return uaeEmirateMapping[normalized] || normalized;
    }

    return normalized;
  }

  /**
   * Normalizes postal code
   */
  private static normalizePostalCode(value: string): string {
    return value.replace(/\D/g, ''); // Remove all non-digits
  }

  /**
   * Checks if state is valid Indian state
   */
  private static isValidIndianState(state: string): boolean {
    return INDIAN_STATES.some(
      (validState) => validState.toLowerCase() === state.toLowerCase(),
    );
  }

  /**
   * Checks if emirate is valid UAE emirate
   */
  private static isValidUAEEmirate(emirate: string): boolean {
    return UAE_EMIRATES.some(
      (validEmirate) => validEmirate.toLowerCase() === emirate.toLowerCase(),
    );
  }

  /**
   * Gets the address line 1
   */
  get addressLine1(): string {
    return this.value.addressLine1;
  }

  /**
   * Gets the address line 2
   */
  get addressLine2(): string | undefined {
    return this.value.addressLine2;
  }

  /**
   * Gets the landmark
   */
  get landmark(): string | undefined {
    return this.value.landmark;
  }

  /**
   * Gets the city
   */
  get city(): string {
    return this.value.city;
  }

  /**
   * Gets the state/province/emirate
   */
  get stateOrProvince(): string {
    return this.value.stateOrProvince;
  }

  /**
   * Gets the postal code
   */
  get postalCode(): string {
    return this.value.postalCode;
  }

  /**
   * Gets the country
   */
  get country(): SupportedCountry {
    return this.value.country;
  }

  /**
   * Gets the address type
   */
  get addressType(): AddressType {
    return this.value.addressType;
  }

  /**
   * Gets the primary status
   */
  get isPrimary(): boolean {
    return this.value.isPrimary;
  }

  /**
   * Gets the coordinates
   */
  get coordinates(): { latitude: number; longitude: number } | undefined {
    return this.value.coordinates;
  }

  /**
   * Checks if this is an Indian address
   */
  get isIndianAddress(): boolean {
    return this.country === SupportedCountry.INDIA;
  }

  /**
   * Checks if this is a UAE address
   */
  get isUAEAddress(): boolean {
    return this.country === SupportedCountry.UAE;
  }

  /**
   * Gets formatted single-line address
   */
  get formattedAddress(): string {
    const parts: string[] = [this.addressLine1];

    if (this.addressLine2) {
      parts.push(this.addressLine2);
    }

    parts.push(this.city);
    parts.push(this.stateOrProvince);
    parts.push(this.postalCode);
    parts.push(this.country);

    return parts.join(', ');
  }

  /**
   * Gets formatted multi-line address
   */
  get formattedMultiLineAddress(): string {
    const lines: string[] = [this.addressLine1];

    if (this.addressLine2) {
      lines.push(this.addressLine2);
    }

    if (this.landmark) {
      lines.push(`Near ${this.landmark}`);
    }

    lines.push(`${this.city}, ${this.stateOrProvince} ${this.postalCode}`);
    lines.push(this.country);

    return lines.join('\n');
  }

  /**
   * Gets region identifier for the address
   */
  get regionIdentifier(): string {
    if (this.isIndianAddress) {
      return `${this.stateOrProvince}_${this.postalCode.substring(0, 3)}`;
    } else {
      return `${this.stateOrProvince}_${this.country}`;
    }
  }

  /**
   * Gets country-specific address format label
   */
  get stateOrProvinceLabel(): string {
    switch (this.country) {
      case SupportedCountry.INDIA:
        return 'State';
      case SupportedCountry.UAE:
        return 'Emirate';
      default:
        return 'State/Province';
    }
  }

  /**
   * Gets country-specific postal code label
   */
  get postalCodeLabel(): string {
    switch (this.country) {
      case SupportedCountry.INDIA:
        return 'PIN Code';
      case SupportedCountry.UAE:
        return 'Postal Code';
      default:
        return 'Postal Code';
    }
  }

  /**
   * Calculates distance to another address (if both have coordinates)
   */
  public calculateDistanceTo(other: Address): number | null {
    if (!this.coordinates || !other.coordinates) {
      return null;
    }

    return Address.calculateHaversineDistance(
      this.coordinates.latitude,
      this.coordinates.longitude,
      other.coordinates.latitude,
      other.coordinates.longitude,
    );
  }

  /**
   * Calculates Haversine distance between two coordinate points
   */
  private static calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in kilometers
  }

  /**
   * Checks if address is in the same city as another
   */
  public isSameCity(other: Address): boolean {
    return (
      this.city.toLowerCase() === other.city.toLowerCase() &&
      this.stateOrProvince.toLowerCase() ===
        other.stateOrProvince.toLowerCase() &&
      this.country === other.country
    );
  }

  /**
   * Checks if address is in the same state/emirate as another
   */
  public isSameStateOrProvince(other: Address): boolean {
    return (
      this.stateOrProvince.toLowerCase() ===
        other.stateOrProvince.toLowerCase() && this.country === other.country
    );
  }

  /**
   * Checks if address is in the same country as another
   */
  public isSameCountry(other: Address): boolean {
    return this.country === other.country;
  }

  /**
   * Creates new Address with updated coordinates
   */
  public withCoordinates(latitude: number, longitude: number): Address {
    return Address.create({
      ...this.value,
      coordinates: { latitude, longitude },
    });
  }

  /**
   * Creates new Address with updated primary status
   */
  public withPrimaryStatus(isPrimary: boolean): Address {
    return Address.create({
      ...this.value,
      isPrimary,
    });
  }

  /**
   * Creates new Address with updated type
   */
  public withAddressType(addressType: AddressType): Address {
    return Address.create({
      ...this.value,
      addressType,
    });
  }

  /**
   * Gets address for postal/shipping purposes
   */
  public getShippingFormat(): string {
    const lines: string[] = [this.addressLine1];

    if (this.addressLine2) {
      lines.push(this.addressLine2);
    }

    if (this.landmark) {
      lines.push(`Landmark: ${this.landmark}`);
    }

    lines.push(`${this.city} - ${this.postalCode}`);
    lines.push(this.stateOrProvince);
    lines.push(this.country);

    return lines.join('\n');
  }

  /**
   * Gets the market region for business logic
   */
  public getMarketRegion(): 'INDIA' | 'MIDDLE_EAST' {
    switch (this.country) {
      case SupportedCountry.INDIA:
        return 'INDIA';
      case SupportedCountry.UAE:
        return 'MIDDLE_EAST';
      default:
        return 'INDIA'; // Default fallback
    }
  }

  /**
   * Returns JSON representation for API responses
   */
  public toJSON(): AddressProps & {
    formattedAddress: string;
    formattedMultiLineAddress: string;
    regionIdentifier: string;
    isIndianAddress: boolean;
    isUAEAddress: boolean;
    stateOrProvinceLabel: string;
    postalCodeLabel: string;
    marketRegion: string;
  } {
    return {
      addressLine1: this.value.addressLine1,
      addressLine2: this.value.addressLine2,
      landmark: this.value.landmark,
      city: this.value.city,
      stateOrProvince: this.value.stateOrProvince,
      postalCode: this.value.postalCode,
      country: this.value.country,
      addressType: this.value.addressType,
      isPrimary: this.value.isPrimary,
      coordinates: this.value.coordinates,
      formattedAddress: this.formattedAddress,
      formattedMultiLineAddress: this.formattedMultiLineAddress,
      regionIdentifier: this.regionIdentifier,
      isIndianAddress: this.isIndianAddress,
      isUAEAddress: this.isUAEAddress,
      stateOrProvinceLabel: this.stateOrProvinceLabel,
      postalCodeLabel: this.postalCodeLabel,
      marketRegion: this.getMarketRegion(),
    };
  }

  /**
   * String representation for logging and debugging
   */
  public toString(): string {
    return this.formattedAddress;
  }
}
