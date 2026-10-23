import { useState } from "react";
import { AutoComplete, Empty } from "antd";
import { Surface, text } from "./shared";
export default function Demo() {
  const [value, setValue] = useState(""),
    [selected, setSelected] = useState("");
  const options = [
    text("设计规范", "Design guidelines"),
    text("组件文档", "Component docs"),
    text("交付清单", "Delivery checklist"),
  ]
    .filter((x) => x.toLowerCase().includes(value.toLowerCase()))
    .map((value) => ({ value }));
  return (
    <Surface>
      <h2>{text("快捷文档搜索", "Quick document search")}</h2>
      <AutoComplete
        style={{ width: "100%" }}
        value={value}
        options={options}
        onSearch={setValue}
        onChange={setValue}
        onSelect={setSelected}
        placeholder={text("搜索文档", "Search documents")}
        allowClear
        notFoundContent={
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={text("没有匹配文档", "No matching documents")}
          />
        }
      />
      <p role="status">
        {selected
          ? text("已打开：", "Opened: ") + selected
          : text(
              "输入关键词，使用方向键选择并按回车。",
              "Type a keyword, use arrow keys and press Enter.",
            )}
      </p>
    </Surface>
  );
}
