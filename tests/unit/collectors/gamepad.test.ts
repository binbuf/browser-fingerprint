import { describe, it, expect, vi, beforeEach } from "vitest";
import { GamepadCollector } from "../../../src/collectors/gamepad";

describe("GamepadCollector", () => {
  let collector: GamepadCollector;

  beforeEach(() => {
    collector = new GamepadCollector();
    vi.stubGlobal("window", {
      performance: { now: () => Date.now() },
      navigator: {}
    });
  });

  it("should return unsupported if Gamepad API is missing", async () => {
    vi.stubGlobal("window", {
      performance: { now: () => Date.now() },
      navigator: {}
    });
    const result = await collector.collect();
    expect(result.status).toBe("unsupported");
    expect(result.collectorId).toBe("gamepad");
  });

  it("should collect zero gamepads if none connected", async () => {
    vi.stubGlobal("window", {
      performance: { now: () => Date.now() },
      navigator: {
        getGamepads: vi.fn().mockReturnValue([null, null]),
      }
    });

    const result = await collector.collect();

    if (result.status !== "completed") {
      throw new Error(`Expected completed status, got ${result.status}`);
    }

    expect(result.collectorId).toBe("gamepad");
    expect(result.data.count).toBe(0);
    expect(result.data.gamepads).toHaveLength(0);

    const countSignal = result.signals.find((s) => s.key === "gamepad.count");
    expect(countSignal?.value).toBe(0);
  });

  it("should collect gamepad information correctly", async () => {
    const mockGamepad = {
      id: "Mock Controller",
      mapping: "standard",
      buttons: new Array(16).fill({ pressed: false }),
      axes: [0, 0, 0, 0],
    };

    vi.stubGlobal("window", {
      performance: { now: () => Date.now() },
      navigator: {
        getGamepads: vi.fn().mockReturnValue([mockGamepad, null]),
      }
    });

    const result = await collector.collect();

    if (result.status !== "completed") {
      throw new Error(`Expected completed status, got ${result.status}`);
    }

    const data = result.data as { count: number; gamepads: Array<{ id: string; buttons: number }> };
    expect(data.count).toBe(1);
    expect(data.gamepads[0].id).toBe("Mock Controller");
    expect(data.gamepads[0].buttons).toBe(16);

    const idSignal = result.signals.find((s) => s.key === "gamepad.ids");
    expect(idSignal?.value).toBe("Mock Controller");
  });
});
