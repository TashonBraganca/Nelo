import React from "react";

/**
 * TaskActions
 *
 * Presentational actions for a task:
 * - Toggle complete
 * - Edit
 * - Delete
 *
 * @param {{
 *  completed: boolean,
 *  onToggle: () => void,
 *  onEdit: () => void,
 *  onDelete: () => void
 * }} props
 */
function TaskActions({ completed, onToggle, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToggle}
        className={`tm-btn-secondary px-2 py-1 ${
          completed ? "line-through" : ""
        }`}
        aria-pressed={completed}
        aria-label={completed ? "Mark as pending" : "Mark as completed"}
      >
        {completed ? "Mark Pending" : "Mark Done"}
      </button>

      <button
        type="button"
        onClick={onEdit}
        className="tm-btn-secondary px-2 py-1"
        aria-label="Edit task"
      >
        Edit
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="tm-btn-danger px-2 py-1"
        aria-label="Delete task"
      >
        Delete
      </button>
    </div>
  );
}

export default TaskActions;