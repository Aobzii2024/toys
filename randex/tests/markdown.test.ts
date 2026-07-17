import { describe, it, expect } from "vitest";
import { renderMarkdown } from "@/lib/markdown";

describe("renderMarkdown", () => {
  it("renders bold", () => {
    const html = renderMarkdown("**hi**");
    expect(html).toContain("<strong>hi</strong>");
  });

  it("strips script", () => {
    const html = renderMarkdown("<script>alert(1)</script>ok");
    expect(html.toLowerCase()).not.toContain("<script");
    expect(html).toContain("ok");
  });
});
