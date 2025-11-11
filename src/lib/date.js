/**
 * Format a due date string for display.
 * - If empty/invalid: returns "No due date".
 * - Else: returns a readable date, e.g. "Nov 20, 2025".
 *
 * @param {string} dueDate
 * @returns {string}
 */
export function formatDueDate(dueDate) {
  if (!dueDate) return "No due date";
  const ts = Date.parse(dueDate);
  if (Number.isNaN(ts)) return "No due date";
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}