import '@testing-library/jest-dom/vitest';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import HistoriaClinica from '../componentes/clinica/HistoriaClinica.jsx';
import { BloqueCarga, SlotConstancia } from '../formularios/compartidos/ControlesCarga.jsx';
import { ArchivosClinicosContext } from '../formularios/compartidos/archivosClinicos.js';

let almacen;

beforeEach(() => {
  almacen = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (clave) => almacen.get(clave) ?? null,
    setItem: (clave, valor) => almacen.set(clave, String(valor)),
    removeItem: (clave) => almacen.delete(clave),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function archivo(nombre, tipo) {
  return new File(['contenido-de-prueba'], nombre, { type: tipo });
}

test('la sección de imágenes abre el selector de archivos al hacer clic en la opción de carga', () => {
  const clickSelector = vi.spyOn(HTMLElement.prototype, 'click').mockImplementation(() => {});
  render(<HistoriaClinica historiaId="1" initialSection="examen-intraoral" />);

  fireEvent.click(screen.getByRole('button', { name: /Fotografías intraorales/i }));

  const selector = document.querySelector('input[aria-label="Cargar imágenes en Fotografías intraorales"]');
  expect(selector).not.toBeNull();
  expect(selector).toHaveAttribute('accept', 'image/*');

  fireEvent.click(screen.getByRole('button', { name: 'Cargar imágenes' }));
  expect(clickSelector).toHaveBeenCalledTimes(1);

  fireEvent.click(screen.getAllByRole('button', { name: /Pendiente de adjuntar/i })[0]);
  expect(clickSelector).toHaveBeenCalledTimes(2);
});

test('las imágenes cargadas se muestran en la sección y se pueden quitar', async () => {
  render(<HistoriaClinica historiaId="1" initialSection="examen-intraoral" />);
  fireEvent.click(screen.getByRole('button', { name: /Fotografías intraorales/i }));

  const selector = document.querySelector('input[aria-label="Cargar imágenes en Fotografías intraorales"]');
  fireEvent.change(selector, { target: { files: [archivo('intraoral-1.png', 'image/png')] } });

  const vistaPrevia = await screen.findByAltText('Vista previa de intraoral-1.png');
  expect(vistaPrevia).toBeInTheDocument();
  expect(screen.getByText('1 de 6 vistas adjuntas')).toBeInTheDocument();
  expect(screen.getAllByText('Pendiente de adjuntar')).toHaveLength(5);

  fireEvent.click(screen.getByRole('button', { name: 'Eliminar intraoral-1.png' }));
  expect(screen.queryByAltText('Vista previa de intraoral-1.png')).not.toBeInTheDocument();
  expect(screen.getByText('Sin imágenes adjuntas')).toBeInTheDocument();
  expect(screen.getAllByText('Pendiente de adjuntar')).toHaveLength(6);
});

test('la sección de imágenes rechaza formatos ajenos a las imágenes', async () => {
  render(<HistoriaClinica historiaId="1" initialSection="examen-intraoral" />);
  fireEvent.click(screen.getByRole('button', { name: /Fotografías intraorales/i }));

  const selector = document.querySelector('input[aria-label="Cargar imágenes en Fotografías intraorales"]');
  fireEvent.change(selector, { target: { files: [archivo('notas.txt', 'text/plain')] } });

  expect(await screen.findByRole('alert')).toHaveTextContent('formato permitido');
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});

test('la sección de carga de archivos lista los documentos adjuntos y permite quitarlos', async () => {
  render(<HistoriaClinica historiaId="1" initialSection="examenes-auxiliares" />);

  const zona = screen.getByRole('button', { name: /Cargar archivos/i });
  expect(zona).toHaveTextContent('Haga clic para elegir desde su equipo');
  expect(screen.getByRole('group', { name: 'Resultados de laboratorio' })).toBeInTheDocument();
  expect(screen.getByText('Sin archivos adjuntos')).toBeInTheDocument();

  const selector = document.querySelector('input[aria-label="Cargar archivos en Resultados de laboratorio"]');
  expect(selector).not.toBeNull();
  expect(selector?.getAttribute('accept')).toContain('.pdf');

  fireEvent.change(selector, { target: { files: [archivo('informe-laboratorio.pdf', 'application/pdf')] } });

  expect(await screen.findByText('informe-laboratorio.pdf')).toBeInTheDocument();
  expect(screen.getByText('1 de 10 archivos adjuntos')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Eliminar informe-laboratorio.pdf' }));
  expect(screen.queryByText('informe-laboratorio.pdf')).not.toBeInTheDocument();
  expect(screen.getByText('Sin archivos adjuntos')).toBeInTheDocument();
});

test('las constancias del consentimiento cargan una imagen y muestran su vista previa', async () => {
  render(<HistoriaClinica historiaId="1" initialSection="consentimiento" />);

  expect(screen.getAllByText('Constancia pendiente')).toHaveLength(4);

  const selector = document.querySelector('input[aria-label="Cargar imagen de Firma del paciente"]');
  expect(selector).not.toBeNull();

  fireEvent.change(selector, { target: { files: [archivo('firma-paciente.png', 'image/png')] } });

  expect(await screen.findByAltText('Vista previa de Firma del paciente')).toBeInTheDocument();
  expect(screen.getAllByText('Constancia pendiente')).toHaveLength(3);
  expect(screen.getByText('Imagen adjunta')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Eliminar Firma del paciente' }));
  expect(screen.queryByAltText('Vista previa de Firma del paciente')).not.toBeInTheDocument();
  expect(screen.getAllByText('Constancia pendiente')).toHaveLength(4);
});

test('las miniaturas se organizan como un carrusel de celdas de tamaño fijo', async () => {
  render(<HistoriaClinica historiaId="1" initialSection="examen-intraoral" />);
  fireEvent.click(screen.getByRole('button', { name: /Fotografías intraorales/i }));

  const carrusel = screen.getByRole('group', { name: 'Carrusel de Fotografías intraorales' });
  expect(carrusel.querySelectorAll('.undac-carousel__cell')).toHaveLength(6);

  const anterior = screen.getByRole('button', { name: 'Ver elementos anteriores' });
  const siguiente = screen.getByRole('button', { name: 'Ver elementos siguientes' });
  expect(anterior).toBeDisabled();
  expect(siguiente).toBeEnabled();

  fireEvent.click(siguiente);
  expect(anterior).toBeEnabled();

  const selector = document.querySelector('input[aria-label="Cargar imágenes en Fotografías intraorales"]');
  fireEvent.change(selector, { target: { files: [archivo('intraoral-1.png', 'image/png')] } });

  // La imagen nueva ocupa una celda del carrusel sin alterar el total (1 + 5 pendientes).
  expect(await screen.findByAltText('Vista previa de intraoral-1.png')).toBeInTheDocument();
  expect(carrusel.querySelectorAll('.undac-carousel__cell')).toHaveLength(6);
  expect(carrusel.querySelectorAll('.undac-photo-tile')).toHaveLength(1);
  expect(within(carrusel).getAllByText('Pendiente de adjuntar')).toHaveLength(5);
});

test('al pulsar una miniatura se abre un visor modal con la imagen ampliada', async () => {
  render(<HistoriaClinica historiaId="1" initialSection="examen-intraoral" />);
  fireEvent.click(screen.getByRole('button', { name: /Fotografías intraorales/i }));

  const selector = document.querySelector('input[aria-label="Cargar imágenes en Fotografías intraorales"]');
  fireEvent.change(selector, {
    target: { files: [archivo('intraoral-1.png', 'image/png'), archivo('intraoral-2.png', 'image/png')] },
  });

  const disparo = await screen.findByRole('button', { name: 'Ampliar intraoral-1.png' });
  fireEvent.click(disparo);

  const visor = screen.getByRole('dialog', { name: 'Imagen ampliada de intraoral-1.png' });
  expect(within(visor).getByAltText('Imagen ampliada de intraoral-1.png')).toBeInTheDocument();
  expect(within(visor).getByText(/1 de 2 ·/)).toBeInTheDocument();

  fireEvent.click(within(visor).getByRole('button', { name: 'Imagen siguiente' }));
  expect(screen.getByRole('dialog', { name: 'Imagen ampliada de intraoral-2.png' })).toBeInTheDocument();

  fireEvent.keyDown(window, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(document.activeElement).toBe(disparo);
});

function servidorSimulado() {
  let siguiente = 1;
  return {
    subir: vi.fn(async (campo, contenido, nombre) => {
      const archivoId = siguiente++;
      return { id: `srv-${archivoId}`, archivoId, nombre, tamano: contenido.size, tipo: contenido.type, url: `/api/historias/7/archivos/${archivoId}`, vistaPrevia: `/api/historias/7/archivos/${archivoId}` };
    }),
    eliminar: vi.fn(async () => undefined),
  };
}

function BloqueControlado({ campo, ...props }) {
  const [valor, setValor] = React.useState([]);
  return <BloqueCarga campo={campo} value={valor} onChange={setValor} {...props} />;
}

function SlotControlado(props) {
  const [valor, setValor] = React.useState(null);
  return <SlotConstancia value={valor} onChange={setValor} {...props} />;
}

test('con historia en el servidor las imágenes se suben con la clave del campo y se borran en el servidor', async () => {
  const servidor = servidorSimulado();
  render(<ArchivosClinicosContext.Provider value={servidor}><BloqueControlado campo="fotosModelos" title="Fotografías de modelos" count={4} /></ArchivosClinicosContext.Provider>);

  expect(screen.getByText(/se guardan en el expediente del paciente/i)).toBeInTheDocument();
  const selector = document.querySelector('input[aria-label="Cargar imágenes en Fotografías de modelos"]');
  fireEvent.change(selector, { target: { files: [archivo('modelo-1.png', 'image/png')] } });

  const vista = await screen.findByAltText('Vista previa de modelo-1.png');
  expect(vista).toHaveAttribute('src', '/api/historias/7/archivos/1');
  expect(servidor.subir).toHaveBeenCalledWith('fotosModelos', expect.any(File), 'modelo-1.png');

  fireEvent.click(screen.getByRole('button', { name: 'Eliminar modelo-1.png' }));
  await waitFor(() => expect(screen.queryByAltText('Vista previa de modelo-1.png')).not.toBeInTheDocument());
  expect(servidor.eliminar).toHaveBeenCalledWith(expect.objectContaining({ archivoId: 1 }));
});

test('si el servidor rechaza el archivo se muestra su mensaje y no se agrega', async () => {
  const servidor = servidorSimulado();
  servidor.subir.mockRejectedValueOnce({ errores: { archivo: ['El archivo supera el tamaño máximo de 2048 KB.'] } });
  render(<ArchivosClinicosContext.Provider value={servidor}><BloqueControlado campo="resultadosLaboratorio" title="Resultados" tipo="archivo" /></ArchivosClinicosContext.Provider>);

  const selector = document.querySelector('input[aria-label="Cargar archivos en Resultados"]');
  fireEvent.change(selector, { target: { files: [archivo('informe.pdf', 'application/pdf')] } });

  expect(await screen.findByRole('alert')).toHaveTextContent('supera el tamaño máximo');
  expect(screen.queryByText('informe.pdf')).not.toBeInTheDocument();
});

test('la constancia se sube al servidor y queda la imagen del expediente', async () => {
  const servidor = servidorSimulado();
  render(<ArchivosClinicosContext.Provider value={servidor}><SlotControlado campo="firmaPaciente" label="Firma del paciente" /></ArchivosClinicosContext.Provider>);

  const selector = document.querySelector('input[aria-label="Cargar imagen de Firma del paciente"]');
  fireEvent.change(selector, { target: { files: [archivo('firma.png', 'image/png')] } });

  expect(await screen.findByAltText('Vista previa de Firma del paciente')).toHaveAttribute('src', '/api/historias/7/archivos/1');
  expect(servidor.subir).toHaveBeenCalledWith('firmaPaciente', expect.any(File), 'firma.png');

  fireEvent.click(screen.getByRole('button', { name: 'Eliminar Firma del paciente' }));
  await waitFor(() => expect(screen.getByText('Constancia pendiente')).toBeInTheDocument());
  expect(servidor.eliminar).toHaveBeenCalledTimes(1);
});

test('la firma se puede dibujar en el pad y la huella solo admite imagen', () => {
  render(<>
    <SlotControlado campo="firmaDocente" label="Firma del docente" />
    <SlotControlado campo="huellaDactilar" label="Huella dactilar" permitirDibujo={false} />
  </>);

  expect(screen.queryByRole('button', { name: 'Dibujar Huella dactilar' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Dibujar Firma del docente' }));

  const pad = screen.getByRole('dialog', { name: 'Dibujar Firma del docente' });
  expect(within(pad).getByRole('button', { name: 'Usar firma' })).toBeDisabled();
  fireEvent.click(within(pad).getByRole('button', { name: 'Cancelar' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('el visor usa un contenedor de 1000 x 700 px y el carrusel es responsivo', async () => {
  const css = await readFile(path.resolve(process.cwd(), 'src/css/aplicacion/historia-clinica.css'), 'utf8');

  expect(css).toMatch(/min\(1000px,\s*100%\)/);
  expect(css).toMatch(/min\(700px,\s*calc\(100dvh - 40px\)\)/);
  expect(css).toMatch(/@media \(max-width: 980px\)[\s\S]*?--undac-celda: 132px/);
  expect(css).toMatch(/@media \(max-width: 430px\)[\s\S]*?\.undac-visor__contenedor \{ width: 100%; height: 100dvh/);
});
