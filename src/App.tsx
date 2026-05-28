/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import DownloadForm from "./components/DownloadForm";
import ResultCard from "./components/ResultCard";
import HistoryDashboard from "./components/HistoryDashboard";
import FaqSection from "./components/FaqSection";
import { DownloadHistoryItem, ApiResponse } from "./types";
import { 
  Download, Music, HelpCircle, History, Terminal, 
  Layers, Package, Check, RefreshCw, BookOpen, AlertCircle, Sparkles
} from "lucide-react";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [showDevGuide, setShowDevGuide] = useState(false);

  // Rotate loading hint lines for higher user engagement (feels like a premium converter)
  const loadingHints = [
    "Menghubungi server TikTok...",
    "Menganalisis link dan menguji redirect...",
    "Mengekstrak metadata video bebas watermark...",
    "Mengambil cover HD dan lagu MP3...",
    "Mempersiapkan link proxy download aman..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingHints.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tik_saver_history");
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (err) {
      console.warn("Gagal membaca riwayat dari localStorage:", err);
    }
  }, []);

  // Save history helper
  const saveToHistory = (item: DownloadHistoryItem) => {
    setHistory((prev) => {
      // Filter duplicates by video/music id
      const filtered = prev.filter((h) => h.id !== item.id);
      const updated = [item, ...filtered].slice(0, 8); // Keep last 8 downloads
      try {
        localStorage.setItem("tik_saver_history", JSON.stringify(updated));
      } catch (err) {
        console.warn("Gagal menyimpan riwayat ke localStorage:", err);
      }
      return updated;
    });
  };

  // Execute extraction API calling over backend
  const handleExtract = async (url: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const json: ApiResponse = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Gagal memproses URL TikTok. Silakan pastikan link valid.");
      }

      setResult(json);

      // Save into persistence history
      const timeStr = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (json.type === "video") {
        const vData = json.data as any;
        saveToHistory({
          id: vData.id,
          type: "video",
          title: vData.title || "TikTok Video",
          authorName: vData.author?.unique_id || "creator",
          cover: vData.cover,
          url,
          timestamp: timeStr,
        });
      } else {
        const mData = json.data as any;
        saveToHistory({
          id: mData.id,
          type: "music",
          title: mData.title || "TikTok sound",
          authorName: mData.author || "artist",
          cover: mData.cover,
          url,
          timestamp: timeStr,
        });
      }

      // Smooth scroll to results
      setTimeout(() => {
        const resEl = document.getElementById(
          json.type === "video" ? "result-video-card" : "result-music-card"
        );
        resEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terdapat kendala jaringan atau server offline. Silakan ulangi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFromHistory = (url: string) => {
    // Fill search input and auto-start
    const inputEl = document.getElementById("tiktok-url-input") as HTMLInputElement;
    if (inputEl) {
      inputEl.value = url;
      // Auto trigger extract
      handleExtract(url);
    }
  };

  const handleRemoveFromHistory = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      try {
        localStorage.setItem("tik_saver_history", JSON.stringify(updated));
      } catch (err) {
        console.warn("Gagal memperbarui localStorage:", err);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("tik_saver_history");
    } catch (err) {
      console.warn("Gagal mengosongkan localStorage:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30 text-gray-800 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Sticky Header Navbar */}
      <Navbar />

      {/* Main Body content wrapping with fluid spacing container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12 sm:space-y-16">
        
        {/* Step 1: Input URL area */}
        <DownloadForm 
          onExtract={handleExtract}
          loading={loading}
          error={error}
          onClearError={() => setError(null)}
        />

        {/* Step 2: Loader screen skeleton loader */}
        {loading && (
          <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl border border-gray-100 p-8 text-center shadow-xl flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              {/* Spinning ring outer */}
              <div className="w-16 h-16 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin"></div>
              {/* Center icon */}
              <Sparkles className="w-6 h-6 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h4 className="font-extrabold text-gray-900 text-base sm:text-lg animate-pulse">Memproses Link...</h4>
              <p className="text-emerald-600 font-medium text-xs sm:text-sm h-6 transition-all duration-300">
                {loadingHints[loadingStep]}
              </p>
            </div>

            {/* Skeleton mockup mimicking loading card */}
            <div className="w-full max-w-lg space-y-3.5 pt-4 opacity-40">
              <div className="h-4 bg-gray-200 rounded-md w-3/4 mx-auto animate-pulse"></div>
              <div className="h-3 bg-gray-100 rounded-md w-1/2 mx-auto animate-pulse"></div>
              <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto pt-2">
                <div className="h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: API success result container */}
        {result && !loading && (
          <ResultCard type={result.type} data={result.data} />
        )}

        {/* Step 4: Local storage items history */}
        {!loading && (
          <HistoryDashboard 
            history={history}
            onSelect={handleSelectFromHistory}
            onRemove={handleRemoveFromHistory}
            onClearAll={handleClearHistory}
          />
        )}

        {/* Step 5: Accordion Faqs information section */}
        <FaqSection />

      </main>

      {/* Structured Footer */}
      <footer className="bg-white border-t border-gray-100 mt-20 pb-12 pt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-gray-400 max-w-4xl mx-auto border-b border-gray-50 pb-6">
            <p>© 2026 SnapTik. Dibuat dengan penuh dedikasi & kode yang dioptimasi.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDevGuide(!showDevGuide)}
                className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1.5 transition-colors"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>{showDevGuide ? "Sembunyikan Panduan Run & Deploy" : "Tampilkan Panduan Run & Deploy"}</span>
              </button>
            </div>
          </div>

          {/* Toggleable Developer Execution & Deployment documentation */}
          {showDevGuide && (
            <div className="max-w-4xl mx-auto text-left bg-gray-900 text-gray-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-gray-800 font-mono text-xs overflow-x-auto leading-relaxed">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Terminal className="w-4 h-4" />
                  <span className="font-extrabold text-sm text-gray-100">Panduan Teknis & Arsitektur Project</span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                  v1.0.0
                </span>
              </div>

              {/* Technologies list */}
              <div className="space-y-2">
                <h5 className="text-emerald-400 font-bold border-l-2 border-emerald-500 pl-2">1. SPESIFIKASI TEKNIK</h5>
                <p className="text-gray-300">
                  Aplikasi ini merupakan produk Full-stack TypeScript yang beroperasi dengan latency super rendah.
                </p>
                <ul className="list-disc pl-5 text-gray-400 space-y-1">
                  <li><strong className="text-gray-200">Frontend:</strong> React 19 + Vite 6 + Tailwind CSS 4 + Lucide Icons + custom responsive audio controllers.</li>
                  <li><strong className="text-gray-200">Backend:</strong> Node.js Express Server v4 untuk validasi, anti-spam, redirect resolver, caching-layer (5 menit), dan proxy media.</li>
                  <li><strong className="text-gray-200">Anti-CORS Media Proxy:</strong> Client mendownload file mp4/mp3 langsung dari link proxy <code className="text-emerald-300">/api/download/*</code> yang menyisipkan status header <code className="text-emerald-300">Content-Disposition: attachment</code> untuk memicu silent download instan di browser.</li>
                </ul>
              </div>

              {/* Running instructions */}
              <div className="space-y-2">
                <h5 className="text-emerald-400 font-bold border-l-2 border-emerald-500 pl-2">2. CARA MENJALANKAN DI INTERNAL LOCAL</h5>
                <p className="text-gray-300">Ikuti perintah shell berikut di direktori root untuk menjalankan runtime Anda:</p>
                <div className="bg-black/40 p-4 rounded-xl border border-gray-800 space-y-1.5 select-all font-semibold">
                  <p className="text-gray-500"># 1. Pastikan node_modules terinstall lengkap</p>
                  <p className="text-emerald-400">npm install</p>
                  <p className="text-gray-500"># 2. Jalankan Server Dev Gabungan Express + Vite di port 3000</p>
                  <p className="text-emerald-400">npm run dev</p>
                </div>
                <p className="text-gray-400">
                  Buka browser Anda di alamat <code className="text-white bg-gray-800 px-1 py-0.5 rounded">http://localhost:3000</code>. Perubahan kode Anda akan termonitor secara real-time.
                </p>
              </div>

              {/* Build instructions */}
              <div className="space-y-2">
                <h5 className="text-emerald-400 font-bold border-l-2 border-emerald-500 pl-2">3. CARA BUILD & DEPLOY PRODUKSI</h5>
                <p className="text-gray-300">Untuk mengemas aplikasi menjadi bundle CJS mandiri yang siap di-deploy:</p>
                <div className="bg-black/40 p-4 rounded-xl border border-gray-800 space-y-1.5 select-all font-semibold">
                  <p className="text-gray-500"># Build compiler frontend berkas statis & menyatukan file server.ts menggunakan esbuild</p>
                  <p className="text-emerald-400">npm run build</p>
                  <p className="text-gray-500"># Jalankan server production terkompilasi</p>
                  <p className="text-emerald-400">npm start</p>
                </div>
                <ul className="list-disc pl-5 text-gray-400 space-y-1.5">
                  <li>
                    <strong className="text-gray-200">Docker & Google Cloud Run:</strong> Buat container menggunakan Dockerfile standar berbasis Node:alpine, expose port <code className="text-emerald-300">3000</code>, lalu deploy image tersebut di Google Cloud Run.
                  </li>
                  <li>
                    <strong className="text-gray-200">Serverless Vercel / Netlify:</strong> Pecah routing file Express menjadi Serverless-functions pada folder <code className="text-emerald-300">/api</code> dan arahkan publish directory ke foldering statik <code className="text-emerald-300">/dist</code>.
                  </li>
                </ul>
              </div>

            </div>
          )}

          <div className="text-gray-400 text-xs flex items-center justify-center gap-1">
            <span>SnapTik Downloader App • Clean UI & Fast Connection • 2026</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
