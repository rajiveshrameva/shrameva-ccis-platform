// prisma/seed.ts

import {
  PrismaClient,
  Gender,
  SupportedCountry,
  KYCStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Seed sample persons for development
  const samplePersons = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      email: 'rajesh.kumar@example.com',
      phone: '+919876543210',
      phoneCountryCode: '+91',
      dateOfBirth: new Date('1998-05-15'),
      gender: Gender.MALE,
      country: SupportedCountry.INDIA,
      city: 'Mumbai',
      isVerified: true,
      kycStatus: KYCStatus.COMPLETED,
      onboardingCompleted: true,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya.sharma@example.com',
      phone: '+919876543211',
      phoneCountryCode: '+91',
      dateOfBirth: new Date('1999-08-22'),
      gender: Gender.FEMALE,
      country: SupportedCountry.INDIA,
      city: 'Delhi',
      isVerified: true,
      kycStatus: KYCStatus.COMPLETED,
      onboardingCompleted: true,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      firstName: 'Ahmed',
      lastName: 'Al-Mansouri',
      email: 'ahmed.almansouri@example.com',
      phone: '+971501234567',
      phoneCountryCode: '+971',
      dateOfBirth: new Date('1997-12-10'),
      gender: Gender.MALE,
      country: SupportedCountry.UAE,
      city: 'Dubai',
      isVerified: false,
      kycStatus: KYCStatus.PENDING,
      onboardingCompleted: false,
    },
  ];

  // Create persons with skill passports
  for (const personData of samplePersons) {
    const person = await prisma.person.create({
      data: personData,
    });

    // Create skill passport for each person
    await prisma.skillPassport.create({
      data: {
        personId: person.id,
        communicationLevel: Math.floor(Math.random() * 4) + 1,
        problemSolvingLevel: Math.floor(Math.random() * 4) + 1,
        teamworkLevel: Math.floor(Math.random() * 4) + 1,
        adaptabilityLevel: Math.floor(Math.random() * 4) + 1,
        timeManagementLevel: Math.floor(Math.random() * 4) + 1,
        technicalSkillsLevel: Math.floor(Math.random() * 4) + 1,
        leadershipLevel: Math.floor(Math.random() * 4) + 1,
        overallCCISLevel: 2.5,
        totalAssessments: 3,
        lastAssessmentDate: new Date(),
        assessmentCountry: personData.country,
      },
    });

    console.log(`✅ Created person: ${person.firstName} ${person.lastName}`);
  }

  // Create sample students
  const students = await prisma.person.findMany({
    take: 2,
  });

  for (const person of students) {
    await prisma.student.create({
      data: {
        personId: person.id,
        studentId: `STU${Date.now()}${Math.floor(Math.random() * 1000)}`,
        collegeName:
          person.country === 'INDIA'
            ? 'IIT Mumbai'
            : 'American University of Dubai',
        program: 'Computer Science Engineering',
        yearOfStudy: Math.floor(Math.random() * 4) + 1,
        enrollmentDate: new Date('2023-08-01'),
        expectedGraduationDate: new Date('2027-06-01'),
        enrollmentStatus: 'ACTIVE',
        placementStatus: 'PREPARING',
        currentGPA: 7.5 + Math.random() * 2.5, // GPA between 7.5-10.0
      },
    });

    console.log(`✅ Created student profile for: ${person.firstName}`);
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Database seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
