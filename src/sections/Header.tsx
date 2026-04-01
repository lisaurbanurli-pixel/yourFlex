"use client";
import Link from "next/link";

export function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-100">
      <div className="px-5 py-3">
        <Link href="/" className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C389] rounded">
          <img
            src="/logo.png"
            alt="Aptia365"
            className="h-[52px] w-auto"
          />
        </Link>
      </div>
    </header>
  );
}
