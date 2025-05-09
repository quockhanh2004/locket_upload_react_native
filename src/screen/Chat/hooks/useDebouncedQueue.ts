// hooks/useDebouncedQueue.ts
import {useEffect, useRef} from 'react';

export function useDebouncedQueue<T>(
  callback: (items: T[]) => void,
  delay: number = 200,
  batchSize: number = 10,
) {
  const queueRef = useRef<T[]>([]);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const push = (item: T) => {
    queueRef.current.push(item);

    if (!timeoutIdRef.current) {
      timeoutIdRef.current = setTimeout(processQueue, delay);
    }
  };

  const processQueue = () => {
    const batch = queueRef.current.splice(0, batchSize);
    if (batch.length > 0) {
      callback(batch);
      timeoutIdRef.current = setTimeout(processQueue, delay);
    } else {
      timeoutIdRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  return {push};
}
