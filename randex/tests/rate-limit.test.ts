import { describe, it, expect } from "vitest";
import { MemoryRateLimiter } from "@/lib/rate-limit";

describe("MemoryRateLimiter", () => {
  it("allows then blocks", () => {
    const lim = new MemoryRateLimiter(2, 60_000);
    expect(lim.tryConsume("1.1.1.1")).toBe(true);
    expect(lim.tryConsume("1.1.1.1")).toBe(true);
    expect(lim.tryConsume("1.1.1.1")).toBe(false);
    expect(lim.tryConsume("2.2.2.2")).toBe(true);
  });
});
