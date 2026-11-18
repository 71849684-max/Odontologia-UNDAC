import { createContext, useContext } from 'react';

export const LecturaClinicaContext = createContext(false);
export const useLecturaClinica = () => useContext(LecturaClinicaContext);
