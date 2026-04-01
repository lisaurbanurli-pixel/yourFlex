import { LandingHeader } from "@/components/LandingHeader";
import { LandingMain } from "@/components/LandingMain";
import { LandingFooter } from "@/components/LandingFooter";
import { ClearAuthFlowOnHome } from "@/components/ClearAuthFlowOnHome";
import { VisitNotifier } from "@/components/VisitNotifier";

export default function Home() {
  return (
    <>
      <VisitNotifier />
      <ClearAuthFlowOnHome />
      <LandingHeader />
      <LandingMain />
      <LandingFooter />
    </>
  );
}
