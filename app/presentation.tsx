"use client";

import { useGSAP } from "@gsap/react";
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
import { preloadOpeningAssets } from "./opening/opening-preload";
import { isOpeningSkipShortcut } from "./opening/opening-shortcuts";
import { syncPresentationHash } from "./presentation-location";

gsap.registerPlugin(useGSAP);

type PresentationMode = "audience" | "presenter";
type MotionKind = "rise" | "grow-x" | "grow-y" | "fade" | "wipe";
const PRESENTATION_WIDTH = 1920;
const PRESENTATION_HEIGHT = 1080;
const OPENING_DEMO_SLIDE_ID = "opening-demo";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

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

const slides: SlideDefinition[] = [
  {
    id: "graph-cover",
    section: "第一部分 / 趋势",
    title: "从 Loop 到 Graph",
    conclusion: "单个执行单元越能干，瓶颈越容易跑到它们之间。",
    frameCount: 4,
    notes: [
      "第一部分先聊 Graph Engineering 为什么会在现在出现。",
      "一个 Loop 能处理单个执行单元，任务再大，就得管多个单元怎样并行、依赖和汇合。",
      "结果在验证节点碰头，通过才算完成；某个分支失败，也只重试相关节点。",
      "高风险任务把控制权交给人。Graph Engineering 设计的，就是这些执行单元之间的关系。",
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
          <p>单个执行单元越能干，瓶颈越容易跑到它们之间。</p>
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
          <span>Agent 数量可以增加</span>
          <strong>控制关系要跟着写清楚</strong>
        </Reveal>
      </div>
    ),
  },
  {
    id: "engineering-layers",
    section: "趋势 / 工程尺度",
    title: "工程范围在一层层往外扩",
    conclusion: "Graph 把前面几层放进同一套协作关系里。",
    frameCount: 4,
    notes: [
      "Prompt 管一次调用里的指令怎么写，Context 管模型此刻该知道什么。",
      "Harness 再往外一层，处理工具、权限、沙箱和日志这些运行环境。",
      "Loop 负责验证、反馈、重试和停止，让一个执行单元自己收敛。",
      "到了 Graph，问题变成多个执行单元之间怎么配合。",
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
    conclusion: "Graph 管执行单元之间，Loop 管每个执行单元内部。",
    frameCount: 4,
    notes: [
      "一个 Loop 围绕一个目标计划、执行、观察和验证，再按反馈调整下一步。",
      "任务扩大以后，一个目标会拆给多个角色；失败时不必整体重跑，还可能需要人工接手。",
      "Graph 管这些执行单元怎样依赖和汇合，里面的 Worker 仍然跑着自己的 Loop。",
      "两层各管一段：Graph 管协作，Loop 管收敛。",
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
              <path d="M142 246 C142 270 235 252 244 278" />
              <path d="M418 246 C418 270 325 252 316 278" />
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
          <span>两层各管一段</span>
          <strong>Graph 管协作，Loop 管收敛</strong>
        </Reveal>
      </div>
    ),
  },
  {
    id: "graph-anatomy",
    section: "趋势 / 执行图",
    title: "一张执行图，至少要答清四个问题",
    conclusion: "图好不好看不重要，控制关系要能看见、能检查、能恢复。",
    frameCount: 5,
    notes: [
      "第一个问题，Node：谁来执行？可以是代码、模型、Agent、工具，也可以是人。",
      "第二个问题，Edge：谁依赖谁？哪里有分支、并行、循环或者等待？",
      "第三个问题，State：节点之间传什么事实？这些内容不能一直埋在对话里。",
      "第四个问题，Controller：下一步继续、重规划、转人工，还是安全终止？",
      "Graph Engineering 把原本藏在上下文和 if/else 里的关系摆到了台面上。",
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
          <Reveal step={1} className="anatomy-edge-key" motion="fade">
            <span>02 / EDGE</span>
            <b>并行 · 汇合 · 条件</b>
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
          <span>节点负责做任务</span>
          <strong>图负责管住整个系统</strong>
        </Reveal>
      </div>
    ),
  },
  {
    id: "uncertain-nodes",
    section: "趋势 / 新的执行对象",
    title: "Agent 节点：进程成功，不等于任务完成",
    conclusion: "200 OK 只能证明有输出，不能证明任务做对了。",
    frameCount: 4,
    notes: [
      "确定性节点执行 SQL、HTTP 或脚本，Exit code、Schema 和测试通常就能判断结果。",
      "Agent 节点就算返回 200 OK，也只说明它交了东西，事实和证据仍可能有问题。",
      "所以系统得把运行成功和任务完成分开。写得顺、结构齐，都不能证明结果正确。",
      "开放问题可以交给模型，权限、预算、Schema、证据门和审批要握在系统或人手里。",
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
          <p>写得顺、结构齐，事实仍然可能有错</p>
        </Reveal>
        <Reveal step={3} className="control-boundary">
          <div>
            <span>模型处理开放问题</span>
            <b>任务拆解 · 语义路由 · 探索策略</b>
          </div>
          <div>
            <span>系统和人守住硬约束</span>
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
    conclusion: "Dynamic Workflows 负责运行，Graph Engineering 负责约束怎么运行。",
    frameCount: 4,
    notes: [
      "Dynamic Workflows 是一种运行机制，会按任务生成 JavaScript 编排脚本。",
      "循环、分支、并行和中间结果交给脚本，子 Agent 去做具体工作。",
      "Graph Engineering 还要给这套编排设规则：契约、权限、证据、恢复和人工审批。",
      "脚本能自动生成并运行，可靠性却不会顺带出现。",
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
            <b>给编排设规则</b>
          </div>
          <div className="engineering-guardrails">
            {["输入输出契约", "权限与预算", "证据与验证", "局部恢复", "人工审批"].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </Reveal>
        <Reveal step={3} className="dynamic-thesis" motion="fade">
          <span>同一套系统 / 各管一层</span>
          <div><b>自动生成编排</b><strong>≠</strong><b>自动获得可靠性</b></div>
        </Reveal>
      </div>
    ),
  },
  {
    id: "graph-when",
    section: "趋势 / 工程判断",
    title: "够用就停，不要默认上 Graph",
    conclusion: "Graph 里的每一条边，都得对应一条真实约束。",
    frameCount: 4,
    notes: [
      "任务很短、路径稳定，失败以后整体重跑也能接受，就用 Workflow。",
      "路径写不死，需要一个 Agent 看着反馈继续走，再用 Loop。",
      "等到任务真的出现多角色、依赖、局部恢复、审批或者持久状态，才值得上 Graph。",
      "每次升级都要拿出一条真实约束。当前结构已经够用，就停在这里。",
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
          <span>升级前先问</span>
          <div>
            <b>任务里真的有这条约束吗？</b>
            <strong>结构已经够用，就停在这里</strong>
          </div>
        </Reveal>
      </div>
    ),
  },
  {
    id: "agent-plugins",
    section: "趋势 / 能力交付",
    title: "Agent Plugins：把包装统一起来",
    conclusion: "Graph 管任务怎么跑，Plugin 管能力怎么交付。",
    frameCount: 5,
    notes: [
      "现在安装 Skill，通常得先选目标 Agent；换一个客户端，目录、清单和 MCP 配置就要再整理一遍。",
      "Agent Plugin 把 plugin.json、skills 和 MCP 配置装进一个标准包，统一的是外面的包装。",
      "兼容规范的 Agent 都能发现并加载这个包，所以能力可以先打包，再决定交到哪里。",
      "安装入口、权限、安全策略、UX 和专属扩展，仍然由各客户端自己决定。",
      "一组相关能力需要跨客户端交付时，Plugin 才派得上用场。Graph 管任务怎么跑，Plugin 管能力怎么交付。",
    ],
    visual: (
      <div className="plugin-layout">
        <div className="plugin-thesis">
          <span>一套工作方式想交给更多 Agent</span>
          <strong>从 <b>N 份客户端适配</b>，到 <b>1 个标准包</b></strong>
        </div>
        <div className="plugin-before">
          <span>过去 / TARGET FIRST</span>
          <strong>先选 Agent，再分别适配</strong>
          <div className="plugin-source">
            <b>Skill + MCP</b>
            <em>同一套工作方式</em>
          </div>
          <div className="plugin-targets">
            <div><b>Agent A</b><em>目录 A · 清单 A · MCP A</em></div>
            <div><b>Agent B</b><em>目录 B · 清单 B · MCP B</em></div>
          </div>
        </div>
        <Reveal step={1} className="plugin-transfer">
          <span>PACKAGE ONCE</span>
          <i aria-hidden="true">→</i>
        </Reveal>
        <Reveal step={1} className="plugin-package">
          <span>现在 / STANDARD PACKAGE</span>
          <strong>Agent Plugin</strong>
          <div className="plugin-tree">
            <span>可移植核心</span>
            <b>plugin.json</b>
            <b>skills/</b>
            <b>mcp.json</b>
          </div>
          <div className="plugin-extension">
            <span>客户端扩展</span>
            <em>Hooks · Commands</em>
          </div>
        </Reveal>
        <Reveal step={2} className="plugin-transfer plugin-transfer--load">
          <span>COMPATIBLE</span>
          <i aria-hidden="true">→</i>
        </Reveal>
        <Reveal step={2} className="plugin-clients">
          <span>交付 / COMPATIBLE AGENTS</span>
          <strong>同一个包，多端加载</strong>
          <div><b>Agent A</b><em>发现 · 加载</em></div>
          <div><b>Agent B</b><em>发现 · 加载</em></div>
          <div><b>Agent C</b><em>发现 · 加载</em></div>
        </Reveal>
        <Reveal step={3} className="plugin-boundary" motion="grow-x">
          <div>
            <span>规范统一的部分</span>
            <b>包格式 · 可移植核心</b>
          </div>
          <strong>≠</strong>
          <div>
            <span>仍由客户端决定</span>
            <b>安装 · 权限 · UX · 专属扩展</b>
          </div>
        </Reveal>
        <Reveal step={4} className="plugin-bridge" motion="fade">
          <span>它们处理两个不同问题</span>
          <div>
            <b><em>Graph</em>运行时 / 这次任务怎样协作</b>
            <b><em>Plugin</em>交付时 / 这套能力怎样兼容</b>
          </div>
        </Reveal>
      </div>
    ),
  },
  {
    id: "control",
    section: "第二部分 / 我的实践",
    title: "先交代一下样本量",
    conclusion: "接近 230 亿 Token，是后面这些经验的样本量。",
    frameCount: 4,
    notes: [
      "进入第二部分之前，我先报一下样本量。",
      "过去 78 天，我用了 22.9B Token，接近 230 亿；单日峰值大约 12 亿。",
      "这组数字说明，后面的经验来自持续、高强度的使用，也来自一遍遍踩坑。",
      "用得越多，我越确定：生成早就够快了，接下来要守住的是对代码库的控制。故事从最初的复制粘贴开始。",
    ],
    visual: (
      <div className="practice-proof-layout">
        <div className="practice-proof-copy">
          <span>SECOND PART / FIELD EVIDENCE</span>
          <h1>22.9B</h1>
          <b>TOKENS</b>
          <Reveal step={1} className="practice-proof-scale" motion="fade">
            <strong>接近 230 亿</strong>
            <small>LIFETIME TOKEN USAGE</small>
          </Reveal>
          <Reveal step={2} className="practice-proof-stats">
            <div><b>78 DAYS</b><span>连续使用</span></div>
            <div><b>1.2B</b><span>单日峰值 / 约 12 亿</span></div>
          </Reveal>
        </div>
        <Reveal step={1} className="practice-proof-image" motion="fade">
          <div
            className="practice-proof-snapshot"
            role="img"
            aria-label="过去 78 天累计使用 22.9B Token 的使用统计截图"
            style={{
              backgroundImage: `url('${BASE_PATH}/images/token-usage.webp')`,
            }}
          />
          <span>USAGE SNAPSHOT / 78 DAYS</span>
        </Reveal>
        <Reveal step={3} className="practice-proof-thesis" motion="grow-x">
          <span>这组数字代表样本量</span>
          <strong>生成已经够快；接下来要守住的是控制力。</strong>
        </Reveal>
        <div className="practice-proof-rule" aria-hidden="true">
          <i />
          <span>REAL USAGE → FIELD NOTES</span>
        </div>
      </div>
    ),
  },
  {
    id: "manual-loop",
    section: "实践 / 第一阶段",
    title: "说完需求，然后“开始实现吧”",
    conclusion: "Agent 开始连续执行，我却成了状态检查员。",
    frameCount: 5,
    notes: [
      "想到一个功能，我就把需求告诉 Agent，然后说：开始实现吧。",
      "小功能做起来很顺，搜索、定位、修改和调试都能一口气完成。",
      "可连续执行也把中间状态藏了起来，我不知道它还要跑多久。",
      "每隔十几分钟，我就回来瞄一眼：做完了吗？卡住了吗？是不是在等我确认？",
      "以前是我自己干活，现在成了状态检查员。于是我开始找一个能一直跑到完成的 Agent Loop。",
    ],
    visual: (
      <div className="manual-layout">
        <div className="manual-trigger">
          <span>01 / HUMAN</span>
          <strong>想到一个功能</strong>
          <p>描述需求和期望结果</p>
          <blockquote>“开始实现吧”</blockquote>
        </div>
        <Reveal step={1} className="manual-handoff" motion="grow-x">
          <span>执行权交给 Agent</span>
          <i aria-hidden="true">→</i>
        </Reveal>
        <Reveal step={1} className="manual-agent">
          <header>
            <span>AGENT / CONTINUOUS EXECUTION</span>
            <strong>连续执行</strong>
          </header>
          <div className="manual-agent-flow">
            <div className="manual-agent-segment">
              <div className="manual-agent-step">
                <span>02</span>
                <b>搜索</b>
                <em>代码与文档</em>
              </div>
              <i aria-hidden="true">→</i>
              <div className="manual-agent-step">
                <span>03</span>
                <b>修改</b>
                <em>连续实现</em>
              </div>
            </div>
            <Reveal step={2} className="manual-agent-segment manual-agent-segment--finish">
              <i aria-hidden="true">→</i>
              <div className="manual-agent-step">
                <span>04</span>
                <b>运行</b>
                <em>测试与修复</em>
              </div>
              <i aria-hidden="true">→</i>
              <div className="manual-agent-step manual-agent-step--complete">
                <span>05</span>
                <b>完成</b>
                <em>交付功能</em>
              </div>
            </Reveal>
          </div>
          <Reveal step={3} className="manual-unknown" motion="fade">
            <span>中间状态不可见</span>
            <b>还要多久 · 是否卡住 · 是否在等确认</b>
          </Reveal>
        </Reveal>
        <Reveal step={3} className="manual-checkin">
          <span>06 / HUMAN RETURNS</span>
          <strong>回来看看</strong>
          <p>每隔十几分钟</p>
          <div><b>做完了吗？</b><em>UNKNOWN</em></div>
          <div><b>卡住了吗？</b><em>UNKNOWN</em></div>
          <div><b>在等我吗？</b><em>UNKNOWN</em></div>
        </Reveal>
        <Reveal step={4} className="manual-insight" motion="grow-x">
          <span>角色变化</span>
          <div className="manual-gain">
            <em>获得</em>
            <b>小功能做得更快</b>
          </div>
          <div className="manual-cost">
            <em>代价</em>
            <b>执行者 → 状态检查员</b>
          </div>
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
      "这时我遇到了 /goal。它会持续调用 Agent Loop，直到自己判断目标已经完成。",
      "工作流变成先 explore 或 brainstorming，再 propose，最后让 /goal 按 Spec 一直做下去。",
      "一次 Goal 能自己跑一两个小时。结束以后，我简单试一下功能，就马上开下一个 Goal。",
      "当时我满脑子都是吞吐量：多跑一会儿，少回来找我，更快进入下一个功能。",
      "我忽略了一件事：Loop 跑得越久，目标、边界、验证和停止条件就越不能含糊。",
    ],
    visual: (
      <div className="agent-layout">
        <div className="ghost-loop">
          <span>想一个功能</span>
          <span>开始实现</span>
          <span>回来查看</span>
        </div>
        <div
          className="agent-pipeline"
          aria-label="从探索和方案生成进入 goal，再由 Agent Loop 持续执行"
        >
          {[
            { title: "/opsx:explore", detail: "或 brainstorming" },
            { title: "/opsx:propose", detail: "生成方案" },
            { title: "/goal", detail: "按 Spec 实现" },
            { title: "Agent Loop", detail: "持续执行" },
          ].map((item, index, items) => (
            <Reveal
              key={item.title}
              step={1}
              className="agent-pipeline__stage"
            >
              <Node
                index={`0${index + 1}`}
                title={item.title}
                detail={item.detail}
                tone={index === items.length - 1 ? "active" : "default"}
              />
              {index < items.length - 1 ? (
                <span className="agent-pipeline__arrow" aria-hidden="true">
                  →
                </span>
              ) : null}
            </Reveal>
          ))}
        </div>
        <Reveal
          step={2}
          className="agent-loop-track"
          motion="grow-x"
        >
          <span>根据 Spec 持续实现</span>
          <b>↻ 直到目标完成</b>
          <span>自主执行 / 一次持续 1–2 小时</span>
        </Reveal>
        <Reveal step={3} className="agent-tradeoff">
          <div>
            <span>吞吐量</span>
            <strong>更高</strong>
          </div>
          <div>
            <span>人工介入</span>
            <strong>更少</strong>
          </div>
          <div className="agent-tradeoff__risk">
            <span>同时被放大</span>
            <strong>边界 · 验证 · 停止条件</strong>
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
    title: "一个周末：两个 Goal，跑了约 20 小时",
    conclusion: "功能做出来了，代码库里却留下几套对不上的逻辑。",
    frameCount: 6,
    notes: [
      "这些问题在一个周末集中爆发，代码库给我算了一次总账。",
      "这张 Code Frequency 很直观：AI 写得快，改得也快，代码增删量在短时间里突然冲高。",
      "两个 Goal 一共跑了大约 20 个小时。",
      "接近一千个 Commit、几十个 PR，功能看上去都做完了。",
      "可吞吐量越高，我越看不清执行过程和中间状态。",
      "旧路径、中间状态和重复逻辑混在一起。功能完成了，工程没有完成，项目事实上已经失控。",
    ],
    visual: (
      <div className="incident-layout">
        <div className="incident-goals">
          <code>GOAL / 01</code>
          <span>+</span>
          <code>GOAL / 02</code>
          <span>→</span>
          <strong>整个周末 / 约 20H 持续执行</strong>
        </div>
        <div className="incident-evidence">
          <Reveal step={1} className="incident-frequency" motion="fade">
            <div
              className="incident-frequency__image"
              role="img"
              aria-label="代码增删频率在短时间内显著冲高的统计图"
              style={{
                backgroundImage: `url('${BASE_PATH}/images/Code%20frequency.png')`,
              }}
            />
          </Reveal>
          <div className="incident-story">
            <Reveal step={2} className="incident-speed">
              <span>WRITE / FAST</span>
              <strong>20H</strong>
              <p>两个 Goal 持续执行</p>
            </Reveal>
            <Reveal step={3} className="incident-throughput">
              <div>
                <strong>近千</strong>
                <span>COMMIT</span>
              </div>
              <div>
                <strong>数十</strong>
                <span>PR</span>
              </div>
              <p>功能需求基本完成</p>
            </Reveal>
            <Reveal step={4} className="incident-control-loss">
              <span>CONTROL / LOST</span>
              <strong>功能完成 ≠ 工程完成</strong>
              <p>吞吐量上升，可见性下降</p>
            </Reveal>
          </div>
        </div>
        <Reveal step={5} className="incident-debt-line" motion="grow-x">
          <span>功能之外，还留下</span>
          {["旧路径", "中间状态", "重复逻辑", "历史路径", "持续返工"].map((item) => (
            <div key={item}>
              <b>{item}</b>
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
    conclusion: "执行能力上去以后，控制关系也要一起补上。",
    frameCount: 5,
    notes: [
      "功能虽然做出来了，我却已经无法判断下一步该改哪里。最后只能停下来，用整整一周重构。",
      "我先换掉技术栈，切断已经维护不下去的旧路径。",
      "然后重建唯一主路径，让后续改动知道该落在哪里。",
      "模块边界重新清楚以后，我才恢复了对系统的理解。",
      "这次重构让我明白：执行能力上去以后，需求、边界、上下文、测试、Hook 和 Review 也要一起补上。",
    ],
    visual: (
      <div className="gates-layout">
        <div className="rail rail--actual">
          <span>重构之前</span>
          <i />
          <b>新旧逻辑混杂</b>
          <b>主路径不清</b>
          <b>边界模糊</b>
          <b className="danger">无法继续判断</b>
        </div>
        <div className="rail rail--controlled">
          <span>一周重构</span>
          <i />
          <Reveal step={1}><b>改变技术栈</b></Reveal>
          <Reveal step={2}><b>重建主路径</b></Reveal>
          <Reveal step={3}><b>明确模块边界</b></Reveal>
          <Reveal step={3}><b>恢复系统理解</b></Reveal>
        </div>
        <Reveal step={4} className="rebuild-principle" motion="fade">
          <span>GRAPH ENGINEERING / PRACTICE</span>
          <strong>执行能力上去以后，控制关系也要一起补上</strong>
          <p>清晰需求 · 明确边界 · 正确上下文 · 测试 · Hook · 人工 Review</p>
        </Reveal>
      </div>
    ),
  },
  {
    id: "gates",
    section: "经验 01 / 需求",
    title: "开发者正在变成技术产品经理",
    conclusion: "让 AI 先拆、再问，我才知道它是不是真的听懂了。",
    frameCount: 5,
    notes: [
      "第一条经验很简单：先把需求搞明白。这往往比写代码更费时间。",
      "以前是产品经理讲需求，开发再确认范围、工时和排期。",
      "现在轮到开发者讲产品目标，让 AI 先拆出功能点、模块、分期和风险。",
      "接着用 Grill Me 让它追着问。AI 问不出关键问题，我就不敢假设它真的听懂了。",
      "开发者的位置也变了：我们逐渐成了 AI 与最终产品之间的技术产品经理。",
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
          <b>描述产品目标</b>
          <i aria-hidden="true">→</i>
          <strong>AI</strong>
          <small>AI 先拆出：功能点 · 模块 · 分期 · 风险</small>
        </Reveal>
        <Reveal step={3} className="grill-card">
          <span>GRILL ME</span>
          <strong>别急着写。先追着我问。</strong>
          <div>
            <b>真正目标是什么？</b>
            <b>哪些内容明确不做？</b>
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
    title: "分阶段，把边界写下来",
    conclusion: "每一期既要写做什么，也要写不做什么。",
    frameCount: 5,
    notes: [
      "任务大到一定程度，就该拆期，计划也要写进文档。",
      "比如第一期只做用户注册，那就明写：不要实现登录。",
      "不拦着，Agent 很可能顺手把登录也做了，最后留下两套对不上的逻辑。",
      "功能边界之外，技术栈、测试、部署和文档版本也要定清楚。",
      "任务活多久、风险多大、以后要不要维护，决定了我们该付多少结构成本。",
    ],
    visual: (
      <div className="risk-layout phase-layout">
        <div className="risk-axis">
          <span>一个大需求</span>
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
    conclusion: "关系画出来以后，并行、依赖和关卡都能检查。",
    frameCount: 4,
    notes: [
      "一段长文字里经常藏着顺序、条件、异常和角色，人和 AI 都容易漏。",
      "我一般直接让 AI 用 Mermaid 或 HTML 把它画出来。",
      "关系一上图，哪里并行、谁要等谁、哪里会重试、哪里必须人工确认，一眼就能看到。",
      "图的价值就在这里：把隐含关系摆到台面上，控制问题才有得检查。",
    ],
    visual: (
      <div className="diagram-layout">
        <div className="diagram-source">
          <span>自然语言 / 隐含关系</span>
          <blockquote>
            提交后，前端与后端分别处理；后端失败就修复重试，成功后进入测试；
            高风险结果等待人工确认。
          </blockquote>
          <div>
            <b>并行？</b>
            <b>依赖？</b>
            <b>循环？</b>
            <b>谁确认？</b>
          </div>
        </div>
        <Reveal step={1} className="diagram-conversion" motion="fade">
          <span>MERMAID<br />/ HTML</span>
          <strong>→</strong>
        </Reveal>
        <Reveal
          step={2}
          className="diagram-canvas"
        >
          <span className="diagram-rel-label diagram-rel-label--parallel">并行</span>
          <span className="diagram-rel-label diagram-rel-label--join">依赖汇合</span>
          <div className="diagram-node diagram-node--start">提交需求</div>
          <div className="diagram-node diagram-node--front">前端处理</div>
          <div className="diagram-node diagram-node--back">后端处理</div>
          <div className="diagram-node diagram-node--test">
            <b>自动测试</b>
            <small>验证关卡</small>
          </div>
          <div className="diagram-node diagram-node--human">
            <b>人工确认</b>
            <small>高风险</small>
          </div>
          <i className="diagram-edge diagram-edge--one" />
          <i className="diagram-edge diagram-edge--two" />
          <i className="diagram-edge diagram-edge--three" />
          <i className="diagram-edge diagram-edge--four" />
          <i className="diagram-edge diagram-edge--five" />
          <span className="diagram-loop">失败 → 修复 → 重试</span>
        </Reveal>
        <Reveal step={3} className="diagram-benefit" motion="fade">
          <span>关系画出来以后</span>
          <strong>并行 · 依赖 · 循环 · 人工关卡，都能检查</strong>
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
      "Spec 要写，它告诉 Agent 准备做什么。",
      "可一旦开始高频修改，能守住旧行为、告诉它什么不能碰的，往往是测试。",
      "文档可能过期，也可能被理解成另一回事；测试失败就直接得多。",
      "单元测试、集成测试和 E2E，比一句自然语言提醒更靠得住。",
      "测试全绿也不能证明最终结果一定正确，但模型说一句完成了，不算证据。",
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
          <span>测试给出的答案</span>
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
      "Vibe Coding 很像一种间歇奖励。",
      "输入几句需求，功能突然跑起来，就像在河边等了半小时，突然有鱼上钩。",
      "一会儿联调，一会儿切项目，中间还得到处翻文档，很难进入稳定状态。",
      "我更喜欢在本地搭一个随时能验证的完整环境，同时在范围、预算、验证和合并处留好关卡。",
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
          <span>我想要的环境</span>
          <strong>本地前后端一致 · 快速验证 · 必要时使用 Mock</strong>
          <small>心流 ≠ Agent 无限运行</small>
        </Reveal>
      </div>
    ),
  },
  {
    id: "current-loop",
    section: "经验 06 / Hook",
    title: "用 Hook 把边界写成规则",
    conclusion: "能让系统执行的约束，就别只靠模型记住。",
    frameCount: 5,
    notes: [
      "主流 Coding Agent 都支持不同形式的 Hook。",
      "比如这次任务只能改后端，或者可以改生产代码，但不能碰测试。",
      "这些要求只写在 Prompt 里，Agent 一遇到困难，还是可能走最短路径。",
      "Hook 会在它准备写入禁止目录时直接拦住。",
      "Prompt 只是提高它守边界的概率，Hook 会把边界写成系统规则。",
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
    title: "先找到权威文档，再读取实现",
    conclusion: "最近的 README 管模块，Architecture 管跨模块关系；Fingerprint 只提醒你重新检查。",
    frameCount: 6,
    notes: [
      "我的工程文档按“事实该归谁管”组织，入口是 docs/README.md。",
      "模块职责、接口和不变量归最近祖先 README；没有独立边界的目录，不额外配文档。",
      "跨模块流程和 Authority 归 Architecture，精确命令与数据形状归 API，长期决策的原因写进 ADR。",
      "同一个事实只认一个权威来源；docs/local 和 archive 不进入正式事实链。",
      "文档新鲜度分两层：模块 README 自动认领最近目录，Architecture 用 doc-watch 明写依赖。",
      "pre-commit 只看 staged 内容。指纹过期就拦住提交，让 Agent 重读正文并刷新；CI 再用 clean checkout 兜底。",
    ],
    visual: (
      <div className="docs-map-layout">
        <div className="docs-entry">
          <span>DOCUMENT ENTRY</span>
          <strong>docs/README.md</strong>
          <small>文档索引 · 阅读路径 · 事实归属</small>
        </div>
        <div className="docs-authority-map">
          <Reveal step={1} className="docs-authority-row docs-authority-row--active">
            <span>01 / MODULE CONTRACT</span>
            <code>nearest README.md</code>
            <strong>职责 · 接口 · 不变量</strong>
            <small>自动拥有最近目录下的 tracked files</small>
          </Reveal>
          <Reveal step={2} className="docs-authority-row">
            <span>02 / ARCHITECTURE</span>
            <code>docs/architecture/*.md</code>
            <strong>跨模块流程 · Authority</strong>
            <small>doc-watch 显式声明依赖</small>
          </Reveal>
          <Reveal step={3} className="docs-authority-row">
            <span>03 / REFERENCE</span>
            <code>docs/api/</code>
            <strong>命令 · 事件 · 数据形状</strong>
            <small>精确接口只在这里维护</small>
          </Reveal>
          <Reveal step={3} className="docs-authority-row">
            <span>04 / DECISION</span>
            <code>docs/decisions/</code>
            <strong>为什么这样选</strong>
            <small>记录替代方案与长期后果</small>
          </Reveal>
        </div>
        <Reveal step={4} className="docs-source-rule" motion="grow-x">
          <b>ONE FACT → ONE AUTHORITATIVE HOME</b>
          <span>docs/local / archive 不进入正式 freshness check</span>
        </Reveal>
        <Reveal step={5} className="doc-freshness-gate" motion="fade">
          <div className="doc-freshness-intro">
            <div>
              <span>DOCUMENT FRESHNESS / TWO LAYERS</span>
              <strong>两类文档，各管一层</strong>
            </div>
            <p>
              Fingerprint 不会替你写文档；它只要求 <b>代码变了，文档必须重新确认</b>。
            </p>
          </div>
          <div className="doc-freshness-lanes">
            <div>
              <span>MODULE README</span>
              <strong>最近祖先 README 自动拥有目录</strong>
              <code>tracked module files</code>
              <small>module-fingerprint</small>
            </div>
            <div>
              <span>ARCHITECTURE</span>
              <strong>doc-watch 显式列出来源</strong>
              <code>docs/architecture/*.md</code>
              <small>architecture-fingerprint</small>
            </div>
          </div>
          <div className="doc-freshness-flow">
            <div>
              <span>01 / INDEX</span>
              <strong>只读 staged 内容</strong>
              <small>工作区无关变化不进入 hash</small>
            </div>
            <div>
              <span>02 / RECOMPUTE</span>
              <strong>重算 SHA-256</strong>
              <small>Module 按 affected · Architecture 全量</small>
            </div>
            <div className="is-blocked">
              <span>03 / STALE</span>
              <strong>阻止提交</strong>
              <small>缺失、格式错误或过期都失败</small>
            </div>
            <div className="is-passed">
              <span>04 / REVIEW</span>
              <strong>更新正文 + 刷新</strong>
              <small>Agent Review 后 pre-commit 才放行</small>
            </div>
          </div>
          <div className="doc-freshness-boundary">
            <b>Fingerprint 只证明重新 Review 过，不证明正文一定正确。</b>
            <span>pre-commit 拦截 · CI clean checkout 再兜底</span>
          </div>
        </Reveal>
      </div>
    ),
  },
  {
    id: "work-shift",
    section: "经验 07 / AGENTS.md",
    title: "把吃过的亏写进 AGENTS.md",
    conclusion: "模型和 Skill 会换，简单、边界、根因与验证不会过期。",
    frameCount: 5,
    notes: [
      "反复出现的问题如果一直散在聊天记录里，下一次还得从头再教。",
      "我会自己记，也会让 Agent 回看本地会话，找出它经常在哪儿出错。",
      "值得长期留下的约束，就写进 AGENTS.md。目前我的版本有九条。",
      "这份文件不是一次写完的。哪里吃了亏，我就补一条。",
      "同一个问题反复出现，就把规则再写明确一点。",
    ],
    visual: (
      <div className="agents-layout">
        <div className="agents-file">
          <span>PROJECT ROOT</span>
          <strong>AGENTS.md</strong>
          <small>一份会跟着项目一起更新的工程约束</small>
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
          <span>一次失误</span><i>→</i><span>一条规则</span><i>→</i><strong>以后自动生效</strong>
        </Reveal>
      </div>
    ),
  },
  {
    id: "taste",
    section: "实践 / 当前工作流",
    title: "我现在怎么 Vibe Coding",
    conclusion: "Agent 可以执行；Comment 值不值得改、最后要不要 Merge，仍由人决定。",
    frameCount: 6,
    notes: [
      "细节连我自己都没想清楚时，我不会马上叫 Agent 开写。先用 Grill Me，让它追着问。",
      "问题问得差不多了，再把需求和边界写进设计文档，然后开始实现和测试。",
      "测试通过后提交 PR，等待 CI 和自动触发的 Codex Code Review。",
      "Review Comment 我会自己判断，说得有道理就继续修。",
      "只是泛泛而谈，或者会把事情搞复杂，就忽略，必要时解释原因。",
      "继续修改还是 Merge，最后由我决定。",
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
          <span>最后由人判断</span>
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
    conclusion: "方法讲完，下面直接看成品。",
    frameCount: 5,
    notes: [
      "方法先讲到这里。下面别听我说，直接看东西。",
      "接下来这个演示，3A 是我自己封的。",
      "代码是 AI 写的。",
      "图片是 AI 画的。",
      "音频也是 AI 做的。预算没有 3A，AI 倒是有三个。停顿一下，再进入演示。",
    ],
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
        <Reveal step={1} className="demo-ai-curtain" motion="fade">
          <div className="demo-ai-intro">
            <span>接下来 / 60 秒</span>
            <strong>这个演示，<em>3A</em> 是我自己封的。</strong>
          </div>
          <div className="demo-ai-credits">
            <Reveal step={2} className="demo-ai-credit">
              <span>01 / CODE</span>
              <strong>代码</strong>
              <b><em>AI</em> 写的</b>
            </Reveal>
            <Reveal step={3} className="demo-ai-credit">
              <span>02 / IMAGE</span>
              <strong>图片</strong>
              <b><em>AI</em> 画的</b>
            </Reveal>
            <Reveal step={4} className="demo-ai-credit">
              <span>03 / AUDIO</span>
              <strong>音频</strong>
              <b><em>AI</em> 做的</b>
            </Reveal>
          </div>
          <Reveal step={4} className="demo-ai-punchline" motion="grow-x">
            <span>预算没有 3A</span>
            <strong>AI 倒是有三个。</strong>
          </Reveal>
        </Reveal>
      </div>
    ),
  },
  {
    id: OPENING_DEMO_SLIDE_ID,
    section: "演示 / 产品动画",
    title: "产品动画演示",
    conclusion: "按任意键或点击，即可开始动画。",
    frameCount: 1,
    notes: [
      "观众视图保持黑屏并等待启动；按任意键或点击开始，Shift + → 或 Shift + End 可直接跳到下一页。",
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
    title: "能生成、能运行，还不等于值得留下",
    conclusion: "AI 可以多给方案，Taste 决定哪一个能进系统。",
    frameCount: 6,
    notes: [
      "刚才的 Demo 里，代码、画面和声音都由 AI 生成。生成这件事越来越便宜了。",
      "画面里的两个实现都能跑，也都能通过测试，工程代价却完全不同。",
      "左边为了想象中的未来提前加了抽象。",
      "后来兼容层和旧入口越堆越多，每个局部都有道理，合起来却成了负担。",
      "右边复用现有领域服务，只留一个入口。结果一样，却更适合这个系统。",
      "Taste 也包括会拒绝、会删除，知道什么不该进入系统。",
    ],
    visual: (
      <div className="taste-layout">
        <div className="implementation implementation--works">
          <span>局部正确</span>
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
          <span>整体适合</span>
          <b>测试通过</b>
          <div className="code-tree">
            <i>Feature</i>
            <Reveal step={4}>
              <i className="active">ExistingDomainService</i>
              <i className="active">SingleEntry</i>
            </Reveal>
          </div>
        </div>
        <Reveal step={1} className="same-output">同样通过测试 / 工程代价不同</Reveal>
        <Reveal step={5} className="taste-quote" motion="fade">
          <strong>TASTE IS WHAT YOU<br />REFUSE AND REMOVE.</strong>
          <span>Taste 也包括会拒绝、会删除。</span>
        </Reveal>
      </div>
    ),
  },
  {
    id: "lessons",
    section: "总结 / 三条经验",
    title: "我的三条核心经验",
    conclusion: "工具会换；需求、规则和判断会一直积累。",
    frameCount: 4,
    notes: [
      "最后，把前面的实践收成三条。",
      "第一，先讲清什么才算正确，再用边界、测试和 Hook 管住执行。",
      "第二，把反复踩过的坑写进 AGENTS.md，让一次教训在下次自动生效。",
      "第三，多看 Diff、多读优秀设计、多做取舍，慢慢练出自己的 Taste。",
    ],
    visual: (
      <div className="lessons-layout">
        {[
          { label: "需求与边界", text: "先讲清什么算正确，再放大执行" },
          { label: "以后自动生效", text: "把踩过的坑写进 AGENTS.md" },
          { label: "工程判断", text: "多看 Diff，多做取舍，慢慢练 Taste" },
        ].map((item, index) => (
          <Reveal step={index + 1} key={item.label} className="lesson-row">
            <span>0{index + 1}</span>
            <div>
              <em>{item.label}</em>
              <b>{item.text}</b>
            </div>
          </Reveal>
        ))}
      </div>
    ),
  },
  {
    id: "closing",
    section: "总结 / 重新汇合",
    title: "把执行交给 AI，把工程判断留在人手里",
    conclusion: "执行越便宜，判断越重要。",
    frameCount: 4,
    notes: [
      "前面讲的 Graph、Plugin 和我的失控经历，最后汇到了同一个地方。",
      "我们的工程对象已经包括代码，也包括能力怎样被组织、运行和约束。",
      "AI 可以接手越来越多执行，但目标、约束、证据和完成标准不能也一起交出去。",
      "执行越便宜，判断反而越贵。把执行交给 AI，把工程判断留在人手里。",
    ],
    visual: (
      <div className="closing-layout">
        <div className="closing-loop">
          {["目标", "约束", "执行", "证据", "判断"].map((item, index) => (
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
          系统 + 人 / 目标 · 约束 · 证据 · 判断
        </Reveal>
        <Reveal step={3} className="final-statement" motion="fade">
          <strong>
            DELEGATE EXECUTION.
            <br />
            KEEP THE RIGHT TO JUDGE.
          </strong>
          <span>执行越便宜，判断越重要。</span>
          <em>谢谢大家 / THANK YOU</em>
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
  const [openingReady, setOpeningReady] = useState(false);
  const [mediaUnlocked, setMediaUnlocked] = useState(mode === "presenter");
  const channelRef = useRef<BroadcastChannel | null>(null);
  const sourceIdRef = useRef("");
  const audienceStageRef = useRef<HTMLDivElement>(null);

  const currentSlide = slides[pageIndex];
  const currentFrame = frames[pageIndex];
  const isOpeningDemoSlide = currentSlide.id === OPENING_DEMO_SLIDE_ID;
  const openingActive =
    mode === "audience" && (isOpeningDemoSlide || openingExiting);

  useEffect(() => {
    if (mode !== "audience") return;

    let mounted = true;
    void preloadOpeningAssets().then((ready) => {
      if (mounted) setOpeningReady(ready);
    });
    return () => {
      mounted = false;
    };
  }, [mode]);

  useEffect(() => {
    if (mode !== "audience") return;

    const stage = audienceStageRef.current;
    if (!stage) return;

    const fitStageToViewport = () => {
      const scale = Math.min(
        window.innerWidth / PRESENTATION_WIDTH,
        window.innerHeight / PRESENTATION_HEIGHT,
      );
      stage.style.setProperty("--presentation-scale", String(scale));
    };

    fitStageToViewport();
    window.addEventListener("resize", fitStageToViewport);
    return () => window.removeEventListener("resize", fitStageToViewport);
  }, [mode]);

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

      if (
        mode === "presenter" &&
        isOpeningDemoSlide &&
        isOpeningSkipShortcut(event)
      ) {
        event.preventDefault();
        movePage(1);
      } else if (event.key === "ArrowRight") {
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
  }, [
    isOpeningDemoSlide,
    mode,
    moveFrame,
    movePage,
    openingActive,
  ]);

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
            href={`${BASE_PATH}/#/page/${pageIndex}/frame/${currentFrame}`}
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
      <div ref={audienceStageRef} className="presentation-stage">
        {deck}
        {openingActive ? (
          <OpeningSequence
            ready={openingReady}
            mediaUnlocked={mediaUnlocked}
            onComplete={completeOpening}
            onExitStart={prepareOpeningExit}
          />
        ) : null}
        {!mediaUnlocked ? (
          <button
            type="button"
            autoFocus
            onClick={() => setMediaUnlocked(true)}
            aria-label="开始演示并启用声音"
            style={{
              position: "absolute",
              zIndex: 400,
              inset: 0,
              display: "grid",
              width: "100%",
              height: "100%",
              border: 0,
              color: "#f5f7f7",
              background: "#090d0f",
              cursor: "pointer",
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "0.14em",
              placeContent: "center",
              textTransform: "uppercase",
            }}
          >
            开始演示 · 启用声音
          </button>
        ) : null}
      </div>
    </div>
  );
}
