import { useState } from 'react';
import {
    BookOpenCheck,
    Eye,
    EyeOff,
    GraduationCap,
    HeartPulse,
    LockKeyhole,
} from 'lucide-react';
import MarcaInstitucional from '../componentes/interfaz/MarcaInstitucional';

const BENEFICIOS_INSTITUCIONALES = [
    { icono: HeartPulse, titulo: 'Atención clínica organizada', texto: 'Consulta la información del paciente desde un entorno claro y seguro.' },
    { icono: BookOpenCheck, titulo: 'Seguimiento académico', texto: 'Acompaña la práctica odontológica con supervisión docente.' },
    { icono: GraduationCap, titulo: 'Formación con propósito', texto: 'Tecnología al servicio de la enseñanza y la salud bucal.' },
];

const CUENTAS_DEMOSTRACION = {
    administrador: { nombre: 'Carlos Mendoza', rol: 'administrador' },
    docente: { nombre: 'Dra. Elena Salazar', rol: 'docente' },
    alumno: { nombre: 'María Quispe', rol: 'alumno' },
};

export function detectarPerfil(correo = '') {
    const identidad = correo.trim().toLowerCase();
    if (/admin|administrador/.test(identidad)) return CUENTAS_DEMOSTRACION.administrador;
    if (/docente|profesor|doctor|dra\.|dr\./.test(identidad)) return CUENTAS_DEMOSTRACION.docente;
    return CUENTAS_DEMOSTRACION.alumno;
}

export default function PaginaAcceso({ alIngresar }) {
    const [mostrarContrasena, establecerMostrarContrasena] = useState(false);
    const [correo, establecerCorreo] = useState('');

    function manejarEnvio(evento) {
        evento.preventDefault();
        alIngresar(detectarPerfil(correo));
    }

    return (
        <main className="pagina-acceso">
            <section className="acceso-identidad" aria-labelledby="titulo-acceso">
                <MarcaInstitucional inversa />
                <div className="acceso-identidad__contenido">
                    <p className="rotulo-acceso">Clínica Odontológica Universitaria</p>
                    <h1 id="titulo-acceso">Historia Clínica Digital</h1>
                    <p className="acceso-identidad__introduccion">
                        Un espacio institucional para integrar la atención clínica,
                        la práctica académica y el seguimiento responsable.
                    </p>
                    <div className="beneficios-acceso" aria-label="Beneficios del sistema">
                        {BENEFICIOS_INSTITUCIONALES.map(({ icono: Icono, titulo, texto }) => (
                            <article className="beneficio-acceso" key={titulo}>
                                <span className="beneficio-acceso__icono" aria-hidden="true"><Icono size={20} /></span>
                                <span><strong>{titulo}</strong><small>{texto}</small></span>
                            </article>
                        ))}
                    </div>
                </div>
                <p className="acceso-identidad__pie">Facultad de Ciencias de la Salud · UNDAC</p>
            </section>

            <section className="acceso-formulario" aria-label="Acceso al sistema">
                <div className="acceso-formulario__contenedor">
                    <div className="acceso-formulario__marca">
                        <span aria-hidden="true"><LockKeyhole size={22} /></span>
                        <p>Acceso institucional</p>
                    </div>
                    <div className="acceso-formulario__titulo">
                        <p className="rotulo-acceso">Bienvenido(a)</p>
                        <h2>Ingresa a tu cuenta</h2>
                        <p>Utiliza tus credenciales institucionales para continuar.</p>
                    </div>
                    <form className="formulario-acceso" onSubmit={manejarEnvio}>
                        <label className="campo-formulario">
                            <span>Correo institucional</span>
                            <input
                                type="email"
                                name="correo"
                                value={correo}
                                onChange={(evento) => establecerCorreo(evento.target.value)}
                                placeholder="nombre@undac.edu.pe"
                                autoComplete="email"
                            />
                        </label>
                        <label className="campo-formulario">
                            <span>Contraseña</span>
                            <span className="campo-contrasena">
                                <input
                                    type={mostrarContrasena ? 'text' : 'password'}
                                    name="contrasena"
                                    placeholder="Ingresa tu contraseña"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    onClick={() => establecerMostrarContrasena((estadoActual) => !estadoActual)}
                                >
                                    {mostrarContrasena ? <EyeOff size={19} /> : <Eye size={19} />}
                                </button>
                            </span>
                        </label>
                        <div className="perfil-automatico" role="note">
                            <span aria-hidden="true">✓</span>
                            <p><strong>Perfil automático</strong><small>El sistema identifica tu rol institucional a partir de tus credenciales.</small></p>
                        </div>
                        <div className="opciones-acceso">
                            <label><input type="checkbox" /><span>Recordarme</span></label>
                            <a href="#recuperar">¿Olvidaste tu contraseña?</a>
                        </div>
                        <button className="boton-ingreso" type="submit">Ingresar al sistema <span aria-hidden="true">→</span></button>
                    </form>
                    <div className="ayuda-acceso"><span aria-hidden="true">i</span><p>¿Necesitas asistencia? Comunícate con el soporte de la clínica odontológica.</p></div>
                </div>
                <p className="acceso-formulario__pie">© 2026 Universidad Nacional Daniel Alcides Carrión</p>
            </section>
        </main>
    );
}
