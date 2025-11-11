/**
 * @typedef {Object} TaskDraft
 * @property {string} [id]
 * @property {string} title
 * @property {string} [description]
 * @property {"Low"|"Medium"|"High"} priority
 * @property {string} [dueDate]
 * @property {boolean} [completed]
 */

/**
 * Validate a task draft according to the spec.
 *
 * Rules:
 * - Title: required, trim, ≤ 100 chars
 * - Description: optional, ≤ 1000 chars
 * - Priority: one of "Low" | "Medium" | "High"
 * - Due Date: if present, must be a valid date (ISO parseable)
 *
 * @param {TaskDraft} taskDraft
 * @returns {Record<string, string>} errors map
 */
export function validateTask(taskDraft) {
  const errors = {};
  const title = taskDraft.title ?? "";
  const description = taskDraft.description ?? "";
  const priority = taskDraft.priority;
  const dueDate = taskDraft.dueDate;

  if (!title || !title.trim()) {
    errors.title = "Title is required";
  } else if (title.trim().length > 100) {
    errors.title = "Max 100 characters";
  }

  if (description && description.length > 1000) {
    errors.description = "Max 1000 characters";
  }

  if (!["Low", "Medium", "High"].includes(priority)) {
    errors.priority = "Priority must be one of Low, Medium, High";
  }

  if (dueDate) {
    const ts = Date.parse(dueDate);
    if (Number.isNaN(ts)) {
      errors.dueDate = "Due date invalid";
    }
  }

  return errors;
}