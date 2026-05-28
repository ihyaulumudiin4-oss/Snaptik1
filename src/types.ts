/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TikTokAuthor {
  id: string;
  unique_id: string;
  nickname: string;
  avatar: string;
}

export interface TikTokMusic {
  id: string;
  title: string;
  play: string;
  cover: string;
  author: string;
  original?: boolean;
  duration?: number;
}

export interface TikTokVideoData {
  id: string;
  region?: string;
  title: string;
  cover: string;
  origin_cover?: string;
  duration: number;
  play: string;
  wmplay?: string;
  hdplay?: string;
  music?: string; // Direct music mp3 path
  music_info?: TikTokMusic;
  play_count?: number;
  digg_count?: number;
  comment_count?: number;
  share_count?: number;
  download_count?: number;
  create_time?: number;
  author?: TikTokAuthor;
}

export interface TikTokMusicData {
  id: string;
  title: string;
  play: string;
  cover: string;
  author: string;
  duration?: number;
  original?: boolean;
}

export interface ApiResponse {
  success: boolean;
  type: "video" | "music";
  data: TikTokVideoData | TikTokMusicData;
  message?: string;
}

export interface DownloadHistoryItem {
  id: string;
  type: "video" | "music";
  title: string;
  authorName: string;
  cover: string;
  url: string;
  timestamp: string;
}
