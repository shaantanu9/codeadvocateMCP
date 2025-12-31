#!/bin/bash

# View Tool Call Logs Script
# Displays tool call logs, failed calls, and statistics

set -e

LOGS_DIR="logs/tool-calls"
FAILED_LOGS_DIR="logs/tool-calls-failed"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get date (default: today)
DATE=${1:-$(date +%Y-%m-%d)}

echo "========================================="
echo "Tool Call Logs Viewer"
echo "========================================="
echo "Date: $DATE"
echo ""

# Check if logs exist
MAIN_LOG="$LOGS_DIR/tool-calls-$DATE.log"
FAILED_LOG="$FAILED_LOGS_DIR/tool-calls-$DATE.log"

if [ ! -f "$MAIN_LOG" ] && [ ! -f "$FAILED_LOG" ]; then
    echo -e "${YELLOW}No logs found for date: $DATE${NC}"
    echo ""
    echo "Available log files:"
    if [ -d "$LOGS_DIR" ]; then
        ls -1 "$LOGS_DIR" | head -10
    fi
    exit 0
fi

# Statistics
echo -e "${BLUE}=== Statistics ===${NC}"
if [ -f "$MAIN_LOG" ]; then
    TOTAL=$(wc -l < "$MAIN_LOG" | tr -d ' ')
    FAILED=$(grep -c '"status":"failure"' "$MAIN_LOG" 2>/dev/null || echo "0")
    SUCCESS=$((TOTAL - FAILED))
    SUCCESS_RATE=$(awk "BEGIN {printf \"%.1f\", ($SUCCESS/$TOTAL)*100}" 2>/dev/null || echo "0")
    
    echo "Total calls: $TOTAL"
    echo -e "${GREEN}Successful: $SUCCESS${NC}"
    echo -e "${RED}Failed: $FAILED${NC}"
    echo "Success rate: ${SUCCESS_RATE}%"
else
    echo "No logs found"
fi

echo ""

# Failed tools summary
if [ -f "$FAILED_LOG" ]; then
    echo -e "${RED}=== Failed Tools Summary ===${NC}"
    echo ""
    
    # Extract tool names and count failures
    grep -o '"toolName":"[^"]*"' "$FAILED_LOG" | \
        sed 's/"toolName":"//;s/"//' | \
        sort | uniq -c | sort -rn | \
        while read count tool; do
            echo -e "${RED}$tool${NC}: $count failure(s)"
        done
    
    echo ""
fi

# Recent failed calls
if [ -f "$FAILED_LOG" ]; then
    echo -e "${RED}=== Recent Failed Calls (Last 10) ===${NC}"
    echo ""
    
    tail -10 "$FAILED_LOG" | while read line; do
        TOOL=$(echo "$line" | grep -o '"toolName":"[^"]*"' | sed 's/"toolName":"//;s/"//')
        TIME=$(echo "$line" | grep -o '"timestamp":"[^"]*"' | sed 's/"timestamp":"//;s/"//')
        ERROR=$(echo "$line" | grep -o '"message":"[^"]*"' | head -1 | sed 's/"message":"//;s/"//')
        
        echo -e "${RED}[$TIME]${NC} $TOOL"
        echo "  Error: $ERROR"
        echo ""
    done
fi

# Recent successful calls
if [ -f "$MAIN_LOG" ]; then
    echo -e "${GREEN}=== Recent Successful Calls (Last 10) ===${NC}"
    echo ""
    
    grep '"status":"success"' "$MAIN_LOG" | tail -10 | while read line; do
        TOOL=$(echo "$line" | grep -o '"toolName":"[^"]*"' | sed 's/"toolName":"//;s/"//')
        TIME=$(echo "$line" | grep -o '"timestamp":"[^"]*"' | sed 's/"timestamp":"//;s/"//')
        EXEC_TIME=$(echo "$line" | grep -o '"executionTimeMs":[0-9]*' | sed 's/"executionTimeMs"://')
        
        echo -e "${GREEN}[$TIME]${NC} $TOOL (${EXEC_TIME}ms)"
    done
    
    echo ""
fi

# View full log option
echo "========================================="
echo "Options:"
echo "  View full log: cat $MAIN_LOG | jq '.'"
echo "  View failed log: cat $FAILED_LOG | jq '.'"
echo "  View specific tool: grep '\"toolName\":\"TOOL_NAME\"' $MAIN_LOG | jq '.'"
echo ""



