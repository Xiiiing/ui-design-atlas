import { Command } from "cmdk";
import { useEffect, useRef, useState } from "react";
import {
  IconCommand,
  IconFilePlus,
  IconFolder,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";
import { copy, ReferencePanel } from "./shared";

export default function CommandMenu() {
  const input = useRef<HTMLInputElement>(null);
  const [selection, setSelection] = useState("");
  const [query, setQuery] = useState("");
  const actions = [
    {
      value: "create",
      label: copy("新建文档", "New document"),
      aliases: ["文档", "create", "file"],
      icon: IconFilePlus,
    },
    {
      value: "projects",
      label: copy("浏览项目", "Browse projects"),
      aliases: ["项目", "project", "folder"],
      icon: IconFolder,
    },
    {
      value: "settings",
      label: copy("打开偏好设置", "Open preferences"),
      aliases: ["设置", "偏好", "settings", "preferences"],
      icon: IconSettings,
    },
  ];

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (
        !event.isComposing &&
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);

  return (
    <ReferencePanel
      title={copy("工作区命令", "Workspace commands")}
      icon={<IconCommand aria-hidden="true" />}
    >
      <Command
        label={copy("工作区命令", "Workspace commands")}
        className="refs-command"
      >
        <div className="refs-command-input">
          <IconSearch aria-hidden="true" size={19} />
          <Command.Input
            ref={input}
            value={query}
            onValueChange={setQuery}
            placeholder={copy("搜索命令…", "Search commands…")}
          />
          <kbd>
            {/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘ K" : "Ctrl K"}
          </kbd>
        </div>
        <Command.List
          className="refs-command-list"
          label={copy("匹配命令", "Matching commands")}
        >
          <Command.Empty>
            {copy("没有匹配的命令。", "No matching commands.")}
          </Command.Empty>
          <Command.Group heading={copy("操作", "Actions")}>
            {actions.map(({ value, label, aliases, icon: Icon }) => (
              <Command.Item
                key={value}
                value={value}
                keywords={[label, ...aliases]}
                onSelect={() => {
                  setSelection(label);
                  setQuery("");
                }}
              >
                <Icon aria-hidden="true" size={18} />
                {label}
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command>
      <p className="refs-status" role="status">
        {selection
          ? copy(`已选择「${selection}」`, `Selected: ${selection}`)
          : copy(
              "方向键选择，回车确认。",
              "Use arrow keys to move, Enter to select.",
            )}
      </p>
    </ReferencePanel>
  );
}
