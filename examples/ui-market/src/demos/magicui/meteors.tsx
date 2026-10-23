import { useState } from "react";
import { useReducedMotion } from "motion/react";
import { Meteors } from "../../vendor/magicui/meteors";
import { locale } from "../../archive/i18n";
export default function Demo() {
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const en = locale === "en";
  return (
    <div
      className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-xl border p-6"
      style={{ height: 260 }}
    >
      {!paused && !reduced && <Meteors number={12} />}
      <h2 className="relative text-3xl font-semibold">
        {en ? "A passing moment" : "流星掠过"}
      </h2>
      <button
        className="relative mt-6 rounded-md border px-4 py-2"
        style={{ minHeight: 44 }}
        aria-pressed={paused}
        onClick={() => setPaused(!paused)}
      >
        {paused ? (en ? "Play" : "播放") : en ? "Pause" : "暂停"}
      </button>
    </div>
  );
}
