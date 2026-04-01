import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Your Flex Benefit", template: "Login" },

  description:
    "Registration and Log In Instruction Flyer · Forgot Your Password? Forgot Your Username? Received a Mailed Registration Code? Register as a New User?",

  keywords: [
    "aptia365",
    "aptia retirement",
    "aptia365 login",
    "aptia365 Mercedes",
    "aptia365 HSA",
    "aptia365 FSA",
    "aptia 365",
    "aptia benefits",
    "aptia",
  ],

  openGraph: {
    type: "website",
    url: "",
    siteName: "Your Flex Benefit",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
          {children}
        </div>
      </body>
    </html>
  );
}
