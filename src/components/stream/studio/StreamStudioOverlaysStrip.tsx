"use client";

import { useRef, type ChangeEvent } from "react";
import { Plus, X } from "lucide-react";

type Props = {
  images: string[];
  onImagesChange: (next: string[]) => void;
};

export function StreamStudioOverlaysStrip({ images, onImagesChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    onImagesChange([...images, url]);
    e.target.value = "";
  };

  const handleRemove = (url: string) => {
    onImagesChange(images.filter((img) => img !== url));
    URL.revokeObjectURL(url);
  };

  return (
    <div className="box-border w-full min-w-0 shrink-0 border-t border-[#26262c] bg-[#18181b] px-4 py-3">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#53535f]">Stream overlay rasmlari</p>
      <div className="flex min-w-0 items-center gap-3 overflow-x-auto pb-1 [scrollbar-width:thin]">
        <button
          type="button"
          onClick={handleAddClick}
          className="flex h-[190px] w-[150px] shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-[#3e3e44] text-[#53535f] transition-colors hover:border-[#a970ff] hover:text-[#a970ff]"
          title="Rasm qo&apos;shish"
        >
          <Plus className="h-6 w-6" aria-hidden />
          <span className="text-[10px] font-medium">Rasm qo&apos;shish</span>
        </button>

        {images.map((url, idx) => (
          <div key={`${url}-${idx}`} className="group relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-[190px] w-[150px] rounded-lg border border-[#26262c] object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff4f4f]/90 text-white opacity-0 transition-opacity group-hover:opacity-100"
              title="O&apos;chirish"
            >
              <X className="h-3 w-3" aria-hidden />
            </button>
          </div>
        ))}

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>
    </div>
  );
}
