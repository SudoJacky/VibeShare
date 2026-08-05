"use client";

import { useGSAP } from "@gsap/react";
import {
  IconArrowUpRight,
  IconArrowUp,
  IconBrandOpenai,
  IconBolt,
  IconCheck,
  IconChevronDown,
  IconClock,
  IconInfoCircle,
  IconPlayerStopFilled,
  IconPlayerPlayFilled,
  IconPlus,
  IconPointerFilled,
  IconRocket,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import gsap from "gsap";
import { useRef, useState } from "react";
import autoAmber from "./assets/auto-theme-amber.png";
import autoAqua from "./assets/auto-theme-aqua.png";
import autoCobalt from "./assets/auto-theme-cobalt.png";
import autoLime from "./assets/auto-theme-lime.png";
import autoMonochrome from "./assets/auto-theme-monochrome.png";
import autoRose from "./assets/auto-theme-rose.png";
import autoViolet from "./assets/auto-theme-violet.png";
import assigningAudio from "./assets/audio/assigning.mp3?url";
import executionAudio from "./assets/audio/execution.mp3?url";
import ideaAudio from "./assets/audio/idea.mp3?url";
import planningAudio from "./assets/audio/planning.mp3?url";
import prioritizingAudio from "./assets/audio/prioritizing.mp3?url";
import projectAudio from "./assets/audio/project.mp3?url";
import updatingAudio from "./assets/audio/updating.mp3?url";
import whatIfAllAudio from "./assets/audio/whatifall.mp3?url";
import buildBusiness from "./assets/build-business.png";
import buildSystem from "./assets/build-system.png";
import buildTeam from "./assets/build-team.png";
import buildWorld from "./assets/build-world.png";
import learnStarfield from "./assets/learn-starfield.png";
import learnReferenceData from "./assets/learn-reference-data.png";
import learnReferenceMars from "./assets/learn-reference-mars.png";
import learnReferenceOrbitSketch from "./assets/learn-reference-orbit-sketch.png";
import page1 from "./assets/ai-pages-1.png";
import page2 from "./assets/ai-pages-2.png";
import page3 from "./assets/ai-pages-3.png";
import page4 from "./assets/ai-pages-4.png";
import page5 from "./assets/ai-pages-5.png";
import page6 from "./assets/ai-pages-6.png";
import page7 from "./assets/ai-pages-7.png";
import page8 from "./assets/ai-pages-8.png";
import page9 from "./assets/ai-pages-9.png";
import page10 from "./assets/ai-pages-10.png";
import page11 from "./assets/ai-pages-11.png";
import page12 from "./assets/ai-pages-12.png";
import page13 from "./assets/ai-pages-13.png";
import page14 from "./assets/ai-pages-14.png";
import page15 from "./assets/ai-pages-15.png";
import page16 from "./assets/ai-pages-16.png";
import page17 from "./assets/ai-pages-17.png";
import page18 from "./assets/ai-pages-18.png";
import page19 from "./assets/ai-pages-19.png";
import page20 from "./assets/ai-pages-20.png";
import rocketLaunch from "./assets/rocket-launch.png";
import { DecryptedText } from "./DecryptedText";
import { RotatingText } from "./RotatingText";
import styles from "./opening-sequence.module.css";

const CELL_WIDTH = 720;
const CELL_HEIGHT = 450;

const pageTiles = [
  { id: "one", source: page1.src, column: 2, row: 2 },
  { id: "two", source: page2.src, column: 4, row: 3 },
  { id: "three", source: page3.src, column: 2, row: 4 },
  { id: "four", source: page4.src, column: 4, row: 3 },
  { id: "five", source: page5.src, column: 2, row: 4 },
  { id: "six", source: page6.src, column: 1, row: 3 },
  { id: "seven", source: page7.src, column: 5, row: 3 },
  { id: "eight", source: page8.src, column: 1, row: 2 },
  { id: "nine", source: page9.src, column: 5, row: 4 },
  { id: "ten", source: page10.src, column: 4, row: 4 },
  { id: "eleven", source: page11.src, column: 1, row: 1 },
  { id: "twelve", source: page12.src, column: 5, row: 5 },
  { id: "thirteen", source: page13.src, column: 5, row: 1 },
  { id: "fourteen", source: page14.src, column: 1, row: 5 },
  { id: "fifteen", source: page15.src, column: 2, row: 1 },
  { id: "sixteen", source: page16.src, column: 4, row: 5 },
  { id: "seventeen", source: page17.src, column: 4, row: 1 },
  { id: "eighteen", source: page18.src, column: 2, row: 5 },
  { id: "nineteen", source: page19.src, column: 3, row: 1 },
  { id: "twenty", source: page20.src, column: 3, row: 5 },
];

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
];

const automationThemes = [
  {
    id: "rose",
    source: autoRose.src,
    accent: "#ef3d86",
    hero: "#fff9fb",
    card: "rgba(255, 252, 253, 0.94)",
    cardMuted: "rgba(255, 240, 246, 0.92)",
    shadow: "rgba(105, 45, 70, 0.2)",
  },
  {
    id: "cobalt",
    source: autoCobalt.src,
    accent: "#2f65ff",
    hero: "#ffffff",
    card: "rgba(248, 250, 255, 0.94)",
    cardMuted: "rgba(233, 239, 255, 0.92)",
    shadow: "rgba(16, 45, 112, 0.22)",
  },
  {
    id: "aqua",
    source: autoAqua.src,
    accent: "#008f8b",
    hero: "#f6ffff",
    card: "rgba(247, 255, 254, 0.94)",
    cardMuted: "rgba(221, 249, 245, 0.92)",
    shadow: "rgba(12, 78, 75, 0.22)",
  },
  {
    id: "violet",
    source: autoViolet.src,
    accent: "#8b4ee8",
    hero: "#fffaff",
    card: "rgba(253, 249, 255, 0.94)",
    cardMuted: "rgba(244, 231, 255, 0.92)",
    shadow: "rgba(73, 31, 103, 0.23)",
  },
  {
    id: "amber",
    source: autoAmber.src,
    accent: "#e46d1b",
    hero: "#fffdf7",
    card: "rgba(255, 253, 247, 0.94)",
    cardMuted: "rgba(255, 239, 215, 0.93)",
    shadow: "rgba(105, 55, 15, 0.23)",
  },
  {
    id: "lime",
    source: autoLime.src,
    accent: "#779b00",
    hero: "#fbfff2",
    card: "rgba(252, 255, 246, 0.94)",
    cardMuted: "rgba(238, 249, 205, 0.93)",
    shadow: "rgba(45, 65, 11, 0.24)",
  },
  {
    id: "monochrome",
    source: autoMonochrome.src,
    accent: "#202125",
    hero: "#ffffff",
    card: "rgba(252, 252, 252, 0.94)",
    cardMuted: "rgba(231, 232, 234, 0.93)",
    shadow: "rgba(0, 0, 0, 0.24)",
  },
];

const buildWords = ["business", "team", "system", "world"] as const;

const buildVisuals = [
  {
    word: "business",
    source: buildBusiness.src,
    label: "OPERATIONS DASHBOARD",
  },
  {
    word: "team",
    source: buildTeam.src,
    label: "COLLABORATIVE WORKSPACE",
  },
  {
    word: "system",
    source: buildSystem.src,
    label: "DATABASE & BACKEND",
  },
  {
    word: "world",
    source: buildWorld.src,
    label: "PLAYABLE WORLD",
  },
] as const;

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

const finalStatement = "You bring the idea...\nAI handles the execution.";

const OPENING_BPM = 120;
const OPENING_BEAT_SECONDS = 60 / OPENING_BPM;
const OPENING_GRID_SECONDS = OPENING_BEAT_SECONDS / 4;
const openingTimingAnchors = [
  [0, 0],
  [0.5, 0.5],
  [2.26, 2],
  [4.03, 4],
  [6.4, 6],
  [10.15, 10],
  [11.15, 11],
  [12.15, 12],
  [13.15, 13],
  [14.5, 14],
  [16.94, 18],
  [23.3, 24],
  [29.68, 30],
  [36.88, 36],
  [43.5, 44],
  [49.02, 50],
  [52.06, 52],
  [53.54, 53.5],
  [55.08, 55],
  [56.22, 56],
  [56.88, 56.5],
  [57.06, 56.625],
  [57.34, 57],
  [58.18, 58],
  [58.7, 58.5],
  [60, 60],
] as const;

const mapOpeningTime = (sourceTime: number) => {
  const firstAnchor = openingTimingAnchors[0];
  if (sourceTime <= firstAnchor[0]) return firstAnchor[1];

  for (let index = 1; index < openingTimingAnchors.length; index += 1) {
    const previous = openingTimingAnchors[index - 1];
    const next = openingTimingAnchors[index];
    if (sourceTime > next[0]) continue;

    const progress = (sourceTime - previous[0]) / (next[0] - previous[0]);
    return previous[1] + progress * (next[1] - previous[1]);
  }

  const lastAnchor = openingTimingAnchors.at(-1)!;
  return lastAnchor[1] + (sourceTime - lastAnchor[0]);
};

const quantizeOpeningTime = (seconds: number) =>
  Math.round(seconds / OPENING_GRID_SECONDS) * OPENING_GRID_SECONDS;

const narrationSources = {
  project: projectAudio,
  planning: planningAudio,
  assigning: assigningAudio,
  prioritizing: prioritizingAudio,
  updating: updatingAudio,
  whatIfAll: whatIfAllAudio,
  idea: ideaAudio,
  execution: executionAudio,
} as const;

type NarrationCue = keyof typeof narrationSources;

const formatElapsedTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

