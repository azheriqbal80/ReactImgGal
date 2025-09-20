import { useState, useEffect } from 'react';

/**
 * A custom hook to fetch data from a given URL.
 *
 * @param url The URL to fetch data from.
 * @returns An object containing the fetched data, loading state, and any error that occurred.
 */
export const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Use an AbortController to prevent memory leaks if the component unmounts
    // while the fetch is still in progress.
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(url, { signal });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const json = await response.json();
        setData(json);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Cleanup function to abort the fetch if the component unmounts.
    return () => {
      controller.abort();
    };
  }, [url]); // Re-run the effect if the URL changes

  return { data, isLoading, error };
};
