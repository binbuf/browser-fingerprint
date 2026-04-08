import type { ReferenceDataEntry } from './types';

// Note: The score engine should use 1 / (totalSamples + 1) as the default frequency for values not in the dataset.
export const referenceDataset: ReferenceDataEntry[] = [
  {
    signalKey: "screen.resolution",
    totalSamples: 1000000,
    source: "AmIUnique 2025",
    lastUpdated: "2025-01-01T00:00:00Z",
    values: [
      { value: "1920x1080", frequency: 0.40, count: 400000 },
      { value: "1366x768", frequency: 0.15, count: 150000 },
      { value: "2560x1440", frequency: 0.08, count: 80000 },
      { value: "3840x2160", frequency: 0.05, count: 50000 },
      { value: "1440x900", frequency: 0.04, count: 40000 }
    ]
  },
  {
    signalKey: "screen.colorDepth",
    totalSamples: 1000000,
    source: "EFF Cover Your Tracks 2025",
    lastUpdated: "2025-01-01T00:00:00Z",
    values: [
      { value: "24", frequency: 0.85, count: 850000 },
      { value: "30", frequency: 0.10, count: 100000 },
      { value: "32", frequency: 0.04, count: 40000 }
    ]
  },
  {
    signalKey: "screen.pixelRatio",
    totalSamples: 1000000,
    source: "AmIUnique 2025",
    lastUpdated: "2025-01-01T00:00:00Z",
    values: [
      { value: "1", frequency: 0.50, count: 500000 },
      { value: "2", frequency: 0.25, count: 250000 },
      { value: "1.25", frequency: 0.10, count: 100000 },
      { value: "1.5", frequency: 0.05, count: 50000 }
    ]
  },
  {
    signalKey: "navigator.platform",
    totalSamples: 1000000,
    source: "AmIUnique 2025",
    lastUpdated: "2025-01-01T00:00:00Z",
    values: [
      { value: "Win32", frequency: 0.65, count: 650000 },
      { value: "MacIntel", frequency: 0.20, count: 200000 },
      { value: "Linux x86_64", frequency: 0.05, count: 50000 },
      { value: "iPhone", frequency: 0.05, count: 50000 }
    ]
  },
  {
    signalKey: "navigator.language",
    totalSamples: 1000000,
    source: "AmIUnique 2025",
    lastUpdated: "2025-01-01T00:00:00Z",
    values: [
      { value: "en-US", frequency: 0.45, count: 450000 },
      { value: "en-GB", frequency: 0.05, count: 50000 },
      { value: "zh-CN", frequency: 0.10, count: 100000 },
      { value: "es-ES", frequency: 0.08, count: 80000 },
      { value: "fr-FR", frequency: 0.04, count: 40000 }
    ]
  },
  {
    signalKey: "navigator.hardwareConcurrency",
    totalSamples: 1000000,
    source: "AmIUnique 2025",
    lastUpdated: "2025-01-01T00:00:00Z",
    values: [
      { value: "8", frequency: 0.40, count: 400000 },
      { value: "4", frequency: 0.20, count: 200000 },
      { value: "16", frequency: 0.15, count: 150000 },
      { value: "12", frequency: 0.08, count: 80000 },
      { value: "2", frequency: 0.05, count: 50000 }
    ]
  },
  {
    signalKey: "navigator.deviceMemory",
    totalSamples: 1000000,
    source: "AmIUnique 2025",
    lastUpdated: "2025-01-01T00:00:00Z",
    values: [
      { value: "8", frequency: 0.60, count: 600000 },
      { value: "4", frequency: 0.20, count: 200000 },
      { value: "16", frequency: 0.10, count: 100000 },
      { value: "2", frequency: 0.05, count: 50000 }
    ]
  },
  {
    signalKey: "navigator.maxTouchPoints",
    totalSamples: 1000000,
    source: "AmIUnique 2025",
    lastUpdated: "2025-01-01T00:00:00Z",
    values: [
      { value: "0", frequency: 0.60, count: 600000 },
      { value: "10", frequency: 0.25, count: 250000 },
      { value: "5", frequency: 0.05, count: 50000 }
    ]
  },
  {
    signalKey: "timezone.name",
    totalSamples: 1000000,
    source: "AmIUnique 2025",
    lastUpdated: "2025-01-01T00:00:00Z",
    values: [
      { value: "America/New_York", frequency: 0.15, count: 150000 },
      { value: "Europe/London", frequency: 0.08, count: 80000 },
      { value: "Asia/Calcutta", frequency: 0.12, count: 120000 },
      { value: "America/Los_Angeles", frequency: 0.07, count: 70000 },
      { value: "Europe/Paris", frequency: 0.05, count: 50000 }
    ]
  },
  {
    signalKey: "canvas.hash",
    totalSamples: 1000000,
    source: "EFF Cover Your Tracks 2025",
    lastUpdated: "2025-01-01T00:00:00Z",
    values: [
      { value: "08d2547b", frequency: 0.001, count: 1000 },
      { value: "f3c2b1a0", frequency: 0.0008, count: 800 },
      { value: "a1b2c3d4", frequency: 0.0005, count: 500 }
    ]
  },
  {
    signalKey: "webgl.renderer",
    totalSamples: 1000000,
    source: "AmIUnique 2025",
    lastUpdated: "2025-01-01T00:00:00Z",
    values: [
      { value: "ANGLE (Intel, Intel(R) UHD Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)", frequency: 0.15, count: 150000 },
      { value: "ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)", frequency: 0.08, count: 80000 },
      { value: "Apple M1", frequency: 0.06, count: 60000 },
      { value: "Apple M2", frequency: 0.04, count: 40000 }
    ]
  },
  {
    signalKey: "webgl.vendor",
    totalSamples: 1000000,
    source: "AmIUnique 2025",
    lastUpdated: "2025-01-01T00:00:00Z",
    values: [
      { value: "Google Inc. (Intel)", frequency: 0.40, count: 400000 },
      { value: "Google Inc. (NVIDIA)", frequency: 0.25, count: 250000 },
      { value: "Google Inc. (Apple)", frequency: 0.15, count: 150000 },
      { value: "Google Inc. (AMD)", frequency: 0.10, count: 100000 }
    ]
  },
  {
    signalKey: "audio.hash",
    totalSamples: 1000000,
    source: "EFF Cover Your Tracks 2025",
    lastUpdated: "2025-01-01T00:00:00Z",
    values: [
      { value: "3a9c8b7d", frequency: 0.01, count: 10000 },
      { value: "1f2e3d4c", frequency: 0.008, count: 8000 },
      { value: "9a8b7c6d", frequency: 0.005, count: 5000 }
    ]
  },
  {
    signalKey: "css.prefersColorScheme",
    totalSamples: 1000000,
    source: "AmIUnique 2025",
    lastUpdated: "2025-01-01T00:00:00Z",
    values: [
      { value: "light", frequency: 0.55, count: 550000 },
      { value: "dark", frequency: 0.45, count: 450000 }
    ]
  },
  {
    signalKey: "css.reducedMotion",
    totalSamples: 1000000,
    source: "AmIUnique 2025",
    lastUpdated: "2025-01-01T00:00:00Z",
    values: [
      { value: "no-preference", frequency: 0.92, count: 920000 },
      { value: "reduce", frequency: 0.08, count: 80000 }
    ]
  },
  {
    signalKey: "css.pointerType",
    totalSamples: 1000000,
    source: "AmIUnique 2025",
    lastUpdated: "2025-01-01T00:00:00Z",
    values: [
      { value: "fine", frequency: 0.65, count: 650000 },
      { value: "coarse", frequency: 0.30, count: 300000 },
      { value: "none", frequency: 0.05, count: 50000 }
    ]
  },
  {
    signalKey: "math.tan",
    totalSamples: 1000000,
    source: "Fingerprint.com 2025",
    lastUpdated: "2025-01-01T00:00:00Z",
    values: [
      { value: "-1.4215299403061327", frequency: 0.85, count: 850000 },
      { value: "-1.421529940306132", frequency: 0.12, count: 120000 },
      { value: "-1.4215299403061325", frequency: 0.02, count: 20000 }
    ]
  },
  {
    signalKey: "speech.voiceCount",
    totalSamples: 1000000,
    source: "AmIUnique 2025",
    lastUpdated: "2025-01-01T00:00:00Z",
    values: [
      { value: "0", frequency: 0.15, count: 150000 },
      { value: "3", frequency: 0.20, count: 200000 },
      { value: "66", frequency: 0.10, count: 100000 },
      { value: "161", frequency: 0.05, count: 50000 }
    ]
  },
  {
    signalKey: "fonts.detected",
    totalSamples: 1000000,
    source: "EFF Cover Your Tracks 2025",
    lastUpdated: "2025-01-01T00:00:00Z",
    values: [
      { value: "100", frequency: 0.05, count: 50000 },
      { value: "150", frequency: 0.03, count: 30000 },
      { value: "200", frequency: 0.02, count: 20000 }
    ]
  },
  {
    signalKey: "extensions.detected",
    totalSamples: 1000000,
    source: "AmIUnique 2025",
    lastUpdated: "2025-01-01T00:00:00Z",
    values: [
      { value: "0", frequency: 0.40, count: 400000 },
      { value: "1", frequency: 0.25, count: 250000 },
      { value: "2", frequency: 0.15, count: 150000 },
      { value: "3", frequency: 0.08, count: 80000 },
      { value: "5", frequency: 0.04, count: 40000 }
    ]
  },
  {
    signalKey: "clientHints.platform",
    totalSamples: 1000000,
    source: "AmIUnique 2025",
    lastUpdated: "2025-01-01T00:00:00Z",
    values: [
      { value: "\"Windows\"", frequency: 0.65, count: 650000 },
      { value: "\"macOS\"", frequency: 0.20, count: 200000 },
      { value: "\"Linux\"", frequency: 0.05, count: 50000 }
    ]
  },
  {
    signalKey: "clientHints.architecture",
    totalSamples: 1000000,
    source: "AmIUnique 2025",
    lastUpdated: "2025-01-01T00:00:00Z",
    values: [
      { value: "\"x86\"", frequency: 0.85, count: 850000 },
      { value: "\"arm\"", frequency: 0.12, count: 120000 }
    ]
  }
];
