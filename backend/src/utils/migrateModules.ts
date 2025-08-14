// src/utils/migrateModules.ts
import { connectDB } from '../config/db';
import { Module } from '../models/ModuleModel';

const runMigration = async () => {
  try {
    console.log('🚀 Starting module migration...');
    
    // Connect to database
    await connectDB();
    
    // Update all modules that don't have a status field
    const result = await Module.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'published' } }
    );
    
    console.log(`✅ Migration completed!`);
    console.log(`📊 Updated ${result.modifiedCount} modules`);
    console.log(`🔍 Matched ${result.matchedCount} modules`);
    
    // Verify the migration
    const allModules = await Module.find({}, 'title status').limit(5);
    console.log('📋 Sample modules after migration:');
    allModules.forEach(module => {
      console.log(`  - ${module.title}: ${module.status}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigration();