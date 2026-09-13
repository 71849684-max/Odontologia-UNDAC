import React from 'react';
import { Eye, Eraser } from 'lucide-react';

// Iconos de las herramientas; no sustituyen los símbolos clínicos del odontograma.
export default function IconoHerramienta({ type }) {
  if (type === 'inspect') return <Eye size={20} aria-hidden="true" />;
  if (type === 'erase') return <Eraser size={20} aria-hidden="true" />;
  const tooth = 'M12 5C9 3 5 3 5 8c0 3 1 4 2 8 .5 3 1 5 2.5 5S10 15 12 15s1 6 2.5 6S17 19 17 16c1-4 2-5 2-8 0-5-4-5-7-3Z';
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {type === 'extracted' ? <>
      <path d="M5 10c0 3 1 4 2 7 .5 3 1 4 2.5 4S10 16 12 16s1 5 2.5 5S17 20 17 17c1-3 2-4 2-7" />
      <path d="M12 12V2m-4 4 4-4 4 4" />
    </> : <>
      <path d={tooth} strokeDasharray={type === 'absent' ? '2 3' : undefined} />
      {type === 'caries' && <circle cx="12" cy="9" r="2.3" fill="currentColor" stroke="none" />}
      {type === 'restoration' && <path d="M9 10h6m-3-3v6" strokeWidth="2.3" />}
      {type === 'absent' && <path d="M8 10h8" strokeWidth="2.3" />}
      {type === 'fracture' && <path d="m13 4-3 5 4 2-3 5" />}
      {type === 'sealant' && <><path d="m12 7-4 1v3c0 2 4 4 4 4s4-2 4-4V8Z" /><path d="m10 10 1.4 1.5 2.6-3" strokeWidth="1.3" /></>}
    </>}
  </svg>;
}
