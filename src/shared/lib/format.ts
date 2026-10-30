const dateFormatter = new Intl.DateTimeFormat('uk-UA', { dateStyle: 'long' });

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
}

export function getInitials(...parts: string[]): string {
  return parts
    .map((part) => part.trim().charAt(0))
    .join('')
    .toUpperCase();
}
