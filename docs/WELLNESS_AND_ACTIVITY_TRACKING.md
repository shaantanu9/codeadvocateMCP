# Wellness & Activity Tracking Guide

## Overview

The MCP server includes built-in wellness features that track your activity and remind you to take breaks, stay hydrated, and maintain healthy work habits.

## Features

### 1. Activity Tracking
- Tracks session duration and active time
- Monitors continuous usage
- Stores activity data persistently
- Tracks client information and workspace

### 2. Break Reminders
- **Short Break**: Reminder after 20 minutes of continuous activity
- **Forced Break**: Blocks MCP operations after 30 minutes without a break
- **Long Break**: Suggests longer break after 3 hours of work
- **Water Reminder**: Reminds to drink water every hour

### 3. Forced Break System
- After 30 minutes of continuous activity, MCP operations are blocked
- You must use the `recordBreak` tool to continue
- Prevents overwork and promotes healthy habits

## Configuration

Default break intervals (can be customized):

```typescript
{
  breakInterval: 20 * 60 * 1000,        // 20 minutes - reminder
  forcedBreakInterval: 30 * 60 * 1000,  // 30 minutes - forced break
  waterReminderInterval: 60 * 60 * 1000, // 1 hour - water reminder
  longBreakInterval: 3 * 60 * 60 * 1000, // 3 hours - long break
  breakDuration: 10 * 60 * 1000,         // 10 minutes - break duration
}
```

## MCP Tools

### 1. `breakReminder`
Get current break status and wellness recommendations.

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "breakStatus": {
      "shouldTakeBreak": true,
      "forcedBreak": false,
      "breakType": "short",
      "message": "⏰ BREAK REMINDER: You've been active for 25 minutes...",
      "timeUntilBreak": 0,
      "timeSinceLastBreak": 1500000,
      "shouldDrinkWater": false,
      "shouldTakeLongBreak": false
    },
    "recommendations": [
      "⏰ It's time for a break! Take 10 minutes to rest",
      "💡 Look away from your screen and focus on something 20 feet away"
    ],
    "sessionInfo": {
      "sessionId": "...",
      "client": "Cursor IDE",
      "workspace": "/path/to/workspace"
    }
  }
}
```

### 2. `recordBreak`
Record that you've taken a break. This resets the break timer.

**Parameters:**
```json
{
  "duration": 10  // Optional: break duration in minutes (1-120)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Break recorded successfully",
    "breakDuration": 10,
    "sessionId": "...",
    "timestamp": "2025-01-01T00:00:00.000Z"
  }
}
```

## API Endpoints

### 1. Get Current Session Activity Stats
```
GET /api/activity/stats
```

Returns activity statistics for the current session.

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "...",
    "totalActiveTime": 1800000,
    "totalActiveTimeFormatted": "30m 0s",
    "breakCount": 2,
    "lastBreakTime": "2025-01-01T00:00:00.000Z",
    "lastActivityTime": "2025-01-01T00:30:00.000Z",
    "client": {
      "type": "Cursor IDE",
      "name": "Cursor IDE",
      "version": "2.2.23",
      "platform": "macOS"
    },
    "workspace": "/path/to/workspace"
  }
}
```

### 2. Get All Activity Statistics
```
GET /api/activity/all
```

Returns statistics for all sessions.

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [...],
    "totalSessions": 5,
    "totalActiveTime": 7200000,
    "totalBreaks": 10
  }
}
```

### 3. Get Break Status
```
GET /api/activity/break-status
```

Returns current break status for the session.

**Response:**
```json
{
  "success": true,
  "data": {
    "breakStatus": {
      "shouldTakeBreak": true,
      "forcedBreak": false,
      "breakType": "short",
      "message": "...",
      "timeUntilBreak": 0,
      "timeSinceLastBreak": 1500000
    },
    "sessionId": "..."
  }
}
```

## How It Works

### Activity Tracking Flow

```
Request → Context Middleware
  ↓
Start/Update Session
  ↓
Check Forced Break (if MCP request)
  ↓
  ├─ Forced Break? → Block Request (429)
  └─ No Forced Break? → Record Activity → Continue
