import React, { useRef, useState } from "react";
import { Upload, Image as ImageIcon, X, Loader2, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";

/** Convert relative /api/media/... URL to absolute with backend base */
function absolutize(url) {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/api/")) return `${BACKEND_URL}${url}`;
  return url;
}

/**
 * ImageUploader — dual-mode input for admin forms.
 * Props: value (URL), onChange(url), kind ('doctors'|'services'|'gallery'|'blogs'|'logo'|'hero'|'misc'),
 *        aspect ('square'|'wide'|'portrait'), testid
 */
export default function ImageUploader({ value, onChange, kind = "misc", aspect = "wide", testid = "image-uploader", label }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState("upload"); // 'upload' | 'url'

  const aspectClass = aspect === "square" ? "aspect-square" : aspect === "portrait" ? "aspect-[3/4]" : "aspect-video";

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Max file size is 15 MB");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);
    setUploading(true);
    setProgress(0);
    try {
      const { data } = await api.post("/admin/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      onChange(data.url);
      toast.success("Uploaded");
    } catch (err) {
      const msg = err.response?.data?.detail || "Upload failed";
      toast.error(msg);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const onPick = () => inputRef.current?.click();
  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const previewUrl = value ? absolutize(value) : null;

  return (
    <div data-testid={testid} className="space-y-2">
      {label && <div className="text-sm font-medium">{label}</div>}
      <div className="flex gap-1 text-xs">
        <button type="button" onClick={() => setMode("upload")} className={`px-2 py-1 rounded ${mode === "upload" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/70"}`} data-testid={`${testid}-mode-upload`}>
          <Upload className="w-3 h-3 inline mr-1" /> Upload
        </button>
        <button type="button" onClick={() => setMode("url")} className={`px-2 py-1 rounded ${mode === "url" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/70"}`} data-testid={`${testid}-mode-url`}>
          <LinkIcon className="w-3 h-3 inline mr-1" /> URL
        </button>
      </div>

      {mode === "upload" ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className={`relative ${aspectClass} rounded-xl border-2 border-dashed border-border bg-secondary/40 overflow-hidden hover:border-primary/60`}
          style={{ transitionProperty: "border-color", transitionDuration: "200ms" }}
        >
          {previewUrl ? (
            <>
              <img src={previewUrl} alt="preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 grid place-items-center gap-2" style={{ transitionProperty: "opacity", transitionDuration: "200ms" }}>
                <Button type="button" size="sm" onClick={onPick} disabled={uploading} className="bg-white text-primary hover:bg-white/90" data-testid={`${testid}-replace-btn`}>
                  <Upload className="w-3.5 h-3.5 mr-1" /> Replace
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => onChange("")} className="bg-white/10 backdrop-blur text-white border-white/30" data-testid={`${testid}-remove-btn`}>
                  <X className="w-3.5 h-3.5 mr-1" /> Remove
                </Button>
              </div>
            </>
          ) : (
            <button type="button" onClick={onPick} disabled={uploading} className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground hover:text-primary" data-testid={`${testid}-pick-btn`}>
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <div className="mt-2 text-xs">Uploading… {progress}%</div>
                </>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8" />
                  <div className="mt-2 text-xs font-medium">Tap to upload from gallery</div>
                  <div className="text-[10px]">or drag & drop • JPG/PNG/WEBP • Max 15MB</div>
                </>
              )}
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
            data-testid={`${testid}-file-input`}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://.../image.jpg"
            data-testid={`${testid}-url-input`}
          />
          {previewUrl && (
            <div className={`${aspectClass} rounded-xl overflow-hidden bg-secondary/40 border border-border`}>
              <img src={previewUrl} alt="preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
