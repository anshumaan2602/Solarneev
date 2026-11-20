import { SitePage } from "@/components/SitePage";
import { en } from "@/content/en";

export default function EnglishHome() {
  return <SitePage initialLang="en" initialCopy={en} />;
}
