import React from 'react';

const TONOS = {
  'Borrador': 'neutro',
  'En proceso': 'clinico',
  'Pendiente de revisión': 'academico',
  'Observada': 'alerta',
  'Validada': 'exito',
  'Cerrada': 'oscuro',
};

export default function StatusBadge({ estado = 'Borrador' }) {
  const clase = TONOS[estado] ?? 'neutro';
  return <span className={`etiqueta-estado etiqueta-estado--${clase}`}>{estado}</span>;
}
