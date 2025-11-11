import React from "react";
import TaskCard from "./TaskCard.jsx";

/**
 * TaskList
 *
 * Renders a list of tasks or empty states.
 *
 * @param {{
 *  tasks: import("../../lib/filters.js").Task[],
 *  hasAnyTasks: boolean,
 *  onEdit: (id: string) => void,
 *  onToggle: (id: string) => void,
 *  onDelete: (id: string) => void
 * }} props
 */
function TaskList({
  tasks,
  hasAnyTasks,
  onEdit,
  onToggle,
  onDelete,
}) {
  if (!hasAnyTasks) {
    return (
      <div className="tm-card items-center text-center text-sm text-slate-600">
        <p>No tasks yet. Start by adding your first task above.</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="tm-card items-center text-center text-sm text-slate-600">
        <p>No tasks match your current filters or search.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default TaskList;