"use client";
export function Footer() {
  return (
    <footer className="w-full bg-[#1A3A4A] py-[18.5px]">
      <div className="flex items-center justify-center gap-1 text-xs text-white">
        <a 
          href="#" 
          className="hover:underline uppercase tracking-wide"
        >
          Privacy Notice
        </a>
        <span className="mx-1">|</span>
        <a 
          href="#" 
          className="hover:underline uppercase tracking-wide"
        >
          Terms of Use
        </a>
      </div>
    </footer>
  );
}
