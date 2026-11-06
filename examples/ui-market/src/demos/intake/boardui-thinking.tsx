import { useState } from "react";
import {
  AgentThinking,
  type AgentThinkingVariant,
} from "../../vendor/boardui/agent-thinking";
import { Stage, text } from "./shared";
const variants: AgentThinkingVariant[] = ["wave", "spin", "stars", "infinity"];
export default function Demo() {
  const [variant, setVariant] = useState<AgentThinkingVariant>("wave");
  const [paused, setPaused] = useState(false);
  const labels = [
    text("波浪", "Wave"),
    text("旋转", "Spin"),
    text("星芒", "Stars"),
    text("无限", "Infinity"),
  ];
  return (
    <Stage className="boardui-demo">
      <div className="intake-card" data-paused={paused}>
        <h2 className="intake-heading">
          {text("思考中的细节", "A moment of thought")}
        </h2>
        <p className="intake-caption">
          {text(
            "同一段等待，四种表达方式。",
            "Four ways to give a waiting state its own rhythm.",
          )}
        </p>
        <div className="boardui-indicator">
          <AgentThinking
            key={variant}
            variant={variant}
            label={text("正在整理思路", "Thinking it through")}
            paused={paused}
          />
        </div>
        <div className="intake-controls">
          <select
            aria-label={text("指示器样式", "Indicator style")}
            value={variant}
            onChange={(event) =>
              setVariant(event.target.value as AgentThinkingVariant)
            }
          >
            {variants.map((v, i) => (
              <option key={v} value={v}>
                {labels[i]}
              </option>
            ))}
          </select>
          <button
            className="intake-control"
            type="button"
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
