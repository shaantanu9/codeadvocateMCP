/**
 * Tag Filter Utility
 * 
 * Filters out invalid tags that should not be saved, such as:
 * - Repository IDs (repo-{uuid} or repositoryId values)
 * - Project IDs (project-{uuid} or projectId values)
 * - UUIDs (any standalone UUIDs)
 * - Empty or whitespace-only tags
 */

/**
 * UUID regex pattern (matches standard UUID format)
 */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Checks if a tag looks like an ID (UUID, repo-id, project-id, etc.)
 */
function isIdTag(tag: string): boolean {
  const normalized = tag.toLowerCase().trim();

  // Check if it's a UUID
  if (UUID_PATTERN.test(normalized)) {
    return true;
  }

  // Check if it starts with repo- or project- followed by a UUID
  if (normalized.startsWith("repo-") || normalized.startsWith("repository-")) {
    const idPart = normalized.replace(/^(repo-|repository-)/, "");
    if (UUID_PATTERN.test(idPart)) {
      return true;
    }
  }

  if (normalized.startsWith("project-")) {
    const idPart = normalized.replace(/^project-/, "");
    if (UUID_PATTERN.test(idPart)) {
      return true;
    }
  }

  // Check for common ID patterns
  if (
    normalized.includes("repositoryid") ||
    normalized.includes("projectid") ||
    normalized.includes("repo-id") ||
    normalized.includes("project-id")
  ) {
    return true;
  }

  return false;
}

/**
 * Filters tags to remove IDs and invalid values
 * 
 * @param tags - Array of tags to filter
 * @param repositoryId - Optional repository ID to exclude from tags
 * @param projectId - Optional project ID to exclude from tags
 * @returns Filtered array of valid tags
 */
export function filterTags(
  tags: string[] | undefined | null,
  repositoryId?: string,
  projectId?: string
): string[] {
  if (!tags || !Array.isArray(tags)) {
    return [];
  }

  const idsToExclude = new Set<string>();
  
  // Add repository ID variations to exclude set
  if (repositoryId) {
    idsToExclude.add(repositoryId.toLowerCase());
    idsToExclude.add(`repo-${repositoryId.toLowerCase()}`);
    idsToExclude.add(`repository-${repositoryId.toLowerCase()}`);
    idsToExclude.add(`repositoryid-${repositoryId.toLowerCase()}`);
  }

  // Add project ID variations to exclude set
  if (projectId) {
    idsToExclude.add(projectId.toLowerCase());
    idsToExclude.add(`project-${projectId.toLowerCase()}`);
    idsToExclude.add(`projectid-${projectId.toLowerCase()}`);
  }

  return tags
    .map((tag) => tag.trim())
    .filter((tag) => {
      // Remove empty tags
      if (!tag || tag.length === 0) {
        return false;
      }

      const normalized = tag.toLowerCase();

      // Remove if it's in the exclude set
      if (idsToExclude.has(normalized)) {
        return false;
      }

      // Remove if it looks like an ID tag
      if (isIdTag(tag)) {
        return false;
      }

      return true;
    });
}

/**
 * Normalizes tags (lowercase, sanitize, remove duplicates)
 * 
 * @param tags - Array of tags to normalize
 * @returns Normalized array of tags
 */
export function normalizeTags(tags: string[]): string[] {
  const normalized = tags
    .map((tag) =>
      tag
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
    )
    .filter((tag) => tag.length > 0);

  // Remove duplicates
  return Array.from(new Set(normalized));
}

/**
 * Filters and normalizes tags in one step
 * 
 * @param tags - Array of tags to process
 * @param repositoryId - Optional repository ID to exclude
 * @param projectId - Optional project ID to exclude
 * @returns Filtered and normalized array of tags
 */
export function processTags(
  tags: string[] | undefined | null,
  repositoryId?: string,
  projectId?: string
): string[] {
  const filtered = filterTags(tags, repositoryId, projectId);
  return normalizeTags(filtered);
}
