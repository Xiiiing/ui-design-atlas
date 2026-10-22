import { usePreviewSettings } from "@/archive/settings";
// Upstream source and modifications: see ATTRIBUTION.md and upstream/magicui/.
import { ShimmerButton } from "@/vendor/magicui/shimmer-button"

export default function ShimmerButtonDemo() {
 const {duration}=usePreviewSettings();
  return (
    <ShimmerButton shimmerDuration={`${duration}s`} className="shadow-2xl">
      <span className="text-center text-sm leading-none font-medium tracking-tight whitespace-pre-wrap text-white lg:text-lg dark:from-white dark:to-slate-900/10">
        Shimmer Button
      </span>
    </ShimmerButton>
  )
}

