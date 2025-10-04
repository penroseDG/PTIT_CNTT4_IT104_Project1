import React, { useState } from "react";
import backgroundImage from "../../img/image 9.png";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

type SignUpErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

export default function SignUp() {
  const navigate = useNavigate();
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
  const [formErrors, setFormErrors] = useState<SignUpErrors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateInputs = () => {
  const currentErrors: SignUpErrors = {};
  // Kiểm tra email
  if (!emailValue.trim()) {
    currentErrors.email = "Email không được để trống.";
  } else if (!emailPattern.test(emailValue)) {
    currentErrors.email = "Email phải đúng định dạng.";
  }
  // Kiểm tra mật khẩu
  if (!passwordValue) {
    currentErrors.password = "Mật khẩu không được để trống.";
  } else if (passwordValue.length < 6) {
    currentErrors.password = "Mật khẩu tối thiểu 6 ký tự trở lên.";
  }
  // Kiểm tra xác nhận mật khẩu
  if (!confirmPasswordValue) {
    currentErrors.confirmPassword = "Mật khẩu xác nhận không được để trống.";
  } else if (confirmPasswordValue !== passwordValue) {
    currentErrors.confirmPassword = "Mật khẩu xác nhận phải trùng khớp.";
  }
  setFormErrors(currentErrors);
  return Object.keys(currentErrors).length === 0;
};

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage("");
    setFormErrors({});
    if (!validateInputs()) return;

    setIsSubmitting(true);
    try {
      const duplicateCheckResponse = await axios.get("http://localhost:8080/users", { params: { email: emailValue } });
      const existingUsers = Array.isArray(duplicateCheckResponse.data) ? duplicateCheckResponse.data : [];
      if (existingUsers.length > 0) {
        setFormErrors({ email: "Email đã tồn tại trong hệ thống." });
        return;
      }

      const newUserPayload = { email: emailValue, password: passwordValue };
      await axios.post("http://localhost:8080/users", newUserPayload);

      setSuccessMessage("Đăng ký thành công!");
      setTimeout(() => navigate("/signin", { replace: true }), 900);
    } catch {
      setFormErrors({ general: "Có lỗi khi kết nối máy chủ. Hãy kiểm tra json-server." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClassName = (hasError?: string) =>
    `w-full rounded-md border px-3 py-2 outline-none focus:ring-1 ${
      hasError ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:ring-gray-300"
    }`;

  return (
    <div className="h-screen w-screen bg-neutral-800 text-sm">
      <div className="relative">
        <img src={backgroundImage} alt="background" className="h-screen w-screen object-cover object-center" />
        <div className="pointer-events-none absolute inset-0 bg-black/10" />

        <div className="absolute left-1/2 top-[55%] w-full max-w-[340px] -translate-x-1/2 -translate-y-1/2">
          <div className="rounded-xl bg-white/95 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm">
            <h2 className="mb-1 text-center text-[13px] font-semibold">Sign up</h2>

            {successMessage && (
              <p className="mb-2 text-center text-[12px] font-medium text-green-600">{successMessage}</p>
            )}
            {formErrors.general && (
              <p className="mb-2 text-center text-[12px] font-medium text-red-600">{formErrors.general}</p>
            )}

            <form className="space-y-3" onSubmit={handleSubmit} noValidate>
              <div>
                <input
                  type="email"
                  placeholder="Email here ..."
                  value={emailValue}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmailValue(event.target.value)}
                  className={getInputClassName(formErrors.email)}
                  disabled={isSubmitting}
                />
                {formErrors.email && <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>}
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password here ..."
                  value={passwordValue}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPasswordValue(event.target.value)}
                  className={getInputClassName(formErrors.password)}
                  disabled={isSubmitting}
                />
                {formErrors.password && <p className="mt-1 text-xs text-red-600">{formErrors.password}</p>}
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Confirm password here ..."
                  value={confirmPasswordValue}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setConfirmPasswordValue(event.target.value)}
                  className={getInputClassName(formErrors.confirmPassword)}
                  disabled={isSubmitting}
                />
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md bg-green-600 py-2 text-white font-medium transition hover:bg-green-700 disabled:opacity-60 active:scale-[.99]"
              >
                {isSubmitting ? "Đang xử lý..." : "Sign Up"}
              </button>
            </form>

            <p className="mt-2 text-center text-[11px] text-gray-500">
              Đã có tài khoản?
              <Link to="/signin" className="pl-1 text-blue-600 hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
