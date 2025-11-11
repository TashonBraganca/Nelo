import React, { useEffect, useMemo, useRef, useState } from "react";
import { selectVisibleTasks } from "./lib/filters.js";
import { validateTask } from "./lib/validate.js";
import { genId } from "./lib/id.js";
import { formatDueDate } from "./lib/date.js";

/**
 * Theme context is intentionally lightweight:
 * - We store theme in state and on document.documentElement.
 * - All components read Tailwind dark: classes directly.
 */
const ThemeContext = React.createContext({
  theme: "light",
  toggleTheme: () => {},
});

/**
 * Initial demo tasks.
 */
const INITIAL_TASKS = [
  {
    id: "170000003-03",
    title: "Prepare slides",
    description: "For Monday's meeting.",
    priority: "Medium",
    dueDate: "2025-11-15",
    completed: false,
    createdAt: "2025-11-09T12:00:00Z",
    updatedAt: "2025-11-09T13:00:00Z",
  },
  {
    id: "170000001-01",
    title: "Submit React Assessment",
    description: "Finish all sections and code.",
    priority: "High",
    dueDate: "2025-11-20",
    completed: false,
    createdAt: "2025-11-11T10:00:00Z",
    updatedAt: "2025-11-11T10:10:00Z",
  },
  {
    id: "170000002-02",
    title: "Buy groceries",
    description: "",
    priority: "Low",
    dueDate: "2025-11-11",
    completed: true,
    createdAt: "2025-11-10T08:00:00Z",
    updatedAt: "2025-11-10T09:00:00Z",
  },
];

const STORAGE_KEY = "task-manager-tasks-v2";
const THEME_KEY = "task-manager-theme-v1";

function loadInitialTasks() {
  if (typeof window === "undefined") return INITIAL_TASKS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_TASKS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_TASKS;
  } catch {
    return INITIAL_TASKS;
  }
}

