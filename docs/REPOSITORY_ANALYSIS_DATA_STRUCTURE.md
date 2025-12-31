# Repository Analysis Data Structure

## 📊 Current Data Collection

### ✅ What We Currently Collect

#### 1. **Repository Information**
- Repository name
- Remote URL (normalized)
- Current branch
- All branches
- Branch patterns
- Default branch
- Current commit hash
- Git configuration (user, core settings, init defaults)

#### 2. **Codebase Structure**
- **Files**: Array of all files with:
  - Path
  - Type (file/directory)
  - Size
  - Language
  - Code details (imports, exports, functions, classes, interfaces, types, patterns)
- **Folder Structure**: Tree representation of directory structure
- **Entry Points**: Main entry files (index.js, main.ts, app.js, etc.)
- **Dependencies**: All detected dependencies
- **Config Files**: Configuration files found

#### 3. **Code Analysis**
- **Functions**: Extracted function names from all files
- **Classes**: Extracted class names
- **Interfaces**: Extracted interface names
- **Types**: Extracted type definitions
- **Imports**: Import statements
- **Exports**: Export statements
- **Patterns**: Code patterns detected

#### 4. **Architecture**
- **Layers**: Architectural layers detected (e.g., "presentation", "application", "domain", "infrastructure")
- **Patterns**: Design patterns (e.g., "dependency-injection", "factory", "singleton")
- **Conventions**: Naming conventions and coding standards

#### 5. **Linting & Code Quality**
- **ESLint**: Config file, version, configuration
- **Prettier**: Config file, version, configuration
- **TSLint**: Config file (deprecated)
- **Stylelint**: Config file, version, configuration
- **Biome**: Config file, version, configuration
- **Husky**: Git hooks configured
- **lint-staged**: Configuration

#### 6. **Documentation Files**
- README.md
- CHANGELOG.md
- LICENSE
- CONTRIBUTING.md
- Other markdown files

---

## 💾 Current Storage Approach

### What Gets Saved to API:

1. **Documentation Endpoint** (`/api/documentations`)
   - Title: `{repoName} - Codebase Analysis`
   - Type: `overview`
   - Category: `repository`
   - Content: Full markdown documentation (generated)
   - Metadata: Contains all collected data as JSON

2. **Markdown Document Endpoint** (`/api/markdown-documents`)
   - Same content as documentation
   - Document type: `codebase-analysis`
   - Tags: `["codebase-analysis", "repository", repoName, ...]`

3. **Code Snippets** (`/api/snippets`)
   - Top 20 key files saved as snippets
   - Limited to 50KB per file
   - Includes file content, language, description

### What Gets Cached Locally:
- All collected data in JSON format
- Repository analysis cache file: `.cache/repository-analysis/{hash}.json`

---

## ❌ What's Missing or Incomplete

### 1. **Structured Folder Structure**
- Currently: Saved as JSON string in documentation metadata
- **Problem**: Not easily queryable or searchable
- **Need**: Separate endpoint or structured storage for folder tree

### 2. **Utility Functions Registry**
- Currently: Functions are listed in documentation but not structured
- **Problem**: Can't easily find "all utility functions" or "all helper functions"
- **Need**: 
  - Categorize functions (utility, helper, service, etc.)
  - Store with file path, signature, parameters, return type
  - Make searchable by category

### 3. **Coding Standards**
- Currently: Only linting configs are saved
- **Problem**: No structured representation of:
  - Naming conventions (camelCase, PascalCase, etc.)
  - File organization patterns
  - Import/export patterns
  - Error handling patterns
  - Testing patterns
- **Need**: Structured coding standards document

### 4. **Complete Function Details**
- Currently: Only function names are extracted
- **Problem**: Missing:
  - Function signatures (parameters, return types)
  - Function documentation/comments
  - Function location (file path, line numbers)
  - Function dependencies
- **Need**: Full function registry with metadata

### 5. **API Endpoints/Route Structure**
- Currently: Not detected
- **Problem**: For web frameworks, routes/endpoints are important
- **Need**: Extract API routes, endpoints, middleware

### 6. **Database Schema**
- Currently: Not detected
- **Problem**: Database models/schemas are important for understanding
- **Need**: Extract database models, migrations, schema

### 7. **Environment Configuration**
- Currently: Not extracted
- **Problem**: Environment variables, config patterns
- **Need**: Extract .env patterns, config files

### 8. **Testing Structure**
- Currently: Test files detected but not analyzed
- **Problem**: Test patterns, coverage, test utilities
- **Need**: Extract test structure, patterns, utilities

---

## 🎯 Recommended Data Structure for New Endpoint

### Proposed Endpoint: `POST /api/repositories/{id}/analysis`

This endpoint should accept a comprehensive analysis object:

