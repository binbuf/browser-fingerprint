import { describe, it, expect, vi, beforeEach } from "vitest";
import { TimezoneCollector } from "../../../src/collectors/timezone";

describe("TimezoneCollector", () => {
  let collector: TimezoneCollector;

  beforeEach(() => {
    collector = new TimezoneCollector();

    // Mock Intl.DateTimeFormat
    function MockDateTimeFormat() {
      return {
        resolvedOptions: () => ({
          timeZone: "America/New_York",
          calendar: "gregory",
          numberingSystem: "latn",
        }),
        format: () => "1/1/2023",
      };
    }

    // Mock Intl.NumberFormat
    function MockNumberFormat() {
      return {
        format: (val: number) => val.toString(),
        resolvedOptions: () => ({}),
      };
    }

    vi.stubGlobal("Intl", {
      DateTimeFormat: MockDateTimeFormat,
      NumberFormat: MockNumberFormat,
    });

    // Mock Date.getTimezoneOffset
    vi.spyOn(Date.prototype, "getTimezoneOffset").mockReturnValue(300);

    vi.stubGlobal("performance", {
      now: () => Date.now(),
    });
  });

  it("should collect timezone properties correctly", async () => {
    const result = await collector.collect();

    if (result.status !== "completed") {
      const errorMessage = result.status === "error" ? result.error : "Unknown error";
      throw new Error(`Expected completed status, got ${result.status}: ${errorMessage}`);
    }

    expect(result.collectorId).toBe("timezone");
    expect(result.data.timezone).toBe("America/New_York");
    expect(result.data.offset).toBe(300);

    const nameSignal = result.signals.find((s) => s.key === "timezone.name");
    expect(nameSignal?.value).toBe("America/New_York");

    const offsetSignal = result.signals.find((s) => s.key === "timezone.offset");
    expect(offsetSignal?.value).toBe(300);

    expect(result.hash).toBeDefined();
  });
});