```

### Break Enforcement

1. **Tracking**: Every MCP request records activity
2. **Monitoring**: System tracks time since last break
3. **Warning**: After 20 minutes, break reminder is shown
4. **Enforcement**: After 30 minutes, MCP operations are blocked
5. **Reset**: Use `recordBreak` tool to reset timer

### Storage

Activity data is stored in:
- **Memory**: Active sessions (fast access)
- **Disk**: `.mcp-activity/sessions/` (persistent storage)
- **Format**: JSON files per session

## Usage Examples

### Example 1: Check Break Status

```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "breakReminder",
      "arguments": {}
    }
  }'
```

### Example 2: Record a Break

```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "recordBreak",
      "arguments": {
        "duration": 10
      }
    }
  }'
```

### Example 3: Get Activity Stats via API

```bash
curl http://localhost:3111/api/activity/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Forced Break Behavior

When a forced break is required:

1. **MCP requests are blocked** with HTTP 429 status
2. **Error response** includes:
   - Clear message about forced break
   - Time since last break
   - Instructions to take a break
   - Tool name to use (`recordBreak`)

3. **To continue working:**
   - Take a 10-minute break
   - Call `recordBreak` tool
   - MCP operations resume

## Break Types

### Short Break (20 minutes)
- **Type**: `short`
- **Action**: Reminder only
- **Duration**: 10 minutes recommended

### Forced Break (30 minutes)
- **Type**: `long`
- **Action**: Blocks MCP operations
- **Duration**: 10 minutes required

### Long Break (3 hours)
- **Type**: `long`
- **Action**: Strong recommendation
- **Duration**: 15-30 minutes recommended

### Water Reminder (1 hour)
- **Type**: `water`
- **Action**: Reminder to drink water
- **Duration**: N/A

## Data Stored

For each session, the system stores:

- **Session ID**: Unique identifier
- **Start Time**: When session started
- **Last Activity Time**: Last request timestamp
- **Total Active Time**: Cumulative active time
- **Break Count**: Number of breaks taken
- **Last Break Time**: When last break was taken
- **Request Count**: Total number of requests
- **Client Info**: Editor/app information
- **Workspace Path**: Current workspace

## Privacy

- Activity data is stored locally on the server
- No data is sent to external services
- Data is cleaned up after 24 hours of inactivity
- All data is session-scoped (not user-identifiable)

## Customization

To customize break intervals, modify the `ActivityTracker` configuration:

```typescript
import { activityTracker } from "./core/activity-tracker.js";

// Create custom tracker with different intervals
const customTracker = new ActivityTracker({
  breakInterval: 15 * 60 * 1000,        // 15 minutes
  forcedBreakInterval: 25 * 60 * 1000,  // 25 minutes
  waterReminderInterval: 45 * 60 * 1000, // 45 minutes
  longBreakInterval: 2 * 60 * 60 * 1000, // 2 hours
  breakDuration: 5 * 60 * 1000,          // 5 minutes
});
```

## Best Practices

1. **Regular Breaks**: Use `breakReminder` tool regularly
2. **Record Breaks**: Always use `recordBreak` after taking a break
3. **Stay Hydrated**: Pay attention to water reminders
4. **Long Sessions**: Take longer breaks after 3+ hours
5. **Monitor Activity**: Check `/api/activity/stats` to see your patterns

## Troubleshooting

### Forced Break Not Working

- Check if you're making requests to `/mcp` endpoint
- Verify session ID is consistent
- Check server logs for activity tracking

### Break Not Recording

- Ensure you're calling `recordBreak` tool correctly
- Check session ID matches your current session
- Verify tool is registered in tool registry

### Activity Stats Not Showing

- Check if session exists
- Verify storage directory exists (`.mcp-activity/sessions/`)
- Check server logs for errors

## Integration with Cursor IDE

The wellness features work automatically in Cursor IDE:

1. Activity is tracked on every MCP request
2. Break reminders appear in tool responses
3. Forced breaks block operations until break is recorded
4. Use tools to check status and record breaks

## Future Enhancements

Potential improvements:
- Configurable break intervals per user
- Break history and analytics
- Integration with calendar for scheduled breaks
- Notifications for break reminders
- Productivity insights based on activity patterns



