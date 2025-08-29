#!/bin/bash

# TODO Progress Tracker Script
# Run from project root: ./scripts/track-todos.sh

echo "🔍 Shrameva CCIS - TODO Implementation Progress"
echo "=============================================="
echo

# Count TODOs by file
echo "📊 TODO Count by File:"
echo "----------------------"
find src/ -name "*.ts" -exec sh -c 'count=$(grep -c "TODO:" "$1" 2>/dev/null || echo 0); if [ $count -gt 0 ]; then echo "$count TODOs: $1"; fi' _ {} \;
echo

# Total TODO count
total_todos=$(find src/ -name "*.ts" -exec grep -c "TODO:" {} \; 2>/dev/null | awk '{sum += $1} END {print sum}')
echo "📈 Total TODOs: $total_todos"
echo

# TODOs by category
echo "🏷️  TODO Categories:"
echo "-------------------"
grep -r "TODO:" src/ --include="*.ts" | grep -o "TODO:.*" | sort | uniq -c | sort -rn
echo

# Files with most TODOs
echo "🎯 Files Needing Most Attention:"
echo "--------------------------------"
find src/ -name "*.ts" -exec sh -c 'count=$(grep -c "TODO:" "$1" 2>/dev/null || echo 0); if [ $count -gt 0 ]; then echo "$count $1"; fi' _ {} \; | sort -rn | head -5
echo

echo "📋 Next Steps:"
echo "--------------"
echo "1. Implement EmailService (highest priority)"
echo "2. Implement AuditService (compliance critical)"
echo "3. Implement AnalyticsService (business metrics)"
echo "4. Update handlers to remove TODOs"
echo

echo "✅ Run this script regularly to track progress!"
