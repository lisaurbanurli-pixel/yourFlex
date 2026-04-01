import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import { TwoFactorVerifyCardStep2 } from "@/sections/TwoFactorVerifyCard";
import { AuthFlowGuard } from "@/components/AuthFlowGuard";

export default function TwoFactorVerify2Page() {
  return (
    <>
      <Header />
      <AuthFlowGuard step="verify2">
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <TwoFactorVerifyCardStep2 />
        </main>
      </AuthFlowGuard>
      <Footer />
    </>
  );
}

