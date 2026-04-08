import { describe, it, expect, vi, beforeEach } from "vitest";
import { SpeechCollector } from "../../../src/collectors/speech";

describe("SpeechCollector", () => {
  let collector: SpeechCollector;

  beforeEach(() => {
    collector = new SpeechCollector();
    vi.stubGlobal("window", {
      performance: { now: () => Date.now() }
    });
  });

  it("should return unsupported if Speech Synthesis is missing", async () => {
    vi.stubGlobal("window", {
      performance: { now: () => Date.now() }
    });
    const result = await collector.collect();
    expect(result.status).toBe("unsupported");
    expect(result.collectorId).toBe("speech");
  });

  it("should collect voices when already available", async () => {
    const mockVoices = [
      { name: "Voice 1", lang: "en-US", localService: true, default: true },
      { name: "Voice 2", lang: "en-GB", localService: false, default: false },
    ];

    vi.stubGlobal("window", {
      performance: { now: () => Date.now() },
      speechSynthesis: {
        getVoices: vi.fn().mockReturnValue(mockVoices),
      },
    });

    const result = await collector.collect();

    if (result.status !== "completed") {
      throw new Error(`Expected completed status, got ${result.status}`);
    }

    expect(result.collectorId).toBe("speech");
    const data1 = result.data as { voiceCount: number; voiceList: Array<{ name: string }> };
    expect(data1.voiceCount).toBe(2);
    expect(data1.voiceList).toHaveLength(2);
    expect(data1.voiceList[0].name).toBe("Voice 1");

    const countSignal = result.signals.find((s) => s.key === "speech.voiceCount");
    expect(countSignal?.value).toBe(2);

    const listSignal = result.signals.find((s) => s.key === "speech.voiceList");
    expect(listSignal?.value).toBe("Voice 1,Voice 2");
  });

  it("should collect voices after voiceschanged event", async () => {
    const mockVoices = [
      { name: "Voice 1", lang: "en-US", localService: true, default: true },
    ];

    let voicesChangedCallback: (() => void) | null = null;
    const mockSpeechSynthesis = {
      getVoices: vi.fn()
        .mockReturnValueOnce([]) // Empty first time
        .mockReturnValue(mockVoices), // Return voices after event
      set onvoiceschanged(cb: () => void) { voicesChangedCallback = cb; },
    };

    vi.stubGlobal("window", {
      performance: { now: () => Date.now() },
      speechSynthesis: mockSpeechSynthesis,
    });

    // Start collection
    const collectPromise = collector.collect();

    // Trigger event
    setTimeout(() => {
      if (voicesChangedCallback) voicesChangedCallback();
    }, 50);

    const result = await collectPromise;

    if (result.status !== "completed") {
      throw new Error(`Expected completed status, got ${result.status}`);
    }

    const data2 = result.data as { voiceCount: number; voiceList: Array<{ name: string }> };
    expect(data2.voiceCount).toBe(1);
    expect(data2.voiceList[0].name).toBe("Voice 1");
  });

  it("should time out if voices take too long to load", async () => {
    vi.stubGlobal("window", {
      performance: { now: () => Date.now() },
      speechSynthesis: {
        getVoices: vi.fn().mockReturnValue([]),
      },
    });

    // Mock setTimeout to fire immediately for the collector's timeout
    vi.useFakeTimers();
    
    const collectPromise = collector.collect();
    
    // Fast-forward 2s
    vi.advanceTimersByTime(2001);
    
    const result = await collectPromise;
    vi.useRealTimers();

    if (result.status !== "completed") {
      throw new Error(`Expected completed status, got ${result.status}`);
    }

    expect(result.data.voiceCount).toBe(0);
  });
});
