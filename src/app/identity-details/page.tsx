import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import { AuthFlowGuard } from "@/components/AuthFlowGuard";
import { IdentityDetailsCard } from "@/sections/IdentityDetailsCard";

export default function IdentityDetailsRoute() {
  return (
    <>
      <Header />
      <AuthFlowGuard step="identity">
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <IdentityDetailsCard />
        </main>
      </AuthFlowGuard>
      <Footer />
    </>
  );
}

