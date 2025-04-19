import {useCallback, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAsyncStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  const getItem = useCallback(async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue != null) {
        setStoredValue(JSON.parse(jsonValue));
      }
    } catch (error) {
      console.error(`Error reading ${key} from AsyncStorage`, error);
    } finally {
      setLoading(false);
    }
  }, [key]);

  const setItem = useCallback(
    async (value: T) => {
      try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
        setStoredValue(value);
      } catch (error) {
        console.error(`Error writing ${key} to AsyncStorage`, error);
      }
    },
    [key],
  );

  const removeItem = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing ${key} from AsyncStorage`, error);
    }
  }, [key, initialValue]);

  useEffect(() => {
    getItem();
  }, [getItem]);

  return {value: storedValue, setItem, removeItem, loading};
}
