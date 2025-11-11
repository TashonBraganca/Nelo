import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { validateTask } from "../../lib/validate.js";

/**
 * EditTaskModal
 *
 * Accessible modal for editing an existing task.
 * - Focus trap
 * - Esc to close
 * - Click backdrop to close
 * - Inline validation, submit disabled on error
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
 *  onSave: (updatedTask: any) => void,
 *  onCancel: () => void
 * }} props
 */
function EditTaskModal({ task, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => ({
    ...task,
  }));

  // Keep local draft in sync if task changes
  useEffect(() => {
    setDraft({ ...task });
  }, [task]);

  const errors = useMemo(() => validateTask(draft), [draft]);
  const hasErrors = Object.keys(errors).length > 0;

  const dialogRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);

  const updateField = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (hasErrors) return;
    onSave(draft);
  };

  // Close on Esc
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      } else if (e.key === "Tab") {
        // Basic focus trap
        const focusable =
          dialogRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) || [];
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  // Focus first field on open
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (firstFocusableRef.current) {
        firstFocusableRef.current.focus();
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  const stopPropagation = useCallback((e) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      className="tm-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-task-title"
      onClick={onCancel}
    >
      <div
        className="tm-modal"
        ref={dialogRef}
        onClick={stopPropagation}
      >
        <h2
          id="edit-task-title"
          className="text-lg font-semibold text-slate-900"
        >
          Edit task
        </h2>
        <form
          onSubmit={handleSubmit}
          className="mt-4 flex flex-col gap-3"
          noValidate
        >
          <div>
            <label
              htmlFor="edit-title"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Title<span className="text-red-600"> *</span>
            </label>
            <input
              id="edit-title"
              ref={firstFocusableRef}
              type="text"
              className="tm-input"
              value={draft.title}
              onChange={(e) =>
                updateField("title", e.target.value)
              }
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-description"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="edit-description"
              rows={3}
              className="tm-input resize-none"
              value={draft.description || ""}
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

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label
                htmlFor="edit-priority"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Priority
              </label>
              <select
                id="edit-priority"
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

            <div className="flex-1">
              <label
                htmlFor="edit-dueDate"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Due date (optional)
              </label>
              <input
                id="edit-dueDate"
                type="date"
                className="tm-input"
                value={draft.dueDate || ""}
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

          <div className="flex items-center gap-2">
            <input
              id="edit-completed"
              type="checkbox"
              checked={!!draft.completed}
              onChange={(e) =>
                updateField("completed", e.target.checked)
              }
            />
            <label
              htmlFor="edit-completed"
              className="text-xs text-slate-700"
            >
              Mark as completed
            </label>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="tm-btn-secondary"
              ref={lastFocusableRef}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={hasErrors}
              className={`tm-btn-primary ${
                hasErrors ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTaskModal;