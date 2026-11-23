import { IconAdjustmentsHorizontal } from "@tabler/icons-react";
import { useState } from "react";
import { Drawer } from "vaul";
import { copy, ReferencePanel } from "./shared";

const sorting = ["recent", "name"] as const;
type Sort = (typeof sorting)[number];

export default function VaulSheet() {
  const [sort, setSort] = useState<Sort>("recent");
  const [draft, setDraft] = useState<Sort>(sort);
  const label = (option: Sort) =>
    option === "recent"
      ? copy("最近更新", "Recently updated")
      : copy("名称", "Name");

  return (
    <ReferencePanel
      icon={<IconAdjustmentsHorizontal aria-hidden="true" />}
      title={copy("文档排序", "Document order")}
      description={copy(
        "在底部抽屉内选择排序方式。",
        "Choose a sort order in a bottom sheet.",
      )}
    >
      <Drawer.Root
        autoFocus
        onOpenChange={(open) => {
          if (open) setDraft(sort);
        }}
      >
        <div className="refs-row">
          <div className="refs-item-copy">
            <strong>{copy("排序方式", "Sort by")}</strong>
            <p role="status">{label(sort)}</p>
          </div>
          <Drawer.Trigger className="refs-btn refs-primary">
            {copy("更改排序", "Change order")}
          </Drawer.Trigger>
        </div>
        <Drawer.Portal>
          <Drawer.Overlay className="refs-overlay" />
          <Drawer.Content className="refs-sheet">
            <Drawer.Handle className="refs-sheet-handle" />
            <Drawer.Title>{copy("文档排序", "Document order")}</Drawer.Title>
            <Drawer.Description>
              {copy(
                "应用后更新排序。向下拖动可关闭。",
                "Apply to update the order. Drag down to dismiss.",
              )}
            </Drawer.Description>
            <fieldset className="refs-choices">
              <legend className="sr-only">{copy("排序方式", "Sort by")}</legend>
              {sorting.map((option) => (
                <label key={option}>
                  <input
                    type="radio"
                    name="reference-sort"
                    value={option}
                    checked={draft === option}
                    onChange={() => setDraft(option)}
                  />
                  {label(option)}
                </label>
              ))}
            </fieldset>
            <div className="refs-actions">
              <Drawer.Close className="refs-btn">
                {copy("取消", "Cancel")}
              </Drawer.Close>
              <Drawer.Close
                className="refs-btn refs-primary"
                onClick={() => setSort(draft)}
              >
                {copy("应用排序", "Apply order")}
              </Drawer.Close>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </ReferencePanel>
  );
}
