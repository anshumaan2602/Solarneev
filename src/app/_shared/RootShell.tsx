import type { Lang } from "@/content";
import { fontVariables } from "./fonts";
import "../globals.css";

/** The <html> and <body> both language versions share. */
export function RootShell({ lang, children }: Readonly<{ lang: Lang; children: React.ReactNode }>) {
  return (
    <html lang={lang} style={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
