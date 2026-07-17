"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { previewMarkdown } from "@/lib/actions/posts";

type Props = {
  name: string;
  defaultValue?: string;
  label?: string;
};

export function MarkdownEditor({
  name,
  defaultValue = "",
  label = "正文 (Markdown)",
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const [html, setHtml] = useState("");
  const [pending, startTransition] = useTransition();

  const refreshPreview = useCallback(
    (source: string) => {
      startTransition(async () => {
        const rendered = await previewMarkdown(source);
        setHtml(rendered);
      });
    },
    [],
  );

  useEffect(() => {
    refreshPreview(defaultValue);
    // initial only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => refreshPreview(value), 350);
    return () => clearTimeout(t);
  }, [value, refreshPreview]);

  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <div className="md-editor">
        <div className="pane">
          <div className="pane-head">编辑</div>
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            spellCheck={false}
          />
        </div>
        <div className="pane">
          <div className="pane-head">
            预览{pending ? " …" : ""}
          </div>
          <div
            className="md-preview"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}
