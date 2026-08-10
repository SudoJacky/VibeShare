"use client";

import { useGSAP } from "@gsap/react";
import {
  IconAlertTriangle,
  IconCrosshair,
  IconFocusCentered,
  IconGridDots,
  IconPlus,
  IconScan,
} from "@tabler/icons-react";
import gsap from "gsap";
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { OpeningSequence } from "./opening/OpeningSequence";
import { syncPresentationHash } from "./presentation-location";

gsap.registerPlugin(useGSAP);

type PresentationMode = "audience" | "presenter";
type MotionKind = "rise" | "grow-x" | "grow-y" | "fade" | "wipe";

let audienceOpeningHasCompleted = false;

type SlideDefinition = {
  id: string;
  section: string;
  title: string;
  conclusion: string;
  frameCount: number;
  notes: string[];
  visual: ReactNode;
};

type RevealProps = {
  step: number;
  children: ReactNode;
  className?: string;
  motion?: MotionKind;
  wipeFrom?: number;
};

function Reveal({
  step,
  children,
  className = "",
  motion = "rise",
  wipeFrom,
}: RevealProps) {
  return (
    <div
      className={className}
      data-motion={motion}
      data-step={step}
      data-wipe-from={wipeFrom}
    >
      {children}
    </div>
  );
}

const CONTROL_CHART_WIDTH = 870;
const CONTROL_CHART_HEIGHT = 704;

const controlChartPoints = {
  explore: [
    [12, 508],
    [96, 422],
    [127, 381],
    [157, 338],
    [202, 308],
    [242, 260],
    [297, 229],
  ],
  risk: [
    [297, 229],
    [362, 251],
    [391, 307],
    [433, 340],
    [474, 369],
  ],
  control: [
    [474, 369],
    [512, 382],
    [548, 362],
    [587, 322],
    [631, 276],
    [679, 228],
    [731, 178],
    [787, 157],
    [852, 92],
  ],
} satisfies Record<string, [number, number][]>;

function drawControlPath(
  context: CanvasRenderingContext2D,
  points: [number, number][],
  color: string,
  options: { arrow?: boolean; skipFirstMarker?: boolean } = {},
) {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = 3;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.stroke();

  const lastMarkerIndex = options.arrow ? points.length - 2 : points.length - 1;
  points.forEach(([x, y], index) => {
    if ((options.skipFirstMarker && index === 0) || index > lastMarkerIndex) {
      return;
    }
    context.beginPath();
    context.arc(x, y, 4.5, 0, Math.PI * 2);
    context.fillStyle = "#0a1013";
    context.fill();
    context.lineWidth = 2.5;
    context.strokeStyle = color;
    context.stroke();
  });

  if (options.arrow) {
    const [endX, endY] = points.at(-1) ?? [0, 0];
    const [previousX, previousY] = points.at(-2) ?? [0, 0];
    const angle = Math.atan2(endY - previousY, endX - previousX);
    const arrowSize = 19;
    context.beginPath();
    context.moveTo(
      endX - arrowSize * Math.cos(angle - Math.PI / 5),
      endY - arrowSize * Math.sin(angle - Math.PI / 5),
    );
    context.lineTo(endX, endY);
    context.lineTo(
      endX - arrowSize * Math.cos(angle + Math.PI / 5),
      endY - arrowSize * Math.sin(angle + Math.PI / 5),
    );
    context.lineWidth = 4;
    context.strokeStyle = color;
    context.stroke();
  }
  context.restore();
}

function ControlChartCanvas({
  layer,
}: {
  layer: "base" | "explore" | "risk" | "control";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = CONTROL_CHART_WIDTH * pixelRatio;
    canvas.height = CONTROL_CHART_HEIGHT * pixelRatio;
    canvas.style.width = `${CONTROL_CHART_WIDTH}px`;
    canvas.style.height = `${CONTROL_CHART_HEIGHT}px`;

    const context = canvas.getContext("2d");
    if (!context) return;
    context.scale(pixelRatio, pixelRatio);

    if (layer === "base") {
      context.save();
      context.strokeStyle = "rgba(76, 91, 95, 0.16)";
      context.lineWidth = 1;
      for (let x = 12; x <= 852; x += 48) {
        context.beginPath();
        context.moveTo(x, 12);
        context.lineTo(x, 508);
        context.stroke();
      }
      for (let y = 28; y <= 508; y += 48) {
        context.beginPath();
        context.moveTo(12, y);
        context.lineTo(858, y);
        context.stroke();
      }

      context.strokeStyle = "rgba(186, 190, 185, 0.82)";
      context.lineWidth = 1.5;
      context.beginPath();
      context.moveTo(12, 508);
      context.lineTo(12, 12);
      context.moveTo(12, 12);
      context.lineTo(2, 24);
      context.moveTo(12, 12);
      context.lineTo(22, 24);
      context.moveTo(12, 508);
      context.lineTo(858, 508);
      context.moveTo(858, 508);
      context.lineTo(846, 498);
      context.moveTo(858, 508);
      context.lineTo(846, 518);
      context.stroke();

      context.setLineDash([7, 7]);
      context.strokeStyle = "rgba(168, 170, 166, 0.44)";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(12, 341);
      context.lineTo(858, 341);
      context.moveTo(266, 105);
      context.lineTo(266, 696);
      context.moveTo(545, 105);
      context.lineTo(545, 696);
      context.stroke();
      context.restore();
    } else if (layer === "explore") {
      drawControlPath(context, controlChartPoints.explore, "#e8e7e0");
    } else if (layer === "risk") {
      drawControlPath(context, controlChartPoints.risk, "#ff7f62", {
        skipFirstMarker: true,
      });
    } else {
      drawControlPath(context, controlChartPoints.control, "#c5ff3d", {
        arrow: true,
        skipFirstMarker: true,
      });
    }
  }, [layer]);

  return (
    <canvas
      ref={canvasRef}
      className="control-chart__canvas"
      aria-hidden="true"
    />
  );
}

function StageDots({
  active,
  count = 5,
}: {
  active: number[];
  count?: number;
}) {
  return (
    <div className="stage-dots" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <span key={index} data-active={active.includes(index)} />
      ))}
    </div>
  );
}

