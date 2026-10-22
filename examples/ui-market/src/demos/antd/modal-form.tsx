// Actual upstream example. Source and adaptations: ATTRIBUTION.md.
import { AntProvider } from "@/archive/ant-provider";
import React, { useState } from "react";
import { Button, Form, Input, Modal, Radio } from "antd";

interface Values {
  title?: string;
  description?: string;
  modifier?: string;
}

const App: React.FC = () => {
  const [form] = Form.useForm();
  const [formValues, setFormValues] = useState<Values>();
  const [open, setOpen] = useState(
    new URLSearchParams(location.search).has("thumb"),
  );

  const onCreate = (values: Values) => {
    window.dispatchEvent(
      new CustomEvent("atlas:demo-success", {
        detail: "Saved locally. No data sent.",
      }),
    );
    setFormValues(values);
    setOpen(false);
  };

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        New Collection
      </Button>
      <pre>{JSON.stringify(formValues, null, 2)}</pre>
      <Modal
        open={open}
        title="Create a new collection"
        okText="Create"
        cancelText="Cancel"
        okButtonProps={{ autoFocus: true, htmlType: "submit" }}
        onCancel={() => setOpen(false)}
        destroyOnHidden
        modalRender={(dom) => (
          <Form
            layout="vertical"
            form={form}
            name="form_in_modal"
            initialValues={{ modifier: "public" }}
            clearOnDestroy
            onFinish={(values) => onCreate(values)}
          >
            {dom}
          </Form>
        )}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[
            {
              required: true,
              message: "Please input the title of collection!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input type="textarea" />
        </Form.Item>
        <Form.Item
          name="modifier"
          className="collection-create-form_last-form-item"
        >
          <Radio.Group>
            <Radio value="public">Public</Radio>
            <Radio value="private">Private</Radio>
          </Radio.Group>
        </Form.Item>
      </Modal>
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
