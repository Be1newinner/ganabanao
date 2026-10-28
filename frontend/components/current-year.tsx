import { cacheLife } from "next/cache";

/**
 * With Cache Components, reading the current time during prerender fails the
 * build (in Server and Client Components alike). Inside a cached scope it is
 * allowed, and the year only needs refreshing about once a day.
 */
export async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}