function Node({
  index,
  title,
  detail,
  tone = "default",
}: {
  index: string;
  title: string;
  detail?: string;
  tone?: "default" | "active" | "danger";
}) {
  return (
    <div className={`flow-node flow-node--${tone}`}>
      <span className="flow-node__index">{index}</span>
      <span className="flow-node__title">{title}</span>
      {detail ? <span className="flow-node__detail">{detail}</span> : null}
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "active" | "danger";
}) {
  return (
    <div className={`metric metric--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const slides: SlideDefinition[] = [
  {
    id: "control",
    section: "CONTROL",
    title: "控制权",
    conclusion: "这不是一场模型介绍，而是一段重新获得代码库控制权的经历。",
    frameCount: 4,
    notes: [
      "先讲最初的复制粘贴和 VDI 手敲代码。",
      "慢，但是每一行代码都经过自己的手。",
      "Agent 把执行速度拉高，也让代码库开始失控。",
      "今天不讲模型跑分，讲怎样重新获得控制。",
    ],
    visual: (
      <div className="cover-layout">
        <div className="cover-copy">
          <h1>
            <span>AI 写得越来越快</span>
            <span>我怎样没有失去对代码库的控制</span>
          </h1>
        </div>
        <div className="cover-signature">
          <span className="cover-signature__mark">
            <IconPlus size={27} stroke={1.7} aria-hidden="true" />
          </span>
          <p>VIBE CODING / FIELD NOTES</p>
        </div>
        <div
          className="control-chart"
          role="img"
          aria-label="速度提升后控制力先下降，再通过工程判断重新建立控制"
        >
          <ControlChartCanvas layer="base" />
          <span className="control-chart__axis control-chart__axis--speed">
            SPEED
          </span>
          <span className="control-chart__axis control-chart__axis--control">
            CONTROL
          </span>
          <Reveal
            step={1}
            className="control-chart__layer"
            motion="wipe"
            wipeFrom={1}
          >
            <ControlChartCanvas layer="explore" />
          </Reveal>
          <Reveal
            step={2}
            className="control-chart__layer"
            motion="wipe"
            wipeFrom={34}
          >
            <ControlChartCanvas layer="risk" />
          </Reveal>
          <Reveal
            step={3}
            className="control-chart__layer"
            motion="wipe"
            wipeFrom={53}
          >
            <ControlChartCanvas layer="control" />
          </Reveal>

          <Reveal step={2} className="risk-marker" motion="fade">
            <IconScan size={88} stroke={1.2} aria-hidden="true" />
            <IconAlertTriangle
              className="risk-marker__warning"
              size={37}
              stroke={1.7}
              aria-hidden="true"
            />
          </Reveal>

          <Reveal step={1} className="chart-stage chart-stage--explore">
            <IconGridDots size={43} stroke={1.5} aria-hidden="true" />
            <div>
              <strong>探索加速</strong>
              <span>速度提升</span>
              <StageDots active={[0, 1]} count={4} />
            </div>
          </Reveal>
          <Reveal step={2} className="chart-stage chart-stage--risk">
            <IconCrosshair size={43} stroke={1.4} aria-hidden="true" />
            <div>
              <strong>失控风险</strong>
              <span>控制力下降</span>
              <StageDots active={[2]} />
            </div>
          </Reveal>
          <Reveal step={3} className="chart-stage chart-stage--control">
            <IconFocusCentered size={43} stroke={1.5} aria-hidden="true" />
            <div>
              <strong>重建控制</strong>
              <span>稳定与判断</span>
              <StageDots active={[2, 3]} />
            </div>
          </Reveal>
        </div>
      </div>
    ),
  },
  {
    id: "manual-loop",
    section: "GEN 01",
    title: "复制、运行、报错、再复制",
    conclusion: "第一代工作流很慢，但执行权始终在人手里。",
    frameCount: 5,
    notes: [
      "最初只是在网页上向模型描述问题。",
      "复制代码，在 VDI 中甚至需要逐行手敲。",
      "运行以后，把报错再贴回模型。",
      "反馈循环很长，大量时间消耗在搬运上下文。",
      "它的好处是控制权仍然完全在人手里。",
    ],
    visual: (
      <div className="manual-layout">
        <div className="loop-board">
          <Node index="01" title="DESCRIBE" detail="向模型描述问题" />
          <Reveal step={1}>
            <Node index="02" title="COPY" detail="复制生成代码" />
          </Reveal>
          <Reveal step={1}>
            <Node index="03" title="TYPE" detail="手动修改 / 逐行输入" />
          </Reveal>
          <Reveal step={2}>
            <Node index="04" title="RUN" detail="本地执行" />
          </Reveal>
          <Reveal step={2}>
            <Node index="05" title="ERROR" detail="复制错误信息" />
          </Reveal>
          <Reveal step={3}>
            <Node index="06" title="REPEAT" detail="继续下一轮对话" />
          </Reveal>
          <Reveal
            step={3}
            className="loop-return"
            motion="grow-x"
          >
            <span>LONG FEEDBACK LOOP</span>
          </Reveal>
        </div>
        <Reveal step={4} className="metric-rail">
          <Metric label="CONTROL" value="100%" tone="active" />
          <Metric label="THROUGHPUT" value="LOW" />
          <Metric label="CONTEXT" value="MANUAL" />
        </Reveal>
      </div>
    ),
  },
  {
    id: "agent-speed",
    section: "GEN 02",
    title: "执行速度突然不再稀缺",
    conclusion: "Agent 压缩了反馈循环，也拉开了速度与控制之间的距离。",
    frameCount: 5,
    notes: [
      "Coding Agent 可以自己搜索、修改、运行和继续修复。",
      "原来的长循环被压缩成一条自动流水线。",
      "过去几十分钟的操作，现在可以连续执行。",
      "速度和覆盖范围上升，控制感却开始下降。",
      "我最初真正感受到的是焦虑：我会不会很快失业？",
    ],
    visual: (
      <div className="agent-layout">
        <div className="ghost-loop">
          <span>DESCRIBE</span>
          <span>COPY</span>
          <span>RUN</span>
          <span>ERROR</span>
        </div>
        <Reveal step={1} className="agent-pipeline">
          {["GOAL", "SEARCH", "EDIT", "TEST", "ITERATE"].map((item, index) => (
            <Node
              key={item}
              index={`0${index + 1}`}
              title={item}
              tone={index === 4 ? "active" : "default"}
            />
          ))}
        </Reveal>
        <Reveal
          step={2}
          className="pipeline-compression"
          motion="grow-x"
        >
          <span>FEEDBACK LOOP / COMPRESSED</span>
        </Reveal>
        <Reveal step={3} className="meter-stack">
          <div className="meter-row">
            <span>SPEED</span>
            <i style={{ "--meter": "94%" } as CSSProperties} />
          </div>
          <div className="meter-row">
            <span>COVERAGE</span>
            <i style={{ "--meter": "88%" } as CSSProperties} />
          </div>
          <div className="meter-row meter-row--danger">
            <span>CONTROL</span>
            <i style={{ "--meter": "34%" } as CSSProperties} />
          </div>
        </Reveal>
        <Reveal step={4} className="question-stage" motion="fade">
          <span>FIRST REACTION</span>
          <strong>我会不会很快失业？</strong>
        </Reveal>
      </div>
    ),
  },
  {
    id: "entropy",
    section: "CODE ENTROPY",
    title: "生成很快，删除却很少",
    conclusion: "当验收只要求完成时，增加代码通常比删除代码更安全。",
    frameCount: 5,
    notes: [
      "功能不断出现，代码库看起来每天都在高速前进。",
      "新需求不断进入，代码量快速增长。",
      "旧逻辑没有随新实现退出。",
      "兼容分支、复制逻辑和临时抽象逐渐长出来。",
      "功能增长和代码可理解性开始走向相反方向。",
    ],
    visual: (
      <div className="entropy-layout">
        <div className="demand-feed">
          <span>INCOMING</span>
          <Reveal step={1}>
            <b>FEATURE / 021</b>
          </Reveal>
          <Reveal step={1}>
            <b>FEATURE / 022</b>
          </Reveal>
          <Reveal step={1}>
            <b>FEATURE / 023</b>
          </Reveal>
        </div>
        <div className="repo-stack">
          <div className="repo-layer repo-layer--core">
            CORE DOMAIN
          </div>
          <div className="repo-layer">APPLICATION</div>
          <div className="repo-layer">INTERFACE</div>
          <Reveal step={1} className="repo-layer repo-layer--new">
            NEW FEATURE LOGIC
          </Reveal>
          <Reveal step={2} className="repo-layer repo-layer--legacy">
            LEGACY LOGIC / STILL ACTIVE
          </Reveal>
          <Reveal step={3} className="repo-branches">
            <span>COMPATIBILITY</span>
            <span>DUPLICATED FLOW</span>
            <span>TEMPORARY FIX</span>
          </Reveal>
        </div>
        <Reveal step={4} className="trend-board">
          <div className="trend trend--up">
            <span>FEATURES</span>
            <i />
          </div>
          <div className="trend trend--down">
            <span>UNDERSTANDABILITY</span>
            <i />
          </div>
        </Reveal>
      </div>
    ),
  },
  {
    id: "runaway",
    section: "INCIDENT",
    title: "一次运行十几个小时的 Goal",
    conclusion: "功能完成和测试通过，可以与代码库失控同时发生。",
    frameCount: 6,
    notes: [
      "当时采用 explore、propose、goal 的完整流程。",
      "前期测试持续通过，表面上一切顺利。",
      "Goal 运行了十几个小时，修改规模持续增长。",
      "中间缺少范围确认、人工检查和清理节点。",
      "最终在没有充分审核的情况下完成合并。",
      "随后才逐渐看到旧逻辑、中间态、兼容层和重复流程。",
    ],
    visual: (
      <div className="incident-layout">
        <div className="command-chain">
          <code>/opsx:explore</code>
          <span>→</span>
          <code>/opsx:propose</code>
          <span>→</span>
          <code>/goal</code>
        </div>
        <div className="incident-timeline">
          <div className="timeline-axis">
            <span>00:00</span>
            <span>04:00</span>
            <span>08:00</span>
            <span>12:00+</span>
          </div>
          <Reveal
            step={1}
            className="timeline-progress timeline-progress--early"
            motion="grow-x"
          >
            <span>TESTS PASSING</span>
          </Reveal>
          <Reveal
            step={2}
            className="timeline-progress timeline-progress--late"
            motion="grow-x"
          >
            <span>GOAL STILL RUNNING</span>
          </Reveal>
          <Reveal step={3} className="missing-checkpoints">
            <span>?</span>
            <span>?</span>
            <span>?</span>
          </Reveal>
          <Reveal step={4} className="merge-event">
            MERGED / REVIEW INCOMPLETE
          </Reveal>
        </div>
        <Reveal step={2} className="incident-metrics">
          <Metric label="RUNTIME" value="10H+" />
          <Metric label="FILES" value="[DATA]" />
          <Metric label="LINES" value="[DATA]" />
          <Metric label="TESTS" value="PASS" tone="active" />
        </Reveal>
        <Reveal step={5} className="debt-ledger">
          {[
            "LEGACY LOGIC",
            "INTERMEDIATE STATE",
            "COMPATIBILITY PATCH",
            "DUPLICATED FLOW",
            "TEMPORARY FIX",
          ].map((item, index) => (
            <div key={item}>
              <span>0{index + 1}</span>
              <b>{item}</b>
              <em>REMAINS</em>
            </div>
          ))}
        </Reveal>
      </div>
    ),
  },
  {
    id: "gates",
    section: "ROOT CAUSE",
    title: "我交出了执行权，却没有建立新的控制机制",
    conclusion: "失控不只是模型问题，而是执行权扩大后缺少工程关卡。",
    frameCount: 5,
    notes: [
      "这件事不能简单归结为 Agent 不可靠。",
      "任务范围过大，也没有明确非目标。",
      "连续运行时间过长，缺少人工检查点。",
      "没有充分的 Diff Review，也没有要求旧逻辑退出。",
      "真正稀缺的是边界、判断和验证。",
    ],
    visual: (
      <div className="gates-layout">
        <div className="rail rail--actual">
          <span>ACTUAL</span>
          <i />
          <b>GOAL</b>
          <b>RUN</b>
          <b className="danger">MERGE</b>
        </div>
        <div className="rail rail--controlled">
          <span>CONTROLLED</span>
          <i />
          <Reveal step={1}>
            <b>SCOPE + NON-GOALS</b>
          </Reveal>
          <Reveal step={2}>
            <b>CHECKPOINT</b>
          </Reveal>
          <Reveal step={3}>
            <b>DIFF REVIEW</b>
            <b>CLEANUP</b>
          </Reveal>
          <Reveal step={4}>
            <b>HUMAN MERGE</b>
          </Reveal>
        </div>
        <Reveal step={4} className="scarcity-words">
          <strong>BOUNDARY</strong>
          <strong>JUDGEMENT</strong>
          <strong>VERIFICATION</strong>
        </Reveal>
      </div>
    ),
  },
  {
    id: "skills",
    section: "SKILLS",
    title: "给 Agent 增加流程，不等于问题自动解决",
    conclusion: "Skill 是可复用工作流，但流程重量必须与任务相称。",
    frameCount: 6,
    notes: [
      "我开始尝试多种 Skill 和代码理解工具。",
      "它们分别强化探索、Spec、测试和代码图谱。",
      "复杂任务确实获得了更清晰的约束。",
      "同样流程套在两行修改上时，成本开始失衡。",
      "文档数量和上下文占用快速上升。",
      "会随模型过时的是补偿性流程，长期有效的是领域、风险和验证。",
    ],
    visual: (
      <div className="skills-layout">
        <div className="skill-index">
          {[
            ["OpenSpec", "SPEC"],
            ["Superpowers", "TDD"],
            ["Matt Pocock Skills", "PRACTICE"],
            ["CodeGraph", "GRAPH"],
          ].map(([name, role]) => (
            <Reveal step={1} key={name} className="skill-row">
              <span>{name}</span>
              <b>{role}</b>
            </Reveal>
          ))}
        </div>
        <Reveal step={2} className="workflow-weight">
          <div className="task task--large">
            <span>COMPLEX TASK</span>
            <b>PROCESS FITS RISK</b>
          </div>
        </Reveal>
        <Reveal step={3} className="workflow-weight workflow-weight--small">
          <div className="task task--small">
            <span>2-LINE CHANGE</span>
            <b>PROCESS &gt; TASK</b>
          </div>
        </Reveal>
        <Reveal step={4} className="context-meter">
          <span>CONTEXT CONSUMPTION</span>
          <i />
          <b>HIGH</b>
        </Reveal>
        <Reveal step={5} className="durability-split">
          <div>
            <span>MODEL-COMPENSATING</span>
            <b>CAN EXPIRE</b>
          </div>
          <div>
            <span>DOMAIN / RISK / VERIFICATION</span>
            <b>STAYS VALUABLE</b>
          </div>
        </Reveal>
      </div>
    ),
  },
  {
    id: "context-stack",
    section: "CONTEXT",
    title: "不同的信息，应该放在不同的位置",
    conclusion: "上下文需要不同生命周期，而不是全部塞进 Prompt 或 Skill。",
    frameCount: 6,
    notes: [
      "先按稳定程度和任务相关度划分上下文。",
      "长期项目约束放在 AGENTS.md。",
      "模块职责、领域知识和 API 放在模块文档。",
      "重复出现的多步骤方法才适合做 Skill。",
      "确定性机械操作交给 Script 或 Tool。",
      "一次性目标、非目标和验收只属于当前任务。",
    ],
    visual: (
      <div className="stack-layout">
        <div className="stack-axis stack-axis--left">
          <span>EPHEMERAL</span>
          <i />
          <span>STABLE</span>
        </div>
        <div className="context-layers">
          <Reveal step={5} className="context-layer">
            <span>05</span>
            <b>CURRENT TASK</b>
            <em>GOAL / NON-GOAL / ACCEPTANCE</em>
          </Reveal>
          <Reveal step={4} className="context-layer">
            <span>04</span>
            <b>SCRIPT / TOOL</b>
            <em>DETERMINISTIC EXECUTION</em>
          </Reveal>
          <Reveal step={3} className="context-layer">
            <span>03</span>
            <b>SKILL</b>
            <em>REUSABLE WORKFLOW</em>
          </Reveal>
          <Reveal step={2} className="context-layer">
            <span>02</span>
            <b>MODULE DOCS</b>
            <em>DOMAIN / API / INVARIANTS</em>
          </Reveal>
          <Reveal step={1} className="context-layer context-layer--base">
            <span>01</span>
            <b>AGENTS.md</b>
            <em>PROJECT CONSTRAINTS</em>
          </Reveal>
        </div>
        <div className="stack-axis stack-axis--right">
          <span>TASK-SPECIFIC</span>
          <i />
          <span>PROJECT-SPECIFIC</span>
        </div>
      </div>
    ),
  },
  {
    id: "docs",
    section: "DOCUMENTS",
    title: "不是写得越长，而是让正确上下文更容易找到",
    conclusion: "好文档压缩模块职责、边界和不变量，而不是重复实现代码。",
    frameCount: 5,
    notes: [
      "让模型反复阅读几千行代码，会消耗上下文并放大局部细节。",
      "我开始在重要子模块维护简短 README。",
      "文件树被压缩成几个清晰的模块心智模型。",
      "文档只回答负责、非职责、入口、不变量和关系。",
      "文档过期比没有文档更危险；高风险任务仍然值得正式 Spec。",
    ],
    visual: (
      <div className="docs-layout">
        <div className="file-tree">
          <span>src/</span>
          {Array.from({ length: 14 }, (_, index) => (
            <i key={index} style={{ width: `${46 + ((index * 19) % 48)}%` }} />
          ))}
        </div>
        <Reveal step={1} className="readme-strip">
          <code>src/core/README.md</code>
          <code>src/agent/README.md</code>
          <code>src/presentation/README.md</code>
        </Reveal>
        <Reveal step={2} className="module-map">
          {["CORE", "AGENT", "PRESENTATION"].map((item, index) => (
            <Node
              key={item}
              index={`0${index + 1}`}
              title={item}
              detail="CLEAR BOUNDARY"
              tone={index === 1 ? "active" : "default"}
            />
          ))}
        </Reveal>
        <Reveal step={3} className="doc-questions">
          {["负责什么", "不负责什么", "核心入口", "关键不变量", "模块关系"].map(
            (item, index) => (
              <span key={item}>
                0{index + 1} / {item}
              </span>
            ),
          )}
        </Reveal>
        <Reveal step={4} className="doc-policy">
          <div>
            <span>DAILY TASK</span>
            <b>MODULE DOCS + SHORT BRIEF</b>
          </div>
          <div>
            <span>HIGH-RISK CHANGE</span>
            <b>FORMAL SPEC / ADR</b>
          </div>
        </Reveal>
      </div>
    ),
  },
  {
    id: "risk",
    section: "RISK",
    title: "流程强度应该和任务风险匹配",
    conclusion: "流程不是越完整越好，而是要与任务风险相称。",
    frameCount: 4,
    notes: [
      "我现在不会要求所有任务走完全相同的流程。",
      "低风险小改动可以直接定位、修改、验证。",
      "中等任务先探索、计划，再实现和验证。",
      "跨模块和高风险改动仍然需要设计、Spec 或 ADR。",
    ],
    visual: (
      <div className="risk-layout">
        <div className="risk-axis">
          <span>LOW RISK</span>
          <i />
          <span>HIGH RISK</span>
        </div>
        <div className="risk-zones">
          <Reveal step={1} className="risk-zone">
            <span>SMALL</span>
            <b>LOCATE → EDIT → VERIFY</b>
          </Reveal>
          <Reveal step={2} className="risk-zone">
            <span>MEDIUM</span>
            <b>EXPLORE → PLAN → IMPLEMENT → VERIFY</b>
          </Reveal>
          <Reveal step={3} className="risk-zone risk-zone--active">
            <span>HIGH</span>
            <b>DESIGN → SPEC / ADR → REVIEW → IMPLEMENT</b>
          </Reveal>
        </div>
      </div>
    ),
  },
  {
    id: "current-loop",
    section: "CURRENT LOOP",
    title: "我现在的工作流",
    conclusion: "把执行交给 Agent，在关键节点保留人工判断。",
    frameCount: 7,
    notes: [
      "这是我现在使用的完整流程轮廓。",
      "先定义结果和非目标。",
      "加载相关模块文档，让 Agent 说明假设和范围。",
      "选择最小可验证改动，并设置检查点。",
      "让 Agent 实现和运行检查。",
      "测试通过以后，人工阅读 Diff。",
      "删除旧逻辑和临时兼容层，人工确认后合并。",
    ],
    visual: (
      <div className="current-layout">
        <div className="ownership ownership--agent">
          AGENT EXECUTION
        </div>
        <div className="ownership ownership--human">
          HUMAN JUDGEMENT
        </div>
        <div className="current-flow">
          {[
            ["01", "OUTCOME + NON-GOALS"],
            ["02", "LOAD CONTEXT"],
            ["03", "ASSUMPTIONS + SCOPE"],
            ["04", "MINIMUM CHANGE"],
            ["05", "VERIFY"],
            ["06", "REVIEW + CLEANUP + MERGE"],
          ].map(([index, title], step) => (
            <Reveal step={step + 1} key={title} className="current-step">
              <Node
                index={index}
                title={title}
                tone={step === 5 ? "active" : "default"}
              />
            </Reveal>
          ))}
        </div>
        <Reveal step={6} className="merge-lock">
          <span>HUMAN GATE</span>
          <strong>MERGE UNLOCKED</strong>
        </Reveal>
      </div>
    ),
  },
  {
    id: "tests",
    section: "DEFINITION OF DONE",
    title: "测试通过以后，还需要判断",
    conclusion: "TESTS PASSED 是证据，而不是需求正确的最终结论。",
    frameCount: 5,
    notes: [
      "自动测试通过是非常重要的一份证据。",
      "但它只回答了被测试覆盖的问题。",
      "还要检查修改范围、重复实现和旧逻辑退出。",
      "也要检查兼容层、错误可见性和文档同步。",
      "最终仍然需要人的工程判断。",
    ],
    visual: (
      <div className="tests-layout">
        <div className="passed-block">
          <span className="status-dot" />
          <strong>TESTS PASSED</strong>
          <small>AUTOMATED EVIDENCE</small>
        </div>
        <Reveal step={1} className="evidence-tag">
          EVIDENCE 01 / 07
        </Reveal>
        <div className="review-questions">
          <Reveal step={2}>
            <span>01</span>
            <b>是否修改了不必要的文件？</b>
          </Reveal>
          <Reveal step={2}>
            <span>02</span>
            <b>是否增加了重复实现？</b>
          </Reveal>
          <Reveal step={2}>
            <span>03</span>
            <b>旧逻辑是否应该退出？</b>
          </Reveal>
          <Reveal step={3}>
            <span>04</span>
            <b>是否用兼容代码掩盖了根因？</b>
          </Reveal>
          <Reveal step={3}>
            <span>05</span>
            <b>错误是否仍然清楚可见？</b>
          </Reveal>
          <Reveal step={3}>
            <span>06</span>
            <b>文档是否仍然准确？</b>
          </Reveal>
        </div>
        <Reveal step={4} className="human-decision">
          HUMAN DECISION / REQUIRED
        </Reveal>
      </div>
    ),
  },
  {
    id: "work-shift",
    section: "ROLE SHIFT",
    title: "人的工作没有消失，只是发生了转移",
    conclusion: "输入代码的时间减少，定义、审查、验证和清理的时间增加。",
    frameCount: 4,
    notes: [
      "过去，我把大量时间用在亲手输入代码上。",
      "现在，输入代码所占的时间明显缩小。",
      "更多时间转移到定义、审查、验证和清理。",
      "真正增长的是工程判断的责任。",
    ],
    visual: (
      <div className="shift-layout">
        <div className="allocation">
          <span>BEFORE</span>
          <div>
            <i className="allocation__typing" />
            <i className="allocation__other" />
          </div>
          <b>TYPING / EXECUTION</b>
        </div>
        <Reveal step={1} className="allocation allocation--now">
          <span>NOW</span>
          <div>
            <i className="allocation__typing" />
            <i className="allocation__judgement" />
          </div>
          <b>JUDGEMENT / VERIFICATION</b>
        </Reveal>
        <Reveal step={2} className="shift-labels">
          <span>DEFINE</span>
          <span>REVIEW</span>
          <span>VERIFY</span>
          <span>CLEAN UP</span>
        </Reveal>
        <Reveal step={3} className="shift-conclusion">
          <strong>TYPING ↓</strong>
          <strong>JUDGEMENT ↑</strong>
        </Reveal>
      </div>
    ),
  },
  {
    id: "taste",
    section: "TASTE",
    title: "知道应该拒绝什么、删除什么",
    conclusion: "Taste 不是打字速度，而是对范围、复杂度和整体一致性的判断。",
    frameCount: 6,
    notes: [
      "两套实现都可能运行，也都可能测试通过。",
      "功能正确不意味着方案适合当前系统。",
      "第一版可能增加了不必要的抽象。",
      "也可能保留兼容层和重复入口。",
      "真正的判断，是拒绝和删除这些结构。",
      "Taste 是知道应该生成什么，也知道什么不应该存在。",
    ],
    visual: (
      <div className="taste-layout">
        <div className="implementation implementation--works">
          <span>WORKS</span>
          <b>TESTS PASSED</b>
          <div className="code-tree">
            <i>Feature</i>
            <Reveal step={2}>
              <i className="danger">AbstractFactory</i>
            </Reveal>
            <Reveal step={3}>
              <i className="danger">CompatibilityLayer</i>
              <i className="danger">LegacyEntry</i>
            </Reveal>
          </div>
        </div>
        <div className="implementation implementation--fits">
          <span>FITS THE SYSTEM</span>
          <b>TESTS PASSED</b>
          <div className="code-tree">
            <i>Feature</i>
            <Reveal step={4}>
              <i className="active">ExistingDomainService</i>
              <i className="active">SingleEntry</i>
            </Reveal>
          </div>
        </div>
        <Reveal step={1} className="same-output">
          SAME OUTPUT / DIFFERENT COST
        </Reveal>
        <Reveal step={5} className="taste-quote" motion="fade">
          <strong>
            TASTE IS WHAT YOU
            <br />
            REFUSE AND REMOVE.
          </strong>
          <span>Taste 是知道什么不应该存在。</span>
        </Reveal>
      </div>
    ),
  },
  {
    id: "demo",
    section: "LIVE DEMO",
    title: "Talk is cheap. Show me the code.",
    conclusion: "用真实项目展示目标、上下文、Diff、验证和拒绝过程。",
    frameCount: 6,
    notes: [
      "从理论切入自己的实际项目。",
      "用一分钟说明项目和核心模块。",
      "展示模块 README 如何提供正确上下文。",
      "展示目标、非目标、修改范围和验收方式。",
      "展示计划、Diff、测试与人工 Review。",
      "展示第一版能用但不应合并，最终版本为什么更合适。",
    ],
    visual: (
      <div className="demo-layout">
        <div className="demo-index">
          {[
            "PROJECT",
            "CONTEXT",
            "TASK CONTRACT",
            "DIFF + VERIFY",
            "TASTE",
          ].map((item, index) => (
            <Reveal step={index + 1} key={item}>
              <span>0{index + 1}</span>
              <b>{item}</b>
            </Reveal>
          ))}
        </div>
        <div className="demo-window">
          <div className="demo-window__bar">
            <span className="status-dot" />
            <b>DEMO ASSET / PLACEHOLDER</b>
            <em>FALLBACK READY</em>
          </div>
          <div className="demo-window__body">
            <Reveal step={1} className="demo-placeholder">
              <span>PROJECT</span>
              <strong>项目名称 / 核心问题 / 模块地图</strong>
            </Reveal>
            <Reveal step={2} className="demo-placeholder">
              <span>CONTEXT</span>
              <strong>真实 README / 领域文档</strong>
            </Reveal>
            <Reveal step={3} className="demo-contract">
              {["目标", "非目标", "允许修改范围", "验收方式"].map(
                (item, index) => (
                  <div key={item}>
                    <span>0{index + 1}</span>
                    <b>{item}</b>
                    <em>[等待真实内容]</em>
                  </div>
                ),
              )}
            </Reveal>
            <Reveal step={4} className="demo-placeholder">
              <span>DIFF + VERIFY</span>
              <strong>真实计划 / Diff / 测试 / Review</strong>
            </Reveal>
            <Reveal step={5} className="demo-placeholder">
              <span>TASTE</span>
              <strong>第一版被拒绝 → 最终版本</strong>
            </Reveal>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "generations",
    section: "RECAP",
    title: "四代工作流",
    conclusion: "这不是从不会用到会用，而是速度与控制之间的重新平衡。",
    frameCount: 5,
    notes: [
      "回头看，我的工作流经历了四个阶段。",
      "复制粘贴：慢，但可控。",
      "Agent 直接执行：快，但开始失控。",
      "Skill 与重流程：重新增加约束，但成本提高。",
      "当前方式：按风险选择流程，用上下文和验证维持控制。",
    ],
    visual: (
      <div className="generations-layout">
        {[
          ["01", "COPY / PASTE", "SLOW", "CONTROLLED"],
          ["02", "DIRECT AGENT", "FAST", "UNCONTROLLED"],
          ["03", "SKILL + PROCESS", "GUIDED", "HEAVY"],
          ["04", "RISK-AWARE", "FAST", "CONTROLLED"],
        ].map(([index, title, speed, control], step) => (
          <Reveal
            step={step + 1}
            key={title}
            className={`generation generation--${step + 1}`}
          >
            <span>{index}</span>
            <strong>{title}</strong>
            <div>
              <b>SPEED</b>
              <em>{speed}</em>
            </div>
            <div>
              <b>CONTROL</b>
              <em>{control}</em>
            </div>
          </Reveal>
        ))}
      </div>
    ),
  },
  {
    id: "lessons",
    section: "TAKEAWAYS",
    title: "五条我会继续保留的经验",
    conclusion: "可以带走、可以执行，也可以随着实践继续修正。",
    frameCount: 6,
    notes: [
      "最后总结五条目前最重要的经验。",
      "瓶颈从写代码转向定义目标和验证结果。",
      "小而准确的模块文档，是人和 Agent 的共同资产。",
      "自主程度必须匹配风险、可观察性和验证能力。",
      "Skill 可以替换；领域知识和质量标准长期存在。",
      "模型负责实现能力，人负责范围、取舍、质量和 Taste。",
    ],
    visual: (
      <div className="lessons-layout">
        {[
          "瓶颈从写代码，转向定义目标和验证结果。",
          "小而准确的模块文档，是人和 Agent 的共同资产。",
          "自主程度必须匹配风险、可观察性和验证能力。",
          "Skill 可以替换；领域知识和质量标准长期存在。",
          "模型负责实现能力，人负责范围、取舍、质量和 Taste。",
        ].map((item, index) => (
          <Reveal step={index + 1} key={item} className="lesson-row">
            <span>0{index + 1}</span>
            <b>{item}</b>
          </Reveal>
        ))}
      </div>
    ),
  },
  {
    id: "closing",
    section: "CLOSING",
    title: "把执行交给 AI，把工程判断留在人手里",
    conclusion: "我们不需要在打字速度上赢过 AI。",
    frameCount: 4,
    notes: [
      "最后回到完整闭环。",
      "AI 擅长搜索、修改、运行和持续执行。",
      "人仍然负责目标、边界、验证和判断。",
      "Vibe Coding 不是交出责任，而是更认真地承担工程判断。",
    ],
    visual: (
      <div className="closing-layout">
        <div className="closing-loop">
          {["目标", "上下文", "执行", "验证", "判断"].map((item, index) => (
            <div key={item} className={index === 2 ? "agent-owned" : ""}>
              <span>0{index + 1}</span>
              <b>{item}</b>
            </div>
          ))}
        </div>
        <Reveal step={1} className="ownership-label ownership-label--ai">
          AI / EXECUTION
        </Reveal>
        <Reveal step={2} className="ownership-label ownership-label--human">
          HUMAN / GOAL · BOUNDARY · VERIFY · JUDGEMENT
        </Reveal>
        <Reveal step={3} className="final-statement" motion="fade">
          <strong>
            HAND OFF EXECUTION.
            <br />
            KEEP ENGINEERING JUDGEMENT.
          </strong>
          <span>把执行交给 AI，把工程判断留在人手里。</span>
          <em>THANK YOU</em>
        </Reveal>
      </div>
    ),
  },
];

function Slide({
  definition,
  active,
  frame,
}: {
  definition: SlideDefinition;
  active: boolean;
  frame: number;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const playheadTweenRef = useRef<gsap.core.Tween | null>(null);
  const reduceMotionRef = useRef(false);

  useGSAP(
    () => {
      if (!rootRef.current) return;

      reduceMotionRef.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const selector = gsap.utils.selector(rootRef);
      const revealItems = selector<HTMLElement>("[data-step]");
      const riseItems = selector<HTMLElement>('[data-motion="rise"]');
      const growXItems = selector<HTMLElement>('[data-motion="grow-x"]');
      const growYItems = selector<HTMLElement>('[data-motion="grow-y"]');
      const wipeItems = selector<HTMLElement>('[data-motion="wipe"]');

      gsap.set(revealItems, { autoAlpha: 0 });
      gsap.set(riseItems, { y: 14, scale: 0.98 });
      gsap.set(growXItems, {
        scaleX: 0,
        transformOrigin: "left center",
      });
      gsap.set(growYItems, {
        scaleY: 0,
        transformOrigin: "center bottom",
      });
      gsap.set(wipeItems, {
        clipPath: (_, element: HTMLElement) => {
          const start = Number(element.dataset.wipeFrom ?? 0);
          return `inset(0 ${100 - start}% 0 ${start}%)`;
        },
      });

      const timeline = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out" },
      });

      timeline.addLabel("frame-0", 0);

      for (let step = 1; step < definition.frameCount; step += 1) {
        const stepItems = revealItems.filter(
          (element) => Number(element.dataset.step) === step,
        );
        const stepRise = stepItems.filter(
          (element) => element.dataset.motion === "rise",
        );
        const stepGrowX = stepItems.filter(
          (element) => element.dataset.motion === "grow-x",
        );
        const stepGrowY = stepItems.filter(
          (element) => element.dataset.motion === "grow-y",
        );
        const stepFade = stepItems.filter(
          (element) => element.dataset.motion === "fade",
        );
        const stepWipe = stepItems.filter(
          (element) => element.dataset.motion === "wipe",
        );
        const position = timeline.duration();

        if (stepItems.length > 0) {
          timeline.to(
            stepItems,
            {
              autoAlpha: 1,
              duration: 0.28,
              stagger: 0.05,
            },
            position,
          );
        }
        if (stepRise.length > 0) {
          timeline.to(
            stepRise,
            {
              y: 0,
              scale: 1,
              duration: 0.38,
              stagger: 0.05,
            },
            position,
          );
        }
        if (stepGrowX.length > 0) {
          timeline.to(
            stepGrowX,
            {
              scaleX: 1,
              duration: 0.56,
            },
            position,
          );
        }
        if (stepGrowY.length > 0) {
          timeline.to(
            stepGrowY,
            {
              scaleY: 1,
              duration: 0.56,
            },
            position,
          );
        }
        if (stepFade.length > 0) {
          timeline.to(
            stepFade,
            {
              autoAlpha: 1,
              duration: 0.28,
            },
            position,
          );
        }
        if (stepWipe.length > 0) {
          timeline.to(
            stepWipe,
            {
              clipPath: (_, element: HTMLElement) => {
                const start = Number(element.dataset.wipeFrom ?? 0);
                return `inset(0 0% 0 ${start}%)`;
              },
              duration: 0.64,
            },
            position,
          );
        }

        timeline.addLabel(`frame-${step}`);
      }

      timelineRef.current = timeline;
      timeline.seek(`frame-${frame}`, false);

      return () => {
        playheadTweenRef.current?.kill();
        timeline.kill();
        timelineRef.current = null;
      };
    },
    { scope: rootRef },
  );

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    const label = `frame-${frame}`;
    playheadTweenRef.current?.kill();

    if (reduceMotionRef.current) {
      timeline.seek(label, false);
      return;
    }

    playheadTweenRef.current = timeline.tweenTo(label, {
      ease: "none",
      overwrite: true,
    });
  }, [frame]);

  return (
    <section
      ref={rootRef}
      className="presentation-slide"
      data-active={active}
      aria-hidden={!active}
    >
      <div className="slide-heading">
        <span>{definition.section}</span>
        <h2>{definition.title}</h2>
      </div>
      <div className="slide-visual">{definition.visual}</div>
    </section>
  );
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function parseHash() {
  const match = window.location.hash.match(/page\/(\d+)\/frame\/(\d+)/);
  if (!match) return null;

  return {
    page: clamp(Number(match[1]), 0, slides.length - 1),
    frame: Number(match[2]),
  };
}

export function Presentation({ mode }: { mode: PresentationMode }) {
  const [pageIndex, setPageIndex] = useState(0);
  const [frames, setFrames] = useState(() => slides.map(() => 0));
  const [elapsed, setElapsed] = useState(0);
  const [openingVisible, setOpeningVisible] = useState(
    () => mode === "audience" && !audienceOpeningHasCompleted,
  );
  const channelRef = useRef<BroadcastChannel | null>(null);
  const sourceIdRef = useRef("");

  const currentSlide = slides[pageIndex];
  const currentFrame = frames[pageIndex];

  const broadcastState = (
    nextPage: number,
    nextFrames: number[],
  ) => {
    channelRef.current?.postMessage({
      source: sourceIdRef.current,
      pageIndex: nextPage,
      frames: nextFrames,
      timestamp: Date.now(),
    });
  };

  useEffect(() => {
    const restoreFrame = window.requestAnimationFrame(() => {
      const saved = sessionStorage.getItem("vibe-presentation-state");
      const hashState = parseHash();

      if (saved) {
        try {
          const state = JSON.parse(saved) as {
            pageIndex: number;
            frames: number[];
          };
          if (Array.isArray(state.frames)) {
            setFrames(
              slides.map((slide, index) =>
                clamp(state.frames[index] ?? 0, 0, slide.frameCount - 1),
              ),
            );
            setPageIndex(clamp(state.pageIndex, 0, slides.length - 1));
          }
        } catch {
          sessionStorage.removeItem("vibe-presentation-state");
        }
      }

      if (hashState) {
        setPageIndex(hashState.page);
        setFrames((previous) => {
          const next = [...previous];
          next[hashState.page] = clamp(
            hashState.frame,
            0,
            slides[hashState.page].frameCount - 1,
          );
          return next;
        });
      }
    });

    return () => window.cancelAnimationFrame(restoreFrame);
  }, []);

  useEffect(() => {
    sourceIdRef.current =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `deck-${Math.random().toString(36).slice(2)}`;

    const channel = new BroadcastChannel("vibe-presentation");
    channelRef.current = channel;

    channel.onmessage = (
      event: MessageEvent<{
        source: string;
        pageIndex: number;
        frames: number[];
      }>,
    ) => {
      if (event.data.source === sourceIdRef.current) return;
      const nextPage = clamp(event.data.pageIndex, 0, slides.length - 1);
      const nextFrames = slides.map((slide, index) =>
        clamp(event.data.frames[index] ?? 0, 0, slide.frameCount - 1),
      );

      setPageIndex((current) => (current === nextPage ? current : nextPage));
      setFrames((current) =>
        current.every((value, index) => value === nextFrames[index])
          ? current
          : nextFrames,
      );
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsed((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    syncPresentationHash(window, pageIndex, currentFrame);
    sessionStorage.setItem(
      "vibe-presentation-state",
      JSON.stringify({ pageIndex, frames }),
    );
    broadcastState(pageIndex, frames);
  }, [pageIndex, currentFrame, frames]);

  const movePage = useCallback((delta: number) => {
    setPageIndex((current) =>
      clamp(current + delta, 0, slides.length - 1),
    );
  }, []);

  const moveFrame = useCallback((delta: number) => {
    setFrames((current) => {
      const next = [...current];
      next[pageIndex] = clamp(
        next[pageIndex] + delta,
        0,
        slides[pageIndex].frameCount - 1,
      );
      return next;
    });
  }, [pageIndex]);

  const prepareOpeningExit = useCallback(() => {
    setPageIndex(0);
    setFrames(slides.map(() => 0));
  }, []);

  const completeOpening = useCallback(() => {
    audienceOpeningHasCompleted = true;
    setOpeningVisible(false);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (mode === "audience" && openingVisible) return;
      if (event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (
        target?.matches(
          "input, textarea, select, [contenteditable='true'], [data-demo-control='true']",
        )
      ) {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        movePage(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        movePage(-1);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        moveFrame(1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        moveFrame(-1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, moveFrame, movePage, openingVisible]);

  const frameDots = useMemo(
    () =>
      Array.from({ length: currentSlide.frameCount }, (_, index) => (
        <span
          key={index}
          data-current={index === currentFrame}
          data-reached={index <= currentFrame}
        />
      )),
    [currentFrame, currentSlide.frameCount],
  );

  const deck = (
    <div
      className="deck-canvas"
      data-slide-id={currentSlide.id}
      aria-hidden={mode === "audience" && openingVisible ? true : undefined}
      inert={mode === "audience" && openingVisible}
    >
      <header className="deck-header">
        <span>VIBE CODING / FIELD NOTES</span>
        <div>
          <b>
            {pageIndex.toString().padStart(2, "0")} /{" "}
            {(slides.length - 1).toString().padStart(2, "0")}
          </b>
          <span>{currentSlide.section}</span>
        </div>
      </header>

      <main className="slide-host">
        {slides.map((slide, index) => (
          <Slide
            key={slide.id}
            definition={slide}
            active={index === pageIndex}
            frame={frames[index]}
          />
        ))}
      </main>

      <aside className="frame-rail" aria-label="当前页面帧进度">
        {frameDots}
      </aside>

      <footer className="deck-footer">
        <p>{currentSlide.conclusion}</p>
        <div className="page-progress" aria-hidden="true">
          {slides.map((slide, index) => (
            <span
              key={slide.id}
              data-current={index === pageIndex}
              data-reached={index <= pageIndex}
            />
          ))}
        </div>
        <div className="footer-controls">
          <button
            type="button"
            onClick={() => movePage(-1)}
            aria-label="上一页"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => movePage(1)}
            aria-label="下一页"
          >
            →
          </button>
          <span>
            FRAME {String(currentFrame + 1).padStart(2, "0")} /{" "}
            {String(currentSlide.frameCount).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={() => moveFrame(-1)}
            aria-label="上一帧"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => moveFrame(1)}
            aria-label="下一帧"
          >
            ↓
          </button>
        </div>
      </footer>
    </div>
  );

  if (mode === "presenter") {
    const note =
      currentSlide.notes[currentFrame] ??
      currentSlide.notes.at(-1) ??
      currentSlide.conclusion;
    const nextFrame =
      currentSlide.notes[currentFrame + 1] ??
      slides[pageIndex + 1]?.notes[0] ??
      "演示结束";

    return (
      <div className="presenter-shell">
        <div className="presenter-preview">{deck}</div>
        <aside className="presenter-notes">
          <div className="presenter-time">
            <span>ELAPSED</span>
            <strong>{formatTime(elapsed)}</strong>
          </div>
          <div className="presenter-position">
            <span>
              PAGE {pageIndex + 1} / {slides.length}
            </span>
            <span>
              FRAME {currentFrame + 1} / {currentSlide.frameCount}
            </span>
          </div>
          <section>
            <span>TRIGGER / CURRENT</span>
            <h1>{currentSlide.title}</h1>
            <p>{note}</p>
          </section>
          <section className="presenter-next">
            <span>NEXT</span>
            <p>{nextFrame}</p>
          </section>
          <div className="presenter-keyboard">
            <button type="button" onClick={() => movePage(-1)}>
              ← PAGE
            </button>
            <button type="button" onClick={() => movePage(1)}>
              PAGE →
            </button>
            <button type="button" onClick={() => moveFrame(-1)}>
              ↑ FRAME
            </button>
            <button type="button" onClick={() => moveFrame(1)}>
              FRAME ↓
            </button>
          </div>
          <a
            href={`/#/page/${pageIndex}/frame/${currentFrame}`}
            target="_blank"
            rel="noreferrer"
          >
            OPEN AUDIENCE VIEW ↗
          </a>
        </aside>
      </div>
    );
  }

  return (
    <div className="presentation-root">
      {deck}
      {openingVisible ? (
        <OpeningSequence
          onComplete={completeOpening}
          onExitStart={prepareOpeningExit}
        />
      ) : null}
    </div>
  );
}
