import { describe, it, expect, vi, beforeEach } from "vitest";
import { KeyboardCollector } from "../../../src/collectors/keyboard";

describe("KeyboardCollector", () => {
  let collector: KeyboardCollector;

  beforeEach(() => {
    collector = new KeyboardCollector();
    vi.stubGlobal("window", {
      performance: { now: () => Date.now() },
      navigator: {}
    });
  });

  it("should handle missing keyboard API correctly", async () => {
    vi.stubGlobal("window", {
      performance: { now: () => Date.now() },
      navigator: {}
    });
    const result = await collector.collect();

    if (result.status !== "completed") {
      throw new Error(`Expected completed status, got ${result.status}`);
    }

    expect(result.data.apiAvailable).toBe(false);
    expect(result.data.layoutMap).toBeNull();
    
    const layoutSignal = result.signals.find((s) => s.key === "keyboard.layout");
    expect(layoutSignal?.value).toBe("unknown");
  });

  it("should collect keyboard layout when API is available", async () => {
    const mockMap = new Map([
      ["KeyQ", "q"],
      ["KeyW", "w"],
    ]);

    vi.stubGlobal("window", {
      performance: { now: () => Date.now() },
      navigator: {
        keyboard: {
          getLayoutMap: vi.fn().mockResolvedValue(mockMap),
        },
      }
    });

    const result = await collector.collect();

    if (result.status !== "completed") {
      throw new Error(`Expected completed status, got ${result.status}`);
    }

    const data = result.data as { apiAvailable: boolean; layoutMap: Record<string, string> };
    expect(data.apiAvailable).toBe(true);
    expect(data.layoutMap.KeyQ).toBe("q");

    const layoutSignal = result.signals.find((s) => s.key === "keyboard.layout");
    expect(layoutSignal?.value).toBe("QWERTY");
  });

  it("should infer different layouts correctly", async () => {
    const mockMap = new Map([
      ["KeyQ", "a"],
      ["KeyW", "z"],
    ]);

    vi.stubGlobal("window", {
      performance: { now: () => Date.now() },
      navigator: {
        keyboard: {
          getLayoutMap: vi.fn().mockResolvedValue(mockMap),
        },
      }
    });

    const result = await collector.collect();

    if (result.status !== "completed") {
      throw new Error(`Expected completed status, got ${result.status}`);
    }

    const layoutSignal = result.signals.find((s) => s.key === "keyboard.layout");
    expect(layoutSignal?.value).toBe("AZERTY");
  });
});
