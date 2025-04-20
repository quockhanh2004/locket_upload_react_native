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

//lấy thời gian hiện tại với format HH:mm, có am/pm
// ví dụ: 09:00 am
export const getCurrentTime = () => {
  const date = new Date();
  let hours: number | string = date.getHours();
  const minutes: number | string = date.getMinutes();

  const ampm = hours >= 12 ? 'CH' : 'SA';
  hours = hours % 12;
  hours = hours ? String(hours).padStart(1, '0') : '12'; // the hour '0' should be '12'
  const strTime = `🕒 ${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
  return strTime;
};
