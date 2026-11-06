import { useState } from "react";
import { ThinkingOrb } from "../../vendor/libraries-dev/thinking-orbs/ThinkingOrb";
import type { OrbState } from "../../vendor/libraries-dev/thinking-orbs/types";
import { Stage, text } from "./shared";
const states: OrbState[] = [
  "working",
  "searching",
  "solving",
  "listening",
  "connecting",
  "weaving",
  "composing",
  "breathing",
  "shaping",
];
export default function Demo() {
  const [state, setState] = useState<OrbState>("solving"),
    [paused, setPaused] = useState(false);
  const labels = [
    text("处理中", "Working"),
    text("搜索中", "Searching"),
    text("求解中", "Solving"),
    text("聆听中", "Listening"),
    text("连接中", "Connecting"),
    text("编织中", "Weaving"),
    text("构思中", "Composing"),
    text("呼吸", "Breathing"),
    text("塑形中", "Shaping"),
  ];
  return (
    <Stage>
      <div className="intake-card">
        <h2 className="intake-heading">
          {text("等待也有形状", "Give waiting a shape")}
        </h2>
        <p className="intake-caption">
          {text(
            "粒子、线条与深度，九种思考状态。",
            "Particles, strands and depth. Nine distinct states.",
          )}
        </p>
        <div className="intake-orb">
          <div className="intake-orb-pill">
            <ThinkingOrb
              state={state}
              size={64}
              paused={paused}
              aria-hidden="true"
            />
            <span role="status">{labels[states.indexOf(state)]}…</span>
          </div>
        </div>
        <div className="intake-controls">
          <label>
            <span className="sr-only">{text("光球状态", "Orb state")}</span>
            <select
              aria-label={text("光球状态", "Orb state")}
              value={state}
              onChange={(e) => setState(e.target.value as OrbState)}
            >
              {states.map((s, i) => (
                <option value={s} key={s}>
                  {labels[i]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="intake-control"
            aria-pressed={paused}
            onClick={() => setPaused(!paused)}
          >
            {paused ? text("播放", "Play") : text("暂停", "Pause")}
          </button>
        </div>
      </div>
    </Stage>
  );
}
