"use client";

import { OPENING_SEQUENCE_ASSET_SOURCES } from "./remotion/OpeningSequenceComposition";

let preloadPromise: Promise<boolean> | null = null;

export function preloadOpeningAssets(): Promise<boolean> {
  preloadPromise ??= Promise.all(
    OPENING_SEQUENCE_ASSET_SOURCES.map(async (source) => {
      const response = await fetch(source, { cache: "force-cache" });
      if (!response.ok) {
        throw new Error(
          `Opening asset request failed with ${response.status}: ${source}`,
        );
      }
      await response.arrayBuffer();
    }),
  )
    .then(() => true)
    .catch((error: unknown) => {
      console.error("[OpeningSequence] Asset preload failed.", error);
      return false;
    });

  return preloadPromise;
}
