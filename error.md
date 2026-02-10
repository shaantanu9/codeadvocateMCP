# CodeAdvocate MCP – Errors Report for MCP Owner

**Date:** 2026-02-10  
**Context:** Using CodeAdvocate MCP to save PAY-1711 documentation, rules, prompts, learnings, patterns, repository files, and collections (jp_app_marketing repository).

---

## 1. `createDocumentation` – Invalid `type` value

**Tool:** `mcp_codeAdvocate_createDocumentation`

**Request:** Created documentation with `type: "adr"` (Architecture Decision Record).

**Error returned:**
```
❌ Error: Invalid type. Allowed values: service, component, module, library, overview, logic-flow, other
```

**Expected / suggestion:** Either:
- Add `adr` to the allowed values for documentation type, or
- Document clearly that ADRs should use `type: "overview"` (or another allowed value).

**Workaround used:** Set `type: "overview"` and stored the ADR summary there.

---

## 2. `addSnippetToCollection` – Conflicting required parameters

**Tool:** `mcp_codeAdvocate_addSnippetToCollection`

**Intent:** Add existing snippets to the collection “PAY-1711 jp_app_marketing” (collection ID: `bf7678ba-7de2-4ea9-a390-785287b4e282`).

### Attempt A – Only `snippetId` (singular)

**Parameters:** `collectionId`, `snippetId` (e.g. `5afd98f2-ce7b-4978-a0b0-e0fad48318a5`).

**Error returned:**
```
❌ Error: Missing required field: snippetIds (array)
```

So the server expects `snippetIds` (array).

### Attempt B – Only `snippetIds` (array)

**Parameters:** `collectionId`, `snippetIds: ["5afd98f2-ce7b-4978-a0b0-e0fad48318a5", "fb761dfd-99e1-4ccc-ada7-52512c578637"]`.

**Error returned:**
```json
MCP error -32602: Input validation error: Invalid arguments for tool addSnippetToCollection: [
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "undefined",
    "path": ["snippetId"],
    "message": "Required"
  }
]
```

So the client/schema requires `snippetId` (singular string).

**Result:** It is impossible to add a snippet to a collection: one response requires `snippetIds` (array), the other requires `snippetId` (string). The contract for `addSnippetToCollection` is inconsistent.

**Suggested fix:** Unify the API and tool schema to one of:
- **Option A:** Require only `snippetId` (string) and support adding one snippet per call, or  
- **Option B:** Require only `snippetIds` (array of strings) and support adding one or many snippets per call.

Then align the MCP tool parameter definition and server validation with the chosen option.

---

## Summary for MCP owner

| # | Tool                      | Issue                                      | Severity   |
|---|---------------------------|--------------------------------------------|------------|
| 1 | `createDocumentation`     | `type: "adr"` not allowed                  | Medium     |
| 2 | `addSnippetToCollection` | Conflicting `snippetId` vs `snippetIds`   | High (blocking) |

**Environment:** Cursor IDE, CodeAdvocate MCP server (jp_app_marketing repository; create repository, create repository file, create documentation, create markdown document, create collection, create snippet, create rule, create prompt, create learning, create pattern, create repository Mermaid diagram, list repositories, list repository files all worked as expected).

If you need more detail (exact request payloads, tool call format, or timestamps), say what format you prefer and we can add it.

---

## Fixes applied (snippet-manager + demo_mcp repos)

**Root cause:**  
- **Issue 1:** Backend (snippet-manager API and DB) only allowed documentation types without `adr`.  
- **Issue 2:** Backend expected `snippetIds` (array) while the MCP tool schema used `snippetId` (string), and demo_mcp proxy was sending `snippetId` to an API that expects `snippetIds`.

**Changes made:**

| Repo | Fix |
|------|-----|
| **snippet-manager** | 1) Added `adr` to allowed documentation types in `app/api/documentations/route.ts`. 2) Migration `049_add_adr_documentation_type.sql` adds `adr` to the `documentations.type` CHECK constraint. 3) `POST /api/collections/[id]/snippets` now accepts both `snippetIds` (array) and `snippetId` (single string). |
| **demo_mcp** | 1) `add-snippet-to-collection.tool.ts` now sends `snippetIds: [params.snippetId]` so the API receives the expected array. 2) `create-documentation.tool.ts` param description updated to list `adr` and suggest `overview` when backend doesn’t support it. |

**Result:**  
- When **demo_mcp** tools call **snippet-manager** API: `createDocumentation` with `type: "adr"` and `addSnippetToCollection` with `snippetId` both work.  
- **CodeAdvocate MCP** (external server): unchanged; report remains for the MCP owner to fix schema/server.
