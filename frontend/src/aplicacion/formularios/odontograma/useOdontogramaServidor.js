import { useContext, useEffect, useRef, useState } from 'react';
import { GuardadosClinicosContext } from '../compartidos/GuardadosClinicosContext.js';
import { createRecord, readRecord } from './odontogramaRegistro.mjs';
import { guardarOdontograma, obtenerOdontograma, mensajeError } from '../../servicios/servicioClinico.js';

export default function useOdontogramaServidor(historia, paciente) {
  const registros = useContext(GuardadosClinicosContext);
  const clave = `odontograma:${historia}`;
  const existente = registros?.current.get(clave);
  const [registro, asignar] = useState(existente?.registro ?? null);
  const [error, setError] = useState(existente?.error ?? '');
  const [mensaje, setMensaje] = useState(existente?.mensaje ?? '');
  const [intento, setIntento] = useState(0);
  const entrada = useRef(existente ?? { registro: null, revision: null, confirmado: null, promesa: null });
  const activo = useRef(true);
  const temporizador = useRef(null);
  const pendiente = () => entrada.current.registro !== entrada.current.confirmado;
  entrada.current.notificar = datos => { if (activo.current) asignar(datos); };
  entrada.current.notificarEstado = (fallo, aviso) => {
    entrada.current.error = fallo;
    entrada.current.mensaje = aviso;
    if (activo.current) { setError(fallo); setMensaje(aviso); }
    registros?.notificar?.();
  };

  async function guardar() {
    if (!entrada.current.registro || entrada.current.cargando) return false;
    if (entrada.current.promesa) return entrada.current.promesa;
    if (!pendiente()) return true;
    if (entrada.current.cancelado) return false;
    entrada.current.promesa = (async () => {
      try {
        while (pendiente() && !entrada.current.cancelado) {
          const enviado = entrada.current.registro;
          if (!enviado) return false;
          entrada.current.notificarEstado('', 'Guardando en el servidor…');
          const respuesta = await guardarOdontograma(historia, { ...enviado, revisionServidor: entrada.current.revision });
          entrada.current.revision = respuesta.revisionServidor;
          if (entrada.current.cancelado) return false;
          const posteriores = entrada.current.registro !== enviado;
          const cerradoPorId = new Map((respuesta.examinations ?? []).filter(examen => examen.status === 'closed').map(examen => [examen.id, examen]));
          const actual = posteriores ? { ...entrada.current.registro, examinations: entrada.current.registro.examinations.map(examen => cerradoPorId.get(examen.id) ?? examen) } : respuesta;
          entrada.current.registro = actual;
          entrada.current.confirmado = posteriores ? enviado : actual;
          entrada.current.notificar(actual);
        }
        entrada.current.confirmadoEn = new Date().toISOString();
        entrada.current.notificarEstado('', 'Guardado en el servidor.');
        return true;
      } catch (fallo) {
        entrada.current.notificarEstado(mensajeError(fallo, 'No se pudo guardar. Los cambios siguen pendientes en esta sesión.'), 'Cambios sin guardar en el servidor.');
        return false;
      } finally { entrada.current.promesa = null; }
    })();
    return entrada.current.promesa;
  }

  entrada.current.descartar = () => { clearTimeout(temporizador.current); entrada.current.cancelado = true; entrada.current.registro = entrada.current.confirmado; };
  entrada.current.pendiente = pendiente;
  entrada.current.guardar = guardar;
  if (historia && registros) registros.current.set(clave, entrada.current);

  useEffect(() => {
    activo.current = true;
    if (!historia) return undefined;
    let vigente = true;
    if (!entrada.current.registro) {
      entrada.current.cargando = true;
      registros?.notificar?.();
      obtenerOdontograma(historia).then(respuesta => {
      if (!vigente) return;
      const datos = respuesta ? readRecord(JSON.stringify({ ...respuesta, patientId: String(paciente) }), paciente) : createRecord(paciente);
      entrada.current.revision = respuesta?.revisionServidor ?? null;
      entrada.current.registro = datos;
      entrada.current.confirmado = datos;
      entrada.current.cargando = false;
      entrada.current.error = '';
      asignar(datos); setError('');
      registros?.notificar?.();
    }).catch(fallo => {
      if (!vigente) return;
      entrada.current.cargando = false;
      entrada.current.error = mensajeError(fallo, 'No se pudo cargar el odontograma.');
      setError(entrada.current.error);
      registros?.notificar?.();
    });
    }
    return () => { vigente = false; activo.current = false; };
  }, [historia, paciente, intento]);

  useEffect(() => {
    if (!historia) return undefined;
    const proteger = evento => { if (pendiente()) { evento.preventDefault(); evento.returnValue = ''; } };
    window.addEventListener('beforeunload', proteger);
    return () => window.removeEventListener('beforeunload', proteger);
  }, [historia]);

  function cambiar(datos) {
    entrada.current.cancelado = false;
    entrada.current.registro = datos;
    asignar(datos); setMensaje('Cambios pendientes…');
    registros?.notificar?.();
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(guardar, 400);
    return true;
  }

  return { registro, error, mensaje, cambiar, guardar, cargar: () => setIntento(valor => valor + 1) };
}
