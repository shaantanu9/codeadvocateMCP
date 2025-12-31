#!/bin/bash
# Script to replace console.* calls with logger

echo "🔍 Finding all console.* calls..."
CONSOLE_COUNT=$(grep -r "console\." src/ --include="*.ts" | wc -l | tr -d ' ')
echo "Found $CONSOLE_COUNT instances"

echo ""
echo "📝 Replacing console.* with logger..."

find src -name "*.ts" -type f | while read file; do
  # Skip if already has logger import
  if grep -q "from.*logger" "$file"; then
    echo "  ✓ $file already has logger import"
    continue
  fi
  
  # Check if file has console calls
  if ! grep -q "console\." "$file"; then
    continue
  fi
  
  # Find first import line
  first_import_line=$(grep -n "^import" "$file" | head -1 | cut -d: -f1)
  
  if [ -n "$first_import_line" ]; then
    # Determine relative path to logger
    file_dir=$(dirname "$file")
    depth=$(echo "$file_dir" | tr -cd '/' | wc -c)
    
    # Calculate relative path
    if [ "$depth" -eq 1 ]; then
      logger_path="../core/logger.js"
    elif [ "$depth" -eq 2 ]; then
      logger_path="../../core/logger.js"
    elif [ "$depth" -eq 3 ]; then
      logger_path="../../../core/logger.js"
    else
      logger_path="../../../../core/logger.js"
    fi
    
    # Add logger import after first import
    sed -i '' "${first_import_line}a\\
import { logger } from \"${logger_path}\";\\
" "$file"
    
    echo "  ✓ Added logger import to $file"
  fi
done

# Replace console calls
echo ""
echo "🔄 Replacing console.log with logger.info..."
find src -name "*.ts" -type f -exec sed -i '' 's/console\.log(/logger.info(/g' {} \;

echo "🔄 Replacing console.error with logger.error..."
find src -name "*.ts" -type f -exec sed -i '' 's/console\.error(/logger.error(/g' {} \;

echo "🔄 Replacing console.warn with logger.warn..."
find src -name "*.ts" -type f -exec sed -i '' 's/console\.warn(/logger.warn(/g' {} \;

echo ""
echo "✅ Done! Please review the changes and fix any import path issues."



