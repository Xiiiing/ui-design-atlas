import { useState } from "react";
import {
  ContextMeter,
  type MeterStyle,
} from "../../vendor/bencho/ContextMeter";
import "../../vendor/bencho/ContextMeter.css";
import { Stage, text } from "./shared";
export default function Demo() {
  const [style, setStyle] = useState<MeterStyle>("Field");
  const [mono, setMono] = useState(false);
  const labels = {
    Context: text("上下文", "Context"),
    Compact: text("压缩", "Compact"),
    Undo: text("撤销", "Undo"),
    System: text("系统", "System"),
    Tools: text("工具", "Tools"),
    Files: text("文件", "Files"),
    Chat: text("对话", "Chat"),
    Memory: text("记忆", "Memory"),
    of: text("容量", "of"),
  };
  return (
    <Stage className="bencho-demo">
      <div data-stroke="on">
        <ContextMeter
          style={style}
          colour={mono ? "Mono" : "Colour"}
          labels={labels}
        />
      </div>
      <div
        className="intake-controls"
        role="group"
        aria-label={text("显示方式", "Display mode")}
      >
        {(["Field", "Bar"] as MeterStyle[]).map((s) => (
          <button
            className="intake-control"
            type="button"
            key={s}
            aria-pressed={style === s}
            onClick={() => setStyle(s)}
          >
            {s === "Field" ? text("点阵", "Field") : text("条形", "Bar")}
          </button>
        ))}
        <button
          className="intake-control"
          type="button"
          aria-pressed={mono}
          onClick={() => setMono(!mono)}
        >
          {text("单色", "Monochrome")}
        </button>
      </div>
      <p className="intake-caption" style={{ textAlign: "center" }}>
        {text(
          "固定示例数据，压缩只改变本页展示。",
          "Fixed demo data. Compact only changes this preview.",
        )}
      </p>
    </Stage>
  );
}
