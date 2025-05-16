import {t} from '../languages/i18n.ts';
import RNFS from 'react-native-fs';
import {decode as atob} from 'base-64';

export function cleanObject(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined),
  );
}

export const wrapCancelable = async <T>(
  promise: Promise<T>,
  signal: AbortSignal,
  errorMessage = t('canceled_task'),
): Promise<T> => {
  if (signal.aborted) {
    throw new Error(errorMessage);
  }

  return new Promise<T>((resolve, reject) => {
    const abortHandler = () => reject(new Error(errorMessage));
    signal.addEventListener('abort', abortHandler);

    promise
      .then(result => {
        signal.removeEventListener('abort', abortHandler);
        resolve(result);
      })
      .catch(err => {
        signal.removeEventListener('abort', abortHandler);
        reject(err);
      });
  });
};

export function convertTime(timestamp: string): string {
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
  return `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
};
export const readFileAsBytes = async (
  uri: string,
): Promise<Uint8Array | undefined> => {
  const fileContent = await RNFS.readFile(uri, 'base64'); // Đọc file dưới dạng base64
  // Chuyển base64 thành byte array
  return Uint8Array.from(atob(fileContent), c => c.charCodeAt(0));
};
export const checkEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};
export const parseAltText = (
  input: string,
): {rating: string; text: string} | null => {
  const match = input.match(/★([\d.]+)\s-\s[“"](.*)[”"]/);
  if (match) {
    return {
      rating: match[1],
      text: match[2],
    };
  }
  return null;
};
export const checkPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/;
  return phoneRegex.test(phone);
};
