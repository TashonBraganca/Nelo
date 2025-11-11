/**
 * Generate a unique, stable ID for tasks.
 * Format: <timestamp>-<randomCounter>
 */
export function genId() {
  const ts = Date.now().toString();
  const counter = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${ts}-${counter}`;
}