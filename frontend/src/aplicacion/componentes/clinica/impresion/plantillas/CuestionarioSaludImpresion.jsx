import React from 'react';
import DocumentoSeccion from '../DocumentoSeccion.jsx';
import { Bloque, Tabla } from '../primitivas.jsx';
import { healthQuestions } from '../../../../formularios/cuestionario-salud/cuestionario-salud.config.mjs';
import { preguntaVisible } from '../../logica/reglasClinicas.mjs';

function respuesta(valor) {
  if (valor === 'Sí') return '☒ Sí   ☐ No';
  if (valor === 'No') return '☐ Sí   ☒ No';
  return '☐ Sí   ☐ No';
}

export default function CuestionarioSaludImpresion({ values = {}, datos }) {
  const filas = healthQuestions
    .filter((pregunta) => preguntaVisible(pregunta.number, values))
    .map((pregunta) => {
      const numero = pregunta.number;
      const contestada = values[`q${numero}Answer`];
      return [
        String(numero).padStart(2, '0'),
        pregunta.text,
        respuesta(contestada),
        values[`q${numero}Detail`] || '',
        values[`q${numero}Extra`] || '',
      ];
    });

  return <DocumentoSeccion titulo="Cuestionario de salud" datos={datos}>
    <Bloque titulo="Antecedentes médicos" subtitulo="Marque la respuesta registrada para cada pregunta.">
      <Tabla
        columnas={['N.º', 'Pregunta', 'Respuesta', 'Detalle', 'Detalle adicional']}
        filas={filas}
        vacio="Sin preguntas registradas."
      />
    </Bloque>
  </DocumentoSeccion>;
}
