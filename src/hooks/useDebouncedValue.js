import { useEffect, useState } from 'react';

/** Returns `value` after it has been stable for `delayMs`. */
export function useDebouncedValue(value, delayMs = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}
