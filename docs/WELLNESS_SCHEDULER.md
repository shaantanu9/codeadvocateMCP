# Wellness Scheduler - Auto-Loading Break Reminders

## Overview

The wellness scheduler automatically triggers break reminders at regular intervals for active user sessions. This ensures users receive timely wellness notifications without manually calling the `breakReminder` tool.

## Features

- ✅ **Automatic Interval Checks**: Runs at configurable intervals (default: 30 minutes)
- ✅ **Active Session Detection**: Only checks sessions with recent activity
- ✅ **Smart Break Detection**: Triggers reminders only when breaks are needed
- ✅ **Graceful Shutdown**: Properly stops on server shutdown
- ✅ **Configurable**: Can be enabled/disabled and interval adjusted

## Configuration

### Environment Variables

```bash
# Interval in minutes (default: 30)
WELLNESS_CHECK_INTERVAL=30

# Enable/disable scheduler (default: true)
WELLNESS_SCHEDULER_ENABLED=true
```

### Default Settings

- **Check Interval**: 30 minutes
- **Enabled**: Yes (by default)
- **Active Session Window**: 30 minutes (sessions with activity in last 30 min)

## How It Works

1. **Server Startup**: Scheduler starts automatically when server starts
2. **Interval Checks**: Every N minutes (default: 30), checks all active sessions
3. **Break Status Check**: For each active session, checks if break is needed
4. **Reminder Trigger**: If `shouldTakeBreak` or `forcedBreak` is true, triggers reminder
5. **Logging**: All actions are logged for monitoring

## Implementation Details

### Files

- `src/core/wellness-scheduler.ts` - Main scheduler implementation
- `src/core/activity-tracker.ts` - Activity tracking (added `getActiveSessionIds()` method)
- `src/server/index.ts` - Server startup integration

### Key Methods

#### `wellnessScheduler.start()`
Starts the scheduler with the configured interval.

#### `wellnessScheduler.stop()`
Stops the scheduler gracefully.

#### `wellnessScheduler.setBreakReminderTool(tool)`
Registers the break reminder tool to be called automatically.

#### `wellnessScheduler.updateConfig(config)`
Updates scheduler configuration at runtime.

#### `wellnessScheduler.getStatus()`
Returns current scheduler status.

### Activity Tracker Integration

The scheduler uses `activityTracker.getActiveSessionIds()` to get all sessions with recent activity (within 30 minutes). For each active session, it:

1. Checks break status using `activityTracker.getBreakStatus(sessionId)`
2. If break is needed, triggers the `breakReminderTool`
3. Logs the action for monitoring

## Usage

### Automatic (Default)

The scheduler starts automatically when the server starts:

```bash
npm run dev
```

You'll see:
```
[Wellness] Scheduler started (interval: 30 minutes)
```

### Manual Control

```typescript
import { wellnessScheduler } from "./core/wellness-scheduler.js";

// Start scheduler
wellnessScheduler.start();

// Stop scheduler
wellnessScheduler.stop();

// Update interval (in milliseconds)
wellnessScheduler.updateConfig({
  checkInterval: 15 * 60 * 1000, // 15 minutes
});

// Get status
const status = wellnessScheduler.getStatus();
console.log(status);
// {
//   running: true,
//   enabled: true,
//   checkInterval: 1800000
// }
```

## Logging

The scheduler logs all important events:

- **Start/Stop**: When scheduler starts or stops
- **Check Cycles**: Each interval check
- **Active Sessions**: Number of sessions checked
- **Break Reminders**: When reminders are triggered
- **Errors**: Any errors during checks

Example logs:
```
[Wellness] Scheduler started (interval: 30 minutes)
[Wellness] Checking 2 active session(s)
[Wellness] Triggering break reminder for session abc123
[Wellness] FORCED BREAK needed for session abc123 - You've been working for 2h 15m without a break
```

## Break Reminder Logic

The scheduler triggers reminders when:

1. **Regular Break Needed**: `breakStatus.shouldTakeBreak === true`
   - User has been working for 20+ minutes without a break

2. **Forced Break**: `breakStatus.forcedBreak === true`
   - User has been working for 30+ minutes without a break
   - Server may block operations until break is taken

## Integration with Tools

The wellness tools (`breakReminderTool` and `recordBreakTool`) remain available for manual use. The scheduler automatically calls `breakReminderTool` at intervals, but users can still:

- Manually call `breakReminder` to check status anytime
- Call `recordBreak` to record a break and reset timers

## Troubleshooting

### Scheduler Not Running

1. Check if enabled:
   ```bash
   WELLNESS_SCHEDULER_ENABLED=true npm run dev
   ```

2. Check logs for startup message:
   ```
   [Wellness] Scheduler started (interval: 30 minutes)
   ```

### No Reminders Being Triggered

1. Verify active sessions exist (check activity tracker)
2. Check if breaks are actually needed (break status)
3. Review logs for errors

### Too Many/Few Reminders

Adjust the interval:
```bash
WELLNESS_CHECK_INTERVAL=15 npm run dev  # 15 minutes
```

## Future Enhancements

Potential improvements:

- [ ] Per-session interval configuration
- [ ] Notification system integration (email, desktop notifications)
- [ ] Break statistics and reporting
- [ ] Custom break reminder messages
- [ ] Integration with calendar/calendar apps

---

**Status:** ✅ Implemented and Active  
**Default Interval:** 30 minutes  
**Last Updated:** 2025-01-27
