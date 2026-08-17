"use client";

import {
  IconArrowUp,
  IconArrowUpRight,
  IconBolt,
  IconBrandOpenai,
  IconCheck,
  IconChevronDown,
  IconClock,
  IconInfoCircle,
  IconPlayerPlayFilled,
  IconPlayerStopFilled,
  IconPlus,
  IconPointerFilled,
  IconRocket,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import type { CSSProperties } from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  interpolateColors,
  useCurrentFrame,
} from "remotion";
import autoAmber from "../assets/auto-theme-amber.webp";
import autoAqua from "../assets/auto-theme-aqua.webp";
import autoCobalt from "../assets/auto-theme-cobalt.webp";
import autoLime from "../assets/auto-theme-lime.webp";
import autoMonochrome from "../assets/auto-theme-monochrome.webp";
import autoRose from "../assets/auto-theme-rose.webp";
import autoViolet from "../assets/auto-theme-violet.webp";
import buildBusiness from "../assets/build-business.webp";
import buildSystem from "../assets/build-system.webp";
import buildTeam from "../assets/build-team.webp";
import buildWorld from "../assets/build-world.webp";
import learnReferenceData from "../assets/learn-reference-data.webp";
import learnReferenceMars from "../assets/learn-reference-mars.webp";
import learnReferenceOrbitSketch from "../assets/learn-reference-orbit-sketch.webp";
import learnStarfield from "../assets/learn-starfield.webp";
import rocketLaunch from "../assets/rocket-launch.webp";
import styles from "../opening-sequence.module.css";
import { OpeningSequencePrototype } from "./OpeningSequencePrototype";

export const OPENING_SEQUENCE_FPS = 60;
export const OPENING_SEQUENCE_DURATION = 60 * OPENING_SEQUENCE_FPS;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const frameAt = (seconds: number) => Math.round(seconds * OPENING_SEQUENCE_FPS);
const assetSource = (asset: string | { src: string }) =>
  typeof asset === "string" ? asset : asset.src;
const between = (
  frame: number,
  start: number,
  end: number,
  easing: (value: number) => number = Easing.linear,
) => interpolate(frame, [start, end], [0, 1], { ...clamp, easing });
const mix = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;
// Apex of IconPointerFilled's 24px path mapped onto the rendered 42px cursor.
const POINTER_TIP_X = 42 * (3.039 / 24);
const POINTER_TIP_Y = 42 * (4.277 / 24);
const stagedValue = (
  frame: number,
  initial: number,
  stages: Array<{
    start: number;
    end: number;
    to: number;
    easing?: (value: number) => number;
  }>,
) => {
  let value = initial;
  for (const stage of stages) {
    if (frame < stage.start) return value;
    const next = mix(
      value,
      stage.to,
      between(
        frame,
        stage.start,
        stage.end,
        stage.easing ?? Easing.inOut(Easing.cubic),
      ),
    );
    if (frame <= stage.end) return next;
    value = stage.to;
  }
  return value;
};

const editorialPages = [
  {
    number: "01.",
    title: "Planning",
    color: "#5973ff",
    transitionColors: ["#d8deff", "#98a9ff"],
    topics: ["Scope", "Milestones", "Dependencies"],
    body: "Turn an idea into a sequence of decisions, dates, and deliverables.",
    note: "The plan changes before the work even begins.",
  },
  {
    number: "02.",
    title: "Assigning",
    color: "#ff6b2c",
    transitionColors: ["#9070b9", "#c86e72"],
    topics: ["Ownership", "Capacity", "Handoffs"],
    body: "Match every task with the right person, context, and deadline.",
    note: "Every handoff creates another place to lose momentum.",
  },
  {
    number: "03.",
    title: "Prioritizing",
    color: "#ff4055",
    transitionColors: ["#ff5d3a", "#ff4e47"],
    topics: ["Impact", "Urgency", "Trade-offs"],
    body: "Decide what moves now, what waits, and what no longer matters.",
    note: "The queue keeps changing while the project moves.",
  },
  {
    number: "04.",
    title: "Updating",
    color: "#c8f33d",
    transitionColors: ["#ed7c4d", "#dab745"],
    topics: ["Status", "Blockers", "Reporting"],
    body: "Keep plans, people, and progress synchronized as the work changes.",
    note: "Then explain the same change everywhere else.",
  },
] as const;

const automationThemes = [
  {
    id: "rose",
    source: assetSource(autoRose),
    accent: "#ef3d86",
    hero: "#fff9fb",
    card: "rgba(255, 252, 253, 0.94)",
    cardMuted: "rgba(255, 240, 246, 0.92)",
    shadow: "rgba(105, 45, 70, 0.2)",
  },
  {
    id: "cobalt",
    source: assetSource(autoCobalt),
    accent: "#2f65ff",
    hero: "#ffffff",
    card: "rgba(248, 250, 255, 0.94)",
    cardMuted: "rgba(233, 239, 255, 0.92)",
    shadow: "rgba(16, 45, 112, 0.22)",
  },
  {
    id: "aqua",
    source: assetSource(autoAqua),
    accent: "#008f8b",
    hero: "#f6ffff",
    card: "rgba(247, 255, 254, 0.94)",
    cardMuted: "rgba(221, 249, 245, 0.92)",
    shadow: "rgba(12, 78, 75, 0.22)",
  },
  {
    id: "violet",
    source: assetSource(autoViolet),
    accent: "#8b4ee8",
    hero: "#fffaff",
    card: "rgba(253, 249, 255, 0.94)",
    cardMuted: "rgba(244, 231, 255, 0.92)",
    shadow: "rgba(73, 31, 103, 0.23)",
  },
  {
    id: "amber",
    source: assetSource(autoAmber),
    accent: "#e46d1b",
    hero: "#fffdf7",
    card: "rgba(255, 253, 247, 0.94)",
    cardMuted: "rgba(255, 239, 215, 0.93)",
    shadow: "rgba(105, 55, 15, 0.23)",
  },
  {
    id: "lime",
    source: assetSource(autoLime),
    accent: "#779b00",
    hero: "#fbfff2",
    card: "rgba(252, 255, 246, 0.94)",
    cardMuted: "rgba(238, 249, 205, 0.93)",
    shadow: "rgba(45, 65, 11, 0.24)",
  },
  {
    id: "monochrome",
    source: assetSource(autoMonochrome),
    accent: "#202125",
    hero: "#ffffff",
    card: "rgba(252, 252, 252, 0.94)",
    cardMuted: "rgba(231, 232, 234, 0.93)",
    shadow: "rgba(0, 0, 0, 0.24)",
  },
] as const;

type AutomationVars = CSSProperties & {
  "--auto-accent": string;
  "--auto-hero": string;
  "--auto-card": string;
  "--auto-card-muted": string;
  "--auto-shadow": string;
};

