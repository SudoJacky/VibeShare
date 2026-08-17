"use client";

import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  useCurrentFrame,
} from "remotion";
import page1 from "../assets/ai-pages-1.webp";
import page2 from "../assets/ai-pages-2.webp";
import page3 from "../assets/ai-pages-3.webp";
import page4 from "../assets/ai-pages-4.webp";
import page5 from "../assets/ai-pages-5.webp";
import page6 from "../assets/ai-pages-6.webp";
import page7 from "../assets/ai-pages-7.webp";
import page8 from "../assets/ai-pages-8.webp";
import page9 from "../assets/ai-pages-9.webp";
import page10 from "../assets/ai-pages-10.webp";
import page11 from "../assets/ai-pages-11.webp";
import page12 from "../assets/ai-pages-12.webp";
import page13 from "../assets/ai-pages-13.webp";
import page14 from "../assets/ai-pages-14.webp";
import page15 from "../assets/ai-pages-15.webp";
import page16 from "../assets/ai-pages-16.webp";
import page17 from "../assets/ai-pages-17.webp";
import page18 from "../assets/ai-pages-18.webp";
import page19 from "../assets/ai-pages-19.webp";
import page20 from "../assets/ai-pages-20.webp";
export const OPENING_PROTOTYPE_FPS = 60;
export const OPENING_PROTOTYPE_DURATION = OPENING_PROTOTYPE_FPS * 10;

const CAMERA_WIDTH = 3600;
const CAMERA_HEIGHT = 2250;
const CELL_WIDTH = 720;
const CELL_HEIGHT = 450;
const PROBLEM_START = OPENING_PROTOTYPE_FPS * 6;
const openingBgmAudio = new URL(
  "../assets/audio/Neon Horizon.mp3",
  import.meta.url,
).href;
const projectAudio = new URL(
  "../assets/audio/project.mp3",
  import.meta.url,
).href;
const assetSource = (asset: string | { src: string }) =>
  typeof asset === "string" ? asset : asset.src;

const pageTiles = [
  { source: assetSource(page1), column: 2, row: 2 },
  { source: assetSource(page2), column: 4, row: 3 },
  { source: assetSource(page3), column: 2, row: 4 },
  { source: assetSource(page4), column: 4, row: 3 },
  { source: assetSource(page5), column: 2, row: 4 },
  { source: assetSource(page6), column: 1, row: 3 },
  { source: assetSource(page7), column: 5, row: 3 },
  { source: assetSource(page8), column: 1, row: 2 },
  { source: assetSource(page9), column: 5, row: 4 },
  { source: assetSource(page10), column: 4, row: 4 },
  { source: assetSource(page11), column: 1, row: 1 },
  { source: assetSource(page12), column: 5, row: 5 },
  { source: assetSource(page13), column: 5, row: 1 },
  { source: assetSource(page14), column: 1, row: 5 },
  { source: assetSource(page15), column: 2, row: 1 },
  { source: assetSource(page16), column: 4, row: 5 },
  { source: assetSource(page17), column: 4, row: 1 },
  { source: assetSource(page18), column: 2, row: 5 },
  { source: assetSource(page19), column: 3, row: 1 },
  { source: assetSource(page20), column: 3, row: 5 },
] as const;

const revealTimes = [
  1, 1.25, 1.625, 2.625, 2.875, 3.125, 3.375, 3.625, 3.875, 4.125,
  4.125, 4.25, 4.5, 4.625, 4.875, 5, 5.125, 5.375, 5.5, 5.625,
] as const;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const between = (
  frame: number,
  start: number,
  end: number,
  easing: (value: number) => number = Easing.linear,
) => interpolate(frame, [start, end], [0, 1], { ...clamp, easing });

const mix = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

const stagedValue = (
  frame: number,
  stages: Array<{
    start: number;
    end: number;
    from: number;
    to: number;
    easing: (value: number) => number;
  }>,
) => {
  let value = stages[0].from;
  for (const stage of stages) {
    if (frame < stage.start) return value;
    value = mix(
      stage.from,
      stage.to,
      between(frame, stage.start, stage.end, stage.easing),
    );
    if (frame <= stage.end) return value;
    value = stage.to;
  }
  return value;
};

