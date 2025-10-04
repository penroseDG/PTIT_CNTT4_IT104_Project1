import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import backgroundImage from "../../img/image 9.png";

type SignInErrors = {
  email?: string;
  password?: string;
  form?: string;
};

export default function SignIn() {
  const navigate = useNavigate();
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [formErrors, setFormErrors] = useState<SignInErrors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

 const validateInputs = () => {
  const currentErrors: SignInErrors = {};
  // Kiểm tra email
  if (!emailValue.trim()) {
    currentErrors.email = "Email không được bỏ trống.";
  }
  // Kiểm tra mật khẩu
  if (!passwordValue) {
    currentErrors.password = "Mật khẩu không được bỏ trống.";
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
      const response = await axios.get("http://localhost:8080/users", {
        params: { email: emailValue, password: passwordValue },
      });
      const users = Array.isArray(response.data) ? response.data : [];
      if (users.length === 0) {
        setFormErrors({ form: "Email hoặc mật khẩu không đúng." });
        return;
      }
      // Đăng nhập thành công chuyển về Home 
      setSuccessMessage("Sign In Successfully");
      setTimeout(() => navigate("/userhome", { replace: true }), 800);
    } catch {
      setFormErrors({ form: "Không thể kết nối máy chủ. Kiểm tra json-server." });
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
            <h2 className="mb-1 text-center text-[13px] font-semibold">🔐 Đăng nhập</h2>

            {successMessage && (
              <p className="mb-2 text-center text-[12px] font-medium text-green-600">{successMessage}</p>
            )}
            {formErrors.form && (
              <p className="mb-2 text-center text-[12px] font-medium text-red-600">{formErrors.form}</p>
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md bg-violet-600 py-2 text-white font-medium transition hover:bg-violet-700 active:scale-[.99] disabled:opacity-60"
              >
                {isSubmitting ? "Đang xử lý..." : "Sign In"}
              </button>
            </form>

            <p className="mt-2 text-center text-[11px] text-gray-500">
              Don’t have account?
              <Link to="/signup" className="pl-1 text-blue-600 hover:underline">
                Sign Up Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
