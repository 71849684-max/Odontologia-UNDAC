import { useMemo, useState } from 'react';
import { Save, UserRound } from 'lucide-react';
import { actualizarPerfil, obtenerEstadoAcademico } from '../../servicios/repositorioAcademicoLocal.js';

function nombreSesion(usuario) {
  const partes = String(usuario?.nombre || '').replace(/^(Dr|Dra)\.\s*/i, '').trim().split(/\s+/).filter(Boolean);
  return { nombres: partes.shift() || '', apellidos: partes.join(' ') };
}

function prepararPerfil(estado, usuario, rol) {
  const usuarioId = String(usuario?.id ?? usuario?.nombre_usuario ?? 'actual');
  if (String(estado.perfil.usuarioId ?? '') === usuarioId) return estado.perfil;
  return {
    ...estado.perfil,
    ...nombreSesion(usuario),
    usuarioId,
    documento: usuario?.documento ?? '',
    correo: '',
    telefono: '',
    roles: [rol],
  };
}

function detalleAsignaciones(estado, documento) {
  const persona = estado.personas.find((item) => item.documento === documento);
  if (!persona) return [];
  return estado.membresias
    .filter((item) => item.personaId === persona.id)
    .map((membresia) => {
      const grupo = estado.grupos.find((item) => item.id === membresia.grupoId);
      const rotaciones = estado.rotaciones.filter((item) => item.grupoId === membresia.grupoId);
      return rotaciones.map((rotacion) => ({
        id: `${membresia.id}-${rotacion.id}`,
        grupo: grupo?.nombre || grupo?.codigo || 'Grupo',
        curso: estado.cursos.find((item) => item.id === rotacion.cursoId)?.nombre || 'Curso',
        periodo: estado.periodos.find((item) => item.id === rotacion.periodoId)?.codigo || 'Periodo',
        vigencia: `${rotacion.fechaInicio} — ${rotacion.fechaFin}`,
        actual: rotacion.estado === 'activa',
      }));
    })
    .flat();
}

export default function PerfilApp({ usuario, rol }) {
  const [estado, setEstado] = useState(() => obtenerEstadoAcademico());
  const [formulario, setFormulario] = useState(() => prepararPerfil(estado, usuario, rol));
  const [mensaje, setMensaje] = useState('');
  const asignaciones = useMemo(() => detalleAsignaciones(estado, formulario.documento), [estado, formulario.documento]);

  function change(campo, valor) {
    setMensaje('');
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  function guardar(event) {
    event.preventDefault();
    actualizarPerfil(formulario);
    setEstado(obtenerEstadoAcademico());
    setMensaje('Perfil actualizado');
  }

  return <div className="hc-page hc-profile-page space-y-5">
    <header>
      <p className="hc-kicker">Cuenta</p>
      <h1 className="hc-page-title">Mi perfil</h1>
      <p className="hc-page-subtitle">Actualice sus datos personales y consulte sus asignaciones académicas.</p>
    </header>

    <section className="hc-panel-card hc-profile-card">
      <div className="hc-profile-card__identity">
        <span><UserRound size={24} aria-hidden="true" /></span>
        <div><strong>{formulario.nombres} {formulario.apellidos}</strong><small>{(formulario.roles || [rol]).join(' · ')}</small></div>
      </div>
      <form className="hc-profile-form" onSubmit={guardar}>
        <label>Nombres<input value={formulario.nombres ?? ''} onChange={(event) => change('nombres', event.target.value)} required /></label>
        <label>Apellidos<input value={formulario.apellidos ?? ''} onChange={(event) => change('apellidos', event.target.value)} required /></label>
        <label>Documento<input value={formulario.documento || 'No registrado'} readOnly /></label>
        <label>Correo electrónico<input type="email" value={formulario.correo ?? ''} onChange={(event) => change('correo', event.target.value)} /></label>
        <label>Teléfono<input type="tel" value={formulario.telefono ?? ''} onChange={(event) => change('telefono', event.target.value)} /></label>
        <div className="hc-profile-form__actions">
          {mensaje && <span role="status">{mensaje}</span>}
          <button type="submit" className="hc-button hc-button--primary"><Save size={16} /> Guardar cambios</button>
        </div>
      </form>
    </section>

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
