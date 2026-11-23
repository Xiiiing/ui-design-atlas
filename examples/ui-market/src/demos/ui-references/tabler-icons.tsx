import { useState } from "react";
import {
  IconArrowUpRight,
  IconBell,
  IconBookmark,
  IconCalendar,
  IconCheck,
  IconDownload,
  IconFolder,
  IconGridDots,
  IconSearch,
  IconSettings,
  IconStar,
} from "@tabler/icons-react";
import { copy, ReferencePanel } from "./shared";

const icons = [
  { id: "arrow-up-right", zh: "右上箭头", icon: IconArrowUpRight },
  { id: "bell", zh: "铃铛", icon: IconBell },
  { id: "bookmark", zh: "书签", icon: IconBookmark },
  { id: "calendar", zh: "日历", icon: IconCalendar },
  { id: "check", zh: "勾选", icon: IconCheck },
  { id: "download", zh: "下载", icon: IconDownload },
  { id: "folder", zh: "文件夹", icon: IconFolder },
  { id: "search", zh: "搜索", icon: IconSearch },
  { id: "settings", zh: "设置", icon: IconSettings },
  { id: "star", zh: "星标", icon: IconStar },
];

export default function TablerIcons() {
  const [query, setQuery] = useState("");
  const [stroke, setStroke] = useState(2);
  const term = query.toLowerCase().trim().replace(/\s+/g, "-");
  const matches = icons.filter(
    ({ id, zh }) => id.includes(term) || zh.includes(term),
  );

  return (
    <ReferencePanel
      title={copy("线条图标", "Outline icons")}
      icon={<IconGridDots aria-hidden="true" />}
    >
      <div className="refs-icon-controls">
        <input
          type="search"
          aria-label={copy("搜索图标", "Search icons")}
          placeholder={copy("搜索图标…", "Search icons…")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label>
          {copy("线宽", "Stroke")} <output>{stroke}</output>
          <input
            type="range"
            min="1"
            max="3"
            step="0.5"
            value={stroke}
            onChange={(e) => setStroke(Number(e.target.value))}
          />
        </label>
      </div>
      {matches.length ? (
        <ul className="refs-icon-grid">
          {matches.map(({ id, zh, icon: Icon }) => (
            <li key={id}>
              <Icon aria-hidden="true" size={27} stroke={stroke} />
              <span>{copy(zh, id)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="refs-status" role="status">
          {copy("没有匹配的图标。", "No matching icons.")}
        </p>
      )}
    </ReferencePanel>
  );
}