```typescript
interface RepositoryAnalysis {
  // Basic Info
  repository: {
    name: string;
    remoteUrl?: string;
    branch: string;
    branches: string[];
    defaultBranch?: string;
    commit: string;
    gitConfig: GitConfig;
  };

  // Folder Structure (Tree)
  folderStructure: {
    type: "tree";
    name: string;
    path: string;
    children: FolderNode[];
  };

  // Utility Functions Registry
  utilityFunctions: Array<{
    name: string;
    filePath: string;
    lineNumber: number;
    signature: string;
    parameters: Array<{ name: string; type: string }>;
    returnType: string;
    category: "utility" | "helper" | "service" | "component" | "other";
    description?: string;
    dependencies: string[];
  }>;

  // Coding Standards
  codingStandards: {
    namingConventions: {
      variables: "camelCase" | "snake_case" | "PascalCase";
      functions: "camelCase" | "PascalCase";
      classes: "PascalCase";
      constants: "UPPER_SNAKE_CASE" | "camelCase";
    };
    fileOrganization: {
      structure: string; // e.g., "feature-based", "layer-based"
      patterns: string[];
    };
    importPatterns: {
      style: "named" | "default" | "namespace" | "mixed";
      ordering: "alphabetical" | "grouped" | "custom";
      groups: string[];
    };
    errorHandling: {
      pattern: "try-catch" | "result-type" | "custom";
      errorClasses: string[];
    };
    testing: {
      framework: string;
      patterns: string[];
      utilities: string[];
    };
  };

  // Complete Function Registry
  functions: Array<{
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
    dependencies: string[];
    calledBy: string[];
  }>;

  // Architecture Layers
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

  // Linting Configuration (Complete)
  linting: {
    eslint?: ESLintConfig;
    prettier?: PrettierConfig;
    stylelint?: StylelintConfig;
    biome?: BiomeConfig;
    husky?: HuskyConfig;
    lintStaged?: LintStagedConfig;
  };

  // API Routes (if applicable)
  apiRoutes?: Array<{
    method: string;
    path: string;
    handler: string;
    middleware: string[];
    filePath: string;
  }>;

  // Database Schema (if applicable)
  databaseSchema?: {
    models: Array<{
      name: string;
      filePath: string;
      fields: Array<{ name: string; type: string; required: boolean }>;
    }>;
    migrations: string[];
  };

  // Dependencies Analysis
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

  // Documentation Files
  documentation: Array<{
    filename: string;
    content: string;
    type: "readme" | "changelog" | "license" | "contributing" | "other";
  }>;
}
```

---

## 🔧 Implementation Recommendations

### Option 1: Single Comprehensive Endpoint (Recommended)
Create: `POST /api/repositories/{id}/analysis`

**Pros:**
- Single atomic operation
- All data in one place
- Easy to query and update
- Maintains data consistency

**Cons:**
- Large payload
- All-or-nothing save

### Option 2: Multiple Structured Endpoints
- `POST /api/repositories/{id}/folder-structure`
- `POST /api/repositories/{id}/functions`
- `POST /api/repositories/{id}/coding-standards`
- `POST /api/repositories/{id}/architecture`

**Pros:**
- Modular
- Can update parts independently
- Smaller payloads

**Cons:**
- Multiple API calls
- Need to maintain consistency
- More complex

### Option 3: Hybrid Approach (Best for Your Use Case)
- Main endpoint: `POST /api/repositories/{id}/analysis` (stores complete analysis)
- Query endpoints:
  - `GET /api/repositories/{id}/analysis/functions?category=utility`
  - `GET /api/repositories/{id}/analysis/folder-structure`
  - `GET /api/repositories/{id}/analysis/coding-standards`

**Pros:**
- Single save operation
- Structured querying
- Best of both worlds

---

## 📝 Next Steps

1. **Decide on endpoint structure** (I recommend Option 3)
2. **Create the endpoint** in your API
3. **Update the tool** to:
   - Extract more detailed function information
   - Categorize functions properly
   - Extract coding standards more comprehensively
   - Structure folder tree properly
   - Save to new endpoint instead of/in addition to current approach

4. **Enhance data extraction**:
   - Parse function signatures completely
   - Extract JSDoc/TSDoc comments
   - Detect coding patterns more accurately
   - Extract API routes (if web framework)
   - Extract database models (if ORM)

---

## 🚀 Quick Win: Enhance Current Tool

Even before creating new endpoints, we can improve the current tool to:
1. Extract more detailed function information
2. Better categorize functions
3. Extract coding standards more comprehensively
4. Structure the data better in metadata

Would you like me to:
1. **Create the new endpoint specification** for your API?
2. **Enhance the current tool** to extract more detailed data?
3. **Both** - enhance tool now, prepare for new endpoint?



