import { useCallback, useState } from "react";
import { hataMesaji } from "../errors";

/**
 * Ortak async form/API akışı: yükleme, hata (Türkçe), isteğe bağlı global banner.
 */
export function useAsyncAction(setGlobalError) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = useCallback(
    async (action) => {
      setError("");
      setGlobalError("");
      setResult(null);
      setLoading(true);
      try {
        await action();
      } catch (err) {
        const msg = hataMesaji(err);
        setError(msg);
        setGlobalError(msg);
      } finally {
        setLoading(false);
      }
    },
    [setGlobalError]
  );

  return { run, result, setResult, error, setError, loading };
}
