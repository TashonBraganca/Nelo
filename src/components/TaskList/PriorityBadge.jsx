import React from "react";

/**
 * PriorityBadge
 *
 * Visual badge for task priority.
 *
 * @param {{ priority: "Low" | "Medium" | "High" }} props
 */
function PriorityBadge({ priority }) {
  const base =
    "tm-badge";
  const map = {
    Low: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-red-100 text-red-800",
  };
  const color = map[priority] || map.Low;

  return (
    <span
      className={`${base} ${color}`}
      aria-label={`Priority: ${priority}`}
    >
      {priority}
    </span>
  );
}

export default PriorityBadge;