function loadInitialTheme() {
  if (typeof window === "undefined") return "light";
  try {
    const raw = window.localStorage.getItem(THEME_KEY);
    if (raw === "dark" || raw === "light") return raw;
  } catch {
    // ignore
  }
  // Prefer system
  if (window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(loadInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  const value = useMemo(
    () => ({ theme, toggleTheme }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Layout container with gradient background and centered content.
 */
function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark bg-app-gradient text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -left-16 h-64 w-64 rounded-full bg-primary-soft/20 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-accent-pink/10 blur-3xl animate-blob" />
      </div>
      <main className="relative z-10 flex justify-center px-4 py-10">
        <section className="w-full max-w-4xl space-y-6">
          {children}
        </section>
      </main>
    </div>
  );
}

/**
 * Theme toggle button (top-right in header).
 */
function ThemeToggle() {
  const { theme, toggleTheme } = React.useContext(ThemeContext);
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300/60 bg-white/80 text-slate-700 shadow-soft backdrop-blur hover:bg-slate-50 hover:text-primary-soft dark:border-slate-700 dark:bg-surface-dark/90 dark:text-slate-100 dark:hover:bg-slate-900 transition-colors duration-200"
    >
      <span
        className={`absolute inset-0 -z-10 rounded-full bg-gradient-to-tr from-primary-soft/15 to-accent-cyan/15 opacity-0 transition-opacity duration-200 ${
          isDark ? "opacity-100" : ""
        }`}
      />
      {isDark ? (
        <span className="text-lg">☀️</span>
      ) : (
        <span className="text-lg">🌙</span>
      )}
    </button>
  );
}

/**
 * Premium header with subtle entrance animation.
 */
function HeaderBar() {
  const { theme } = React.useContext(ThemeContext);
  return (
    <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between animate-fade-in-up">
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Task Manager
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Plan, prioritize, and complete tasks with a focused, elegant workspace.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-surface-light/80 px-3 py-1 text-[10px] font-medium text-slate-500 shadow-soft dark:bg-surface-dark/80 dark:text-slate-400">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              theme === "dark" ? "bg-accent-cyan" : "bg-primary-soft"
            }`}
          />
          Live preview
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}

/**
 * Floating-label input.
 */
function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  required,
  error,
  ...rest
}) {
  const hasValue = value != null && String(value).length > 0;
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        className={`peer w-full rounded-xl border bg-surface-light/90 px-3 pt-4 pb-2 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200 placeholder-transparent
          focus:border-primary-soft focus:bg-white focus:shadow-focus
          dark:bg-surface-dark/80 dark:text-slate-100 dark:border-slate-700 dark:focus:border-primary-soft dark:focus:bg-surface-dark
          ${error ? "border-red-500 focus:border-red-500" : "border-slate-200"}`}
        value={value}
        onChange={onChange}
        placeholder={label}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-3 top-2 origin-left text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 transition-all duration-150
          peer-focus:text-primary-soft peer-focus:top-1 peer-focus:text-[9px]
          ${hasValue ? "top-1 text-[9px] text-primary-soft" : ""}`}
      >
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1 text-[10px] text-red-500"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Primary button.
 */
function PrimaryButton({ children, className = "", ...rest }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-xl bg-primary-soft px-4 py-2 text-xs font-semibold text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-focus active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-soft/70 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/**
 * Secondary ghost button.
 */
function GhostButton({ children, className = "", ...rest }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-xl border border-slate-200/80 bg-white/70 px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:text-primary-soft dark:bg-surface-dark/90 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-surface-dark ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/**
 * Destructive button.
 */
function DangerButton({ children, className = "", ...rest }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-xl bg-red-500/90 px-3 py-1.5 text-[11px] font-semibold text-white shadow-soft transition-all duration-200 hover:bg-red-500 hover:-translate-y-0.5 hover:shadow-focus active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/80 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/**
 * Pill for filters.
 */
function FilterPill({ active, children, onClick }) {
  return (
    <button
      type="button"
      className={`px-3 py-1 rounded-full text-[10px] font-medium transition-all duration-200 border
        ${active
          ? "bg-primary-soft text-white border-primary-soft shadow-soft"
          : "bg-surface-light/80 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-primary-soft dark:bg-surface-dark/80 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-surface-dark"
        }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/**
 * Priority badge.
 */
function PriorityBadge({ priority }) {
  const map = {
    High: "bg-red-500/10 text-red-500",
    Medium: "bg-yellow-400/10 text-yellow-500",
    Low: "bg-emerald-400/10 text-emerald-400",
  };
  const label = priority || "Low";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold ${map[label] || map.Low}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

/**
 * Status chip.
 */
function StatusChip({ completed }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium ${
        completed
          ? "bg-emerald-500/12 text-emerald-400"
          : "bg-sky-500/8 text-sky-400"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {completed ? "Completed" : "Pending"}
    </span>
  );
}

/**
 * Toast notification.
 */
function Toast({ message, type = "success" }) {
  if (!message) return null;
  const base =
    "fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-2xl px-4 py-2 text-xs shadow-soft backdrop-blur animate-scale-in";
  const color =
    type === "error"
      ? "bg-red-500/95 text-white"
      : type === "info"
      ? "bg-slate-900/95 text-white"
      : "bg-emerald-500/95 text-white";
  return (
    <div className={`${base} ${color}`}>
      <span>✦</span>
      <span>{message}</span>
    </div>
  );
}

/**
 * Main App component: enhanced layout and interactions.
 */
function AppInner() {
  const [tasks, setTasks] = useState(loadInitialTasks);
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [toast, setToast] = useState(null);

  const restoreFocusRef = useRef(null);

  // Persist tasks
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  const editingTask =
    editingTaskId && tasks.find((t) => t.id === editingTaskId);
  const taskToDelete =
    deleteTaskId && tasks.find((t) => t.id === deleteTaskId);

  const visibleTasks = useMemo(
    () =>
      selectVisibleTasks(tasks, {
        status: statusFilter,
        priority: priorityFilter,
        query,
      }),
    [tasks, statusFilter, priorityFilter, query]
  );

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.clearTimeout(showToast._tid);
    showToast._tid = window.setTimeout(() => {
      setToast(null);
    }, 1800);
  };

  const handleAddTask = (draft) => {
    const now = new Date().toISOString();
    const next = {
      id: genId(),
      title: draft.title.trim(),
      description: draft.description?.trim() || "",
      priority: draft.priority,
      dueDate: draft.dueDate || "",
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
    const errors = validateTask(next);
    if (Object.keys(errors).length) return;
    setTasks((prev) => [next, ...prev]);
    showToast("Task added");
  };

  const handleToggleComplete = (id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
    showToast("Task status updated", "info");
  };

  const handleEditRequest = (id, target) => {
    restoreFocusRef.current = target;
    setEditingTaskId(id);
  };

  const handleEditSave = (updated) => {
    const errors = validateTask(updated);
    if (Object.keys(errors).length) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === updated.id
          ? {
              ...t,
              title: updated.title.trim(),
              description: updated.description?.trim() || "",
              priority: updated.priority,
              dueDate: updated.dueDate || "",
              completed: updated.completed,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
    setEditingTaskId(null);
    if (restoreFocusRef.current?.focus) {
      restoreFocusRef.current.focus();
    }
    restoreFocusRef.current = null;
    showToast("Task updated");
  };

  const handleEditCancel = () => {
    setEditingTaskId(null);
    if (restoreFocusRef.current?.focus) {
      restoreFocusRef.current.focus();
    }
    restoreFocusRef.current = null;
  };

  const handleDeleteRequest = (id, target) => {
    restoreFocusRef.current = target;
    setDeleteTaskId(id);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTaskId) return;
    setTasks((prev) => prev.filter((t) => t.id !== deleteTaskId));
    setDeleteTaskId(null);
    if (restoreFocusRef.current?.focus) {
      restoreFocusRef.current.focus();
    }
    restoreFocusRef.current = null;
    showToast("Task deleted", "info");
  };

  const handleDeleteCancel = () => {
    setDeleteTaskId(null);
    if (restoreFocusRef.current?.focus) {
      restoreFocusRef.current.focus();
    }
    restoreFocusRef.current = null;
  };

  return (
    <AppShell>
      <HeaderBar />

      {/* Task creation card */}
      <section
        aria-label="Add new task"
        className="rounded-2xl bg-surface-light/90 dark:bg-surface-dark/90 shadow-soft backdrop-blur px-4 py-4 md:px-6 md:py-5 space-y-3 animate-fade-in-up"
      >
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          New Task
        </h2>
        <TaskFormEnhanced onSubmit={handleAddTask} />
      </section>

      {/* Filters + search toolbar */}
      <section className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between animate-fade-in-up">
        <SearchBar value={query} onChange={setQuery} />
        <FilterBar
          status={statusFilter}
          priority={priorityFilter}
          onStatusChange={setStatusFilter}
          onPriorityChange={setPriorityFilter}
        />
      </section>

      {/* Task list */}
      <section
        aria-label="Tasks"
        className="mt-4 space-y-3 animate-fade-in-up"
      >
        {tasks.length === 0 ? (
          <EmptyState />
        ) : visibleTasks.length === 0 ? (
          <NoResultsState />
        ) : (
          <div className="grid gap-3">
            {visibleTasks.map((task, index) => (
              <TaskCardEnhanced
                key={task.id}
                task={task}
                index={index}
                onToggle={handleToggleComplete}
                onEdit={handleEditRequest}
                onDelete={handleDeleteRequest}
              />
            ))}
          </div>
        )}
      </section>

      {/* Edit modal */}
      {editingTask && (
        <EditModal
          task={editingTask}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
        />
      )}

      {/* Delete confirm modal */}
      {taskToDelete && (
        <ConfirmDeleteModal
          taskTitle={taskToDelete.title}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}

      <Toast message={toast?.message} type={toast?.type} />
    </AppShell>
  );
}

/**
 * Enhanced task form using floating inputs.
 */
function TaskFormEnhanced({ onSubmit }) {
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    priority: "Low",
    dueDate: "",
  });

  const errors = useMemo(() => validateTask(draft), [draft]);
  const hasErrors = Object.keys(errors).length > 0;

  const update = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (hasErrors) return;
    onSubmit(draft);
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
      className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] md:items-start"
      noValidate
    >
      <div className="space-y-3">
        <FloatingInput
          id="task-title"
          label="Title"
          required
          value={draft.title}
          onChange={(e) => update("title", e.target.value)}
          error={errors.title}
        />
        <FloatingInput
          id="task-description"
          label="Description (optional)"
          value={draft.description}
          onChange={(e) => update("description", e.target.value)}
          error={errors.description}
        />
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1">
              Priority
            </label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-surface-light/90 px-3 py-2 text-xs text-slate-800 shadow-sm outline-none transition-all duration-200 focus:border-primary-soft focus:shadow-focus dark:bg-surface-dark/80 dark:border-slate-700 dark:text-slate-100"
              value={draft.priority}
              onChange={(e) => update("priority", e.target.value)}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
            {errors.priority && (
              <p className="mt-1 text-[10px] text-red-500">
                {errors.priority}
              </p>
            )}
          </div>
          <div>
            <label className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1">
              Due date
            </label>
            <input
              type="date"
              className="w-full rounded-xl border border-slate-200 bg-surface-light/90 px-3 py-2 text-xs text-slate-800 shadow-sm outline-none transition-all duration-200 focus:border-primary-soft focus:shadow-focus dark:bg-surface-dark/80 dark:border-slate-700 dark:text-slate-100"
              value={draft.dueDate}
              onChange={(e) => update("dueDate", e.target.value)}
            />
            {errors.dueDate && (
              <p className="mt-1 text-[10px] text-red-500">
                {errors.dueDate}
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end pt-1">
          <PrimaryButton
            type="submit"
            className={`px-5 ${
              hasErrors ? "opacity-60 cursor-not-allowed" : ""
            }`}
            disabled={hasErrors}
          >
            Add Task
          </PrimaryButton>
        </div>
      </div>
    </form>
  );
}

/**
 * Search bar with icon.
 */
function SearchBar({ value, onChange }) {
  return (
    <div className="w-full md:w-2/5">
      <label
        htmlFor="task-search"
        className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1"
      >
        Search
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          🔍
        </span>
        <input
          id="task-search"
          type="search"
          className="w-full rounded-xl border border-slate-200 bg-surface-light/90 pl-8 pr-3 py-2 text-xs text-slate-800 shadow-sm outline-none transition-all duration-200 focus:border-primary-soft focus:shadow-focus dark:bg-surface-dark/80 dark:border-slate-700 dark:text-slate-100"
          placeholder="Search tasks by title..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

/**
 * Filter pills for status and priority.
 */
function FilterBar({
  status,
  priority,
  onStatusChange,
  onPriorityChange,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 md:justify-end">
      <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500 mr-1">
        Status
      </span>
      {["All", "Pending", "Completed"].map((s) => (
        <FilterPill
          key={s}
          active={status === s}
          onClick={() => onStatusChange(s)}
        >
          {s}
        </FilterPill>
      ))}
      <span className="ml-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        Priority
      </span>
      {["All", "Low", "Medium", "High"].map((p) => (
        <FilterPill
          key={p}
          active={priority === p}
          onClick={() => onPriorityChange(p)}
        >
          {p}
        </FilterPill>
      ))}
    </div>
  );
}

/**
 * Task card with animated entrance.
 */
function TaskCardEnhanced({
  task,
  index,
  onToggle,
  onEdit,
  onDelete,
}) {
  const translateDelay = `${40 + index * 18}ms`;
  const baseCard =
    "relative overflow-hidden rounded-2xl bg-surface-light/95 dark:bg-surface-dark/95 border border-slate-100/80 dark:border-slate-800/80 shadow-soft px-4 py-3 md:px-5 md:py-4 flex flex-col gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-focus";
  return (
    <article
      className={baseCard}
      style={{ animation: `fade-in-up 260ms ease-out`, animationDelay: translateDelay, animationFillMode: "backwards" }}
      aria-label={`Task: ${task.title}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3
            className={`text-sm font-semibold tracking-tight ${
              task.completed
                ? "text-slate-500 line-through"
                : "text-slate-900 dark:text-slate-50"
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              {task.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <PriorityBadge priority={task.priority} />
            <StatusChip completed={task.completed} />
            <span className="text-[9px] text-slate-500">
              Due: {formatDueDate(task.dueDate)}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <GhostButton
            onClick={(e) => onToggle(task.id, e.currentTarget)}
            className="text-[9px] px-2 py-1"
          >
            {task.completed ? "Mark Pending" : "Mark Done"}
          </GhostButton>
          <GhostButton
            onClick={(e) => onEdit(task.id, e.currentTarget)}
            className="text-[9px] px-2 py-1"
          >
            Edit
          </GhostButton>
          <DangerButton
            onClick={(e) => onDelete(task.id, e.currentTarget)}
            className="text-[9px] px-2 py-1"
          >
            Delete
          </DangerButton>
        </div>
      </div>
    </article>
  );
}

/**
 * Edit modal with blur/fade/scale.
 */
function EditModal({ task, onSave, onCancel }) {
  const [draft, setDraft] = useState({ ...task });
  const dialogRef = useRef(null);

  useEffect(() => {
    setDraft({ ...task });
  }, [task]);

  const errors = useMemo(() => validateTask(draft), [draft]);
  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    const first = dialogRef.current?.querySelector(
      "input, textarea, select, button"
    );
    first && first.focus();
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () =>
      document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  const stop = (e) => e.stopPropagation();

  const update = (field, value) =>
    setDraft((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (hasErrors) return;
    onSave(draft);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 backdrop-blur-sm animate-fade-in-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-task-heading"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        onClick={stop}
        className="w-full max-w-md rounded-2xl bg-surface-light/100 dark:bg-surface-dark/100 border border-slate-100/70 dark:border-slate-700/70 p-5 shadow-soft animate-scale-in"
      >
        <h2
          id="edit-task-heading"
          className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2"
        >
          Edit Task
        </h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-3"
          noValidate
        >
          <FloatingInput
            id="edit-title"
            label="Title"
            required
            value={draft.title}
            onChange={(e) => update("title", e.target.value)}
            error={errors.title}
          />
          <FloatingInput
            id="edit-description"
            label="Description"
            value={draft.description || ""}
            onChange={(e) =>
              update("description", e.target.value)
            }
            error={errors.description}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1">
                Priority
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-surface-light/90 px-3 py-2 text-xs text-slate-800 shadow-sm outline-none transition-all duration-200 focus:border-primary-soft focus:shadow-focus dark:bg-surface-dark/80 dark:border-slate-700 dark:text-slate-100"
                value={draft.priority}
                onChange={(e) =>
                  update("priority", e.target.value)
                }
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              {errors.priority && (
                <p className="mt-1 text-[10px] text-red-500">
                  {errors.priority}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1">
                Due date
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-200 bg-surface-light/90 px-3 py-2 text-xs text-slate-800 shadow-sm outline-none transition-all duration-200 focus:border-primary-soft focus:shadow-focus dark:bg-surface-dark/80 dark:border-slate-700 dark:text-slate-100"
                value={draft.dueDate || ""}
                onChange={(e) =>
                  update("dueDate", e.target.value)
                }
              />
              {errors.dueDate && (
                <p className="mt-1 text-[10px] text-red-500">
                  {errors.dueDate}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              id="edit-completed"
              type="checkbox"
              className="h-3 w-3 rounded border-slate-300 text-primary-soft focus:ring-primary-soft dark:bg-surface-dark/80 dark:border-slate-600"
              checked={!!draft.completed}
              onChange={(e) =>
                update("completed", e.target.checked)
              }
            />
            <label
              htmlFor="edit-completed"
              className="text-[10px] text-slate-600 dark:text-slate-300"
            >
              Mark as completed
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <GhostButton onClick={onCancel}>
              Cancel
            </GhostButton>
            <PrimaryButton
              type="submit"
              disabled={hasErrors}
              className={
                hasErrors
                  ? "opacity-60 cursor-not-allowed"
                  : ""
              }
            >
              Save changes
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Delete confirmation modal.
 */
function ConfirmDeleteModal({
  taskTitle,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const first = dialogRef.current?.querySelector("button");
    first && first.focus();
  }, []);

  const stop = (e) => e.stopPropagation();

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () =>
      document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-heading"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        onClick={stop}
        className="w-full max-w-sm rounded-2xl bg-surface-light/100 dark:bg-surface-dark/100 border border-red-500/40 p-5 shadow-soft animate-scale-in"
      >
        <h2
          id="confirm-delete-heading"
          className="text-sm font-semibold text-red-500 mb-1"
        >
          Delete task?
        </h2>
        <p className="text-[11px] text-slate-600 dark:text-slate-300">
          Are you sure you want to delete "{taskTitle}"?
          This cannot be undone.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <GhostButton onClick={onCancel}>
            Cancel
          </GhostButton>
          <DangerButton onClick={onConfirm}>
            Delete
          </DangerButton>
        </div>
      </div>
    </div>
  );
}

/**
 * Empty / no-results states.
 */
function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300/80 bg-surface-light/70 px-4 py-5 text-center text-[11px] text-slate-500 shadow-soft dark:bg-surface-dark/70 dark:border-slate-600 animate-fade-in-up">
      Start by creating your first task above. Keep it short, focused, and actionable.
    </div>
  );
}

function NoResultsState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300/80 bg-surface-light/70 px-4 py-5 text-center text-[11px] text-slate-500 shadow-soft dark:bg-surface-dark/70 dark:border-slate-600 animate-fade-in-up">
      No tasks match your current filters. Try adjusting status, priority, or search.
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

export default App;