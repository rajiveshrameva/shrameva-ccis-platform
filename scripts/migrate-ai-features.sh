#!/bin/bash

# Shrameva CCIS - AI Task Generation and Analytics Migration Script
# This script applies the new Prisma schema changes for AI-powered features

echo "🚀 Shrameva CCIS - AI Task Generation Migration"
echo "================================================"
echo ""

# Check if Prisma is available
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npm/npx not found. Please install Node.js and npm first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Error: prisma/schema.prisma not found. Please run this script from the project root."
    exit 1
fi

echo "📋 Changes to be applied:"
echo "  ✅ AI Task Generation models (AITaskGenerationTemplate, AIGeneratedTask)"
echo "  ✅ Learning Path models (LearningPath, LearningMilestone)"
echo "  ✅ Advanced Analytics models (CompetencyAnalytics, CrossCompetencyAnalytics, LearningPathAnalytics)"
echo "  ✅ New enums for AI features"
echo ""

# Ask for confirmation
read -p "🤔 Do you want to proceed with the migration? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration cancelled."
    exit 0
fi

echo "🔄 Generating Prisma migration..."

# Generate migration
npx prisma migrate dev --name "add-ai-task-generation-and-analytics" --create-only

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to generate migration. Please check your Prisma schema."
    exit 1
fi

echo "✅ Migration generated successfully!"
echo ""

echo "📝 Migration file created. You can review it before applying."
echo ""

# Ask if they want to apply the migration now
read -p "🤔 Do you want to apply the migration now? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Applying migration..."
    
    npx prisma migrate dev
    
    if [ $? -eq 0 ]; then
        echo "✅ Migration applied successfully!"
        echo ""
        echo "🎉 Your database now supports:"
        echo "  • AI-powered task generation with Claude 3.5 Sonnet"
        echo "  • Personalized learning paths with adaptive milestones"
        echo "  • Advanced analytics for competency tracking"
        echo "  • Cross-competency skill transfer analysis"
        echo ""
        echo "🚀 Next steps:"
        echo "  1. Start your application: npm run start:dev"
        echo "  2. Access AI APIs at: http://localhost:3000/ai-tasks"
        echo "  3. View API docs at: http://localhost:3000/api"
        echo ""
    else
        echo "❌ Error: Failed to apply migration."
        exit 1
    fi
else
    echo "⏸️  Migration files created but not applied."
    echo "   Run 'npx prisma migrate dev' when you're ready to apply."
fi

echo ""
echo "🎯 Shrameva CCIS AI Features Ready!"
echo "======================================"
