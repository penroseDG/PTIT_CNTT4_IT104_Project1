import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8080";

type Admin = {
  username: string;
  password: string;
  // nếu sau này bạn thêm status: boolean | null có thể bổ sung type ở đây
};

export default function LoginAdmin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  // nếu đã đăng nhập thì chuyển vào Dashboard
  useEffect(() => {
    const currentAdmin = localStorage.getItem("currentAdmin");
    if (currentAdmin) navigate("/admin");
  }, [navigate]);

  // Prefill remember me
  useEffect(() => {
    const remembered = localStorage.getItem("admin_remember") === "true";
    const savedUsername = localStorage.getItem("admin_saved_username") || "";
    if (remembered) {
      setRememberMe(true);
      setUsername(savedUsername);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    // basic validate
    const newErrors: { username?: string; password?: string } = {};
    if (!username.trim()) newErrors.username = "Please enter your username";
    if (!password.trim()) newErrors.password = "Please enter your password";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      // LỌC TRÊN SERVER (json-server)
      const res = await axios.get<Admin[]>(`${API}/admin`, {
        params: { username: username.trim(), password: password.trim() },
      });

      const match = Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null;

      if (!match) {
        setFormError("Incorrect username or password!");
        return;
      }

      // Nếu db.json của bạn KHÔNG có status cho admin, bỏ qua check status
      // Nếu sau này thêm status, có thể check:
      // if ((match as any).status === false) { setFormError("Your account is blocked."); return; }

      // Lưu session
      localStorage.setItem("currentAdmin", JSON.stringify({ username: match.username }));

      // Remember me
      if (rememberMe) {
        localStorage.setItem("admin_saved_username", match.username);
        localStorage.setItem("admin_remember", "true");
      } else {
        localStorage.removeItem("admin_saved_username");
        localStorage.removeItem("admin_remember");
      }

      setErrors({});
      navigate("/admin");
    } catch (err) {
      setFormError("Cannot connect to server. Please try again later!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full max-w-md">
        <div className="bg-white p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Financial <span className="text-indigo-600">Manager</span>
            </h1>
            <p className="text-gray-600 mt-2">Admin Login</p>
          </div>

          {formError && (
            <p className="text-red-600 text-center font-medium mb-4">{formError}</p>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrors((prev) => ({ ...prev, username: undefined }));
                }}
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${
                  errors.username
                    ? "border-red-500 bg-red-50 placeholder-red-400"
                    : "border-gray-300"
                }`}
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-600">{errors.username}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${
                  errors.password
                    ? "border-red-500 bg-red-50 placeholder-red-400"
                    : "border-gray-300"
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-gray-700">Remember me</span>
              </label>

              <div className="text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  click here!
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="text-center mt-6 text-sm text-gray-500">
            © 2025 - Maker Education
          </div>
        </div>
      </div>
    </div>
  );
}
