import Image from "next/image";
import Link from "next/link";

export function LandingHeader() {
  return (
    <header className="bg-white border-b border-[#E5E7EB] shadow-sm">
      <div className="mx-auto flex max-w-[1300px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3" href="/">
          <Image
            src="/logo.png"
            alt="Your Flex Benefit"
            width={120}
            height={40}
            loading="eager"
            className="h-auto w-auto"
            style={{ width: "auto", height: "auto" }}
          />
          <span className="text-lg font-semibold text-[#00C389]">
            Your Flex Benefits
          </span>
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          <Link
            className="rounded-full border border-[#D1D5DB] px-4 py-2 text-sm font-medium text-[#0F172A] transition hover:border-[#00C389] hover:text-[#00C389]"
            href="/identity-details"
          >
            Login
          </Link>
          <Link
            className="rounded-full bg-[#00C389] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0F976B]"
            href="/identity-details"
          >
            Register
          </Link>
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <Link
            href="/identity-details"
            className="rounded-full border border-[#D1D5DB] p-2 text-[#0F172A] hover:border-[#00C389] hover:text-[#00C389]"
          >
            <i className="fa fa-user-circle"></i>
          </Link>
          <Link
            href="/identity-details"
            className="rounded-full bg-[#00C389] p-2 text-white hover:bg-[#0F976B]"
          >
            <i className="fa fa-sign-in"></i>
          </Link>
        </div>
      </div>
    </header>
  );
}
