import React from "react";

/**
 * Simple application header.
 */
function Header() {
  return (
    <header className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
      <h1 className="text-2xl font-semibold text-slate-900">
        Task Manager
      </h1>
      <p className="text-sm text-slate-600">
        Add, track, and organize tasks with priorities and due dates.
      </p>
    </header>
  );
}

export default Header;