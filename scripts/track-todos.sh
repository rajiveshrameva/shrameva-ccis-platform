#!/bin/bash

# TODO Progress Tracker Script
# Run from project root: ./scripts/track-todos.sh
# Or run from scripts dir: ./track-todos.sh

echo "🔍 Shrameva CCIS - TODO Implementation Progress"
echo "=============================================="
echo

# Get the correct source directory path
if [ -d "src/" ]; then
    SRC_DIR="src/"
elif [ -d "../src/" ]; then
    SRC_DIR="../src/"
else
    echo "❌ Error: Cannot find src/ directory"
    echo "Please run this script from the project root or scripts directory"
    exit 1
fi

echo "📍 Scanning directory: $SRC_DIR"
echo

# Count TODOs by file (simplified)
echo "📊 TODO Count by File:"
echo "----------------------"
for file in $(find "$SRC_DIR" -name "*.ts"); do
    count=$(grep -c "TODO:" "$file" 2>/dev/null || echo 0)
    if [ "$count" -gt 0 ]; then
        echo "$count TODOs: $file"
    fi
done | sort -rn
echo

# Total TODO count
total_todos=$(grep -r "TODO:" "$SRC_DIR" --include="*.ts" 2>/dev/null | wc -l)
echo "📈 Total TODOs: $total_todos"
echo

# TODOs by category
echo "🏷️  TODO Categories:"
echo "-------------------"
grep -r "TODO:" "$SRC_DIR" --include="*.ts" 2>/dev/null | grep -o "TODO:.*" | sort | uniq -c | sort -rn | head -20
echo

# Files with most TODOs (simplified)
echo "🎯 Files Needing Most Attention:"
echo "--------------------------------"
for file in $(find "$SRC_DIR" -name "*.ts"); do
    count=$(grep -c "TODO:" "$file" 2>/dev/null || echo 0)
    if [ "$count" -gt 0 ]; then
        echo "$count $file"
    fi
done | sort -rn | head -5
echo

echo "📋 Next Steps:"
echo "--------------"
echo "1. Implement EmailService (highest priority)"
echo "2. Implement AuditService (compliance critical)"
echo "3. Implement AnalyticsService (business metrics)"
echo "4. Update handlers to remove TODOs"
echo

echo "✅ Run this script regularly to track progress!"
