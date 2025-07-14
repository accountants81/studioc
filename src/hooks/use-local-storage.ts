"use client";

import { useState, useEffect } from 'react';

// A custom hook to use localStorage with type safety and SSR support
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  
  // This state will hold the value. We initialize it from localStorage if available.
  const [storedValue, setStoredValue] = useState<T>(() => {
    // During SSR (server-side rendering), window is not available.
    // Return initialValue to avoid errors.
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      // Try to get the value from localStorage by key.
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue.
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error('Error reading from localStorage', error);
      return initialValue;
    }
  });
  
  // This effect runs whenever the storedValue changes,
  // and it saves the new value to localStorage.
  useEffect(() => {
    // Again, check if we are on the client side.
    if (typeof window === 'undefined') {
      return;
    }
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        typeof storedValue === 'function'
          ? (storedValue as Function)(storedValue)
          : storedValue;
      // Save state to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
