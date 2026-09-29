import { useState } from 'react';

function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return '';
    const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const diferenciaMes = hoy.getMonth() - nacimiento.getMonth();
    if (diferenciaMes < 0 || (diferenciaMes === 0 && hoy.getDate() < nacimiento.getDate())) edad -= 1;
    return edad >= 0 ? edad : '';
}

export default function PacienteForm({ onCancel, onSave }) {
    const [form, setForm] = useState({
        nombres: '', apellidoPaterno: '', apellidoMaterno: '', tipoDocumento: 'DNI', numeroDocumento: '', fechaNacimiento: '', sexo: 'F', telefono: '', correo: '', direccion: '', ocupacion: '', observaciones: '',
    });
    const [errores, setErrores] = useState({});

    function cambiar(event) {
        const { name, value } = event.target;
        setForm((actual) => ({ ...actual, [name]: value }));
    }

    function guardar(crearHistoria = false) {
        const erroresActuales = {};
        if (!form.nombres.trim()) erroresActuales.nombres = 'Ingrese los nombres.';
        if (!form.apellidoPaterno.trim()) erroresActuales.apellidoPaterno = 'Ingrese el apellido paterno.';
        if (!form.numeroDocumento.trim()) erroresActuales.numeroDocumento = 'Ingrese el número de documento.';
        setErrores(erroresActuales);
        if (Object.keys(erroresActuales).length) return;

        const nombres = [form.nombres, form.apellidoPaterno, form.apellidoMaterno]
            .map((parte) => parte.trim())
            .filter(Boolean)
            .join(' ');
        onSave?.({
            ...form,
            id: `local-${Date.now()}`,
            nombres,
            dni: form.numeroDocumento.trim(),
            edad: calcularEdad(form.fechaNacimiento),
            historias: 0,
            hc: '',
            ultimaAtencion: 'Sin atención',
            estado: 'Registrado',
        }, { crearHistoria });
    }

    return <form className="paciente-form" onSubmit={(event) => { event.preventDefault(); guardar(); }}>
        <div className="form-grid">
            <label>Nombres<input name="nombres" value={form.nombres} onChange={cambiar} aria-invalid={Boolean(errores.nombres)} /></label>
            <label>Apellido paterno<input name="apellidoPaterno" value={form.apellidoPaterno} onChange={cambiar} aria-invalid={Boolean(errores.apellidoPaterno)} /></label>
            <label>Apellido materno<input name="apellidoMaterno" value={form.apellidoMaterno} onChange={cambiar} /></label>
            <label>Tipo documento<select name="tipoDocumento" value={form.tipoDocumento} onChange={cambiar}><option>DNI</option><option>CE</option><option>PAS</option></select></label>
            <label>Número documento<input name="numeroDocumento" value={form.numeroDocumento} onChange={cambiar} inputMode="numeric" aria-invalid={Boolean(errores.numeroDocumento)} /></label>
            <label>Fecha de nacimiento<input type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={cambiar} /></label>
            <label>Sexo<select name="sexo" value={form.sexo} onChange={cambiar}><option value="F">F</option><option value="M">M</option><option value="O">Otro</option></select></label>
            <label>Teléfono<input name="telefono" value={form.telefono} onChange={cambiar} /></label>
            <label>Correo<input name="correo" value={form.correo} onChange={cambiar} /></label>
            <label>Dirección<input name="direccion" value={form.direccion} onChange={cambiar} /></label>
            <label>Ocupación<input name="ocupacion" value={form.ocupacion} onChange={cambiar} /></label>
            <label className="full">Observaciones<textarea name="observaciones" value={form.observaciones} onChange={cambiar} /></label>
        </div>
        {Object.keys(errores).length > 0 ? <div className="errores"><ul>{Object.entries(errores).map(([campo, mensaje]) => <li key={campo}>{mensaje}</li>)}</ul></div> : null}
        <div className="acciones-form">
            <button type="button" onClick={onCancel}>Cancelar</button>
            <button type="submit">Guardar paciente</button>
            <button type="button" onClick={() => guardar(true)}>Guardar paciente y crear historia clínica</button>
        </div>
    </form>;
}
