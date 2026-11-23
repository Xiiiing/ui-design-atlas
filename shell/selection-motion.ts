import { animate, cancelFrame, frame, motionValue } from "motion";
import type { Box } from "./SelectionGroup";

export function animateSelection(
  marker: HTMLElement,
  variant: "outline" | "underline",
) {
  const style = getComputedStyle(marker);
  const matrix = new DOMMatrixReadOnly(
    style.transform === "none" ? undefined : style.transform,
  );
  const values = {
    x: motionValue(matrix.e),
    y: motionValue(matrix.f),
    width: motionValue(Number.parseFloat(style.width)),
    height: motionValue(Number.parseFloat(style.height)),
  };
  const keys = Object.keys(values) as (keyof Box)[];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let target: Box | undefined;
  const render = () => {
    const speed = reduced.matches ? 0 : Math.abs(values.x.getVelocity());
    const stretch = 1 + Math.min(speed / 12000, 0.065);
    const squash =
      variant === "underline" ? 1 : 1 - Math.min(speed / 32000, 0.02);
    marker.style.width = `${values.width.get()}px`;
    marker.style.height = `${values.height.get()}px`;
    marker.style.transform = `translate(${values.x.get()}px, ${values.y.get()}px) scale(${stretch}, ${squash})`;
  };
  const unsubscribes = keys.map((key) =>
    values[key].on("change", () => frame.render(render)),
  );
  const snap = () => {
    if (!target || !reduced.matches) return;
    for (const key of keys) values[key].jump(target[key]);
    render();
  };
  reduced.addEventListener("change", snap);
  marker.dataset.selectionMotion = "";
  render();

  return {
    update(box: Box) {
      const previous = target;
      target = box;
      if (reduced.matches) {
        snap();
        return;
      }
      for (const key of keys)
        if (previous?.[key] !== box[key])
          void animate(values[key], box[key], {
            type: "spring",
            stiffness: 440,
            damping: 34,
            mass: 0.75,
          }).then(render);
    },
    destroy() {
      reduced.removeEventListener("change", snap);
      unsubscribes.forEach((unsubscribe) => unsubscribe());
      keys.forEach((key) => values[key].destroy());
      cancelFrame(render);
      delete marker.dataset.selectionMotion;
    },
  };
}
