import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { RecognitionCollector } from "../../../src/collectors/recognition";
import { createPersistenceStore } from "../../../src/persistence/store";

vi.mock("../../../src/persistence/store", () => ({
  createPersistenceStore: vi.fn(),
}));

describe("RecognitionCollector", () => {
  let collector: RecognitionCollector;
  let mockStore: {
    load: Mock;
    save: Mock;
    clear: Mock;
  };

  beforeEach(() => {
    collector = new RecognitionCollector();

    mockStore = {
      load: vi.fn(),
      save: vi.fn(),
      clear: vi.fn(),
    };

    (createPersistenceStore as Mock).mockReturnValue(mockStore);
  });

  it("should report first visit when no prior data exists", async () => {
    mockStore.load.mockResolvedValue(null);

    const result = await collector.collect();

    if (result.status !== "completed") {
      throw new Error(`Expected completed status, got ${result.status}`);
    }

    expect(result.data.isFirstVisit).toBe(true);
    expect(result.data.priorVisitCount).toBe(0);

    const firstVisitSignal = result.signals.find(s => s.key === "recognition.isFirstVisit");
    expect(firstVisitSignal?.value).toBe(true);
  });

  it("should report returning visit with prior data", async () => {
    const priorData = {
      visitCount: 5,
      lastSeenTimestamp: Date.now() - 86400000,
      firstSeenTimestamp: Date.now() - 86400000 * 10,
    };
    mockStore.load.mockResolvedValue(priorData);

    const result = await collector.collect();

    if (result.status !== "completed") throw new Error();

    expect(result.data.isFirstVisit).toBe(false);
    expect(result.data.priorVisitCount).toBe(5);
    expect(result.data.lastSeenTimestamp).toBe(priorData.lastSeenTimestamp);

    const visitCountSignal = result.signals.find(s => s.key === "recognition.visitCount");
    expect(visitCountSignal?.value).toBe(5);
  });
});
