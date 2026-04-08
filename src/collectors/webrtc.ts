import type {
  Collector,
  CollectorCategory,
  CollectorMetadata,
  CollectorResult,
  SignalEntry,
} from "./types";
import { registry, CollectorPriority } from "./registry";
import { hashData } from "../utils/hash";

/**
 * WebRTCCollector — Discovers local and public IP addresses via WebRTC ICE candidate gathering.
 * This technique can reveal the real IP address even when using a VPN or proxy.
 */
export class WebRTCCollector implements Collector {
  readonly id = "webrtc";
  readonly name = "WebRTC Network Detection";
  readonly category: CollectorCategory = "privacy-detection";
  readonly description = "Discovers local and public IP addresses via WebRTC ICE candidate gathering.";

  async collect(signal?: AbortSignal): Promise<CollectorResult> {
    const start = performance.now();
    const timeoutMs = 5000;

    try {
      if (typeof RTCPeerConnection === "undefined") {
        return {
          collectorId: this.id,
          status: "unsupported",
          durationMs: performance.now() - start,
          timestamp: Date.now(),
          reason: "RTCPeerConnection not supported",
        };
      }

      // We gather media devices immediately as they don't depend on STUN
      const mediaDevices = await this.getMediaDevices();

      // Race the WebRTC gathering against the timeout/abort signal
      const rtcData = await Promise.race([
        this.gatherWebRTCData(mediaDevices),
        new Promise<{
          publicIP: string | null;
          localIPs: Set<string>;
          mediaDevices: { audioinput: number; audiooutput: number; videoinput: number };
          stunReachable: boolean;
        }>((resolve, reject) => {
          const timer = setTimeout(() => {
            // On timeout, resolve with partial data (media devices)
            resolve({
              publicIP: null,
              localIPs: new Set(),
              mediaDevices,
              stunReachable: false,
            });
          }, timeoutMs);

          signal?.addEventListener("abort", () => {
            clearTimeout(timer);
            reject(new Error("Aborted"));
          });
        }),
      ]);

      const data = {
        publicIP: rtcData.publicIP,
        localIPs: Array.from(rtcData.localIPs),
        mediaDevices: rtcData.mediaDevices,
        stunReachable: rtcData.stunReachable,
      };

      const signals: SignalEntry[] = [
        {
          key: "webrtc.mediaDeviceCount",
          value:
            rtcData.mediaDevices.audioinput +
            rtcData.mediaDevices.audiooutput +
            rtcData.mediaDevices.videoinput,
          label: "Media Device Count",
        },
        {
          key: "webrtc.localIPCount",
          value: rtcData.localIPs.size,
          label: "Local IP Count",
        },
        {
          key: "webrtc.stunReachable",
          value: rtcData.stunReachable,
          label: "STUN Reachable",
        },
      ];

      return {
        collectorId: this.id,
        status: "completed",
        durationMs: performance.now() - start,
        timestamp: Date.now(),
        data,
        hash: await hashData(data),
        signals,
      };
    } catch (error) {
      return {
        collectorId: this.id,
        status: error instanceof Error && error.message === "Aborted" ? "timeout" : "error",
        durationMs: performance.now() - start,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : String(error),
      } as CollectorResult;
    }
  }

  private async getMediaDevices() {
    const devices = { audioinput: 0, audiooutput: 0, videoinput: 0 };
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return devices;
    }
    try {
      const enumeratedDevices = await navigator.mediaDevices.enumerateDevices();
      enumeratedDevices.forEach((device) => {
        if (
          device.kind === "audioinput" ||
          device.kind === "audiooutput" ||
          device.kind === "videoinput"
        ) {
          devices[device.kind]++;
        }
      });
    } catch (_e) {
      // Ignore errors in enumeration
    }
    return devices;
  }

  private async gatherWebRTCData(mediaDevices: {
    audioinput: number;
    audiooutput: number;
    videoinput: number;
  }) {
    const localIPs = new Set<string>();
    let publicIP: string | null = null;
    let stunReachable = false;

    return new Promise<{
      publicIP: string | null;
      localIPs: Set<string>;
      mediaDevices: { audioinput: number; audiooutput: number; videoinput: number };
      stunReachable: boolean;
    }>((resolve) => {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:global.stun.twilio.com:3478" },
        ],
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = event.candidate.candidate;
          // Regex to extract IPv4 and IPv6 addresses
          const ipMatch = /([0-9]{1,3}(\.[0-9]{1,3}){3}|([a-f0-9]{1,4}(:[a-f0-9]{1,4}){7}))/i.exec(
            candidate
          );
          if (ipMatch) {
            const ip = ipMatch[1];
            if (candidate.indexOf("typ host") !== -1) {
              localIPs.add(ip);
            } else if (candidate.indexOf("typ srflx") !== -1) {
              publicIP = ip;
              stunReachable = true;
            }
          }
        } else {
          // End of candidate gathering
          pc.close();
          resolve({ publicIP, localIPs, mediaDevices, stunReachable });
        }
      };

      // Create a data channel to trigger ICE gathering
      pc.createDataChannel("");
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => {
          pc.close();
          resolve({ publicIP, localIPs, mediaDevices, stunReachable });
        });

      // Safety timeout for gathering (shorter than the overall collector timeout)
      setTimeout(() => {
        if (pc.signalingState !== "closed") {
          pc.close();
          resolve({ publicIP, localIPs, mediaDevices, stunReachable });
        }
      }, 4500);
    });
  }

  getMetadata(): CollectorMetadata {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      description: this.description,
      privacyImplication:
        "WebRTC can reveal your real local and public IP addresses, bypassing VPNs and proxies.",
      usedBy: ["Fingerprint.com", "BrowserLeaks", "Whoer.net"],
      stabilityWeight: 0.6,
      estimatedDurationMs: 2000,
      requiresInteraction: false,
      browsers: {
        chrome: true,
        firefox: true,
        safari: true,
        edge: true,
      },
    };
  }
}

registry.register(new WebRTCCollector(), CollectorPriority.P2_MEDIUM);
