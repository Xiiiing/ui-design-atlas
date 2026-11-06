import { useState } from "react";
import {
  FrequencySelector,
  type FrequencyData,
} from "../../vendor/watermelon-ui/frequency-selector";
import { Stage, text } from "./shared";
export default function Demo() {
  const [value, setValue] = useState<FrequencyData>({
    type: "Weekly",
    subValue: "Tue",
  });
  const labels = {
    Frequency: text("重复频率", "Frequency"),
    Daily: text("每天", "Daily"),
    Weekly: text("每周", "Weekly"),
    Monthly: text("每月", "Monthly"),
    Yearly: text("每年", "Yearly"),
    "Confirm frequency": text("确认频率", "Confirm frequency"),
    Sun: text("日", "Sun"),
    Mon: text("一", "Mon"),
    Tue: text("二", "Tue"),
    Wed: text("三", "Wed"),
    Thu: text("四", "Thu"),
    Fri: text("五", "Fri"),
    Sat: text("六", "Sat"),
    Jan: text("1月", "Jan"),
    Feb: text("2月", "Feb"),
    Mar: text("3月", "Mar"),
    Apr: text("4月", "Apr"),
    May: text("5月", "May"),
    Jun: text("6月", "Jun"),
    Jul: text("7月", "Jul"),
    Aug: text("8月", "Aug"),
    Sep: text("9月", "Sep"),
    Oct: text("10月", "Oct"),
    Nov: text("11月", "Nov"),
    Dec: text("12月", "Dec"),
  };
  return (
    <Stage>
      <h2 className="intake-heading" style={{ textAlign: "center" }}>
        {text("从一句话展开", "From a pill to a picker")}
      </h2>
      <p className="intake-caption" style={{ textAlign: "center" }}>
        {text(
          "选择周期和日期，确认后收起；Escape 取消。",
          "Pick a period and date, then confirm. Escape cancels.",
        )}
      </p>
      <div style={{ minHeight: 300, display: "flex", alignItems: "center" }}>
        <FrequencySelector value={value} onChange={setValue} labels={labels} />
      </div>
      <output className="intake-status">
        {labels[value.type]}
        {value.subValue
          ? " · " +
            (labels[value.subValue as keyof typeof labels] || value.subValue)
          : ""}
      </output>
    </Stage>
  );
}
