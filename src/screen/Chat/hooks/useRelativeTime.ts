// hooks/useRelativeTime.ts
import {useEffect, useState} from 'react';
import {timeDiffFromNow} from '../../../util/convertTime';

export default function useRelativeTime(timestamp: number | string) {
  const parsed =
    typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
  const [relativeTime, setRelativeTime] = useState(() =>
    timeDiffFromNow(parsed),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRelativeTime(timeDiffFromNow(parsed));
    }, 60 * 1000); // mỗi 1 phút

    return () => clearInterval(interval);
  }, [parsed]);

  return relativeTime;
}
