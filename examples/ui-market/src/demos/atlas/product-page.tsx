import { useState } from "react";
import { Button, Card, Collapse, Form, Input, Modal, Radio, Alert } from "antd";
import { Surface, text } from "./shared";
export default function Demo() {
  const [annual, setAnnual] = useState(false),
    [open, setOpen] = useState(false),
    [sent, setSent] = useState(false);
  return (
    <Surface>
      <header className="atlas-row">
        <strong>FORMA / NOTES</strong>
        <Button onClick={() => setOpen(true)}>
          {text("联系团队", "Contact team")}
        </Button>
      </header>
      <section className="atlas-golden">
        <div>
          <p>{text("为专注的团队而设计", "Built for focused teams")}</p>
          <h1>{text("让想法，有序发生。", "Make room for better ideas.")}</h1>
          <p>
            {text(
              "将任务、笔记与交付聚合在一个清晰的空间中。",
              "Bring tasks, notes and delivery into one clear space.",
            )}
          </p>
          <Button type="primary" onClick={() => setOpen(true)}>
            {text("开始体验", "Get started")}
          </Button>
        </div>
        <Card title={text("团队计划", "Team plan")}>
          <Radio.Group
            value={annual}
            onChange={(e) => setAnnual(e.target.value)}
            options={[
              { label: text("月付", "Monthly"), value: false },
              { label: text("年付", "Yearly"), value: true },
            ]}
            optionType="button"
          />
          <h2>
            ${annual ? "8" : "10"}{" "}
            <small>{text("/ 人 / 月", "/ person / month")}</small>
          </h2>
          <p>
            {text(
              "演示价格；无真实购买或扣款。",
              "Demo pricing; no purchase or payment.",
            )}
          </p>
        </Card>
      </section>
      <section>
        <h2>{text("常见问题", "Frequently asked questions")}</h2>
        <Collapse
          items={[
            {
              key: "1",
              label: text("可以随时取消吗？", "Can I cancel anytime?"),
              children: text(
                "这是本地产品页面演示，未创建订阅。",
                "This local product demo does not create a subscription.",
              ),
            },
            {
              key: "2",
              label: text("数据会发送到哪里？", "Where is my data sent?"),
              children: text(
                "表单仅在当前页面校验，不发送到服务器。",
                "Forms validate locally and send nothing to a server.",
              ),
            },
          ]}
        />
      </section>
      <Modal
        title={text("联系团队", "Contact team")}
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        <Form layout="vertical" onFinish={() => setSent(true)}>
          <Form.Item
            name="email"
            label={text("邮箱", "Email")}
            rules={[
              {
                required: true,
                type: "email",
                message: text("请输入有效邮箱", "Enter a valid email"),
              },
            ]}
          >
            <Input type="email" />
          </Form.Item>
          <Button htmlType="submit" type="primary">
            {text("提交演示", "Submit demo")}
          </Button>
          {sent && (
            <Alert
              role="status"
              title={text(
                "演示提交成功，未发送邮件。",
                "Demo submitted. No email was sent.",
              )}
              type="success"
            />
          )}
        </Form>
      </Modal>
    </Surface>
  );
}
