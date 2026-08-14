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
const OPENING_DEMO_SLIDE_ID = "opening-demo";

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
    id: "graph-cover",
    section: "第一部分 / 趋势",
    title: "从 Loop 到 Graph",
    conclusion: "Agent 工程的重心，正在从单个执行循环迁移到多执行单元协作。",
    frameCount: 4,
    notes: [
      "第一部分先看当前 Agent 工程正在发生什么变化：一个 Loop 已经不再是全部。",
      "Graph 把规划后的任务分给多个执行单元，并明确它们的并行与依赖关系。",
      "结果在验证节点汇合，通过才完成；验证不只是流程的最后一步，而是系统的门。",
      "失败只重试相关节点，高风险则把控制权交给人；Graph Engineering 设计的正是这些关系。",
    ],
    visual: (
      <div className="graph-cover-layout">
        <div className="graph-cover-copy">
          <span>第一部分 / 当前 Agent 趋势</span>
          <h1>
            从 <b>Loop</b>
            <br />
            到 <b>Graph</b>
          </h1>
          <p>Agent 工程的重心，正在从单个执行循环迁移到多执行单元协作。</p>
        </div>
        <div className="graph-cover-network" aria-hidden="true">
          <div className="graph-cover-network__header">
            <span>EXECUTION GRAPH</span>
            <b>依赖 / 并行 / 验证 / 交接</b>
          </div>
          <svg className="graph-cover-edges" viewBox="0 0 790 730">
            <defs>
              <marker id="graph-cover-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" />
              </marker>
              <marker id="graph-cover-arrow-accent" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" />
              </marker>
              <marker id="graph-cover-arrow-danger" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" />
              </marker>
            </defs>
            <path className="graph-cover-edge" d="M119 360 H145" />
            <g data-step="1" data-motion="fade">
              <path className="graph-cover-edge" d="M270 360 C294 360 294 228 320 228" />
              <path className="graph-cover-edge" d="M270 360 C294 360 294 498 320 498" />
              <text className="graph-cover-edge-label" x="274" y="345">并行</text>
            </g>
            <g data-step="2" data-motion="fade">
              <path className="graph-cover-edge" d="M465 228 C490 228 490 360 510 360" />
              <path className="graph-cover-edge" d="M465 498 C490 498 490 360 510 360" />
              <path className="graph-cover-edge graph-cover-edge--accent" d="M640 350 C657 328 659 243 670 216" />
              <text className="graph-cover-edge-label" x="468" y="345">汇合</text>
              <text className="graph-cover-edge-label graph-cover-edge-label--accent" x="646" y="287">通过</text>
            </g>
            <g data-step="3" data-motion="fade">
              <path className="graph-cover-edge graph-cover-edge--danger" d="M640 372 C656 394 648 454 655 484" />
              <path className="graph-cover-edge graph-cover-edge--retry" d="M575 414 C575 604 392 604 392 546" />
              <text className="graph-cover-edge-label graph-cover-edge-label--danger" x="644" y="429">高风险</text>
              <text className="graph-cover-edge-label" x="451" y="628">失败 / 局部重试</text>
            </g>
          </svg>
          <div className="graph-cover-node graph-cover-node--goal">
            <span>GOAL</span>
            <b>目标</b>
          </div>
          <div className="graph-cover-node graph-cover-node--plan">
            <span>PLAN</span>
            <b>规划</b>
          </div>
          <Reveal step={1} className="graph-cover-node graph-cover-node--worker-a">
            <span>WORKER</span>
            <b>执行 A</b>
          </Reveal>
          <Reveal step={1} className="graph-cover-node graph-cover-node--worker-b">
            <span>WORKER</span>
            <b>执行 B</b>
          </Reveal>
          <Reveal step={2} className="graph-cover-node graph-cover-node--verify">
            <span>VERIFIER</span>
            <b>验证</b>
          </Reveal>
          <Reveal step={2} className="graph-cover-node graph-cover-node--done">
            <span>PASS</span>
            <b>完成</b>
          </Reveal>
          <Reveal step={3} className="graph-cover-node graph-cover-node--human">
            <span>HANDOFF</span>
            <b>人工决策</b>
          </Reveal>
        </div>
        <Reveal step={3} className="graph-cover-thesis" motion="fade">
          <span>不是更多 Agent</span>
          <strong>而是更清楚的控制关系</strong>
        </Reveal>
      </div>
    ),
  },
  {
    id: "engineering-layers",
    section: "趋势 / 工程尺度",
    title: "工程对象正在不断向外扩展",
    conclusion: "Graph 没有替代前面的能力，而是在更大的尺度上组织它们。",
    frameCount: 4,
    notes: [
      "Prompt 关注一次调用中的表达，Context 关注模型此刻应该知道什么。",
      "Harness 为 Agent 提供工具、权限、沙箱和日志环境。",
      "Loop 设计验证、反馈、重试和停止，让一个执行单元持续收敛。",
      "Graph 再向外一层，协调多个执行单元之间的关系。",
    ],
    visual: (
      <div className="engineering-layers-layout">
        <div className="engineering-layer engineering-layer--prompt">
          <span>01</span>
          <strong>Prompt</strong>
          <p>一次调用怎样表达</p>
        </div>
        <Reveal step={1} className="engineering-layer engineering-layer--context">
          <span>02</span>
          <strong>Context</strong>
          <p>模型现在应该知道什么</p>
        </Reveal>
        <Reveal step={1} className="engineering-layer engineering-layer--harness">
          <span>03</span>
          <strong>Harness</strong>
          <p>工具、权限、沙箱和日志</p>
        </Reveal>
        <Reveal step={2} className="engineering-layer engineering-layer--loop">
          <span>04</span>
          <strong>Loop</strong>
          <p>验证、反馈、重试和停止</p>
        </Reveal>
        <Reveal step={3} className="engineering-layer engineering-layer--graph">
          <span>05</span>
          <strong>Graph</strong>
          <p>依赖、并行、汇合和恢复</p>
        </Reveal>
        <Reveal step={3} className="engineering-scale" motion="grow-x">
          <span>单次模型调用</span>
          <i />
          <b>多执行单元协作</b>
        </Reveal>
      </div>
    ),
  },
  {
    id: "loop-to-graph",
    section: "趋势 / 协作",
    title: "Loop 负责收敛，Graph 负责协作",
    conclusion: "Graph 不替代 Loop：Graph 组织协作，Loop 负责收敛。",
    frameCount: 4,
    notes: [
      "一个 Loop 围绕一个目标计划、执行、观察和验证，根据反馈持续收敛。",
      "当尺度扩大，一个目标变成多个角色，整体重跑变成局部恢复，继续执行也可能变成人工交接。",
      "Graph 负责组织这些执行单元之间的依赖和汇合，而其中的 Worker 仍然运行自己的 Loop。",
      "所以两者不是替代关系：Graph 组织协作，Loop 负责收敛。",
    ],
    visual: (
      <div className="loop-graph-layout">
        <div className="loop-panel">
          <span className="loop-graph-kicker">一个执行单元 / 一个目标</span>
          <strong className="loop-panel__title">LOOP</strong>
          <div className="loop-cycle">
            <svg viewBox="0 0 420 250" aria-hidden="true">
              <defs>
                <marker id="loop-cycle-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" />
                </marker>
              </defs>
              <path d="M166 55 H250" />
              <path d="M312 91 V155" />
              <path d="M250 195 H166" />
              <path d="M104 155 V91" />
            </svg>
            <b className="loop-cycle__plan">计划</b>
            <b className="loop-cycle__execute">执行</b>
            <b className="loop-cycle__observe">观察</b>
            <b className="loop-cycle__verify">验证</b>
          </div>
          <p>根据真实反馈，调整下一步行动</p>
        </div>
        <Reveal step={1} className="coordination-shift">
          <span>当尺度扩大</span>
          <div><b>一个目标</b><i>→</i><strong>多个角色</strong></div>
          <div><b>整体重跑</b><i>→</i><strong>局部恢复</strong></div>
          <div><b>自己判断</b><i>→</i><strong>显式交接</strong></div>
        </Reveal>
        <Reveal step={2} className="graph-panel">
          <span className="loop-graph-kicker">系统级 / 多个执行单元</span>
          <strong className="graph-panel__title">GRAPH OF LOOPS</strong>
          <div className="graph-loops-map">
            <svg viewBox="0 0 560 340" aria-hidden="true">
              <defs>
                <marker id="graph-loop-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" />
                </marker>
                <marker id="graph-loop-arrow-danger" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" />
                </marker>
              </defs>
              <path d="M280 64 C280 90 142 78 142 116" />
              <path d="M280 64 C280 90 418 78 418 116" />
              <path d="M142 226 C142 262 235 248 244 278" />
              <path d="M418 226 C418 262 325 248 316 278" />
              <path className="graph-loops-map__edge--danger" d="M350 300 H448" />
            </svg>
            <div className="graph-loops-map__plan">规划</div>
            <div className="worker-loop worker-loop--a">
              <span>WORKER A</span>
              <b>↻ LOOP</b>
              <small>计划 · 执行 · 观察 · 验证</small>
            </div>
            <div className="worker-loop worker-loop--b">
              <span>WORKER B</span>
              <b>↻ LOOP</b>
              <small>计划 · 执行 · 观察 · 验证</small>
            </div>
            <div className="graph-loops-map__verify">汇合 / 验证</div>
            <div className="graph-loops-map__human">人工交接</div>
          </div>
        </Reveal>
        <Reveal step={3} className="loop-graph-thesis" motion="fade">
          <span>不是替代关系</span>
          <strong>Graph 组织协作，Loop 负责收敛</strong>
        </Reveal>
      </div>
    ),
  },
  {
    id: "graph-anatomy",
    section: "趋势 / 执行图",
    title: "一张执行图，要让四件事显式",
    conclusion: "重点不是画出节点和边，而是让控制关系显式、可检查。",
    frameCount: 5,
    notes: [
      "第一个问题是 Node：到底由谁执行，可以是代码、模型、Agent、工具或人。",
      "第二个问题是 Edge：谁依赖谁，哪里顺序、分支、并行、循环或者等待。",
      "第三个问题是 State：跨节点传递哪些事实，而不是继续依赖一长串对话。",
      "第四个问题是 Controller：下一步继续、重规划、转人工还是安全终止。",
      "Graph Engineering 让这些原本藏在上下文和 if/else 里的关系成为一等对象。",
    ],
    visual: (
      <div className="graph-anatomy-layout">
        <div className="graph-anatomy-map">
          <div className="anatomy-map__header">
            <span>SYSTEM BLUEPRINT</span>
            <b>显式 · 可检查 · 可恢复</b>
          </div>
          <svg className="anatomy-edges" viewBox="0 0 780 604" aria-hidden="true">
            <defs>
              <marker id="anatomy-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" />
              </marker>
              <marker id="anatomy-arrow-accent" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" />
              </marker>
              <marker id="anatomy-arrow-danger" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" />
              </marker>
            </defs>
            <g data-step="1" data-motion="fade">
              <path className="anatomy-edge" d="M157 314 C180 314 180 234 207 234" />
              <path className="anatomy-edge" d="M157 314 C180 314 180 404 207 404" />
              <path className="anatomy-edge" d="M357 234 C382 234 382 314 410 314" />
              <path className="anatomy-edge" d="M357 404 C382 404 382 314 410 314" />
              <path className="anatomy-edge anatomy-edge--accent" d="M550 302 C570 280 578 234 598 234" />
              <path className="anatomy-edge anatomy-edge--danger" d="M550 326 C572 348 578 404 598 404" />
              <text className="anatomy-edge-label" x="166" y="294">并行</text>
              <text className="anatomy-edge-label" x="365" y="294">汇合</text>
              <text className="anatomy-edge-label anatomy-edge-label--accent" x="565" y="269">通过</text>
              <text className="anatomy-edge-label anatomy-edge-label--danger" x="564" y="368">高风险</text>
            </g>
            <g data-step="2" data-motion="fade">
              <path className="anatomy-state-link" d="M282 452 V510" />
              <path className="anatomy-state-link" d="M480 362 V510" />
              <path className="anatomy-state-link" d="M668 452 V510" />
            </g>
            <g data-step="3" data-motion="fade">
              <path className="anatomy-controller-link" d="M390 166 V184 C390 194 374 194 357 206" />
              <path className="anatomy-controller-link" d="M390 166 V184 C390 194 434 194 458 266" />
              <text className="anatomy-controller-label" x="406" y="190">选择下一条边</text>
            </g>
          </svg>
          <Reveal step={3} className="anatomy-controller">
            <span>04 / CONTROLLER</span>
            <strong>继续 · 重规划 · 转人工 · 安全终止</strong>
          </Reveal>
          <div className="anatomy-node anatomy-node--source">
            <span>01 / NODE</span><b>规划</b>
          </div>
          <div className="anatomy-node anatomy-node--worker-a">
            <span>01 / NODE</span><b>Agent A</b>
          </div>
          <div className="anatomy-node anatomy-node--worker-b">
            <span>01 / NODE</span><b>Agent B</b>
          </div>
          <div className="anatomy-node anatomy-node--verify">
            <span>01 / NODE</span><b>验证</b>
          </div>
          <div className="anatomy-node anatomy-node--result">
            <span>01 / NODE</span><b>输出</b>
          </div>
          <div className="anatomy-node anatomy-node--human">
            <span>01 / NODE</span><b>人工</b>
          </div>
          <Reveal step={2} className="anatomy-state" motion="fade">
            <span>03 / STATE</span>
            <strong>计划 · 证据 · 预算 · 错误 · 审批</strong>
          </Reveal>
        </div>
        <div className="graph-anatomy-cards">
          <div className="anatomy-card">
            <span>01 / 节点</span>
            <strong>谁来执行？</strong>
            <p>函数 · 模型 · Agent · 工具 · 人</p>
          </div>
          <Reveal step={1} className="anatomy-card">
            <span>02 / 边</span>
            <strong>怎样协作？</strong>
            <p>顺序 · 条件 · 并行 · 循环 · 等待</p>
          </Reveal>
          <Reveal step={2} className="anatomy-card">
            <span>03 / 状态</span>
            <strong>传递什么事实？</strong>
            <p>计划 · 证据 · 预算 · 错误 · 审批</p>
          </Reveal>
          <Reveal step={3} className="anatomy-card anatomy-card--active">
            <span>04 / 控制器</span>
            <strong>谁决定下一步？</strong>
            <p>继续 · 重规划 · 转人工 · 安全终止</p>
          </Reveal>
        </div>
        <Reveal step={4} className="anatomy-conclusion" motion="grow-x">
          <span>节点负责完成任务</span>
          <strong>图负责让整个系统值得信任</strong>
        </Reveal>
      </div>
    ),
  },
  {
    id: "uncertain-nodes",
    section: "趋势 / 新的执行对象",
    title: "Agent 节点：进程成功，不等于任务完成",
    conclusion: "进程成功只代表模型给出了输出，不代表任务已经正确完成。",
    frameCount: 4,
    notes: [
      "确定性节点执行 SQL、HTTP 或脚本，Exit code、Schema 和测试通常可以直接判断结果。",
      "Agent 节点即使返回 200 OK，也只说明它产生了输出，事实和证据仍然可能有问题。",
      "因此系统必须区分运行成功和任务完成，语言流畅、结构完整都不是正确性的证据。",
      "开放判断可以交给模型，权限、预算、Schema、证据门和审批必须由系统或人掌握。",
    ],
    visual: (
      <div className="uncertain-layout">
        <div className="execution-column execution-column--deterministic">
          <header>
            <span>01 / DETERMINISTIC NODE</span>
            <em>可直接判定</em>
          </header>
          <div className="execution-flow">
            <b>输入</b><i>→</i><b>脚本</b><i>→</i><b>结果</b>
          </div>
          <div className="execution-signal">
            <span>判定信号</span>
            <strong>Exit code · Schema · 测试</strong>
          </div>
          <div className="execution-verdict">
            <span>任务状态</span>
            <strong>边界相对清楚</strong>
          </div>
        </div>
        <Reveal step={1} className="execution-column execution-column--agent">
          <header>
            <span>02 / AGENT NODE</span>
            <em>需要额外验证</em>
          </header>
          <div className="execution-flow">
            <b>目标</b><i>→</i><b>探索</b><i>→</i><b>报告</b>
          </div>
          <div className="agent-status">
            <div>
              <span>运行状态</span>
              <strong>200 OK</strong>
              <em>已经产生输出</em>
            </div>
            <div className="agent-status__semantic">
              <span>任务状态</span>
              <strong>UNKNOWN</strong>
              <em>事实和证据仍需验证</em>
            </div>
          </div>
        </Reveal>
        <Reveal step={2} className="semantic-gap" motion="fade">
          <span>两种成功</span>
          <div><b>运行成功</b><strong>≠</strong><b>任务完成</b></div>
          <p>语言流畅、结构完整，仍然可能事实错误</p>
        </Reveal>
        <Reveal step={3} className="control-boundary">
          <div>
            <span>模型负责开放判断</span>
            <b>任务拆解 · 语义路由 · 探索策略</b>
          </div>
          <div>
            <span>系统和人负责硬约束</span>
            <b>权限 · 预算 · Schema · 证据门 · 审批</b>
          </div>
        </Reveal>
      </div>
    ),
  },
  {
    id: "dynamic-workflows",
    section: "趋势 / Dynamic Workflows",
    title: "生成编排，不等于获得可靠性",
    conclusion: "Dynamic Workflows 回答怎样运行，Graph Engineering 回答怎样可信。",
    frameCount: 4,
    notes: [
      "Dynamic Workflows 是一种具体运行机制：它会根据任务生成 JavaScript 编排脚本。",
      "脚本负责循环、分支、并行和中间结果，并调度多个子 Agent 完成具体工作。",
      "Graph Engineering 位于工程方法层，还要设计契约、权限、证据、恢复和人工审批。",
      "两者不是并列组件：自动生成并运行编排，不等于自动获得可靠性。",
    ],
    visual: (
      <div className="dynamic-layout">
        <div className="dynamic-layer-heading">
          <span>01 / 实现层</span>
          <strong>Dynamic Workflows</strong>
          <b>生成并运行编排代码</b>
        </div>
        <div className="dynamic-flow">
          <div className="dynamic-step dynamic-step--goal">
            <span>01 / GOAL</span>
            <b>用户目标</b>
          </div>
          <Reveal step={1} className="dynamic-step dynamic-step--script">
            <span>02 / GENERATE</span>
            <b>Claude 生成脚本</b>
            <em>JavaScript orchestration</em>
          </Reveal>
          <Reveal step={1} className="dynamic-workers">
            <span>03 / SCRIPT SCHEDULES</span>
            <div>
              <div><b>Agent A</b><em>检索</em></div>
              <div><b>Agent B</b><em>修改</em></div>
              <div><b>Agent C</b><em>验证</em></div>
            </div>
          </Reveal>
          <Reveal step={2} className="dynamic-step dynamic-step--result">
            <span>04 / RESULT</span>
            <b>验证 · 汇合 · 返回</b>
          </Reveal>
        </div>
        <Reveal step={2} className="dynamic-governance">
          <div className="dynamic-layer-heading dynamic-layer-heading--governance">
            <span>02 / 方法层</span>
            <strong>Graph Engineering</strong>
            <b>设计约束与治理规则</b>
          </div>
          <div className="engineering-guardrails">
            {["输入输出契约", "权限与预算", "证据与验证", "局部恢复", "人工审批"].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </Reveal>
        <Reveal step={3} className="dynamic-thesis" motion="fade">
          <span>同一套系统 / 两个层次</span>
          <div><b>自动生成编排</b><strong>≠</strong><b>自动获得可靠性</b></div>
        </Reveal>
      </div>
    ),
  },
  {
    id: "graph-when",
    section: "趋势 / 工程判断",
    title: "满足需求就停，不要默认升级到 Graph",
    conclusion: "Graph 的每一条边，都应该对应真实约束。",
    frameCount: 4,
    notes: [
      "路径稳定、任务很短、整体重跑可接受时，先从 Workflow 开始。",
      "只有路径无法预先写完、一个 Agent 需要根据反馈收敛时，才升级到 Loop。",
      "只有复杂度溢出一个执行单元，出现多角色、真实依赖、局部恢复、审批或持久状态时，才升级到 Graph。",
      "每次升级都需要任务约束作为证据；当前结构已经满足可靠性，就停在这里。",
    ],
    visual: (
      <div className="graph-when-layout">
        <div className="structure-card structure-card--workflow">
          <span>01 / 固定流程</span>
          <strong>Workflow</strong>
          <div className="structure-fit">
            <b>适用条件</b>
            <p>路径稳定 · 任务短 · 整体重跑可接受</p>
          </div>
          <em>满足需求，就停在这里</em>
          <small><span>结构成本</span><b>低</b></small>
        </div>
        <Reveal step={1} className="structure-escalation">
          <span>升级证据</span>
          <strong>路径无法<br />预先写完</strong>
          <i aria-hidden="true">→</i>
        </Reveal>
        <Reveal step={1} className="structure-card structure-card--loop">
          <span>02 / 开放探索</span>
          <strong>Loop</strong>
          <div className="structure-fit">
            <b>适用条件</b>
            <p>单 Agent · 开放路径 · 依靠反馈收敛</p>
          </div>
          <em>满足需求，就停在这里</em>
          <small><span>结构成本</span><b>中</b></small>
        </Reveal>
        <Reveal step={2} className="structure-escalation">
          <span>升级证据</span>
          <strong>复杂度溢出<br />一个执行单元</strong>
          <i aria-hidden="true">→</i>
        </Reveal>
        <Reveal step={2} className="structure-card structure-card--graph">
          <span>03 / 复杂协作</span>
          <strong>Graph</strong>
          <div className="structure-fit">
            <b>适用条件</b>
            <p>多角色 · 真实依赖 · 局部恢复 / 审批 / 持久状态</p>
          </div>
          <em>满足需求，就停在这里</em>
          <small><span>结构成本</span><b>高</b></small>
        </Reveal>
        <Reveal step={3} className="structure-rule" motion="grow-x">
          <span>真正的工程判断</span>
          <div>
            <b>每次升级，都要有任务约束作为证据</b>
            <strong>用最低的结构成本，换取任务真正需要的可靠性</strong>
          </div>
        </Reveal>
      </div>
    ),
  },
  {
    id: "agent-plugins",
    section: "趋势 / 能力交付",
    title: "Agent Plugins：统一的是包装",
    conclusion: "Graph 解决运行时协作，Plugin 解决交付时兼容。",
    frameCount: 5,
    notes: [
      "一套工作方式成熟以后，下一个问题是怎样交给其他 Agent、项目和团队复用。",
      "过去安装 Skill 时，往往要先选择目标 Agent，再适配它的目录、清单和 MCP 配置。",
      "来自多家公司的核心维护者共同推进 Agent Plugins，把 Skill 和 MCP 放进同一种标准包。",
      "它统一的是包格式；安装入口、权限、体验和客户端专属扩展仍由各客户端决定。",
      "一个 Skill 或单客户端 MCP 不必做成 Plugin；相关能力需要一起流转时，它才真正有价值。",
    ],
    visual: (
      <div className="plugin-layout">
        <div className="plugin-question">
          <span>一套成熟的工作方式</span>
          <strong>怎样交给别的 Agent？</strong>
        </div>
        <div className="plugin-before">
          <span>过去 / 先选择目标</span>
          <strong>装给哪个 Agent？</strong>
          <div>
            <b>Agent A</b>
            <em>目录 A · 清单 A · MCP 配置 A</em>
          </div>
          <div>
            <b>Agent B</b>
            <em>目录 B · 清单 B · MCP 配置 B</em>
          </div>
        </div>
        <Reveal step={1} className="plugin-package">
          <span>现在 / 一个标准包</span>
          <strong>Agent Plugin</strong>
          <div className="plugin-tree">
            <b>plugin.json</b>
            <b>skills/</b>
            <b>mcp.json</b>
            <em>client-specific/</em>
          </div>
          <small>可移植核心</small>
        </Reveal>
        <Reveal step={2} className="plugin-clients">
          <span>兼容客户端</span>
          <div><b>Agent A</b><em>发现并加载</em></div>
          <div><b>Agent B</b><em>发现并加载</em></div>
          <div><b>Agent C</b><em>发现并加载</em></div>
        </Reveal>
        <Reveal step={3} className="plugin-boundary" motion="grow-x">
          <span>统一包格式</span>
          <strong>≠</strong>
          <span>统一安装、权限与 UX</span>
        </Reveal>
        <Reveal step={4} className="plugin-bridge" motion="fade">
          <div><span>Graph</span><b>运行时 / 怎样协作</b></div>
          <strong>→</strong>
          <div><span>Plugin</span><b>交付时 / 怎样兼容</b></div>
        </Reveal>
      </div>
    ),
  },
  {
    id: "control",
    section: "第二部分 / 我的实践",
    title: "最初：慢，但是还在控制下",
    conclusion: "速度很慢，但每一行代码都经过我的手。",
    frameCount: 4,
    notes: [
      "最初，我在网页上让模型输出代码，再复制、运行、粘贴报错。",
      "公司的 VDI 不能直接复制，有时每一行代码都要自己手敲。",
      "后来安装 Claude Code、接入 GLM，并照着一个 Claw 项目造自己的轮子。",
      "第一次说出‘开始实现吧’时，执行速度突然发生了变化。",
    ],
    visual: (
      <div className="cover-layout">
        <div className="cover-copy">
          <span className="cover-section">第二部分 / 我的实践</span>
          <h1>
            <span>从复制粘贴</span>
            <span>到自己造一个 Claw</span>
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
            速度
          </span>
          <span className="control-chart__axis control-chart__axis--control">
            控制力
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
              <strong>手动搬运</strong>
              <span>慢，但知道每一步</span>
              <StageDots active={[0, 1]} count={4} />
            </div>
          </Reveal>
          <Reveal step={2} className="chart-stage chart-stage--risk">
            <IconCrosshair size={43} stroke={1.4} aria-hidden="true" />
            <div>
              <strong>开始 Vibe</strong>
              <span>Claude Code + GLM</span>
              <StageDots active={[2]} />
            </div>
          </Reveal>
          <Reveal step={3} className="chart-stage chart-stage--control">
            <IconFocusCentered size={43} stroke={1.5} aria-hidden="true" />
            <div>
              <strong>执行权转移</strong>
              <span>“开始实现吧”</span>
              <StageDots active={[2, 3]} />
            </div>
          </Reveal>
        </div>
      </div>
    ),
  },
  {
    id: "manual-loop",
    section: "实践 / 第一阶段",
    title: "说完需求，然后“开始实现吧”",
    conclusion: "小功能非常顺滑，但我开始频繁回来查看 Agent 的状态。",
    frameCount: 5,
    notes: [
      "想到一个功能，就把需求告诉 Agent，让它开始实现。",
      "搜索、定位、修改和测试可以连续完成。",
      "范围小的时候，这种方式非常顺滑。",
      "但一个功能到底要多久，我并不知道。",
      "原来是自己执行，现在变成不断回来查看执行状态。",
    ],
    visual: (
      <div className="manual-layout">
        <div className="loop-board">
          <Node index="01" title="描述需求" detail="想到一个新功能" />
          <Reveal step={1}>
            <Node index="02" title="搜索" detail="定位代码与文档" />
          </Reveal>
          <Reveal step={1}>
            <Node index="03" title="修改" detail="连续完成实现" />
          </Reveal>
          <Reveal step={2}>
            <Node index="04" title="运行" detail="测试并继续修复" />
          </Reveal>
          <Reveal step={2}>
            <Node index="05" title="完成" detail="交付一个功能" tone="active" />
          </Reveal>
          <Reveal step={3}>
            <Node index="06" title="回来看看" detail="做完了吗？卡住了吗？" tone="danger" />
          </Reveal>
          <Reveal
            step={3}
            className="loop-return"
            motion="grow-x"
          >
              <span>一句话启动 / “开始实现吧”</span>
          </Reveal>
        </div>
          <Reveal step={4} className="metric-rail">
          <Metric label="小范围体验" value="顺滑" tone="active" />
          <Metric label="执行速度" value="快" />
          <Metric label="人工盯梢" value="频繁" tone="danger" />
          </Reveal>
      </div>
    ),
  },
  {
    id: "agent-speed",
    section: "实践 / 自动化升级",
    title: "让 Agent Loop 一直跑到目标完成",
    conclusion: "Loop 运行得越久，对目标、边界、验证和停止条件的要求越高。",
    frameCount: 5,
    notes: [
      "我希望给出一个目标以后，Agent 能持续工作到真正完成。",
      "工作流变成 explore 或 brainstorming，再 propose，最后交给 goal。",
      "一次 Goal 可以自己执行一两个小时。",
      "当时关注的是吞吐量：更久、更少打断、更快进入下一个功能。",
      "我没有意识到，长循环正在放大边界和验证问题。",
    ],
    visual: (
      <div className="agent-layout">
        <div className="ghost-loop">
          <span>想一个功能</span>
          <span>开始实现</span>
          <span>回来查看</span>
        </div>
        <Reveal step={1} className="agent-pipeline">
          {["/opsx:explore", "/opsx:propose", "/goal", "Agent Loop"].map((item, index) => (
            <Node
              key={item}
              index={`0${index + 1}`}
              title={item}
              tone={index === 3 ? "active" : "default"}
            />
          ))}
        </Reveal>
        <Reveal
          step={2}
          className="pipeline-compression"
          motion="grow-x"
        >
            <span>自主执行 / 一次持续 1–2 小时</span>
        </Reveal>
          <Reveal step={3} className="meter-stack">
            <div className="meter-row">
              <span>吞吐量</span>
              <i style={{ "--meter": "94%" } as CSSProperties} />
            </div>
            <div className="meter-row">
              <span>人工介入</span>
              <i style={{ "--meter": "22%" } as CSSProperties} />
            </div>
            <div className="meter-row meter-row--danger">
              <span>边界清晰度</span>
              <i style={{ "--meter": "34%" } as CSSProperties} />
            </div>
          </Reveal>
          <Reveal step={4} className="question-stage" motion="fade">
            <span>当时我只关心</span>
            <strong>怎样让它跑得更久？</strong>
          </Reveal>
      </div>
    ),
  },
  {
    id: "entropy",
    section: "实践 / 失控现场",
    title: "一个周末：两个 Goal，执行了 20 个小时",
    conclusion: "功能完成了，但我已经不知道代码库里有几套逻辑。",
    frameCount: 6,
    notes: [
      "两个 Goal 在一个周末一共执行了大约 20 个小时。",
      "接近一千个 Commit，产生了几十个 PR。",
      "表面上功能需求基本完成。",
      "但新旧逻辑、中间状态和重复路径被混在一起。",
      "每次迭代都开始重复执行、返工、再执行。",
      "速度已经很快，而我几乎失去了对项目的控制。",
    ],
    visual: (
      <div className="incident-layout">
        <div className="command-chain">
          <code>GOAL / 01</code>
          <span>+</span>
          <code>GOAL / 02</code>
          <span>→</span>
          <strong>整个周末</strong>
        </div>
        <div className="incident-timeline">
          <div className="timeline-axis">
            <span>00:00</span>
            <span>08:00</span>
            <span>16:00</span>
            <span>20:00</span>
          </div>
          <Reveal step={1} className="timeline-progress timeline-progress--early" motion="grow-x">
            <span>功能持续完成</span>
          </Reveal>
          <Reveal step={2} className="timeline-progress timeline-progress--late" motion="grow-x">
            <span>Goal 仍在运行</span>
          </Reveal>
          <Reveal step={3} className="missing-checkpoints">
            <span>?</span><span>?</span><span>?</span>
          </Reveal>
          <Reveal step={4} className="merge-event">控制能力 / 接近归零</Reveal>
        </div>
        <Reveal step={2} className="incident-metrics">
          <Metric label="运行时间" value="≈20H" />
          <Metric label="COMMIT" value="≈1000" />
          <Metric label="PR" value="数十" />
          <Metric label="功能" value="完成" tone="active" />
        </Reveal>
        <Reveal step={5} className="debt-ledger">
          {["旧逻辑", "中间状态", "重复路径", "兼容分支", "持续返工"].map((item, index) => (
            <div key={item}>
              <span>0{index + 1}</span>
              <b>{item}</b>
              <em>仍然存在</em>
            </div>
          ))}
        </Reveal>
      </div>
    ),
  },
  {
    id: "runaway",
    section: "实践 / 重建控制",
    title: "我用了整整一个星期，重构整个项目",
    conclusion: "Vibe Coding 不是对着模型许愿，而是先把工程结构搭明白。",
    frameCount: 5,
    notes: [
      "最后，我通过改变技术栈的方式，用一周彻底重构。",
      "重新建立主路径、模块边界和对项目的理解。",
      "这让我意识到，Vibe Coding 不是找到最强模型然后许愿。",
      "我们要先搭清工程架构，再让 AI 补充实现细节。",
      "关注点从‘怎样让它继续跑’转向‘怎样让它沿正确路径跑’。",
    ],
    visual: (
      <div className="gates-layout">
        <div className="rail rail--actual">
          <span>重构之前</span>
          <i />
          <b>新旧逻辑混杂</b>
          <b>边界模糊</b>
          <b className="danger">无法继续判断</b>
        </div>
        <div className="rail rail--controlled">
          <span>一周重构</span>
          <i />
          <Reveal step={1}><b>改变技术栈</b></Reveal>
          <Reveal step={2}><b>重建主路径</b></Reveal>
          <Reveal step={3}>
            <b>明确模块边界</b>
            <b>恢复系统理解</b>
          </Reveal>
        </div>
        <Reveal step={4} className="scarcity-words">
          <strong>清晰需求</strong>
          <strong>明确边界</strong>
          <strong>正确上下文</strong>
          <strong>测试与 Review</strong>
        </Reveal>
      </div>
    ),
  },
  {
    id: "gates",
    section: "经验 01 / 需求",
    title: "开发者正在变成技术产品经理",
    conclusion: "让 AI 反过来提问，才能确认双方理解的是同一件事。",
    frameCount: 5,
    notes: [
      "构建软件最耗时间的步骤，经常不是写代码，而是搞明白需求。",
      "过去是产品经理向开发解释需求，开发确认范围、工时和排期。",
      "现在是开发者向 AI 描述产品目标，并让 AI 预估规模和风险。",
      "更重要的是让 AI 反过来问问题，挑战模糊的需求。",
      "开发者逐渐成为 AI 与最终产品之间的技术产品经理。",
    ],
    visual: (
      <div className="role-shift-layout">
        <div className="role-panel role-panel--before">
          <span>过去 / 需求评审</span>
          <strong>产品经理</strong>
          <i aria-hidden="true">→</i>
          <b>PPT 与需求说明</b>
          <i aria-hidden="true">→</i>
          <strong>开发者</strong>
          <small>确认范围 · 评估工时 · 安排排期</small>
        </div>
        <Reveal step={1} className="role-pivot" motion="fade">
          角色翻转
        </Reveal>
        <Reveal step={2} className="role-panel role-panel--now">
          <span>现在 / Agent Coding</span>
          <strong>开发者</strong>
          <i aria-hidden="true">→</i>
          <b>目标、范围与风险</b>
          <i aria-hidden="true">→</i>
          <strong>AI</strong>
          <small>拆功能 · 找风险 · 反向提问</small>
        </Reveal>
        <Reveal step={3} className="grill-card">
          <span>GRILL ME</span>
          <strong>别急着写。先追着我问。</strong>
          <div>
            <b>真正目标是什么？</b>
            <b>这一期明确不做什么？</b>
            <b>怎样才算完成？</b>
          </div>
        </Reveal>
        <Reveal step={4} className="role-conclusion" motion="grow-x">
          <span>新的位置</span>
          <strong>AI 与最终产品之间的技术产品经理</strong>
        </Reveal>
      </div>
    ),
  },
  {
    id: "skills",
    section: "经验 02 / 边界",
    title: "分阶段，并且显式确定边界",
    conclusion: "每一期不仅要写清楚做什么，也要明确写出不做什么。",
    frameCount: 5,
    notes: [
      "任务规模大到一定程度以后，必须分期并持久化规划。",
      "第一期只做用户注册，并明确不做登录。",
      "否则 Agent 很可能顺手实现高度相关的登录，留下两套逻辑。",
      "功能边界之外，还要明确技术栈、测试、部署和文档版本。",
      "结构成本要与任务寿命、风险和维护要求匹配。",
    ],
    visual: (
      <div className="risk-layout phase-layout">
        <div className="risk-axis">
          <span>一个大型需求</span>
          <i />
          <span>可验证的小阶段</span>
        </div>
        <div className="risk-zones">
          <Reveal step={1} className="risk-zone risk-zone--active">
            <span>第一期</span>
            <b>实现用户注册</b>
            <em>非目标：不要实现登录</em>
          </Reveal>
          <Reveal step={2} className="risk-zone">
            <span>第二期</span>
            <b>实现登录鉴权</b>
            <em>复用第一期唯一用户模型</em>
          </Reveal>
          <Reveal step={3} className="risk-zone">
            <span>后续阶段</span>
            <b>权限与后台能力</b>
            <em>逐期重新确认范围</em>
          </Reveal>
        </div>
        <Reveal step={4} className="phase-boundaries">
          {[
            "React / Vue",
            "Tailwind / 原生 CSS",
            "组件库",
            "测试方式",
            "部署链路",
            "文档与版本",
          ].map((item) => <span key={item}>{item}</span>)}
        </Reveal>
      </div>
    ),
  },
  {
    id: "context-stack",
    section: "经验 03 / 图示",
    title: "一图胜千言",
    conclusion: "把关系从自然语言里画出来，控制问题才真正可检查。",
    frameCount: 4,
    notes: [
      "流程图、状态图和模块关系图，既方便自己理解，也方便 AI。",
      "长文字经常同时描述顺序、条件、异常和角色，容易遗漏。",
      "变成图以后，并行、等待、循环和人工确认会明显很多。",
      "我通常让 AI 使用 Mermaid 或 HTML 生成这些图。",
    ],
    visual: (
      <div className="diagram-layout">
        <div className="diagram-source">
          <span>一段自然语言</span>
          <p>
            用户提交以后，前端和后端分别处理；后端失败时重试，成功后进入测试，
            高风险结果还要等待人工确认……
          </p>
          <div>
            <b>顺序？</b>
            <b>并行？</b>
            <b>异常？</b>
            <b>谁确认？</b>
          </div>
        </div>
        <Reveal step={1} className="diagram-conversion" motion="grow-x">
          <span>MERMAID / HTML</span>
          <strong>→</strong>
        </Reveal>
        <Reveal step={2} className="diagram-canvas">
          <div className="diagram-node diagram-node--start">提交需求</div>
          <div className="diagram-node diagram-node--front">前端处理</div>
          <div className="diagram-node diagram-node--back">后端处理</div>
          <div className="diagram-node diagram-node--test">自动测试</div>
          <div className="diagram-node diagram-node--human">人工确认</div>
          <i className="diagram-edge diagram-edge--one" />
          <i className="diagram-edge diagram-edge--two" />
          <i className="diagram-edge diagram-edge--three" />
          <i className="diagram-edge diagram-edge--four" />
          <span className="diagram-loop">失败 → 修复 → 重试</span>
        </Reveal>
        <Reveal step={3} className="diagram-benefit" motion="fade">
          并行 · 依赖 · 循环 · 人工关卡，一眼可见
        </Reveal>
      </div>
    ),
  },
  {
    id: "docs",
    section: "经验 04 / 测试",
    title: "测试驱动比 Spec 驱动更重要",
    conclusion: "Spec 决定从哪里开始，测试决定能不能继续往下走。",
    frameCount: 5,
    notes: [
      "Spec 要写，它负责告诉 Agent 准备做什么。",
      "高频修改中，真正约束不能破坏什么的，往往是测试。",
      "文档可能过期，也可能被理解成另一回事；测试会直接失败。",
      "单元测试、集成测试和 E2E 比一句自然语言提醒更可靠。",
      "测试通过不等于最终正确，但比模型自我评价更可靠。",
    ],
    visual: (
      <div className="test-spec-layout">
        <div className="spec-panel">
          <span>SPEC / 起点</span>
          <strong>告诉 Agent 要做什么</strong>
          <div className="spec-paper">
            <i /><i /><i /><i /><i />
          </div>
          <Reveal step={1} className="spec-risks">
            <b>可能过期</b>
            <b>可能产生歧义</b>
          </Reveal>
        </div>
        <Reveal step={2} className="spec-to-test" motion="grow-x">
          高频修改
        </Reveal>
        <Reveal step={3} className="tests-panel">
          <span>TESTS / 关卡</span>
          <strong>约束 Agent 不能破坏什么</strong>
          <div className="test-results">
            <b><i />单元测试</b>
            <b><i />集成测试</b>
            <b><i />E2E 测试</b>
          </div>
        </Reveal>
        <Reveal step={4} className="test-verdict" motion="fade">
          <span>更重要的控制信号</span>
          <strong>失败，就不能继续</strong>
        </Reveal>
      </div>
    ),
  },
  {
    id: "risk",
    section: "经验 05 / 心流",
    title: "保护自己的心流",
    conclusion: "减少无意义的打断，但在边界、验证和合并处保留关卡。",
    frameCount: 4,
    notes: [
      "Vibe Coding 很像间歇性的强化机制。",
      "输入需求后，功能突然实现，就像钓鱼时大鱼突然上钩。",
      "联调、切项目和到处查文档会持续打断状态。",
      "更理想的是本地拥有可以快速验证的完整环境，同时保留工程关卡。",
    ],
    visual: (
      <div className="flow-layout">
        <div className="flow-cycle">
          <div><span>01</span><b>输入需求</b></div>
          <Reveal step={1}><div><span>02</span><b>AI 执行</b></div></Reveal>
          <Reveal step={1}><div className="flow-reward"><span>03</span><b>功能实现</b></div></Reveal>
          <i aria-hidden="true" />
          <Reveal step={1} className="flow-fishing">像等了半小时，突然有鱼上钩</Reveal>
        </div>
        <Reveal step={2} className="flow-breakers">
          <span>联调</span><span>切换项目</span><span>查文档</span><span>等待环境</span>
          <strong>上下文切换</strong>
        </Reveal>
        <Reveal step={3} className="flow-environment">
          <span>理想环境</span>
          <strong>本地前后端一致 · 快速验证 · 必要时使用 Mock</strong>
          <small>心流 ≠ Agent 无限运行</small>
        </Reveal>
      </div>
    ),
  },
  {
    id: "current-loop",
    section: "经验 06 / Hook",
    title: "用 Hook 把边界变成硬约束",
    conclusion: "能够机械执行的约束，就不要只依赖模型记住。",
    frameCount: 5,
    notes: [
      "主流 Coding Agent 都支持不同形式的 Hook。",
      "例如任务只允许修改后端，或者禁止修改测试用例。",
      "只写在 Prompt 中，Agent 遇到困难时仍可能选择最短路径。",
      "Hook 可以在写入禁止目录时直接拦截。",
      "Prompt 提高遵守边界的概率；Hook 把边界变成系统规则。",
    ],
    visual: (
      <div className="hook-layout">
        <div className="hook-request">
          <span>本次任务</span>
          <strong>只修改后端代码</strong>
          <small>测试用例保持不变</small>
        </div>
        <Reveal step={1} className="hook-agent">
          <span>Agent 尝试写入</span>
          <div><code>server/handler.ts</code><code>tests/handler.test.ts</code></div>
        </Reveal>
        <Reveal step={2} className="hook-gate">
          <span>PRE-EDIT HOOK</span>
          <strong>检查目标路径</strong>
        </Reveal>
        <Reveal step={3} className="hook-result hook-result--allow">
          <span>允许</span><strong>server/</strong><small>继续执行</small>
        </Reveal>
        <Reveal step={3} className="hook-result hook-result--deny">
          <span>拦截</span><strong>tests/</strong><small>停止写入并说明原因</small>
        </Reveal>
        <Reveal step={4} className="hook-rule" motion="fade">
          <span>Prompt</span><b>概率性提醒</b><i>→</i><span>Hook</span><b>确定性规则</b>
        </Reveal>
      </div>
    ),
  },
  {
    id: "tests",
    section: "实践 / 文档",
    title: "让正确上下文更容易被找到",
    conclusion: "小而清晰的文档集群，比每次重新阅读几千行代码更省上下文。",
    frameCount: 5,
    notes: [
      "我开始在每个重要子模块维护一个简单 README。",
      "长期有效的 API 和领域说明放在 docs。",
      "一次性的分析和修改计划放在 docs/local。",
      "模块文档回答职责、非职责、入口、不变量和关系。",
      "过期文档会提高走错路径的概率，因此必须同步维护。",
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
              detail="清晰边界"
              tone={index === 1 ? "active" : "default"}
            />
          ))}
        </Reveal>
        <Reveal step={3} className="doc-questions">
          {["负责什么", "不负责什么", "核心入口", "关键不变量", "模块关系"].map(
            (item, index) => <span key={item}>0{index + 1} / {item}</span>,
          )}
        </Reveal>
        <Reveal step={4} className="doc-policy">
          <div><span>长期有效</span><b>docs / API 与领域说明</b></div>
          <div><span>单次任务</span><b>docs/local / 分析与计划</b></div>
        </Reveal>
      </div>
    ),
  },
  {
    id: "work-shift",
    section: "经验 07 / AGENTS.md",
    title: "把吃过的亏，整理成自己的 AGENTS.md",
    conclusion: "模型和 Skill 会换，简单、边界、根因与验证不会过期。",
    frameCount: 5,
    notes: [
      "反复出现的问题，不应该永远散落在聊天记录里。",
      "我会人工总结，也会让 Agent 回顾本地会话记录。",
      "这些约束逐渐沉淀成九条 AGENTS.md 原则。",
      "它不是一次写完的；哪次吃了亏，就补一条。",
      "同一个问题连续出现，就把规则写得更明确。",
    ],
    visual: (
      <div className="agents-layout">
        <div className="agents-file">
          <span>PROJECT ROOT</span>
          <strong>AGENTS.md</strong>
          <small>一份持续演进的个人工程约束</small>
        </div>
        <div className="agents-principles">
          {[
            "编码前先思考",
            "保持简单",
            "外科手术式修改",
            "围绕可验证目标",
            "快速失败并暴露错误",
            "修复根因",
            "可观察、可调试",
            "保持文档同步",
            "清楚沟通",
          ].map((item, index) => (
            <Reveal step={Math.floor(index / 3) + 1} key={item} className="agents-principle">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <b>{item}</b>
            </Reveal>
          ))}
        </div>
        <Reveal step={4} className="agents-evolution" motion="grow-x">
          <span>一次失误</span><i>→</i><span>一条规则</span><i>→</i><strong>长期资产</strong>
        </Reveal>
      </div>
    ),
  },
  {
    id: "taste",
    section: "实践 / 当前工作流",
    title: "我现在怎么 Vibe Coding",
    conclusion: "执行可以交给 Agent，Comment 的价值和最终 Merge 仍由人判断。",
    frameCount: 6,
    notes: [
      "细节不清楚时，先用 Grill Me 反向提问，再维护设计文档。",
      "设计定下来以后，再实现代码并运行测试。",
      "测试通过后提交 PR，等待 CI 和自动触发的 Codex Code Review。",
      "Review Comment 不照单全收，而是判断是否真正有价值。",
      "有价值就继续修；泛泛而谈或增加复杂度的建议可以拒绝。",
      "最后是继续修改还是 Merge，决定仍然在我这里。",
    ],
    visual: (
      <div className="workflow-layout">
        <div className="workflow-track">
          {[
            ["01", "细节不清楚", "HUMAN"],
            ["02", "Grill Me", "AI ↔ HUMAN"],
            ["03", "维护设计文档", "HUMAN"],
            ["04", "实现 + 测试", "AGENT"],
            ["05", "提交 PR", "AGENT"],
            ["06", "CI + Code Review", "SYSTEM"],
            ["07", "判断 Comment", "HUMAN"],
            ["08", "修复或合并", "HUMAN"],
          ].map(([index, label, owner], step) => (
            <Reveal
              step={Math.min(Math.floor(step / 2) + 1, 4)}
              key={index}
              className={`workflow-step ${owner.includes("HUMAN") ? "workflow-step--human" : ""}`}
            >
              <span>{index}</span><strong>{label}</strong><small>{owner}</small>
            </Reveal>
          ))}
        </div>
        <Reveal step={5} className="workflow-decision" motion="fade">
          <span>最终关卡</span>
          <strong>Comment 有价值吗？</strong>
          <div><b>是 → 继续修复</b><b>否 → 忽略或说明原因</b></div>
        </Reveal>
      </div>
    ),
  },
  {
    id: "demo",
    section: "演示 / 章节页",
    title: "Talk is cheap. Show me the code.",
    conclusion: "方法先讲到这里。下面别听我怎么说，直接看东西。",
    frameCount: 1,
    notes: ["这是一段用浏览器前端完成的 AI 产品演示；停顿后按右方向键进入。"],
    visual: (
      <div className="demo-title-layout">
        <div className="demo-title-rule">
          <span>方法</span>
          <i />
          <strong>现场演示</strong>
        </div>
        <blockquote>
          <span>“</span>
          <strong>Talk is cheap.</strong>
          <strong className="demo-title-accent">Show me the code.</strong>
          <footer>— LINUS TORVALDS</footer>
        </blockquote>
        <div className="demo-title-next">
          <span>下一页</span>
          <b>产品动画 / 60 秒</b>
        </div>
      </div>
    ),
  },
  {
    id: OPENING_DEMO_SLIDE_ID,
    section: "演示 / 产品动画",
    title: "产品动画演示",
    conclusion: "观众视图：按任意键或点击开始动画。",
    frameCount: 1,
    notes: [
      "观众视图保持黑屏并等待启动；按任意键或点击开始，Shift + End 可跳到结尾。",
    ],
    visual: (
      <div className="opening-demo-cue">
        <span>观众视图</span>
        <strong>产品动画演示</strong>
        <small>按任意键开始</small>
      </div>
    ),
  },
  {
    id: "generations",
    section: "实践 / Taste",
    title: "我们不需要在打字速度上赢过 AI",
    conclusion: "Taste 是知道应该拒绝什么，以及应该删除什么。",
    frameCount: 6,
    notes: [
      "在具体编码任务上，我已经赶不上 AI 的实现速度。",
      "但速度不是软件工程的全部，设计、分层和整体一致性都需要判断。",
      "两个实现都能运行、都能通过测试，代价却可能完全不同。",
      "Taste 包括判断边界、识别复杂度和选择更简单的方案。",
      "它不只是告诉 AI 生成什么，也要知道什么不该存在。",
      "认真读 Diff、追问为什么和拒绝过度设计，都在训练 Taste。",
    ],
    visual: (
      <div className="taste-layout">
        <div className="implementation implementation--works">
          <span>能运行</span>
          <b>测试通过</b>
          <div className="code-tree">
            <i>Feature</i>
            <Reveal step={2}><i className="danger">AbstractFactory</i></Reveal>
            <Reveal step={3}>
              <i className="danger">CompatibilityLayer</i>
              <i className="danger">LegacyEntry</i>
            </Reveal>
          </div>
        </div>
        <div className="implementation implementation--fits">
          <span>适合这个系统</span>
          <b>测试通过</b>
          <div className="code-tree">
            <i>Feature</i>
            <Reveal step={4}>
              <i className="active">ExistingDomainService</i>
              <i className="active">SingleEntry</i>
            </Reveal>
          </div>
        </div>
        <Reveal step={1} className="same-output">相同结果 / 不同代价</Reveal>
        <Reveal step={5} className="taste-quote" motion="fade">
          <strong>TASTE IS WHAT YOU<br />REFUSE AND REMOVE.</strong>
          <span>Taste 是知道什么不应该存在。</span>
        </Reveal>
      </div>
    ),
  },
  {
    id: "lessons",
    section: "总结 / 三条经验",
    title: "我的三条核心经验",
    conclusion: "执行能力会继续变强，需求、约束和判断仍然需要持续积累。",
    frameCount: 4,
    notes: [
      "第一，先讲清需求和设计，再管控 Agent 的执行行为。",
      "第二，持续演进的 AGENTS.md 是重要的个人资产。",
      "第三，多与 AI 沟通并阅读优秀设计，持续培养 Taste。",
      "未来可以少写一些代码，但不能放弃判断什么值得做、什么不能接受。",
    ],
    visual: (
      <div className="lessons-layout">
        {[
          "先把需求和设计讲清楚，再管控 Agent 的执行行为。",
          "把反复出现的经验，沉淀成持续演进的 AGENTS.md。",
          "多沟通、多阅读、多拒绝过度设计，持续培养 Taste。",
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
    section: "总结 / 重新汇合",
    title: "把执行交给 AI，把工程判断留在人手里",
    conclusion: "我们不需要在打字速度上赢过 AI。",
    frameCount: 4,
    notes: [
      "第一部分的 Graph、Plugin 和第二部分的个人经历，最后汇合在同一点。",
      "模型负责越来越多的不确定执行，系统和人负责目标、约束、证据与判断。",
      "我们不需要在打字速度上赢过 AI。",
      "把大量执行交给 AI，同时更认真地承担需求、边界、验证和 Taste。",
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
          AI / 执行
        </Reveal>
        <Reveal step={2} className="ownership-label ownership-label--human">
          人 / 目标 · 边界 · 验证 · 判断
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

const OPENING_DEMO_SLIDE_INDEX = slides.findIndex(
  (slide) => slide.id === OPENING_DEMO_SLIDE_ID,
);

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
  const [openingExiting, setOpeningExiting] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const sourceIdRef = useRef("");

  const currentSlide = slides[pageIndex];
  const currentFrame = frames[pageIndex];
  const isOpeningDemoSlide = currentSlide.id === OPENING_DEMO_SLIDE_ID;
  const openingActive =
    mode === "audience" && (isOpeningDemoSlide || openingExiting);

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
    const nextPage = clamp(
      OPENING_DEMO_SLIDE_INDEX + 1,
      0,
      slides.length - 1,
    );
    setOpeningExiting(true);
    setPageIndex(nextPage);
    setFrames((current) => {
      const next = [...current];
      next[nextPage] = 0;
      return next;
    });
  }, []);

  const completeOpening = useCallback(() => {
    setOpeningExiting(false);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (openingActive) return;
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
  }, [moveFrame, movePage, openingActive]);

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
      aria-hidden={openingActive ? true : undefined}
      inert={openingActive}
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
        <div
          className="page-progress"
          aria-hidden="true"
          style={{ "--slide-count": slides.length } as CSSProperties}
        >
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
      {openingActive ? (
        <OpeningSequence
          onComplete={completeOpening}
          onExitStart={prepareOpeningExit}
        />
      ) : null}
    </div>
  );
}
