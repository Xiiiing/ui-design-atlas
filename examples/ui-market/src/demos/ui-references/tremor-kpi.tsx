import { IconChartBar } from "@tabler/icons-react";
import { useState } from "react";
import { ProgressBar } from "../../vendor/tremor/src/components/ProgressBar/ProgressBar";
import { copy, ReferencePanel } from "./shared";

const periods = {
  week: { value: 72, target: 100 },
  month: { value: 318, target: 400 },
};

export default function TremorKpi() {
  const [period, setPeriod] = useState<keyof typeof periods>("week");
  const { value, target } = periods[period];
  const percent = Math.round((value / target) * 100);
  const label = copy("完成交付", "Deliveries completed");

  return (
    <ReferencePanel
      title={copy("交付进度", "Delivery progress")}
      icon={<IconChartBar aria-hidden="true" />}
    >
      <div
        className="refs-segments"
        role="group"
        aria-label={copy("周期", "Period")}
      >
        <button
          className="refs-btn"
          aria-pressed={period === "week"}
          onClick={() => setPeriod("week")}
        >
          {copy("本周", "This week")}
        </button>
        <button
          className="refs-btn"
          aria-pressed={period === "month"}
          onClick={() => setPeriod("month")}
        >
          {copy("本月", "This month")}
        </button>
      </div>
      <div className="refs-kpi">
        <p>{label}</p>
        <p className="refs-kpi-value" aria-live="polite">
          <strong>{value}</strong> <span>/ {target}</span>
        </p>
        <ProgressBar
          aria-label={label}
          value={value}
          max={target}
          label={`${percent}%`}
          showAnimation
        />
      </div>
    </ReferencePanel>
  );
}
