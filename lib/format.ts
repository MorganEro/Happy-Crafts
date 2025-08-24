export const formatCurrency = (amount: number | null) => {
  const value = amount || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};


export const formatDate = (date: Date, weekDay?: boolean) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: weekDay ? 'long' : undefined,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

