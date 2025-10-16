import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Button, message } from "antd";
import axios from "axios";

// ====== Kiểu User của bạn ======
export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  gender: boolean | null; // true = Male, false = Female, null = —
  status: boolean | null;
}

type ModalChangeInforProps = {
  open: boolean;
  onClose: () => void;
  user: User;                        // dữ liệu hiện tại
  onSaved?: (updated: User) => void; // callback khi lưu thành công
};

const API_USERS = "http://localhost:8080/users";

const genderToLabel = (g: boolean | null) =>
  g === true ? "Male" : g === false ? "Female" : "";

const labelToGender = (s: string): boolean | null =>
  s === "Male" ? true : s === "Female" ? false : null;

export default function ModalChangeInfor({
  open,
  onClose,
  user,
  onSaved,
}: ModalChangeInforProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && user) {
      form.setFieldsValue({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: genderToLabel(user.gender),
      });
    }
  }, [open, user, form]);

  const handleFinish = async (values: any) => {
    try {
      const payload: Partial<User> = {
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
        gender: labelToGender(values.gender),
      };

      const res = await axios.patch<User>(`${API_USERS}/${user.id}`, payload);
      message.success("Cập nhật thông tin thành công!");
      onSaved?.(res.data);
      onClose();
    } catch (e) {
      message.error("Không thể lưu. Kiểm tra json-server và thử lại.");
    }
  };

  return (
    <Modal
      open={open}
      title="Change Information"
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark="optional"
      >
        <Form.Item
          label="Name"
          name="fullName"
          rules={[
            { required: true, message: "Please enter your name" },
            { min: 2, message: "Name is too short" },
          ]}
        >
          <Input placeholder="Nhap ten vao day " />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Invalid email" },
          ]}
        >
          <Input placeholder="email@example.com" />
        </Form.Item>

        <Form.Item
          label="Phone"
          name="phone"
          rules={[
            { required: true, message: "Please enter your phone number" },
            {
              pattern: /^[0-9+\-()\s]{8,20}$/,
              message: "Invalid phone number",
            },
          ]}
        >
          <Input placeholder="0987654321" />
        </Form.Item>

        <Form.Item
          label="Gender"
          name="gender"
          rules={[{ required: true, message: "Please select gender" }]}
        >
          <Select
            placeholder="Select gender"
            options={[
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" },
            ]}
          />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
