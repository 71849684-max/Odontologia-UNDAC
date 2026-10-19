import React from 'react';
import { CompactTooth } from './GraficoOdontograma.jsx';
import { rootSurfaceIds, superficiesDentales, surfaceName, toothSurfaces } from './odontograma.config.mjs';

/** Leyenda breve de las secciones, siempre visible bajo el odontograma. */
export function LeyendaSuperficies() {
  return (
    <p className="nts-surface-legend" aria-label="Leyenda de superficies del diente">
      {toothSurfaces.map((surface) => (
        <span key={surface.id}><b>{surface.short}</b> {surface.label}</span>
      ))}
      {rootSurfaceIds.map((id) => (
        <span key={id}><b>{{ raiz: 'R', 'raiz-mesial': 'RM', 'raiz-distal': 'RD', 'raiz-palatina': 'RP' }[id]}</b> {surfaceName(id)}</span>
      ))}
    </p>
  );
}

/**
 * Guía de caras y superficies: dos piezas ampliadas con el nombre de cada
 * sección y la nomenclatura completa (mesial, distal, vestibular, proximal…).
 */
export default function GuiaSuperficies({ molar, incisivo }) {
  return (
    <details className="nts-surface-guide nts-no-print">
      <summary>Superficies y caras del diente (guía con nombres)</summary>
      <div className="nts-surface-guide__body">
        <div className="nts-surface-guide__figuras">
          <figure>
            <CompactTooth number="16" tooth={molar} interactive={false} showLabels ariaLabel="Guía de superficies: molar 16" />
            <figcaption>Molar superior (16): caras de la corona y raíces mesial, palatina y distal.</figcaption>
          </figure>
          <figure>
            <CompactTooth number="11" tooth={incisivo} interactive={false} showLabels ariaLabel="Guía de superficies: incisivo 11" />
            <figcaption>Incisivo superior (11): caras de la corona y su raíz.</figcaption>
          </figure>
        </div>
        <dl className="nts-surface-guide__definiciones">
          {superficiesDentales.map((item) => (
            <div key={`${item.term}-${item.surface || 'proximal'}`}>
              <dt>{item.term}{item.short ? <b>{item.short}</b> : null}</dt>
              <dd>{item.desc}</dd>
            </div>
          ))}
        </dl>
      </div>
    </details>
  );
}
