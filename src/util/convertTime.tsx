export function converTime(timestamp: string): string {
  const date = new Date(Number(timestamp));

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month là 0-indexed
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

export const timeDiffFromNow = (timestampInSeconds: number) => {
  const now = new Date().getTime() / 1000;

  const diffInMinutes = Math.abs(timestampInSeconds - now) / 60;

  if (diffInMinutes < 60) {
    return `${Math.round(diffInMinutes)}m`;
  }

  const diffInHours = diffInMinutes / 60;
  if (diffInHours < 24) {
    return `${Math.round(diffInHours)}h`;
  }

  const diffInDays = diffInHours / 24;
  return `${Math.round(diffInDays)}d`;
};
