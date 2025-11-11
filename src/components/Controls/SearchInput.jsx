import React from "react";

/**
 * SearchInput
 *
 * Presentational search box.
 *
 * @param {{ value: string, onChange: (value: string) => void }} props
 */
function SearchInput({ value, onChange }) {
  return (
    <div className="w-full md:w-1/2">
      <label
        htmlFor="task-search"
        className="block text-xs font-medium text-slate-700 mb-1"
      >
        Search by title
      </label>
      <input
        id="task-search"
        type="search"
        className="tm-input"
        placeholder="Type to filter tasks..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default SearchInput;