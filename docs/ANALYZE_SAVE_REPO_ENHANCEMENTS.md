# 🚀 Analyze and Save Repository Tool - Comprehensive Enhancements

## 📊 Current State Analysis

### ✅ What's Working Well
- Git repository information extraction
- Basic code structure analysis
- Function extraction and categorization
- Route/API endpoint detection
- Documentation generation
- Checkpoint/resume functionality
- LLM enhancement support
- Comprehensive saving to API

### ⚠️ Areas for Enhancement

## 🎯 Priority Enhancements

### 1. **Enhanced LLM Prompts** (High Priority)

#### Current Issues:
- Generic prompts that don't leverage full context
- No structured output format enforcement
- Limited domain-specific analysis

#### Proposed Improvements:

```typescript
/**
 * Enhanced LLM prompt with structured analysis
 */
private buildEnhancedLLMPrompt(
  repoInfo: RepoInfo,
  structure: CodeStructure,
  comprehensiveAnalysis: ComprehensiveAnalysis,
  customPrompt?: string
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are an expert codebase analyst specializing in:
- Software architecture patterns (Clean Architecture, DDD, Hexagonal, etc.)
- Code quality metrics (cyclomatic complexity, maintainability index)
- Security vulnerabilities (OWASP Top 10, dependency issues)
- Performance optimization opportunities
- Testing strategies and coverage
- Code smells and refactoring opportunities
- Best practices for the detected tech stack

Your analysis must be:
1. **Structured**: Return valid JSON matching the exact schema
2. **Actionable**: Provide specific recommendations with file paths
3. **Prioritized**: Rank issues by severity (critical, high, medium, low)
4. **Contextual**: Reference specific code patterns and files
5. **Comprehensive**: Cover architecture, security, performance, maintainability

Return ONLY valid JSON in this exact structure:
{
  "architecture": {
    "pattern": "clean-architecture|ddd|hexagonal|mvc|layered|microservices|monolith",
    "confidence": 0.0-1.0,
    "layers": [{"name": "...", "description": "...", "files": [...]}],
    "violations": [{"type": "...", "severity": "critical|high|medium|low", "file": "...", "description": "..."}],
    "recommendations": ["..."]
  },
  "codeQuality": {
    "metrics": {
      "averageComplexity": 0,
      "maxComplexity": 0,
      "maintainabilityIndex": 0.0-100.0,
      "technicalDebt": "low|medium|high|critical"
    },
    "codeSmells": [{
      "type": "long-method|god-class|duplicate-code|feature-envy|data-clumps",
      "severity": "critical|high|medium|low",
      "file": "...",
      "line": 0,
      "description": "...",
      "suggestion": "..."
    }],
    "refactoringOpportunities": [{
      "file": "...",
      "type": "extract-method|extract-class|move-method|rename",
      "priority": "critical|high|medium|low",
      "description": "...",
      "estimatedEffort": "low|medium|high"
    }]
  },
  "security": {
    "vulnerabilities": [{
      "type": "sql-injection|xss|csrf|auth-bypass|dependency|secrets",
      "severity": "critical|high|medium|low",
      "file": "...",
      "line": 0,
      "description": "...",
      "remediation": "..."
    }],
    "secretsExposed": [{"file": "...", "type": "api-key|password|token", "line": 0}],
    "dependencyRisks": [{"package": "...", "version": "...", "vulnerability": "...", "severity": "..."}]
  },
  "performance": {
    "bottlenecks": [{
      "type": "n+1-query|memory-leak|inefficient-algorithm|large-bundle",
      "severity": "critical|high|medium|low",
      "file": "...",
      "description": "...",
      "optimization": "..."
    }],
    "recommendations": ["..."]
  },
  "testing": {
    "coverage": {
      "estimated": 0.0-100.0,
      "files": [{"file": "...", "hasTests": true, "testFile": "..."}]
    },
    "patterns": ["unit|integration|e2e|snapshot"],
    "gaps": [{"file": "...", "priority": "critical|high|medium|low", "suggestion": "..."}]
  },
  "dependencies": {
    "outdated": [{"package": "...", "current": "...", "latest": "...", "security": true}],
    "unused": ["..."],
    "conflicts": [{"packages": [...], "issue": "..."}]
  },
  "documentation": {
    "coverage": 0.0-100.0,
    "gaps": [{"file": "...", "type": "function|class|api|readme", "priority": "..."}],
    "quality": "excellent|good|fair|poor"
  },
  "bestPractices": {
    "followed": ["..."],
    "violations": [{"practice": "...", "file": "...", "severity": "...", "suggestion": "..."}]
  },
  "insights": {
    "strengths": ["..."],
    "weaknesses": ["..."],
    "recommendations": ["..."],
    "quickWins": ["..."],
    "longTerm": ["..."]
  }
}`;

  const userPrompt = customPrompt || `Analyze this ${structure.files.length}-file codebase:

**Repository Context:**
- Name: ${repoInfo.name}
- Language: ${Array.from(new Set(structure.files.map(f => f.language).filter(Boolean))).join(", ")}
- Architecture Layers: ${structure.architecture.layers.join(", ")}
- Patterns: ${structure.architecture.patterns.join(", ")}
- Entry Points: ${structure.entryPoints.join(", ")}
- Dependencies: ${structure.dependencies.slice(0, 20).join(", ")}

**Codebase Structure:**
- Total Files: ${structure.files.length}
- Functions: ${comprehensiveAnalysis.allFunctions.length} (${comprehensiveAnalysis.utilityFunctions.length} utility)
- Routes: ${comprehensiveAnalysis.routes.length}
- Classes: ${structure.files.reduce((sum, f) => sum + (f.codeDetails?.classes.length || 0), 0)}

**Key Files to Analyze:**
${structure.files
  .filter(f => f.codeDetails && (f.codeDetails.functions.length > 5 || f.codeDetails.classes.length > 0))
  .slice(0, 20)
  .map(f => `- ${f.path}: ${f.codeDetails?.functions.length || 0} functions, ${f.codeDetails?.classes.length || 0} classes`)
  .join("\n")}

**Routes/API:**
${comprehensiveAnalysis.routes.slice(0, 10).map(r => `- ${r.method} ${r.path} (${r.filePath}:${r.lineNumber})`).join("\n")}

**Coding Standards Detected:**
- Naming: ${comprehensiveAnalysis.codingStandards.namingConventions.variables}
- File Organization: ${comprehensiveAnalysis.codingStandards.fileOrganization.structure}
- Error Handling: ${comprehensiveAnalysis.codingStandards.errorHandling.pattern}

**Documentation:**
${comprehensiveAnalysis.documentation.map(d => `- ${d.filename} (${d.type})`).join("\n")}

Provide a comprehensive analysis following the JSON schema above. Focus on:
1. Architecture pattern identification and violations
2. Code quality metrics and smells
3. Security vulnerabilities (especially in routes and data handling)
4. Performance bottlenecks
5. Testing gaps
6. Dependency risks
7. Documentation quality
8. Actionable recommendations prioritized by impact

Be specific: reference exact files, line numbers, and provide concrete suggestions.`;

  return { systemPrompt, userPrompt };
}
```

### 2. **Code Quality Metrics** (High Priority)

#### Add Complexity Analysis:

```typescript
interface CodeQualityMetrics {
  complexity: {
    cyclomatic: {
      average: number;
      max: number;
      distribution: Record<string, number>; // complexity -> count
      highComplexityFiles: Array<{
        file: string;
        complexity: number;
        functions: Array<{ name: string; complexity: number; line: number }>;
      }>;
    };
    cognitive: {
      average: number;
      max: number;
      highComplexityFiles: Array<{ file: string; complexity: number }>;
    };
  };
  maintainability: {
    index: number; // 0-100
    factors: {
      cyclomaticComplexity: number;
      linesOfCode: number;
      halsteadVolume: number;
    };
    rating: "excellent" | "good" | "fair" | "poor";
  };
  technicalDebt: {
    estimatedHours: number;
    ratio: number; // 0-1
    hotspots: Array<{ file: string; debt: number; issues: string[] }>;
  };
}

