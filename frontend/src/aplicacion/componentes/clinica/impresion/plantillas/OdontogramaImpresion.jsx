import React, { useMemo } from 'react';
import DocumentoSeccion from '../DocumentoSeccion.jsx';
import { Bloque, Nota, Tabla } from '../primitivas.jsx';
import { CompactTooth } from '../../../../formularios/odontograma/GraficoOdontograma.jsx';
import { arches, createEmptyOdontogram, markCode, odontogramStates, stateFor, temporaryArches } from '../../../../formularios/odontograma/odontograma.config.mjs';
import { createRecord, readRecord, toothFindings } from '../../../../formularios/odontograma/odontogramaRegistro.mjs';

function leerRegistro(formData, history) {
  const codigo = history?.codigo || 'sin-historia';
  const remoto = formData?.odontograma?.registro ?? null;
  let local = null;
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage?.getItem(`undac:odontograma:nts188:v1:${codigo}`) : null;
    if (raw) local = readRecord(raw, codigo);
  } catch {
    local = null;
  }
  if (local && remoto) return String(local.savedAt ?? '') >= String(remoto.savedAt ?? '') ? local : remoto;
  if (local || remoto) return local ?? remoto;
  return createRecord(codigo);
}

function Arcada({ titulo, dientes, examen }) {
  const vacios = createEmptyOdontogram();
  return <section className="doc-odontograma-arcada">
    <h4>{titulo}</h4>
    <div className="doc-odontograma-fila">
      {dientes.map((numero) => {
        const diente = examen.teeth?.[numero] ?? vacios[numero];
        const marcas = toothFindings(diente);
        return <div className="doc-odontograma-pieza" key={numero}>
          <strong>{numero}</strong>
          <CompactTooth number={numero} tooth={diente} interactive={false} />
          <div className="doc-odontograma-codigos">
            {marcas.map((marca) => <span key={marca.id}>{markCode(marca) || stateFor(marca.state).symbol}</span>)}
          </div>
        </div>;
      })}
    </div>
  </section>;
}

export default function OdontogramaImpresion({ values = {}, datos, formData = {}, history = {} }) {
  const registro = useMemo(() => leerRegistro(formData, history), [formData, history]);
  const examen = registro?.examinations?.at(-1) ?? { teeth: createEmptyOdontogram(), ranges: [] };
  const hallazgos = [];
  Object.entries(examen.teeth ?? {}).forEach(([numero, diente]) => {
    toothFindings(diente).forEach((marca) => {
      hallazgos.push([
        numero,
        stateFor(marca.state).label,
        markCode(marca) || stateFor(marca.state).symbol,
        marca.condition === 'bad' ? 'Mal estado' : 'Buen estado',
        marca.note,
      ]);
    });
  });
  (examen.ranges ?? []).forEach((marca) => {
    hallazgos.push([
      marca.teeth.join(', '),
      stateFor(marca.state).label,
      markCode(marca) || stateFor(marca.state).symbol,
      marca.condition === 'bad' ? 'Mal estado' : 'Buen estado',
      marca.note,
    ]);
  });

  return <DocumentoSeccion titulo="Odontograma digital" datos={datos}>
    <div className="doc-odontograma-meta">
      <div><span>Fecha de evaluación</span><strong>{examen.date || '—'}</strong></div>
      <div><span>Profesional responsable</span><strong>{examen.professional || '—'}</strong></div>
      <div><span>C.O.P.</span><strong>{examen.cop || '—'}</strong></div>
      <div><span>Motivo</span><strong>{examen.reason || '—'}</strong></div>
    </div>

    <Bloque titulo="Dentición permanente">
      <Arcada titulo="Arcada superior" dientes={arches.superior} examen={examen} />
      <Arcada titulo="Arcada inferior" dientes={arches.inferior} examen={examen} />
    </Bloque>

    <Bloque titulo="Dentición temporal">
      <Arcada titulo="Arcada superior temporal" dientes={temporaryArches.superior} examen={examen} />
      <Arcada titulo="Arcada inferior temporal" dientes={temporaryArches.inferior} examen={examen} />
    </Bloque>

    <Bloque titulo="Hallazgos registrados">
      <Tabla
        columnas={['Pieza o región', 'Hallazgo', 'Código', 'Estado', 'Observaciones']}
        filas={hallazgos}
        vacio="Sin hallazgos registrados."
      />
    </Bloque>

    <Bloque titulo="Leyenda">
      <div className="doc-odontograma-leyenda">
        {odontogramStates.map((estado) => <span key={estado.id}><b>{estado.symbol}</b> {estado.label}</span>)}
      </div>
    </Bloque>

    {examen.observations ? <Nota>Observaciones: {examen.observations}</Nota> : null}
  </DocumentoSeccion>;
}
