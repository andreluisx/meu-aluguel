import { Benefits, Faq, Features, Hero, Plans, Problem, SiteFooter, Steps } from "@/components/landing/Sections";
import { SiteHeader } from "@/components/landing/SiteHeader";

export default function Home() {
  return (<><SiteHeader /><main><Hero /><Problem /><Steps /><Features /><Benefits /><Plans /><Faq /></main><SiteFooter /></>);
}
