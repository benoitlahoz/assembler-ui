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
    videoWidth: 640,
    videoHeight: 480,
    videoFrameRate: 30,
  },

  // HD (720p)
  hd: {
    videoWidth: 1280,
    videoHeight: 720,
    videoFrameRate: 30,
  },

  // Full HD (1080p)
  fullHd: {
    videoWidth: 1920,
    videoHeight: 1080,
    videoFrameRate: 30,
  },

  // 4K UHD
  uhd4k: {
    videoWidth: 3840,
    videoHeight: 2160,
    videoFrameRate: 30,
  },

  // Adaptive HD (with fallbacks)
  adaptiveHd: {
    videoWidth: { min: 640, ideal: 1920, max: 3840 },
    videoHeight: { min: 480, ideal: 1080, max: 2160 },
    videoFrameRate: { min: 24, ideal: 30, max: 60 },
  },

  // Mobile optimized (front camera)
  mobileFront: {
    videoWidth: { ideal: 1280 },
    videoHeight: { ideal: 720 },
    videoFrameRate: { ideal: 30 },
    videoFacingMode: 'user' as const,
  },

  // Mobile optimized (back camera)
  mobileBack: {
    videoWidth: { ideal: 1920 },
    videoHeight: { ideal: 1080 },
    videoFrameRate: { ideal: 30 },
    videoFacingMode: 'environment' as const,
  },

  // Video conferencing optimized
  conference: {
    videoWidth: 1280,
    videoHeight: 720,
    videoFrameRate: 30,
    videoAspectRatio: 1.777, // 16:9
  },

  // Screen recording optimized
  screenRecording: {
    videoWidth: { ideal: 1920 },
    videoHeight: { ideal: 1080 },
    videoFrameRate: { ideal: 60 },
    videoAspectRatio: 1.777,
  },
} as const;

/**
 * Audio quality presets for MediaDevicesProvider
 */
export const AudioPresets = {
  // Default quality with all enhancements
  default: {
    audioEchoCancellation: true,
    audioNoiseSuppression: true,
    audioAutoGainControl: true,
  },

  // High quality audio (music/podcast)
  highQuality: {
    audioEchoCancellation: false,
    audioNoiseSuppression: false,
    audioAutoGainControl: false,
    audioSampleRate: 48000,
  },

  // Voice optimized
  voice: {
    audioEchoCancellation: true,
    audioNoiseSuppression: true,
    audioAutoGainControl: true,
    audioSampleRate: 48000,
  },

  // Conference call optimized
  conference: {
    audioEchoCancellation: true,
    audioNoiseSuppression: true,
    audioAutoGainControl: true,
    audioSampleRate: { ideal: 48000 },
  },

  // Raw audio (no processing)
  raw: {
    audioEchoCancellation: false,
    audioNoiseSuppression: false,
    audioAutoGainControl: false,
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
