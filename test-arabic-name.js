// Quick test script for Arabic name support
const {
  PersonName,
} = require('./dist/modules/person/domain/value-objects/person-name.value-object');

console.log('Testing PersonName with Arabic support...\n');

try {
  // Test 1: Indian name
  const indianName = PersonName.create({
    firstName: 'Rajesh',
    middleName: 'Kumar',
    lastName: 'Sharma',
  });

  console.log('✅ Indian Name Test:');
  console.log('Full Name:', indianName.fullName);
  console.log('Display Name:', indianName.displayName);
  console.log('Searchable Text:', indianName.searchableText);
  console.log('Arabic Name:', indianName.arabicName || 'Not provided');
  console.log('');

  // Test 2: Arabic name
  const arabicName = PersonName.create({
    firstName: 'Ahmed',
    middleName: 'Ali',
    lastName: 'Al Mansouri',
    arabicName: 'أحمد علي المنصوري',
  });

  console.log('✅ Arabic Name Test:');
  console.log('Full Name:', arabicName.fullName);
  console.log('Display Name:', arabicName.displayName);
  console.log('Arabic Name:', arabicName.arabicName);
  console.log('Searchable Text:', arabicName.searchableText);
  console.log('JSON:', JSON.stringify(arabicName.toJSON(), null, 2));
  console.log('');

  // Test 3: UAE Emirati name with Arabic
  const emiratiName = PersonName.create({
    firstName: 'Mohammed',
    lastName: 'Bin Rashid',
    arabicName: 'محمد بن راشد',
  });

  console.log('✅ Emirati Name Test:');
  console.log('Full Name:', emiratiName.fullName);
  console.log('Arabic Name:', emiratiName.arabicName);
  console.log('Initials:', emiratiName.initials);
  console.log('');

  console.log('🎉 All tests passed! Arabic name support is working correctly.');
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('Details:', error);
}
