"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";

/** Submit state for a form: busy flag, a top-level error and per-field errors from the API. */
export function useFormSubmit() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function run<T>(fn: () => Promise<T>): Promise<T | undefined> {
    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      return await fn();
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.fieldErrors);
        setError(Object.keys(err.fieldErrors).length ? "Please check the highlighted fields." : err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
      return undefined;
    } finally {
      setBusy(false);
    }
  }

  return { busy, error, fieldErrors, run, setError };
}
