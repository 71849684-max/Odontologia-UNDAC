import { useEffect, useMemo, useState } from 'react';
import { KeyRound, Save, UserRound } from 'lucide-react';
import { actualizarPerfil, obtenerEstadoAcademico, sincronizarAcademico } from '../../servicios/servicioAcademico.js';
import { mensajeError } from '../../servicios/servicioClinico.js';
import { cambiarMiContrasena, guardarMiPerfil, obtenerMiPerfil, problemaContrasena } from '../../servicios/servicioCuenta.js';
import { formatearFecha } from '../../utilidades/fechas.mjs';
import { etiquetaCodigoRol } from '../../configuracion/etiquetasRoles.js';

function nombreSesion(usuario) {
  const partes = String(usuario?.nombre || '').replace(/^(Dr|Dra)\.\s*/i, '').trim().split(/\s+/).filter(Boolean);
  return { nombres: partes.shift() || '', apellidos: partes.join(' ') };
}

function prepararPerfil(estado, usuario, rol) {
  const usuarioId = String(usuario?.id ?? usuario?.nombre_usuario ?? 'actual');
  const guardado = estado.perfiles?.[usuarioId];
  if (guardado) return guardado;
  const nombre = nombreSesion(usuario);
  const nombreCompleto = `${nombre.nombres} ${nombre.apellidos}`.trim().toLocaleLowerCase();
  const persona = estado.personas.find((item) => item.documento === usuario?.documento)
    || estado.personas.find((item) => item.nombre.replace(/^(Dr|Dra)\.\s*/i, '').toLocaleLowerCase() === nombreCompleto);
  return {
    ...nombre,
    usuarioId,
    personaId: persona?.id,
    documento: usuario?.documento ?? persona?.documento ?? '',
    correo: usuario?.correo ?? '',
    telefono: '',
    roles: [rol],
  };
}

function seSuperponen(inicioA, finA, inicioB, finB) {
  return inicioA <= finB && (!finA || finA >= inicioB);
}

function detalleAsignaciones(estado, perfil) {
  const persona = estado.personas.find((item) => item.id === perfil.personaId)
    || estado.personas.find((item) => item.documento === perfil.documento);
  if (!persona) return [];
  const membresias = estado.membresias.filter((item) => item.personaId === persona.id);
  const rotacionesAlumno = membresias.flatMap((membresia) => estado.rotaciones.filter((rotacion) => (
    rotacion.grupoId === membresia.grupoId
    && seSuperponen(membresia.fechaInicio, membresia.fechaFin, rotacion.fechaInicio, rotacion.fechaFin)
  )).map((rotacion) => ({ membresia, rotacion })));
  const rotacionesDocente = estado.docentesRotacion
    .filter((item) => item.personaId === persona.id)
    .map((asignacion) => ({ rotacion: estado.rotaciones.find((item) => item.id === asignacion.rotacionId) }))
    .filter((item) => item.rotacion);
  const rotacionesExcepcionales = (estado.asignacionesExcepcionales || [])
    .filter((item) => item.personaId === persona.id)
    .map((asignacion) => ({ rotacion: estado.rotaciones.find((item) => item.id === asignacion.rotacionId) }))
    .filter((item) => item.rotacion);

  return [...rotacionesAlumno, ...rotacionesDocente, ...rotacionesExcepcionales]
    .map(({ rotacion }) => {
      const grupo = estado.grupos.find((item) => item.id === rotacion.grupoId);
      return {
        id: `${persona.id}-${rotacion.id}`,
        grupo: grupo?.nombre || grupo?.codigo || 'Grupo',
        curso: estado.cursos.find((item) => item.id === rotacion.cursoId)?.nombre || 'Curso',
        periodo: estado.periodos.find((item) => item.id === rotacion.periodoId)?.codigo || 'Periodo',
        vigencia: `${formatearFecha(rotacion.fechaInicio) || '—'} — ${formatearFecha(rotacion.fechaFin) || '—'}`,
        actual: rotacion.estado === 'activa',
      };
    })
    .filter((item, indice, items) => items.findIndex((otro) => otro.id === item.id) === indice);
}