function EditorialScene() {
  const frame = useCurrentFrame();
  const pageIndex = Math.min(3, Math.floor(frame / 60));
  const beatFrame = frame - pageIndex * 60;
  const page = editorialPages[pageIndex];
  const enter = between(beatFrame, 0, 12, Easing.out(Easing.cubic));
  const titleReveal = between(beatFrame, 4, 34, Easing.out(Easing.cubic));
  const cameraScale = mix(
    1,
    1.08,
    between(frame, 0, 240, Easing.inOut(Easing.sin)),
  );
  const background = interpolateColors(
    beatFrame,
    [0, 11, 32],
    [page.transitionColors[0], page.transitionColors[1], page.color],
  );

  return (
    <div className={styles.editorialScene} style={{ background }}>
      <div
        className={styles.editorialCamera}
        style={{ transform: `scale(${cameraScale})`, transformOrigin: "0 0" }}
      >
        <article
          className={styles.editorialPage}
          style={{ opacity: enter, transform: `translateY(${mix(18, 0, enter)}px)` }}
        >
          <header className={styles.editorialHeader}>
            <span className={styles.editorialNumber}>{page.number}</span>
            <div className={styles.editorialTopics}>
              {page.topics.map((topic) => (
                <span key={topic}>{topic}</span>
              ))}
            </div>
            <span className={styles.editorialCategory}>Project operations</span>
          </header>
          <h2 className={styles.editorialTitle}>
            <span
              className={styles.decryptedTitle}
              style={{ clipPath: `inset(0 ${(1 - titleReveal) * 100}% 0 0)` }}
            >
              {page.title}
            </span>
          </h2>
          <div className={styles.editorialFooter}>
            <p>{page.body}</p>
            <p>{page.note}</p>
          </div>
        </article>
      </div>
    </div>
  );
}

const questionLines = ["What if", "all of that", "happened", "automatically?"];
const questionTextLength = questionLines.reduce(
  (total, line) => total + line.length,
  0,
);
const AUTOMATION_QUESTION_TYPING_START = 105;
const AUTOMATION_QUESTION_TYPING_END = 235;

function AutomationScene() {
  const frame = useCurrentFrame();
  const themeOrder = [1, 2, 3, 4, 5, 6, 0];
  const themeStep = Math.min(
    themeOrder.length - 1,
    Math.max(0, Math.floor((frame - 14) / 13)),
  );
  const themeIndex = frame < 14 ? 0 : themeOrder[themeStep];
  const theme = automationThemes[themeIndex];
  const cameraScale = mix(
    1,
    1.35,
    between(frame, 0, 110, Easing.inOut(Easing.cubic)),
  );
  const typedCharacters = Math.round(
    mix(
      0,
      questionTextLength,
      between(
        frame,
        AUTOMATION_QUESTION_TYPING_START,
        AUTOMATION_QUESTION_TYPING_END,
      ),
    ),
  );
  const visibleLines = questionLines.map((line, index) => {
    const charactersBefore = questionLines
      .slice(0, index)
      .reduce((total, previousLine) => total + previousLine.length, 0);
    return line.slice(
      0,
      Math.max(0, Math.min(line.length, typedCharacters - charactersBefore)),
    );
  });
  const activeLine = visibleLines.findIndex(
    (line, index) => line.length < questionLines[index].length,
  );
  const variables: AutomationVars = {
    "--auto-accent": theme.accent,
    "--auto-hero": theme.hero,
    "--auto-card": theme.card,
    "--auto-card-muted": theme.cardMuted,
    "--auto-shadow": theme.shadow,
  };

  return (
    <div className={styles.automationScene} style={variables}>
      <div
        className={styles.automationCamera}
        style={{ transform: `scale(${cameraScale})`, transformOrigin: "50% 50%" }}
      >
        <div className={styles.automationBackgrounds}>
          {automationThemes.map((item, index) => (
            <Img
              key={item.id}
              className={styles.automationBackground}
              src={item.source}
              alt=""
              style={{ opacity: index === themeIndex ? 1 : 0 }}
            />
          ))}
        </div>
        <div className={styles.automationWash} />
        <div className={styles.automationCollage}>
          <article className={`${styles.autoCard} ${styles.autoProfile}`}>
            <div className={styles.autoEyebrow}>
              <span className={styles.autoAvatar}>S</span>
              Product launch
            </div>
            <h3>Sarah</h3>
            <p>Design lead · Brand systems</p>
            <div className={styles.autoRule} />
            <div className={styles.autoRow}>
              <span>Homepage revision</span>
              <span className={styles.autoPill}>Today</span>
            </div>
            <div className={styles.autoRow}>
              <span>User research</span>
              <IconCheck size={18} stroke={2.4} />
            </div>
          </article>
          <article className={`${styles.autoCard} ${styles.autoCount}`}>
            <strong>12</strong><span>Tasks today</span>
          </article>
          <article className={`${styles.autoCard} ${styles.autoAccentCard} ${styles.autoGrowth}`}>
            <IconArrowUpRight size={30} stroke={2.4} /><strong>+23%</strong><span>Velocity</span>
          </article>
          <article className={`${styles.autoCard} ${styles.autoLeftList}`}>
            <span className={styles.autoKicker}>Launch sequence</span>
            {["Approve headline", "Assign reviewers", "Prepare campaign", "Run QA"].map((item, index) => (
              <div className={styles.autoChecklistRow} key={item}>
                <span className={index < 2 ? styles.autoChecked : ""}>
                  {index < 2 ? <IconCheck size={15} stroke={3} /> : null}
                </span>
                {item}
              </div>
            ))}
          </article>
          <h2
            className={styles.automationQuestion}
            style={{ opacity: 1 - between(frame, 95, 112, Easing.inOut(Easing.cubic)) }}
          >
            {questionLines.map((line, index) => (
              <span className={index === 3 ? styles.automationAccent : undefined} key={line}>{line}</span>
            ))}
          </h2>
          <h2
            className={`${styles.automationQuestion} ${styles.automationQuestionTyped}`}
            style={{ opacity: between(frame, 100, 112, Easing.inOut(Easing.cubic)) }}
          >
            {visibleLines.map((line, index) => (
              <span className={index === 3 ? styles.automationAccent : undefined} key={questionLines[index]}>
                {line}
                {typedCharacters < questionTextLength &&
                index === (activeLine === -1 ? questionLines.length - 1 : activeLine)
                  ? "▌"
                  : ""}
              </span>
            ))}
          </h2>
          <article className={`${styles.autoCard} ${styles.autoBoard}`}>
            <div className={styles.autoBoardHeader}>
              <span>Product launch</span>
              <div className={styles.autoAvatarStack}><span>A</span><span>M</span><span>J</span></div>
            </div>
            <div className={styles.autoBoardColumns}>
              {["To do", "In progress", "Done"].map((label) => <div key={label}><span>{label}</span><i /><i /></div>)}
            </div>
          </article>
          <article className={`${styles.autoCard} ${styles.autoAccentCard} ${styles.autoPercent}`}>
            <strong>%</strong><span>68%</span><small>Complete</small>
          </article>
          <article className={`${styles.autoCard} ${styles.autoQueue}`}>
            <div className={styles.autoSectionTitle}><IconSparkles size={21} stroke={2.3} />AI priority queue</div>
            <div className={styles.autoQueueRow}><span>Launch planning</span><b>Ready</b></div>
            <div className={styles.autoQueueRow}><span>Review resources</span><b>Assigned</b></div>
          </article>
          <article className={`${styles.autoCard} ${styles.autoDuration}`}>
            <IconClock size={22} stroke={2.2} /><strong>3d</strong><span>Saved this week</span>
          </article>
          <article className={`${styles.autoCard} ${styles.autoActivity}`}>
            <span>Actions run</span><strong>1,247</strong>
            <div className={styles.autoSparkline}><i /><i /><i /><i /><i /></div>
          </article>
          <article className={`${styles.autoCard} ${styles.autoAccentCard} ${styles.autoAi}`}>
            <IconBolt size={38} stroke={2.2} /><strong>AI</strong>
          </article>
          <article className={`${styles.autoCard} ${styles.autoProgress}`}>
            <span>Capacity</span><div className={styles.autoProgressTrack}><i /></div><strong>72%</strong>
          </article>
          <article className={`${styles.autoCard} ${styles.autoTaskList}`}>
            <div className={styles.autoSectionTitle}><IconSparkles size={21} stroke={2.3} />Work happening now</div>
            {[["Create launch brief", "In progress"], ["Coordinate design review", "Assigned"], ["Update project timeline", "Complete"]].map(([task, status]) => (
              <div className={styles.autoTaskRow} key={task}><span>{task}</span><b>{status}</b></div>
            ))}
          </article>
          <article className={`${styles.autoCard} ${styles.autoMembers}`}>
            <IconUsers size={25} stroke={2.2} /><strong>200+</strong><span>Collaborators</span>
          </article>
          <article className={`${styles.autoCard} ${styles.autoAccentCard} ${styles.autoMilestones}`}>
            <strong>15</strong><span>Milestones</span>
          </article>
          <article className={`${styles.autoCard} ${styles.autoRating}`}>
            <span>Execution score</span><strong>4.7</strong><small>Excellent</small>
          </article>
          <article className={`${styles.autoCard} ${styles.autoBanner}`}>
            <div><span>From idea to impact</span><strong>Ship faster.</strong></div>
            <button type="button" tabIndex={-1}>Start now<IconArrowUpRight size={20} stroke={2.4} /></button>
          </article>
        </div>
      </div>
    </div>
  );
}

