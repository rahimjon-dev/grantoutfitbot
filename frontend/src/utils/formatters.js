export function formatUzs(amount) {
  if (amount === null || amount === undefined) return '0 UZS';
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS';
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function truncateText(str, maxLength = 60) {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}
