import { describe, expect, it } from "vitest";
import { langFromPath, pathForLang } from "./langPath";

describe("language addresses", () => {
  it.each([
    ["/", "en", "/", "/hi/"],
    ["/hi/", "hi", "/", "/hi/"],
    ["/hi", "hi", "/", "/hi/"],
    ["/index.html", "en", "/", "/hi/"],
    ["/hi/index.html", "hi", "/", "/hi/"],
    ["/site/", "en", "/site/", "/site/hi/"],
    ["/site/hi/", "hi", "/site/", "/site/hi/"],
    ["/delhi/", "en", "/delhi/", "/delhi/hi/"], // a folder that merely ends in "hi"
  ])("%s is %s; English at %s, Hindi at %s", (path, lang, enPath, hiPath) => {
    expect(langFromPath(path)).toBe(lang);
    expect(pathForLang(path, "en")).toBe(enPath);
    expect(pathForLang(path, "hi")).toBe(hiPath);
  });
});
