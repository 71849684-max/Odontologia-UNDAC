import React, { useState, useEffect } from 'react';

export default function PacienteForm({ paciente = null, onCancel, onSave }) {
    const [form, setForm] = useState({
        id: '', codigo: '', nombres: '', apellidoPaterno: '', apellidoMaterno: '', tipoDocumento: 'DNI', numeroDocumento: '', fechaNacimiento: '', sexo: 'F', telefono: '', correo: '', direccion: '', ocupacion: '', observaciones: '', estado: 'Activo',
    });
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});

    useEffect(() => {
        if (paciente) setForm((f) => ({ ...f, ...paciente }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paciente]);

    function cambiar(e) {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    }

    function validar() {
        const err = {};
        if (!form.nombres) err.nombres = 'Requerido';
        if (!form.numeroDocumento) err.numeroDocumento = 'Requerido';
        return err;
    }

    function guardar() {
        const v = validar();
        setErrores(v);
        if (Object.keys(v).length) return;
        setGuardando(true);
        setTimeout(() => {
            const result = { ...form };
            if (!result.id) result.id = 'p-' + Date.now();
            if (!result.codigo) result.codigo = 'P-' + Math.floor(Math.random() * 90000 + 10000);
            setGuardando(false);
            if (onSave) onSave(result);
        }, 600);
    }

    return (
        <div className="paciente-form">
            <h3>{form.id ? 'Editar paciente' : 'Nuevo paciente'}</h3>
            <div className="form-grid">
                <label> Nombres <input name="nombres" value={form.nombres} onChange={cambiar} /></label>
                <label> Apellido paterno <input name="apellidoPaterno" value={form.apellidoPaterno} onChange={cambiar} /></label>
                <label> Apellido materno <input name="apellidoMaterno" value={form.apellidoMaterno} onChange={cambiar} /></label>
                <label> Tipo documento <select name="tipoDocumento" value={form.tipoDocumento} onChange={cambiar}><option>DNI</option><option>CE</option><option>PAS</option></select></label>
                <label> Número documento <input name="numeroDocumento" value={form.numeroDocumento} onChange={cambiar} /></label>
                <label> Fecha de nacimiento <input type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={cambiar} /></label>
                <label> Sexo <select name="sexo" value={form.sexo} onChange={cambiar}><option value="F">F</option><option value="M">M</option><option value="O">Otro</option></select></label>
                <label> Teléfono <input name="telefono" value={form.telefono} onChange={cambiar} /></label>
                <label> Correo <input name="correo" value={form.correo} onChange={cambiar} /></label>
                <label> Dirección <input name="direccion" value={form.direccion} onChange={cambiar} /></label>
                <label> Ocupación <input name="ocupacion" value={form.ocupacion} onChange={cambiar} /></label>
                <label className="full"> Observaciones <textarea name="observaciones" value={form.observaciones} onChange={cambiar} /></label>
            </div>
            <div className="acciones-form">
                <button type="button" onClick={onCancel}>Cancelar</button>
                <button type="button" onClick={guardar} disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar'}</button>
            </div>
            {Object.keys(errores).length > 0 && <div className="errores"><ul>{Object.entries(errores).map(([k,v]) => <li key={k}>{v}</li>)}</ul></div>}
        </div>
    );
}
