import { Header } from '@/sections/Header';
import { Footer } from '@/sections/Footer';
import { TwoFactorVerifyCard } from '@/sections/TwoFactorVerifyCard';
import { AuthFlowGuard } from '@/components/AuthFlowGuard';

export default function TwoFactorVerifyPage() {
  return (
    <>
      <Header />
      <AuthFlowGuard step="verify">
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <TwoFactorVerifyCard />
        </main>
      </AuthFlowGuard>
      <Footer />
    </>
  );
}