const chatPrompt = "Launch this project.";
const chatModelCenter = { x: 1303, y: 672 } as const;
const chatSliderStartCenter = { x: 1227, y: 538 } as const;
const chatSendCenter = { x: 1469, y: 669 } as const;

function ChatScene() {
  const frame = useCurrentFrame();
  const typedCount = Math.round(mix(0, chatPrompt.length, between(frame, 3, 60)));
  const prompt = chatPrompt.slice(0, typedCount);
  const modelFocus = between(frame, 53, 105, Easing.inOut(Easing.cubic));
  const cameraScale = mix(1, 1.32, modelFocus);
  const cameraX = stagedValue(frame, 0, [
    { start: 53, end: 105, to: -769.2 },
    { start: 226, end: 264, to: -981.72 },
  ]);
  const cameraY = mix(0, -349.68, modelFocus);
  const slider = between(frame, 162, 212, Easing.inOut(Easing.cubic));
  const cursorX = stagedValue(frame, 1120, [
    { start: 68, end: 108, to: chatModelCenter.x - POINTER_TIP_X },
    { start: 126, end: 162, to: chatSliderStartCenter.x - POINTER_TIP_X },
    { start: 162, end: 212, to: chatSliderStartCenter.x + 162 - POINTER_TIP_X },
    { start: 226, end: 264, to: chatSendCenter.x - POINTER_TIP_X },
  ]);
  const cursorY = stagedValue(frame, 860, [
    { start: 68, end: 108, to: chatModelCenter.y - POINTER_TIP_Y },
    { start: 126, end: 162, to: chatSliderStartCenter.y - POINTER_TIP_Y },
    { start: 226, end: 264, to: chatSendCenter.y - POINTER_TIP_Y },
  ]);
  const popoverIn = between(frame, 106, 124, Easing.out(Easing.cubic));
  const popoverOut = between(frame, 216, 226, Easing.in(Easing.cubic));
  const popoverOpacity = popoverIn * (1 - popoverOut);
  const sent = frame >= 268;
  const modelPress = between(frame, 104, 109, Easing.out(Easing.cubic)) *
    (1 - between(frame, 109, 118, Easing.out(Easing.cubic)));
  const sliderHeld = between(frame, 158, 164, Easing.out(Easing.cubic)) *
    (1 - between(frame, 212, 218, Easing.out(Easing.cubic)));
  const press = between(frame, 258, 265, Easing.out(Easing.cubic)) *
    (1 - between(frame, 265, 274, Easing.out(Easing.cubic)));
  const cursorPress = Math.max(modelPress, sliderHeld, press);

  return (
    <div className={styles.chatScene}>
      <div
        className={styles.chatCamera}
        style={{
          transform: `translate(${cameraX}px, ${cameraY}px) scale(${cameraScale})`,
          transformOrigin: "0 0",
        }}
      >
        <div className={styles.chatHeader}>
          <IconBrandOpenai size={70} stroke={1.8} />
          <h2>Hi! How can I help you today?</h2>
          <p>Bring the idea. AI handles the execution.</p>
        </div>

        <div className={styles.chatComposer}>
          <div className={styles.composerPrompt}>
            <span>{prompt}</span>
            <span
              className={styles.composerCaret}
              style={{
                opacity:
                  !sent &&
                  frame >= 3 &&
                  frame < 62 &&
                  Math.floor(frame / 18) % 2 === 0
                    ? 1
                    : 0,
              }}
            />
          </div>
          <button className={styles.composerAdd} type="button" tabIndex={-1}>
            <IconPlus size={30} stroke={1.8} />
          </button>
          <div
            className={styles.reasoningPopover}
            style={{
              opacity: popoverOpacity,
              transform: `translateY(${mix(14, 0, popoverIn)}px) scale(${mix(0.97, 1, popoverIn)})`,
              pointerEvents: "none",
            }}
          >
            <div className={styles.reasoningHeader}>
              <span>Reasoning effort</span>
              <span>{slider >= 0.96 ? "Ultra" : "Medium"}</span>
            </div>
            <div className={styles.reasoningTrack}>
              <div className={styles.reasoningFill} style={{ width: `${50 + slider * 50}%` }} />
              <div data-opening-target="chat-slider" className={styles.reasoningThumb} style={{ transform: `translate(calc(-50% + ${slider * 162}px), -50%)` }} />
            </div>
            <div className={styles.reasoningScale}>
              <span>Low</span><span>Medium</span><span>Ultra</span>
            </div>
          </div>
          <button
            data-opening-target="chat-model"
            className={styles.modelButton}
            type="button"
            tabIndex={-1}
            style={{ transform: `scale(${1 - modelPress * 0.1})` }}
          >
            <IconBrandOpenai size={24} stroke={1.9} />
            <span>{slider >= 0.96 ? "5.6 Sol Ultra" : "5.6 Sol Medium"}</span>
            <IconChevronDown size={20} stroke={2.1} />
          </button>
          <button
            className={styles.sendButton}
            data-opening-target="chat-send"
            type="button"
            tabIndex={-1}
            style={{
              backgroundColor: sent ? "#111114" : "#ececef",
              transform: `scale(${1 - press * 0.13})`,
            }}
          >
            <span className={styles.sendState} style={{ opacity: sent ? 0 : 1, transform: `scale(${sent ? 0.58 : 1})` }}>
              <IconArrowUp size={26} stroke={2.4} />
            </span>
            <span className={styles.sendState} style={{ opacity: sent ? 1 : 0, transform: `scale(${sent ? 1 : 0.62})` }}>
              <IconPlayerStopFilled size={19} />
            </span>
          </button>
        </div>

        <div
          className={styles.fakeCursor}
          data-opening-cursor="chat"
          style={{
            opacity: between(frame, 58, 70) * (1 - between(frame, 274, 286)),
            transform: `translate(${cursorX}px, ${cursorY}px) scale(${1 - cursorPress * 0.12})`,
          }}
        >
          <IconPointerFilled size={42} />
        </div>
      </div>
    </div>
  );
}

