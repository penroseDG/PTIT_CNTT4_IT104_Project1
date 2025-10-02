import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import bg from "../../img/image 9.png"; 

type Errors = { email?: string; password?: string; form?: string };

export default function SignIn() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState("");

  const validate = () => {
    const e: Errors = {};
    if (!email.trim()) e.email = "Email không được bỏ trống.";
    if (!password) e.password = "Mật khẩu không được bỏ trống.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    setSuccess("");
    setErrors({});

    if (!validate()) return;

    const raw = localStorage.getItem("auth_user");
    const saved = raw ? (JSON.parse(raw) as { email: string; password: string }) : null;

    if (!saved || saved.email !== email || saved.password !== password) {
      setErrors({ form: "Email hoặc mật khẩu không đúng." });
      return;
    }

    setSuccess("Sign In Successfully");
    setTimeout(() => nav("/", { replace: true }), 800);
  };

  const inputCls = (hasErr?: string) =>
    `w-full rounded-md border px-3 py-2 outline-none focus:ring-1 ${
      hasErr
        ? "border-red-500 focus:ring-red-200"
        : "border-gray-200 focus:ring-gray-300"
    }`;

  return (
    <section className="h-screen w-screen bg-neutral-800 text-sm">
      <div className="relative">
        <img src={bg} alt="background" className="h-screen w-screen object-cover object-center" />
        <div className="pointer-events-none absolute inset-0 bg-black/10" />

        <div className="absolute left-1/2 top-[55%] w-full max-w-[340px] -translate-x-1/2 -translate-y-1/2">
          <div className="rounded-xl bg-white/95 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm">
            <h2 className="mb-1 text-center text-[13px] font-semibold">
              <span role="img" aria-label="lock"></span> Sign In
            </h2>

            {success && (
              <p className="mb-2 text-center text-[12px] font-medium text-green-600">
                {success}
              </p>
            )}
            {errors.form && (
              <p className="mb-2 text-center text-[12px] font-medium text-red-600">
                {errors.form}
              </p>
            )}

            <form className="space-y-3" onSubmit={handleSubmit} noValidate>
              <div>
                <input
                  type="email"
                  placeholder="Email here ..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls(errors.email)}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password here ..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls(errors.password)}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-violet-600 py-2 text-white font-medium transition hover:bg-violet-700 active:scale-[.99]"
              >
                Sign In
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
    </section>
  );
}
