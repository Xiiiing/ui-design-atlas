import { useState } from "react";
import { ShineBorder } from "../../vendor/magicui/shine-border";
import { locale } from "../../archive/i18n";
export default function Demo() {
  const [saved, setSaved] = useState(false);
  const en = locale === "en";
  return (
    <div className="relative w-full max-w-xs rounded-xl border p-6">
      <ShineBorder shineColor={["#818cf8", "#e879f9", "#fbbf24"]} />
      <h2 className="text-xl font-semibold">
        {en ? "Ideas worth keeping" : "值得保留的灵感"}
      </h2>
      <p className="my-4 text-sm">
        {en
          ? "A quiet border highlights this collection."
          : "用流动边框突出重要内容。"}
      </p>
      <button
        className="rounded-md border px-4 py-2"
        style={{ minHeight: 44 }}
        aria-pressed={saved}
        onClick={() => setSaved(!saved)}
      >
        {saved
          ? en
            ? "Saved"
            : "已收藏"
          : en
            ? "Save collection"
            : "收藏合集"}
      </button>
    </div>
  );
}
