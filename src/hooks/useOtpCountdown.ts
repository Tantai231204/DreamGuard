import { useEffect, useState } from "react";

export function useOtpCountdown(initial = 60) {
  const [time, setTime] = useState(initial);

  useEffect(() => {
    if (time === 0) return;

    const timer = setInterval(() => {
      setTime((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [time]);

  const reset = () => setTime(initial);

  return { time, reset };
}