
"use client";

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

export function DigitalClock() {
  const [time, setTime] = useState<Date | null>(null);
  const [lang] = useLocalStorage<'ar' | 'en'>('app-lang', 'ar');

  useEffect(() => {
    // Set the initial time on the client
    setTime(new Date());

    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(timerId);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="px-2 py-2 text-center text-sm font-mono text-sidebar-foreground/80">
      {time ? formatTime(time) : '...'}
    </div>
  );
}