function desdeServidor(perfil, previo) {
  return {
    ...previo,
    nombres: perfil.nombres ?? previo.nombres,
    apellidos: perfil.apellidos ?? previo.apellidos,
    documento: perfil.numero_documento ?? previo.documento,
    correo: perfil.correo ?? '',
    telefono: perfil.telefono ?? '',
    roles: perfil.codigo_rol ? [perfil.codigo_rol] : previo.roles,
  };
}

const CLAVE_VACIA = { actual: '', nueva: '', confirmacion: '' };

function CambioContrasena() {
  const [claves, setClaves] = useState(CLAVE_VACIA);
  const [estado, setEstado] = useState({ tipo: '', texto: '' });
  const [enviando, setEnviando] = useState(false);

  function change(campo, valor) {
    setEstado({ tipo: '', texto: '' });
    setClaves((actual) => ({ ...actual, [campo]: valor }));
  }

  async function enviar(event) {
    event.preventDefault();
    const problema = problemaContrasena(claves.nueva)
      || (claves.nueva !== claves.confirmacion ? 'La confirmación no coincide con la nueva contraseña.' : '');
    if (problema) {
      setEstado({ tipo: 'error', texto: problema });
      return;
    }
    setEnviando(true);
    try {
      await cambiarMiContrasena(claves);
      setClaves(CLAVE_VACIA);
      setEstado({ tipo: 'ok', texto: 'Contraseña actualizada' });
    } catch (error) {
      setEstado({ tipo: 'error', texto: mensajeError(error, 'No se pudo cambiar la contraseña.') });
    } finally {
      setEnviando(false);
    }
  }

  return <section className="hc-panel-card hc-profile-card" aria-labelledby="perfil-clave">
    <div className="hc-profile-card__identity">
      <span><KeyRound size={24} aria-hidden="true" /></span>
      <div><strong>Seguridad</strong><small>Mínimo 8 caracteres, con letras y números.</small></div>
    </div>
    <div className="hc-profile-card__content">
      <header><h2 id="perfil-clave">Cambiar contraseña</h2></header>
      <form className="hc-profile-form" onSubmit={enviar}>
        <label>Contraseña actual<input type="password" autoComplete="current-password" maxLength={255} value={claves.actual} onChange={(event) => change('actual', event.target.value)} required /></label>
        <label>Nueva contraseña<input type="password" autoComplete="new-password" maxLength={255} value={claves.nueva} onChange={(event) => change('nueva', event.target.value)} required /></label>
        <label>Confirmar nueva contraseña<input type="password" autoComplete="new-password" maxLength={255} value={claves.confirmacion} onChange={(event) => change('confirmacion', event.target.value)} required /></label>
        <div className="hc-profile-form__actions">
          {estado.texto && <span role={estado.tipo === 'error' ? 'alert' : 'status'}>{estado.texto}</span>}
          <button type="submit" className="hc-button hc-button--primary" disabled={enviando}><KeyRound size={16} /> {enviando ? 'Actualizando…' : 'Cambiar contraseña'}</button>
        </div>
      </form>
    </div>
  </section>;
}

