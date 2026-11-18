import { Component, Suspense } from 'react';
import EstadoCarga from './EstadoCarga.jsx';

export default class CargaVista extends Component {
    state = { error: false };

    static getDerivedStateFromError() {
        return { error: true };
    }

    render() {
        if (this.state.error) {
            return <section role="alert" className="hc-panel-card">
                <h1>No se pudo abrir esta vista</h1>
                <p>Compruebe la conexión. Puede recargar para volver a intentarlo.</p>
                <button type="button" className="hc-button hc-button--primary" onClick={() => window.location.reload()}>Recargar vista</button>
            </section>;
        }
        return <Suspense fallback={<EstadoCarga mensaje="Cargando vista…" />}>
            {this.props.children}
        </Suspense>;
    }
}
