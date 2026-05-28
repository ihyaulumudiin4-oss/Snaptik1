/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { History, Eye, Trash2, Calendar, Music, Video, CloudDownload } from "lucide-react";
import { DownloadHistoryItem } from "../types";

interface HistoryDashboardProps {
  history: DownloadHistoryItem[];
  onSelect: (url: string) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export default function HistoryDashboard({ history, onSelect, onRemove, onClearAll }: HistoryDashboardProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-10 px-4 max-w-xl mx-auto bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 mt-10">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 mx-auto border border-gray-100 shadow-sm mb-4">
          <History className="w-5 h-5 text-gray-300" />
        </div>
        <h4 className="font-bold text-gray-800 text-sm sm:text-base">Belum Ada Riwayat Download</h4>
        <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-xs mx-auto leading-relaxed">
          Semua video dan musik yang sukses Anda unduh akan tercatat di sini sehingga Anda bisa download ulang dengan cepat!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-4" id="history-section">
      {/* Header section with Clear all button */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-500" />
          <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">Sesi Riwayat Unduh</h3>
          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md border border-emerald-100">
            {history.length} Item
          </span>
        </div>
        <button
          onClick={onClearAll}
          className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors flex items-center gap-1 bg-rose-50/50 hover:bg-rose-50 border border-rose-100/40 px-2.5 py-1.5 rounded-xl"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hapus Semua</span>
        </button>
      </div>

      {/* Grid of list entries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {history.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white border border-gray-100 rounded-2xl p-3 flex items-center gap-3 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300"
          >
            {/* Thumbnail preview */}
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 shadow-sm">
              <img
                src={item.cover}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                {item.type === "video" ? (
                  <Video className="w-3.5 h-3.5 text-white drop-shadow" />
                ) : (
                  <Music className="w-3.5 h-3.5 text-white drop-shadow" />
                )}
              </div>
            </div>

            {/* Core Info */}
            <div className="min-w-0 flex-1 pr-8">
              <div className="flex items-center gap-1.5 mb-1">
                {item.type === "video" ? (
                  <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                    VIDEO
                  </span>
                ) : (
                  <span className="text-[9px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-100">
                    AUDIO
                  </span>
                )}
                <span className="text-[9px] font-medium text-gray-400 flex items-center gap-0.5">
                  <Calendar className="w-2.5 h-2.5" /> {item.timestamp}
                </span>
              </div>
              <h4 className="font-extrabold text-gray-800 text-xs sm:text-sm truncate select-none leading-snug">
                {item.title}
              </h4>
              <p className="text-gray-400 text-[10px] sm:text-xs truncate">
                @{item.authorName}
              </p>
            </div>

            {/* Quick action controllers */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                onClick={() => onSelect(item.url)}
                className="p-2 rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                title="Buka kembali"
              >
                <CloudDownload className="w-4 h-4" />
              </button>
              <button
                onClick={() => onRemove(item.id)}
                className="p-2 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                title="Hapus riwayat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
