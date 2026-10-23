import { useState } from "react";
import { Alert, Button } from "antd";
import { Surface, text } from "./shared";
export default function Demo() {
  const [status, setStatus] = useState<"info" | "success" | "error">("info");
  const messages = {
    info: text("等待保存", "Ready to save"),
    success: text("已保存到本地演示", "Saved in this local demo"),
    error: text("保存失败，请重试", "Could not save. Try again."),
  };
  return (
    <Surface>
      <div className="atlas-stack">
        <div>
          <Alert
            role="status"
            showIcon
            type={status}
            title={messages[status]}
          />
        </div>
        <div className="atlas-actions">
          <Button onClick={() => setStatus("success")}>
            {text("保存", "Save")}
          </Button>
          <Button onClick={() => setStatus("error")}>
            {text("模拟失败", "Simulate failure")}
          </Button>
          {status === "error" && (
            <Button onClick={() => setStatus("success")}>
              {text("重试", "Retry")}
            </Button>
          )}
        </div>
      </div>
    </Surface>
  );
}
