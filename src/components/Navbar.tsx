/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Download, Music, Shield } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/25">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-gray-900">Snap<span className="text-emerald-500">Tik</span></span>
        </div>

        {/* Navigation anchors */}
        <nav className="hidden md:flex gap-8 text-sm font-semibold text-gray-500">
          <button 
            onClick={() => document.getElementById("search-section")?.scrollIntoView({ behavior: "smooth", block: "center" })}
            className="text-emerald-600 border-b-2 border-emerald-500 pb-1 hover:text-emerald-700 transition-colors"
          >
            Downloader
          </button>
          <button 
            onClick={() => {
              const input = document.getElementById("tiktok-url-input") as HTMLInputElement;
              if (input) {
                input.focus();
                input.placeholder = "Tempel link video TikTok di sini untuk convert ke MP3...";
              }
              document.getElementById("search-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            className="hover:text-gray-900 transition-colors"
          >
            MP3 Converter
          </button>
          <button 
            onClick={() => {
              const historyEl = document.getElementById("history-section");
              if (historyEl) {
                historyEl.scrollIntoView({ behavior: "smooth", block: "center" });
              } else {
                window.scrollTo({ top: 500, behavior: "smooth" });
              }
            }}
            className="hover:text-gray-900 transition-colors"
          >
            Riwayat Unduh
          </button>
          <button 
            onClick={() => document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth", block: "center" })}
            className="hover:text-gray-900 transition-colors"
          >
            Pusat Bantuan
          </button>
        </nav>

        {/* Info badges */}
        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
          <div className="hidden sm:flex items-center gap-1 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Tanpa Watermark & Iklan</span>
          </div>
          <div className="flex items-center gap-1 bg-emerald-50/50 text-emerald-700 px-2.5 py-1.5 rounded-lg border border-emerald-50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Server Aktif</span>
          </div>
        </div>
      </div>
    </header>
  );
}
