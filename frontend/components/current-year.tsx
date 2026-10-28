"use client";

/**
 * With Cache Components, `new Date()` in a Server Component fails prerendering,
 * so the copyright year is rendered on the client.
 */
export function CurrentYear() {
  return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}
