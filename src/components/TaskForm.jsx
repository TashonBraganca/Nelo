import React, { useMemo, useState } from "react";
import { validateTask } from "../lib/validate.js";

/**
 * @typedef {Object} TaskFormDraft
 * @property {string} title
 * @property {string} description
 * @property {"Low"|"Medium"|"High"} priority
 * @property {string} dueDate
 */

/**
 * TaskForm
 *
 * Controlled form for creating new tasks.
 * - Title required
 * - Inline validation
 * - Submit disabled when errors exist
 *
 * @param {{ onSubmit: (draft: TaskFormDraft) => void }} props
 */
function TaskForm({ onSubmit }) {
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    priority: "Low",
    dueDate: "",
  });

  const errors = useMemo(() => validateTask(draft), [draft]);
  const hasErrors = Object.keys(errors).length > 0;

  const updateField = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (hasErrors) return;
    onSubmit({
      title: draft.title.trim(),
      description: draft.description.trim(),
      priority: draft.priority,
      dueDate: draft.dueDate,
    });
    setDraft({
      title: "",
      description: "",
      priority: "Low",
      dueDate: "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="tm-card gap-3"
      noValidate
      aria-label="Create a new task"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <label
            htmlFor="task-title"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Title<span className="text-red-600"> *</span>
          </label>
          <input
            id="task-title"
            type="text"
            className="tm-input"
            placeholder="e.g. Submit React Assessment"
            value={draft.title}
            onChange={(e) => updateField("title", e.target.value)}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-600">{errors.title}</p>
          )}
        </div>
        <div className="w-full sm:w-40">
          <label
            htmlFor="task-priority"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Priority
          </label>
          <select
            id="task-priority"
            className="tm-input"
            value={draft.priority}
            onChange={(e) =>
              updateField("priority", e.target.value)
            }
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          {errors.priority && (
            <p className="mt-1 text-xs text-red-600">
              {errors.priority}
            </p>
          )}
        </div>
        <div className="w-full sm:w-44">
          <label
            htmlFor="task-dueDate"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Due date (optional)
          </label>
          <input
            id="task-dueDate"
            type="date"
            className="tm-input"
            value={draft.dueDate}
            onChange={(e) =>
              updateField("dueDate", e.target.value)
            }
          />
          {errors.dueDate && (
            <p className="mt-1 text-xs text-red-600">
              {errors.dueDate}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="task-description"
          className="block text-xs font-medium text-slate-700 mb-1"
        >
          Description (optional)
        </label>
        <textarea
          id="task-description"
          rows={2}
          className="tm-input resize-none"
          placeholder="Add more details..."
          value={draft.description}
          onChange={(e) =>
            updateField("description", e.target.value)
          }
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">
            {errors.description}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={hasErrors}
          className={`tm-btn-primary ${
            hasErrors ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          Add Task
        </button>
      </div>
    </form>
  );
}

export default TaskForm;