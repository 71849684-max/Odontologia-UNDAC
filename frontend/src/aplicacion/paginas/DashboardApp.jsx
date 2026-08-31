import React from 'react';
import { MOCK_PACIENTES } from '../configuracion/mockPacientes';
import { MOCK_HISTORIAS } from '../configuracion/mockHistorias';
import { MOCK_USUARIOS } from '../configuracion/mockUsuarios';
import ProgressCard from '../componentes/panel/ProgressCard';

export default function DashboardApp({ rol }) {
    // simple role-based sections
    return (
        <div className="dashboard-hc">
            <h2>Resumen</h2>
            <section className="indicadores">
                <article className="indicador"> <h3>Pacientes</h3> <p>{MOCK_PACIENTES.length}</p> </article>
                <article className="indicador"> <h3>Historias</h3> <p>{MOCK_HISTORIAS.length}</p> </article>
                <article className="indicador"> <h3>Usuarios</h3> <p>{MOCK_USUARIOS.length}</p> </article>
                <article className="indicador"> <h3>Pendientes</h3> <p>17</p> </article>
            </section>

            <section className="actividad-reciente">
                <h3>Actividad reciente</h3>
                <ul>
                    <li>Nueva historia clínica registrada · Hace 15 minutos</li>
                    <li>Historia enviada a revisión · Hace 32 minutos</li>
                    <li>Usuario actualizado · Hace 1 hora</li>
                    <li>Consentimiento registrado · Hace 2 horas</li>
                </ul>
            </section>

            <section className="progreso-historias">
                <h3>Historias en curso</h3>
                <div className="cartas-progreso">
                    {MOCK_HISTORIAS.map((h) => <ProgressCard key={h.id} historia={h} />)}
                </div>
            </section>
        </div>
    );
}
