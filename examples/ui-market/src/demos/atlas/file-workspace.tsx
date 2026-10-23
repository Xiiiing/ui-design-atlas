import { useState } from "react";
import { Button, Card, Input, Empty, Tag } from "antd";
import { Surface, text } from "./shared";
import { LocalUpload } from "./upload";
export default function Demo() {
  const [query, setQuery] = useState("");
  const [files, setFiles] = useState([
    "Brand guidelines.pdf",
    "Research notes.md",
    "Wireframes.fig",
  ]);
  const visible = files.filter((x) =>
    x.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <Surface>
      <header>
        <p>ATLAS / WORKSPACE</p>
        <h1>{text("团队文件空间", "Team file workspace")}</h1>
        <p>
          {text(
            "搜索、整理文件并选择本地附件。",
            "Search, organize files and select local attachments.",
          )}
        </p>
      </header>
      <div className="atlas-golden">
        <Card title={text("文件", "Files")}>
          <Input.Search
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={text("按文件名搜索", "Search by filename")}
            allowClear
          />
          {visible.map((file) => (
            <article className="atlas-row" key={file}>
              <div>
                <strong>{file}</strong>
                <p>
                  <Tag>{text("团队资料", "Team material")}</Tag>
                </p>
              </div>
              <Button
                aria-label={text("移除 ", "Remove ") + file}
                onClick={() => setFiles(files.filter((x) => x !== file))}
              >
                {text("移除", "Remove")}
              </Button>
            </article>
          ))}
          {!visible.length && (
            <Empty description={text("没有匹配文件", "No matching files")} />
          )}
          <Button
            onClick={() =>
              setFiles([
                "Brand guidelines.pdf",
                "Research notes.md",
                "Wireframes.fig",
              ])
            }
          >
            {text("恢复演示文件", "Restore demo files")}
          </Button>
        </Card>
        <Card title={text("添加附件", "Add attachments")}>
          <LocalUpload />
        </Card>
      </div>
      <footer>
        {text(
          "所有操作仅在当前浏览器中演示，不会上传文件。",
          "All actions are local to this browser. No files are uploaded.",
        )}
      </footer>
    </Surface>
  );
}
