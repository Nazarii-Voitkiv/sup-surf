export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

export function formatTime(time: string) {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('ru-RU', {
    hour: '2-digit', minute: '2-digit'
  });
}

export function formatDateTime(date: string, time?: string) {
  const formattedDate = formatDate(date);
  return time ? `${formattedDate}, ${formatTime(time)}` : formattedDate;
}

export function getActivityTypeName(type: string) {
  return type === 'sup' ? 'SUP-прогулка' : 'Серфинг';
}

export function getActivityTypeText(type: string) {
  return type === 'sup' ? 'SUP-прогулку' : 'Серфинг';
}

export function formatTimeRemaining(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Добавим функцию для расчета оставшегося времени
export function calculateTimeRemaining(expiryDate: Date): number {
  const now = new Date();
  return Math.max(0, Math.floor((expiryDate.getTime() - now.getTime()) / 1000));
}
