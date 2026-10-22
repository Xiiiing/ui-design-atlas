// Upstream source and modifications: see ATTRIBUTION.md and upstream/magicui/.
import { TextAnimate } from "@/vendor/magicui/text-animate"

export default function TextAnimateDemo() {
  return (
    <TextAnimate animation="blurInUp" by="character" once>
      Blur in by character
    </TextAnimate>
  )
}

