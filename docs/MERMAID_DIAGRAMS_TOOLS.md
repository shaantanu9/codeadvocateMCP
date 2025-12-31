# Mermaid Diagrams Tools Documentation

## Overview
Complete set of MCP tools for managing Mermaid diagrams in repositories, based on the `/api/repositories/{repositoryId}/mermaid` API endpoints.

## ✅ Implemented Tools (5 tools)

### 1. `listRepositoryMermaid` - List Mermaid Diagrams
Get a paginated list of Mermaid diagrams for a repository with optional filters.

**Parameters:**
- `repositoryId` (required): The ID of the repository
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)
- `search` (optional): Search in title, description, and content
- `category` (optional): Filter by category (architecture, workflow, database, custom, etc.)

**Example:**
```typescript
listRepositoryMermaid({
  repositoryId: "692a91e7-8451-4ea0-88da-a0f56de86533",
  page: 1,
  limit: 20,
  search: "architecture",
  category: "architecture"
});
```

**Endpoint:** `GET /api/repositories/{repositoryId}/mermaid`

---

### 2. `getRepositoryMermaid` - Get Single Diagram
Get a specific Mermaid diagram by ID.

**Parameters:**
- `repositoryId` (required): The ID of the repository
- `diagramId` (required): The ID of the Mermaid diagram

**Example:**
```typescript
getRepositoryMermaid({
  repositoryId: "692a91e7-8451-4ea0-88da-a0f56de86533",
  diagramId: "diagram-uuid"
});
```

**Endpoint:** `GET /api/repositories/{repositoryId}/mermaid/{diagramId}`

---

### 3. `createRepositoryMermaid` - Create Diagram
Create a new Mermaid diagram for a repository.

**Parameters:**
- `repositoryId` (required): The ID of the repository
- `title` (required): Diagram title
- `content` (required): Mermaid diagram code
- `description` (optional): Diagram description
- `category` (optional): Category (default: "custom")
- `tags` (optional): Array of tags
- `fileName` (optional): Custom file name (auto-generated if not provided)

**Example:**
```typescript
createRepositoryMermaid({
  repositoryId: "692a91e7-8451-4ea0-88da-a0f56de86533",
  title: "Repository Architecture",
  content: "flowchart TD\n    A[Repository] --> B[Snippets]",
  description: "Shows the overall architecture",
  category: "architecture",
  tags: ["architecture", "structure"]
});
```

**Endpoint:** `POST /api/repositories/{repositoryId}/mermaid`

**Note:** This endpoint may return 500 error (known backend issue). The tool handles this gracefully.

---

### 4. `updateRepositoryMermaid` - Update Diagram
Update an existing Mermaid diagram (all fields are optional).

**Parameters:**
- `repositoryId` (required): The ID of the repository
- `diagramId` (required): The ID of the Mermaid diagram to update
- `title` (optional): Diagram title
- `content` (optional): Mermaid diagram code
- `description` (optional): Diagram description
- `category` (optional): Category
- `tags` (optional): Array of tags
- `fileName` (optional): Custom file name

**Example:**
```typescript
updateRepositoryMermaid({
  repositoryId: "692a91e7-8451-4ea0-88da-a0f56de86533",
  diagramId: "diagram-uuid",
  title: "Updated Architecture",
  content: "flowchart TD\n    A[Start] --> B[Updated Process]"
});
```

**Endpoint:** `PUT /api/repositories/{repositoryId}/mermaid/{diagramId}`

---

### 5. `deleteRepositoryMermaid` - Delete Diagram
Delete a Mermaid diagram.

**Parameters:**
- `repositoryId` (required): The ID of the repository
- `diagramId` (required): The ID of the Mermaid diagram to delete

**Example:**
```typescript
deleteRepositoryMermaid({
  repositoryId: "692a91e7-8451-4ea0-88da-a0f56de86533",
  diagramId: "diagram-uuid"
});
```

**Endpoint:** `DELETE /api/repositories/{repositoryId}/mermaid/{diagramId}`

---

## Features

### ✅ Consistent Patterns
- All tools use `BaseToolHandler` for consistent error handling
- Comprehensive logging with `toolCallLogger`
- Standardized pagination using `buildPaginationParams`
- Query parameter building using `buildQueryParams`

