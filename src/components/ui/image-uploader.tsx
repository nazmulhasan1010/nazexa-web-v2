import * as React from "react";
import { Link, Trash2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImageUploaderProps {
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}

export function ImageUploader({
  value,
  onChange,
  className,
}: ImageUploaderProps) {
  const [url, setUrl] = React.useState(value || "");
  const [isHovered, setIsHovered] = React.useState(false);

  // Sync internal state if value changes externally
  React.useEffect(() => {
    setUrl(value || "");
  }, [value]);

  const handleApply = () => {
    onChange(url ? url : null);
  };

  const handleClear = () => {
    setUrl("");
    onChange(null);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {value ? (
        <div
          className="relative group rounded-xl overflow-hidden border border-border bg-muted/30 aspect-video flex items-center justify-center"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yIDEyaDIwIi8+PHBhdGggZD0iTTIgMmw1IDUiLz48cGF0aCBkPSJNMjIgMmwtNSA1Ii8+PC9zdmc+"; // Broken image
            }}
          />

          <div
            className={cn(
              "absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center opacity-0 transition-opacity duration-200",
              isHovered && "opacity-100",
            )}
          >
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClear}
              className="gap-2 shadow-xl"
            >
              <Trash2 className="h-4 w-4" />
              Remove Image
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors bg-muted/30 hover:bg-muted/50 p-8 flex flex-col items-center justify-center text-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium">Image URL</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
              Provide a direct URL to an image or SVG file.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="https://example.com/image.png"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-9"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApply();
              }
            }}
          />
        </div>
        {url !== value && (
          <Button onClick={handleApply} size="sm" className="shrink-0">
            Apply
          </Button>
        )}
      </div>
    </div>
  );
}
