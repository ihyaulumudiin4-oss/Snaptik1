/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dns from "dns";

// Set default DNS resolution to ipv4first to avoid node fetch issues on dual-stack environments
dns.setDefaultResultOrder("ipv4first");

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory cache for API requests (TTL: 5 minutes)
interface CacheEntry {
  data: any;
  timestamp: number;
}
const apiCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Get client IP helper
const getClientIp = (req: express.Request): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const ip = typeof forwarded === "string" ? forwarded.split(",")[0] : forwarded[0];
    if (ip) return ip.trim();
  }
  return req.socket.remoteAddress || "unknown";
};

// Extremely simple and fast memory-based Rate Limiter (Anti-Spam)
interface RateLimitInfo {
  count: number;
  resetTime: number;
}
const rateLimits = new Map<string, RateLimitInfo>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20; // 20 requests per minute

const rateLimiter = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const ip = getClientIp(req);
  const now = Date.now();
  const limitInfo = rateLimits.get(ip);

  if (!limitInfo || now > limitInfo.resetTime) {
    rateLimits.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    next();
    return;
  }

  if (limitInfo.count >= MAX_REQUESTS_PER_WINDOW) {
    res.status(429).json({
      success: false,
      message: "Terlalu banyak permintaan (Too many requests). Silakan coba lagi dalam beberapa saat.",
    });
    return;
  }

  limitInfo.count += 1;
  next();
};

