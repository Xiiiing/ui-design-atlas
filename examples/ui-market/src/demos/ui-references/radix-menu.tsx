import * as Menu from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import {
  IconCheck,
  IconDots,
  IconFileText,
  IconPin,
} from "@tabler/icons-react";
import { copy, ReferencePanel } from "./shared";

export default function RadixMenu() {
  const [pinned, setPinned] = useState(false);
  const [view, setView] = useState("list");
  const viewName =
    view === "list" ? copy("列表", "List") : copy("卡片", "Cards");

  return (
    <ReferencePanel
      icon={<IconFileText aria-hidden="true" />}
      title={copy("项目笔记", "Project notes")}
      description={copy(
        "文件操作与显示选项",
        "File actions and display options",
      )}
    >
      <div className="refs-row">
        <div className="refs-item-copy">
          <strong>{copy("发布清单", "Release checklist")}</strong>
          <p role="status">
            {viewName} ·{" "}
            {pinned ? copy("已置顶", "Pinned") : copy("未置顶", "Unpinned")}
          </p>
        </div>
        <Menu.Root>
          <Menu.Trigger
            className="refs-btn refs-icon-btn"
            aria-label={copy("文件选项", "File options")}
          >
            <IconDots aria-hidden="true" size={21} />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Content align="end" sideOffset={7} className="refs-menu">
              <Menu.CheckboxItem
                className="refs-menu-item"
                checked={pinned}
                onCheckedChange={setPinned}
              >
                <IconPin aria-hidden="true" size={17} />
                <span>{copy("置顶文件", "Pin file")}</span>
                <Menu.ItemIndicator className="refs-indicator">
                  <IconCheck aria-hidden="true" size={17} />
                </Menu.ItemIndicator>
              </Menu.CheckboxItem>
              <Menu.Separator className="refs-menu-separator" />
              <Menu.Label className="refs-menu-label">
                {copy("显示方式", "View as")}
              </Menu.Label>
              <Menu.RadioGroup value={view} onValueChange={setView}>
                {["list", "cards"].map((option) => (
                  <Menu.RadioItem
                    key={option}
                    value={option}
                    className="refs-menu-item"
                  >
                    <span>
                      {option === "list"
                        ? copy("列表", "List")
                        : copy("卡片", "Cards")}
                    </span>
                    <Menu.ItemIndicator className="refs-indicator">
                      <IconCheck aria-hidden="true" size={17} />
                    </Menu.ItemIndicator>
                  </Menu.RadioItem>
                ))}
              </Menu.RadioGroup>
            </Menu.Content>
          </Menu.Portal>
        </Menu.Root>
      </div>
    </ReferencePanel>
  );
}
