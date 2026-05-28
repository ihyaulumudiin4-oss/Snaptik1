/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  Play, Pause, Download, Volume2, Music, Copy, Check, Info, 
  Eye, Heart, MessageSquare, Share2, Award, Clock
} from "lucide-react";
import { TikTokVideoData, TikTokMusicData } from "../types";

// Helper: Format large numbers beautifully e.g., 1.2M, 45K
function formatCount(num?: number): string {
  if (num === undefined) return "-";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

// Helper: Format duration in seconds to mm:ss
function formatDuration(sec?: number): string {
  if (!sec) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

interface ResultCardProps {
  type: "video" | "music";
  data: TikTokVideoData | TikTokMusicData;
}

export default function ResultCard({ type, data }: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  
  // Custom custom audio player state for Music results
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Trigger media proxy downloads
  const handleDownload = (mediaUrl: string, title: string, mediaType: "video" | "audio") => {
    const endpoint = mediaType === "video" ? "/api/download/video" : "/api/download/audio";
    const downloadUrl = `${endpoint}?url=${encodeURIComponent(mediaUrl)}&title=${encodeURIComponent(title || "tik_media")}`;
    // Fire-and-forget download shell triggering browser attachment download
    window.location.href = downloadUrl;
  };

  const handleCopyCaption = () => {
    const text = type === "video" ? (data as TikTokVideoData).title : (data as TikTokMusicData).title;
    navigator.clipboard.writeText(text || "TikTok Media");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sound effects & music playback logic
  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.warn("Audio autoplay blocked by browser policy:", e));
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnd = () => {
      setIsPlaying(false);
      setAudioProgress(0);
      setCurrentTime(0);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      const progress = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      setAudioProgress(progress);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnd);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnd);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [data]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const value = parseFloat(e.target.value);
    const newTime = (value / 100) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setAudioProgress(value);
  };

  // Destructure variables depending on layout type
  if (type === "video") {
    const videoData = data as TikTokVideoData;
    const author = videoData.author;
    
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl border border-gray-150/80 shadow-2xl shadow-gray-150/40 p-5 sm:p-7 md:p-8 space-y-6 sm:space-y-8 hover:border-emerald-100 transition-colors duration-300" id="result-video-card">
        
        {/* Creator Identity Row */}
        {author && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div className="flex items-center gap-3">
              <img 
                src={author.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"} 
                alt={author.nickname}
                className="w-12 h-12 rounded-full border border-gray-200/80 object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug">
                  {author.nickname || "TikTok Creator"}
                </h3>
                <p className="text-emerald-600 font-semibold text-xs sm:text-sm">
                  @{author.unique_id || "creator"}
                </p>
              </div>
            </div>
            
            <div className="text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-gray-500" />
              <span>Wilayah: {videoData.region || "ID"}</span>
            </div>
          </div>
        )}

        {/* Video Info: Caption and Details */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-gray-50/60 border border-gray-100">
            <p className="text-gray-700 text-sm font-medium leading-relaxed flex-1 select-all">
              {videoData.title || "Tidak ada caption."}
            </p>
            <button
              onClick={handleCopyCaption}
              className="px-3 py-1.5 shrink-0 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              title="Salin Kapsion"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin teks</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Core Media Container (Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
          
          {/* Left Column: Premium Preview Player */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Preview Video</span>
            <div className="relative aspect-[9/16] max-h-[480px] w-full mx-auto rounded-2xl bg-black border border-gray-900 overflow-hidden shadow-lg group">
              {/* HTML5 Video tag with proxy support as src so it completely loads without referrer/CORS blocks */}
              <video 
                src={videoData.play} 
                controls 
                poster={videoData.cover}
                className="w-full h-full object-contain"
                preload="metadata"
                playsInline
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-sm pointer-events-none flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(videoData.duration)}s</span>
              </div>
            </div>
          </div>

          {/* Right Column: Download Actions & Stats Dashboard */}
          <div className="space-y-6 sm:space-y-7 self-center">
            
            {/* Stats Counter Widget */}
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Statistik Video</span>
              <div className="grid grid-cols-4 gap-2.5">
                <div className="bg-gray-50/50 rounded-xl p-3 text-center border border-gray-100 flex flex-col justify-center min-h-[50px]">
                  <Eye className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                  <span className="font-extrabold text-sm text-gray-800">{formatCount(videoData.play_count)}</span>
                  <span className="text-[9px] font-semibold text-gray-400 mt-0.5">Dilihat</span>
                </div>
                <div className="bg-gray-50/50 rounded-xl p-3 text-center border border-gray-100 flex flex-col justify-center">
                  <Heart className="w-4 h-4 mx-auto text-pink-500 mb-1 animate-pulse" />
                  <span className="font-extrabold text-sm text-gray-800">{formatCount(videoData.digg_count)}</span>
                  <span className="text-[9px] font-semibold text-gray-400 mt-0.5">Menyukai</span>
                </div>
                <div className="bg-gray-50/50 rounded-xl p-3 text-center border border-gray-100 flex flex-col justify-center">
                  <MessageSquare className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                  <span className="font-extrabold text-sm text-gray-800">{formatCount(videoData.comment_count)}</span>
                  <span className="text-[9px] font-semibold text-gray-400 mt-0.5">Komentar</span>
                </div>
                <div className="bg-gray-50/50 rounded-xl p-3 text-center border border-gray-100 flex flex-col justify-center">
                  <Share2 className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
                  <span className="font-extrabold text-sm text-gray-800">{formatCount(videoData.share_count)}</span>
                  <span className="text-[9px] font-semibold text-gray-400 mt-0.5">Bagikan</span>
                </div>
              </div>
            </div>

            {/* Direct Action Downs Buttons */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Opsi Download</span>

              {/* No Watermark button - primary */}
              <button
                onClick={() => handleDownload(videoData.play, videoData.title, "video")}
                className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-between px-5 sm:px-6 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.99] cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                  <span className="text-sm">Download Video (No Watermark)</span>
                </span>
                <span className="text-xs font-medium bg-emerald-600/30 text-white px-2 py-0.5 rounded-md hidden sm:inline-block">HD .mp4</span>
              </button>

              {/* HD unwatermarked button (if present) */}
              <button
                onClick={() => handleDownload(videoData.hdplay || videoData.play, videoData.title, "video")}
                className="w-full h-14 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 font-bold rounded-xl flex items-center justify-between px-5 sm:px-6 transition-all active:scale-[0.99] cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <Download className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                  <span className="text-sm">Download Kualitas Super HD</span>
                </span>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded-md hidden sm:inline-block">Ultra HD</span>
              </button>

              {/* Audio MP3 extraction */}
              {videoData.music || (videoData.music_info && videoData.music_info.play) ? (
                <button
                  onClick={() => handleDownload(videoData.music || videoData.music_info!.play, videoData.music_info?.title || videoData.title, "audio")}
                  className="w-full h-14 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 font-bold rounded-xl flex items-center justify-between px-5 sm:px-6 transition-all active:scale-[0.99] cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                    </svg>
                    <span className="text-sm">Download MP3 Audio</span>
                  </span>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded-md hidden sm:inline-block">320kbps .mp3</span>
                </button>
              ) : null}

              {/* Watermark fallback option */}
              {videoData.wmplay && (
                <button
                  onClick={() => handleDownload(videoData.wmplay!, videoData.title, "video")}
                  className="w-full h-12 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl flex items-center justify-between px-5 sm:px-6 transition-colors border border-gray-100 active:scale-[0.99] cursor-pointer"
                >
                  <span className="flex items-center gap-3 text-xs">
                    <Info className="w-4 h-4 text-gray-400" />
                    <span>Download Versi Watermark (Cadangan)</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-gray-450 hidden sm:inline-block">Video .mp4</span>
                </button>
              )}
            </div>

            {/* Back-linked music artist info wrapper snippet */}
            {videoData.music_info && (
              <div className="p-3.5 sm:p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                <img 
                  src={videoData.music_info.cover || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=50&h=50&fit=crop"} 
                  alt={videoData.music_info.title}
                  className="w-11 h-11 rounded-lg border border-gray-200 object-cover shrink-0" 
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-50">AUDIO ORIGINAL</span>
                  <h4 className="font-bold text-gray-800 text-xs sm:text-sm truncate mt-1">{videoData.music_info.title}</h4>
                  <p className="text-gray-400 text-xs truncate">Oleh {videoData.music_info.author || "TikTok Creator"}</p>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    );
  } else {
    // Layout: TikTok Sound/Music Download Results (Original Music link)
    const musicData = data as TikTokMusicData;

    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl border border-gray-150 shadow-2xl p-6 sm:p-8 space-y-6 sm:space-y-7 hover:border-emerald-100 transition-colors duration-300" id="result-music-card">
        
        {/* Header Header */}
        <div className="text-center space-y-1">
          <span className="text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            TikTok Sound / Music Downloader Mode
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">Daftar Sound Ditemukan</h2>
        </div>

        {/* Custom Audio Disc Rotating Deck */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            {/* Outer ring */}
            <div className={`p-4 bg-gray-900 rounded-full shadow-2xl transition-transform duration-[4000ms] ease-linear ${isPlaying ? 'animate-spin' : ''}`}>
              {/* Inner cover */}
              <img 
                src={musicData.cover || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop"} 
                alt={musicData.title}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-gray-850 object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Core hole */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-4 border-gray-900"></div>
            </div>
            {/* Music note icons decoration floating */}
            <div className={`absolute -right-2 top-2 text-emerald-500 transition-opacity duration-300 ${isPlaying ? 'opacity-100 animate-bounce' : 'opacity-0'}`}>
              <Music className="w-6 h-6" />
            </div>
          </div>

          <div className="text-center max-w-md">
            <h3 className="font-extrabold text-gray-800 text-base sm:text-lg leading-tight select-all">{musicData.title}</h3>
            <p className="text-emerald-600 font-semibold text-xs sm:text-sm mt-1">Oleh: {musicData.author || "TikTok Creator"}</p>
          </div>
        </div>

        {/* Native hidden audio node */}
        {musicData.play && (
          <audio ref={audioRef} src={musicData.play} preload="auto" />
        )}

        {/* Custom audio controller panel */}
        {musicData.play ? (
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3.5">
            <div className="flex items-center justify-between gap-4">
              {/* Play Pause trigger */}
              <button
                onClick={toggleAudio}
                className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md hover:scale-105 transition-all"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white translate-x-0.5" />}
              </button>

              {/* Slider Progress bar */}
              <div className="flex-1 space-y-1.5">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={audioProgress}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-gray-200 accent-emerald-500 rounded-lg appearance-auto cursor-pointer"
                />
                <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
                  <span>{formatDuration(currentTime)}</span>
                  <span className="flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-gray-400" />
                    <span>Pratinjau Audionya</span>
                  </span>
                  <span>{formatDuration(musicData.duration)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 text-orange-700 text-xs text-center">
            Peringatan: Pratinjau audio tidak dapat diakses untuk lagu ini karena perlindungan hak cipta TikTok.
          </div>
        )}

        {/* Main download action trigger */}
        <div className="space-y-3.5 pt-2">
          <button
            onClick={() => handleDownload(musicData.play, musicData.title, "audio")}
            disabled={!musicData.play}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-base transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/15 disabled:opacity-50"
          >
            <Download className="w-5 h-5 text-emerald-100" />
            <span>Download High-Quality MP3</span>
          </button>

          <button
            onClick={handleCopyCaption}
            className="w-full py-2.5 px-6 rounded-2xl bg-white border border-gray-200 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Nama Sound Berhasil Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Nama Lagu & Artist</span>
              </>
            )}
          </button>
        </div>

      </div>
    );
  }
}
