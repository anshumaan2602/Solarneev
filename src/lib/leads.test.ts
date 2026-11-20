import { afterEach, describe, expect, it, vi } from "vitest";
import { parseIndianMobile, submitLead } from "./leads";

describe("parseIndianMobile", () => {
  it.each([
    "9876543210",
    "98765 43210",
    "+91 98765-43210",
    "+919876543210",
    "0091 98765 43210",
    "+91 0 98765 43210",
    "098765 43210",
    "(98765) 43210",
    "९८७६५४३२१०", // Devanagari digits, as typed on a Hindi keyboard
    "+९१ ९८७६५ ४३२१०",
  ])("accepts %s", (raw) => {
    expect(parseIndianMobile(raw)).toBe("9876543210");
  });
  it("keeps a 10-digit number that happens to start with 91", () => {
    expect(parseIndianMobile("9198765432")).toBe("9198765432");
  });
  it.each(["", "12345", "5876543210", "98765432101", "+44 7911 123456"])("rejects %s", (raw) => {
    expect(parseIndianMobile(raw)).toBeNull();
  });
});

describe("submitLead", () => {
  const lead = { subject: "Test", fields: { Name: "Asha", Mobile: "9876543210" } };
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
  const stubFetch = (impl: () => Promise<Response>) => {
    const fetchMock = vi.fn(impl);
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  };

  it("never reports success without an access key", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = stubFetch(async () => new Response("{}"));
    expect(await submitLead(lead, "")).toEqual({ ok: false, reason: "missing-key" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(err).toHaveBeenCalled();
  });
  it("posts the key, subject and fields, and reports success", async () => {
    const fetchMock = stubFetch(async () => Response.json({ success: true }));
    expect(await submitLead(lead, "key-123")).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const body = init.body as FormData;
    expect(url).toBe("https://api.web3forms.com/submit");
    expect([body.get("access_key"), body.get("subject"), body.get("Name"), body.get("Mobile")]).toEqual(["key-123", "Test", "Asha", "9876543210"]);
  });
  it("reports a rejection from the service", async () => {
    stubFetch(async () => Response.json({ success: false }, { status: 400 }));
    expect(await submitLead(lead, "key-123")).toEqual({ ok: false, reason: "rejected" });
  });
  it("reports a network failure", async () => {
    stubFetch(async () => {
      throw new TypeError("Failed to fetch");
    });
    expect(await submitLead(lead, "key-123")).toEqual({ ok: false, reason: "network" });
  });
  it("drops spam-trap submissions without sending", async () => {
    const fetchMock = stubFetch(async () => Response.json({ success: true }));
    expect(await submitLead({ ...lead, botcheck: true }, "key-123")).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