function RocketTransition() {
  const frame = useCurrentFrame();
  const x = stagedValue(frame, 0, [
    { start: 0, end: 13, to: 34, easing: Easing.out(Easing.cubic) },
    { start: 13, end: 38, to: 140, easing: Easing.in(Easing.cubic) },
    { start: 38, end: 82, to: 760, easing: Easing.out(Easing.cubic) },
  ]);
  const y = stagedValue(frame, 0, [
    { start: 0, end: 13, to: -18, easing: Easing.out(Easing.cubic) },
    { start: 13, end: 38, to: -90, easing: Easing.in(Easing.cubic) },
    { start: 38, end: 82, to: -360, easing: Easing.out(Easing.cubic) },
  ]);
  const scale = stagedValue(frame, 0.045, [
    { start: 0, end: 13, to: 0.32, easing: Easing.out(Easing.back(2)) },
    { start: 13, end: 38, to: 4.8, easing: Easing.in(Easing.cubic) },
    { start: 38, end: 82, to: 0.09, easing: Easing.out(Easing.cubic) },
  ]);

  return (
    <div className={styles.rocketTransition}>
      <Img
        className={styles.rocketSprite}
        src={assetSource(rocketLaunch)}
        alt=""
        style={{ transform: `translate(${x}px, ${y}px) scale(${scale})`, opacity: between(frame, 0, 4) * (1 - between(frame, 76, 82)) }}
      />
    </div>
  );
}

const lessonPrompt = "Turn these references into an interactive lesson.";
const lessonSendCenter = { x: 1613, y: 801 } as const;
const lessonReferences = [
  { source: assetSource(learnReferenceMars), title: "Mars observation", detail: "Planetary image · PNG", fromX: -640, fromY: -230, rotation: -11 },
  { source: assetSource(learnReferenceOrbitSketch), title: "Orbit sketch", detail: "Class notes · PNG", fromX: 0, fromY: -540, rotation: 6 },
  { source: assetSource(learnReferenceData), title: "Earth & Mars data", detail: "Textbook page · PNG", fromX: 640, fromY: -220, rotation: 12 },
] as const;

function LearnScene() {
  const frame = useCurrentFrame();
  const learnIn = between(frame, 12, 32, Easing.out(Easing.cubic));
  const learnDock = between(frame, 60, 100, Easing.inOut(Easing.cubic));
  const workbenchIn = between(frame, 80, 110, Easing.out(Easing.cubic));
  const typed = Math.round(mix(0, lessonPrompt.length, between(frame, 215, 297)));
  const cursorIn = between(frame, 270, 282);
  const cursorMove = between(frame, 282, 330, Easing.inOut(Easing.cubic));
  const clicked = frame >= 333;
  const press = between(frame, 328, 333) * (1 - between(frame, 333, 340));

  return (
    <div className={styles.learnSpaceScene}>
      <Img
        className={styles.learnSpaceBackground}
        src={assetSource(learnStarfield)}
        alt=""
        style={{ transform: `scale(${mix(1.08, 1, between(frame, 0, 72, Easing.out(Easing.cubic)))})` }}
      />
      <span
        className={styles.spaceLearnWord}
        style={{
          opacity: learnIn * (1 - between(frame, 92, 108)),
          transform: `translate(${mix(0, -755, learnDock)}px, ${mix(24, -432, learnDock)}px) scale(${mix(1, 0.27, learnDock)})`,
        }}
      >
        Learn
      </span>
      <div
        className={styles.learnWorkbench}
        style={{ opacity: workbenchIn, transform: `translateY(${mix(44, 0, workbenchIn)}px)` }}
      >
        <div className={styles.lessonEyebrow}>REFERENCE → INTERACTION</div>
        <div className={styles.lessonComposer}>
          <div className={styles.lessonComposerHeader}>
            <div className={styles.lessonComposerIdentity}>
              <span className={styles.lessonComposerLogo}><IconBrandOpenai size={29} stroke={1.8} /></span>
              <div><strong>Lesson builder</strong><span>3 references ready</span></div>
            </div>
            <span className={styles.lessonMode}>5.6 Sol Ultra</span>
          </div>
          <div className={styles.lessonReferenceRow}>
            {lessonReferences.map((reference, index) => {
              const enter = between(frame, 90 + index * 36, 130 + index * 36, Easing.out(Easing.cubic));
              return (
                <article
                  className={styles.lessonReferenceCard}
                  key={reference.title}
                  style={{
                    opacity: enter,
                    transform: `translate(${mix(reference.fromX, 0, enter)}px, ${mix(reference.fromY, 0, enter)}px) rotate(${mix(reference.rotation, 0, enter)}deg) scale(${mix(0.88, 1, enter)})`,
                  }}
                >
                  <Img src={reference.source} alt="" />
                  <div><strong>{reference.title}</strong><span>{reference.detail}</span></div>
                </article>
              );
            })}
          </div>
          <div className={styles.lessonPrompt}>
            <span>{lessonPrompt.slice(0, typed)}</span>
            <span
              className={styles.lessonPromptCaret}
              style={{
                opacity:
                  !clicked &&
                  frame >= 215 &&
                  frame < 305 &&
                  Math.floor(frame / 16) % 2 === 0
                    ? 1
                    : 0,
              }}
            />
          </div>
          <div className={styles.lessonComposerFooter}>
            <button type="button" tabIndex={-1}><IconPlus size={23} stroke={1.9} /></button>
            <span>Interactive lesson</span>
            <button data-opening-target="lesson-send" className={styles.lessonSendButton} type="button" tabIndex={-1} style={{ transform: `scale(${1 - press * 0.12})` }}>
              <IconArrowUp size={24} stroke={2.4} />
            </button>
          </div>
          <div className={styles.lessonBuildStatus} style={{ opacity: clicked ? between(frame, 333, 345) : 0 }}>
            <span style={{ animation: "none", transform: `rotate(${Math.max(0, frame - 333) * 12}deg)` }} />
            Building Orbit Lab
          </div>
        </div>
        <div
          className={styles.lessonCursor}
          data-opening-cursor="lesson"
          style={{
            opacity: cursorIn,
            transform: `translate(${mix(1260, lessonSendCenter.x - POINTER_TIP_X, cursorMove)}px, ${mix(930, lessonSendCenter.y - POINTER_TIP_Y, cursorMove)}px) scale(${1 - press * 0.12})`,
          }}
        >
          <IconPointerFilled size={42} />
        </div>
      </div>
    </div>
  );
}

