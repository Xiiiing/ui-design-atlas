// Atlas adapter of the archived Yingxu selection: animate explicit geometry only.
// The immutable upstream reference and its styles remain under vendor/.
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import "../vendor/yingxu-ui/reference/css/selection.css";

export type Box = { x: number; y: number; width: number; height: number };
/** A single visual selection follows the active control without moving its text. */
export function SelectionGroup({
  as: Tag = "div",
  variant = "outline",
  value,
  selector = '[aria-current="page"], [aria-pressed="true"], [aria-selected="true"], [data-selected="true"], .active, .selected',
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLElement> & {
  as?: "div" | "nav" | "ul";
  variant?: "outline" | "underline";
  value?: unknown;
  selector?: string;
  children: ReactNode;
}) {
  const root = useRef<HTMLElement>(null);
  const marker = useRef<HTMLSpanElement>(null);
  const latest = useRef<Box | null>(null);
  const motion = useRef<ReturnType<
    typeof import("./selection-motion").animateSelection
  > | null>(null);
  const [box, setBox] = useState<Box | null>(null);

  useEffect(() => {
    const group = root.current;
    if (!group) return;
    const controller = new AbortController();
    const { signal } = controller;
    let pending = false;
    const prepare = () => {
      if (pending || motion.current || !marker.current) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      pending = true;
      void import("./selection-motion")
        .then(({ animateSelection }) => {
          if (signal.aborted || !marker.current || !latest.current) return;
          motion.current = animateSelection(marker.current, variant);
          motion.current.update(latest.current);
        })
        .catch(() => {
          // The marker follows selection using CSS if optional motion is unavailable.
        })
        .finally(() => {
          pending = false;
        });
    };
    group.addEventListener("pointerenter", prepare, { signal });
    group.addEventListener("focusin", prepare, { signal });
    group.addEventListener("click", prepare, { capture: true, signal });
    return () => {
      controller.abort();
      motion.current?.destroy();
      motion.current = null;
    };
  }, [variant]);

  useLayoutEffect(() => {
    latest.current = box;
    if (!box || !marker.current) {
      motion.current?.destroy();
      motion.current = null;
      return;
    }
    if (motion.current) {
      motion.current.update(box);
    } else {
      marker.current.style.width = `${box.width}px`;
      marker.current.style.height = `${box.height}px`;
      marker.current.style.transform = `translate(${box.x}px, ${box.y}px)`;
    }
  }, [box]);

  useLayoutEffect(() => {
    const group = root.current;
    if (!group) return;
    let frame = 0,
      alive = true;
    const measure = () => {
      const active = Array.from(
        group.querySelectorAll<HTMLElement>(selector),
      ).find(
        (el) =>
          el.closest("[data-selection-group]") === group &&
          el.getClientRects().length > 0,
      );
      if (!active) {
        setBox(null);
        return;
      }
      const outer = group.getBoundingClientRect(),
        inner = active.getBoundingClientRect();
      const next = {
        x: inner.left - outer.left + group.scrollLeft - group.clientLeft,
        y:
          (variant === "underline" ? inner.bottom - 2 : inner.top) -
          outer.top +
          group.scrollTop -
          group.clientTop,
        width: inner.width,
        height: variant === "underline" ? 2 : inner.height,
      };
      if (next.width <= 0 || next.height <= 0) {
        setBox(null);
        return;
      }
      setBox((old) =>
        old &&
        Object.keys(next).every(
          (k) => Math.abs(old[k as keyof Box] - next[k as keyof Box]) < 0.25,
        )
          ? old
          : next,
      );
    };
    const schedule = () => {
      if (!alive) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    const resize =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(schedule)
        : null;
    resize?.observe(group);
    for (const child of group.children)
      if (!child.hasAttribute("data-selection-marker")) resize?.observe(child);
    const mutation = new MutationObserver(schedule);
    mutation.observe(group, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [
        "aria-current",
        "aria-pressed",
        "aria-selected",
        "data-selected",
        "class",
        "hidden",
      ],
    });
    group.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.fonts?.ready.then(schedule);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      resize?.disconnect();
      mutation.disconnect();
      group.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [value, variant, selector]);
  return (
    <Tag
      {...props}
      ref={root as never}
      className={`selection-group ${className}`}
      data-selection-group
      data-selection-variant={variant}
    >
      {children}
      {box && (
        <span
          ref={marker}
          aria-hidden="true"
          className="selection-marker"
          data-selection-marker
        />
      )}
    </Tag>
  );
}
