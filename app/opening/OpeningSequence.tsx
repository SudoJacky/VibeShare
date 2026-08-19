"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { useCallback, useEffect, useRef, useState } from "react";
import { isOpeningSkipShortcut } from "./opening-shortcuts";
import styles from "./opening-sequence.module.css";
import {
  OPENING_SEQUENCE_DURATION,
  OPENING_SEQUENCE_FPS,
  OpeningSequenceComposition,
} from "./remotion/OpeningSequenceComposition";

type OpeningSequenceProps = {
  ready?: boolean;
  mediaUnlocked?: boolean;
  onComplete?: () => void;
  onExitStart?: () => void;
};

const EXIT_DURATION_MS = 750;

export function OpeningSequence({
  ready = false,
  mediaUnlocked = false,
  onComplete,
  onExitStart,
}: OpeningSequenceProps) {
  const playerRef = useRef<PlayerRef>(null);
  const exitTimerRef = useRef<number | null>(null);
  const exitStartedRef = useRef(false);
  const [exiting, setExiting] = useState(false);
  const [locallyUnlocked, setLocallyUnlocked] = useState(false);
  const [playbackError, setPlaybackError] = useState<Error | null>(null);
  const canPlay = ready && (mediaUnlocked || locallyUnlocked);

  const finishOpening = useCallback(() => {
    if (exitStartedRef.current) return;
    exitStartedRef.current = true;
    playerRef.current?.pause();
    setExiting(true);
    onExitStart?.();
    exitTimerRef.current = window.setTimeout(() => {
      onComplete?.();
    }, EXIT_DURATION_MS);
  }, [onComplete, onExitStart]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const onEnded = () => finishOpening();
    const onError = (event: { detail: { error: Error } }) => {
      console.error(
        "[OpeningSequence] Remotion playback failed.",
        event.detail.error,
      );
      setPlaybackError(event.detail.error);
    };
    player.addEventListener("ended", onEnded);
    player.addEventListener("error", onError);
    return () => {
      player.removeEventListener("ended", onEnded);
      player.removeEventListener("error", onError);
    };
  }, [finishOpening, ready]);

  useEffect(() => {
    if (!canPlay || exitStartedRef.current) return;
    const startFrame = window.requestAnimationFrame(() => {
      playerRef.current?.play();
    });
    return () => window.cancelAnimationFrame(startFrame);
  }, [canPlay]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isOpeningSkipShortcut(event)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      finishOpening();
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [finishOpening]);

  useEffect(
    () => () => {
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
      }
    },
    [],
  );

  return (
    <section
      className={styles.root}
      aria-label="Opening sequence"
      style={{
        opacity: exiting ? 0 : 1,
        transition: `opacity ${EXIT_DURATION_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`,
      }}
    >
      {ready ? (
        <Player
          ref={playerRef}
          component={OpeningSequenceComposition}
          compositionWidth={1920}
          compositionHeight={1080}
          durationInFrames={OPENING_SEQUENCE_DURATION}
          fps={OPENING_SEQUENCE_FPS}
          autoPlay={canPlay}
          controls={false}
          clickToPlay={false}
          spaceKeyToPlayOrPause={false}
          numberOfSharedAudioTags={4}
          errorFallback={({ error }) => (
            <div
              role="alert"
              style={{
                display: "grid",
                width: "100%",
                height: "100%",
                padding: 80,
                color: "#fff",
                background: "#180d10",
                fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',
                placeContent: "center",
                textAlign: "center",
              }}
            >
              <strong>OpeningSequence playback failed</strong>
              <span>{error.message}</span>
            </div>
          )}
          style={{ width: "100%", height: "100%" }}
        />
      ) : null}
      {ready && !canPlay ? (
        <button
          className={styles.startGate}
          type="button"
          onClick={() => setLocallyUnlocked(true)}
        >
          <span>Click to start the opening</span>
        </button>
      ) : null}
      {playbackError ? (
        <span role="status" hidden>
          {playbackError.message}
        </span>
      ) : null}
    </section>
  );
}
