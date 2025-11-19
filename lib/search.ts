/**
 * Full-text search utilities
 */

/**
 * Build SQL LIKE query for full-text search
 * @param searchTerm Search term
 * @param fields Fields to search in
 * @returns SQL WHERE clause
 */
export function buildFullTextSearch(
  searchTerm: string,
  fields: string[]
): { whereClause: string; params: string[] } {
  const searchPattern = `%${searchTerm}%`;
  const conditions = fields.map((field) => `${field} LIKE ?`);
  const whereClause = `(${conditions.join(" OR ")})`;
  const params = fields.map(() => searchPattern);

  return { whereClause, params };
}

/**
 * Normalize search term for better matching
 * @param term Search term
 * @returns Normalized term
 */
export function normalizeSearchTerm(term: string): string {
  return term.trim().toLowerCase();
}

/**
 * Extract search filters from query string
 * @param query Query string
 * @returns Parsed filters
 */
export function parseSearchQuery(query: string): {
  terms: string[];
  exact: boolean;
} {
  const trimmed = query.trim();

  // Check for exact match (quoted)
  const exactMatch = trimmed.match(/^"(.+)"$/);
  if (exactMatch) {
    return { terms: [exactMatch[1]], exact: true };
  }

  // Split by spaces for multiple terms
  const terms = trimmed
    .split(/\s+/)
    .filter((t) => t.length > 0)
    .map(normalizeSearchTerm);

  return { terms, exact: false };
}
