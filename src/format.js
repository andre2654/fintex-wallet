export function formatCurrency(cents) {
  // Convert cents to reais and centavos
  const reais = Math.floor(cents / 100);
  const centavos = cents % 100;

  // Format reais with thousands separator (dot)
  const formattedReais = reais.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Format centavos (always 2 digits)
  const formattedCentavos = String(centavos).padStart(2, '0');

  return `R$ ${formattedReais},${formattedCentavos}`;
}
