"use client";

import dynamic from "next/dynamic";

/** Loads three.js only in the browser, after the page is interactive. */
const VinylScene = dynamic(() => import("./vinyl-scene"), {
  ssr: false,
  loading: () => (
    <div className="grid size-full place-items-center">
      <div className="aspect-square w-3/5 animate-pulse rounded-full bg-[radial-gradient(circle,#26212b_30%,#16131a_70%)]" />
    </div>
  ),
});

export function Vinyl({ labelSrc = "/art/covers/peacock-1-v2.jpg" }: { labelSrc?: string }) {
  return <VinylScene labelSrc={labelSrc} />;
}