/**
 * Calculate cyclomatic complexity for a function
 */
private calculateCyclomaticComplexity(content: string, functionName: string): number {
  // Count decision points: if, else, for, while, switch, case, catch, &&, ||, ?:
  const decisionPatterns = [
    /\bif\s*\(/g,
    /\belse\b/g,
    /\bfor\s*\(/g,
    /\bwhile\s*\(/g,
    /\bswitch\s*\(/g,
    /\bcase\s+/g,
    /\bcatch\s*\(/g,
    /&&/g,
    /\|\|/g,
    /\?/g,
  ];
  
  let complexity = 1; // Base complexity
  for (const pattern of decisionPatterns) {
    const matches = content.match(pattern);
    if (matches) complexity += matches.length;
  }
  
  return complexity;
}

/**
 * Calculate maintainability index
 */
private calculateMaintainabilityIndex(
  cyclomaticComplexity: number,
  linesOfCode: number,
  halsteadVolume: number
): number {
  // Simplified maintainability index formula
  const maintainabilityIndex = 171 - 5.2 * Math.log(halsteadVolume) - 0.23 * cyclomaticComplexity - 16.2 * Math.log(linesOfCode);
  return Math.max(0, Math.min(100, maintainabilityIndex));
}
```

### 3. **Security Analysis** (High Priority)

```typescript
interface SecurityAnalysis {
  vulnerabilities: Array<{
    type: "sql-injection" | "xss" | "csrf" | "auth-bypass" | "secrets" | "dependency" | "insecure-random" | "path-traversal";
    severity: "critical" | "high" | "medium" | "low";
    file: string;
    line: number;
    code: string;
    description: string;
    remediation: string;
    cwe?: string;
  }>;
  secretsExposed: Array<{
    file: string;
    line: number;
    type: "api-key" | "password" | "token" | "secret" | "private-key";
    pattern: string;
    recommendation: string;
  }>;
  dependencyVulnerabilities: Array<{
    package: string;
    version: string;
    vulnerability: string;
    severity: "critical" | "high" | "medium" | "low";
    cve?: string;
    fixedIn?: string;
  }>;
  securityBestPractices: {
    followed: string[];
    violated: Array<{
      practice: string;
      file: string;
      severity: string;
      recommendation: string;
    }>;
  };
}

/**
 * Detect security vulnerabilities in code
 */
private detectSecurityVulnerabilities(
  files: CodeStructure["files"],
  rootPath: string
): SecurityAnalysis["vulnerabilities"] {
  const vulnerabilities: SecurityAnalysis["vulnerabilities"] = [];
  
  for (const file of files) {
    if (!file.language || !["typescript", "javascript"].includes(file.language)) continue;
    
    try {
      const filePath = join(rootPath, file.path);
      if (!existsSync(filePath)) continue;
      
      const content = readFileSync(filePath, "utf-8");
      const lines = content.split("\n");
      
      // SQL Injection patterns
      const sqlPatterns = [
        /\$\{.*\}\s*\+\s*['"]\s*SELECT/i,
        /query\s*\(\s*['"]\s*SELECT.*\$\{/i,
        /db\.query\s*\(\s*[^,]+,\s*[^)]*\$\{/i,
      ];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // SQL Injection
        for (const pattern of sqlPatterns) {
          if (pattern.test(line)) {
            vulnerabilities.push({
              type: "sql-injection",
              severity: "critical",
              file: file.path,
              line: i + 1,
              code: line.trim(),
              description: "Potential SQL injection vulnerability detected",
              remediation: "Use parameterized queries or prepared statements",
              cwe: "CWE-89",
            });
          }
        }
        
        // XSS patterns
        if (/innerHTML\s*=.*\$\{/i.test(line) || /dangerouslySetInnerHTML/i.test(line)) {
          vulnerabilities.push({
            type: "xss",
            severity: "high",
            file: file.path,
            line: i + 1,
            code: line.trim(),
            description: "Potential XSS vulnerability: unsanitized user input",
            remediation: "Sanitize user input or use React's built-in escaping",
            cwe: "CWE-79",
          });
        }
        
        // Exposed secrets
        const secretPatterns = [
          { pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*['"]([^'"]+)['"]/i, type: "api-key" as const },
          { pattern: /(?:password|pwd|pass)\s*[:=]\s*['"]([^'"]+)['"]/i, type: "password" as const },
          { pattern: /(?:secret|token)\s*[:=]\s*['"]([^'"]{20,})['"]/i, type: "secret" as const },
        ];
        
        for (const { pattern, type } of secretPatterns) {
          if (pattern.test(line) && !line.includes("process.env") && !line.includes("config")) {
            vulnerabilities.push({
              type: "secrets",
              severity: "critical",
              file: file.path,
              line: i + 1,
              code: line.trim().substring(0, 100),
              description: `Hardcoded ${type} detected`,
              remediation: "Move to environment variables or secure secret management",
              cwe: "CWE-798",
            });
          }
        }
        
        // Insecure random
        if (/Math\.random\(\)/i.test(line) && /crypto|password|token|session/i.test(line)) {
          vulnerabilities.push({
            type: "insecure-random",
            severity: "medium",
            file: file.path,
            line: i + 1,
            code: line.trim(),
            description: "Insecure random number generation for security-sensitive operations",
            remediation: "Use crypto.randomBytes() or crypto.getRandomValues()",
            cwe: "CWE-330",
          });
        }
      }
    } catch {
      // Skip if can't read
    }
  }
  
  return vulnerabilities;
}
```

### 4. **Dependency Vulnerability Scanning** (High Priority)

```typescript
/**
 * Check dependencies for known vulnerabilities
 */
private async checkDependencyVulnerabilities(
  dependencies: ComprehensiveAnalysis["dependencies"]
): Promise<SecurityAnalysis["dependencyVulnerabilities"]> {
  const vulnerabilities: SecurityAnalysis["dependencyVulnerabilities"] = [];
  
  // Use npm audit or Snyk API
  try {
    // Option 1: Run npm audit
    const auditResult = execSync("npm audit --json", {
      cwd: process.cwd(),
      encoding: "utf-8",
    });
    
    const audit = JSON.parse(auditResult);
    if (audit.vulnerabilities) {
      for (const [packageName, vuln] of Object.entries(audit.vulnerabilities)) {
        const v = vuln as {
          severity: string;
          via: Array<{ title: string; cve?: string }>;
          fixAvailable?: boolean;
        };
        
        vulnerabilities.push({
          package: packageName,
          version: dependencies.production.find(d => d.name === packageName)?.version || "unknown",
          vulnerability: v.via[0]?.title || "Unknown vulnerability",
          severity: v.severity as "critical" | "high" | "medium" | "low",
          cve: v.via[0]?.cve,
          fixedIn: v.fixAvailable ? "available" : undefined,
        });
      }
    }
  } catch {
    // npm audit not available or failed
    logger.warn("Could not run npm audit for vulnerability scanning");
  }
  
  return vulnerabilities;
}
```

### 5. **Test Analysis** (Medium Priority)

```typescript
interface TestAnalysis {
  coverage: {
    estimated: number; // 0-100
    byFile: Array<{
      file: string;
      hasTests: boolean;
      testFile?: string;
      testCount?: number;
    }>;
  };
  patterns: {
    unit: number;
    integration: number;
    e2e: number;
    snapshot: number;
  };
  gaps: Array<{
    file: string;
    priority: "critical" | "high" | "medium" | "low";
    reason: string;
    suggestion: string;
  }>;
  quality: {
    testStructure: "excellent" | "good" | "fair" | "poor";
    mocking: boolean;
    assertions: number;
    averageTestSize: number;
  };
}

/**
 * Analyze test coverage and patterns
 */
private analyzeTests(
  files: CodeStructure["files"],
  rootPath: string
): TestAnalysis {
  const testFiles = files.filter(f =>
    f.path.includes(".test.") ||
    f.path.includes(".spec.") ||
    f.path.includes("/test/") ||
    f.path.includes("/tests/") ||
    f.path.includes("__tests__")
  );
  
  const sourceFiles = files.filter(f =>
    !f.path.includes(".test.") &&
    !f.path.includes(".spec.") &&
    !f.path.includes("/test/") &&
    !f.path.includes("/tests/") &&
    !f.path.includes("__tests__") &&
    (f.path.endsWith(".ts") || f.path.endsWith(".js"))
  );
  
  const coverage: TestAnalysis["coverage"] = {
    estimated: 0,
    byFile: sourceFiles.map(sourceFile => {
      // Find corresponding test file
      const testFile = testFiles.find(tf => {
        const sourceName = sourceFile.path.replace(/\.(ts|js)$/, "");
        const testName = tf.path.replace(/\.(test|spec)\.(ts|js)$/, "");
        return testName.includes(sourceName) || sourceName.includes(testName);
      });
      
      return {
        file: sourceFile.path,
        hasTests: !!testFile,
        testFile: testFile?.path,
        testCount: testFile ? this.countTestsInFile(join(rootPath, testFile.path)) : 0,
      };
    }),
  };
  
  coverage.estimated = (coverage.byFile.filter(f => f.hasTests).length / coverage.byFile.length) * 100;
  
  // Detect test patterns
  const patterns = {
    unit: testFiles.filter(f => f.path.includes("unit") || f.path.includes(".test.")).length,
    integration: testFiles.filter(f => f.path.includes("integration") || f.path.includes("e2e")).length,
    e2e: testFiles.filter(f => f.path.includes("e2e") || f.path.includes("end-to-end")).length,
    snapshot: testFiles.filter(f => f.path.includes("snapshot") || f.path.includes(".snap")).length,
  };
  
  // Identify gaps
  const gaps: TestAnalysis["gaps"] = sourceFiles
    .filter(f => {
      const hasTests = coverage.byFile.find(cf => cf.file === f.path)?.hasTests;
      return !hasTests && (
        f.path.includes("/services/") ||
        f.path.includes("/handlers/") ||
        f.path.includes("/utils/") ||
        f.codeDetails?.functions.length > 0
      );
    })
    .map(f => ({
      file: f.path,
      priority: f.path.includes("/services/") || f.path.includes("/handlers/") ? "high" as const : "medium" as const,
      reason: "No test file found",
      suggestion: `Create ${f.path.replace(/\.(ts|js)$/, ".test.$1")}`,
    }));
  
  return {
    coverage,
    patterns,
    gaps,
    quality: {
      testStructure: patterns.unit > patterns.e2e ? "good" : "fair",
      mocking: testFiles.some(f => {
        const content = readFileSync(join(rootPath, f.path), "utf-8");
        return /mock|jest\.mock|sinon|nock/i.test(content);
      }),
      assertions: testFiles.reduce((sum, f) => {
        const content = readFileSync(join(rootPath, f.path), "utf-8");
        return sum + (content.match(/expect|assert|should/i) || []).length;
      }, 0),
      averageTestSize: testFiles.length > 0 ? testFiles.reduce((sum, f) => sum + (f.size || 0), 0) / testFiles.length : 0,
    },
  };
}

private countTestsInFile(filePath: string): number {
  try {
    const content = readFileSync(filePath, "utf-8");
    // Count test/it/describe blocks
    const testPatterns = [
      /(?:it|test|describe)\s*\(/g,
      /(?:it\.skip|test\.skip|describe\.skip)\s*\(/g,
    ];
    let count = 0;
    for (const pattern of testPatterns) {
      const matches = content.match(pattern);
      if (matches) count += matches.length;
    }
    return count;
  } catch {
    return 0;
  }
}
```

### 6. **Architecture Pattern Detection** (Medium Priority)

```typescript
/**
 * Detect specific architecture patterns
 */
private detectArchitecturePattern(
  structure: CodeStructure,
  comprehensiveAnalysis: ComprehensiveAnalysis
): {
  pattern: "clean-architecture" | "ddd" | "hexagonal" | "mvc" | "layered" | "microservices" | "monolith" | "unknown";
  confidence: number;
  indicators: string[];
  violations: Array<{ type: string; file: string; description: string }>;
} {
  const indicators: string[] = [];
  let score = 0;
  
  // Clean Architecture indicators
  if (
    structure.architecture.layers.includes("domain") &&
    structure.architecture.layers.includes("application") &&
    structure.architecture.layers.includes("infrastructure")
  ) {
    indicators.push("Has domain/application/infrastructure layers");
    score += 30;
  }
  
  if (structure.files.some(f => f.path.includes("/entities/") || f.path.includes("/domain/"))) {
    indicators.push("Has entities/domain folder");
    score += 20;
  }
  
  if (structure.files.some(f => f.path.includes("/use-cases/") || f.path.includes("/usecases/"))) {
    indicators.push("Has use cases folder");
    score += 20;
  }
  
  // DDD indicators
  if (
    structure.files.some(f => f.path.includes("/aggregates/")) ||
    structure.files.some(f => f.path.includes("/value-objects/"))
  ) {
    indicators.push("Has DDD concepts (aggregates, value objects)");
    score += 25;
  }
  
  // Hexagonal Architecture
  if (
    structure.files.some(f => f.path.includes("/ports/")) &&
    structure.files.some(f => f.path.includes("/adapters/"))
  ) {
    indicators.push("Has ports and adapters");
    score += 30;
  }
  
  // MVC
  if (
    structure.architecture.layers.includes("presentation") &&
    structure.files.some(f => f.path.includes("/controllers/")) &&
    structure.files.some(f => f.path.includes("/models/"))
  ) {
    indicators.push("Has MVC structure");
    score += 25;
  }
  
  // Detect violations
  const violations: Array<{ type: string; file: string; description: string }> = [];
  
  // Check for circular dependencies
  for (const file of structure.files) {
    if (file.codeDetails?.imports) {
      for (const imp of file.codeDetails.imports) {
        // Check if importing from higher layer (simplified check)
        if (
          file.path.includes("/infrastructure/") &&
          imp.includes("/domain/")
        ) {
          // This is OK
        } else if (
          file.path.includes("/domain/") &&
          imp.includes("/infrastructure/")
        ) {
          violations.push({
            type: "dependency-violation",
            file: file.path,
            description: "Domain layer importing from infrastructure (dependency inversion violation)",
          });
        }
      }
    }
  }
  
  let pattern: "clean-architecture" | "ddd" | "hexagonal" | "mvc" | "layered" | "microservices" | "monolith" | "unknown" = "unknown";
  
  if (score >= 50 && indicators.some(i => i.includes("domain"))) {
    pattern = "clean-architecture";
  } else if (indicators.some(i => i.includes("DDD"))) {
    pattern = "ddd";
  } else if (indicators.some(i => i.includes("ports"))) {
    pattern = "hexagonal";
  } else if (indicators.some(i => i.includes("MVC"))) {
    pattern = "mvc";
  } else if (structure.architecture.layers.length >= 3) {
    pattern = "layered";
  } else {
    pattern = "monolith";
  }
  
  return {
    pattern,
    confidence: Math.min(100, score),
    indicators,
    violations,
  };
}
```

### 7. **Code Smells Detection** (Medium Priority)

```typescript
interface CodeSmell {
  type: "long-method" | "god-class" | "duplicate-code" | "feature-envy" | "data-clumps" | "primitive-obsession" | "long-parameter-list";
  severity: "critical" | "high" | "medium" | "low";
  file: string;
  line: number;
  description: string;
  suggestion: string;
  metrics?: {
    linesOfCode?: number;
    complexity?: number;
    parameters?: number;
  };
}

/**
 * Detect code smells
 */
private detectCodeSmells(
  files: CodeStructure["files"],
  allFunctions: FunctionDetail[],
  rootPath: string
): CodeSmell[] {
  const smells: CodeSmell[] = [];
  
  for (const file of files) {
    if (!file.language || !["typescript", "javascript"].includes(file.language)) continue;
    
    try {
      const filePath = join(rootPath, file.path);
      if (!existsSync(filePath)) continue;
      
      const content = readFileSync(filePath, "utf-8");
      const lines = content.split("\n");
      const fileFunctions = allFunctions.filter(f => f.filePath === file.path);
      
      // Long method detection
      for (const func of fileFunctions) {
        // Estimate function length (simplified)
        const funcStart = func.lineNumber;
        let funcEnd = funcStart;
        let braceCount = 0;
        let foundStart = false;
        
        for (let i = funcStart - 1; i < lines.length && i < funcStart + 200; i++) {
          const line = lines[i];
          if (line.includes("{")) {
            foundStart = true;
            braceCount += (line.match(/{/g) || []).length;
          }
          if (line.includes("}")) {
            braceCount -= (line.match(/}/g) || []).length;
            if (foundStart && braceCount === 0) {
              funcEnd = i + 1;
              break;
            }
          }
        }
        
        const methodLength = funcEnd - funcStart;
        if (methodLength > 50) {
          smells.push({
            type: "long-method",
            severity: methodLength > 100 ? "critical" : methodLength > 75 ? "high" : "medium",
            file: file.path,
            line: func.lineNumber,
            description: `Method "${func.name}" is ${methodLength} lines long (recommended: <50)`,
            suggestion: "Extract methods to improve readability and testability",
            metrics: { linesOfCode: methodLength, complexity: this.calculateCyclomaticComplexity(content, func.name) },
          });
        }
        
        // Long parameter list
        if (func.parameters.length > 5) {
          smells.push({
            type: "long-parameter-list",
            severity: func.parameters.length > 8 ? "high" : "medium",
            file: file.path,
            line: func.lineNumber,
            description: `Method "${func.name}" has ${func.parameters.length} parameters (recommended: <5)`,
            suggestion: "Consider using a parameter object or builder pattern",
            metrics: { parameters: func.parameters.length },
          });
        }
      }
      
      // God class detection (too many responsibilities)
      if (file.codeDetails) {
        const totalMethods = file.codeDetails.functions.length;
        const totalClasses = file.codeDetails.classes.length;
        
        if (totalMethods > 20 || (totalClasses === 1 && totalMethods > 15)) {
          smells.push({
            type: "god-class",
            severity: totalMethods > 30 ? "critical" : "high",
            file: file.path,
            line: 1,
            description: `Class has ${totalMethods} methods (recommended: <20)`,
            suggestion: "Split into smaller, focused classes following Single Responsibility Principle",
          });
        }
      }
      
      // Duplicate code detection (simplified - check for similar function signatures)
      const functionSignatures = fileFunctions.map(f => f.signature);
      const duplicates = new Set<string>();
      for (let i = 0; i < functionSignatures.length; i++) {
        for (let j = i + 1; j < functionSignatures.length; j++) {
          if (functionSignatures[i] === functionSignatures[j]) {
            duplicates.add(functionSignatures[i]);
          }
        }
      }
      
      if (duplicates.size > 0) {
        smells.push({
          type: "duplicate-code",
          severity: "medium",
          file: file.path,
          line: 1,
          description: `Found ${duplicates.size} duplicate function signatures`,
          suggestion: "Extract common functionality into shared utilities",
        });
      }
      
    } catch {
      // Skip if can't read
    }
  }
  
  return smells;
}
```

### 8. **Performance Analysis** (Low Priority)

```typescript
interface PerformanceAnalysis {
  bottlenecks: Array<{
    type: "n+1-query" | "memory-leak" | "inefficient-algorithm" | "large-bundle" | "blocking-operation" | "unoptimized-render";
    severity: "critical" | "high" | "medium" | "low";
    file: string;
    line: number;
    description: string;
    optimization: string;
  }>;
  recommendations: string[];
  bundleSize?: {
    estimated: number;
    largeDependencies: Array<{ name: string; size: string }>;
  };
}

/**
 * Detect performance issues
 */
private detectPerformanceIssues(
  files: CodeStructure["files"],
  routes: RouteInfo[],
  rootPath: string
): PerformanceAnalysis {
  const bottlenecks: PerformanceAnalysis["bottlenecks"] = [];
  
  // Check for N+1 query patterns
  for (const route of routes) {
    try {
      const filePath = join(rootPath, route.filePath);
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, "utf-8");
        const lines = content.split("\n");
        
        // Simple N+1 detection: loop with database query inside
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (/for\s*\(|\.map\s*\(|\.forEach\s*\(/.test(line)) {
            // Check next few lines for database queries
            for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
              if (/\.find|\.query|\.get|SELECT|db\.|model\./.test(lines[j])) {
                bottlenecks.push({
                  type: "n+1-query",
                  severity: "high",
                  file: route.filePath,
                  line: i + 1,
                  description: "Potential N+1 query pattern detected in loop",
                  optimization: "Use batch loading or eager loading to fetch all data in one query",
                });
                break;
              }
            }
          }
        }
      }
    } catch {
      // Skip
    }
  }
  
  // Check for blocking operations
  for (const file of files) {
    if (!file.language || !["typescript", "javascript"].includes(file.language)) continue;
    
    try {
      const filePath = join(rootPath, file.path);
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, "utf-8");
        
        // Check for synchronous file operations in async contexts
        if (/readFileSync|writeFileSync|execSync/.test(content) && /async|await/.test(content)) {
          bottlenecks.push({
            type: "blocking-operation",
            severity: "medium",
            file: file.path,
            line: 1,
            description: "Synchronous file operations in async context",
            optimization: "Use async versions: readFile, writeFile, exec",
          });
        }
      }
    } catch {
      // Skip
    }
  }
  
  return {
    bottlenecks,
    recommendations: [
      "Use database connection pooling",
      "Implement caching for frequently accessed data",
      "Use pagination for large datasets",
      "Optimize bundle size with code splitting",
    ],
  };
}
```

### 9. **Enhanced Folder Structure Analysis** (Low Priority)

```typescript
/**
 * Analyze folder structure for patterns and organization quality
 */
private analyzeFolderStructure(
  folderNode: FolderNode,
  structure: CodeStructure
): {
  organization: "excellent" | "good" | "fair" | "poor";
  patterns: string[];
  issues: Array<{ type: string; path: string; description: string }>;
  recommendations: string[];
} {
  const issues: Array<{ type: string; path: string; description: string }> = [];
  const patterns: string[] = [];
  
  // Check for flat structure (too many files in root)
  const rootFiles = structure.files.filter(f => !f.path.includes("/"));
  if (rootFiles.length > 10) {
    issues.push({
      type: "flat-structure",
      path: "/",
      description: `Too many files (${rootFiles.length}) in root directory`,
    });
  }
  
  // Check for deep nesting (too many levels)
  const maxDepth = this.getMaxDepth(folderNode);
  if (maxDepth > 5) {
    issues.push({
      type: "deep-nesting",
      path: "/",
      description: `Folder structure is too deep (${maxDepth} levels, recommended: <5)`,
    });
  }
  
  // Check for mixed concerns
  const hasMixedConcerns = structure.files.some(f =>
    f.path.includes("/utils/") && f.path.includes("/services/")
  );
  if (hasMixedConcerns) {
    issues.push({
      type: "mixed-concerns",
      path: "/",
      description: "Mixed concerns detected in folder structure",
    });
  }
  
  // Detect patterns
  if (structure.architecture.layers.length > 0) {
    patterns.push("layer-based-organization");
  }
  if (structure.files.some(f => f.path.match(/\/[^/]+\/[^/]+\//))) {
    patterns.push("feature-based-organization");
  }
  
  let organization: "excellent" | "good" | "fair" | "poor" = "good";
  if (issues.length === 0 && patterns.length > 0) {
    organization = "excellent";
  } else if (issues.length > 3) {
    organization = "poor";
  } else if (issues.length > 1) {
    organization = "fair";
  }
  
  return {
    organization,
    patterns,
    issues,
    recommendations: [
      "Organize by feature for better scalability",
      "Keep folder depth under 5 levels",
      "Separate concerns into distinct folders",
      "Use consistent naming conventions",
    ],
  };
}

private getMaxDepth(node: FolderNode, currentDepth = 0): number {
  if (!node.children || node.children.length === 0) {
    return currentDepth;
  }
  
  return Math.max(
    ...node.children.map(child => this.getMaxDepth(child, currentDepth + 1))
  );
}
```

### 10. **API Documentation Generation** (Low Priority)

```typescript
/**
 * Generate OpenAPI/Swagger documentation from routes
 */
private generateAPIDocumentation(
  routes: RouteInfo[],
  repoInfo: RepoInfo
): string {
  const openapi = {
    openapi: "3.0.0",
    info: {
      title: `${repoInfo.name} API`,
      version: "1.0.0",
      description: `API documentation for ${repoInfo.name}`,
    },
    paths: {} as Record<string, any>,
  };
  
  for (const route of routes) {
    const path = route.path;
    if (!openapi.paths[path]) {
      openapi.paths[path] = {};
    }
    
    openapi.paths[path][route.method.toLowerCase()] = {
      summary: route.description || `${route.method} ${route.path}`,
      operationId: route.handler || `${route.method.toLowerCase()}_${path.replace(/\//g, "_")}`,
      tags: [route.filePath.split("/")[0] || "default"],
      responses: {
        "200": {
          description: "Success",
          content: {
            "application/json": {
              schema: { type: "object" },
            },
          },
        },
      },
    };
    
    if (route.middleware && route.middleware.length > 0) {
      openapi.paths[path][route.method.toLowerCase()].security = route.middleware.map(m => ({
        [m]: [],
      }));
    }
  }
  
  return JSON.stringify(openapi, null, 2);
}
```

## 📋 Implementation Checklist

### Phase 1: Critical (Week 1)
- [ ] Enhanced LLM prompts with structured output
- [ ] Security vulnerability detection
- [ ] Dependency vulnerability scanning
- [ ] Code quality metrics (complexity, maintainability)

### Phase 2: High Priority (Week 2)
- [ ] Test analysis and coverage estimation
- [ ] Code smells detection
- [ ] Architecture pattern detection
- [ ] Enhanced error handling

### Phase 3: Medium Priority (Week 3)
- [ ] Performance analysis
- [ ] Enhanced folder structure analysis
- [ ] API documentation generation
- [ ] Better progress reporting

### Phase 4: Nice to Have (Ongoing)
- [ ] Integration with external tools (ESLint, Prettier)
- [ ] Comparison with previous analyses
- [ ] Export to different formats (PDF, HTML)
- [ ] Visualization dashboards

## 🎯 Expected Outcomes

After implementing these enhancements:

1. **Better Analysis Quality**: More accurate and actionable insights
2. **Security Posture**: Early detection of vulnerabilities
3. **Code Quality**: Quantifiable metrics and improvement suggestions
4. **Architecture Understanding**: Clear pattern identification
5. **Actionable Recommendations**: Prioritized, specific suggestions
6. **Comprehensive Coverage**: All aspects of codebase analyzed

## 📝 Notes

- All new analysis should be saved to API with proper categorization
- Maintain backward compatibility with existing analysis structure
- Add configuration options to enable/disable specific analyses
- Consider performance impact of deep analysis on large codebases
- Cache analysis results to avoid redundant computation



