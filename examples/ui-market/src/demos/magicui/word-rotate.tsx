import { useState } from "react";
import { useReducedMotion } from "motion/react";
import { WordRotate } from "../../vendor/magicui/word-rotate";
import { locale } from "../../archive/i18n";
export default function Demo() {
  const reduced = useReducedMotion(),
    [paused, setPaused] = useState(false);
  const en = locale === "en";
  const words = en ? ["Design", "Build", "Share"] : ["设计", "构建", "分享"];
  return (
    <div className="text-center">
      <p>{en ? "Create something useful" : "创造实用的界面"}</p>
      <div style={{ height: 90 }}>
        {reduced || paused ? (
          <h1 className="py-2 text-4xl font-semibold">{words[0]}</h1>
        ) : (
          <WordRotate words={words} className="text-4xl font-semibold" />
        )}
      </div>
      <button
        className="rounded-md border px-4 py-2"
        style={{ minHeight: 44 }}
        onClick={() => setPaused(!paused)}
        aria-pressed={paused}
      >
        {paused ? (en ? "Play" : "播放") : en ? "Pause" : "暂停"}
      </button>
    </div>
  );
}
