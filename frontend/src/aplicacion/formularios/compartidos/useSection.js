export default function useSection(values, onChange) {
  const get = (key, fallback = '') => values?.[key] ?? fallback;
  const set = (key) => (value) => onChange?.(key, value);
  return { get, set };
}
