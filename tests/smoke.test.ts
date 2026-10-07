import { describe, it, expect } from "vitest";

describe("Smoke test", () => {
  it("validates environment setup and basic assertions", () => {
    expect(1 + 1).toBe(2);
  });

  it("ensures RTL support constants", () => {
    const localeConfig = {
      lang: "he",
      dir: "rtl",
    };
    expect(localeConfig.lang).toBe("he");
    expect(localeConfig.dir).toBe("rtl");
  });
});
