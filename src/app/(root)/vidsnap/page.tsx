"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  VideoIcon,
  PlusIcon,
  ImageIcon,
  XIcon,
  Loader2Icon,
  PlayIcon,
  HeartIcon,
  EyeIcon,
  TrashIcon,
  SparklesIcon,
  FilmIcon,
  GalleryHorizontalEndIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Id } from "../../../../convex/_generated/dataModel";

type Tab = "create" | "gallery" | "my-reels";

function VidSnapPage() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const authenticated = isLoaded && isSignedIn;

  const [activeTab, setActiveTab] = useState<Tab>("gallery");

  // ── Create State ───────────────────────
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Convex ─────────────────────────────
  const allReels = useQuery(api.reels.getAll, authenticated ? {} : "skip");
  const myReels = useQuery(
    api.reels.getByUser,
    authenticated && clerkUser ? { userId: clerkUser.id } : "skip"
  );
  const createReel = useMutation(api.reels.create);
  const generateUploadUrl = useMutation(api.reels.generateUploadUrl);
  const markReady = useMutation(api.reels.markReady);
  const toggleLike = useMutation(api.reels.toggleLike);
  const incrementView = useMutation(api.reels.incrementView);
  const removeReel = useMutation(api.reels.remove);

  // ── Playback state ────────────────────
  const [playingId, setPlayingId] = useState<string | null>(null);

  // ── Handle image upload ───────────────
  const handleAddImages = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const newImages: { file: File; preview: string }[] = [];
      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          newImages.push({ file, preview: URL.createObjectURL(file) });
        }
      });

      setImages((prev) => [...prev, ...newImages]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    []
  );

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // ── Clean up previews on unmount ──────
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Generate reel (client-side canvas → video) ────────────────────
  const generateReel = useCallback(async () => {
    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter a description / narration text");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // ── Step 1: Generate TTS audio from narration text ──
      let audioBuffer: AudioBuffer | null = null;
      try {
        toast.loading("Generating voice narration...", { id: "tts" });
        const ttsRes = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: description }),
        });

        if (ttsRes.ok) {
          const audioCtxForDecode = new AudioContext();
          const arrayBuf = await ttsRes.arrayBuffer();
          audioBuffer = await audioCtxForDecode.decodeAudioData(arrayBuf);
          await audioCtxForDecode.close();
          toast.success("Voice narration ready!", { id: "tts" });
        } else {
          toast.error("TTS failed — generating silent reel", { id: "tts" });
        }
      } catch (ttsErr) {
        console.warn("TTS unavailable, creating silent reel:", ttsErr);
        toast.error("TTS unavailable — generating silent reel", { id: "tts" });
      }

      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d")!;

      // Load all images
      const loadedImages = await Promise.all(
        images.map(
          (img) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const el = new Image();
              el.crossOrigin = "anonymous";
              el.onload = () => resolve(el);
              el.onerror = reject;
              el.src = img.preview;
            })
        )
      );

      const SECONDS_PER_IMAGE = 3;
      const FPS = 30;
      const totalFrames = loadedImages.length * SECONDS_PER_IMAGE * FPS;
      const duration = loadedImages.length * SECONDS_PER_IMAGE;

      // Use captureStream(0) — we manually request each frame after drawing.
      // captureStream(fps) on detached canvases is unreliable in many browsers.
      const canvasStream = canvas.captureStream(0);
      const videoTrack = canvasStream.getVideoTracks()[0];

      // ── Mix audio into the stream if TTS audio is available ──
      let audioCtx: AudioContext | null = null;
      let audioSource: AudioBufferSourceNode | null = null;

      if (audioBuffer) {
        audioCtx = new AudioContext({ sampleRate: audioBuffer.sampleRate });
        const destination = audioCtx.createMediaStreamDestination();
        audioSource = audioCtx.createBufferSource();
        audioSource.buffer = audioBuffer;
        audioSource.connect(destination);

        // Add audio tracks to the canvas stream
        for (const track of destination.stream.getAudioTracks()) {
          canvasStream.addTrack(track);
        }
      }

      const mimeType = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
        "video/mp4",
      ].find((m) => MediaRecorder.isTypeSupported(m)) || "";

      console.log("MediaRecorder mimeType:", mimeType || "(default)");

      const recorder = new MediaRecorder(canvasStream, {
        ...(mimeType ? { mimeType } : {}),
        videoBitsPerSecond: 4_000_000,
      });

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onerror = (e) => {
        console.error("MediaRecorder error:", e);
      };

      const recordingDone = new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          console.log(`Recording stopped. ${chunks.length} chunks collected.`);
          const blobType = mimeType.split(";")[0] || "video/webm";
          resolve(new Blob(chunks, { type: blobType }));
        };
      });

      // Request data every 500ms
      recorder.start(500);
      console.log("Recorder state:", recorder.state);

      // Start TTS audio playback in sync with recording
      if (audioSource && audioCtx) {
        audioSource.start(0);
      }

      // Draw the very first frame and request it so MediaRecorder has content immediately
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if ("requestFrame" in videoTrack) {
        (videoTrack as CanvasCaptureMediaStreamTrack).requestFrame();
      }

      // Render frames at real-time speed, explicitly requesting each frame capture.
      const descWords = description.split(" ");
      const wordsPerImage = Math.ceil(descWords.length / loadedImages.length);
      const frameDuration = 1000 / FPS;
      const renderStartTime = performance.now();

      for (let frame = 0; frame < totalFrames; frame++) {
        const imgIndex = Math.min(
          Math.floor(frame / (SECONDS_PER_IMAGE * FPS)),
          loadedImages.length - 1
        );
        const img = loadedImages[imgIndex];
        const frameInSlide = frame % (SECONDS_PER_IMAGE * FPS);
        const slideProgress = frameInSlide / (SECONDS_PER_IMAGE * FPS);

        // ── Background ──
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // ── Draw image with Ken Burns effect ──
        const scale = 1 + slideProgress * 0.08;
        const offsetX = slideProgress * 30 * (imgIndex % 2 === 0 ? 1 : -1);
        const offsetY = slideProgress * 20;

        const imgAspect = img.width / img.height;
        const canvasAspect = canvas.width / canvas.height;
        let drawW: number, drawH: number;

        if (imgAspect > canvasAspect) {
          drawH = canvas.height * scale;
          drawW = drawH * imgAspect;
        } else {
          drawW = canvas.width * scale;
          drawH = drawW / imgAspect;
        }

        const dx = (canvas.width - drawW) / 2 + offsetX;
        const dy = (canvas.height - drawH) / 2 + offsetY;

        ctx.drawImage(img, dx, dy, drawW, drawH);

        // ── Gradient overlay for text readability ──
        const gradient = ctx.createLinearGradient(
          0,
          canvas.height * 0.55,
          0,
          canvas.height
        );
        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(0.4, "rgba(0,0,0,0.6)");
        gradient.addColorStop(1, "rgba(0,0,0,0.85)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // ── Title ──
        ctx.fillStyle = "#fff";
        ctx.font = "bold 52px sans-serif";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0,0,0,0.7)";
        ctx.shadowBlur = 10;
        ctx.fillText(title, canvas.width / 2, canvas.height - 320, canvas.width - 80);

        // ── Narration text (word-by-word reveal) ──
        const startWord = imgIndex * wordsPerImage;
        const revealCount = Math.min(
          Math.floor(slideProgress * wordsPerImage) + 1,
          wordsPerImage
        );
        const visibleWords = descWords.slice(
          startWord,
          Math.min(startWord + revealCount, descWords.length)
        );

        ctx.font = "36px sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        const textLine = visibleWords.join(" ");

        // Wrap text
        const maxWidth = canvas.width - 100;
        const lines = wrapText(ctx, textLine, maxWidth);
        let textY = canvas.height - 220;
        for (const line of lines) {
          ctx.fillText(line, canvas.width / 2, textY, maxWidth);
          textY += 44;
        }

        ctx.shadowBlur = 0;

        // ── Slide indicator dots ──
        const dotY = canvas.height - 100;
        for (let i = 0; i < loadedImages.length; i++) {
          ctx.beginPath();
          ctx.arc(
            canvas.width / 2 + (i - (loadedImages.length - 1) / 2) * 24,
            dotY,
            i === imgIndex ? 7 : 5,
            0,
            Math.PI * 2
          );
          ctx.fillStyle =
            i === imgIndex ? "#fff" : "rgba(255,255,255,0.4)";
          ctx.fill();
        }

        // ── Fade transition between slides ──
        if (frameInSlide < FPS * 0.3) {
          const alpha = 1 - frameInSlide / (FPS * 0.3);
          ctx.fillStyle = `rgba(0,0,0,${alpha})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        if (frameInSlide > (SECONDS_PER_IMAGE * FPS - FPS * 0.3)) {
          const remaining = SECONDS_PER_IMAGE * FPS - frameInSlide;
          const alpha = 1 - remaining / (FPS * 0.3);
          ctx.fillStyle = `rgba(0,0,0,${alpha})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        setProgress(Math.round(((frame + 1) / totalFrames) * 100));

        // ── Tell the stream to capture this frame ──
        if ("requestFrame" in videoTrack) {
          (videoTrack as CanvasCaptureMediaStreamTrack).requestFrame();
        }

        // ── Wait until the correct wall-clock time for this frame ──
        // This keeps MediaRecorder recording at actual real-time speed.
        const targetTime = renderStartTime + (frame + 1) * frameDuration;
        const now = performance.now();
        if (targetTime > now) {
          await new Promise((r) => setTimeout(r, targetTime - now));
        }
      }

      recorder.stop();

      // Stop audio playback and clean up AudioContext
      if (audioSource) {
        try { audioSource.stop(); } catch { /* already stopped */ }
      }
      if (audioCtx) {
        await audioCtx.close();
      }

      const videoBlob = await recordingDone;

      // ── Validate blob before uploading ──
      console.log(`Video blob size: ${videoBlob.size} bytes, type: ${videoBlob.type}`);
      if (videoBlob.size < 1000) {
        throw new Error(
          `Generated video is too small (${videoBlob.size} bytes). ` +
          "Recording may have failed — try a different browser or fewer images."
        );
      }

      // ── Upload to Convex storage ──
      setProgress(100);
      toast.success("Uploading reel...");

      // Extract clean MIME base type without codecs (e.g. "video/webm;codecs=vp9,opus" → "video/webm")
      const cleanMime = (videoBlob.type || "video/webm").split(";")[0].trim();
      console.log(`Uploading: ${videoBlob.size} bytes, raw type="${videoBlob.type}", clean type="${cleanMime}"`);

      const uploadUrl = await generateUploadUrl();
      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": cleanMime },
        body: videoBlob,
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text().catch(() => "unknown");
        console.error(`Upload failed: status=${uploadRes.status}, body=${errText}`);
        throw new Error(`Upload failed (${uploadRes.status}): ${errText}`);
      }

      const uploadData = await uploadRes.json();
      console.log("Upload response:", uploadData);
      const storageId = uploadData.storageId;
      if (!storageId) {
        throw new Error("No storageId returned from upload");
      }

      // Convert blob URLs to small base64 thumbnails so they persist
      const imageDataUrls: string[] = [];
      for (const img of images) {
        try {
          const thumbUrl = await blobUrlToThumbnail(img.preview, 200, 356);
          imageDataUrls.push(thumbUrl);
        } catch {
          imageDataUrls.push(""); // skip broken images
        }
      }

      console.log("Creating reel with storageId:", storageId, "images:", imageDataUrls.length);

      try {
        await createReel({
          title,
          description,
          imageUrls: imageDataUrls,
          storageId: storageId as Id<"_storage">,
          duration,
        });
      } catch (createErr) {
        console.error("createReel mutation failed:", createErr);
        throw new Error(
          `Save failed: ${createErr instanceof Error ? createErr.message : String(createErr)}`
        );
      }

      // Reset form
      setTitle("");
      setDescription("");
      setImages([]);
      setActiveTab("gallery");
      toast.success("Reel created successfully! 🎬");
    } catch (err) {
      console.error("Reel generation failed:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to create reel. Please try again."
      );
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [images, title, description, createReel, generateUploadUrl]);

  // ── Text wrapping helper ──
  function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines.slice(0, 3); // Max 3 lines
  }

  // ── Convert a blob URL to a small base64 thumbnail ──
  async function blobUrlToThumbnail(
    blobUrl: string,
    maxW: number,
    maxH: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const c = document.createElement("canvas");
        // Maintain aspect ratio within maxW × maxH
        const scale = Math.min(maxW / img.width, maxH / img.height, 1);
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        const cx = c.getContext("2d")!;
        cx.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.6)); // JPEG @ 60% → small
      };
      img.onerror = reject;
      img.src = blobUrl;
    });
  }

  // ── Loading state ─────────────────────
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const reelsToShow = activeTab === "my-reels" ? myReels : allReels;

  return (
    <div className="min-h-[calc(100vh-4rem-1px)]">
      {/* Header */}
      <div className="border-b bg-linear-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-linear-to-br from-purple-500 to-pink-500">
              <FilmIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">VidSnap AI</h1>
              <p className="text-sm text-muted-foreground">
                Create stunning reels from your images with AI narration
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-muted/50 rounded-lg p-1 w-fit">
            {([
              { id: "gallery" as Tab, label: "Gallery", icon: GalleryHorizontalEndIcon },
              { id: "create" as Tab, label: "Create Reel", icon: PlusIcon },
              { id: "my-reels" as Tab, label: "My Reels", icon: VideoIcon },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {/* ═══════════════════════ CREATE TAB ═══════════════════════ */}
        {activeTab === "create" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardContent className="p-6 space-y-5">
                {/* Title */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Reel Title
                  </label>
                  <Input
                    placeholder="Enter a catchy title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>

                {/* Description / Narration */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Narration Text
                  </label>
                  <textarea
                    placeholder="Enter the text that will appear as captions on your reel..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isProcessing}
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This text will be shown word-by-word as animated captions over your images
                  </p>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Images ({images.length} added)
                  </label>

                  {/* Image previews */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                      {images.map((img, i) => (
                        <div
                          key={i}
                          className="relative aspect-9/16 rounded-lg overflow-hidden border group"
                        >
                          <img
                            src={img.preview}
                            alt={`Slide ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              onClick={() => removeImage(i)}
                              className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600"
                              disabled={isProcessing}
                            >
                              <XIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <Badge className="absolute top-1 left-1 text-[10px] px-1.5 py-0">
                            {i + 1}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAddImages}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="w-full border-2 border-dashed rounded-lg p-6 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  >
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-sm font-medium">
                      Click to add images
                    </span>
                    <span className="text-xs">
                      PNG, JPG — each image = 3 seconds in the reel
                    </span>
                  </button>
                </div>

                {/* Preview Info */}
                {images.length > 0 && (
                  <div className="bg-muted/30 rounded-lg p-3 text-sm">
                    <p className="font-medium flex items-center gap-1.5">
                      <SparklesIcon className="h-4 w-4 text-purple-500" />
                      Reel Preview
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      {images.length} slide{images.length > 1 ? "s" : ""} ×
                      3 seconds = ~{images.length * 3}s reel at 1080×1920
                      (portrait)
                    </p>
                  </div>
                )}

                {/* Processing progress */}
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                        Generating reel...
                      </span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={generateReel}
                  disabled={
                    isProcessing ||
                    images.length === 0 ||
                    !title.trim() ||
                    !description.trim()
                  }
                  className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                      Generating Reel... ({progress}%)
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4 mr-2" />
                      Create Reel
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ═══════════════════════ GALLERY / MY REELS ═══════════════════════ */}
        {(activeTab === "gallery" || activeTab === "my-reels") && (
          <div>
            {!reelsToShow ? (
              <div className="flex items-center justify-center py-20">
                <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : reelsToShow.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <FilmIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No reels yet</p>
                <p className="text-sm mt-1">
                  {activeTab === "my-reels"
                    ? "Create your first reel to see it here!"
                    : "Be the first to create a reel!"}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setActiveTab("create")}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Reel
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {reelsToShow
                  .filter((r) => r.status === "ready")
                  .map((reel) => (
                    <ReelCard
                      key={reel._id}
                      reel={reel}
                      currentUserId={clerkUser?.id}
                      isPlaying={playingId === reel._id}
                      onPlay={() => {
                        setPlayingId(
                          playingId === reel._id ? null : reel._id
                        );
                        incrementView({ reelId: reel._id });
                      }}
                      onLike={() => toggleLike({ reelId: reel._id })}
                      onDelete={() => {
                        removeReel({ reelId: reel._id });
                        toast.success("Reel deleted");
                      }}
                    />
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden canvas for rendering */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

// ── Reel Card Component ─────────────────────────────────────────────
interface ReelCardProps {
  reel: {
    _id: Id<"reels">;
    _creationTime: number;
    title: string;
    description: string;
    authorId: string;
    authorName: string;
    authorImage?: string;
    videoUrl?: string;
    likeCount: number;
    likedBy: string[];
    viewCount: number;
    duration?: number;
    imageUrls: string[];
  };
  currentUserId?: string;
  isPlaying: boolean;
  onPlay: () => void;
  onLike: () => void;
  onDelete: () => void;
}

function ReelCard({
  reel,
  currentUserId,
  isPlaying,
  onPlay,
  onLike,
  onDelete,
}: ReelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isLiked = currentUserId ? reel.likedBy.includes(currentUserId) : false;
  const isOwner = currentUserId === reel.authorId;

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isPlaying]);

  return (
    <Card className="overflow-hidden group">
      {/* Video / Thumbnail */}
      <div
        className="relative aspect-9/16 bg-black cursor-pointer"
        onClick={onPlay}
      >
        {reel.videoUrl ? (
          <video
            ref={videoRef}
            src={reel.videoUrl}
            className="w-full h-full object-cover"
            loop
            playsInline
            muted={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Loader2Icon className="h-8 w-8 animate-spin" />
          </div>
        )}

        {/* Play overlay – always visible on mobile (no hover), hover-reveal on desktop */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
              <PlayIcon className="h-8 w-8 text-white fill-white" />
            </div>
          </div>
        )}

        {/* Duration badge */}
        {reel.duration && (
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 text-[10px] bg-black/60 text-white border-0"
          >
            {Math.round(reel.duration)}s
          </Badge>
        )}
      </div>

      {/* Info */}
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start gap-2">
          <Avatar className="h-7 w-7 shrink-0 mt-0.5">
            <AvatarImage src={reel.authorImage} />
            <AvatarFallback className="text-[10px]">
              {reel.authorName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{reel.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {reel.authorName}
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">
          {reel.description}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <HeartIcon
                className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
              />
              {reel.likeCount > 0 && reel.likeCount}
            </button>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <EyeIcon className="h-4 w-4" />
              {reel.viewCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">
              {format(new Date(reel._creationTime), "MMM d")}
            </span>
            {isOwner && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-muted-foreground hover:text-red-500 transition-colors"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default VidSnapPage;