const wordVisibility = (frame: number, start: number, end: number) => {
  const enter = between(frame, start, start + 10, Easing.out(Easing.cubic));
  const exit = between(frame, end - 8, end, Easing.in(Easing.cubic));
  return enter * (1 - exit);
};

function OpeningMosaic() {
  const frame = useCurrentFrame();
  const cameraScale = stagedValue(frame, [
    {
      start: 47,
      end: 94,
      from: 1.52,
      to: 1,
      easing: Easing.out(Easing.poly(4)),
    },
    {
      start: 140,
      end: 197,
      from: 1,
      to: 0.53,
      easing: Easing.inOut(Easing.cubic),
    },
    {
      start: 257,
      end: 332,
      from: 0.53,
      to: 0.44,
      easing: Easing.inOut(Easing.cubic),
    },
  ]);
  const cameraSettle = between(frame, 47, 332, Easing.inOut(Easing.cubic));
  const cameraX = mix(32, 0, cameraSettle);
  const cameraY = mix(-22, 0, cameraSettle);
  const cameraRotateX = mix(1.2, 0, cameraSettle);
  const cameraRotateY = mix(-1.6, 0, cameraSettle);
  const tileShift = between(frame, 142, 181, Easing.inOut(Easing.cubic));

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: CAMERA_WIDTH,
          height: CAMERA_HEIGHT,
          transform: `translate(-50%, -50%) translate3d(${cameraX}px, ${cameraY}px, 0) perspective(2400px) rotateX(${cameraRotateX}deg) rotateY(${cameraRotateY}deg) scale(${cameraScale})`,
          transformOrigin: "50% 50%",
          willChange: "transform",
        }}
      >
        {pageTiles.map((page, index) => {
          const revealStart = revealTimes[index] * OPENING_PROTOTYPE_FPS;
          const reveal = between(
            frame,
            revealStart,
            revealStart + 24,
            Easing.inOut(Easing.cubic),
          );
          const offsetX = index === 2 ? CELL_WIDTH * tileShift : 0;
          const offsetY = index === 1 ? -CELL_HEIGHT * tileShift : 0;
          const left = (page.column - 1) * CELL_WIDTH;
          const top = (page.row - 1) * CELL_HEIGHT;

          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left,
                top,
                zIndex: index + 1,
                width: CELL_WIDTH,
                height: CELL_HEIGHT,
                padding: 6,
                boxSizing: "border-box",
                overflow: "hidden",
                background: "#000",
                clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`,
                opacity: reveal,
                transform: `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${mix(0.985, 1, reveal)})`,
                transformOrigin: "50% 50%",
                willChange: "clip-path, transform, opacity",
              }}
            >
              <Img
                src={page.source}
                alt=""
                draggable={false}
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  userSelect: "none",
                }}
              />
            </div>
          );
        })}

        <div
          style={{
            position: "absolute",
            left: CELL_WIDTH * 2,
            top: CELL_HEIGHT * 2,
            zIndex: 30,
            display: "grid",
            width: CELL_WIDTH,
            height: CELL_HEIGHT,
            overflow: "hidden",
            placeItems: "center",
            background: "#000",
          }}
        >
          {[
            { word: "Learn", start: 30, end: 120 },
            { word: "Build", start: 120, end: 240 },
            { word: "Plan", start: 240, end: 360 },
          ].map(({ word, start, end }) => {
            const opacity = wordVisibility(frame, start, end);
            return (
              <span
                key={word}
                style={{
                  position: "absolute",
                  color: "#fff",
                  fontFamily:
                    '"Microsoft YaHei", "IBM Plex Sans", "Segoe UI", sans-serif',
                  fontSize: 250,
                  fontWeight: 600,
                  lineHeight: 1,
                  letterSpacing: "-0.055em",
                  opacity,
                  transform: `translate3d(0, ${mix(22, 0, opacity)}px, 0) scale(${mix(0.97, 1, opacity)})`,
                  whiteSpace: "nowrap",
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

const formatElapsedTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

function ClockHand({
  width,
  height,
  rotation,
}: {
  width: number;
  height: number;
  rotation: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "50%",
        left: "50%",
        width,
        height,
        marginLeft: -width / 2,
        background: "currentColor",
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "50% 100%",
      }}
    />
  );
}

function ProblemScene() {
  const frame = useCurrentFrame();
  const localFrame = frame - PROBLEM_START;
  const push = between(
    localFrame,
    0,
    OPENING_PROTOTYPE_FPS * 4,
    Easing.in(Easing.quad),
  );
  const clockIn = between(localFrame, 15, 26, Easing.out(Easing.cubic));
  const spin = between(localFrame, 15, 218, Easing.in(Easing.poly(4)));
  const elapsed = Math.round(171138 * spin);
  const lines = [
    { text: "Project management", start: 22, emphasis: false },
    { text: "takes more time", start: 52, emphasis: true },
    { text: "than the project itself.", start: 82, emphasis: false },
  ] as const;

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#fff" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          color: "#0a0a0a",
          transform: `scale(${mix(1, 1.075, push)})`,
          transformOrigin: "50% 50%",
          willChange: "transform",
        }}
      >
        <div style={{ position: "absolute", top: 190, left: 124, width: 960 }}>
          {lines.map((line) => {
            const enter = between(
              localFrame,
              line.start,
              line.start + 19,
              Easing.out(Easing.cubic),
            );
            return (
              <div
                key={line.text}
                style={{
                  margin: line.emphasis ? "20px 0" : 0,
                  fontFamily:
                    '"Microsoft YaHei", "IBM Plex Sans", "Segoe UI", sans-serif',
                  fontSize: line.emphasis ? 112 : 78,
                  fontWeight: line.emphasis ? 760 : 520,
                  lineHeight: 1.06,
                  letterSpacing: line.emphasis ? "-0.064em" : "-0.052em",
                  opacity: enter,
                  transform: `translate3d(0, ${mix(28, 0, enter)}px, 0)`,
                  whiteSpace: "nowrap",
                }}
              >
                {line.text}
              </div>
            );
          })}
        </div>

        <div
          style={{
            position: "absolute",
            top: 150,
            right: 132,
            display: "grid",
            width: 460,
            justifyItems: "center",
            opacity: clockIn,
            transform: `scale(${mix(0.96, 1, clockIn)})`,
          }}
        >
          <div
            style={{
              position: "relative",
              width: 390,
              height: 390,
              border: "5px solid currentColor",
              borderRadius: "50%",
              boxSizing: "border-box",
            }}
          >
            {Array.from({ length: 12 }, (_, index) => (
              <span
                key={index}
                style={{
                  position: "absolute",
                  top: 14,
                  left: "calc(50% - 2px)",
                  width: 4,
                  height: 22,
                  background: "currentColor",
                  transform: `rotate(${index * 30}deg)`,
                  transformOrigin: "2px 176px",
                }}
              />
            ))}
            <ClockHand width={9} height={104} rotation={1080 * spin} />
            <ClockHand width={6} height={144} rotation={3240 * spin} />
            <ClockHand width={3} height={164} rotation={7200 * spin} />
            <div
              style={{
                position: "absolute",
                top: "calc(50% - 9px)",
                left: "calc(50% - 9px)",
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "currentColor",
              }}
            />
          </div>
          <div
            style={{
              marginTop: 42,
              fontFamily: '"IBM Plex Mono", Consolas, monospace',
              fontSize: 72,
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1,
              letterSpacing: "-0.055em",
            }}
          >
            {formatElapsedTime(elapsed)}
          </div>
          <div
            style={{
              marginTop: 18,
              fontFamily: '"IBM Plex Mono", Consolas, monospace',
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "0.14em",
            }}
          >
            TIME SPENT MANAGING
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: push * 0.12,
          background:
            "radial-gradient(ellipse 65% 60% at 50% 50%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.55) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
}

export function OpeningSequencePrototype({
  includeAudio = true,
}: {
  includeAudio?: boolean;
}) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {includeAudio ? (
        <>
          <Audio
            src={openingBgmAudio}
            volume={(audioFrame) =>
              audioFrame < PROBLEM_START ? 0.2 : 0.07
            }
            pauseWhenBuffering
          />
          <Sequence from={PROBLEM_START}>
            <Audio src={projectAudio} pauseWhenBuffering />
          </Sequence>
        </>
      ) : null}
      {frame < PROBLEM_START ? <OpeningMosaic /> : <ProblemScene />}
    </AbsoluteFill>
  );
}
