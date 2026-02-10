# Learnings: CodeAdvocate MCP / Documentation & Collections API

**Source:** `error.md` (2026-02-10) — issues when using createDocumentation and addSnippetToCollection.

## 1. Documentation type `adr`

- **Problem:** Backend rejected `type: "adr"` (Architecture Decision Record); only `service`, `component`, `module`, `library`, `overview`, `logic-flow`, `other` were allowed.
- **Learning:** When our tools proxy to **snippet-manager**, we must align allowed types with the API and DB. If the backend is the **CodeAdvocate MCP** server, it may not support `adr`; use `type: "overview"` as a workaround for ADRs.
- **Fix applied:** snippet-manager now allows `adr` in the API and in the DB (`documentations.type` CHECK). demo_mcp create-documentation tool description documents `adr` and the `overview` fallback.

## 2. addSnippetToCollection: `snippetId` vs `snippetIds`

- **Problem:** MCP tool schema required `snippetId` (string), while the backend expected `snippetIds` (array). Sending only one or the other caused validation or server errors.
- **Learning:** Proxy tools must send the **exact shape the backend expects**. Our tool can keep a single `snippetId` in the schema and convert to `snippetIds: [snippetId]` when calling the API.
- **Fix applied:** demo_mcp `add-snippet-to-collection.tool.ts` now sends `snippetIds: [params.snippetId]`. snippet-manager `POST /api/collections/[id]/snippets` accepts both `snippetIds` (array) and `snippetId` (single string) for compatibility.

## 3. Contract alignment

- Keep **tool parameters** (what the LLM/user sends) and **backend request body** (what the API expects) in sync. If they differ, do the mapping in the tool layer (e.g. single id → array of ids, or type alias like `adr` → allowed value).
