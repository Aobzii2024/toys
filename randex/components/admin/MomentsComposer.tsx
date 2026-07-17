"use client";

import { useMemo, useRef, useState } from "react";

type Props = {
  defaultBody?: string;
  defaultImages?: string[];
  submitLabel?: string;
  postId?: number;
  /** hide submit when parent AutoSaveForm handles save */
  hideSubmit?: boolean;
};

const MAX_IMAGES = 30;
const PREVIEW_SLOTS = 8;

/**
 * Moments composer: text + images.
 * "+" inside textarea (bottom-right). Selecting images uploads immediately.
 */
export function MomentsComposer({
  defaultBody = "",
  defaultImages = [],
  submitLabel = "发表",
  postId,
  hideSubmit = false,
}: Props) {
  const [body, setBody] = useState(defaultBody);
  const [images, setImages] = useState<string[]>(defaultImages);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  const visible = useMemo(() => {
    if (showAll || images.length <= PREVIEW_SLOTS) return images;
    return images.slice(0, PREVIEW_SLOTS);
  }, [images, showAll]);

  const extraCount = Math.max(0, images.length - PREVIEW_SLOTS);

  function setImagesAndNotify(next: string[]) {
    setImages(next);
    // keep hidden input in sync for FormData + fire change for AutoSaveForm
    queueMicrotask(() => {
      if (imagesInputRef.current) {
        imagesInputRef.current.value = JSON.stringify(next);
        imagesInputRef.current.dispatchEvent(
          new Event("input", { bubbles: true }),
        );
        imagesInputRef.current.dispatchEvent(
          new Event("change", { bubbles: true }),
        );
      }
    });
  }

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;
    const room = MAX_IMAGES - images.length;
    if (room <= 0) {
      setStatus(`最多 ${MAX_IMAGES} 张图片`);
      return;
    }
    const batch = list.slice(0, room);
    setUploading(true);
    setStatus(null);
    const next: string[] = [];
    try {
      for (let i = 0; i < batch.length; i++) {
        const fd = new FormData();
        fd.append("file", batch[i]);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: fd,
        });
        const data = (await res.json()) as {
          ok?: boolean;
          error?: string;
          data?: { url?: string };
        };
        if (!res.ok || !data.ok || !data.data?.url) {
          setStatus(data.error || `第 ${i + 1} 张上传失败`);
          continue;
        }
        next.push(data.data.url);
      }
      if (next.length) {
        setImagesAndNotify([...images, ...next].slice(0, MAX_IMAGES));
      }
    } catch {
      setStatus("网络错误");
    } finally {
      setUploading(false);
    }
  }

  function removeAt(idx: number) {
    setImagesAndNotify(images.filter((_, i) => i !== idx));
  }

  return (
    <>
      {postId != null ? <input type="hidden" name="id" value={postId} /> : null}
      <input
        ref={imagesInputRef}
        type="hidden"
        name="images_json"
        defaultValue={JSON.stringify(images)}
      />
      <input type="hidden" name="title" value="" />

      <div className="moments-composer">
        <label className="field-label" htmlFor="body_md">
          这一刻的想法
        </label>

        <div className="moments-input-shell">
          <textarea
            id="body_md"
            name="body_md"
            className="moments-text"
            placeholder="分享这一刻…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
          />
          <button
            type="button"
            className="moments-plus"
            disabled={uploading || images.length >= MAX_IMAGES}
            aria-label="添加照片"
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? "…" : "+"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) void uploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {images.length > 0 ? (
          <div className="moments-grid" aria-label="已选图片">
            {visible.map((url, i) => (
              <div className="moments-cell" key={`${url}-${i}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="spotlight" />
                <button
                  type="button"
                  className="moments-remove"
                  onClick={() => removeAt(i)}
                  aria-label="移除图片"
                >
                  ×
                </button>
              </div>
            ))}
            {!showAll && extraCount > 0 ? (
              <button
                type="button"
                className="moments-cell moments-more"
                onClick={() => setShowAll(true)}
              >
                <span>…</span>
                <small>+{extraCount}</small>
              </button>
            ) : null}
          </div>
        ) : null}

        {showAll && images.length > PREVIEW_SLOTS ? (
          <button
            type="button"
            className="admin-btn secondary small"
            style={{ marginTop: "0.5rem" }}
            onClick={() => setShowAll(false)}
          >
            收起图片
          </button>
        ) : null}

        {status ? <p className="field-hint">{status}</p> : null}

        {!hideSubmit ? (
          <div className="form-actions">
            <button type="submit" className="admin-btn" disabled={uploading}>
              {uploading ? "上传中…" : submitLabel}
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
