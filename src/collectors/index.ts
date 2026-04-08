export * from "./types";
export * from "./registry";

// P0 collectors (instant)
import "./screen";
import "./navigator";
import "./timezone";
import "./math";
import "./css-media";
import "./network";

// P1 collectors (fast)
import "./canvas";
import "./webgl";
import "./audio";
import "./client-hints";
import "./permissions";
import "./storage";
import "./performance";
import "./keyboard";
import "./gamepad";
import "./speech";

// P2 collectors (medium)
import "./webrtc";
import "./webgpu";
import "./anti-fingerprint";
import "./favicon-cache";
import "./protocols";
import "./recognition";

// P3 collectors (slow)
import "./fonts";
import "./extensions";
