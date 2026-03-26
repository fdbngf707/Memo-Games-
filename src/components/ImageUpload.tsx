import { useState } from "react";
import { Upload, Link as LinkIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

const ImageUpload = ({ value, onChange, placeholder = "Image URL" }: ImageUploadProps) => {
  const [mode, setMode] = useState<"url" | "file">("url");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
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
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        if (uploadError.message.includes('not found') || uploadError.message.includes('Bucket') || (uploadError as any).statusCode === 404) {
          toast.error('Storage bucket "images" not found. Create it in Supabase Dashboard → Storage → New Bucket (name: images, public: ON).');
        } else if (uploadError.message.includes('security') || uploadError.message.includes('policy') || uploadError.message.includes('permission')) {
          toast.error('Upload permission denied. Enable public access on the "images" bucket in Supabase → Storage → images → Policies.');
        } else {
          toast.error("Upload failed: " + uploadError.message);
        }
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      onChange(urlData.publicUrl);
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      if (err?.message?.includes('fetch')) {
        toast.error('Network error. Check your internet connection.');
      } else {
        toast.error("Upload failed. Please try again.");
      }
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
            mode === "url" ? "gradient-btn" : "bg-secondary text-secondary-foreground"
          }`}
        >
          <LinkIcon className="w-3 h-3" /> URL
        </button>
        <button
          type="button"
          onClick={() => setMode("file")}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
            mode === "file" ? "gradient-btn" : "bg-secondary text-secondary-foreground"
          }`}
        >
          <Upload className="w-3 h-3" /> Upload
        </button>
      </div>
      {mode === "url" ? (
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      ) : (
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
      )}
      {value && (
        <img src={value} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-border" />
      )}
    </div>
  );
};

export default ImageUpload;