function OrbitMetric({
  title,
  value,
  unit,
  earthWidth,
  marsWidth,
  marsLabel,
}: {
  title: string;
  value: string;
  unit: string;
  earthWidth: string;
  marsWidth: string;
  marsLabel: string;
}) {
  return (
    <article className={styles.orbitMetricCard}>
      <div><span>{title}</span><IconInfoCircle size={18} stroke={1.8} /></div>
      <strong>{value} <small>{unit}</small></strong>
      <div className={styles.metricBar}><span style={{ width: earthWidth }} /><span style={{ width: marsWidth }} /></div>
      <footer><span>Earth</span><span>{marsLabel}</span></footer>
    </article>
  );
}

function OrbitScene() {
  const frame = useCurrentFrame();
  const shellIn = between(frame, 0, 28, Easing.out(Easing.cubic));
  const headerIn = between(frame, 10, 42, Easing.out(Easing.cubic));
  const canvasIn = between(frame, 20, 54, Easing.out(Easing.cubic));
  const metricsIn = between(frame, 30, 62, Easing.out(Easing.cubic));
  const controlsIn = between(frame, 44, 72, Easing.out(Easing.cubic));
  const orbitDragProgress = between(frame, 110, 195, Easing.inOut(Easing.cubic));
  const orbitProgress = mix(0, 0.72, orbitDragProgress);
  const earthAngle = -Math.PI / 2 + orbitProgress * Math.PI * 2 * 1.88;
  const marsAngle = -Math.PI / 2 + orbitProgress * Math.PI * 2;
  const earthX = Math.cos(earthAngle) * 252;
  const earthY = Math.sin(earthAngle) * 128;
  const marsX = Math.cos(marsAngle) * 392;
  const marsY = Math.sin(marsAngle) * 198;
  const timelineX = 920 * orbitProgress;
  const orbitSliderStartCenter = { x: 274, y: 921 } as const;
  const orbitSliderEndX = orbitSliderStartCenter.x + 920 * 0.72;
  const marsTargetX = 755 + marsX;
  const marsTargetY = 514.5 + marsY;
  const cursorX = stagedValue(frame, 230, [
    { start: 86, end: 106, to: orbitSliderStartCenter.x - POINTER_TIP_X },
    { start: 110, end: 195, to: orbitSliderEndX - POINTER_TIP_X },
    { start: 210, end: 255, to: marsTargetX - POINTER_TIP_X },
  ]);
  const cursorY = stagedValue(frame, 920, [
    { start: 86, end: 106, to: orbitSliderStartCenter.y - POINTER_TIP_Y },
    { start: 110, end: 195, to: orbitSliderStartCenter.y - POINTER_TIP_Y },
    { start: 210, end: 255, to: marsTargetY - POINTER_TIP_Y },
  ]);
  const orbitDragHeld = between(frame, 104, 110, Easing.out(Easing.cubic)) *
    (1 - between(frame, 195, 202, Easing.out(Easing.cubic)));
  const marsPress = between(frame, 252, 257, Easing.out(Easing.cubic)) *
    (1 - between(frame, 257, 266, Easing.out(Easing.cubic)));
  const marsSelected = between(frame, 260, 280, Easing.out(Easing.cubic));
  const cursorPress = Math.max(orbitDragHeld, marsPress);
  const insightIn = between(frame, 255, 280, Easing.out(Easing.cubic));
  const scrimIn = between(frame, 315, 338, Easing.inOut(Easing.cubic));
  const closingIn = between(frame, 330, 352, Easing.out(Easing.cubic));

  return (
    <div className={styles.orbitLabScene}>
      <div
        className={styles.orbitLabShell}
        style={{ opacity: shellIn * (1 - scrimIn * 0.34), transform: `translateY(${mix(36, 0, shellIn)}px) scale(${mix(0.97, 1, shellIn)})` }}
      >
        <header className={styles.orbitLabHeader} style={{ opacity: headerIn, transform: `translateY(${mix(-20, 0, headerIn)}px)` }}>
          <div className={styles.orbitBrand}>
            <span className={styles.orbitBrandMark}><IconRocket size={29} stroke={1.9} /></span>
            <div><strong>Orbit Lab</strong><span>Interactive astronomy lesson</span></div>
          </div>
          <nav><span className={styles.orbitNavActive}>Orbital motion</span><span>Compare</span><span>Notes</span></nav>
          <span className={styles.orbitGeneratedBadge}><IconSparkles size={17} stroke={2} />Generated from 3 references</span>
        </header>

        <main className={styles.orbitLabBody}>
          <section className={styles.orbitCanvas} style={{ opacity: canvasIn, transform: `translateY(${mix(38, 0, canvasIn)}px)` }}>
            <div className={styles.orbitCanvasHeading}>
              <div><span>LIVE MODEL</span><h2>Why does Mars take longer?</h2></div>
              <span className={styles.orbitScaleLabel}>Not to scale</span>
            </div>
            <div className={styles.orbitStage}>
              <div className={styles.marsOrbitRing} /><div className={styles.earthOrbitRing} />
              <div className={styles.orbitSun}><span /></div>
              <div className={styles.planetAnchor}>
                <div className={styles.earthPlanet} style={{ transform: `translate(${earthX}px, ${earthY}px)` }}><span /><small>Earth</small></div>
                <button data-opening-target="mars" className={styles.marsPlanet} type="button" tabIndex={-1} style={{ transform: `translate(${marsX}px, ${marsY}px) scale(${1 - marsPress * 0.12 + marsSelected * 0.16})` }}><span /><small>Mars</small></button>
              </div>
              <div className={styles.orbitDistanceHint}><span />Farther orbit → longer year</div>
            </div>
            <div className={styles.orbitControls} style={{ opacity: controlsIn, transform: `translateY(${mix(25, 0, controlsIn)}px)` }}>
              <div className={styles.orbitControlHeader}>
                <span className={styles.orbitPlayButton}><IconPlayerPlayFilled size={16} /></span>
                <strong>Move through one Martian year</strong><span>Day {Math.round(687 * orbitProgress)}</span>
              </div>
              <div className={styles.orbitTimelineTrack}>
                <div className={styles.orbitTimelineFill} style={{ width: `${orbitProgress * 100}%` }} />
                <div data-opening-target="orbit-slider" className={styles.orbitTimelineThumb} style={{ transform: `translate(calc(-50% + ${timelineX}px), -50%)` }} />
              </div>
              <div className={styles.orbitTimelineScale}><span>Launch</span><span>Earth · 365 days</span><span>Mars · 687 days</span></div>
            </div>
          </section>

          <aside className={styles.orbitMetrics} style={{ opacity: metricsIn, transform: `translateX(${mix(34, 0, metricsIn)}px)` }}>
            <div className={styles.orbitMetricsHeading}><span>COMPARE ORBITS</span><strong>Earth vs. Mars</strong></div>
            <OrbitMetric title="Distance from Sun" value="1.00" unit="AU" earthWidth="66%" marsWidth="100%" marsLabel="Mars · 1.52 AU" />
            <OrbitMetric title="Average speed" value="29.8" unit="km/s" earthWidth="100%" marsWidth="81%" marsLabel="Mars · 24.1 km/s" />
            <OrbitMetric title="Orbital period" value="365" unit="days" earthWidth="53%" marsWidth="100%" marsLabel="Mars · 687 days" />
            <div className={styles.marsInsight} style={{ opacity: insightIn, transform: `translateY(${mix(38, 0, insightIn)}px)` }}>
              <span className={styles.marsInsightEyebrow}>MARS · SELECTED</span>
              <div className={styles.marsInsightPlanet} />
              <h3>A longer path,<br />a slower orbit.</h3>
              <p>Mars is farther from the Sun, so it travels a wider orbit at a lower average speed.</p>
              <dl><div><dt>Distance</dt><dd>1.52 AU</dd></div><div><dt>Speed</dt><dd>24.1 km/s</dd></div><div><dt>One year</dt><dd>687 days</dd></div></dl>
              <span className={styles.marsInsightPrompt}>Drag the timeline to compare positions.</span>
            </div>
          </aside>
        </main>
      </div>
      <div data-opening-cursor="orbit" className={styles.orbitCursor} style={{ opacity: between(frame, 86, 100), transform: `translate(${cursorX}px, ${cursorY}px) scale(${1 - cursorPress * 0.12})` }}>
        <IconPointerFilled size={42} />
      </div>
      <div className={styles.orbitClosingScrim} style={{ opacity: scrimIn }} />
      <div className={styles.orbitClosingLine} style={{ opacity: closingIn, transform: `translate(-50%, calc(-50% + ${mix(24, 0, closingIn)}px))` }}>
        <span>Learn by exploring,</span><strong>not just reading.</strong>
      </div>
    </div>
  );
}

