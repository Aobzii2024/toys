import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";

const md = new MarkdownIt({ html: true, linkify: true, breaks: true });

const allowedTags = sanitizeHtml.defaults.allowedTags.concat([
  "img",
  "video",
  "source",
  "h1",
  "h2",
]);

const allowedAttributes: Record<string, string[]> = {
  ...sanitizeHtml.defaults.allowedAttributes,
  img: ["src", "alt", "title"],
  video: ["src", "controls", "width", "height"],
  source: ["src", "type"],
  a: ["href", "name", "target", "rel"],
};

export function renderMarkdown(source: string): string {
  const raw = md.render(source ?? "");
  return sanitizeHtml(raw, {
    allowedTags,
    allowedAttributes,
    allowedSchemes: ["http", "https", "data"],
  });
}
