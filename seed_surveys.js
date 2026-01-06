// Simple Node.js script to seed surveys
// Run with: node seed_surveys.js

import { seedSurveys } from './src/utils/seedSurveys.js';

async function main() {
  try {
    console.log('🚀 Starting PayPost survey seeding...');
    await seedSurveys();
    console.log('✅ Survey seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Survey seeding failed:', error);
    process.exit(1);
  }
}

main();