### ✅ Proper Validation
- Zod schema validation for all parameters
- Pagination limits enforced (min: 1, max: 100)
- Type-safe parameter handling

### ✅ Error Handling
- Standardized error responses
- Detailed error logging
- Graceful handling of known issues (500 errors on POST)

## Testing

### Test Script
Run the test script to verify all tools:

```bash
# Make executable (if needed)
chmod +x scripts/test-repository-mermaid-tools.sh

# Run tests
./scripts/test-repository-mermaid-tools.sh [repository-id]
```

### Test Coverage
The test script covers:
1. ✅ List diagrams with pagination
2. ✅ List with search filter
3. ✅ List with category filter
4. ⚠️ Create diagram (may return 500 - known issue)

### Manual Testing
For full testing including GET/UPDATE/DELETE:

1. **Create a diagram** (may fail with 500):
```bash
curl -X POST "http://localhost:5656/api/repositories/{repo-id}/mermaid" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Diagram",
    "content": "flowchart TD\n    A[Start] --> B[End]",
    "category": "architecture"
  }'
```

2. **Get the diagram ID** from the response (or list diagrams)

3. **Test GET/UPDATE/DELETE** using the diagram ID

## API Response Formats

### List Response
```json
{
  "success": true,
  "data": {
    "diagrams": [
      {
        "id": "uuid",
        "title": "Repository Architecture",
        "description": "Shows the overall architecture",
        "category": "architecture",
        "file_path": "/diagrams/repository-architecture.mermaid",
        "file_name": "repository-architecture.mermaid",
        "content": "flowchart TD\n    A[Repository] --> B[Snippets]",
        "tags": ["architecture", "structure"],
        "created_at": "2025-01-27T10:00:00Z",
        "updated_at": "2025-01-27T10:00:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 20
  }
}
```

### Single Diagram Response
```json
{
  "success": true,
  "data": {
    "diagram": {
      "id": "uuid",
      "title": "Repository Architecture",
      "description": "Shows the overall architecture",
      "category": "architecture",
      "file_path": "/diagrams/repository-architecture.mermaid",
      "file_name": "repository-architecture.mermaid",
      "content": "flowchart TD\n    A[Repository] --> B[Snippets]",
      "tags": ["architecture", "structure"],
      "created_at": "2025-01-27T10:00:00Z",
      "updated_at": "2025-01-27T10:00:00Z"
    }
  }
}
```

## Known Issues

### POST Endpoint (Create Diagram)
- **Status:** ⚠️ May return 500 error
- **Cause:** Backend database/schema issue
- **Impact:** Tool handles error gracefully, logs it, and returns appropriate error message
- **Workaround:** Use API directly or wait for backend fix

## Usage Examples

### Complete Workflow
```typescript
// 1. List all diagrams
const diagrams = await listRepositoryMermaid({
  repositoryId: "repo-uuid",
  page: 1,
  limit: 20
});

// 2. Create a new diagram
const newDiagram = await createRepositoryMermaid({
  repositoryId: "repo-uuid",
  title: "System Architecture",
  content: "flowchart TD\n    A[Frontend] --> B[Backend]",
  category: "architecture",
  tags: ["architecture", "system"]
});

// 3. Update the diagram
await updateRepositoryMermaid({
  repositoryId: "repo-uuid",
  diagramId: newDiagram.diagram.id,
  description: "Updated description"
});

// 4. Get the diagram
const diagram = await getRepositoryMermaid({
  repositoryId: "repo-uuid",
  diagramId: newDiagram.diagram.id
});

// 5. Delete the diagram
await deleteRepositoryMermaid({
  repositoryId: "repo-uuid",
  diagramId: newDiagram.diagram.id
});
```

## Integration with Repository Analysis

These tools can be used in conjunction with `analyzeAndSaveRepository` to:
- Generate architecture diagrams automatically
- Create workflow diagrams from code analysis
- Store visual representations of repository structure

## Related Documentation

- [Snippets and Mermaid APIs Complete Documentation](./doc_reop/SNIPPETS_MERMAID_API_COMPLETE.md)
- [Repository Tools Documentation](./COMPANY_EMPLOYEE_REPOSITORY_TOOLS.md)

---

**Status:** ✅ **All 5 tools implemented and registered**
**Test Script:** `scripts/test-repository-mermaid-tools.sh`
**Last Updated:** 2025-01-27