const buildVisuals = [
  { word: "business", source: assetSource(buildBusiness), label: "OPERATIONS DASHBOARD" },
  { word: "team", source: assetSource(buildTeam), label: "COLLABORATIVE WORKSPACE" },
  { word: "system", source: assetSource(buildSystem), label: "DATABASE & BACKEND" },
  { word: "world", source: assetSource(buildWorld), label: "PLAYABLE WORLD" },
] as const;
const buildBeatStarts = [98, 180, 262, 344] as const;

function BuildWord({ word, frame, start }: { word: string; frame: number; start: number }) {
  const enter = between(frame, start, start + 20, Easing.out(Easing.cubic));
  const leave = between(frame, start + 62, start + 82, Easing.in(Easing.cubic));
  return (
    <span style={{ opacity: enter * (1 - leave) }}>
      {word.split("").map((character, index) => {
        const charIn = between(frame, start + index * 2, start + 18 + index * 2, Easing.out(Easing.back(1.7)));
        return <span key={`${character}-${index}`} style={{ opacity: charIn * (1 - leave), transform: `translateY(${mix(54, 0, charIn)}px) rotateX(${mix(-68, 0, charIn)}deg)` }}>{character}</span>;
      })}
    </span>
  );
}

function BuildScene() {
  const frame = useCurrentFrame();
  const introIn = between(frame, 10, 24, Easing.out(Easing.cubic));
  const introOut = between(frame, 66, 96, Easing.in(Easing.cubic));
  const contentIn = between(frame, 88, 112, Easing.out(Easing.cubic));
  const activeIndex = Math.min(3, Math.max(0, buildBeatStarts.findLastIndex((start) => frame >= start)));
  const morph = between(frame, 430, 479, Easing.inOut(Easing.cubic));
  const visualX = mix(0, -445, morph);
  const visualScale = mix(1, 2.45, morph);

  return (
    <div className={styles.buildScene}>
      <span className={styles.buildChapterLabel}>CHAPTER 02 · BUILD</span>
      <span className={styles.buildIntroWord} style={{ opacity: introIn * (1 - introOut), transform: `translateY(${mix(40, -30, introOut)}px) scale(${mix(0.96, 1, introIn)})` }}>Build</span>
      <div className={styles.buildFixedCopy} style={{ opacity: contentIn * (1 - morph), transform: `translateY(${mix(35, 0, contentIn)}px)` }}>
        <span className={styles.buildLead}>Build a</span>
        <span className={styles.buildRotatingText}>
          {buildVisuals.map((visual, index) => <BuildWord key={visual.word} word={visual.word} frame={frame} start={buildBeatStarts[index]} />)}
        </span>
      </div>
      <div className={styles.buildVisualFrame} style={{ opacity: contentIn, borderRadius: `${mix(34, 0, morph)}px`, transform: `translateX(${visualX}px) scale(${visualScale})` }}>
        {buildVisuals.map((visual, index) => {
          const enter = between(frame, buildBeatStarts[index], buildBeatStarts[index] + 22, Easing.out(Easing.cubic));
          const leave = index === 3 ? 0 : between(frame, buildBeatStarts[index + 1], buildBeatStarts[index + 1] + 18, Easing.in(Easing.cubic));
          return <Img key={visual.word} src={visual.source} alt="" style={{ opacity: enter * (1 - leave), transform: `scale(${mix(1.08, 1, enter)})` }} />;
        })}
        {buildVisuals.map((visual, index) => {
          const visible = index === activeIndex && morph < 0.5;
          return <div key={visual.label} className={styles.buildVisualLabel} style={{ opacity: visible ? 1 : 0 }}><span>{String(index + 1).padStart(2, "0")} / 04</span><strong>{visual.label}</strong></div>;
        })}
      </div>
    </div>
  );
}

const planIdeas = [
  "Launch a climate startup",
  "Write a research paper",
  "Open a neighborhood café",
  "Design a lunar habitat",
  "Ship the next release",
  "Learn a new language",
  "Run a global event",
  "Build a new team",
  "Move across the world",
  "Create an indie game",
  "Start a podcast",
  "Plan a wedding",
  "Publish a first novel",
  "Restore a historic home",
  "Grow a community",
  "Map a five-year vision",
] as const;

