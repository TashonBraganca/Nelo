import React, { useCallback } from "react";
import PriorityBadge from "./PriorityBadge.jsx";
import TaskActions from "./TaskActions.jsx";
import { formatDueDate } from "../../lib/date.js";

/**
 * TaskCard
 *
 * Renders a single task as a card with:
 * - Title, description
 * - Priority badge
 * - Due date
 * - Completed style treatment
 * - Actions: toggle complete, edit, delete
 *
 * @param {{
 *  task: {
 *    id: string;
 *    title: string;
 *    description: string;
 *    priority: "Low" | "Medium" | "High";
 *    dueDate: string;
 *    completed: boolean;
 *    createdAt: string;
 *    updatedAt: string;
 *  },
 *  onEdit: (id: string) => void,
 *  onToggle: (id: string) => void,
 *  onDelete: (id: string) => void
 * }} props
 */
function TaskCard({ task, onEdit, onToggle, onDelete }) {
  const handleToggle = useCallback(() => onToggle(task.id), [onToggle, task.id]);
  const handleEdit = useCallback(() => onEdit(task.id), [onEdit, task.id]);
  const handleDelete = useCallback(() => onDelete(task.id), [onDelete, task.id]);

  return (
    <article
      className={`tm-card gap-2 md:flex-row md:items-start ${
        task.completed ? "opacity-60" : ""
      }`}
      aria-label={`Task: ${task.title}`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3
            className={`text-sm font-semibold text-slate-900 ${
              task.completed ? "line-through" : ""
            }`}
          >
            {task.title}
          </h3>
          <PriorityBadge priority={task.priority} />
        </div>
        {task.description && (
          <p className="mt-1 text-xs text-slate-700 whitespace-pre-line">
            {task.description}
          </p>
        )}
        <p className="mt-2 text-[11px] text-slate-500">
          Due: {formatDueDate(task.dueDate)}
        </p>
      </div>
      <div className="mt-3 md:mt-0 md:ml-4 flex items-center gap-2">
        <TaskActions
          completed={task.completed}
          onToggle={handleToggle}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </article>
  );
}

export default TaskCard;