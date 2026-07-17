"use client";

import { useRef, useState } from "react";

type Props = {
  name: string;
  defaultValue?: string;
  label?: string;
  id?: string;
  hint?: string;
};

/**
 * Album-style image picker: choose from device gallery and upload.
 * No manual URL typing.
 */
export function ImageUploadField({
  name,
  defaultValue = "",
  label = "图片",
  id,
  hint,
}: Props) {
  const fieldId = id ?? name;
  const [url, setUrl] = useState(defaultValue);
  const [status, setStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setStatus(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
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
        setStatus(data.error || "上传失败");
        return;
      }
      setUrl(data.data.url);
      setStatus("已添加");
      // notify AutoSaveForm
      queueMicrotask(() => {
        const hidden = document.getElementById(fieldId) as HTMLInputElement | null;
        if (hidden) {
          hidden.dispatchEvent(new Event("input", { bubbles: true }));
          hidden.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    } catch {
      setStatus("网络错误");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function clearImage() {
    setUrl("");
    setStatus(null);
    queueMicrotask(() => {
      const hidden = document.getElementById(fieldId) as HTMLInputElement | null;
      if (hidden) {
        hidden.value = "";
        hidden.dispatchEvent(new Event("input", { bubbles: true }));
        hidden.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  }

  return (
    <div className="field admin-upload">
      <label htmlFor={`${fieldId}-file`}>{label}</label>
      <input type="hidden" id={fieldId} name={name} value={url} readOnly />

      <div className="admin-upload-album">
        {url ? (
          <div className="admin-upload-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" />
            <div className="admin-upload-preview-actions">
              <button
                type="button"
                className="admin-btn secondary small"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "上传中…" : "更换"}
              </button>
              <button
                type="button"
                className="admin-btn danger secondary small"
                onClick={clearImage}
                disabled={uploading}
              >
                移除
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="admin-upload-pick"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            <span className="admin-upload-pick-icon">＋</span>
            <span>{uploading ? "上传中…" : "从相册添加"}</span>
            <small>支持 jpg / png / webp / gif</small>
          </button>
        )}
        <input
          ref={fileRef}
          id={`${fieldId}-file`}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          // mobile album / camera roll
          capture={undefined}
          onChange={onFileChange}
          disabled={uploading}
          hidden
        />
      </div>

      {status ? (
        <p className="field-hint" style={{ marginTop: "0.4rem" }}>
          {status}
        </p>
      ) : null}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}
