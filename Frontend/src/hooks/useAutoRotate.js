import { useEffect, useState } from "react";

export function useAutoRotate({ count, intervalMs = 4000, paused = false }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (paused || count <= 1) return undefined;

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % count);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [count, intervalMs, paused, resetKey]);

  function goTo(index) {
    setActiveIndex(index);
    setResetKey((key) => key + 1);
  }

  return { activeIndex, goTo };
}
