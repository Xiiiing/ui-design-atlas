import { usePreviewSettings } from "@/archive/settings";
// Upstream source and modifications: see ATTRIBUTION.md and upstream/magicui/.
import { NumberTicker } from "@/vendor/magicui/number-ticker"

export default function NumberTickerDemo() {
 const {value}=usePreviewSettings();
  return (
    <NumberTicker
      value={value}
      className="text-8xl font-medium tracking-tighter whitespace-pre-wrap text-black dark:text-white"
    />
  )
}

