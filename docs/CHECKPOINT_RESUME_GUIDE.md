# Checkpoint & Resume Guide

## Overview

The `analyzeAndSaveRepository` tool now supports checkpoint/resume functionality, allowing you to resume analysis from where it stopped if it fails or is interrupted. This is especially useful for large codebases where analysis can take a long time.

## Features

### ✅ Automatic Checkpoint Creation
- Checkpoints are automatically created after each major step
- Progress is saved to `.cache/repository-analysis/progress_{checkpointId}.json`
- Checkpoints persist across MCP server restarts

### ✅ Resume from Last Checkpoint
- Use `resume: true` to automatically resume from the latest checkpoint
- Or specify a specific `checkpointId` to resume from a particular checkpoint
- Completed steps are skipped automatically

### ✅ Progress Tracking
- Tracks which files have been crawled
- Tracks which snippets have been saved (with IDs)
- Tracks completion status of each step
- Shows detailed progress summary

### ✅ Error Recovery
- Errors are recorded in the checkpoint
- Failed steps can be retried on resume
- Partial progress is preserved

## Usage

### Starting a New Analysis

```json
{
  "projectPath": "/path/to/repo",
  "repositoryId": "repo-123",
  "projectId": "project-456"
}
```

This will create a new checkpoint automatically.

### Resuming from Last Checkpoint

```json
{
  "projectPath": "/path/to/repo",
  "resume": true
}
```

This will automatically find and resume from the latest checkpoint for this project path.

### Resuming from Specific Checkpoint

```json
{
  "projectPath": "/path/to/repo",
  "resume": true,
  "checkpointId": "checkpoint_1234567890_abc123"
}
```

### Listing Available Checkpoints

Use the `listProgressCheckpoints` tool to see all available checkpoints:

```json
{
  "projectPath": "/path/to/repo"  // Optional: filter by project path
}
```

## Checkpoint Structure

Each checkpoint contains:

```typescript
{
  checkpointId: string;
  projectPath: string;
  startedAt: string;
  lastUpdated: string;
  status: "in_progress" | "completed" | "failed" | "paused";
  currentStep: string;
  steps: {
    repoInfo?: { completed: boolean; data?: RepoInfo };
    documentation?: { completed: boolean; filesRead: string[]; totalFiles: number };
    codeStructure?: { completed: boolean; filesCrawled: string[]; totalFiles: number };
    comprehensiveAnalysis?: { completed: boolean };
    mermaidDiagrams?: { completed: boolean; diagramsGenerated: string[] };
    codingStandards?: { completed: boolean; saved: boolean };
    routes?: { completed: boolean; routesExtracted: number; saved: boolean };
    folderStructure?: { completed: boolean; saved: boolean };
    analysis?: { completed: boolean; saved: boolean; analysisId?: string };
    mainDocumentation?: { completed: boolean; saved: boolean; docId?: string };
    markdownDocument?: { completed: boolean; saved: boolean; markdownId?: string };
    summary?: { completed: boolean; saved: boolean };
    snippets?: {
      completed: boolean;
      utilityFunctions: { saved: number; total: number; savedIds: string[] };
      importantFunctions: { saved: number; total: number; savedIds: string[] };
      routes: { saved: boolean; snippetId?: string };
      keyFiles: { saved: number; total: number; savedIds: string[] };
      totalSaved: number;
    };
  };
  errors?: Array<{ step: string; error: string; timestamp: string }>;
  repositoryId?: string;
  projectId?: string;
}
```

## Steps Tracked

1. **repoInfo** - Repository information extraction
2. **documentation** - Documentation files reading
3. **codeStructure** - Codebase structure analysis (tracks which files were crawled)
4. **comprehensiveAnalysis** - Building comprehensive analysis
5. **mermaidDiagrams** - Mermaid diagram generation
6. **codingStandards** - Coding standards extraction and saving
7. **routes** - API routes extraction and saving
8. **folderStructure** - Folder structure saving
9. **analysis** - Comprehensive analysis saving
10. **mainDocumentation** - Main documentation saving
11. **markdownDocument** - Markdown document saving
12. **summary** - Summary document saving
13. **snippets** - Code snippet creation (tracks individual snippets saved)

## Progress Summary

When resuming, you'll see a progress summary like:

```
📊 Progress Summary (Checkpoint: checkpoint_1234...)

**Status:** in_progress
**Current Step:** snippets_utility
**Last Updated:** 2025-01-21 10:30:00

**Completed Steps:**
  ✅ Repository Info
  ✅ Documentation (5/5 files)
  ✅ Code Structure (1200/1200 files crawled)
  ✅ Comprehensive Analysis
  ✅ Mermaid Diagrams (4 generated)
  ✅ Coding Standards
  ✅ Routes (25 extracted)
  ✅ Folder Structure
  ✅ Analysis Saved
  ✅ Main Documentation
  ✅ Markdown Document
  ✅ Summary
  ⏳ Snippets (350/600 saved)
    - Utility Functions: 200/250
    - Important Functions: 150/300
    - Key Files: 0/20

**Remaining Steps:**
  ⏳ Snippets (250 remaining)
```

## Best Practices

1. **For Large Codebases**: Always use `resume: true` if analysis fails or is interrupted
2. **Check Progress**: Use `listProgressCheckpoints` to see available checkpoints
3. **Clean Up**: Delete old checkpoints after successful completion
4. **Monitor Snippets**: For very large codebases (600+ snippets), monitor progress as snippets are saved every 50 items

## Example Workflow

1. Start analysis:
   ```json
   { "projectPath": "/path/to/repo", "repositoryId": "repo-123" }
   ```

2. If interrupted, resume:
   ```json
   { "projectPath": "/path/to/repo", "resume": true }
   ```

3. Check progress:
   ```json
   { "projectPath": "/path/to/repo" }
   ```
   (using `listProgressCheckpoints` tool)

4. Continue until completion - the tool will automatically skip completed steps and continue from where it left off.

## Troubleshooting

### Checkpoint Not Found
- Ensure you're using the same `projectPath` as when the checkpoint was created
- Check `.cache/repository-analysis/` directory for checkpoint files
- Use `listProgressCheckpoints` to see all available checkpoints

### Resume Not Working
- Verify the checkpoint file exists and is valid JSON
- Check that `resume: true` is set in parameters
- Ensure the project path matches the checkpoint's project path

### Partial Progress Lost
- Checkpoints are saved after each step completion
- If a step fails mid-execution, progress up to that step is preserved
- Resume will skip completed steps and retry failed ones



