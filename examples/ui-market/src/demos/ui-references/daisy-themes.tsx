import { IconPalette } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { copy, ReferencePanel } from "./shared";
import "./daisy.css";

export default function DaisyThemes() {
  const { resolvedTheme } = useTheme();
  const [theme, setTheme] = useState("auto");
  const [saved, setSaved] = useState(false);

  return (
    <ReferencePanel
      title={copy("主题切换", "Theme switcher")}
      description={copy(
        "用同一张卡片比较主题的颜色、边框和圆角。",
        "Compare colors, borders and corner radii on one card.",
      )}
      icon={<IconPalette aria-hidden="true" />}
    >
      <div
        className="refs-daisy"
        data-theme={theme === "auto" ? resolvedTheme || "light" : theme}
      >
        <label className="refs-theme-label">
          {copy("预览主题", "Preview theme")}
          <select
            className="du-select"
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
          >
            <option value="auto">{copy("跟随图鉴", "Follow Atlas")}</option>
            <option value="light">{copy("浅色", "Light")}</option>
            <option value="dark">{copy("深色", "Dark")}</option>
            <option value="nord">Nord</option>
            <option value="sunset">Sunset</option>
          </select>
        </label>
        <div className="du-card refs-theme-card">
          <div>
            <strong>{copy("设计评审", "Design review")}</strong>
            <span className="du-badge du-badge-secondary">
              {copy("草稿", "Draft")}
            </span>
          </div>
          <progress
            className="du-progress du-progress-primary"
            value={60}
            max={100}
            aria-label={copy("评审进度", "Review progress")}
          />
          <button
            className="du-btn du-btn-primary"
            aria-pressed={saved}
            onClick={() => setSaved(!saved)}
          >
            {saved ? copy("已收藏", "Saved") : copy("收藏", "Save")}
          </button>
        </div>
      </div>
    </ReferencePanel>
  );
}
