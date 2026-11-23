import { MantineProvider, SegmentedControl } from "@mantine/core";
import { useReducedMotion } from "@mantine/hooks";
import { IconLayoutList } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import "@mantine/core/styles/global.layer.css";
import "@mantine/core/styles/default-css-variables.layer.css";
import "@mantine/core/styles/SegmentedControl.layer.css";
import "@mantine/core/styles/FloatingIndicator.layer.css";
import { copy, ReferencePanel } from "./shared";

const files = [
  { name: ["发布清单", "Release checklist"], date: "11.19" },
  { name: ["评审笔记", "Review notes"], date: "11.20" },
  { name: ["交互规范", "Interaction specs"], date: "11.22" },
];

export default function MantineSettings() {
  const [density, setDensity] = useState("standard");
  const { resolvedTheme } = useTheme();
  const reduceMotion = useReducedMotion();

  return (
    <MantineProvider
      forceColorScheme={resolvedTheme === "dark" ? "dark" : "light"}
    >
      <ReferencePanel
        title={copy("列表密度", "List density")}
        description={copy(
          "比较三种行高下的信息密度。",
          "Compare three row heights in the same list.",
        )}
        icon={<IconLayoutList aria-hidden="true" />}
      >
        <SegmentedControl
          fullWidth
          aria-label={copy("列表密度", "List density")}
          value={density}
          onChange={setDensity}
          transitionDuration={reduceMotion ? 0 : 160}
          data={[
            { value: "compact", label: copy("紧凑", "Compact") },
            { value: "standard", label: copy("标准", "Standard") },
            { value: "comfortable", label: copy("宽松", "Comfortable") },
          ]}
        />
        <ul className="refs-density" data-density={density}>
          {files.map(({ name: [zh, en], date }) => (
            <li key={en}>
              <span>{copy(zh, en)}</span>
              <span>{date}</span>
            </li>
          ))}
        </ul>
      </ReferencePanel>
    </MantineProvider>
  );
}
