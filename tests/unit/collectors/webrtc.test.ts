import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { WebRTCCollector } from "../../../src/collectors/webrtc";

describe("WebRTCCollector", () => {
  let collector: WebRTCCollector;
  let mockPC: {
    createDataChannel: Mock;
    createOffer: Mock;
    setLocalDescription: Mock;
    close: Mock;
    onicecandidate: ((e: { candidate: { candidate: string } | null }) => void) | null;
    signalingState: string;
  };

  beforeEach(() => {
    collector = new WebRTCCollector();

    // Mock navigator.mediaDevices
    vi.stubGlobal("navigator", {
      mediaDevices: {
        enumerateDevices: vi.fn().mockResolvedValue([
          { kind: "audioinput" },
          { kind: "audioinput" },
          { kind: "videoinput" },
          { kind: "audiooutput" },
        ]),
      },
      userAgent: "Mozilla/5.0",
    });

    // Mock RTCPeerConnection
    mockPC = {
      createDataChannel: vi.fn(),
      createOffer: vi.fn().mockResolvedValue({}),
      setLocalDescription: vi.fn().mockResolvedValue({}),
      close: vi.fn(),
      onicecandidate: null,
      signalingState: "stable",
    };

    vi.stubGlobal("RTCPeerConnection", vi.fn().mockImplementation(() => {
      return mockPC;
    }));
  });

  it("should collect WebRTC and media device data", async () => {
    // Start collection
    const collectPromise = collector.collect();
    
    // Give it a tiny bit of time to initialize the RTCPeerConnection
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Simulate ICE candidates
    if (mockPC.onicecandidate) {
      mockPC.onicecandidate({
        candidate: {
          candidate: "candidate:1 1 udp 1 192.168.1.100 1 typ host",
        },
      });
      mockPC.onicecandidate({
        candidate: {
          candidate: "candidate:2 1 udp 1 1.2.3.4 1 typ srflx",
        },
      });
      mockPC.onicecandidate({
        candidate: null,
      }); // End of candidates
    }

    const result = await collectPromise;

    if (result.status !== "completed") {
      console.error("Collector Error:", result.status === "error" ? result.error : result.status);
      throw new Error(`Expected completed status, got ${result.status}`);
    }

    expect(result.collectorId).toBe("webrtc");
    expect(result.data.publicIP).toBe("1.2.3.4");
    expect(result.data.localIPs).toContain("192.168.1.100");
    expect(result.data.mediaDevices).toEqual({
      audioinput: 2,
      audiooutput: 1,
      videoinput: 1,
    });
    expect(result.data.stunReachable).toBe(true);

    const deviceCountSignal = result.signals.find((s) => s.key === "webrtc.mediaDeviceCount");
    expect(deviceCountSignal?.value).toBe(4);
  });

  it("should handle unsupported RTCPeerConnection", async () => {
    vi.stubGlobal("RTCPeerConnection", undefined);
    const result = await collector.collect();
    expect(result.status).toBe("unsupported");
  });
});