// Basic CORS headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// Helper: Resolve redirects for vt.tiktok.com or similar shortened URLs
async function resolveTikTokUrl(url: string): Promise<string> {
  const cleanUrl = url.trim();
  if (!cleanUrl.includes("vt.tiktok.com") && !cleanUrl.includes("vm.tiktok.com") && !cleanUrl.includes("v.tiktok.com")) {
    return cleanUrl;
  }

  try {
    const response = await fetch(cleanUrl, {
      method: "GET",
      redirect: "manual",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    const location = response.headers.get("location");
    if (location) {
      return location.split("?")[0];
    }
  } catch (err) {
    console.warn("Gagal menyelesaikan redirect URL:", err);
  }
  return cleanUrl;
}

// API: Search & Extract TikTok metadata
app.post("/api/extract", rateLimiter, async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    res.status(400).json({ success: false, message: "URL TikTok tidak boleh kosong." });
    return;
  }

  const trimmedUrl = url.trim();
  const isTikTok = trimmedUrl.includes("tiktok.com");

  if (!isTikTok) {
    res.status(400).json({ success: false, message: "Link tidak valid. Pastikan Anda memasukkan URL TikTok yang benar." });
    return;
  }

  // Check in-memory cache
  const cached = apiCache.get(trimmedUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    res.json(cached.data);
    return;
  }

  try {
    // Resolve link in case it's a vt.tiktok.com shortlink
    const resolvedUrl = await resolveTikTokUrl(trimmedUrl);

    // Fetch from TikWM public API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    let tikwmResponse;
    try {
      const fetchRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(resolvedUrl)}`, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        }
      });
      clearTimeout(timeoutId);
      tikwmResponse = await fetchRes.json();
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      if (fetchErr.name === "AbortError") {
        res.status(504).json({ success: false, message: "Permintaan ke server TikTok timeout (15 detik). Silakan coba lagi." });
        return;
      }
      throw fetchErr;
    }

    if (!tikwmResponse || tikwmResponse.code !== 0) {
      const errorMsg = tikwmResponse?.msg || "Gagal mengambil data dari TikTok. Pastikan video tersebut publik dan link benar.";
      res.status(404).json({ success: false, message: errorMsg });
      return;
    }

    const item = tikwmResponse.data;

    let responseData;
    // Detect whether music link page or video page
    // TikWM responds with music info directly under "data" if the input URL was a tiktok.com/music URL
    if (resolvedUrl.includes("/music/") && !item.play && item.id) {
      responseData = {
        success: true,
        type: "music",
        data: {
          id: item.id || "music_" + Date.now(),
          title: item.title || "TikTok Audio / Sound",
          play: item.play || "",
          cover: item.cover || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop",
          author: item.author || "TikTok Creator",
          duration: item.duration || 0,
          original: item.original || false
        }
      };
    } else {
      // It's a video response
      responseData = {
        success: true,
        type: "video",
        data: {
          id: item.id,
          region: item.region,
          title: item.title || "Tanpa Judul (No Caption)",
          cover: item.cover,
          origin_cover: item.origin_cover || item.cover,
          duration: item.duration || 0,
          play: item.play, // Unwatermarked URL
          wmplay: item.wmplay, // Watermarked URL
          hdplay: item.hdplay || item.play, // HD Unwatermarked URL
          music: item.music || "", // Direct music URL
          music_info: item.music_info ? {
            id: item.music_info.id,
            title: item.music_info.title,
            play: item.music_info.play,
            cover: item.music_info.cover,
            author: item.music_info.author,
            original: item.music_info.original,
            duration: item.music_info.duration
          } : undefined,
          play_count: item.play_count,
          digg_count: item.digg_count,
          comment_count: item.comment_count,
          share_count: item.share_count,
          download_count: item.download_count,
          create_time: item.create_time,
          author: item.author ? {
            id: item.author.id,
            unique_id: item.author.unique_id,
            nickname: item.author.nickname,
            avatar: item.author.avatar
          } : undefined
        }
      };
    }

    // Save success response to cache
    apiCache.set(trimmedUrl, { data: responseData, timestamp: Date.now() });

    res.json(responseData);
  } catch (error: any) {
    console.error("Kesalahan ekstraksi TikTok:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan internal server saat mengambil data TikTok. Hubungi admin atau coba lagi.",
    });
  }
});

// API Route: Safe Streaming Proxy for Video downloads
// Bypasses CORS and forces direct file downloading with clean filenames
app.get("/api/download/video", async (req, res) => {
  const videoUrl = req.query.url as string;
  const fileNameParam = (req.query.title as string) || "tiktok-video";

  if (!videoUrl) {
    res.status(400).send("Parameter URL video tidak ada.");
    return;
  }

  try {
    const response = await fetch(videoUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://www.tiktok.com/"
      },
    });

    if (!response.ok) {
      res.status(response.status).send(`Gagal mendownload video dari server sumber: ${response.statusText}`);
      return;
    }

    // Setup headers to trigger file download in browser
    const sanitizedName = fileNameParam.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 50) || "video";
    res.setHeader("Content-Disposition", `attachment; filename="${sanitizedName}_no_watermark.mp4"`);
    res.setHeader("Content-Type", "video/mp4");

    // Retrieve headers from original response
    const contentLength = response.headers.get("Content-Length");
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    // Stream response
    const reader = response.body;
    if (reader) {
      // @ts-ignore Node.js fetch response.body provides a ReadableStream, we pipe it or read chunks.
      // In newer Node.js, we can stream directly via webstreams or convert it
      const nodeStream = require("stream").Readable.fromWeb(reader);
      nodeStream.pipe(res);
    } else {
      res.status(500).send("Gagal mengalirkan konten video.");
    }
  } catch (error) {
    console.error("Kesalahan proxy download video:", error);
    res.status(500).send("Terjadi kesalahan proxy saat mendownload file video.");
  }
});

// API Route: Safe Streaming Proxy for MP3 / Audio downloads
// Bypasses CORS and forces direct file downloading with clean filenames
app.get("/api/download/audio", async (req, res) => {
  const audioUrl = req.query.url as string;
  const trackNameParam = (req.query.title as string) || "tiktok-sound";

  if (!audioUrl) {
    res.status(400).send("Parameter URL audio tidak ada.");
    return;
  }

  try {
    const response = await fetch(audioUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://www.tiktok.com/"
      },
    });

    if (!response.ok) {
      res.status(response.status).send(`Gagal mendownload audio dari server sumber: ${response.statusText}`);
      return;
    }

    const sanitizedName = trackNameParam.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 50) || "audio";
    res.setHeader("Content-Disposition", `attachment; filename="${sanitizedName}.mp3"`);
    res.setHeader("Content-Type", "audio/mpeg");

    const contentLength = response.headers.get("Content-Length");
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    const reader = response.body;
    if (reader) {
      // @ts-ignore
      const nodeStream = require("stream").Readable.fromWeb(reader);
      nodeStream.pipe(res);
    } else {
      res.status(500).send("Gagal mengalirkan konten audio.");
    }
  } catch (error) {
    console.error("Kesalahan proxy download audio:", error);
    res.status(500).send("Terjadi kesalahan proxy saat mendownload file audio.");
  }
});

// Start server initialization
async function startServer() {
  // Vite dev mode vs production handler
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TikTok Downloader Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
