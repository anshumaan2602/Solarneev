import type { Metadata } from "next";
import { pageMetadata } from "../_shared/metadata";
import { RootShell } from "../_shared/RootShell";

export const metadata: Metadata = pageMetadata("en");

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootShell lang="en">{children}</RootShell>;
}
