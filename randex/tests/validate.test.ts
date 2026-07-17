import { describe, it, expect } from "vitest";
import { isValidQQ, containsBlocked, clampMessage } from "@/lib/validate";

describe("validate", () => {
  it("checks QQ", () => {
    expect(isValidQQ("12345")).toBe(true);
    expect(isValidQQ("0123")).toBe(false);
    expect(isValidQQ("abc")).toBe(false);
  });

  it("detects blocked words", () => {
    expect(containsBlocked("你好世界", ["垃圾"])).toBe(false);
    expect(containsBlocked("你是垃圾", ["垃圾"])).toBe(true);
  });

  it("clamps fields", () => {
    const r = clampMessage({
      name: "  Alice  ",
      qq: "123456",
      body: " hi ",
    });
    expect(r.name).toBe("Alice");
    expect(r.body).toBe("hi");
  });
});
