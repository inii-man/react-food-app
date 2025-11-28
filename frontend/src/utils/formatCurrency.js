export const formatRupiah = (amount) => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return 'Rp 0';
  
  // Format with thousand separators (dots) and no decimals for whole numbers
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
  
  return formatted;
};

