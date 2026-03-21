"use client";

import { useState } from "react";
import { X, Plus, GripVertical, ImageOff, Loader2 } from "lucide-react";
import { Button } from "./button";

export type Photo = {
  url: string;
  thumb: string;
  alt: string;
  credit: string;
};

type PhotoManagerProps = {
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
  saving?: boolean;
};

function makeThumb(url: string): string {
  // Unsplash: add &w=400 or &w=600 for thumb
  if (url.includes("unsplash.com")) {
    try {
      const u = new URL(url);
      u.searchParams.set("w", "400");
      u.searchParams.set("q", "75");
      return u.toString();
    } catch {
      return url;
    }
  }
  return url;
}

export function PhotoManager({ photos, onChange, saving }: PhotoManagerProps) {
  const [urlInput, setUrlInput] = useState("");
  const [altInput, setAltInput] = useState("");
  const [creditInput, setCreditInput] = useState("");
  const [previewError, setPreviewError] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAdd = () => {
    if (!urlInput.trim()) return;
    const thumb = makeThumb(urlInput.trim());
    const newPhoto: Photo = {
      url: urlInput.trim(),
      thumb,
      alt: altInput.trim() || "Room photo",
      credit: creditInput.trim() || "",
    };
    onChange([...photos, newPhoto]);
    setUrlInput("");
    setAltInput("");
    setCreditInput("");
    setPreviewError(false);
    setAdding(false);
  };

  const handleRemove = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const next = [...photos];
    [next[index - 1], next[index]] = [next[index]!, next[index - 1]!];
    onChange(next);
  };

  const handleMoveDown = (index: number) => {
    if (index === photos.length - 1) return;
    const next = [...photos];
    [next[index], next[index + 1]] = [next[index + 1]!, next[index]!];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">
          Photos{" "}
          <span className="font-normal text-gray-400">({photos.length})</span>
        </p>
        {saving && (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Loader2 className="h-3 w-3 animate-spin" /> Saving…
          </span>
        )}
      </div>

      {/* Existing photos grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-lg border bg-gray-50"
            >
              <img
                src={photo.thumb || photo.url}
                alt={photo.alt}
                className="h-24 w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              {/* Overlay controls */}
              <div className="absolute inset-0 flex flex-col justify-between bg-black/0 p-1 transition-all group-hover:bg-black/40">
                {/* Order controls */}
                <div className="flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(i)}
                      disabled={i === 0}
                      className="rounded bg-white/80 px-1 py-0.5 text-xs font-bold text-gray-700 hover:bg-white disabled:opacity-30"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(i)}
                      disabled={i === photos.length - 1}
                      className="rounded bg-white/80 px-1 py-0.5 text-xs font-bold text-gray-700 hover:bg-white disabled:opacity-30"
                    >
                      →
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(i)}
                    className="rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>

                {/* Badge for main photo */}
                {i === 0 && (
                  <span className="self-start rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-gray-700">
                    Cover
                  </span>
                )}
              </div>

              {/* Alt text tooltip */}
              {photo.alt && (
                <p className="truncate bg-black/40 px-1.5 py-0.5 text-[10px] text-white">
                  {photo.alt}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 text-gray-400">
          <ImageOff className="h-8 w-8" />
          <p className="text-sm">No photos yet</p>
        </div>
      )}

      {/* Add photo form */}
      {adding ? (
        <div className="space-y-2 rounded-xl border bg-gray-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Add photo
          </p>
          <div>
            <label className="mb-0.5 block text-xs text-gray-500">
              Image URL *
            </label>
            <input
              type="url"
              autoFocus
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setPreviewError(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
            />
          </div>

          {/* Live preview */}
          {urlInput && (
            <div className="h-28 overflow-hidden rounded-lg border bg-white">
              {previewError ? (
                <div className="flex h-full items-center justify-center gap-2 text-sm text-gray-400">
                  <ImageOff className="h-4 w-4" /> Cannot load image
                </div>
              ) : (
                <img
                  src={urlInput}
                  alt="preview"
                  className="h-full w-full object-cover"
                  onError={() => setPreviewError(true)}
                />
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-0.5 block text-xs text-gray-500">
                Alt text
              </label>
              <input
                value={altInput}
                onChange={(e) => setAltInput(e.target.value)}
                placeholder="e.g. King bedroom view"
                className="w-full rounded-lg border bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
              />
            </div>
            <div>
              <label className="mb-0.5 block text-xs text-gray-500">
                Credit / Photographer
              </label>
              <input
                value={creditInput}
                onChange={(e) => setCreditInput(e.target.value)}
                placeholder="e.g. Photo by John"
                className="w-full rounded-lg border bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setAdding(false);
                setUrlInput("");
                setAltInput("");
                setCreditInput("");
                setPreviewError(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="flex-1 bg-[#1a1a2e] hover:bg-[#16213e]"
              onClick={handleAdd}
              disabled={!urlInput.trim() || previewError}
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Add
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-2.5 text-sm text-gray-500 transition hover:border-[#1a1a2e] hover:text-[#1a1a2e]"
        >
          <Plus className="h-4 w-4" />
          Add photo
        </button>
      )}

      <p className="text-xs text-gray-400">
        First photo is used as the cover image. Hover over photos to reorder or
        remove.
      </p>
    </div>
  );
}
