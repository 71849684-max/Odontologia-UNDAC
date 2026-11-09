export function problemaDocumento(valor, tipo = 'DNI') {
    const texto = String(valor ?? '').trim();
    if (!texto) return 'Ingrese el número de documento.';
    if (tipo === 'DNI') return /^[0-9]{8}$/.test(texto) ? '' : 'El DNI debe tener 8 dígitos.';
    return /^[A-Za-z0-9-]{4,20}$/.test(texto) ? '' : 'El documento debe tener entre 4 y 20 letras, números o guiones.';
}

export function problemaTelefono(valor) {
    const texto = String(valor ?? '').trim();
    if (!texto) return '';
    const cantidad = texto.replace(/\D/g, '').length;
    return /^[0-9+()\s-]+$/.test(texto) && cantidad >= 7 && cantidad <= 15 ? '' : 'Ingrese un teléfono de 7 a 15 dígitos.';
}

export function problemaCorreo(valor) {
    const texto = String(valor ?? '').trim();
    return !texto || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto) ? '' : 'Ingrese un correo electrónico válido.';
}

export function problemaFechaNacimiento(valor) {
    if (!valor) return '';
    const partes = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!partes) return 'Ingrese una fecha de nacimiento válida.';
    const [, anio, mes, dia] = partes.map(Number);
    const fecha = new Date(anio, mes - 1, dia);
    const hoy = new Date();
    if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia || fecha > hoy) return 'Ingrese una fecha de nacimiento válida que no sea futura.';
    return '';
}
