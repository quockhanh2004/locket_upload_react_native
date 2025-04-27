import {t} from '../languages/i18n';

export const wrapCancelable = async <T,>(
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
