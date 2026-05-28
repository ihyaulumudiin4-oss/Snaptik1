/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Link, Clipboard, X, Loader2, Play, Search } from "lucide-react";

interface DownloadFormProps {
  onExtract: (url: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  onClearError: () => void;
}

export default function DownloadForm({ onExtract, loading, error, onClearError }: DownloadFormProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onExtract(url);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        onClearError();
      }
    } catch (err) {
      console.warn("Gagal membaca clipboard. Pengguna harus menempelkan link secara manual.");
    }
  };

  const handleClear = () => {
    setUrl("");
    onClearError();
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center" id="search-section">
      {/* Title Header */}
      <div className="space-y-2 mb-8 select-none">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
          TikTok Video Downloader <span className="text-emerald-500">Tanpa Watermark</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-500 font-medium max-w-xl mx-auto leading-relaxed">
          Cepat, gratis, dan tanpa tanda air. Dapatkan file MP4 HD dan MP3 orisinal terbaik sekarang.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative z-10 w-full mb-10">
        <div className="relative bg-white shadow-xl shadow-gray-200/60 rounded-2xl border border-gray-100 flex items-center h-16 sm:h-18 p-2 group transition-all duration-300">
          {/* Link Icon decoration */}
          <div className="absolute left-4 sm:left-5 pointer-events-none text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.803a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.1-1.1"/>
            </svg>
          </div>

          {/* Text Input */}
          <input
            type="url"
            className="w-full h-full pl-11 sm:pl-14 pr-32 sm:pr-40 rounded-xl bg-transparent text-gray-700 placeholder-gray-400 text-sm sm:text-base border-none focus:outline-none focus:ring-0 focus:ring-offset-0"
            placeholder="Tempel link video atau musik TikTok di sini..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) onClearError();
            }}
            disabled={loading}
            id="tiktok-url-input"
          />

          {/* Action button bar */}
          <div className="absolute right-2 top-2 bottom-2 flex items-center gap-1 sm:gap-1.5 shrink-0">
            {url && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 sm:p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors mr-1 sm:mr-2"
                title="Hapus"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}

            {!url && (
              <button
                type="button"
                onClick={handlePaste}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-150 text-gray-500 hover:bg-gray-100 hover:text-emerald-600 font-semibold text-xs transition-all mr-2"
                title="Tempel dari Clipboard"
              >
                <Clipboard className="w-3 h-3" />
                <span>Tempel</span>
              </button>
            )}

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="h-full px-5 sm:px-8 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-gray-300 disabled:shadow-none text-xs sm:text-sm"
              id="download-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Loading</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Download</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs sm:text-sm font-medium flex items-start gap-2 max-w-xl mx-auto text-left hover:scale-[1.01] transition-transform duration-200">
          <div className="w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-rose-700 font-bold text-[10px]">!</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-rose-800">Gagal Mengambil Data</p>
            <p className="mt-0.5 text-rose-600/95 leading-relaxed">{error}</p>
            <button
              type="button"
              onClick={() => onExtract(url)}
              className="mt-2 text-rose-800 font-bold underline hover:text-rose-900 flex items-center gap-1"
            >
              Coba Lagi (Retry)
            </button>
          </div>
        </div>
      )}

      {/* Guide tags */}
      <div className="mt-5 flex flex-wrap gap-2.5 items-center justify-center text-xs text-gray-400 font-medium select-none">
        <span>Format Link Terdukung:</span>
        <button
          onClick={() => setUrl("https://www.tiktok.com/@tiktok/video/7106839358327246106")}
          className="bg-gray-50 border border-gray-100 px-2 py-1 rounded-md text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
        >
          www.tiktok.com/video/...
        </button>
        <button
          onClick={() => setUrl("https://vt.tiktok.com/ZS2AtpQsQ/")}
          className="bg-gray-50 border border-gray-100 px-2 py-1 rounded-md text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
        >
          vt.tiktok.com/...
        </button>
        <button
          onClick={() => setUrl("https://www.tiktok.com/music/clean-audio-1234567")}
          className="bg-gray-50 border border-gray-100 px-2 py-1 rounded-md text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
        >
          tiktok.com/music/...
        </button>
      </div>
    </div>
  );
}
