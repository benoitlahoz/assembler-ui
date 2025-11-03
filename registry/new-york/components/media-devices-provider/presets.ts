/**
 * Common video resolution presets for MediaDevicesProvider
 *
 * Usage:
 * ```vue
 * <MediaDevicesProvider
 *   v-bind="VIDEO_PRESETS.HD"
 * >
 * ```
 */

export const VideoPresets = {
  // Standard Definition (4:3)
  sd: {
    width: 640,
    height: 480,
    frameRate: 30,
  },

  // HD (720p)
  hd: {
    width: 1280,
    height: 720,
    frameRate: 30,
  },

  // Full HD (1080p)
  fullHd: {
    width: 1920,
    height: 1080,
    frameRate: 30,
  },

  // 4K UHD
  uhd4k: {
    width: 3840,
    height: 2160,
    frameRate: 30,
  },

  // Adaptive HD (with fallbacks)
  adaptiveHd: {
    width: { min: 640, ideal: 1920, max: 3840 },
    height: { min: 480, ideal: 1080, max: 2160 },
    frameRate: { min: 24, ideal: 30, max: 60 },
  },

  // Mobile optimized (front camera)
  mobileFront: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
    facingMode: 'user' as const,
  },

  // Mobile optimized (back camera)
  mobileBack: {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    frameRate: { ideal: 30 },
    facingMode: 'environment' as const,
  },

  // Video conferencing optimized
  conference: {
    width: 1280,
    height: 720,
    frameRate: 30,
    aspectRatio: 1.777, // 16:9
  },

  // Screen recording optimized
  screenRecording: {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    frameRate: { ideal: 60 },
    aspectRatio: 1.777,
  },
} as const;

/**
 * Audio quality presets for MediaDevicesProvider
 */
export const AudioPresets = {
  // Default quality with all enhancements
  default: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },

  // High quality audio (music/podcast)
  highQuality: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
    sampleRate: 48000,
  },

  // Voice optimized
  voice: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
  },

  // Conference call optimized
  conference: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: { ideal: 48000 },
  },

  // Raw audio (no processing)
  raw: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  },
} as const;

/**
 * Combined presets for common use cases
 */
export const MediaPresets = {
  // Video conference
  videoConference: {
    ...VideoPresets.conference,
    ...AudioPresets.conference,
  },

  // Screen recording with commentary
  screenRecording: {
    ...VideoPresets.screenRecording,
    ...AudioPresets.voice,
  },

  // Podcast recording (audio only)
  podcast: {
    ...AudioPresets.highQuality,
  },

  // Mobile selfie video
  mobileSelfie: {
    ...VideoPresets.mobileFront,
    ...AudioPresets.default,
  },

  // Mobile back camera video
  mobileVideo: {
    ...VideoPresets.mobileBack,
    ...AudioPresets.default,
  },
} as const;
