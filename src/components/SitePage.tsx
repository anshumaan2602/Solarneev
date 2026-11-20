"use client";

import type { Copy, Lang } from "@/content";
import { CalcProvider } from "./providers/CalcProvider";
import { LangProvider, useLang } from "./providers/LangProvider";
import { Contact } from "./sections/Contact";
import { Faq } from "./sections/Faq";
import { FitTabs } from "./sections/FitTabs";
import { Footer } from "./sections/Footer";
import { Header } from "./sections/Header";
import { LoansWarrantyDocs } from "./sections/LoansWarrantyDocs";
import { Packages } from "./sections/Packages";
import { Process } from "./sections/Process";
import { Reviews } from "./sections/Reviews";
import { StateTopUps } from "./sections/StateTopUps";
import { Stats } from "./sections/Stats";
import { SubsidyChart } from "./sections/SubsidyChart";
import { SystemTypes } from "./sections/SystemTypes";
import { Team } from "./sections/Team";
import s from "./SitePage.module.css";

/** The whole home page. Both /, in English, and /hi/, in Hindi, render this with their own text. */
export function SitePage({ initialLang, initialCopy }: { initialLang: Lang; initialCopy: Copy }) {
  return (
    <LangProvider initialLang={initialLang} initialCopy={initialCopy}>
      <CalcProvider>
        <Page />
      </CalcProvider>
    </LangProvider>
  );
}

function Page() {
  const { lang } = useLang();
  return (
    <div id="top" lang={lang} className={s.root}>
      <Header />
      <Stats />
      <Packages />
      <SystemTypes />
      <SubsidyChart />
      <FitTabs />
      <StateTopUps />
      <Process />
      <Team />
      <Reviews />
      <LoansWarrantyDocs />
      <Faq />
      <Contact />
      <Footer />
    </div>
  );
}
