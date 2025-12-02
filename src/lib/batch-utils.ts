// Utility functions for batch formatting

export const formatBatchName = (batch: { productionDate?: string | Date, name?: string } | null | undefined) => {
  // Handle missing batch object or missing productionDate gracefully
  if (!batch) return 'Tanda'

  // If a productionDate exists and is a valid date, format day/month
  if (batch.productionDate) {
    const date = new Date(batch.productionDate);
    if (!isNaN(date.getTime())) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `Tanda ${day}/${month}`;
    }
  }

  // If we have a name field, return that (e.g., when the API returns only name)
  if ((batch as any).name) {
    return (batch as any).name
  }

  // Fallback
  return 'Tanda'
};

export const formatBatchNameWithYear = (batch: { productionDate: string | Date }) => {
  const date = new Date(batch.productionDate);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `Tanda ${day}/${month}/${year}`;
};

export const formatDateForDisplay = (date: string | Date) => {
  return new Date(date).toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};