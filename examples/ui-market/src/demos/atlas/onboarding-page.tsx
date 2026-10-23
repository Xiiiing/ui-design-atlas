import { Card } from "antd";
import { Surface, text } from "./shared";
import { SetupFlow } from "./steps";
export default function Demo() {
  return (
    <Surface>
      <header>
        <p>ATLAS / START</p>
        <h1>{text("开始你的新项目", "Start your next project")}</h1>
        <p>
          {text(
            "两个步骤，建立清晰的工作起点。",
            "Two steps to a clear starting point.",
          )}
        </p>
      </header>
      <div className="atlas-golden">
        <Card title={text("创建工作区", "Create a workspace")}>
          <SetupFlow />
        </Card>
        <aside className="atlas-summary">
          <h2>{text("下一步做什么？", "What happens next?")}</h2>
          <ol>
            <li>{text("确认团队名称", "Confirm the team name")}</li>
            <li>{text("整理项目资料", "Organize project materials")}</li>
            <li>{text("邀请协作伙伴", "Invite collaborators")}</li>
          </ol>
          <p>
            {text(
              "此页面是可复用的入门流程，未连接注册服务。",
              "A reusable onboarding flow without a connected registration service.",
            )}
          </p>
        </aside>
      </div>
    </Surface>
  );
}
