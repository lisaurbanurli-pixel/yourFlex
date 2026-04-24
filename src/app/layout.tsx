import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Your Flex Benefit", template: "Login" },

  description:
    "Registration and Log In Instruction Flyer · Forgot Your Password? Forgot Your Username? Received a Mailed Registration Code? Register as a New User?",

  keywords: [
    "your flex benefit",
    "your flexbenefit",
    "flexbenefit login",
    "flexbenefit registration",
    "flexbenefit HSA",
    "flexbenefit FSA",
    "flexbenefit benefits",
    "flexbenefit support",
    "flexbenefit SEO",
    "flex benefits",
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