export function OpeningSequence() {
  const [editorialPageIndex, setEditorialPageIndex] = useState(-1);
  const narrationRefs = useRef<
    Partial<Record<NarrationCue, HTMLAudioElement>>
  >({});
  const rootRef = useRef<HTMLElement>(null);
  const startGateRef = useRef<HTMLButtonElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const learnLayerRef = useRef<HTMLDivElement>(null);
  const learnWordRef = useRef<HTMLSpanElement>(null);
  const buildLayerRef = useRef<HTMLDivElement>(null);
  const buildWordRef = useRef<HTMLSpanElement>(null);
  const planLayerRef = useRef<HTMLDivElement>(null);
  const planWordRef = useRef<HTMLSpanElement>(null);
  const problemSceneRef = useRef<HTMLDivElement>(null);
  const problemLineOneRef = useRef<HTMLDivElement>(null);
  const problemLineTwoRef = useRef<HTMLDivElement>(null);
  const problemLineThreeRef = useRef<HTMLDivElement>(null);
  const clockModuleRef = useRef<HTMLDivElement>(null);
  const hourHandRef = useRef<HTMLDivElement>(null);
  const minuteHandRef = useRef<HTMLDivElement>(null);
  const secondHandRef = useRef<HTMLDivElement>(null);
  const elapsedTimeRef = useRef<HTMLDivElement>(null);
  const editorialSceneRef = useRef<HTMLDivElement>(null);
  const editorialCameraRef = useRef<HTMLDivElement>(null);
  const automationSceneRef = useRef<HTMLDivElement>(null);
  const automationCameraRef = useRef<HTMLDivElement>(null);
  const chatSceneRef = useRef<HTMLDivElement>(null);
  const chatCameraRef = useRef<HTMLDivElement>(null);
  const composerTextRef = useRef<HTMLSpanElement>(null);
  const composerCaretRef = useRef<HTMLSpanElement>(null);
  const modelButtonRef = useRef<HTMLButtonElement>(null);
  const modelLabelRef = useRef<HTMLSpanElement>(null);
  const reasoningPopoverRef = useRef<HTMLDivElement>(null);
  const reasoningLabelRef = useRef<HTMLSpanElement>(null);
  const sliderFillRef = useRef<HTMLDivElement>(null);
  const sliderThumbRef = useRef<HTMLDivElement>(null);
  const fakeCursorRef = useRef<HTMLDivElement>(null);
  const sendButtonRef = useRef<HTMLButtonElement>(null);
  const sendArrowRef = useRef<HTMLSpanElement>(null);
  const sendStopRef = useRef<HTMLSpanElement>(null);
  const rocketTransitionRef = useRef<HTMLDivElement>(null);
  const rocketSpriteRef = useRef<HTMLImageElement>(null);
  const learnSpaceSceneRef = useRef<HTMLDivElement>(null);
  const learnSpaceBackgroundRef = useRef<HTMLImageElement>(null);
  const spaceLearnWordRef = useRef<HTMLSpanElement>(null);
  const learnWorkbenchRef = useRef<HTMLDivElement>(null);
  const lessonComposerRef = useRef<HTMLDivElement>(null);
  const lessonPromptTextRef = useRef<HTMLSpanElement>(null);
  const lessonPromptCaretRef = useRef<HTMLSpanElement>(null);
  const lessonCursorRef = useRef<HTMLDivElement>(null);
  const lessonSendButtonRef = useRef<HTMLButtonElement>(null);
  const lessonBuildStatusRef = useRef<HTMLDivElement>(null);
  const orbitLabSceneRef = useRef<HTMLDivElement>(null);
  const orbitLabShellRef = useRef<HTMLDivElement>(null);
  const orbitLabHeaderRef = useRef<HTMLElement>(null);
  const orbitCanvasRef = useRef<HTMLElement>(null);
  const orbitMetricsRef = useRef<HTMLElement>(null);
  const orbitControlsRef = useRef<HTMLDivElement>(null);
  const earthPlanetRef = useRef<HTMLDivElement>(null);
  const marsPlanetRef = useRef<HTMLButtonElement>(null);
  const orbitSliderFillRef = useRef<HTMLDivElement>(null);
  const orbitSliderThumbRef = useRef<HTMLDivElement>(null);
  const orbitDayRef = useRef<HTMLSpanElement>(null);
  const orbitCursorRef = useRef<HTMLDivElement>(null);
  const marsInsightRef = useRef<HTMLDivElement>(null);
  const orbitClosingScrimRef = useRef<HTMLDivElement>(null);
  const orbitClosingLineRef = useRef<HTMLDivElement>(null);
  const buildSceneRef = useRef<HTMLDivElement>(null);
  const buildIntroWordRef = useRef<HTMLSpanElement>(null);
  const buildFixedCopyRef = useRef<HTMLDivElement>(null);
  const buildVisualFrameRef = useRef<HTMLDivElement>(null);
  const planSceneRef = useRef<HTMLDivElement>(null);
  const planBlueprintImageRef = useRef<HTMLImageElement>(null);
  const planScanLineRef = useRef<HTMLDivElement>(null);
  const planGridRef = useRef<HTMLDivElement>(null);
  const planCameraRef = useRef<HTMLDivElement>(null);
  const planLeadRef = useRef<HTMLSpanElement>(null);
  const planAnythingRef = useRef<HTMLSpanElement>(null);
  const planCanvasRef = useRef<HTMLDivElement>(null);
  const planTimelineRef = useRef<HTMLDivElement>(null);
  const closingSceneRef = useRef<HTMLDivElement>(null);
  const closingKeywordRef = useRef<HTMLSpanElement>(null);
  const closingEraserRef = useRef<HTMLSpanElement>(null);
  const closingCameraRef = useRef<HTMLDivElement>(null);
  const closingCopyRef = useRef<HTMLDivElement>(null);
  const closingTypedTextRef = useRef<HTMLSpanElement>(null);
  const closingCaretRef = useRef<HTMLSpanElement>(null);
  const brandSceneRef = useRef<HTMLDivElement>(null);
  const brandMarkRef = useRef<HTMLSpanElement>(null);
  const brandWordRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const startGate = startGateRef.current;
      const camera = cameraRef.current;
      const learnLayer = learnLayerRef.current;
      const learnWord = learnWordRef.current;
      const buildLayer = buildLayerRef.current;
      const buildWord = buildWordRef.current;
      const planLayer = planLayerRef.current;
      const planWord = planWordRef.current;
      const problemScene = problemSceneRef.current;
      const problemLineOne = problemLineOneRef.current;
      const problemLineTwo = problemLineTwoRef.current;
      const problemLineThree = problemLineThreeRef.current;
      const clockModule = clockModuleRef.current;
      const hourHand = hourHandRef.current;
      const minuteHand = minuteHandRef.current;
      const secondHand = secondHandRef.current;
      const elapsedTime = elapsedTimeRef.current;
      const editorialScene = editorialSceneRef.current;
      const editorialCamera = editorialCameraRef.current;
      const automationScene = automationSceneRef.current;
      const automationCamera = automationCameraRef.current;
      const chatScene = chatSceneRef.current;
      const chatCamera = chatCameraRef.current;
      const composerText = composerTextRef.current;
      const composerCaret = composerCaretRef.current;
      const modelButton = modelButtonRef.current;
      const modelLabel = modelLabelRef.current;
      const reasoningPopover = reasoningPopoverRef.current;
      const reasoningLabel = reasoningLabelRef.current;
      const sliderFill = sliderFillRef.current;
      const sliderThumb = sliderThumbRef.current;
      const fakeCursor = fakeCursorRef.current;
      const sendButton = sendButtonRef.current;
      const sendArrow = sendArrowRef.current;
      const sendStop = sendStopRef.current;
      const rocketTransition = rocketTransitionRef.current;
      const rocketSprite = rocketSpriteRef.current;
      const learnSpaceScene = learnSpaceSceneRef.current;
      const learnSpaceBackground = learnSpaceBackgroundRef.current;
      const spaceLearnWord = spaceLearnWordRef.current;
      const learnWorkbench = learnWorkbenchRef.current;
      const lessonComposer = lessonComposerRef.current;
      const lessonPromptText = lessonPromptTextRef.current;
      const lessonPromptCaret = lessonPromptCaretRef.current;
      const lessonCursor = lessonCursorRef.current;
      const lessonSendButton = lessonSendButtonRef.current;
      const lessonBuildStatus = lessonBuildStatusRef.current;
      const orbitLabScene = orbitLabSceneRef.current;
      const orbitLabShell = orbitLabShellRef.current;
      const orbitLabHeader = orbitLabHeaderRef.current;
      const orbitCanvas = orbitCanvasRef.current;
      const orbitMetrics = orbitMetricsRef.current;
      const orbitControls = orbitControlsRef.current;
      const earthPlanet = earthPlanetRef.current;
      const marsPlanet = marsPlanetRef.current;
      const orbitSliderFill = orbitSliderFillRef.current;
      const orbitSliderThumb = orbitSliderThumbRef.current;
      const orbitDay = orbitDayRef.current;
      const orbitCursor = orbitCursorRef.current;
      const marsInsight = marsInsightRef.current;
      const orbitClosingScrim = orbitClosingScrimRef.current;
      const orbitClosingLine = orbitClosingLineRef.current;
      const buildScene = buildSceneRef.current;
      const buildIntroWord = buildIntroWordRef.current;
      const buildFixedCopy = buildFixedCopyRef.current;
      const buildVisualFrame = buildVisualFrameRef.current;
      const planScene = planSceneRef.current;
      const planBlueprintImage = planBlueprintImageRef.current;
      const planScanLine = planScanLineRef.current;
      const planGrid = planGridRef.current;
      const planCamera = planCameraRef.current;
      const planLead = planLeadRef.current;
      const planAnything = planAnythingRef.current;
      const planCanvas = planCanvasRef.current;
      const planTimeline = planTimelineRef.current;
      const closingScene = closingSceneRef.current;
      const closingKeyword = closingKeywordRef.current;
      const closingEraser = closingEraserRef.current;
      const closingCamera = closingCameraRef.current;
      const closingCopy = closingCopyRef.current;
      const closingTypedText = closingTypedTextRef.current;
      const closingCaret = closingCaretRef.current;
      const brandScene = brandSceneRef.current;
      const brandMark = brandMarkRef.current;
      const brandWord = brandWordRef.current;
      if (
        !root ||
        !startGate ||
        !camera ||
        !learnLayer ||
        !learnWord ||
        !buildLayer ||
        !buildWord ||
        !planLayer ||
        !planWord ||
        !problemScene ||
        !problemLineOne ||
        !problemLineTwo ||
        !problemLineThree ||
        !clockModule ||
        !hourHand ||
        !minuteHand ||
        !secondHand ||
        !elapsedTime ||
        !editorialScene ||
        !editorialCamera ||
        !automationScene ||
        !automationCamera ||
        !chatScene ||
        !chatCamera ||
        !composerText ||
        !composerCaret ||
        !modelButton ||
        !modelLabel ||
        !reasoningPopover ||
        !reasoningLabel ||
        !sliderFill ||
        !sliderThumb ||
        !fakeCursor ||
        !sendButton ||
        !sendArrow ||
        !sendStop ||
        !rocketTransition ||
        !rocketSprite ||
        !learnSpaceScene ||
        !learnSpaceBackground ||
        !spaceLearnWord ||
        !learnWorkbench ||
        !lessonComposer ||
        !lessonPromptText ||
        !lessonPromptCaret ||
        !lessonCursor ||
        !lessonSendButton ||
        !lessonBuildStatus ||
        !orbitLabScene ||
        !orbitLabShell ||
        !orbitLabHeader ||
        !orbitCanvas ||
        !orbitMetrics ||
        !orbitControls ||
        !earthPlanet ||
        !marsPlanet ||
        !orbitSliderFill ||
        !orbitSliderThumb ||
        !orbitDay ||
        !orbitCursor ||
        !marsInsight ||
        !orbitClosingScrim ||
        !orbitClosingLine ||
        !buildScene ||
        !buildIntroWord ||
        !buildFixedCopy ||
        !buildVisualFrame ||
        !planScene ||
        !planBlueprintImage ||
        !planScanLine ||
        !planGrid ||
        !planCamera ||
        !planLead ||
        !planAnything ||
        !planCanvas ||
        !planTimeline ||
        !closingScene ||
        !closingKeyword ||
        !closingEraser ||
        !closingCamera ||
        !closingCopy ||
        !closingTypedText ||
        !closingCaret ||
        !brandScene ||
        !brandMark ||
        !brandWord
      ) {
        return;
      }

      const tile = (id: string) =>
        root.querySelector<HTMLElement>(`[data-opening-tile="${id}"]`);
      const tiles = Array.from(
        root.querySelectorAll<HTMLElement>("[data-opening-tile]"),
      );
      const automationBackgrounds = Array.from(
        root.querySelectorAll<HTMLElement>("[data-automation-theme]"),
      );
      const typedQuestionLines = Array.from(
        root.querySelectorAll<HTMLElement>("[data-automation-typed-line]"),
      );
      const lessonReferences = Array.from(
        root.querySelectorAll<HTMLElement>("[data-lesson-reference]"),
      );
      const orbitMetricCards = Array.from(
        root.querySelectorAll<HTMLElement>("[data-orbit-metric]"),
      );
      const rotatingWords = Array.from(
        root.querySelectorAll<HTMLElement>("[data-rotating-word]"),
      );
      const buildVisualLayers = Array.from(
        root.querySelectorAll<HTMLElement>("[data-build-visual]"),
      );
      const buildVisualLabels = Array.from(
        root.querySelectorAll<HTMLElement>("[data-build-visual-label]"),
      );
      const planIdeaBubbles = Array.from(
        root.querySelectorAll<HTMLElement>("[data-plan-idea]"),
      );
      const planPaths = Array.from(
        root.querySelectorAll<SVGPathElement>("[data-plan-path]"),
      );
      const planNodes = Array.from(
        root.querySelectorAll<HTMLElement>("[data-plan-node]"),
      );
      const planGhostCards = Array.from(
        root.querySelectorAll<HTMLElement>("[data-plan-ghost]"),
      );
      const planNodeLanding = [
        { x: -70, y: 170 },
        { x: 10, y: 110 },
        { x: 30, y: 110 },
        { x: 50, y: 170 },
      ];
      const initialScale =
        (root.clientWidth * 0.5) / learnWord.getBoundingClientRect().width;
      const learnFinalScale =
        root.clientWidth / 3 / learnWord.getBoundingClientRect().width;
      const openingCameraScale = initialScale / learnFinalScale;
      const buildFinalScale =
        root.clientWidth / 3 / buildWord.getBoundingClientRect().width;
      const planFinalScale =
        root.clientWidth / 3 / planWord.getBoundingClientRect().width;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.set(camera, {
        scale: reduceMotion ? 0.44 : openingCameraScale,
      });
      gsap.set(tiles, {
        autoAlpha: 1,
        clipPath: reduceMotion ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
      });
      gsap.set(learnWord, {
        autoAlpha: 0,
        scale: learnFinalScale,
        transformOrigin: "center center",
      });
      gsap.set(buildWord, {
        autoAlpha: 1,
        scale: buildFinalScale,
        transformOrigin: "center center",
      });
      gsap.set(planWord, {
        autoAlpha: 1,
        scale: planFinalScale,
        transformOrigin: "center center",
      });
      gsap.set([learnLayer, buildLayer], { display: "none" });
      gsap.set(planLayer, { display: reduceMotion ? "grid" : "none" });
      if (!reduceMotion) gsap.set(learnLayer, { display: "grid" });

      gsap.set(
        [
          problemScene,
          editorialScene,
          automationScene,
          chatScene,
          rocketTransition,
          learnSpaceScene,
          orbitLabScene,
          buildScene,
          planScene,
          closingScene,
          brandScene,
        ],
        { display: "none" },
      );
      gsap.set(
        [problemLineOne, problemLineTwo, problemLineThree],
        { autoAlpha: 0, y: 28 },
      );
      gsap.set(startGate, { autoAlpha: 1, display: "flex" });
      gsap.set(clockModule, { autoAlpha: 0, scale: 0.96 });
      gsap.set(editorialCamera, {
        scale: 1,
        transformOrigin: "0% 0%",
      });
      gsap.set([hourHand, minuteHand, secondHand], {
        rotation: 0,
        transformOrigin: "50% 100%",
      });
      gsap.set(automationScene, {
        xPercent: 0,
        rotation: 0,
        transformOrigin: "50% 50%",
      });
      gsap.set(automationCamera, {
        scale: 1,
        transformOrigin: "39% 35%",
      });
      gsap.set(reasoningPopover, {
        autoAlpha: 0,
        display: "none",
        scale: 0.96,
        y: 14,
        transformOrigin: "88% 100%",
      });
      gsap.set(chatCamera, {
        x: 0,
        y: 0,
        scale: 1,
        transformOrigin: "0% 0%",
      });
      gsap.set(fakeCursor, { autoAlpha: 0, x: 1120, y: 860, scale: 1 });
      gsap.set(sliderFill, {
        width: "50%",
        backgroundColor: "#111114",
        backgroundImage: "none",
      });
      gsap.set(sliderThumb, { x: 0 });
      gsap.set(sendButton, { backgroundColor: "#ececef", scale: 1 });
      gsap.set(sendArrow, { autoAlpha: 1, scale: 1 });
      gsap.set(sendStop, { autoAlpha: 0, scale: 0.62 });
      gsap.set(composerCaret, { autoAlpha: 0 });
      gsap.set(rocketSprite, {
        autoAlpha: 0,
        x: 0,
        y: 0,
        scale: 0.045,
        transformOrigin: "50% 50%",
      });
      gsap.set(learnSpaceBackground, { scale: 1.08 });
      gsap.set(spaceLearnWord, { autoAlpha: 0, scale: 0.92 });
      gsap.set(learnWorkbench, { autoAlpha: 0 });
      gsap.set(lessonComposer, { autoAlpha: 0, y: 28, scale: 0.96 });
      gsap.set(lessonReferences, { autoAlpha: 0 });
      gsap.set(lessonReferences[0], {
        x: -640,
        y: -230,
        rotation: -11,
        scale: 1.24,
      });
      gsap.set(lessonReferences[1], {
        x: 40,
        y: -620,
        rotation: 7,
        scale: 1.22,
      });
      gsap.set(lessonReferences[2], {
        x: 650,
        y: -260,
        rotation: 12,
        scale: 1.24,
      });
      gsap.set(lessonPromptCaret, { autoAlpha: 0 });
      gsap.set(lessonCursor, { autoAlpha: 0, x: 1280, y: 820, scale: 1 });
      gsap.set(lessonSendButton, { scale: 1 });
      gsap.set(lessonBuildStatus, { autoAlpha: 0, scale: 0.94 });
      gsap.set(orbitLabScene, { autoAlpha: 0 });
      gsap.set(orbitLabShell, { autoAlpha: 0, y: 34, scale: 0.94 });
      gsap.set(
        [orbitLabHeader, orbitCanvas, orbitMetrics, orbitControls],
        { autoAlpha: 0, y: 24 },
      );
      gsap.set(orbitMetricCards, { autoAlpha: 0, y: 18 });
      gsap.set(orbitSliderFill, { width: "0%" });
      gsap.set(orbitSliderThumb, { x: 0 });
      gsap.set(orbitCursor, { autoAlpha: 0, x: 230, y: 920, scale: 1 });
      gsap.set(marsInsight, { autoAlpha: 0, x: 54 });
      gsap.set(orbitClosingScrim, { autoAlpha: 0 });
      gsap.set(orbitClosingLine, { autoAlpha: 0, y: 34 });
      gsap.set(buildIntroWord, { autoAlpha: 0, scale: 1.12 });
      gsap.set(buildFixedCopy, { autoAlpha: 0, x: -26 });
      gsap.set(buildVisualFrame, {
        autoAlpha: 0,
        y: 72,
        scale: 0.96,
        borderRadius: 34,
        transformOrigin: "50% 50%",
      });
      rotatingWords.forEach((word) => {
        gsap.set(word, { autoAlpha: 0 });
        gsap.set(
          word.querySelectorAll<HTMLElement>("[data-rotating-character]"),
          { autoAlpha: 0, yPercent: 115, rotationX: -72 },
        );
      });
      gsap.set(buildVisualLayers, {
        autoAlpha: 0,
        yPercent: 16,
        scale: 0.985,
      });
      gsap.set(buildVisualLabels, { autoAlpha: 0, y: 16 });
      gsap.set(planBlueprintImage, {
        autoAlpha: 1,
        clipPath: "inset(0 100% 0 0)",
      });
      gsap.set(planScanLine, { autoAlpha: 0, x: -30 });
      gsap.set(planGrid, { autoAlpha: 0, scale: 1.08 });
      gsap.set(planCamera, {
        scale: 1,
        transformOrigin: "50% 50%",
      });
      gsap.set(planLead, { autoAlpha: 0, x: 0, scale: 1.12 });
      gsap.set(planAnything, {
        autoAlpha: 0,
        clipPath: "inset(0 100% 0 0)",
      });
      gsap.set(planIdeaBubbles, { autoAlpha: 0, y: 18, scale: 0.82 });
      gsap.set(planCanvas, { autoAlpha: 1 });
      gsap.set(planPaths, { strokeDashoffset: 1, autoAlpha: 0 });
      gsap.set(planNodes, { autoAlpha: 0, y: 22, scale: 0.94 });
      gsap.set(planTimeline, {
        autoAlpha: 0,
        scaleX: 0,
        transformOrigin: "0% 50%",
      });
      gsap.set(planGhostCards, { autoAlpha: 0, y: 18, scale: 0.94 });
      gsap.set(closingKeyword, {
        autoAlpha: 0,
        y: 20,
        clipPath: "inset(0 100% 0 0)",
      });
      gsap.set(closingEraser, { autoAlpha: 0, x: 0 });
      gsap.set(closingCamera, {
        x: 0,
        y: 0,
        scale: 1.34,
        transformOrigin: "0% 0%",
      });
      gsap.set(closingCopy, { autoAlpha: 0 });
      gsap.set(closingCaret, { autoAlpha: 0 });
      gsap.set(brandMark, { autoAlpha: 0, x: 0, scale: 0.92 });
      gsap.set(brandWord, {
        autoAlpha: 0,
        clipPath: "inset(0 100% 0 0)",
      });
      closingTypedText.textContent = "";
      typedQuestionLines.forEach((line) => {
        line.textContent = "";
      });
      composerText.textContent = "";
      lessonPromptText.textContent = "";
      modelLabel.textContent = "5.6 Sol Medium";
      reasoningLabel.textContent = "Medium";

      const setAutomationTheme = (index: number) => {
        const theme = automationThemes[index];

        automationScene.style.setProperty("--auto-accent", theme.accent);
        automationScene.style.setProperty("--auto-hero", theme.hero);
        automationScene.style.setProperty("--auto-card", theme.card);
        automationScene.style.setProperty("--auto-card-muted", theme.cardMuted);
        automationScene.style.setProperty("--auto-shadow", theme.shadow);
        automationBackgrounds.forEach((background, backgroundIndex) => {
          gsap.set(background, { autoAlpha: backgroundIndex === index ? 1 : 0 });
        });
      };

      setAutomationTheme(0);

      const orbitState = { progress: 0 };
      const renderOrbit = () => {
        const earthAngle =
          -Math.PI / 2 + orbitState.progress * Math.PI * 2 * 1.88;
        const marsAngle =
          -Math.PI / 2 + orbitState.progress * Math.PI * 2;

        gsap.set(earthPlanet, {
          x: Math.cos(earthAngle) * 252,
          y: Math.sin(earthAngle) * 128,
        });
        gsap.set(marsPlanet, {
          x: Math.cos(marsAngle) * 392,
          y: Math.sin(marsAngle) * 198,
        });
        orbitDay.textContent = `Day ${Math.round(orbitState.progress * 687)}`;
      };

      renderOrbit();

      let activeNarration: HTMLAudioElement | null = null;
      const stopNarration = () => {
        Object.values(narrationRefs.current).forEach((audio) => {
          if (!audio) return;
          audio.pause();
          audio.currentTime = 0;
        });
        activeNarration = null;
      };
      const playNarration = (cue: NarrationCue) => {
        const audio = narrationRefs.current[cue];
        if (!audio) {
          console.warn(`[OpeningSequence] Missing narration element: ${cue}`);
          return;
        }

        if (activeNarration && activeNarration !== audio) {
          activeNarration.pause();
          activeNarration.currentTime = 0;
        }

        audio.currentTime = 0;
        activeNarration = audio;
        void audio.play().catch((error: unknown) => {
          console.warn(
            `[OpeningSequence] Narration playback was blocked: ${cue}`,
            error,
          );
        });
      };
      const unlockNarration = () => {
        Object.values(narrationRefs.current).forEach((audio) => {
          if (!audio || audio === activeNarration) return;

          audio.muted = true;
          void audio
            .play()
            .then(() => {
              audio.pause();
              audio.currentTime = 0;
              audio.muted = false;
            })
            .catch((error: unknown) => {
              audio.muted = false;
              console.warn(
                "[OpeningSequence] Narration could not be unlocked.",
                error,
              );
            });
        });
      };

      if (reduceMotion) {
        gsap.set(
          [
            camera,
            automationScene,
            chatScene,
            learnSpaceScene,
            orbitLabScene,
            buildScene,
            planScene,
            closingScene,
          ],
          { display: "none" },
        );
        gsap.set(brandScene, { display: "block" });
        gsap.set(startGate, { autoAlpha: 0, display: "none" });
        gsap.set(brandMark, { autoAlpha: 1, x: -150, scale: 1 });
        gsap.set(brandWord, {
          autoAlpha: 1,
          clipPath: "inset(0 0% 0 0)",
        });
        return;
      }

      const questionLines = [
        "What if",
        "all of that",
        "happened",
        "automatically?",
      ];
      const typedQuestion = { characters: 0 };
      const questionCharacterCount = questionLines.reduce(
        (total, line) => total + line.length,
        0,
      );
      const renderTypedQuestion = (showCursor = true) => {
        let remaining = Math.round(typedQuestion.characters);
        let activeLine = 0;

        questionLines.forEach((line, index) => {
          const visibleCharacters = Math.min(remaining, line.length);
          typedQuestionLines[index].textContent = line.slice(
            0,
            visibleCharacters,
          );
          if (remaining >= line.length) activeLine = Math.min(index + 1, 3);
          remaining -= visibleCharacters;
        });

        if (showCursor && typedQuestion.characters < questionCharacterCount) {
          typedQuestionLines[activeLine].textContent += "▌";
        }
      };
      const command = "Launch this project.";
      const typedCommand = { characters: 0 };
      const chatFocusScale = 1.32;
      const focusChatCamera = (x: number, y: number) => ({
        x: 960 - x * chatFocusScale,
        y: 540 - y * chatFocusScale,
      });
      const modelFocus = focusChatCamera(1310, 674);
      const sliderMediumFocus = focusChatCamera(1229, 538);
      const sliderUltraFocus = focusChatCamera(1391, 538);
      const sendFocus = focusChatCamera(1471, 674);
      const lessonCommand =
        "Turn these references into an interactive lesson.";
      const typedLessonCommand = { characters: 0 };
      const closingTyping = { characters: 0 };
      const closingFirstLineLength = finalStatement.indexOf("\n");
      const closingFocusScale = 1.34;
      const followClosingCameraX = gsap.quickTo(closingCamera, "x", {
        duration: 0.16,
        ease: "power2.out",
      });
      const followClosingCameraY = gsap.quickTo(closingCamera, "y", {
        duration: 0.16,
        ease: "power2.out",
      });
      const renderClosingTyping = () => {
        const visibleCharacters = Math.min(
          Math.round(closingTyping.characters),
          finalStatement.length,
        );
        closingTypedText.textContent = finalStatement.slice(
          0,
          visibleCharacters,
        );

        const caretX = closingCopy.offsetLeft + closingCaret.offsetLeft + 2;
        const caretY =
          closingCopy.offsetTop +
          closingCaret.offsetTop +
          closingCaret.offsetHeight / 2;
        followClosingCameraX(960 - caretX * closingFocusScale);
        followClosingCameraY(540 - caretY * closingFocusScale);
      };
      const prepareClosingKeyword = (word: string) => {
        closingKeyword.textContent = word;
        gsap.set(closingKeyword, {
          autoAlpha: 0,
          y: 20,
          clipPath: "inset(0 100% 0 0)",
        });
      };

      const timeline = gsap.timeline({ paused: true });

      timeline.to(
        learnWord,
        {
          autoAlpha: 1,
          duration: 0.1,
          ease: "none",
        },
        0.5,
      );
      timeline.to(
        camera,
        {
          scale: 1,
          duration: 0.78,
          ease: "power4.out",
        },
        0.78,
      );

      [
        ["one", 1.12],
        ["two", 1.44],
        ["three", 1.76],
      ].forEach(([id, position]) => {
        timeline.to(
          tile(String(id)),
          {
            clipPath: "inset(0 0% 0 0)",
            duration: 0.46,
            ease: "power3.inOut",
          },
          Number(position),
        );
      });

      timeline
        .set(learnLayer, { display: "none" }, 2.26)
        .set(buildLayer, { display: "grid" }, 2.26)
        .to(
          tile("two"),
          { y: -CELL_HEIGHT, duration: 0.56, ease: "power3.inOut" },
          2.54,
        )
        .to(
          tile("three"),
          { x: CELL_WIDTH, duration: 0.56, ease: "power3.inOut" },
          2.54,
        )
        .to(
          tile("four"),
          {
            clipPath: "inset(0 0% 0 0)",
            duration: 0.44,
            ease: "power3.inOut",
          },
          2.8,
        )
        .to(
          tile("five"),
          {
            clipPath: "inset(0 0% 0 0)",
            duration: 0.44,
            ease: "power3.inOut",
          },
          3.02,
        );

      [
        ["six", 3.24],
        ["seven", 3.46],
        ["eight", 3.68],
        ["nine", 3.9],
        ["ten", 4.12],
      ].forEach(([id, position]) => {
        timeline.to(
          tile(String(id)),
          {
            clipPath: "inset(0 0% 0 0)",
            duration: 0.44,
            ease: "power3.inOut",
          },
          Number(position),
        );
      });

      timeline.to(
        camera,
        {
          scale: 0.53,
          duration: 0.95,
          ease: "power3.inOut",
        },
        2.34,
      );

      timeline
        .set(buildLayer, { display: "none" }, 4.03)
        .set(planLayer, { display: "grid" }, 4.03);

      [
        ["eleven", 4.13],
        ["twelve", 4.3],
        ["thirteen", 4.47],
        ["fourteen", 4.64],
        ["fifteen", 4.81],
        ["sixteen", 4.98],
        ["seventeen", 5.15],
        ["eighteen", 5.32],
        ["nineteen", 5.49],
        ["twenty", 5.66],
      ].forEach(([id, position]) => {
        timeline.to(
          tile(String(id)),
          {
            clipPath: "inset(0 0% 0 0)",
            duration: 0.44,
            ease: "power3.inOut",
          },
          Number(position),
        );
      });

      timeline.to(
        camera,
        {
          scale: 0.44,
          duration: 1.25,
          ease: "power3.inOut",
        },
        4.29,
      );

      const elapsed = { seconds: 0 };
      timeline
        .set(camera, { display: "none" }, 6.4)
        .set(problemScene, { display: "block" }, 6.4)
        .to(
          clockModule,
          { autoAlpha: 1, scale: 1, duration: 0.18, ease: "power2.out" },
          6.64,
        )
        .to(
          problemLineOne,
          { autoAlpha: 1, y: 0, duration: 0.32, ease: "power3.out" },
          6.72,
        )
        .to(
          problemLineTwo,
          { autoAlpha: 1, y: 0, duration: 0.32, ease: "power3.out" },
          7.2,
        )
        .to(
          problemLineThree,
          { autoAlpha: 1, y: 0, duration: 0.32, ease: "power3.out" },
          7.68,
        )
        .to(
          hourHand,
          { rotation: 1080, duration: 3.1, ease: "power4.in" },
          6.64,
        )
        .to(
          minuteHand,
          { rotation: 3240, duration: 3.1, ease: "power4.in" },
          6.64,
        )
        .to(
          secondHand,
          { rotation: 7200, duration: 3.1, ease: "power4.in" },
          6.64,
        )
        .to(
          elapsed,
          {
            seconds: 171138,
            duration: 3.1,
            ease: "power4.in",
            onUpdate: () => {
              elapsedTime.textContent = formatElapsedTime(elapsed.seconds);
            },
          },
          6.64,
        )
        .set(problemScene, { display: "none" }, 10.15)
        .set(editorialScene, { display: "block" }, 10.15)
        .to(
          editorialCamera,
          { scale: 1.08, duration: 4, ease: "sine.inOut" },
          10.15,
        );

      const scheduleEditorialPage = (index: number, start: number) => {
        const transitionColors = editorialPages[index].transitionColors;

        timeline
          .call(() => setEditorialPageIndex(index), [], start)
          .set(editorialScene, { backgroundColor: transitionColors[0] }, start)
          .set(
            editorialScene,
            { backgroundColor: transitionColors[1] },
            start + 0.18,
          )
          .set(
            editorialScene,
            { backgroundColor: editorialPages[index].color },
            start + 0.54,
          );
      };

      [10.15, 11.15, 12.15, 13.15].forEach((start, index) => {
        scheduleEditorialPage(index, start);
      });

      timeline
        .set(editorialScene, { display: "none" }, 14.5)
        .set(automationScene, { display: "block" }, 14.5)
        .to(
          automationCamera,
          {
            scale: 1.35,
            duration: 1.65,
            ease: "power2.inOut",
          },
          14.5,
        );

      [1, 2, 3, 4, 5, 6, 0].forEach((themeIndex, step) => {
        timeline.call(
          () => setAutomationTheme(themeIndex),
          [],
          14.72 + step * 0.22,
        );
      });

      timeline
        .to(
          typedQuestion,
          {
            characters: questionCharacterCount,
            duration: 1.35,
            ease: "none",
            snap: { characters: 1 },
            onStart: () => renderTypedQuestion(),
            onUpdate: () => renderTypedQuestion(),
          },
          15.58,
        )
        .call(() => renderTypedQuestion(false), [], 16.93)
        .set(chatScene, { display: "block" }, 16.94)
        .to(
          automationScene,
          {
            xPercent: -118,
            rotation: -2.1,
            duration: 0.72,
            ease: "power4.in",
          },
          17.02,
        )
        .set(automationScene, { display: "none" }, 17.75)
        .to(composerCaret, { autoAlpha: 1, duration: 0.08 }, 18.02)
        .to(
          typedCommand,
          {
            characters: command.length,
            duration: 0.9,
            ease: "none",
            snap: { characters: 1 },
            onUpdate: () => {
              composerText.textContent = command.slice(
                0,
                Math.round(typedCommand.characters),
              );
            },
          },
          18.05,
        )
        .set(composerCaret, { autoAlpha: 0 }, 19.02)
        .to(fakeCursor, { autoAlpha: 1, duration: 0.12 }, 18.88)
        .to(
          chatCamera,
          {
            ...modelFocus,
            scale: chatFocusScale,
            duration: 0.86,
            ease: "power2.inOut",
          },
          18.88,
        )
        .to(
          fakeCursor,
          { x: 1310, y: 674, duration: 0.72, ease: "power2.inOut" },
          19.02,
        )
        .to(
          [fakeCursor, modelButton],
          { scale: 0.9, duration: 0.08, ease: "power2.out" },
          19.76,
        )
        .to(
          [fakeCursor, modelButton],
          { scale: 1, duration: 0.11, ease: "power2.out" },
          19.84,
        )
        .set(reasoningPopover, { display: "block" }, 19.84)
        .to(
          reasoningPopover,
          {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            duration: 0.22,
            ease: "power3.out",
          },
          19.84,
        )
        .to(
          fakeCursor,
          { x: 1229, y: 538, duration: 0.55, ease: "power2.inOut" },
          20.13,
        )
        .to(
          chatCamera,
          { ...sliderMediumFocus, duration: 0.55, ease: "power2.inOut" },
          20.13,
        )
        .to(fakeCursor, { scale: 0.88, duration: 0.08 }, 20.7)
        .set(
          sliderFill,
          {
            backgroundColor: "transparent",
            backgroundImage:
              "linear-gradient(90deg, #6f5cff 0%, #783eff 52%, #c733ff 100%)",
          },
          20.7,
        )
        .to(
          sliderFill,
          { width: "100%", duration: 0.82, ease: "power2.inOut" },
          20.7,
        )
        .to(
          sliderThumb,
          { x: 162, duration: 0.82, ease: "power2.inOut" },
          20.7,
        )
        .to(
          fakeCursor,
          { x: 1391, y: 538, duration: 0.82, ease: "power2.inOut" },
          20.7,
        )
        .to(
          chatCamera,
          { ...sliderUltraFocus, duration: 0.82, ease: "power2.inOut" },
          20.7,
        )
        .call(
          () => {
            reasoningLabel.textContent = "Ultra";
            modelLabel.textContent = "5.6 Sol Ultra";
          },
          [],
          21.52,
        )
        .to(fakeCursor, { scale: 1, duration: 0.1 }, 21.52)
        .to(
          reasoningPopover,
          {
            autoAlpha: 0,
            scale: 0.97,
            y: 10,
            duration: 0.18,
            ease: "power2.in",
          },
          21.72,
        )
        .set(reasoningPopover, { display: "none" }, 21.9)
        .to(
          fakeCursor,
          { x: 1471, y: 674, duration: 0.58, ease: "power2.inOut" },
          21.76,
        )
        .to(
          chatCamera,
          { ...sendFocus, duration: 0.58, ease: "power2.inOut" },
          21.76,
        )
        .to(
          [fakeCursor, sendButton],
          { scale: 0.88, duration: 0.08, ease: "power2.out" },
          22.36,
        )
        .set(sendButton, { backgroundColor: "#111114" }, 22.36)
        .to(sendArrow, { autoAlpha: 0, scale: 0.58, duration: 0.1 }, 22.36)
        .to(sendStop, { autoAlpha: 1, scale: 1, duration: 0.12 }, 22.39)
        .to(
          chatCamera,
          {
            keyframes: [
              {
                x: sendFocus.x - 12,
                y: sendFocus.y + 6,
                duration: 0.045,
              },
              {
                x: sendFocus.x + 8,
                y: sendFocus.y - 5,
                duration: 0.05,
              },
              {
                x: sendFocus.x - 4,
                y: sendFocus.y + 2,
                duration: 0.045,
              },
              { ...sendFocus, duration: 0.08 },
            ],
            ease: "none",
          },
          22.36,
        )
        .to(
          [fakeCursor, sendButton],
          { scale: 1, duration: 0.12, ease: "power2.out" },
          22.44,
        )
        .to(fakeCursor, { autoAlpha: 0, duration: 0.12 }, 22.56)
        .to(
          sendButton,
          { scale: 0.66, duration: 0.16, ease: "power2.in" },
          22.6,
        )
        .set(rocketTransition, { display: "block" }, 22.62)
        .set(
          rocketSprite,
          { autoAlpha: 1, x: 0, y: 0, scale: 0.045 },
          22.62,
        )
        .to(
          rocketSprite,
          {
            x: 34,
            y: -18,
            scale: 0.32,
            duration: 0.22,
            ease: "power2.out",
          },
          22.64,
        )
        .to(
          rocketSprite,
          {
            x: 140,
            y: -90,
            scale: 4.8,
            duration: 0.5,
            ease: "power4.in",
          },
          22.84,
        )
        .set(learnSpaceScene, { display: "block" }, 23.3)
        .set(chatScene, { display: "none" }, 23.3)
        .to(
          learnSpaceBackground,
          { scale: 1, duration: 1.2, ease: "power2.out" },
          23.3,
        )
        .to(
          rocketSprite,
          {
            x: 760,
            y: -360,
            scale: 0.09,
            duration: 0.8,
            ease: "power4.out",
          },
          23.32,
        )
        .to(
          spaceLearnWord,
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.32,
            ease: "power3.out",
          },
          23.68,
        )
        .set(rocketTransition, { display: "none" }, 24.14)
        .to(
          spaceLearnWord,
          {
            x: -755,
            y: -432,
            scale: 0.27,
            duration: 0.62,
            ease: "power3.inOut",
          },
          24.52,
        )
        .to(learnWorkbench, { autoAlpha: 1, duration: 0.18 }, 24.8)
        .to(
          lessonComposer,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.42,
            ease: "power3.out",
          },
          24.84,
        );

      [25.24, 25.84, 26.44].forEach((start, index) => {
        timeline.to(
          lessonReferences[index],
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            duration: 0.62,
            ease: "back.out(1.25)",
          },
          start,
        );
      });

      timeline
        .to(lessonPromptCaret, { autoAlpha: 1, duration: 0.08 }, 27.08)
        .to(
          typedLessonCommand,
          {
            characters: lessonCommand.length,
            duration: 1.35,
            ease: "none",
            snap: { characters: 1 },
            onUpdate: () => {
              lessonPromptText.textContent = lessonCommand.slice(
                0,
                Math.round(typedLessonCommand.characters),
              );
            },
          },
          27.12,
        )
        .set(lessonPromptCaret, { autoAlpha: 0 }, 28.5)
        .to(lessonCursor, { autoAlpha: 1, duration: 0.12 }, 28.34)
        .to(
          lessonCursor,
          { x: 1552, y: 792, duration: 0.64, ease: "power2.inOut" },
          28.5,
        )
        .to(
          [lessonCursor, lessonSendButton],
          { scale: 0.88, duration: 0.08, ease: "power2.out" },
          29.16,
        )
        .to(
          [lessonCursor, lessonSendButton],
          { scale: 1, duration: 0.12, ease: "power2.out" },
          29.24,
        )
        .to(lessonBuildStatus, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.2,
          ease: "power2.out",
        }, 29.24)
        .to(lessonCursor, { autoAlpha: 0, duration: 0.12 }, 29.34)
        .to(
          lessonReferences,
          {
            y: -10,
            autoAlpha: 0.58,
            duration: 0.28,
            stagger: 0.04,
            ease: "power2.inOut",
          },
          29.3,
        )
        .set(orbitLabScene, { display: "block" }, 29.68)
        .to(orbitLabScene, { autoAlpha: 1, duration: 0.34 }, 29.68)
        .to(learnSpaceScene, { autoAlpha: 0, duration: 0.28 }, 29.72)
        .to(
          orbitLabShell,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.48,
            ease: "power3.out",
          },
          29.72,
        )
        .set(learnSpaceScene, { display: "none" }, 30.02)
        .to(
          orbitLabHeader,
          { autoAlpha: 1, y: 0, duration: 0.28, ease: "power3.out" },
          29.88,
        )
        .to(
          orbitCanvas,
          { autoAlpha: 1, y: 0, duration: 0.34, ease: "power3.out" },
          30.06,
        )
        .to(
          orbitMetrics,
          { autoAlpha: 1, y: 0, duration: 0.34, ease: "power3.out" },
          30.24,
        )
        .to(
          orbitMetricCards,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.25,
            stagger: 0.09,
            ease: "power2.out",
          },
          30.36,
        )
        .to(
          orbitControls,
          { autoAlpha: 1, y: 0, duration: 0.3, ease: "power3.out" },
          30.54,
        )
        .to(orbitCursor, { autoAlpha: 1, duration: 0.12 }, 31.22)
        .to(
          orbitCursor,
          { x: 250, y: 916, duration: 0.32, ease: "power2.inOut" },
          31.24,
        )
        .to(orbitCursor, { scale: 0.88, duration: 0.08 }, 31.58)
        .to(
          orbitState,
          {
            progress: 0.72,
            duration: 1.45,
            ease: "power2.inOut",
            onUpdate: renderOrbit,
          },
          31.58,
        )
        .to(
          orbitSliderFill,
          { width: "72%", duration: 1.45, ease: "power2.inOut" },
          31.58,
        )
        .to(
          orbitSliderThumb,
          { x: 662, duration: 1.45, ease: "power2.inOut" },
          31.58,
        )
        .to(
          orbitCursor,
          { x: 912, y: 916, duration: 1.45, ease: "power2.inOut" },
          31.58,
        )
        .to(orbitCursor, { scale: 1, duration: 0.1 }, 33.03)
        .to(
          orbitCursor,
          { x: 368, y: 542, duration: 0.74, ease: "power2.inOut" },
          33.26,
        )
        .to(
          [orbitCursor, marsPlanet],
          { scale: 0.88, duration: 0.08, ease: "power2.out" },
          34.02,
        )
        .to(
          orbitCursor,
          { scale: 1, duration: 0.12, ease: "power2.out" },
          34.1,
        )
        .to(
          marsPlanet,
          { scale: 1.16, duration: 0.2, ease: "power2.out" },
          34.1,
        )
        .to(
          marsInsight,
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.38,
            ease: "power3.out",
          },
          34.08,
        )
        .to(orbitCursor, { autoAlpha: 0, duration: 0.16 }, 34.52)
        .to(
          orbitClosingScrim,
          { autoAlpha: 0.72, duration: 0.44, ease: "power2.inOut" },
          35.34,
        )
        .to(
          orbitClosingLine,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.42,
            ease: "power3.out",
          },
          35.56,
        );

      timeline
        .to(
          orbitClosingLine,
          { autoAlpha: 0, y: -18, duration: 0.18, ease: "power2.in" },
          36.68,
        )
        .to(
          orbitClosingScrim,
          { autoAlpha: 1, duration: 0.22, ease: "power2.inOut" },
          36.68,
        )
        .set(buildScene, { display: "block" }, 36.88)
        .set(orbitLabScene, { display: "none" }, 36.9)
        .to(
          buildIntroWord,
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.18,
            ease: "power3.out",
          },
          37.04,
        )
        .to(
          buildIntroWord,
          {
            x: -618,
            y: -134,
            scale: 0.5,
            autoAlpha: 0,
            duration: 0.5,
            ease: "power3.inOut",
          },
          37.82,
        )
        .to(
          buildFixedCopy,
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.34,
            ease: "power3.out",
          },
          38.1,
        )
        .to(
          buildVisualFrame,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.42,
            ease: "power3.out",
          },
          38.14,
        );

      const scheduleBuildBeat = (index: number, start: number) => {
        const word = rotatingWords[index];
        const characters = word.querySelectorAll<HTMLElement>(
          "[data-rotating-character]",
        );

        if (index > 0) {
          const previousWord = rotatingWords[index - 1];
          const previousCharacters =
            previousWord.querySelectorAll<HTMLElement>(
              "[data-rotating-character]",
            );

          timeline
            .to(
              previousCharacters,
              {
                autoAlpha: 0,
                yPercent: -115,
                rotationX: 72,
                duration: 0.28,
                stagger: 0.014,
                ease: "power2.in",
              },
              start,
            )
            .set(previousWord, { autoAlpha: 0 }, start + 0.36)
            .to(
              buildVisualLayers[index - 1],
              {
                autoAlpha: 0,
                yPercent: -16,
                scale: 1.018,
                duration: 0.34,
                ease: "power2.in",
              },
              start,
            )
            .to(
              buildVisualLabels[index - 1],
              { autoAlpha: 0, y: -14, duration: 0.2 },
              start,
            );
        }

        timeline
          .set(word, { autoAlpha: 1 }, start + 0.1)
          .set(
            characters,
            { autoAlpha: 0, yPercent: 115, rotationX: -72 },
            start + 0.1,
          )
          .to(
            characters,
            {
              autoAlpha: 1,
              yPercent: 0,
              rotationX: 0,
              duration: 0.38,
              stagger: 0.018,
              ease: "power3.out",
            },
            start + 0.1,
          )
          .set(
            buildVisualLayers[index],
            { autoAlpha: 0, yPercent: 16, scale: 0.985 },
            start + 0.06,
          )
          .to(
            buildVisualLayers[index],
            {
              autoAlpha: 1,
              yPercent: 0,
              scale: 1,
              duration: 0.44,
              ease: "power3.out",
            },
            start + 0.08,
          )
          .to(
            buildVisualLabels[index],
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.28,
              ease: "power2.out",
            },
            start + 0.24,
          );
      };

      [38.18, 39.35, 40.52, 41.69].forEach((start, index) => {
        scheduleBuildBeat(index, start);
      });

      timeline
        .to(
          buildFixedCopy,
          { autoAlpha: 0, x: -36, duration: 0.28, ease: "power2.in" },
          42.62,
        )
        .to(
          buildVisualLabels[3],
          { autoAlpha: 0, y: -12, duration: 0.18 },
          42.62,
        )
        .to(
          buildVisualFrame,
          {
            x: -445,
            y: 0,
            scale: 2.45,
            borderRadius: 0,
            duration: 0.82,
            ease: "power3.inOut",
          },
          42.72,
        )
        .set(planScene, { display: "block" }, 43.5)
        .to(
          planBlueprintImage,
          {
            clipPath: "inset(0 0% 0 0)",
            duration: 0.5,
            ease: "power3.inOut",
          },
          43.5,
        )
        .to(
          planScanLine,
          {
            autoAlpha: 1,
            x: 1950,
            duration: 0.5,
            ease: "power3.inOut",
          },
          43.5,
        )
        .to(
          planGrid,
          { autoAlpha: 1, scale: 1, duration: 0.34, ease: "power2.out" },
          43.98,
        )
        .to(
          planBlueprintImage,
          { autoAlpha: 0, duration: 0.3, ease: "power2.inOut" },
          44,
        )
        .to(planScanLine, { autoAlpha: 0, duration: 0.1 }, 44)
        .set(buildScene, { display: "none" }, 44.08)
        .to(
          planLead,
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.2,
            ease: "power3.out",
          },
          44.4,
        )
        .to(
          planIdeaBubbles,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.24,
            stagger: 0.03,
            ease: "back.out(1.2)",
          },
          44.52,
        )
        .to(
          planLead,
          {
            x: -360,
            duration: 0.46,
            ease: "power3.inOut",
          },
          45.4,
        )
        .to(
          planAnything,
          {
            autoAlpha: 1,
            clipPath: "inset(0 0% 0 0)",
            duration: 0.44,
            ease: "power3.inOut",
          },
          45.5,
        )
        .to(
          planIdeaBubbles,
          {
            autoAlpha: 0,
            y: -12,
            scale: 0.94,
            duration: 0.22,
            stagger: 0.012,
            ease: "power2.in",
          },
          45.72,
        )
        .to(
          planPaths,
          {
            autoAlpha: 0.72,
            strokeDashoffset: 0,
            duration: 0.48,
            stagger: 0.06,
            ease: "power2.inOut",
          },
          46.04,
        )
        .to(
          planNodes,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.3,
            stagger: 0.09,
            ease: "power3.out",
          },
          46.18,
        )
        .to(
          planTimeline,
          {
            autoAlpha: 1,
            scaleX: 1,
            duration: 0.42,
            ease: "power3.inOut",
          },
          47.04,
        )
        .to(
          planPaths,
          { autoAlpha: 0.2, duration: 0.32, ease: "power2.out" },
          47.14,
        );

      planNodes.forEach((node, index) => {
        timeline.to(
          node,
          {
            ...planNodeLanding[index],
            duration: 0.46,
            ease: "power3.inOut",
          },
          47.12 + index * 0.025,
        );
      });

      timeline
        .to(
          planGhostCards,
          {
            autoAlpha: 0.48,
            y: 0,
            scale: 1,
            duration: 0.36,
            stagger: 0.05,
            ease: "power2.out",
          },
          47.72,
        )
        .to(
          planCamera,
          { scale: 0.84, duration: 0.72, ease: "power3.inOut" },
          47.72,
        )
        .to(
          planGrid,
          { scale: 0.96, duration: 0.72, ease: "power3.inOut" },
          47.72,
        );

      timeline
        .set(closingScene, { display: "block" }, 49.02)
        .set(planScene, { display: "none" }, 49.02)
        .call(() => prepareClosingKeyword("Learn"), [], 49.24)
        .to(
          closingKeyword,
          {
            autoAlpha: 1,
            y: 0,
            clipPath: "inset(0 0% 0 0)",
            duration: 0.32,
            ease: "power3.out",
          },
          49.24,
        )
        .to(
          closingKeyword,
          { autoAlpha: 0, y: -18, duration: 0.16, ease: "power2.in" },
          49.82,
        )
        .call(() => prepareClosingKeyword("Build"), [], 50.02)
        .to(
          closingKeyword,
          {
            autoAlpha: 1,
            y: 0,
            clipPath: "inset(0 0% 0 0)",
            duration: 0.32,
            ease: "power3.out",
          },
          50.02,
        )
        .to(
          closingKeyword,
          { autoAlpha: 0, y: -18, duration: 0.16, ease: "power2.in" },
          50.6,
        )
        .call(() => prepareClosingKeyword("Plan"), [], 50.8)
        .to(
          closingKeyword,
          {
            autoAlpha: 1,
            y: 0,
            clipPath: "inset(0 0% 0 0)",
            duration: 0.32,
            ease: "power3.out",
          },
          50.8,
        )
        .set(closingEraser, { autoAlpha: 1, x: 0 }, 51.48)
        .to(
          closingKeyword,
          {
            clipPath: "inset(0 0 0 100%)",
            duration: 0.46,
            ease: "power3.inOut",
          },
          51.48,
        )
        .to(
          closingEraser,
          { x: 680, duration: 0.46, ease: "power3.inOut" },
          51.48,
        )
        .to(closingEraser, { autoAlpha: 0, duration: 0.1 }, 51.94)
        .set(
          closingCamera,
          { x: -326, y: -100, scale: closingFocusScale },
          52.02,
        )
        .set(closingCopy, { autoAlpha: 1 }, 52.02)
        .set(closingCaret, { autoAlpha: 1 }, 52.02)
        .to(
          closingTyping,
          {
            characters: closingFirstLineLength,
            duration: 1.22,
            ease: "none",
            onUpdate: renderClosingTyping,
          },
          52.06,
        )
        .to(
          closingTyping,
          {
            characters: finalStatement.length,
            duration: 1.52,
            ease: "none",
            onUpdate: renderClosingTyping,
          },
          53.54,
        )
        .call(
          () => {
            closingTypedText.textContent = finalStatement;
          },
          [],
          55.08,
        )
        .to(closingCaret, { autoAlpha: 0, duration: 0.14 }, 55.22)
        .to(
          closingCamera,
          {
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.78,
            ease: "power3.inOut",
          },
          55.44,
        )
        .to(
          closingCopy,
          { autoAlpha: 0, duration: 0.18, ease: "power2.in" },
          56.88,
        )
        .set(brandScene, { display: "block" }, 57.06)
        .set(closingScene, { display: "none" }, 57.06)
        .to(
          brandMark,
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.26,
            ease: "power3.out",
          },
          57.34,
        )
        .to(
          brandMark,
          { x: -150, duration: 0.42, ease: "power3.inOut" },
          58.18,
        )
        .to(
          brandWord,
          {
            autoAlpha: 1,
            clipPath: "inset(0 0% 0 0)",
            duration: 0.42,
            ease: "power3.inOut",
          },
          58.28,
        );

      [
        ["project", 6.4],
        ["planning", 10.15],
        ["assigning", 11.15],
        ["prioritizing", 12.15],
        ["updating", 13.15],
        ["whatIfAll", 14.5],
        ["idea", 52.06],
        ["execution", 53.54],
      ].forEach(([cue, start]) => {
        timeline.call(
          () => playNarration(cue as NarrationCue),
          [],
          Number(start),
        );
      });

      timeline.call(() => undefined, [], 60);

      const retimedAnimations = timeline
        .getChildren(false, true, true)
        .map((animation) => {
          const sourceStart = animation.startTime();
          const sourceDuration = animation.duration();
          const targetStart = quantizeOpeningTime(
            mapOpeningTime(sourceStart),
          );
          const targetEnd = quantizeOpeningTime(
            mapOpeningTime(sourceStart + sourceDuration),
          );

          return {
            animation,
            sourceDuration,
            targetStart,
            targetDuration:
              sourceDuration === 0
                ? 0
                : Math.max(OPENING_GRID_SECONDS, targetEnd - targetStart),
          };
        });

      retimedAnimations.forEach(
        ({ animation, sourceDuration, targetStart, targetDuration }) => {
          if (sourceDuration > 0) animation.duration(targetDuration);
          timeline.add(animation, targetStart);
        },
      );
      timeline.time(0);

      let hasStarted = false;
      const startOpening = () => {
        if (hasStarted) return;
        hasStarted = true;
        unlockNarration();
        gsap.to(startGate, {
          autoAlpha: 0,
          duration: 0.16,
          ease: "power2.out",
          onComplete: () => {
            startGate.style.display = "none";
          },
        });
        timeline.play(0);
      };

      window.addEventListener("pointerdown", startOpening, {
        once: true,
        capture: true,
      });
      window.addEventListener("keydown", startOpening, {
        once: true,
        capture: true,
      });

      return () => {
        window.removeEventListener("pointerdown", startOpening, true);
        window.removeEventListener("keydown", startOpening, true);
        stopNarration();
      };
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      className={styles.root}
      aria-label="Presentation opening"
      data-opening-bpm={OPENING_BPM}
    >
      <button
        ref={startGateRef}
        type="button"
        className={styles.startGate}
        aria-label="Start opening animation"
      >
        <span>Click or press any key to begin</span>
      </button>
      <div ref={cameraRef} className={styles.camera} aria-hidden="true">
        {pageTiles.map((page) => (
          <div
            key={page.id}
            className={styles.tile}
            data-opening-tile={page.id}
            style={{ gridColumn: page.column, gridRow: page.row }}
          >
            <img src={page.source} alt="" draggable={false} />
          </div>
        ))}
        <div className={styles.centerCell}>
          <div ref={learnLayerRef} className={styles.wordLayer}>
            <span ref={learnWordRef} className={styles.word}>
              Learn
            </span>
          </div>
          <div ref={buildLayerRef} className={styles.wordLayer}>
            <span ref={buildWordRef} className={styles.word}>
              Build
            </span>
          </div>
          <div ref={planLayerRef} className={styles.wordLayer}>
            <span ref={planWordRef} className={styles.word}>
              Plan
            </span>
          </div>
        </div>
      </div>
      <div
        ref={problemSceneRef}
        className={styles.problemScene}
        aria-hidden="true"
      >
        <div className={styles.problemCopy}>
          <div ref={problemLineOneRef} className={styles.problemLine}>
            Project management
          </div>
          <div
            ref={problemLineTwoRef}
            className={`${styles.problemLine} ${styles.problemEmphasis}`}
          >
            takes more time
          </div>
          <div ref={problemLineThreeRef} className={styles.problemLine}>
            than the project itself.
          </div>
        </div>
        <div ref={clockModuleRef} className={styles.clockModule}>
          <div className={styles.clockFace}>
            {Array.from({ length: 12 }, (_, index) => (
              <span
                key={index}
                className={styles.clockMarker}
                style={{ transform: `rotate(${index * 30}deg)` }}
              />
            ))}
            <div ref={hourHandRef} className={styles.hourHand} />
            <div ref={minuteHandRef} className={styles.minuteHand} />
            <div ref={secondHandRef} className={styles.secondHand} />
            <div className={styles.clockPin} />
          </div>
          <div ref={elapsedTimeRef} className={styles.elapsedTime}>
            00:00:00
          </div>
          <div className={styles.elapsedLabel}>TIME SPENT MANAGING</div>
        </div>
      </div>
      <div
        ref={editorialSceneRef}
        className={styles.editorialScene}
        aria-hidden="true"
      >
        <div ref={editorialCameraRef} className={styles.editorialCamera}>
          {editorialPageIndex >= 0 ? (
            <article className={styles.editorialPage}>
              <header className={styles.editorialHeader}>
                <span className={styles.editorialNumber}>
                  {editorialPages[editorialPageIndex].number}
                </span>
                <div className={styles.editorialTopics}>
                  {editorialPages[editorialPageIndex].topics.map((topic) => (
                    <span key={topic}>{topic}</span>
                  ))}
                </div>
                <span className={styles.editorialCategory}>
                  Project operations
                </span>
              </header>
              <h2 className={styles.editorialTitle}>
                {editorialPageIndex === 0 ? (
                  <span className={styles.decryptedTitle}>Planning</span>
                ) : (
                  <DecryptedText
                    key={editorialPages[editorialPageIndex].title}
                    text={editorialPages[editorialPageIndex].title}
                    className={styles.decryptedTitle}
                  />
                )}
              </h2>
              <div className={styles.editorialFooter}>
                <p>{editorialPages[editorialPageIndex].body}</p>
                <p>{editorialPages[editorialPageIndex].note}</p>
              </div>
            </article>
          ) : null}
        </div>
      </div>
      <div
        ref={automationSceneRef}
        className={styles.automationScene}
        aria-hidden="true"
      >
        <div ref={automationCameraRef} className={styles.automationCamera}>
          <div className={styles.automationBackgrounds}>
            {automationThemes.map((theme) => (
              <img
                key={theme.id}
                data-automation-theme={theme.id}
                className={styles.automationBackground}
                src={theme.source}
                alt=""
                draggable={false}
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
            <strong>12</strong>
            <span>Tasks today</span>
          </article>

          <article
            className={`${styles.autoCard} ${styles.autoAccentCard} ${styles.autoGrowth}`}
          >
            <IconArrowUpRight size={30} stroke={2.4} />
            <strong>+23%</strong>
            <span>Velocity</span>
          </article>

          <article className={`${styles.autoCard} ${styles.autoLeftList}`}>
            <span className={styles.autoKicker}>Launch sequence</span>
            {[
              "Approve headline",
              "Assign reviewers",
              "Prepare campaign",
              "Run QA",
            ].map((item, index) => (
              <div className={styles.autoChecklistRow} key={item}>
                <span className={index < 2 ? styles.autoChecked : ""}>
                  {index < 2 ? <IconCheck size={15} stroke={3} /> : null}
                </span>
                {item}
              </div>
            ))}
          </article>

          <h2 className={styles.automationQuestion}>
            <span>What if</span>
            <span>all of that</span>
            <span>happened</span>
            <span className={styles.automationAccent}>automatically?</span>
          </h2>

          <h2
            className={`${styles.automationQuestion} ${styles.automationQuestionTyped}`}
          >
            {Array.from({ length: 4 }, (_, index) => (
              <span key={index} data-automation-typed-line />
            ))}
          </h2>

          <article className={`${styles.autoCard} ${styles.autoBoard}`}>
            <div className={styles.autoBoardHeader}>
              <span>Product launch</span>
              <div className={styles.autoAvatarStack}>
                <span>A</span>
                <span>M</span>
                <span>J</span>
              </div>
            </div>
            <div className={styles.autoBoardColumns}>
              <div>
                <span>To do</span>
                <i />
                <i />
              </div>
              <div>
                <span>In progress</span>
                <i />
                <i />
              </div>
              <div>
                <span>Done</span>
                <i />
                <i />
              </div>
            </div>
          </article>

          <article
            className={`${styles.autoCard} ${styles.autoAccentCard} ${styles.autoPercent}`}
          >
            <strong>%</strong>
            <span>68%</span>
            <small>Complete</small>
          </article>

          <article className={`${styles.autoCard} ${styles.autoQueue}`}>
            <div className={styles.autoSectionTitle}>
              <IconSparkles size={21} stroke={2.3} />
              AI priority queue
            </div>
            <div className={styles.autoQueueRow}>
              <span>Launch planning</span>
              <b>Ready</b>
            </div>
            <div className={styles.autoQueueRow}>
              <span>Review resources</span>
              <b>Assigned</b>
            </div>
          </article>

          <article className={`${styles.autoCard} ${styles.autoDuration}`}>
            <IconClock size={22} stroke={2.2} />
            <strong>3d</strong>
            <span>Saved this week</span>
          </article>

          <article className={`${styles.autoCard} ${styles.autoActivity}`}>
            <span>Actions run</span>
            <strong>1,247</strong>
            <div className={styles.autoSparkline}>
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </article>

          <article
            className={`${styles.autoCard} ${styles.autoAccentCard} ${styles.autoAi}`}
          >
            <IconBolt size={38} stroke={2.2} />
            <strong>AI</strong>
          </article>

          <article className={`${styles.autoCard} ${styles.autoProgress}`}>
            <span>Capacity</span>
            <div className={styles.autoProgressTrack}>
              <i />
            </div>
            <strong>72%</strong>
          </article>

          <article className={`${styles.autoCard} ${styles.autoTaskList}`}>
            <div className={styles.autoSectionTitle}>
              <IconSparkles size={21} stroke={2.3} />
              Work happening now
            </div>
            {[
              ["Create launch brief", "In progress"],
              ["Coordinate design review", "Assigned"],
              ["Update project timeline", "Complete"],
            ].map(([task, status]) => (
              <div className={styles.autoTaskRow} key={task}>
                <span>{task}</span>
                <b>{status}</b>
              </div>
            ))}
          </article>

          <article className={`${styles.autoCard} ${styles.autoMembers}`}>
            <IconUsers size={25} stroke={2.2} />
            <strong>200+</strong>
            <span>Collaborators</span>
          </article>

          <article
            className={`${styles.autoCard} ${styles.autoAccentCard} ${styles.autoMilestones}`}
          >
            <strong>15</strong>
            <span>Milestones</span>
          </article>

          <article className={`${styles.autoCard} ${styles.autoRating}`}>
            <span>Execution score</span>
            <strong>4.7</strong>
            <small>Excellent</small>
          </article>

          <article className={`${styles.autoCard} ${styles.autoBanner}`}>
            <div>
              <span>From idea to impact</span>
              <strong>Ship faster.</strong>
            </div>
            <button type="button" tabIndex={-1}>
              Start now
              <IconArrowUpRight size={20} stroke={2.4} />
            </button>
          </article>
          </div>
        </div>
      </div>
      <div ref={chatSceneRef} className={styles.chatScene} aria-hidden="true">
        <div ref={chatCameraRef} className={styles.chatCamera}>
          <div className={styles.chatHeader}>
          <IconBrandOpenai size={70} stroke={1.8} />
          <h2>Hi! How can I help you today?</h2>
          <p>Bring the idea. AI handles the execution.</p>
          </div>

          <div className={styles.chatComposer}>
          <div className={styles.composerPrompt}>
            <span ref={composerTextRef} />
            <span ref={composerCaretRef} className={styles.composerCaret} />
          </div>

          <button
            className={styles.composerAdd}
            type="button"
            tabIndex={-1}
          >
            <IconPlus size={30} stroke={1.8} />
          </button>

          <div
            ref={reasoningPopoverRef}
            className={styles.reasoningPopover}
          >
            <div className={styles.reasoningHeader}>
              <span>Reasoning effort</span>
              <span ref={reasoningLabelRef}>Medium</span>
            </div>
            <div className={styles.reasoningTrack}>
              <div ref={sliderFillRef} className={styles.reasoningFill} />
              <div ref={sliderThumbRef} className={styles.reasoningThumb} />
            </div>
            <div className={styles.reasoningScale}>
              <span>Low</span>
              <span>Medium</span>
              <span>Ultra</span>
            </div>
          </div>

          <button
            ref={modelButtonRef}
            className={styles.modelButton}
            type="button"
            tabIndex={-1}
          >
            <IconBrandOpenai size={24} stroke={1.9} />
            <span ref={modelLabelRef}>5.6 Sol Medium</span>
            <IconChevronDown size={20} stroke={2.1} />
          </button>

          <button
            ref={sendButtonRef}
            className={styles.sendButton}
            type="button"
            tabIndex={-1}
          >
            <span ref={sendArrowRef} className={styles.sendState}>
              <IconArrowUp size={26} stroke={2.4} />
            </span>
            <span ref={sendStopRef} className={styles.sendState}>
              <IconPlayerStopFilled size={19} />
            </span>
          </button>
          </div>

          <div ref={fakeCursorRef} className={styles.fakeCursor}>
            <IconPointerFilled size={42} />
          </div>
        </div>
      </div>
      <div
        ref={learnSpaceSceneRef}
        className={styles.learnSpaceScene}
        aria-hidden="true"
      >
        <img
          ref={learnSpaceBackgroundRef}
          className={styles.learnSpaceBackground}
          src={learnStarfield.src}
          alt=""
          draggable={false}
        />
        <span ref={spaceLearnWordRef} className={styles.spaceLearnWord}>
          Learn
        </span>
        <div ref={learnWorkbenchRef} className={styles.learnWorkbench}>
          <div className={styles.lessonEyebrow}>REFERENCE → INTERACTION</div>
          <div ref={lessonComposerRef} className={styles.lessonComposer}>
            <div className={styles.lessonComposerHeader}>
              <div className={styles.lessonComposerIdentity}>
                <span className={styles.lessonComposerLogo}>
                  <IconBrandOpenai size={29} stroke={1.8} />
                </span>
                <div>
                  <strong>Lesson builder</strong>
                  <span>3 references ready</span>
                </div>
              </div>
              <span className={styles.lessonMode}>5.6 Sol Ultra</span>
            </div>

            <div className={styles.lessonReferenceRow}>
              <article
                className={styles.lessonReferenceCard}
                data-lesson-reference="mars"
              >
                <img src={learnReferenceMars.src} alt="" draggable={false} />
                <div>
                  <strong>Mars observation</strong>
                  <span>Planetary image · PNG</span>
                </div>
              </article>
              <article
                className={styles.lessonReferenceCard}
                data-lesson-reference="sketch"
              >
                <img
                  src={learnReferenceOrbitSketch.src}
                  alt=""
                  draggable={false}
                />
                <div>
                  <strong>Orbit sketch</strong>
                  <span>Class notes · PNG</span>
                </div>
              </article>
              <article
                className={styles.lessonReferenceCard}
                data-lesson-reference="data"
              >
                <img src={learnReferenceData.src} alt="" draggable={false} />
                <div>
                  <strong>Earth &amp; Mars data</strong>
                  <span>Textbook page · PNG</span>
                </div>
              </article>
            </div>

            <div className={styles.lessonPrompt}>
              <span ref={lessonPromptTextRef} />
              <span
                ref={lessonPromptCaretRef}
                className={styles.lessonPromptCaret}
              />
            </div>
            <div className={styles.lessonComposerFooter}>
              <button type="button" tabIndex={-1}>
                <IconPlus size={23} stroke={1.9} />
              </button>
              <span>Interactive lesson</span>
              <button
                ref={lessonSendButtonRef}
                className={styles.lessonSendButton}
                type="button"
                tabIndex={-1}
              >
                <IconArrowUp size={24} stroke={2.4} />
              </button>
            </div>
            <div
              ref={lessonBuildStatusRef}
              className={styles.lessonBuildStatus}
            >
              <span />
              Building Orbit Lab
            </div>
          </div>
          <div ref={lessonCursorRef} className={styles.lessonCursor}>
            <IconPointerFilled size={42} />
          </div>
        </div>
      </div>
      <div
        ref={orbitLabSceneRef}
        className={styles.orbitLabScene}
        aria-hidden="true"
      >
        <div ref={orbitLabShellRef} className={styles.orbitLabShell}>
          <header ref={orbitLabHeaderRef} className={styles.orbitLabHeader}>
            <div className={styles.orbitBrand}>
              <span className={styles.orbitBrandMark}>
                <IconRocket size={29} stroke={1.9} />
              </span>
              <div>
                <strong>Orbit Lab</strong>
                <span>Interactive astronomy lesson</span>
              </div>
            </div>
            <nav>
              <span className={styles.orbitNavActive}>Orbital motion</span>
              <span>Compare</span>
              <span>Notes</span>
            </nav>
            <span className={styles.orbitGeneratedBadge}>
              <IconSparkles size={17} stroke={2} />
              Generated from 3 references
            </span>
          </header>

          <main className={styles.orbitLabBody}>
            <section ref={orbitCanvasRef} className={styles.orbitCanvas}>
              <div className={styles.orbitCanvasHeading}>
                <div>
                  <span>LIVE MODEL</span>
                  <h2>Why does Mars take longer?</h2>
                </div>
                <span className={styles.orbitScaleLabel}>Not to scale</span>
              </div>

              <div className={styles.orbitStage}>
                <div className={styles.marsOrbitRing} />
                <div className={styles.earthOrbitRing} />
                <div className={styles.orbitSun}>
                  <span />
                </div>
                <div className={styles.planetAnchor}>
                  <div ref={earthPlanetRef} className={styles.earthPlanet}>
                    <span />
                    <small>Earth</small>
                  </div>
                  <button
                    ref={marsPlanetRef}
                    className={styles.marsPlanet}
                    type="button"
                    tabIndex={-1}
                  >
                    <span />
                    <small>Mars</small>
                  </button>
                </div>
                <div className={styles.orbitDistanceHint}>
                  <span />
                  Farther orbit → longer year
                </div>
              </div>

              <div ref={orbitControlsRef} className={styles.orbitControls}>
                <div className={styles.orbitControlHeader}>
                  <span className={styles.orbitPlayButton}>
                    <IconPlayerPlayFilled size={16} />
                  </span>
                  <strong>Move through one Martian year</strong>
                  <span ref={orbitDayRef}>Day 0</span>
                </div>
                <div className={styles.orbitTimelineTrack}>
                  <div
                    ref={orbitSliderFillRef}
                    className={styles.orbitTimelineFill}
                  />
                  <div
                    ref={orbitSliderThumbRef}
                    className={styles.orbitTimelineThumb}
                  />
                </div>
                <div className={styles.orbitTimelineScale}>
                  <span>Launch</span>
                  <span>Earth · 365 days</span>
                  <span>Mars · 687 days</span>
                </div>
              </div>
            </section>

            <aside ref={orbitMetricsRef} className={styles.orbitMetrics}>
              <div className={styles.orbitMetricsHeading}>
                <span>COMPARE ORBITS</span>
                <strong>Earth vs. Mars</strong>
              </div>
              <article className={styles.orbitMetricCard} data-orbit-metric>
                <div>
                  <span>Distance from Sun</span>
                  <IconInfoCircle size={18} stroke={1.8} />
                </div>
                <strong>1.00 <small>AU</small></strong>
                <div className={styles.metricBar}>
                  <span style={{ width: "66%" }} />
                  <span style={{ width: "100%" }} />
                </div>
                <footer><span>Earth</span><span>Mars · 1.52 AU</span></footer>
              </article>
              <article className={styles.orbitMetricCard} data-orbit-metric>
                <div>
                  <span>Average speed</span>
                  <IconInfoCircle size={18} stroke={1.8} />
                </div>
                <strong>29.8 <small>km/s</small></strong>
                <div className={styles.metricBar}>
                  <span style={{ width: "100%" }} />
                  <span style={{ width: "81%" }} />
                </div>
                <footer><span>Earth</span><span>Mars · 24.1 km/s</span></footer>
              </article>
              <article className={styles.orbitMetricCard} data-orbit-metric>
                <div>
                  <span>Orbital period</span>
                  <IconInfoCircle size={18} stroke={1.8} />
                </div>
                <strong>365 <small>days</small></strong>
                <div className={styles.metricBar}>
                  <span style={{ width: "53%" }} />
                  <span style={{ width: "100%" }} />
                </div>
                <footer><span>Earth</span><span>Mars · 687 days</span></footer>
              </article>

              <div ref={marsInsightRef} className={styles.marsInsight}>
                <span className={styles.marsInsightEyebrow}>MARS · SELECTED</span>
                <div className={styles.marsInsightPlanet} />
                <h3>A longer path,<br />a slower orbit.</h3>
                <p>
                  Mars is farther from the Sun, so it travels a wider orbit at
                  a lower average speed.
                </p>
                <dl>
                  <div><dt>Distance</dt><dd>1.52 AU</dd></div>
                  <div><dt>Speed</dt><dd>24.1 km/s</dd></div>
                  <div><dt>One year</dt><dd>687 days</dd></div>
                </dl>
                <span className={styles.marsInsightPrompt}>
                  Drag the timeline to compare positions.
                </span>
              </div>
            </aside>
          </main>
        </div>
        <div ref={orbitCursorRef} className={styles.orbitCursor}>
          <IconPointerFilled size={42} />
        </div>
        <div ref={orbitClosingScrimRef} className={styles.orbitClosingScrim} />
        <div ref={orbitClosingLineRef} className={styles.orbitClosingLine}>
          <span>Learn by exploring,</span>
          <strong>not just reading.</strong>
        </div>
      </div>
      <div ref={buildSceneRef} className={styles.buildScene} aria-hidden="true">
        <span className={styles.buildChapterLabel}>CHAPTER 02 · BUILD</span>
        <span ref={buildIntroWordRef} className={styles.buildIntroWord}>
          Build
        </span>
        <div ref={buildFixedCopyRef} className={styles.buildFixedCopy}>
          <span className={styles.buildLead}>Build a</span>
          <RotatingText words={buildWords} className={styles.buildRotatingText} />
        </div>
        <div ref={buildVisualFrameRef} className={styles.buildVisualFrame}>
          {buildVisuals.map((visual, index) => (
            <img
              key={visual.word}
              data-build-visual={index}
              src={visual.source}
              alt=""
              draggable={false}
            />
          ))}
          {buildVisuals.map((visual, index) => (
            <div
              key={visual.label}
              className={styles.buildVisualLabel}
              data-build-visual-label={index}
            >
              <span>{String(index + 1).padStart(2, "0")} / 04</span>
              <strong>{visual.label}</strong>
            </div>
          ))}
        </div>
      </div>
      <div ref={planSceneRef} className={styles.planScene} aria-hidden="true">
        <img
          ref={planBlueprintImageRef}
          className={styles.planBlueprintImage}
          src={buildWorld.src}
          alt=""
          draggable={false}
        />
        <div ref={planGridRef} className={styles.planGrid} />
        <div ref={planScanLineRef} className={styles.planScanLine} />

        <div ref={planCameraRef} className={styles.planCamera}>
          <div className={styles.planIdeaCloud}>
            {planIdeas.map((idea) => (
              <span key={idea} data-plan-idea>
                {idea}
              </span>
            ))}
          </div>

          <span ref={planLeadRef} className={styles.planLead}>
            Plan
          </span>
          <span ref={planAnythingRef} className={styles.planAnything}>
            anything.
          </span>

          <div ref={planCanvasRef} className={styles.planCanvas}>
            <svg
              className={styles.planConnections}
              viewBox="0 0 1920 1080"
              aria-hidden="true"
            >
              <path
                data-plan-path
                pathLength="1"
                d="M 1090 555 C 900 580, 675 615, 460 700"
              />
              <path
                data-plan-path
                pathLength="1"
                d="M 1090 555 C 980 620, 870 680, 780 760"
              />
              <path
                data-plan-path
                pathLength="1"
                d="M 1090 555 C 1110 625, 1140 690, 1160 760"
              />
              <path
                data-plan-path
                pathLength="1"
                d="M 1090 555 C 1270 580, 1435 625, 1540 700"
              />
            </svg>

            <article
              className={`${styles.planNode} ${styles.planNodeGoal}`}
              data-plan-node
            >
              <span className={styles.planNodeIcon}>
                <IconSparkles size={24} stroke={1.9} />
              </span>
              <div><small>GOAL</small><strong>Launch with confidence</strong></div>
            </article>
            <article
              className={`${styles.planNode} ${styles.planNodeMilestones}`}
              data-plan-node
            >
              <span className={styles.planNodeIcon}>
                <IconClock size={24} stroke={1.9} />
              </span>
              <div><small>MILESTONES</small><strong>Research → Build → Ship</strong></div>
            </article>
            <article
              className={`${styles.planNode} ${styles.planNodeTasks}`}
              data-plan-node
            >
              <span className={styles.planNodeIcon}>
                <IconCheck size={24} stroke={2.1} />
              </span>
              <div><small>TASKS</small><strong>36 actionable steps</strong></div>
            </article>
            <article
              className={`${styles.planNode} ${styles.planNodeOwners}`}
              data-plan-node
            >
              <span className={styles.planNodeIcon}>
                <IconUsers size={24} stroke={1.9} />
              </span>
              <div><small>OWNERS</small><strong>6 collaborators aligned</strong></div>
              <span className={styles.planAvatarStack}>
                <i>M</i><i>A</i><i>S</i>
              </span>
            </article>

            <div ref={planTimelineRef} className={styles.planTimeline}>
              <span><i />TODAY</span>
              <span><i />WEEK 2</span>
              <span><i />WEEK 5</span>
              <span><i />LAUNCH</span>
            </div>

            <span className={`${styles.planGhostCard} ${styles.planGhostOne}`} data-plan-ghost>
              Research audience
            </span>
            <span className={`${styles.planGhostCard} ${styles.planGhostTwo}`} data-plan-ghost>
              Prototype core flow
            </span>
            <span className={`${styles.planGhostCard} ${styles.planGhostThree}`} data-plan-ghost>
              Review success metrics
            </span>
            <span className={`${styles.planGhostCard} ${styles.planGhostFour}`} data-plan-ghost>
              Prepare launch assets
            </span>
            <span className={`${styles.planGhostCard} ${styles.planGhostFive}`} data-plan-ghost>
              Risk · Data migration
            </span>
            <span className={`${styles.planGhostCard} ${styles.planGhostSix}`} data-plan-ghost>
              Dependency · Design system
            </span>
          </div>
        </div>
      </div>
      <div
        ref={closingSceneRef}
        className={styles.closingScene}
        aria-hidden="true"
      >
        <span ref={closingKeywordRef} className={styles.closingKeyword} />
        <span ref={closingEraserRef} className={styles.closingEraser} />

        <div ref={closingCameraRef} className={styles.closingCamera}>
          <div ref={closingCopyRef} className={styles.closingCopy}>
            <span ref={closingTypedTextRef} />
            <span ref={closingCaretRef} className={styles.closingCaret} />
          </div>
        </div>
      </div>
      <div ref={brandSceneRef} className={styles.brandScene} aria-hidden="true">
        <div className={styles.brandLockup}>
          <span ref={brandMarkRef} className={styles.brandMark}>
            <IconBrandOpenai size={150} stroke={1.8} />
          </span>
          <span ref={brandWordRef} className={styles.brandWord}>
            ChatGPT
          </span>
        </div>
      </div>
      <div
        ref={rocketTransitionRef}
        className={styles.rocketTransition}
        aria-hidden="true"
      >
        <img
          ref={rocketSpriteRef}
          className={styles.rocketSprite}
          src={rocketLaunch.src}
          alt=""
          draggable={false}
        />
      </div>
      <div hidden aria-hidden="true">
        {(Object.entries(narrationSources) as [NarrationCue, string][]).map(
          ([cue, source]) => (
            <audio
              key={cue}
              ref={(audio) => {
                if (audio) narrationRefs.current[cue] = audio;
                else delete narrationRefs.current[cue];
              }}
              src={source}
              preload="auto"
            />
          ),
        )}
      </div>
    </section>
  );
}
