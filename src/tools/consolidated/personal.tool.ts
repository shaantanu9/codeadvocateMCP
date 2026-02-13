/**
 * Personal Tool (Consolidated)
 *
 * Manages personal notes, files, links, tags, and knowledge search.
 * Actions: listNotes, createNote, getNote, updateNote, deleteNote,
 *          listFiles, createFile, deleteFile,
 *          listLinks, createLink, deleteLink,
 *          listTags, search
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

interface PersonalParams {
  action:
    | "listNotes"
    | "createNote"
    | "getNote"
    | "updateNote"
    | "deleteNote"
    | "listFiles"
    | "createFile"
    | "deleteFile"
    | "listLinks"
    | "createLink"
    | "deleteLink"
    | "listTags"
    | "search";
  noteId?: string;
  fileId?: string;
  linkId?: string;
  name?: string;
  url?: string;
  title?: string;
  content?: string;
  description?: string;
  fileType?: string;
  tags?: string[] | string;
  category?: string;
  type?: string;
  favorite?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

class PersonalTool
  extends BaseToolHandler
  implements BaseToolDefinition<PersonalParams>
{
  name = "personal";
  description =
    "Manage personal knowledge base. Supports notes (CRUD), files (create, list, delete), links (create, list, delete), tags listing, and full-text knowledge search.";

  paramsSchema = z.object({
    action: z
      .enum([
        "listNotes",
        "createNote",
        "getNote",
        "updateNote",
        "deleteNote",
        "listFiles",
        "createFile",
        "deleteFile",
        "listLinks",
        "createLink",
        "deleteLink",
        "listTags",
        "search",
      ])
      .describe("The action to perform"),
    noteId: z.string().optional().describe("The note ID (required for getNote, updateNote, deleteNote)"),
    fileId: z.string().optional().describe("The file ID (required for deleteFile)"),
    linkId: z.string().optional().describe("The link ID (required for deleteLink)"),
    name: z.string().optional().describe("File name (required for createFile)"),
    url: z.string().optional().describe("Link URL (required for createLink)"),
    title: z.string().optional().describe("Title for notes or links (required for createNote)"),
    content: z.string().optional().describe("Content for notes or files (required for createNote, createFile)"),
    description: z.string().optional().describe("Description for links"),
    fileType: z.string().optional().describe("File type for filtering or creating files"),
    tags: z
      .union([z.array(z.string()), z.string()])
      .optional()
      .describe("Tags (comma-separated string for filtering, string[] for create/update)"),
    category: z.string().optional().describe("Category for filtering or organizing"),
    type: z
      .enum(["all", "links", "files", "notes"])
      .optional()
      .describe("Content type filter for search"),
    favorite: z.boolean().optional().describe("Filter by favorite status"),
    search: z.string().optional().describe("Search query for filtering"),
    page: z.number().optional().describe("Page number for pagination"),
    limit: z.number().optional().describe("Number of items per page"),
  });

  annotations = {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: true,
  };

  async execute(params: PersonalParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      let result: unknown;

      switch (params.action) {
        // --- Notes ---
        case "listNotes": {
          const query: Record<string, string | number | boolean> = {};
          if (params.search) query.search = params.search;
          if (params.tags) query.tags = typeof params.tags === "string" ? params.tags : params.tags.join(",");
          if (params.category) query.category = params.category;
          if (params.favorite !== undefined) query.favorite = params.favorite;
          if (params.page) query.page = params.page;
          if (params.limit) query.limit = params.limit;
          result = await apiService.get("/api/personal/notes", query);
          break;
        }

        case "createNote": {
          const title = this.requireParam(params.title, "title", "createNote");
          const content = this.requireParam(params.content, "content", "createNote");
          const body: Record<string, unknown> = { title, content };
          if (params.tags && Array.isArray(params.tags)) body.tags = params.tags;
          result = await apiService.post("/api/personal/notes", body);
          break;
        }

        case "getNote": {
          const noteId = this.requireParam(params.noteId, "noteId", "getNote");
          result = await apiService.get(`/api/personal/notes/${noteId}`);
          break;
        }

        case "updateNote": {
          const noteId = this.requireParam(params.noteId, "noteId", "updateNote");
          const body: Record<string, unknown> = {};
          if (params.title) body.title = params.title;
          if (params.content) body.content = params.content;
          if (params.tags && Array.isArray(params.tags)) body.tags = params.tags;
          result = await apiService.put(`/api/personal/notes/${noteId}`, body);
          break;
        }

        case "deleteNote": {
          const noteId = this.requireParam(params.noteId, "noteId", "deleteNote");
          result = await apiService.delete(`/api/personal/notes/${noteId}`);
          break;
        }

        // --- Files ---
        case "listFiles": {
          const query: Record<string, string | number | boolean> = {};
          if (params.search) query.search = params.search;
          if (params.tags) query.tags = typeof params.tags === "string" ? params.tags : params.tags.join(",");
          if (params.category) query.category = params.category;
          if (params.fileType) query.fileType = params.fileType;
          if (params.page) query.page = params.page;
          if (params.limit) query.limit = params.limit;
          result = await apiService.get("/api/personal/files", query);
          break;
        }

        case "createFile": {
          const name = this.requireParam(params.name, "name", "createFile");
          const content = this.requireParam(params.content, "content", "createFile");
          const body: Record<string, unknown> = { name, content };
          if (params.fileType) body.fileType = params.fileType;
          if (params.tags && Array.isArray(params.tags)) body.tags = params.tags;
          result = await apiService.post("/api/personal/files", body);
          break;
        }

        case "deleteFile": {
          const fileId = this.requireParam(params.fileId, "fileId", "deleteFile");
          result = await apiService.delete(`/api/personal/files/${fileId}`);
          break;
        }

        // --- Links ---
        case "listLinks": {
          const query: Record<string, string | number | boolean> = {};
          if (params.search) query.search = params.search;
          if (params.tags) query.tags = typeof params.tags === "string" ? params.tags : params.tags.join(",");
          if (params.category) query.category = params.category;
          if (params.favorite !== undefined) query.favorite = params.favorite;
          if (params.page) query.page = params.page;
          if (params.limit) query.limit = params.limit;
          result = await apiService.get("/api/personal/links", query);
          break;
        }

        case "createLink": {
          const url = this.requireParam(params.url, "url", "createLink");
          const body: Record<string, unknown> = { url };
          if (params.title) body.title = params.title;
          if (params.description) body.description = params.description;
          if (params.tags && Array.isArray(params.tags)) body.tags = params.tags;
          result = await apiService.post("/api/personal/links", body);
          break;
        }

        case "deleteLink": {
          const linkId = this.requireParam(params.linkId, "linkId", "deleteLink");
          result = await apiService.delete(`/api/personal/links/${linkId}`);
          break;
        }

        // --- Tags & Search ---
        case "listTags": {
          result = await apiService.get("/api/personal/tags");
          break;
        }

        case "search": {
          const query: Record<string, string | number | boolean> = {};
          if (params.search) query.search = params.search;
          if (params.tags) query.tags = typeof params.tags === "string" ? params.tags : params.tags.join(",");
          if (params.category) query.category = params.category;
          if (params.type) query.type = params.type;
          if (params.favorite !== undefined) query.favorite = params.favorite;
          if (params.page) query.page = params.page;
          if (params.limit) query.limit = params.limit;
          result = await apiService.get("/api/personal/knowledge", query);
          break;
        }
      }

      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `personal.${params.action} completed`,
      });

      return jsonResponse(result, `personal.${params.action} completed successfully`);
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        `Failed to execute personal.${params.action}`,
        params as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const personalTool = new PersonalTool();
