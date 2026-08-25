export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

/** Builds a wa.me deep link, adapted from OLD js/marketplace.js `whatsapp` field usage. */
export const buildWhatsAppLink = (whatsapp?: string, phone?: string): string | null => {
  const digits = whatsapp || (phone ? phone.replace(/\D/g, '') : '');
  if (!digits) return null;
  return `https://wa.me/${digits}`;
};

export const buildTelLink = (phone?: string): string | null => {
  if (!phone) return null;
  return `tel:${phone}`;
};
