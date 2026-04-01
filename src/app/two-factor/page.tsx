import { Header } from '@/sections/Header';
import { Footer } from '@/sections/Footer';
import { TwoFactorSelectCard } from '@/sections/TwoFactorSelectCard';
import { AuthFlowGuard } from '@/components/AuthFlowGuard';

export default function TwoFactorPage() {
  return (
    <>
      <Header />
      <AuthFlowGuard step="two-factor">
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <TwoFactorSelectCard />
        </main>
      </AuthFlowGuard>
      <Footer />
    </>
  );
}