const planNodes = [
  { className: styles.planNodeGoal, kicker: "GOAL", label: "Launch with confidence", icon: IconSparkles },
  { className: styles.planNodeMilestones, kicker: "MILESTONES", label: "Research → Build → Ship", icon: IconClock },
  { className: styles.planNodeTasks, kicker: "TASKS", label: "36 actionable steps", icon: IconCheck },
  { className: styles.planNodeOwners, kicker: "OWNERS", label: "6 collaborators aligned", icon: IconUsers },
] as const;
const planNodeOffsets = [{ x: -70, y: 170 }, { x: 10, y: 110 }, { x: 30, y: 110 }, { x: 50, y: 170 }] as const;
const planPaths = [
  "M 1090 555 C 900 580, 675 615, 460 700",
  "M 1090 555 C 980 620, 870 680, 780 760",
  "M 1090 555 C 1110 625, 1140 690, 1160 760",
  "M 1090 555 C 1270 580, 1435 625, 1540 700",
] as const;
const ghostCards = [
  [styles.planGhostOne, "Research audience"],
  [styles.planGhostTwo, "Prototype core flow"],
  [styles.planGhostThree, "Review success metrics"],
  [styles.planGhostFour, "Prepare launch assets"],
  [styles.planGhostFive, "Risk · Data migration"],
  [styles.planGhostSix, "Dependency · Design system"],
] as const;
const PLAN_ANYTHING_REVEAL_END = 132;
const PLAN_STATEMENT_HOLD_FRAMES = frameAt(1);
const PLAN_STATEMENT_FADE_START =
  PLAN_ANYTHING_REVEAL_END + PLAN_STATEMENT_HOLD_FRAMES;
const PLAN_STATEMENT_FADE_END = PLAN_STATEMENT_FADE_START + 22;

function PlanScene() {
  const frame = useCurrentFrame();
  const scan = between(frame, 0, 30, Easing.inOut(Easing.cubic));
  const blueprintOut = between(frame, 30, 48, Easing.inOut(Easing.cubic));
  const leadIn = between(frame, 50, 72, Easing.out(Easing.cubic));
  const leadShift = between(frame, 105, 128, Easing.inOut(Easing.cubic));
  const anythingIn = between(
    frame,
    108,
    PLAN_ANYTHING_REVEAL_END,
    Easing.out(Easing.cubic),
  );
  const canvasIn = between(frame, 122, 160, Easing.out(Easing.cubic));
  const timelineIn = between(frame, 188, 215, Easing.out(Easing.cubic));
  const ghostIn = between(frame, 250, 292, Easing.out(Easing.cubic));
  const cameraOut = between(frame, 288, 350, Easing.inOut(Easing.cubic));

  return (
    <div className={styles.planScene}>
      <Img className={styles.planBlueprintImage} src={assetSource(buildWorld)} alt="" style={{ opacity: 1 - blueprintOut, clipPath: `inset(0 ${(1 - scan) * 100}% 0 0)` }} />
      <div className={styles.planGrid} style={{ opacity: mix(0.3, 1, scan), transform: `scale(${mix(1.08, 1, scan)})` }} />
      <div className={styles.planScanLine} style={{ opacity: 1 - blueprintOut, transform: `translateX(${mix(-10, 1930, scan)}px)` }} />
      <div className={styles.planCamera} style={{ transform: `scale(${mix(1, 0.91, cameraOut)})` }}>
        <div className={styles.planIdeaCloud}>
          {planIdeas.map((idea, index) => {
            const itemIn = between(frame, 55 + index * 3, 82 + index * 3, Easing.out(Easing.cubic));
            const itemOut = between(frame, 120 + index, 148 + index, Easing.in(Easing.cubic));
            return <span key={idea} style={{ opacity: itemIn * (1 - itemOut), transform: `translateY(${mix(28, -10, itemIn)}px) scale(${mix(0.92, 1, itemIn)})` }}>{idea}</span>;
          })}
        </div>
        <span className={styles.planLead} style={{ opacity: leadIn * (1 - between(frame, PLAN_STATEMENT_FADE_START, PLAN_STATEMENT_FADE_END)), transform: `translateX(${mix(0, -360, leadShift)}px) scale(${mix(0.96, 1, leadIn)})` }}>Plan</span>
        <span className={styles.planAnything} style={{ opacity: anythingIn * (1 - between(frame, PLAN_STATEMENT_FADE_START, PLAN_STATEMENT_FADE_END)), clipPath: `inset(0 ${(1 - anythingIn) * 100}% 0 0)`, transform: `translateX(${mix(44, 0, anythingIn)}px)` }}>anything.</span>

        <div className={styles.planCanvas} style={{ opacity: canvasIn }}>
          <svg className={styles.planConnections} viewBox="0 0 1920 1080" aria-hidden="true">
            {planPaths.map((path, index) => {
              const draw = between(frame, 122 + index * 7, 160 + index * 7, Easing.inOut(Easing.cubic));
              return <path key={path} pathLength="1" d={path} style={{ opacity: draw, strokeDasharray: "1", strokeDashoffset: 1 - draw }} />;
            })}
          </svg>
          {planNodes.map((node, index) => {
            const land = between(frame, 200 + index * 6, 230 + index * 6, Easing.out(Easing.back(1.5)));
            const Icon = node.icon;
            return (
              <article key={node.kicker} className={`${styles.planNode} ${node.className}`} style={{ opacity: land, transform: `translate(${mix(planNodeOffsets[index].x, 0, land)}px, ${mix(planNodeOffsets[index].y, 0, land)}px) scale(${mix(0.88, 1, land)})` }}>
                <span className={styles.planNodeIcon}><Icon size={24} stroke={node.kicker === "TASKS" ? 2.1 : 1.9} /></span>
                <div><small>{node.kicker}</small><strong>{node.label}</strong></div>
                {node.kicker === "OWNERS" ? <span className={styles.planAvatarStack}><i>M</i><i>A</i><i>S</i></span> : null}
              </article>
            );
          })}
          <div className={styles.planTimeline} style={{ opacity: timelineIn, transform: `translateY(${mix(35, 0, timelineIn)}px)` }}>
            <span><i />TODAY</span><span><i />WEEK 2</span><span><i />WEEK 5</span><span><i />LAUNCH</span>
          </div>
          {ghostCards.map(([className, label], index) => {
            const enter = between(frame, 250 + index * 5, 280 + index * 5, Easing.out(Easing.cubic));
            return <span key={label} className={`${styles.planGhostCard} ${className}`} style={{ opacity: enter * ghostIn, transform: `translateY(${mix(26, 0, enter)}px)` }}>{label}</span>;
          })}
        </div>
      </div>
    </div>
  );
}

const finalStatement = "You bring the idea...\nAI handles the execution.";

