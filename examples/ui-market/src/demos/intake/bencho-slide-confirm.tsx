import { SlideConfirm } from "../../vendor/bencho/SlideConfirm";
import "../../vendor/bencho/SlideConfirm.css";
import { Stage, text } from "./shared";
export default function Demo() {
  return (
    <Stage className="bencho-demo">
      <div className="intake-card" data-stroke="on">
        <SlideConfirm
          width={240}
          label={text("滑动确认", "Slide to confirm")}
          confirmedLabel={text("已确认", "Confirmed")}
        />
        <p className="intake-caption" style={{ textAlign: "center" }}>
          {text(
            "也可聚焦手柄后按 Enter 或空格；完成后自动复位。",
            "Focus the handle and press Enter or Space. Resets after confirmation.",
          )}
        </p>
      </div>
    </Stage>
  );
}
