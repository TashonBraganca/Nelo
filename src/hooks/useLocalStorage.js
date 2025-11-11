import { useEffect } from "react";

/**
 * Persist a value to localStorage whenever it changes.
 * Assumes value is JSON-serializable.
 *
 * @param {string} key
 * @param {unknown} value
 */
export function useLocalStorageEffect(key, value) {
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Fail silently: storage may be unavailable.
    }
  }, [key, value]);
}