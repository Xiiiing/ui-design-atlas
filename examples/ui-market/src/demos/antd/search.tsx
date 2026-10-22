// Actual upstream example. Source and adaptations: ATTRIBUTION.md.
import { AntProvider } from "@/archive/ant-provider";
import React, { useState } from "react";
import { DownOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Row, Select, Space, theme } from "antd";

const AdvancedSearchForm = () => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [expand, setExpand] = useState(false);

  const formStyle: React.CSSProperties = {
    maxWidth: "none",
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    padding: 24,
  };

  const getFields = () => {
    const count = expand ? 10 : 6;
    const children: React.ReactNode[] = [];
    for (let i = 0; i < count; i++) {
      children.push(
        <Col xs={24} sm={12} lg={8} key={i}>
          {i % 3 !== 1 ? (
            <Form.Item
              name={`field-${i}`}
              label={`Field ${i + 1}`}
              rules={[
                {
                  required: true,
                  message: "Input something!",
                },
              ]}
            >
              <Input placeholder="placeholder" />
            </Form.Item>
          ) : (
            <Form.Item
              name={`field-${i}`}
              label={`Field ${i + 1}`}
              rules={[
                {
                  required: true,
                  message: "Select something!",
                },
              ]}
              initialValue="1"
            >
              <Select
                options={[
                  {
                    value: "1",
                    label: "Active workspace",
                  },
                  {
                    value: "2",
                    label: "Archived workspace",
                  },
                ]}
              />
            </Form.Item>
          )}
        </Col>,
      );
    }
    return children;
  };

  const onFinish = (values: any) => {
    window.dispatchEvent(
      new CustomEvent("atlas:demo-success", {
        detail: "Saved locally. No data sent.",
      }),
    );
  };

  return (
    <Form
      form={form}
      name="advanced_search"
      style={formStyle}
      onFinish={onFinish}
    >
      <Row gutter={24}>{getFields()}</Row>
      <div style={{ textAlign: "end" }}>
        <Space size="small">
          <Button type="primary" htmlType="submit">
            Search
          </Button>
          <Button
            onClick={() => {
              form.resetFields();
            }}
          >
            Clear
          </Button>
          <button
            type="button"
            style={{
              fontSize: 12,
              color: token.colorLink,
              background: "transparent",
              border: 0,
              cursor: "pointer",
            }}
            onClick={() => {
              setExpand(!expand);
            }}
          >
            <DownOutlined rotate={expand ? 180 : 0} />{" "}
            {expand ? "Collapse" : "Expand"}
          </button>
        </Space>
      </div>
    </Form>
  );
};

const App: React.FC = () => {
  const { token } = theme.useToken();

  const listStyle: React.CSSProperties = {
    lineHeight: "200px",
    textAlign: "center",
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    marginTop: 16,
  };

  return (
    <>
      <AdvancedSearchForm />
      <div style={listStyle}>Search Result List</div>
    </>
  );
};

export default function ArchivedDemo() {
  return (
    <AntProvider>
      <App />
    </AntProvider>
  );
}
