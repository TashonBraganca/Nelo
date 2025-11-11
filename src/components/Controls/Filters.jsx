import React from "react";

/**
 * Filters
 *
 * Presentational controls for status and priority filters.
 *
 * @param {{
 *  status: "All" | "Completed" | "Pending",
 *  priority: "All" | "Low" | "Medium" | "High",
 *  onStatusChange: (value: string) => void,
 *  onPriorityChange: (value: string) => void
 * }} props
 */
function Filters({
  status,
  priority,
  onStatusChange,
  onPriorityChange,
}) {
  return (
    <div className="flex flex-wrap gap-3 justify-start md:justify-end">
      <div>
        <label
          htmlFor="status-filter"
          className="block text-xs font-medium text-slate-700 mb-1"
        >
          Status
        </label>
        <select
          id="status-filter"
          className="tm-input"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      <div>
        <label
          htmlFor="priority-filter"
          className="block text-xs font-medium text-slate-700 mb-1"
        >
          Priority
        </label>
        <select
          id="priority-filter"
          className="tm-input"
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
    </div>
  );
}

export default Filters;