import { useState } from "react";
import { Alert, Button, Upload } from "antd";
import type { UploadFile } from "antd";
import { Surface, text } from "./shared";
export function LocalUpload() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [error, setError] = useState("");
  return (
    <div className="atlas-stack">
      <Upload
        multiple
        fileList={files}
        beforeUpload={(file) => {
          if (file.size > 5 * 1024 * 1024) {
            setError(
              text("请选择小于 5MB 的文件。", "Choose files smaller than 5MB."),
            );
            return Upload.LIST_IGNORE;
          }
          setError("");
          return false;
        }}
        onChange={({ fileList }) => setFiles(fileList.slice(-5))}
      >
        <Button>{text("选择文件", "Choose files")}</Button>
      </Upload>
      <p>
        {text(
          "最多 5 个文件，每个不超过 5MB，仅保留在当前页面。",
          "Up to 5 files, 5MB each. Files stay in this page.",
        )}
      </p>
      {error && <Alert title={error} type="error" showIcon />}
      <div role="status">
        {text("已选择", "Selected")}: {files.length}
      </div>
    </div>
  );
}
export default function Demo() {
  return (
    <Surface>
      <h2>{text("本地文件选择", "Local file picker")}</h2>
      <LocalUpload />
    </Surface>
  );
}
