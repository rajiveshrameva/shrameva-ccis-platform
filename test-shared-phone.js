// Test phone value object from shared location
const {
  PhoneNumber,
  PhoneType,
} = require('./dist/shared/domain/value-objects/phone.value-object');

console.log('Testing PhoneNumber from shared location...\n');

try {
  // Test international phone number creation
  const indianPhone = PhoneNumber.create({
    number: '+919876543210',
    countryCode: 'IN',
    type: PhoneType.MOBILE,
    isPrimary: true,
  });

  const uaePhone = PhoneNumber.create({
    number: '+971501234567',
    countryCode: 'AE',
    type: PhoneType.MOBILE,
  });

  console.log('✅ Indian Phone:', indianPhone.displayFormat);
  console.log('✅ UAE Phone:', uaePhone.displayFormat);
  console.log(
    '✅ Raw parsing:',
    PhoneNumber.fromRawNumber('9876543210', 'IN').displayFormat,
  );

  console.log(
    '\n🎉 Phone value object working correctly from shared location!',
  );
} catch (error) {
  console.error('❌ Error:', error.message);
}
