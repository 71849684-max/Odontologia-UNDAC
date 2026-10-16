import { createContext, useContext } from 'react';

/**
 * Canal de subida de archivos del expediente.
 * Vale null cuando la historia no está registrada en el servidor: los controles
 * conservan entonces la vista previa en el navegador.
 * Forma: { subir(campo, archivo, nombre) => Promise<adjunto>, eliminar(adjunto) => Promise<void> }
 */
export const ArchivosClinicosContext = createContext(null);

export function useArchivosClinicos() {
  return useContext(ArchivosClinicosContext);
}
