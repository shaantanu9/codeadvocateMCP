# API Endpoint Specification for Repository Analysis

## Required Endpoint: `POST /api/repositories/{id}/analysis`

This is the **primary endpoint** for saving comprehensive repository analysis.

### Request Body Structure

```typescript
{
  // Repository Information
  repository: {
    name: string;
    remoteUrl?: string;
    branch: string;
    branches: string[];
    defaultBranch?: string;
    branchPattern?: string;
    commit: string;
    rootPath: string;
    gitConfig: {
      user?: { name?: string; email?: string };
      core?: { editor?: string; autocrlf?: string };
      init?: { defaultBranch?: string };
    };
  };

  // Complete Folder Structure (Tree)
  folderStructure: {
    name: string;
    path: string;
    type: "file" | "directory";
    size?: number;
    language?: string;
    children?: FolderNode[];
  };

  // Utility Functions (Categorized)
  utilityFunctions: Array<{
    name: string;
    filePath: string;
    lineNumber: number;
    signature: string;
    parameters: Array<{ name: string; type: string; optional: boolean }>;
    returnType: string;
    isAsync: boolean;
    isExported: boolean;
    visibility: "public" | "private" | "protected";
    documentation?: string;
    category: "utility" | "helper" | "service" | "component" | "handler" | "middleware" | "other";
  }>;

  // All Functions (Complete Registry)
  allFunctions: Array<{
    name: string;
    filePath: string;
    lineNumber: number;
    signature: string;
    parameters: Array<{ name: string; type: string; optional: boolean }>;
    returnType: string;
    isAsync: boolean;
    isExported: boolean;
    visibility: "public" | "private" | "protected";
    documentation?: string;
    category: "utility" | "helper" | "service" | "component" | "handler" | "middleware" | "other";
  }>;

  // Coding Standards
  codingStandards: {
    namingConventions: {
      variables: "camelCase" | "snake_case" | "PascalCase" | "UPPER_SNAKE_CASE" | "mixed";
      functions: "camelCase" | "PascalCase" | "mixed";
      classes: "PascalCase" | "mixed";
      constants: "UPPER_SNAKE_CASE" | "camelCase" | "mixed";
      files: string; // e.g., "kebab-case", "camelCase", "PascalCase"
    };
    fileOrganization: {
      structure: string; // e.g., "layer-based", "feature-based", "flat"
      patterns: string[];
    };
    importPatterns: {
      style: "named" | "default" | "namespace" | "mixed";
      ordering: "alphabetical" | "grouped" | "custom" | "mixed";
      groups: string[];
    };
    errorHandling: {
      pattern: "try-catch" | "result-type" | "custom" | "mixed";
      errorClasses: string[];
    };
    testing: {
      framework?: string;
      patterns: string[];
      utilities: string[];
    };
  };

  // Architecture
  architecture: {
    layers: Array<{
      name: string;
      path: string;
      description: string;
      files: string[];
    }>;
    patterns: Array<{
      name: string;
      description: string;
      files: string[];
    }>;
  };

  // Linting Configuration
  linting: {
    eslint?: {
      configFile?: string;
      config?: Record<string, unknown>;
      version?: string;
    };
    prettier?: {
      configFile?: string;
      config?: Record<string, unknown>;
      version?: string;
    };
    // ... other linting tools
  };

  // Dependencies
  dependencies: {
    production: Array<{ name: string; version: string }>;
    development: Array<{ name: string; version: string }>;
    peer: Array<{ name: string; version: string }>;
  };

  // Entry Points
  entryPoints: Array<{
    path: string;
    type: "main" | "module" | "browser" | "types";
    description: string;
  }>;

  // Documentation Files (README, CHANGELOG, etc.)
  documentation: Array<{
    filename: string;
    content: string;
    type: "readme" | "changelog" | "license" | "contributing" | "other";
  }>;

  // Metadata
  repositoryId: string;
  projectId: string;
  analyzedAt: string; // ISO 8601 timestamp
}
```

### Response

```typescript
{
  id: string; // Analysis ID
  repositoryId: string;
  projectId: string;
  analyzedAt: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## Optional Query Endpoints (Recommended)

### 1. Get Full Analysis
**`GET /api/repositories/{id}/analysis`**

Returns the complete analysis object.

### 2. Get Utility Functions
**`GET /api/repositories/{id}/analysis/functions?category=utility`**

Query parameters:
- `category`: Filter by category (utility, helper, service, etc.)
- `search`: Search by function name
- `filePath`: Filter by file path

### 3. Get Coding Standards
**`GET /api/repositories/{id}/analysis/coding-standards`**

Returns just the coding standards object.

### 4. Get Folder Structure
**`GET /api/repositories/{id}/analysis/folder-structure`**

Returns the folder tree structure.

### 5. Get Documentation Files
**`GET /api/repositories/{id}/analysis/documentation?type=readme`**

Query parameters:
- `type`: Filter by type (readme, changelog, license, etc.)

---

## Alternative: Save to Multiple Endpoints

If you prefer to save different parts to different endpoints, here's the structure:

### 1. Repository Details
**`PATCH /api/repositories/{id}`**
- Update repository with remote URL, branch info, git config

### 2. Folder Structure
**`POST /api/repositories/{id}/folder-structure`**
- Save complete folder tree

### 3. Functions Registry
**`POST /api/repositories/{id}/functions`**
- Save all functions (utility + all)
- Can be queried by category

### 4. Coding Standards
**`POST /api/repositories/{id}/coding-standards`**
- Save coding standards as separate document

### 5. Documentation Files
**`POST /api/markdown-documents`** (for each doc file)
- Save README, CHANGELOG, LICENSE separately
- Tag with repository ID

---

## Recommended Approach

**Use the single comprehensive endpoint** (`POST /api/repositories/{id}/analysis`) because:
1. ✅ Atomic operation - all data saved together
2. ✅ Easy to query - one endpoint for all data
3. ✅ Maintains consistency
4. ✅ Simpler implementation

The tool will automatically:
- Try to save to `/api/repositories/{id}/analysis` first
- Fall back to including in documentation metadata if endpoint doesn't exist
- Still save to other endpoints (documentations, markdown, snippets) for backward compatibility



