import React from 'react';
import { CheckCircle2, Circle, Clock3, Eye, ShieldCheck } from 'lucide-react';
import { SECTION_STATUS, statusLabel } from '../logica/clinicalStatus.mjs';

const ICONS = {
  [SECTION_STATUS.NOT_STARTED]: Circle,
  [SECTION_STATUS.IN_PROGRESS]: Clock3,
  [SECTION_STATUS.COMPLETE]: CheckCircle2,
  [SECTION_STATUS.REVIEW]: Eye,
  [SECTION_STATUS.APPROVED]: ShieldCheck,
};

export default function ClinicalStatusBadge({ status, compact = false }) {
  const Icon = ICONS[status] ?? Circle;
  return <span className={`clinical-status is-${status}${compact ? ' is-compact' : ''}`}><Icon size={compact ? 14 : 15} aria-hidden="true" />{compact ? null : statusLabel(status)}</span>;
}
