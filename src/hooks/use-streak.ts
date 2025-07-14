
import { useLocalStorage } from "./use-local-storage";
import { useEffect } from "react";

type Streak = {
  count: number;
  lastCompletedDate: string;
};

export function useStreak() {
  const [streak, setStreak] = useLocalStorage<Streak>('timeflow-streak', { count: 0, lastCompletedDate: '' });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 864e5).toISOString().split('T')[0];

    // If the last completed date is not today and not yesterday, reset the streak.
    if (streak.lastCompletedDate && streak.lastCompletedDate !== today && streak.lastCompletedDate !== yesterday) {
      setStreak({ count: 0, lastCompletedDate: '' });
    }
  }, []); // Run only on mount to check if streak is broken

  return { streak: streak.count };
}
