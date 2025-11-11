/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {"Low"|"Medium"|"High"} priority
 * @property {string} dueDate
 * @property {boolean} completed
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * Filter and sort tasks based on status, priority, and query.
 *
 * Status: "All" | "Completed" | "Pending"
 * Priority: "All" | "Low" | "Medium" | "High"
 *
 * Sort order:
 * - Incomplete tasks before completed tasks
 * - Then by due date ascending (empty dueDate sorted last)
 * - Then by createdAt descending (newer first)
 *
 * @param {Task[]} tasks
 * @param {{ status: string, priority: string, query: string }} params
 * @returns {Task[]}
 */
export function selectVisibleTasks(tasks, { status, priority, query }) {
  const q = (query || "").trim().toLowerCase();

  return tasks
    .filter((t) => {
      const matchStatus =
        status === "All" ||
        (status === "Completed" && t.completed) ||
        (status === "Pending" && !t.completed);

      const matchPriority =
        priority === "All" || t.priority === priority;

      const matchQuery =
        !q || (t.title || "").toLowerCase().includes(q);

      return matchStatus && matchPriority && matchQuery;
    })
    .slice()
    .sort((a, b) => {
      // Incomplete first
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      // Due date: empty last
      const aHasDue = !!a.dueDate;
      const bHasDue = !!b.dueDate;
      if (aHasDue && bHasDue) {
        const ad = new Date(a.dueDate).getTime();
        const bd = new Date(b.dueDate).getTime();
        if (!Number.isNaN(ad) && !Number.isNaN(bd) && ad !== bd) {
          return ad - bd;
        }
      } else if (aHasDue !== bHasDue) {
        return aHasDue ? -1 : 1;
      }

      // createdAt: newer first
      const ac = new Date(a.createdAt).getTime();
      const bc = new Date(b.createdAt).getTime();
      if (!Number.isNaN(ac) && !Number.isNaN(bc) && ac !== bc) {
        return bc - ac;
      }

      return 0;
    });
}