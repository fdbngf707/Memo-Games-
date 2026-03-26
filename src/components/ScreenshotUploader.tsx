import { useState } from "react";
import { Upload, Link as LinkIcon, Loader2, Plus, X, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ScreenshotUploaderProps {
  screenshots: string[];
  onChange: (screenshots: string[]) => void;
}

const ScreenshotUploader = ({ screenshots, onChange }: ScreenshotUploaderProps) => {
  const [mode, setMode] = useState<"url" | "file">("file");
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);

  const addScreenshot = (url: string) => {
    if (url && !screenshots.includes(url)) {
      onChange([...screenshots, url]);
    }
  };

  const removeScreenshot = (idx: number) => {
    onChange(screenshots.filter((_, i) => i !== idx));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        if (uploadError.message.includes('not found') || uploadError.message.includes('Bucket') || (uploadError as any).statusCode === 404) {
          toast.error('Storage bucket "images" not found. Create it in Supabase → Storage → New Bucket (name: images, public: ON).');
        } else if (uploadError.message.includes('security') || uploadError.message.includes('policy') || uploadError.message.includes('permission')) {
          toast.error('Upload denied. Enable public access on "images" bucket in Supabase → Storage.');
        } else {
          toast.error("Upload failed: " + uploadError.message);
        }
        return;
      }

      const { data: urlData } = supabase.storage.from("images").getPublicUrl(filePath);
      addScreenshot(urlData.publicUrl);
      toast.success("Screenshot uploaded!");
    } catch (err) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleAddUrl = () => {
    if (urlInput.trim()) {
      addScreenshot(urlInput.trim());
      setUrlInput("");
    }
  };

  return (
    <div className="space-y-3 bg-secondary/30 p-4 rounded-xl border border-border/50">
      <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
        <ImagePlus className="w-4 h-4 text-primary" /> Screenshots / Gallery
      </label>

      {/* Preview grid */}
      {screenshots.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {screenshots.map((url, idx) => (
            <div key={idx} className="relative group aspect-video">
              <img
                src={url}
                alt={`Screenshot ${idx + 1}`}
                className="w-full h-full object-cover rounded-lg border border-border"
              />
              <button
                type="button"
                onClick={() => removeScreenshot(idx)}
                className="absolute top-1 right-1 bg-destructive/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {idx + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => setMode("file")}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
            mode === "file" ? "gradient-btn" : "bg-secondary text-secondary-foreground"
          }`}
        >
          <Upload className="w-3 h-3" /> Upload
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
            mode === "url" ? "gradient-btn" : "bg-secondary text-secondary-foreground"
          }`}
        >
          <LinkIcon className="w-3 h-3" /> URL
        </button>
      </div>

      {/* Input */}
      {mode === "file" ? (
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary/20 file:text-primary file:text-xs file:px-3 file:py-1 file:font-medium disabled:opacity-50"
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary/80 rounded-lg">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Uploading...</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Paste image URL..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddUrl(); } }}
            className="flex-1 px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            disabled={!urlInput.trim()}
            className="gradient-btn px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        {screenshots.length} screenshot{screenshots.length !== 1 ? "s" : ""} added. Upload or paste URLs to add more.
      </p>
    </div>
  );
};

export default ScreenshotUploader;
