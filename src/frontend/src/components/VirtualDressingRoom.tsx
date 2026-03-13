import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { AlertCircle, Camera, Eye, EyeOff, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCamera } from "../camera/useCamera";

interface DressItem {
  id: number;
  name: string;
  category: string;
  src: string;
  accent: string;
}

const DRESSES: DressItem[] = [
  {
    id: 1,
    name: "Red Floral",
    category: "Midi",
    src: "/assets/generated/dress-red-floral-transparent.dim_400x600.png",
    accent: "#e74c3c",
  },
  {
    id: 2,
    name: "Black Cocktail",
    category: "Mini",
    src: "/assets/generated/dress-black-cocktail-transparent.dim_400x600.png",
    accent: "#2c2c2c",
  },
  {
    id: 3,
    name: "Blue Denim",
    category: "Midi",
    src: "/assets/generated/dress-blue-denim-transparent.dim_400x600.png",
    accent: "#4a7fa5",
  },
  {
    id: 4,
    name: "White Boho",
    category: "Maxi",
    src: "/assets/generated/dress-white-boho-transparent.dim_400x600.png",
    accent: "#d4c9b0",
  },
];

export default function VirtualDressingRoom() {
  const { videoRef, isActive, isLoading, error, isSupported, startCamera } =
    useCamera({ facingMode: "user", width: 1280, height: 720 });

  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const dressImagesRef = useRef<Record<number, HTMLImageElement>>({});

  const [selectedDress, setSelectedDress] = useState<DressItem | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [scale, setScale] = useState(0.85);
  const [opacity, setOpacity] = useState(0.88);
  const [positionY, setPositionY] = useState(0.35);

  // Preload all dress images
  useEffect(() => {
    for (const d of DRESSES) {
      const img = new Image();
      img.src = d.src;
      dressImagesRef.current[d.id] = img;
    }
  }, []);

  // Start camera on mount
  useEffect(() => {
    startCamera();
  }, [startCamera]);

  // Canvas render loop
  const renderFrame = useCallback(() => {
    const canvas = overlayCanvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) {
      animFrameRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    const w = canvas.width;
    const h = canvas.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      animFrameRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    ctx.clearRect(0, 0, w, h);

    if (selectedDress && showOverlay) {
      const img = dressImagesRef.current[selectedDress.id];
      if (img?.complete && img.naturalWidth > 0) {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const dressH = h * scale;
        const dressW = dressH * aspectRatio;
        const x = (w - dressW) / 2;
        const y = h * positionY - dressH * 0.15;

        ctx.globalAlpha = opacity;
        ctx.drawImage(img, x, y, dressW, dressH);
        ctx.globalAlpha = 1;
      }
    }

    animFrameRef.current = requestAnimationFrame(renderFrame);
  }, [selectedDress, showOverlay, scale, opacity, positionY, videoRef]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(renderFrame);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [renderFrame]);

  // Sync canvas size with video element size
  useEffect(() => {
    const video = videoRef.current;
    const canvas = overlayCanvasRef.current;
    if (!video || !canvas) return;

    const syncSize = () => {
      canvas.width = video.videoWidth || video.clientWidth || 1280;
      canvas.height = video.videoHeight || video.clientHeight || 720;
    };

    video.addEventListener("loadedmetadata", syncSize);
    video.addEventListener("resize", syncSize);
    syncSize();

    const ro = new ResizeObserver(syncSize);
    ro.observe(video);
    return () => {
      video.removeEventListener("loadedmetadata", syncSize);
      video.removeEventListener("resize", syncSize);
      ro.disconnect();
    };
  }, [videoRef]);

  return (
    <div className="min-h-screen bg-background flex flex-col font-body">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="font-display text-xl font-semibold tracking-wide text-foreground">
            Virtual Dressing Room
          </h1>
        </div>
        <Badge
          variant="outline"
          className="text-muted-foreground border-border"
        >
          AI Styling
        </Badge>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Camera area */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
          {/* Hint */}
          <AnimatePresence>
            {!selectedDress && isActive && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
              >
                <div className="bg-card/80 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm text-muted-foreground">
                  ✦ Select a dress to try it on
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Camera container */}
          <div className="relative w-full max-w-3xl rounded-2xl overflow-hidden border border-border shadow-2xl bg-card">
            {/* Error state */}
            {error && (
              <div
                data-ocid="camera.error_state"
                className="aspect-video flex flex-col items-center justify-center gap-3 text-muted-foreground"
              >
                <AlertCircle className="w-10 h-10 text-destructive" />
                <p className="text-sm">{error.message}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startCamera()}
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Loading state */}
            {!error && !isActive && (
              <div
                data-ocid="camera.loading_state"
                className="aspect-video flex flex-col items-center justify-center gap-3 text-muted-foreground"
              >
                {isSupported === false ? (
                  <>
                    <AlertCircle className="w-10 h-10" />
                    <p className="text-sm">
                      Camera not supported in this browser
                    </p>
                  </>
                ) : (
                  <>
                    <Camera className="w-10 h-10 animate-pulse" />
                    <p className="text-sm">
                      {isLoading ? "Starting camera…" : "Camera initializing…"}
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Video + overlay canvas */}
            <div className={`relative ${!isActive && !error ? "hidden" : ""}`}>
              <video
                ref={videoRef}
                className="w-full block"
                playsInline
                muted
                autoPlay
                style={{ transform: "scaleX(-1)" }}
              />
              <canvas
                ref={overlayCanvasRef}
                data-ocid="camera.canvas_target"
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ transform: "scaleX(-1)" }}
              />
            </div>
          </div>

          {/* Controls bar below camera */}
          {isActive && selectedDress && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 w-full max-w-3xl bg-card border border-border rounded-xl p-4"
            >
              <div className="grid grid-cols-3 gap-6">
                {/* Scale */}
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest block">
                    Size
                  </span>
                  <Slider
                    data-ocid="scale.input"
                    min={0.3}
                    max={2}
                    step={0.01}
                    value={[scale]}
                    onValueChange={([v]) => setScale(v)}
                    className="w-full"
                  />
                  <span className="text-xs text-muted-foreground">
                    {Math.round(scale * 100)}%
                  </span>
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest block">
                    Position
                  </span>
                  <Slider
                    data-ocid="position.input"
                    min={0}
                    max={0.7}
                    step={0.01}
                    value={[positionY]}
                    onValueChange={([v]) => setPositionY(v)}
                    className="w-full"
                  />
                </div>

                {/* Opacity */}
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest block">
                    Opacity
                  </span>
                  <Slider
                    data-ocid="opacity.input"
                    min={0}
                    max={1}
                    step={0.01}
                    value={[opacity]}
                    onValueChange={([v]) => setOpacity(v)}
                    className="w-full"
                  />
                  <span className="text-xs text-muted-foreground">
                    {Math.round(opacity * 100)}%
                  </span>
                </div>
              </div>

              {/* Toggle & Deselect */}
              <div className="flex gap-2 mt-4">
                <Button
                  data-ocid="controls.toggle"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOverlay((v) => !v)}
                  className="flex items-center gap-2"
                >
                  {showOverlay ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                  {showOverlay ? "Hide" : "Show"}
                </Button>
                <Button
                  data-ocid="controls.cancel_button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDress(null)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                  Remove
                </Button>
              </div>
            </motion.div>
          )}
        </main>

        {/* Sidebar: Dress selector */}
        <aside className="w-64 border-l border-border bg-card flex flex-col">
          <div className="px-4 pt-5 pb-3">
            <h2 className="font-display text-sm font-semibold text-foreground tracking-wide">
              Collection
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tap to try on
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3">
            {DRESSES.map((dress, i) => (
              <motion.button
                key={dress.id}
                data-ocid={`dress.item.${i + 1}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedDress(dress);
                  setShowOverlay(true);
                }}
                className={`dress-card w-full rounded-xl overflow-hidden border text-left transition-all duration-200 ${
                  selectedDress?.id === dress.id
                    ? "selected border-primary/60 bg-secondary"
                    : "border-border hover:border-muted-foreground/40 bg-background"
                }`}
              >
                <div
                  className="w-full h-40 flex items-center justify-center"
                  style={{ backgroundColor: `${dress.accent}18` }}
                >
                  <img
                    src={dress.src}
                    alt={dress.name}
                    className="h-36 w-auto object-contain drop-shadow-lg"
                  />
                </div>
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-foreground">
                    {dress.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dress.category}
                  </p>
                </div>
                {selectedDress?.id === dress.id && (
                  <div className="px-3 pb-2">
                    <Badge
                      className="text-xs"
                      style={{
                        backgroundColor: `${dress.accent}33`,
                        color: dress.accent,
                        border: `1px solid ${dress.accent}55`,
                      }}
                    >
                      Wearing
                    </Badge>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-3 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