export default function PerfilApp({ usuario, rol }) {
  const [estado, setEstado] = useState(() => obtenerEstadoAcademico());
  const [formulario, setFormulario] = useState(() => prepararPerfil(estado, usuario, rol));
  const [enServidor, setEnServidor] = useState(false);
  useEffect(() => {
    let vigente = true;
    sincronizarAcademico().then(() => { if (vigente) setEstado(obtenerEstadoAcademico()); }).catch(() => {});
    obtenerMiPerfil()
      .then((perfil) => {
        if (!vigente || !perfil) return;
        setEnServidor(true);
        setFormulario((actual) => desdeServidor(perfil, actual));
      })
      .catch(() => {});
    return () => { vigente = false; };
  }, []);
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);
  const asignaciones = useMemo(() => detalleAsignaciones(estado, formulario), [estado, formulario]);

  function change(campo, valor) {
    setMensaje('');
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  async function guardar(event) {
    event.preventDefault();
    setGuardando(true);
    try {
      if (enServidor) {
        const perfil = await guardarMiPerfil(formulario);
        setFormulario((actual) => desdeServidor(perfil, actual));
        // Caché local de presentación; no sustituye el guardado institucional.
        actualizarPerfil({ ...formulario, ...perfil, usuarioId: formulario.usuarioId });
        setEstado(obtenerEstadoAcademico());
        setMensaje('Perfil actualizado');
      } else {
        actualizarPerfil(formulario);
        setEstado(obtenerEstadoAcademico());
        setMensaje('Perfil guardado solo en este equipo');
      }
    } catch (error) {
      setMensaje(mensajeError(error, 'No se pudo guardar el perfil.'));
    } finally {
      setGuardando(false);
    }
  }

  return <div className="hc-page hc-profile-page space-y-5">
    <header>
      <p className="hc-kicker">Cuenta</p>
      <h1 className="hc-page-title">Mi perfil</h1>
      <p className="hc-page-subtitle">Actualice sus datos personales y consulte sus asignaciones académicas.</p>
    </header>

    <section className="hc-panel-card hc-profile-card" aria-labelledby="perfil-datos">
      <div className="hc-profile-card__identity">
        <span><UserRound size={24} aria-hidden="true" /></span>
        <div>
          <strong>{formulario.nombres} {formulario.apellidos}</strong>
          <small>{(formulario.roles || [rol]).map((codigo) => etiquetaCodigoRol(codigo, codigo)).join(' · ')}</small>
          <small>{formulario.documento || 'Documento no registrado'}</small>
        </div>
      </div>
      <div className="hc-profile-card__content">
        <header>
          <h2 id="perfil-datos">Datos personales</h2>
          <p>Información de contacto asociada a su cuenta.</p>
        </header>
        <form className="hc-profile-form" onSubmit={guardar}>
          <label>Nombres<input value={formulario.nombres ?? ''} maxLength={100} onChange={(event) => change('nombres', event.target.value)} required /></label>
          <label>Apellidos<input value={formulario.apellidos ?? ''} maxLength={120} onChange={(event) => change('apellidos', event.target.value)} required /></label>
          <label>Documento<input value={formulario.documento || 'No registrado'} readOnly /></label>
          <label>Correo electrónico<input type="email" maxLength={150} value={formulario.correo ?? ''} onChange={(event) => change('correo', event.target.value)} /></label>
          <label>Teléfono<input type="tel" maxLength={30} pattern="[0-9+()\s\-]*" value={formulario.telefono ?? ''} onChange={(event) => change('telefono', event.target.value)} /></label>
          <div className="hc-profile-form__actions">
            {mensaje && <span role="status">{mensaje}</span>}
            <button type="submit" className="hc-button hc-button--primary" disabled={guardando}><Save size={16} /> Guardar cambios</button>
          </div>
        </form>
      </div>
    </section>

    {enServidor && <CambioContrasena />}

    <section className="hc-panel-card hc-profile-assignments" aria-labelledby="perfil-asignaciones">
      <header><h2 id="perfil-asignaciones">Asignaciones académicas</h2></header>
      {asignaciones.length === 0 ? <p>No hay asignaciones registradas para este usuario.</p> : (
        <div className="hc-table-card"><table className="hc-table"><thead><tr><th>Periodo</th><th>Curso</th><th>Grupo</th><th>Vigencia</th><th>Estado</th></tr></thead><tbody>
          {asignaciones.map((item) => <tr key={item.id}><td data-label="Periodo">{item.periodo}</td><td data-label="Curso">{item.curso}</td><td data-label="Grupo">{item.grupo}</td><td data-label="Vigencia">{item.vigencia}</td><td data-label="Estado">{item.actual ? 'Actual' : 'Histórica'}</td></tr>)}
        </tbody></table></div>
      )}
    </section>
  </div>;
}
