export const normalizarTelefono = (telefono) => {
  const limpio = telefono.replace(/[\s()-]/g, '');

  if (/^\+521\d{10}$/.test(limpio)) return limpio;
  if (/^\d{10}$/.test(limpio)) return `+521${limpio}`;
  if (/^\+?52\d{10}$/.test(limpio)) return `+521${limpio.replace(/^\+?52/, '')}`;

  return limpio;
};

export const esTelefonoValido = (telefono) => (
  !telefono || /^(?:\+?52)?\d{10}$|^\+[1-9]\d{7,14}$/.test(telefono)
);
