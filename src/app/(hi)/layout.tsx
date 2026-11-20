import type { Metadata } from "next";
import { pageMetadata } from "../_shared/metadata";
import { RootShell } from "../_shared/RootShell";

export const metadata: Metadata = pageMetadata("hi");

export default function HindiLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootShell lang="hi">{children}</RootShell>;
}
