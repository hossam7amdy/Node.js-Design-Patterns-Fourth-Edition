export function slugify(text: string): string {
  return (
    text
      // 1. Normalize to standard de-composite characters
      .normalize("NFD")
      // 2. Uniform lowercasing for Latin characters
      .toLowerCase()
      // 3. Replace whitespace and underscores with hyphens
      .replace(/[\s_]+/g, "-")
      // 4. Strip everything that is NOT a letter, number, or hyphen
      // The 'u' flag enables Unicode property escapes
      .replace(/[^\p{L}\p{N}-]/gu, "")
      // 5. Deduplicate consecutive hyphens
      .replace(/-+/g, "-")
      // 6. Trim hyphens from the start and end
      .replace(/^-+|-+$/g, "")
  );
}
