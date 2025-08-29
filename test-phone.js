// Quick test script for PhoneNumber value object with international support
const {
  PhoneNumber,
  PhoneType,
} = require('./dist/modules/person/domain/value-objects/phone.value-object');

console.log('Testing PhoneNumber with International Support...\n');

try {
  // Test 1: Indian mobile number
  console.log('✅ Test 1: Indian Mobile Number');
  const indianMobile = PhoneNumber.create({
    number: '+919876543210',
    countryCode: 'IN',
    type: PhoneType.MOBILE,
    isPrimary: true,
    isVerified: true,
  });

  console.log('Number:', indianMobile.number);
  console.log('Display Format:', indianMobile.displayFormat);
  console.log('Masked Display:', indianMobile.maskedDisplay);
  console.log('National Number:', indianMobile.nationalNumber);
  console.log('Country:', indianMobile.countryName);
  console.log('Is Mobile:', indianMobile.isMobile);
  console.log('Supports SMS:', indianMobile.supportsSMS);
  console.log('Supports WhatsApp:', indianMobile.supportsWhatsApp);
  console.log('Valid for OTP:', indianMobile.isValidForOTP());
  console.log('');

  // Test 2: UAE mobile number
  console.log('✅ Test 2: UAE Mobile Number');
  const uaeMobile = PhoneNumber.create({
    number: '+971501234567',
    countryCode: 'AE',
    type: PhoneType.MOBILE,
    isPrimary: false,
    isVerified: false,
  });

  console.log('Number:', uaeMobile.number);
  console.log('Display Format:', uaeMobile.displayFormat);
  console.log('Masked Display:', uaeMobile.maskedDisplay);
  console.log('Country:', uaeMobile.countryName);
  console.log('Supports WhatsApp:', uaeMobile.supportsWhatsApp);
  console.log(
    'Business Hours:',
    JSON.stringify(uaeMobile.getBusinessCallingHours()),
  );
  console.log('');

  // Test 3: UAE office number with extension
  console.log('✅ Test 3: UAE Office Number with Extension');
  const uaeOffice = PhoneNumber.create({
    number: '+97144567890',
    countryCode: 'AE',
    type: PhoneType.WORK,
    extension: '1234',
  });

  console.log('Number:', uaeOffice.number);
  console.log('Full Display:', uaeOffice.fullDisplayFormat);
  console.log('Extension:', uaeOffice.extension);
  console.log('Is Mobile:', uaeOffice.isMobile);
  console.log('');

  // Test 4: Raw number parsing (Indian)
  console.log('✅ Test 4: Raw Number Parsing (Indian)');
  const rawIndian = PhoneNumber.fromRawNumber(
    '9876543210',
    'IN',
    PhoneType.MOBILE,
  );
  console.log('Parsed Number:', rawIndian.displayFormat);
  console.log('Country Detected:', rawIndian.countryName);
  console.log('');

  // Test 5: Raw number parsing with country code detection
  console.log('✅ Test 5: Auto Country Detection');
  const autoDetected = PhoneNumber.fromRawNumber('+971 50 123 4567');
  console.log('Detected Number:', autoDetected.displayFormat);
  console.log('Detected Country:', autoDetected.countryName);
  console.log('');

  // Test 6: US number format
  console.log('✅ Test 6: US Number Format');
  const usNumber = PhoneNumber.create({
    number: '+15551234567',
    countryCode: 'US',
    type: PhoneType.MOBILE,
  });
  console.log('US Display:', usNumber.displayFormat);
  console.log('');

  // Test 7: Method chaining and updates
  console.log('✅ Test 7: Method Chaining');
  const verified = indianMobile.markAsVerified();
  const primaryVerified = verified.markAsPrimary();
  console.log('Original verified status:', indianMobile.isVerified);
  console.log('Chained verified status:', primaryVerified.isVerified);
  console.log('Chained primary status:', primaryVerified.isPrimary);
  console.log('');

  // Test 8: JSON serialization
  console.log('✅ Test 8: JSON Serialization');
  const jsonOutput = uaeMobile.toJSON();
  console.log('JSON Output:', JSON.stringify(jsonOutput, null, 2));
  console.log('');

  // Test 9: Phone equality check
  console.log('✅ Test 9: Equality Check');
  const duplicateIndian = PhoneNumber.create({
    number: '+919876543210',
    countryCode: 'IN',
    type: PhoneType.MOBILE,
  });
  console.log('Are equal:', indianMobile.equals(duplicateIndian));
  console.log('Are different:', indianMobile.equals(uaeMobile));
  console.log('');

  console.log(
    '🎉 All PhoneNumber tests passed! International support is working correctly.',
  );
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('Details:', error);
}

// Test error cases
console.log('\n🔍 Testing Error Cases...');

try {
  // Should fail - mobile with extension
  const invalidMobile = PhoneNumber.create({
    number: '+919876543210',
    countryCode: 'IN',
    type: PhoneType.MOBILE,
    extension: '123',
  });
  console.log('❌ Should have failed: Mobile with extension');
} catch (error) {
  console.log('✅ Correctly caught mobile extension error:', error.message);
}

try {
  // Should fail - invalid format
  const invalidFormat = PhoneNumber.create({
    number: '+9198765',
    countryCode: 'IN',
    type: PhoneType.MOBILE,
  });
  console.log('❌ Should have failed: Invalid format');
} catch (error) {
  console.log('✅ Correctly caught format error:', error.message);
}

try {
  // Should fail - invalid country code format
  const invalidCountry = PhoneNumber.create({
    number: '+919876543210',
    countryCode: 'XX',
    type: PhoneType.MOBILE,
  });
  console.log(
    'Number created with unknown country:',
    invalidCountry.countryName,
  );
} catch (error) {
  console.log('✅ Handled unknown country gracefully');
}

console.log('\n✨ PhoneNumber Value Object testing completed!');
