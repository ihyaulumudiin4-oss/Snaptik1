/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, Lock, CheckCircle2 } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      q: "Bagaimana cara download video TikTok tanpa watermark?",
      a: "Caranya sangat mudah! 1) Salin link video dari aplikasi TikTok Anda. 2) Tempel link tersebut pada input box di atas. 3) Klik tombol 'Download'. 4) Setelah pemrosesan selesai, klik tombol 'Download Video (No Watermark)' untuk mengunduh langsung ke galeri Anda tanpa tanda air."
    },
    {
      q: "Bagaimana cara mengekstrak lagu MP3 dari video TikTok?",
      a: "Tempelkan saja link video TikTok yang ingin Anda ambil audionya ke kotak input di atas. Sistem kami secara otomatis akan mengekstrak file audio asli dari video tersebut dan menampilkan opsi 'Download Musik MP3 Original' gratis."
    },
    {
      q: "Ada link halaman musik (tiktok.com/music/...) - apakah bisa diunduh?",
      a: "Tentu saja! TikSaver kami adalah salah satu dari sedikit alat yang mendeteksi link musik/sound TikTok secara otomatis. Cukup salin halaman lagu dari aplikasi TikTok, tempelkan di kotak atas, klik download, dan Anda dapat mendengarkan pratinjau audio serta mengunduh file `.mp3` resolusi tinggi."
    },
    {
      q: "Apakah mengunduh video dan audio di TikSaver berbayar?",
      a: "Sama sekali gratis! Anda tidak perlu mendaftar akun, berlangganan, atau memasukkan data kartu kredit. Semua fitur super cepat kami disediakan 100% gratis untuk semua pengguna."
    },
    {
      q: "Di mana video dan audio disimpan setelah berhasil didownload?",
      a: "Tergantung sistem operasi dan pengaturan browser Anda. Biasanya, file MP4 dan MP3 akan tersimpan otomatis di folder 'Download' (Unduhan) perangkat komputer, laptop, ponsel Android, atau iPhone Anda."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto mt-16 space-y-6" id="faq-section">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-100">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
          <span>FAQ / Pusat Bantuan</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-gray-900">Pertanyaan Sering Diajukan</h3>
        <p className="text-gray-400 text-xs sm:text-sm font-medium">Ketahui lebih lanjut mengenai cara kerja pengunduh video & musik gratis kami.</p>
      </div>

      {/* Accordion container */}
      <div className="bg-white border border-gray-100 rounded-3xl p-2 sm:p-4 shadow-sm space-y-2">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx} 
              className={`border border-transparent rounded-2xl transition-all duration-200 overflow-hidden ${isOpen ? 'bg-gray-50/70 border-gray-150/50' : 'hover:bg-gray-50/40'}`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full px-4 py-4 text-left font-bold text-gray-800 text-sm sm:text-base flex items-center justify-between gap-4"
              >
                <span className="leading-snug">{faq.q}</span>
                <span className="shrink-0 p-1 rounded-lg bg-white border border-gray-100 shadow-sm text-gray-500">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>
              
              {isOpen && (
                <div className="px-4 pb-4.5 -mt-1">
                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-medium border-t border-gray-100/60 pt-3 select-all">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Features/Trust badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 text-center">
        <div className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
          <h5 className="font-bold text-gray-800 text-xs">Aman & Terenkripsi</h5>
          <p className="text-gray-400 text-[10px] mt-0.5">Semua request diproses lewat HTTPS aman.</p>
        </div>
        <div className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-center">
          <Lock className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
          <h5 className="font-bold text-gray-800 text-xs">Jaminan Privasi</h5>
          <p className="text-gray-400 text-[10px] mt-0.5">Kami tidak menyimpan file Anda di disk.</p>
        </div>
        <div className="col-span-2 sm:col-span-1 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
          <h5 className="font-bold text-gray-800 text-xs">Kompatibilitas Penuh</h5>
          <p className="text-gray-400 text-[10px] mt-0.5">Akses lancar dari Android, iOS, & PC.</p>
        </div>
      </div>

    </div>
  );
}
