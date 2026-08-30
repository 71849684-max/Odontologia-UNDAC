import { Filter, Search } from 'lucide-react';

export default function BarraFiltros({ busqueda = 'Buscar registros', filtros = [] }) {
    return (
        <div className="barra-filtros">
            <label className="buscador-modulo">
                <span className="solo-lectores">{busqueda}</span>
                <Search size={17} aria-hidden="true" />
                <input type="search" placeholder={busqueda} />
            </label>
            <div className="barra-filtros__selectores">
                {filtros.map((filtro) => (
                    <label key={filtro.id}>
                        <span className="solo-lectores">{filtro.etiqueta}</span>
                        <select defaultValue="todos" aria-label={filtro.etiqueta}>
                            <option value="todos">{filtro.todos ?? `Todos: ${filtro.etiqueta}`}</option>
                            {(filtro.opciones ?? []).map((opcion) => <option value={opcion} key={opcion}>{opcion}</option>)}
                        </select>
                    </label>
                ))}
                <button type="button" className="boton-filtro"><Filter size={16} />Filtros</button>
            </div>
        </div>
    );
}
