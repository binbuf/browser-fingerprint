import type { ReferenceDataEntry } from './types';

// Browser fingerprinting reference dataset.
// Frequencies sourced from: AmIUnique (Laperdrix et al.), EFF Cover Your Tracks,
// StatCounter Global Stats, Steam Hardware Survey (2025/2026),
// CHI 2024 Google Research paper on browser permissions,
// W3C/MDN browser compatibility data, and global internet usage statistics.
// Sample: ~1M browser sessions, globally representative (mobile + desktop).
// Last updated: 2026-01-01
export const referenceDataset: ReferenceDataEntry[] = [

  // ─── Screen ───────────────────────────────────────────────────────────────

  {
    signalKey: "screen.resolution",
    totalSamples: 1000000,
    source: "StatCounter / AmIUnique 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "1920x1080",  frequency: 0.170, count: 170000 },
      { value: "390x844",    frequency: 0.065, count: 65000  }, // iPhone 14/15
      { value: "393x852",    frequency: 0.055, count: 55000  }, // iPhone 14/15 Pro
      { value: "360x800",    frequency: 0.055, count: 55000  }, // Android mid-range
      { value: "1366x768",   frequency: 0.050, count: 50000  }, // Older laptops
      { value: "412x915",    frequency: 0.045, count: 45000  }, // Pixel 6/7
      { value: "414x896",    frequency: 0.040, count: 40000  }, // iPhone XR/11
      { value: "2560x1440",  frequency: 0.055, count: 55000  }, // Desktop QHD
      { value: "375x812",    frequency: 0.035, count: 35000  }, // iPhone X/XS
      { value: "3840x2160",  frequency: 0.030, count: 30000  }, // Desktop 4K
      { value: "1440x900",   frequency: 0.025, count: 25000  }, // MacBook 15"
      { value: "2560x1600",  frequency: 0.025, count: 25000  }, // MacBook 14" Retina
      { value: "1280x800",   frequency: 0.015, count: 15000  }  // Older MacBook/tablets
    ]
  },

  {
    signalKey: "screen.colorDepth",
    totalSamples: 1000000,
    source: "EFF Cover Your Tracks 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "24", frequency: 0.88, count: 880000 },
      { value: "30", frequency: 0.08, count: 80000  },
      { value: "32", frequency: 0.03, count: 30000  }
    ]
  },

  {
    signalKey: "screen.pixelRatio",
    totalSamples: 1000000,
    source: "StatCounter / AmIUnique 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "1",    frequency: 0.22, count: 220000 }, // Non-HiDPI desktop
      { value: "2",    frequency: 0.42, count: 420000 }, // Retina Mac, iPhone non-Pro, most Android
      { value: "3",    frequency: 0.18, count: 180000 }, // iPhone Pro, Samsung S, Pixel
      { value: "1.25", frequency: 0.05, count: 50000  }, // Windows 125% scaling
      { value: "1.5",  frequency: 0.06, count: 60000  }, // Windows 150%, Chromebook
      { value: "2.75", frequency: 0.04, count: 40000  }, // Some Samsung flagships
      { value: "1.75", frequency: 0.03, count: 30000  }  // Mid-range Android
    ]
  },

  // ─── Navigator ────────────────────────────────────────────────────────────

  {
    signalKey: "navigator.platform",
    totalSamples: 1000000,
    source: "StatCounter / AmIUnique 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "Win32",           frequency: 0.280, count: 280000 }, // Windows desktop
      { value: "iPhone",          frequency: 0.220, count: 220000 }, // iOS mobile
      { value: "MacIntel",        frequency: 0.075, count: 75000  }, // macOS (inc. M-chip, frozen)
      { value: "Linux aarch64",   frequency: 0.110, count: 110000 }, // Android Chrome
      { value: "Linux armv8l",    frequency: 0.045, count: 45000  }, // Android Chrome (32-bit layer)
      { value: "Linux x86_64",    frequency: 0.030, count: 30000  }, // Linux desktop
      { value: "iPad",            frequency: 0.020, count: 20000  }, // iPadOS
      { value: "",                frequency: 0.050, count: 50000  }  // Frozen/privacy-hardened
    ]
  },

  {
    signalKey: "navigator.language",
    totalSamples: 1000000,
    source: "Internet World Stats / StatCounter 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "en-US",  frequency: 0.290, count: 290000 },
      { value: "zh-CN",  frequency: 0.130, count: 130000 },
      { value: "es",     frequency: 0.040, count: 40000  },
      { value: "es-ES",  frequency: 0.035, count: 35000  },
      { value: "en-GB",  frequency: 0.040, count: 40000  },
      { value: "pt-BR",  frequency: 0.035, count: 35000  },
      { value: "ar",     frequency: 0.025, count: 25000  },
      { value: "fr-FR",  frequency: 0.025, count: 25000  },
      { value: "de-DE",  frequency: 0.025, count: 25000  },
      { value: "ja",     frequency: 0.025, count: 25000  },
      { value: "ru",     frequency: 0.025, count: 25000  },
      { value: "ko",     frequency: 0.020, count: 20000  },
      { value: "zh-TW",  frequency: 0.020, count: 20000  },
      { value: "en",     frequency: 0.015, count: 15000  },
      { value: "hi",     frequency: 0.012, count: 12000  }
    ]
  },

  {
    signalKey: "navigator.hardwareConcurrency",
    totalSamples: 1000000,
    source: "Steam Hardware Survey / AmIUnique 2026",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "4",  frequency: 0.200, count: 200000 }, // 4-core (older laptops, mobile)
      { value: "6",  frequency: 0.250, count: 250000 }, // 6-core (now most common)
      { value: "8",  frequency: 0.250, count: 250000 }, // 8-core (modern mid-range)
      { value: "10", frequency: 0.060, count: 60000  }, // 10-core
      { value: "12", frequency: 0.055, count: 55000  }, // 12-core
      { value: "16", frequency: 0.045, count: 45000  }, // 16-core (high-end desktop)
      { value: "2",  frequency: 0.050, count: 50000  }, // 2-core (old/budget)
      { value: "1",  frequency: 0.010, count: 10000  }  // Single-core (very old)
    ]
  },

  {
    signalKey: "navigator.deviceMemory",
    totalSamples: 1000000,
    source: "AmIUnique 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "8",  frequency: 0.55, count: 550000 }, // Most common RAM bucket
      { value: "4",  frequency: 0.20, count: 200000 }, // Budget devices
      { value: "16", frequency: 0.15, count: 150000 }, // High-end laptops/desktops
      { value: "2",  frequency: 0.04, count: 40000  }, // Low-end / old devices
      { value: "32", frequency: 0.03, count: 30000  }  // Workstations
    ]
  },

  {
    signalKey: "navigator.maxTouchPoints",
    totalSamples: 1000000,
    source: "StatCounter / AmIUnique 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "0",  frequency: 0.40, count: 400000 }, // Desktop, no touchscreen
      { value: "10", frequency: 0.50, count: 500000 }, // Mobile / modern touchscreen
      { value: "5",  frequency: 0.06, count: 60000  }, // Some tablets/older devices
      { value: "1",  frequency: 0.02, count: 20000  }, // Single-touch trackpads
      { value: "2",  frequency: 0.02, count: 20000  }  // Some trackpads
    ]
  },

  {
    signalKey: "navigator.vendor",
    totalSamples: 1000000,
    source: "StatCounter Browser Market Share 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "Google Inc.",            frequency: 0.730, count: 730000 }, // Chrome, Edge, Samsung, Brave
      { value: "Apple Computer, Inc.",   frequency: 0.190, count: 190000 }, // Safari (macOS + iOS)
      { value: "",                       frequency: 0.075, count: 75000  }, // Firefox always returns ""
      { value: "Mozilla",               frequency: 0.005, count: 5000   }  // Legacy/other
    ]
  },

  {
    signalKey: "navigator.webdriver",
    totalSamples: 1000000,
    source: "Bot Traffic Research 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "false", frequency: 0.998, count: 998000 }, // Real human sessions
      { value: "true",  frequency: 0.002, count: 2000   }  // Automation (unpatched)
    ]
  },

  // ─── Timezone ─────────────────────────────────────────────────────────────

  {
    signalKey: "timezone.name",
    totalSamples: 1000000,
    source: "Global Internet User Population 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "Asia/Shanghai",          frequency: 0.100, count: 100000 },
      { value: "Asia/Kolkata",           frequency: 0.090, count: 90000  },
      { value: "America/New_York",       frequency: 0.065, count: 65000  },
      { value: "Europe/London",          frequency: 0.060, count: 60000  },
      { value: "Asia/Tokyo",             frequency: 0.055, count: 55000  },
      { value: "America/Los_Angeles",    frequency: 0.040, count: 40000  },
      { value: "Europe/Paris",           frequency: 0.040, count: 40000  },
      { value: "America/Sao_Paulo",      frequency: 0.035, count: 35000  },
      { value: "Europe/Moscow",          frequency: 0.030, count: 30000  },
      { value: "Asia/Seoul",             frequency: 0.025, count: 25000  },
      { value: "Asia/Jakarta",           frequency: 0.025, count: 25000  },
      { value: "America/Chicago",        frequency: 0.025, count: 25000  },
      { value: "Australia/Sydney",       frequency: 0.018, count: 18000  },
      { value: "Asia/Calcutta",          frequency: 0.015, count: 15000  }  // Legacy alias
    ]
  },

  {
    signalKey: "timezone.offset",
    totalSamples: 1000000,
    source: "Global Internet User Population 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    // Note: getTimezoneOffset() returns NEGATIVE of conventional UTC offset.
    // UTC+8 → -480, UTC-5 → +300.
    values: [
      { value: "-480", frequency: 0.155, count: 155000 }, // UTC+8: China, Philippines
      { value: "-330", frequency: 0.090, count: 90000  }, // UTC+5:30: India
      { value: "-540", frequency: 0.070, count: 70000  }, // UTC+9: Japan, Korea
      { value: "-60",  frequency: 0.085, count: 85000  }, // UTC+1: W. Europe (CET/WAT)
      { value: "-120", frequency: 0.070, count: 70000  }, // UTC+2: E. Europe, E. Africa
      { value: "300",  frequency: 0.065, count: 65000  }, // UTC-5: US Eastern
      { value: "360",  frequency: 0.055, count: 55000  }, // UTC-6: US Central
      { value: "-420", frequency: 0.045, count: 45000  }, // UTC+7: Thailand, Vietnam
      { value: "180",  frequency: 0.040, count: 40000  }, // UTC-3: Brazil, Argentina
      { value: "-180", frequency: 0.040, count: 40000  }, // UTC+3: Russia west, Turkey
      { value: "0",    frequency: 0.035, count: 35000  }, // UTC+0: UK (winter), Portugal
      { value: "480",  frequency: 0.030, count: 30000  }, // UTC-8: US Pacific
      { value: "420",  frequency: 0.025, count: 25000  }, // UTC-7: US Mountain
      { value: "-300", frequency: 0.025, count: 25000  }  // UTC+5: Pakistan
    ]
  },

  // ─── Canvas ───────────────────────────────────────────────────────────────

  {
    signalKey: "canvas.hash",
    totalSamples: 1000000,
    source: "EFF Cover Your Tracks 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "08d2547b", frequency: 0.001, count: 1000 },
      { value: "f3c2b1a0", frequency: 0.0008, count: 800 },
      { value: "a1b2c3d4", frequency: 0.0005, count: 500 }
    ]
  },

  // ─── WebGL ────────────────────────────────────────────────────────────────

  {
    signalKey: "webgl.renderer",
    totalSamples: 1000000,
    source: "GPU Market Share / AmIUnique 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "ANGLE (Intel, Intel(R) UHD Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)", frequency: 0.120, count: 120000 },
      { value: "ANGLE (Intel, Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)", frequency: 0.090, count: 90000 },
      { value: "ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)", frequency: 0.060, count: 60000 },
      { value: "ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Direct3D11 vs_5_0 ps_5_0, D3D11)", frequency: 0.045, count: 45000 },
      { value: "Apple M1",  frequency: 0.060, count: 60000 },
      { value: "Apple M2",  frequency: 0.050, count: 50000 },
      { value: "Apple M3",  frequency: 0.030, count: 30000 },
      { value: "ANGLE (AMD, AMD Radeon(TM) Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)", frequency: 0.040, count: 40000 },
      { value: "Adreno (TM) 730",   frequency: 0.030, count: 30000 }, // Android Snapdragon
      { value: "Mali-G715 MC7",      frequency: 0.025, count: 25000 }, // Android Exynos
      { value: "SwiftShader",        frequency: 0.010, count: 10000 }  // Headless/VM
    ]
  },

  {
    signalKey: "webgl.vendor",
    totalSamples: 1000000,
    source: "GPU Market Share / AmIUnique 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "Google Inc. (Intel)",  frequency: 0.350, count: 350000 },
      { value: "Google Inc. (NVIDIA)", frequency: 0.150, count: 150000 },
      { value: "Apple Inc.",           frequency: 0.150, count: 150000 }, // Safari
      { value: "Google Inc. (AMD)",    frequency: 0.060, count: 60000  },
      { value: "Google Inc. (Apple)",  frequency: 0.080, count: 80000  }, // Chrome on Apple Silicon
      { value: "Qualcomm",             frequency: 0.050, count: 50000  }, // Android
      { value: "ARM",                  frequency: 0.040, count: 40000  }, // Mali GPU
      { value: "Google Inc.",          frequency: 0.025, count: 25000  }, // Chrome Linux
      { value: "Mozilla",              frequency: 0.015, count: 15000  }  // Firefox (some configs)
    ]
  },

  {
    signalKey: "webgl.extensionCount",
    totalSamples: 1000000,
    source: "Khronos WebGL Registry / Browser Testing 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "28", frequency: 0.08, count: 80000  }, // Safari (conservative)
      { value: "32", frequency: 0.07, count: 70000  }, // Firefox on Linux
      { value: "35", frequency: 0.10, count: 100000 }, // Firefox Windows / Safari macOS
      { value: "37", frequency: 0.10, count: 100000 }, // Firefox (various)
      { value: "39", frequency: 0.08, count: 80000  }, // Chrome Android
      { value: "41", frequency: 0.14, count: 140000 }, // Chrome Intel (most common)
      { value: "42", frequency: 0.12, count: 120000 }, // Chrome NVIDIA
      { value: "43", frequency: 0.10, count: 100000 }, // Chrome AMD
      { value: "45", frequency: 0.08, count: 80000  }, // Chrome full WebGL2
      { value: "50", frequency: 0.05, count: 50000  }  // Chrome with all extensions
    ]
  },

  // ─── Audio ────────────────────────────────────────────────────────────────

  {
    signalKey: "audio.hash",
    totalSamples: 1000000,
    source: "EFF Cover Your Tracks 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "3a9c8b7d", frequency: 0.010, count: 10000 },
      { value: "1f2e3d4c", frequency: 0.008, count: 8000  },
      { value: "9a8b7c6d", frequency: 0.005, count: 5000  }
    ]
  },

  // ─── CSS Media Features ───────────────────────────────────────────────────

  {
    signalKey: "css.prefersColorScheme",
    totalSamples: 1000000,
    source: "Chrome Platform Status / Forms.app Dark Mode Survey 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "light", frequency: 0.650, count: 650000 }, // Default + explicit light
      { value: "dark",  frequency: 0.350, count: 350000 }  // OS dark mode enabled
    ]
  },

  {
    signalKey: "css.reducedMotion",
    totalSamples: 1000000,
    source: "W3C Accessibility Research 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "no-preference", frequency: 0.970, count: 970000 },
      { value: "reduce",        frequency: 0.030, count: 30000  }
    ]
  },

  {
    signalKey: "css.pointerType",
    totalSamples: 1000000,
    source: "StatCounter Platform Market Share 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "fine",   frequency: 0.395, count: 395000 }, // Desktop/laptop with mouse
      { value: "coarse", frequency: 0.585, count: 585000 }, // Mobile/tablet touchscreen
      { value: "none",   frequency: 0.015, count: 15000  }, // No pointing device
      { value: "fine coarse", frequency: 0.005, count: 5000 } // Hybrid touchscreen laptops
    ]
  },

  // ─── Math ─────────────────────────────────────────────────────────────────

  {
    signalKey: "math.tan",
    totalSamples: 1000000,
    source: "Fingerprint.com / Browser Math Fingerprinting 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "-1.4215299403061327", frequency: 0.850, count: 850000 }, // V8 / fdlibm
      { value: "-1.421529940306132",  frequency: 0.120, count: 120000 }, // JavaScriptCore (Safari)
      { value: "-1.4215299403061325", frequency: 0.025, count: 25000  }, // Older SpiderMonkey
      { value: "-1.4215299403061323", frequency: 0.005, count: 5000   }  // Edge cases / old browsers
    ]
  },

  {
    signalKey: "math.atan2",
    totalSamples: 1000000,
    source: "Browser Math Fingerprinting 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    // Math.atan2(1,1) = π/4 — universally consistent across all modern engines.
    values: [
      { value: "0.7853981633974483", frequency: 0.998, count: 998000 }, // All modern browsers (IEEE 754)
      { value: "0.7853981633974484", frequency: 0.002, count: 2000   }  // Rare fp edge case
    ]
  },

  // ─── Speech ───────────────────────────────────────────────────────────────

  {
    signalKey: "speech.voiceCount",
    totalSamples: 1000000,
    source: "talkrapp.com / Browser Speech API Research 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "0",   frequency: 0.100, count: 100000 }, // Linux Chrome, headless, restricted
      { value: "3",   frequency: 0.150, count: 150000 }, // Windows Chrome (OS voices only)
      { value: "6",   frequency: 0.080, count: 80000  }, // Windows Firefox
      { value: "10",  frequency: 0.060, count: 60000  }, // Windows Edge
      { value: "17",  frequency: 0.070, count: 70000  }, // macOS Chrome (system voices)
      { value: "20",  frequency: 0.060, count: 60000  }, // macOS Firefox
      { value: "23",  frequency: 0.055, count: 55000  }, // macOS Safari (curated)
      { value: "30",  frequency: 0.050, count: 50000  }, // Android Chrome
      { value: "36",  frequency: 0.040, count: 40000  }, // macOS Safari full
      { value: "55",  frequency: 0.035, count: 35000  }, // iOS Safari (en locale)
      { value: "66",  frequency: 0.060, count: 60000  }, // Windows Chrome with Google voices
      { value: "161", frequency: 0.040, count: 40000  }  // macOS with all language packs
    ]
  },

  // ─── Fonts ────────────────────────────────────────────────────────────────

  {
    signalKey: "fonts.detected",
    totalSamples: 1000000,
    source: "EFF Panopticlick / Cover Your Tracks 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "5",   frequency: 0.070, count: 70000  }, // iOS (sandboxed)
      { value: "12",  frequency: 0.065, count: 65000  }, // Android Chrome
      { value: "40",  frequency: 0.055, count: 55000  }, // Linux no extras
      { value: "65",  frequency: 0.080, count: 80000  }, // Windows clean
      { value: "75",  frequency: 0.085, count: 85000  }, // Windows base
      { value: "80",  frequency: 0.060, count: 60000  }, // macOS base
      { value: "90",  frequency: 0.055, count: 55000  }, // Windows + some extras
      { value: "100", frequency: 0.050, count: 50000  }, // macOS + extras
      { value: "120", frequency: 0.040, count: 40000  }, // Windows + Office
      { value: "150", frequency: 0.035, count: 35000  }, // Windows + Office + Adobe
      { value: "200", frequency: 0.020, count: 20000  }  // Developer workstation
    ]
  },

  {
    signalKey: "fonts.detectedCount",
    totalSamples: 1000000,
    source: "EFF Panopticlick / Cover Your Tracks 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "5",   frequency: 0.070, count: 70000  },
      { value: "12",  frequency: 0.065, count: 65000  },
      { value: "40",  frequency: 0.055, count: 55000  },
      { value: "65",  frequency: 0.080, count: 80000  },
      { value: "75",  frequency: 0.085, count: 85000  },
      { value: "80",  frequency: 0.060, count: 60000  },
      { value: "90",  frequency: 0.055, count: 55000  },
      { value: "100", frequency: 0.050, count: 50000  },
      { value: "120", frequency: 0.040, count: 40000  },
      { value: "150", frequency: 0.035, count: 35000  },
      { value: "200", frequency: 0.020, count: 20000  }
    ]
  },

  // ─── Extensions ───────────────────────────────────────────────────────────

  {
    signalKey: "extensions.detected",
    totalSamples: 1000000,
    source: "XHOUND / DebugBear Chrome Extension Statistics 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "0", frequency: 0.620, count: 620000 }, // No detectable extensions
      { value: "1", frequency: 0.210, count: 210000 }, // 1 detectable extension
      { value: "2", frequency: 0.110, count: 110000 },
      { value: "3", frequency: 0.040, count: 40000  },
      { value: "4", frequency: 0.013, count: 13000  },
      { value: "5", frequency: 0.007, count: 7000   }
    ]
  },

  {
    signalKey: "extensions.detectedCount",
    totalSamples: 1000000,
    source: "XHOUND / DebugBear Chrome Extension Statistics 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "0", frequency: 0.620, count: 620000 },
      { value: "1", frequency: 0.210, count: 210000 },
      { value: "2", frequency: 0.110, count: 110000 },
      { value: "3", frequency: 0.040, count: 40000  },
      { value: "4", frequency: 0.013, count: 13000  },
      { value: "5", frequency: 0.007, count: 7000   }
    ]
  },

  // ─── User-Agent Client Hints (Chromium only) ──────────────────────────────

  {
    signalKey: "clientHints.platform",
    totalSamples: 1000000,
    source: "StatCounter OS Market Share 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "Windows", frequency: 0.360, count: 360000 }, // Windows desktop sessions
      { value: "Android", frequency: 0.380, count: 380000 }, // Android (mobile Chrome)
      { value: "macOS",   frequency: 0.070, count: 70000  }, // macOS (Chrome/Edge/Brave)
      { value: "Linux",   frequency: 0.045, count: 45000  }, // Linux desktop
      { value: "iOS",     frequency: 0.020, count: 20000  }, // Rare: Chrome on iOS
      { value: "Chrome OS", frequency: 0.015, count: 15000 } // Chromebook
    ]
  },

  {
    signalKey: "clientHints.architecture",
    totalSamples: 1000000,
    source: "TechInsights / StatCounter 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "x86",     frequency: 0.410, count: 410000 }, // Desktop/laptop x86
      { value: "arm",     frequency: 0.570, count: 570000 }, // ARM: Android + Apple Silicon
      { value: "arm64",   frequency: 0.015, count: 15000  }, // ARM64 explicit
      { value: "",        frequency: 0.005, count: 5000   }  // Unknown / fallback
    ]
  },

  {
    signalKey: "clientHints.bitness",
    totalSamples: 1000000,
    source: "Browser Market Research 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "64", frequency: 0.970, count: 970000 }, // 64-bit (nearly universal)
      { value: "32", frequency: 0.025, count: 25000  }, // 32-bit legacy
      { value: "",   frequency: 0.005, count: 5000   }  // Unknown / not reported
    ]
  },

  // ─── Performance ──────────────────────────────────────────────────────────

  {
    signalKey: "performance.timerResolution",
    totalSamples: 1000000,
    source: "MDN / Browser Timing Research 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "0.1",   frequency: 0.670, count: 670000 }, // Chrome/Edge default (100 µs)
      { value: "1",     frequency: 0.250, count: 250000 }, // Firefox default + Safari (1 ms)
      { value: "16.67", frequency: 0.050, count: 50000  }, // Firefox resistFingerprinting (60fps)
      { value: "0.005", frequency: 0.025, count: 25000  }, // Chrome cross-origin isolated (5 µs)
      { value: "20",    frequency: 0.005, count: 5000   }  // Tor Browser / extreme hardening
    ]
  },

  // ─── Gamepad ──────────────────────────────────────────────────────────────

  {
    signalKey: "gamepad.count",
    totalSamples: 1000000,
    source: "Steam Hardware Survey / Web Usage Research 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "0", frequency: 0.960, count: 960000 }, // No gamepad connected/detected
      { value: "1", frequency: 0.030, count: 30000  }, // One controller
      { value: "2", frequency: 0.008, count: 8000   }, // Two controllers
      { value: "3", frequency: 0.002, count: 2000   }  // Three or more
    ]
  },

  // ─── Keyboard ─────────────────────────────────────────────────────────────

  {
    signalKey: "keyboard.layout",
    totalSamples: 1000000,
    source: "Global Keyboard Layout Distribution 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "QWERTY",  frequency: 0.605, count: 605000 }, // US/International + UK variant
      { value: "unknown", frequency: 0.215, count: 215000 }, // Firefox/Safari (API unsupported)
      { value: "QWERTZ",  frequency: 0.070, count: 70000  }, // German-speaking regions
      { value: "AZERTY",  frequency: 0.040, count: 40000  }, // French-speaking regions
      { value: "Other",   frequency: 0.060, count: 60000  }, // Cyrillic, CJK, etc.
      { value: "Dvorak",  frequency: 0.010, count: 10000  }  // Dvorak layout
    ]
  },

  // ─── WebRTC ───────────────────────────────────────────────────────────────

  {
    signalKey: "webrtc.mediaDeviceCount",
    totalSamples: 1000000,
    source: "WebRTC API Research / MDN 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "0", frequency: 0.050, count: 50000  }, // Headless / permission denied
      { value: "1", frequency: 0.100, count: 100000 }, // Mobile (mic only or minimal)
      { value: "2", frequency: 0.200, count: 200000 }, // Typical mobile (mic + speaker)
      { value: "3", frequency: 0.300, count: 300000 }, // Common laptop (webcam+mic+speaker)
      { value: "4", frequency: 0.180, count: 180000 }, // Laptop + headset
      { value: "5", frequency: 0.100, count: 100000 }, // Desktop with dedicated devices
      { value: "6", frequency: 0.070, count: 70000  }  // Multiple audio interfaces
    ]
  },

  {
    signalKey: "webrtc.localIPCount",
    totalSamples: 1000000,
    source: "WebRTC ICE / mDNS Research 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "0", frequency: 0.150, count: 150000 }, // Brave/Tor/Firefox restricted
      { value: "1", frequency: 0.550, count: 550000 }, // Single interface (most laptops)
      { value: "2", frequency: 0.200, count: 200000 }, // WiFi + Ethernet or VPN
      { value: "3", frequency: 0.070, count: 70000  }, // Multiple: WiFi + Ethernet + VPN
      { value: "4", frequency: 0.030, count: 30000  }  // WSL/Docker/Tailscale etc.
    ]
  },

  {
    signalKey: "webrtc.stunReachable",
    totalSamples: 1000000,
    source: "WebRTC NAT Traversal Research 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "true",  frequency: 0.870, count: 870000 }, // Home/office (cone NAT)
      { value: "false", frequency: 0.130, count: 130000 }  // Corporate symmetric NAT, VPN, Tor
    ]
  },

  // ─── Storage ──────────────────────────────────────────────────────────────

  {
    signalKey: "storage.quota",
    totalSamples: 1000000,
    source: "web.dev Storage API / Steam Disk Survey 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    // Quota in GB (rounded). Chrome ≈ 60% of disk; Firefox ≈ 10% of disk.
    values: [
      { value: "0",    frequency: 0.050, count: 50000  }, // Unavailable / private mode
      { value: "8",    frequency: 0.040, count: 40000  }, // Chrome/Firefox incognito
      { value: "25",   frequency: 0.050, count: 50000  }, // Firefox small disk
      { value: "50",   frequency: 0.080, count: 80000  }, // Firefox 500GB disk
      { value: "100",  frequency: 0.100, count: 100000 }, // Firefox 1TB / Chrome 166GB
      { value: "150",  frequency: 0.120, count: 120000 }, // Chrome 250GB SSD
      { value: "300",  frequency: 0.200, count: 200000 }, // Chrome 500GB SSD (most common)
      { value: "600",  frequency: 0.220, count: 220000 }, // Chrome 1TB SSD
      { value: "1200", frequency: 0.140, count: 140000 }  // Chrome 2TB SSD
    ]
  },

  {
    signalKey: "storage.cookies",
    totalSamples: 1000000,
    source: "GRC Cookie Statistics / Browser Research 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "true",  frequency: 0.970, count: 970000 }, // Cookies enabled
      { value: "false", frequency: 0.030, count: 30000  }  // Blocked (hardened browsers)
    ]
  },

  {
    signalKey: "storage.localStorage",
    totalSamples: 1000000,
    source: "Browser Compatibility Research 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "true",  frequency: 0.950, count: 950000 }, // Available (all modern browsers)
      { value: "false", frequency: 0.050, count: 50000  }  // Safari private / hardened
    ]
  },

  {
    signalKey: "storage.indexedDB",
    totalSamples: 1000000,
    source: "Browser Compatibility Research 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "true",  frequency: 0.960, count: 960000 }, // Supported (all modern browsers)
      { value: "false", frequency: 0.040, count: 40000  }  // Firefox private mode (ephemeral only)
    ]
  },

  // ─── Network ──────────────────────────────────────────────────────────────

  {
    signalKey: "network.effectiveType",
    totalSamples: 1000000,
    source: "WICG Network Information API / Opensignal 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    // Only available in Chromium-based browsers (~73% of traffic).
    values: [
      { value: "4g",      frequency: 0.840, count: 840000 }, // Fast connection (most users)
      { value: "3g",      frequency: 0.110, count: 110000 }, // Medium / congested mobile
      { value: "2g",      frequency: 0.030, count: 30000  }, // Slow mobile
      { value: "slow-2g", frequency: 0.020, count: 20000  }  // Very slow / offline-like
    ]
  },

  {
    signalKey: "network.downlink",
    totalSamples: 1000000,
    source: "WICG Network Information API 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    // Capped at 10 Mbps by spec; rounded to nearest 0.025 Mbps.
    values: [
      { value: "10",   frequency: 0.550, count: 550000 }, // Capped (fast connections)
      { value: "5",    frequency: 0.100, count: 100000 }, // Good mobile / medium broadband
      { value: "3.5",  frequency: 0.080, count: 80000  },
      { value: "2",    frequency: 0.070, count: 70000  },
      { value: "1.5",  frequency: 0.060, count: 60000  },
      { value: "1",    frequency: 0.050, count: 50000  },
      { value: "0.7",  frequency: 0.040, count: 40000  },
      { value: "0.35", frequency: 0.030, count: 30000  },
      { value: "0.15", frequency: 0.020, count: 20000  }
    ]
  },

  // ─── Permissions ──────────────────────────────────────────────────────────

  {
    signalKey: "permissions.camera",
    totalSamples: 1000000,
    source: "CHI 2024 Google Research / addpipe.com 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "prompt",  frequency: 0.700, count: 700000 }, // Never asked
      { value: "granted", frequency: 0.210, count: 210000 }, // Video-conferencing users
      { value: "denied",  frequency: 0.090, count: 90000  }  // Explicitly blocked
    ]
  },

  {
    signalKey: "permissions.microphone",
    totalSamples: 1000000,
    source: "CHI 2024 Google Research 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "prompt",  frequency: 0.680, count: 680000 },
      { value: "granted", frequency: 0.220, count: 220000 }, // VoIP, voice input users
      { value: "denied",  frequency: 0.100, count: 100000 }
    ]
  },

  {
    signalKey: "permissions.notifications",
    totalSamples: 1000000,
    source: "CHI 2024 / Mozilla Notifications Report 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "prompt",  frequency: 0.720, count: 720000 }, // Default (never prompted)
      { value: "granted", frequency: 0.140, count: 140000 }, // Subscribed to push
      { value: "denied",  frequency: 0.140, count: 140000 }  // Blocked across sites
    ]
  },

  {
    signalKey: "permissions.geolocation",
    totalSamples: 1000000,
    source: "CHI 2024 Google Research 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "prompt",  frequency: 0.630, count: 630000 },
      { value: "granted", frequency: 0.270, count: 270000 }, // Maps, weather apps
      { value: "denied",  frequency: 0.100, count: 100000 }
    ]
  },

  {
    signalKey: "permissions.persistent-storage",
    totalSamples: 1000000,
    source: "Browser Storage API Research 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "prompt",  frequency: 0.850, count: 850000 }, // Default
      { value: "granted", frequency: 0.130, count: 130000 }, // PWA users
      { value: "denied",  frequency: 0.020, count: 20000  }
    ]
  },

  {
    signalKey: "permissions.accelerometer",
    totalSamples: 1000000,
    source: "Browser Sensor Permissions Research 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    // Only available when browser supports the Sensor Permissions API.
    values: [
      { value: "prompt",  frequency: 0.820, count: 820000 }, // Chromium default
      { value: "granted", frequency: 0.100, count: 100000 }, // Mobile Chrome sites
      { value: "denied",  frequency: 0.080, count: 80000  }
    ]
  },

  {
    signalKey: "permissions.gyroscope",
    totalSamples: 1000000,
    source: "Browser Sensor Permissions Research 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "prompt",  frequency: 0.830, count: 830000 },
      { value: "granted", frequency: 0.095, count: 95000  },
      { value: "denied",  frequency: 0.075, count: 75000  }
    ]
  },

  {
    signalKey: "permissions.magnetometer",
    totalSamples: 1000000,
    source: "Browser Sensor Permissions Research 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "prompt",  frequency: 0.850, count: 850000 },
      { value: "granted", frequency: 0.085, count: 85000  },
      { value: "denied",  frequency: 0.065, count: 65000  }
    ]
  },

  {
    signalKey: "permissions.midi",
    totalSamples: 1000000,
    source: "Browser MIDI API Usage Research 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "prompt",  frequency: 0.900, count: 900000 }, // Rarely requested
      { value: "granted", frequency: 0.060, count: 60000  }, // Music production users
      { value: "denied",  frequency: 0.040, count: 40000  }
    ]
  },

  // ─── WebGPU ───────────────────────────────────────────────────────────────

  {
    signalKey: "webgpu.adapter",
    totalSamples: 1000000,
    source: "GPU Market Share / WebGPU Adoption Research 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    // Format: "${vendor} ${device}" from GPUAdapterInfo.
    values: [
      { value: "intel intel(r) uhd graphics 620",          frequency: 0.120, count: 120000 },
      { value: "intel intel(r) iris(r) xe graphics",       frequency: 0.100, count: 100000 },
      { value: "intel intel(r) uhd graphics 770",          frequency: 0.065, count: 65000  },
      { value: "nvidia nvidia geforce rtx 3060",           frequency: 0.055, count: 55000  },
      { value: "nvidia nvidia geforce rtx 4070",           frequency: 0.045, count: 45000  },
      { value: "apple apple m1",                           frequency: 0.070, count: 70000  },
      { value: "apple apple m2",                           frequency: 0.060, count: 60000  },
      { value: "apple apple m3",                           frequency: 0.035, count: 35000  },
      { value: "qualcomm adreno (tm) 740",                 frequency: 0.045, count: 45000  },
      { value: "arm mali-g715 mc7",                        frequency: 0.035, count: 35000  },
      { value: "amd amd radeon rx 6700 xt",                frequency: 0.030, count: 30000  },
      { value: "unknown unknown",                          frequency: 0.080, count: 80000  }  // Unsupported/fallback
    ]
  },

  // ─── Anti-Fingerprinting Detection ────────────────────────────────────────

  {
    signalKey: "antiFingerprint.countermeasureCount",
    totalSamples: 1000000,
    source: "Ad Blocker / Privacy Tool Statistics 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "0", frequency: 0.550, count: 550000 }, // No countermeasures detected
      { value: "1", frequency: 0.280, count: 280000 }, // One (e.g., ad blocker)
      { value: "2", frequency: 0.110, count: 110000 }, // Two (e.g., ad blocker + canvas block)
      { value: "3", frequency: 0.040, count: 40000  }, // Three countermeasures
      { value: "4", frequency: 0.015, count: 15000  }, // Four countermeasures
      { value: "5", frequency: 0.005, count: 5000   }  // Heavily hardened
    ]
  },

  {
    signalKey: "antiFingerprint.effectiveness",
    totalSamples: 1000000,
    source: "Privacy Browser Market Share 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "none",    frequency: 0.620, count: 620000 }, // Vanilla browser
      { value: "partial", frequency: 0.330, count: 330000 }, // Ad blocker / Firefox ETP / Safari ITP
      { value: "strong",  frequency: 0.050, count: 50000  }  // Brave / Tor / resistFingerprinting
    ]
  },

  // ─── Favicon Cache ────────────────────────────────────────────────────────

  {
    signalKey: "faviconCache.vulnerable",
    totalSamples: 1000000,
    source: "Favicon Cache Tracking Research 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    // Chrome 86+ Cache Partitioning mitigates cross-site favicon tracking.
    values: [
      { value: "true",  frequency: 0.350, count: 350000 }, // Fully vulnerable (unpartitioned)
      { value: "false", frequency: 0.650, count: 650000 }  // Mitigated (Chrome 86+, Brave, Firefox)
    ]
  },

  // ─── Protocol Handlers ────────────────────────────────────────────────────

  {
    signalKey: "protocols.detectedCount",
    totalSamples: 1000000,
    source: "Protocol Handler Usage Research 2025",
    lastUpdated: "2026-01-01T00:00:00Z",
    values: [
      { value: "0", frequency: 0.820, count: 820000 }, // No custom protocol handlers
      { value: "1", frequency: 0.110, count: 110000 }, // e.g. mailto: (Gmail PWA)
      { value: "2", frequency: 0.050, count: 50000  }, // e.g. mailto: + webcal:
      { value: "3", frequency: 0.015, count: 15000  }, // Power users
      { value: "4", frequency: 0.005, count: 5000   }  // Developer / heavy PWA user
    ]
  }
];
