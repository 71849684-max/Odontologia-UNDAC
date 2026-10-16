import './acceso.css';
import { useState } from 'react';
import {
    BookOpenCheck,
    Eye,
    EyeOff,
    GraduationCap,
    HeartPulse,
    LockKeyhole,
} from 'lucide-react';
import MarcaInstitucional from '../../componentes/interfaz/MarcaInstitucional.jsx';

const BENEFICIOS_INSTITUCIONALES = [
    { icono: HeartPulse, titulo: 'Atención clínica organizada', texto: 'Consulta la información del paciente desde un entorno claro y seguro.' },
    { icono: BookOpenCheck, titulo: 'Seguimiento académico', texto: 'Acompaña la práctica odontológica con supervisión docente.' },
    { icono: GraduationCap, titulo: 'Formación con propósito', texto: 'Tecnología al servicio de la enseñanza y la salud bucal.' },
];

export default function PaginaAcceso({ alIngresar, enviando = false, error = null }) {
    const [mostrarContrasena, establecerMostrarContrasena] = useState(false);
    const [nombreUsuario, establecerNombreUsuario] = useState('');
    const [contrasena, establecerContrasena] = useState('');
    const [mostrarRecuperacion, establecerMostrarRecuperacion] = useState(false);

    function manejarEnvio(evento) {
        evento.preventDefault();
        if (enviando) return;
        alIngresar({ nombreUsuario, contrasena });
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
                            <span>Usuario</span>
                            <input
                                type="text"
                                name="nombre_usuario"
                                value={nombreUsuario}
                                onChange={(evento) => establecerNombreUsuario(evento.target.value)}
                                placeholder="Tu usuario institucional"
                                autoComplete="username"
                                autoCapitalize="none"
                                spellCheck="false"
                                maxLength={120}
                                required
                            />
                        </label>
                        <label className="campo-formulario">
                            <span>Contraseña</span>
                            <span className="campo-contrasena">
                                <input
                                    type={mostrarContrasena ? 'text' : 'password'}
                                    name="contrasena"
                                    value={contrasena}
                                    onChange={(evento) => establecerContrasena(evento.target.value)}
                                    placeholder="Ingresa tu contraseña"
                                    autoComplete="current-password"
                                    maxLength={255}
                                    required
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
                        {error && (
                            <p className="mensaje-acceso-error" role="alert">{error}</p>
                        )}
                        <div className="opciones-acceso">
                            <button
                                type="button"
                                className="enlace-acceso"
                                aria-expanded={mostrarRecuperacion}
                                aria-controls="recuperacion-acceso"
                                onClick={() => establecerMostrarRecuperacion((actual) => !actual)}
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                        {mostrarRecuperacion && (
                            <div id="recuperacion-acceso" className="recuperacion-acceso" role="status">
                                <strong>Recuperación de contraseña</strong>
                                <p>
                                    Por seguridad, las contraseñas solo las restablece la administración de la clínica.
                                    Acércate o escribe al administrador del sistema indicando tu usuario institucional;
                                    recibirás una contraseña temporal que podrás cambiar desde «Mi perfil».
                                </p>
                            </div>
                        )}
                        <button className="boton-ingreso" type="submit" disabled={enviando}>
                            {enviando ? 'Verificando…' : 'Ingresar al sistema'} <span aria-hidden="true">→</span>
                        </button>
                    </form>
                    <div className="ayuda-acceso"><span aria-hidden="true">i</span><p>¿Necesitas asistencia? Comunícate con el soporte de la clínica odontológica.</p></div>
                    <p className="acceso-formulario__pie">© 2026 Universidad Nacional Daniel Alcides Carrión</p>
                </div>
            </section>
        </main>
    );
}
