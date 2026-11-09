import { useLecturaClinica } from './LecturaClinicaContext.js';

export default function useSection(values, onChange) {
  const soloLectura = useLecturaClinica();
  const get = (key, fallback = '') => values?.[key] ?? fallback;
  const set = (key) => (value) => { if (!soloLectura) onChange?.(key, value); };
  return { get, set };
}