function ClosingScene() {
  const frame = useCurrentFrame();
  const keywordIndex = frame < 39 ? 0 : frame < 70 ? 1 : 2;
  const keywords = ["Learn", "Build", "Plan"] as const;
  const keywordStarts = [15, 39, 70] as const;
  const keywordFadeStarts = [32, 62, 98] as const;
  const keywordFadeEnds = [38, 68, 126] as const;
  const keywordStart = keywordStarts[keywordIndex];
  const keywordIn = between(frame, keywordStart, keywordStart + 14, Easing.out(Easing.cubic));
  const keywordOut = between(
    frame,
    keywordFadeStarts[keywordIndex],
    keywordFadeEnds[keywordIndex],
    Easing.inOut(Easing.cubic),
  );
  const eraser = between(frame, 98, 126, Easing.inOut(Easing.cubic));
  const firstLineLength = "You bring the idea...\n".length;
  const firstTyped = Math.round(mix(0, firstLineLength, between(frame, 120, 210)));
  const secondTyped = Math.round(mix(firstLineLength, finalStatement.length, between(frame, 210, 300)));
  const typed = frame < 210 ? firstTyped : secondTyped;
  const copyIn = between(frame, 116, 132);
  const copyOut = between(frame, 382, 397, Easing.in(Easing.cubic));
  const cameraFocus = between(frame, 120, 172, Easing.inOut(Easing.cubic));
  const cameraBack = between(frame, 326, 374, Easing.inOut(Easing.cubic));
  const cameraScale = stagedValue(frame, 1, [
    { start: 120, end: 172, to: 1.34 },
    { start: 326, end: 374, to: 1 },
  ]);
  const cameraX = mix(0, -326, cameraFocus * (1 - cameraBack));
  const cameraY = mix(0, -100, cameraFocus * (1 - cameraBack));

  return (
    <div className={styles.closingScene}>
      <span className={styles.closingKeyword} style={{ opacity: keywordIn * (1 - keywordOut), clipPath: keywordIndex === 2 ? `inset(0 ${keywordOut * 100}% 0 0)` : undefined, transform: `translateY(${mix(24, 0, keywordIn) + mix(0, -18, keywordOut)}px)` }}>{keywords[keywordIndex]}</span>
      <span className={styles.closingEraser} style={{ opacity: eraser * (1 - between(frame, 126, 136)), transform: `translateX(${mix(0, 680, eraser)}px)` }} />
      <div className={styles.closingCamera} style={{ transform: `translate(${cameraX}px, ${cameraY}px) scale(${cameraScale})`, transformOrigin: "0 0" }}>
        <div className={styles.closingCopy} style={{ opacity: copyIn * (1 - copyOut) }}>
          <span>{finalStatement.slice(0, typed)}</span>
          <span className={styles.closingCaret} style={{ opacity: Math.floor(frame / 18) % 2 === 0 && copyOut < 1 ? 1 : 0 }} />
        </div>
      </div>
    </div>
  );
}

function BrandScene() {
  const frame = useCurrentFrame();
  const enter = between(frame, 22, 42, Easing.out(Easing.cubic));
  const lockup = between(frame, 82, 110, Easing.inOut(Easing.cubic));
  const wordIn = between(frame, 112, 140, Easing.out(Easing.cubic));
  const markScale = stagedValue(frame, 5.4, [
    { start: 22, end: 42, to: 0.92, easing: Easing.out(Easing.cubic) },
    { start: 42, end: 66, to: 1, easing: Easing.out(Easing.back(1.4)) },
  ]);

  return (
    <div className={styles.brandScene}>
      <div className={styles.brandLockup}>
        <span className={styles.brandMark} style={{ opacity: enter, transform: `translateX(${mix(0, -150, lockup)}px) scale(${markScale})` }}>
          <IconBrandOpenai size={150} stroke={1.8} />
        </span>
        <span className={styles.brandWord} style={{ opacity: wordIn, clipPath: `inset(0 ${(1 - wordIn) * 100}% 0 0)`, transform: `translateX(${mix(26, 0, wordIn)}px)` }}>ChatGPT</span>
      </div>
    </div>
  );
}

const audioSources = {
  bgm: new URL("../assets/audio/Neon Horizon.mp3", import.meta.url).href,
  project: new URL("../assets/audio/project.mp3", import.meta.url).href,
  planning: new URL("../assets/audio/planning.mp3", import.meta.url).href,
  assigning: new URL("../assets/audio/assigning.mp3", import.meta.url).href,
  prioritizing: new URL("../assets/audio/prioritizing.mp3", import.meta.url).href,
  updating: new URL("../assets/audio/updating.mp3", import.meta.url).href,
  whatIfAll: new URL("../assets/audio/whatifall.mp3", import.meta.url).href,
  idea: new URL("../assets/audio/idea.mp3", import.meta.url).href,
  execution: new URL("../assets/audio/execution.mp3", import.meta.url).href,
} as const;

const openingBgmVolume = (frame: number) => {
  const fadedVolume = frame < frameAt(52)
    ? 0.2
    : mix(0.2, 0, between(frame, frameAt(52), frameAt(60)));
  const duckedVolume =
    (frame >= frameAt(6) && frame < frameAt(18)) ||
    (frame >= frameAt(52) && frame < frameAt(56.5))
      ? 0.07
      : 0.2;
  return Math.min(fadedVolume, duckedVolume);
};

function OpeningAudio() {
  return (
    <>
      <Audio src={audioSources.bgm} volume={openingBgmVolume} pauseWhenBuffering />
      <Sequence from={frameAt(6)} durationInFrames={frameAt(4)}><Audio src={audioSources.project} pauseWhenBuffering /></Sequence>
      <Sequence from={frameAt(10)} durationInFrames={frameAt(1)}><Audio src={audioSources.planning} pauseWhenBuffering /></Sequence>
      <Sequence from={frameAt(11)} durationInFrames={frameAt(1)}><Audio src={audioSources.assigning} pauseWhenBuffering /></Sequence>
      <Sequence from={frameAt(12)} durationInFrames={frameAt(1)}><Audio src={audioSources.prioritizing} pauseWhenBuffering /></Sequence>
      <Sequence from={frameAt(13)} durationInFrames={frameAt(1)}><Audio src={audioSources.updating} pauseWhenBuffering /></Sequence>
      <Sequence from={frameAt(14) + AUTOMATION_QUESTION_TYPING_START} durationInFrames={frameAt(4)}><Audio src={audioSources.whatIfAll} pauseWhenBuffering /></Sequence>
      <Sequence from={frameAt(52)} durationInFrames={frameAt(1.5)}><Audio src={audioSources.idea} pauseWhenBuffering /></Sequence>
      <Sequence from={frameAt(53.5)} durationInFrames={frameAt(3)}><Audio src={audioSources.execution} pauseWhenBuffering /></Sequence>
    </>
  );
}

export function OpeningSequenceComposition() {
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <OpeningAudio />
      <Sequence durationInFrames={frameAt(10)}><OpeningSequencePrototype includeAudio={false} /></Sequence>
      <Sequence from={frameAt(10)} durationInFrames={frameAt(4)}><EditorialScene /></Sequence>
      <Sequence from={frameAt(14)} durationInFrames={frameAt(4)}><AutomationScene /></Sequence>
      <Sequence from={frameAt(18)} durationInFrames={frameAt(6)}><ChatScene /></Sequence>
      <Sequence from={frameAt(23.375)} durationInFrames={82}><RocketTransition /></Sequence>
      <Sequence from={frameAt(24)} durationInFrames={frameAt(6)}><LearnScene /></Sequence>
      <Sequence from={frameAt(30)} durationInFrames={frameAt(6)}><OrbitScene /></Sequence>
      <Sequence from={frameAt(36)} durationInFrames={frameAt(8)}><BuildScene /></Sequence>
      <Sequence from={frameAt(44)} durationInFrames={frameAt(6)}><PlanScene /></Sequence>
      <Sequence from={frameAt(50)} durationInFrames={398}><ClosingScene /></Sequence>
      <Sequence from={3398} durationInFrames={202}><BrandScene /></Sequence>
    </AbsoluteFill>
  );
}
