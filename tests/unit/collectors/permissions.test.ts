import { describe, it, expect, vi, beforeEach } from "vitest";
import { PermissionsCollector } from "../../../src/collectors/permissions";

describe("PermissionsCollector", () => {
  let collector: PermissionsCollector;

  beforeEach(() => {
    collector = new PermissionsCollector();
    vi.stubGlobal("window", {
      performance: { now: () => Date.now() },
      navigator: {}
    });
  });

  it("should return unsupported if Permissions API is missing", async () => {
    vi.stubGlobal("window", {
      performance: { now: () => Date.now() },
      navigator: {}
    });
    const result = await collector.collect();
    expect(result.status).toBe("unsupported");
    expect(result.collectorId).toBe("permissions");
  });

  it("should collect various browser permission states", async () => {
    const mockPermissions = {
      query: vi.fn().mockImplementation(async ({ name }) => {
        if (name === "camera") return { state: "denied" };
        if (name === "microphone") return { state: "prompt" };
        if (name === "notifications") return { state: "granted" };
        throw new Error("Unsupported");
      }),
    };

    vi.stubGlobal("window", {
      performance: { now: () => Date.now() },
      navigator: {
        permissions: mockPermissions,
      }
    });

    const result = await collector.collect();

    if (result.status !== "completed") {
      throw new Error(`Expected completed status, got ${result.status}`);
    }

    expect(result.collectorId).toBe("permissions");
    expect(result.data.camera).toBe("denied");
    expect(result.data.microphone).toBe("prompt");
    expect(result.data.notifications).toBe("granted");
    expect(result.data.geolocation).toBe("unsupported");

    const cameraSignal = result.signals.find((s) => s.key === "permissions.camera");
    expect(cameraSignal?.value).toBe("denied");

    const notificationsSignal = result.signals.find((s) => s.key === "permissions.notifications");
    expect(notificationsSignal?.value).toBe("granted");
  });
});
