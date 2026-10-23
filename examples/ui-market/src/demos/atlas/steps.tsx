import { useState } from "react";
import { Button, Input, Steps, Result } from "antd";
import { Surface, text } from "./shared";
export function SetupFlow() {
  const [step, setStep] = useState(0),
    [name, setName] = useState(""),
    [done, setDone] = useState(false);
  if (done)
    return (
      <Result
        status="success"
        title={text("设置完成", "Setup complete")}
        subTitle={text(
          "仅为本地演示，未创建账户。",
          "Local demo only. No account was created.",
        )}
        extra={
          <Button
            onClick={() => {
              setDone(false);
              setStep(0);
            }}
          >
            {text("重新设置", "Start again")}
          </Button>
        }
      />
    );
  return (
    <div className="atlas-stack">
      <Steps
        current={step}
        items={[text("工作区", "Workspace"), text("确认", "Confirm")].map(
          (title) => ({ title }),
        )}
      />
      {step === 0 ? (
        <label>
          {text("工作区名称", "Workspace name")}
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={text("输入名称后继续", "Enter a name to continue")}
          />
        </label>
      ) : (
        <p>
          {text("确认工作区", "Confirm workspace")}: <strong>{name}</strong>
        </p>
      )}
      <div className="atlas-actions">
        {step > 0 && (
          <Button onClick={() => setStep(0)}>{text("上一步", "Back")}</Button>
        )}
        <Button
          type="primary"
          disabled={!name.trim()}
          onClick={() => (step === 0 ? setStep(1) : setDone(true))}
        >
          {step === 0 ? text("下一步", "Next") : text("完成", "Finish")}
        </Button>
      </div>
    </div>
  );
}
export default function Demo() {
  return (
    <Surface>
      <h2>{text("分步设置", "Step-by-step setup")}</h2>
      <SetupFlow />
    </Surface>
  );
}
