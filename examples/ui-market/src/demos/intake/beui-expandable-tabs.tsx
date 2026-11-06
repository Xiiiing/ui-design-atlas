import { useState } from "react";
import {
  Rocket,
  Inbox,
  Workflow,
  FileText,
  ClipboardCheck,
  MessageCircle,
  Users,
  GitBranch,
  Webhook,
  Check,
} from "lucide-react";
import { ExpandableTabs } from "../../vendor/beui/expandable-tabs";
import { Stage, text } from "./shared";
export default function Demo() {
  const [selected, setSelected] = useState("");
  const groups = [
    {
      id: "launch",
      label: text("发布", "Launch"),
      icon: <Rocket size={16} />,
      rows: [
        [FileText, text("发布说明", "Release brief")],
        [ClipboardCheck, text("发布清单", "Launch checklist")],
      ],
    },
    {
      id: "inbox",
      label: text("收件箱", "Inbox"),
      icon: <Inbox size={16} />,
      rows: [
        [MessageCircle, text("客户反馈", "Client feedback")],
        [Users, text("团队请求", "Team requests")],
      ],
    },
    {
      id: "flows",
      label: text("流程", "Flows"),
      icon: <Workflow size={16} />,
      rows: [
        [GitBranch, text("构建流程", "Build pipeline")],
        [Webhook, text("集成设置", "Integrations")],
      ],
    },
  ];
  return (
    <Stage>
      <h2 className="intake-heading" style={{ textAlign: "center" }}>
        {text("图标展开为工作台", "A dock that opens into a workspace")}
      </h2>
      <div className="intake-tabs">
        <ExpandableTabs
          defaultValue="launch"
          items={groups.map((g) => ({
            ...g,
            content: (
              <div className="intake-menu">
                {g.rows.map(([Icon, label]) => {
                  const RowIcon = Icon as typeof FileText;
                  const name = label as string;
                  return (
                    <button
                      type="button"
                      key={name}
                      onClick={() => setSelected(name)}
                    >
                      <RowIcon size={16} />
                      <span style={{ flex: 1 }}>{name}</span>
                      {selected === name ? <Check size={16} /> : null}
                    </button>
                  );
                })}
              </div>
            ),
          }))}
        />
      </div>
      <output className="intake-status">
        {selected
          ? text("已选择：", "Selected: ") + selected
          : text(
              "选择标签切换面板，Escape 收起。",
              "Switch panels with the tabs. Escape closes.",
            )}
      </output>
    </Stage>
  );
}
