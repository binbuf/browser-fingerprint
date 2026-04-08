import type {
  Collector,
  CollectorCategory,
  CollectorMetadata,
  CollectorResult,
  SignalEntry,
} from "./types";
import { registry, CollectorPriority } from "./registry";
import { hashData, sha256 } from "../utils/hash";

/**
 * WebGLCollector — Extracts GPU and rendering capabilities via the WebGL API.
 * This includes hardware vendor/renderer strings, supported extensions,
 * and a rendered scene hash.
 */
export class WebGLCollector implements Collector {
  readonly id = "webgl";
  readonly name = "WebGL Fingerprinting";
  readonly category: CollectorCategory = "gpu-rendering";
  readonly description = "Extracts GPU and rendering capabilities via the WebGL API.";

  async collect(): Promise<CollectorResult> {
    const start = performance.now();

    try {
      const canvas = document.createElement("canvas");
      const gl = (canvas.getContext("webgl2") ||
        canvas.getContext("webgl")) as WebGLRenderingContext | WebGL2RenderingContext | null;

      if (!gl) {
        return {
          collectorId: this.id,
          status: "unsupported",
          durationMs: performance.now() - start,
          timestamp: Date.now(),
          reason: "WebGL not supported",
        };
      }

      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : "Unknown";
      const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "Unknown";

      const extensions = gl.getSupportedExtensions() || [];
      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      const maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS);

      // Shader precision
      const getPrecision = (shaderType: number, precisionType: number) => {
        const format = gl.getShaderPrecisionFormat(shaderType, precisionType);
        return format
          ? {
              precision: format.precision,
              rangeMin: format.rangeMin,
              rangeMax: format.rangeMax,
            }
          : null;
      };

      const precision = {
        vertexHigh: getPrecision(gl.VERTEX_SHADER, gl.HIGH_FLOAT),
        fragmentHigh: getPrecision(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT),
      };

      // Simple 3D render (Colored Triangle) and extract pixel data hash
      const renderHash = await this.renderAndHash(gl);

      const data = {
        vendor,
        renderer,
        extensions,
        maxTextureSize,
        maxViewportDims:
          maxViewportDims instanceof Int32Array
            ? Array.from(maxViewportDims)
            : [maxViewportDims, maxViewportDims],
        precision,
        renderHash,
      };

      const signals: SignalEntry[] = [
        {
          key: "webgl.vendor",
          value: String(vendor),
          label: "WebGL Vendor",
        },
        {
          key: "webgl.renderer",
          value: String(renderer),
          label: "WebGL Renderer",
        },
        {
          key: "webgl.extensionCount",
          value: extensions.length,
          label: "WebGL Extension Count",
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
        status: "error",
        durationMs: performance.now() - start,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Renders a simple colored triangle and hashes the resulting pixel data.
   */
  private async renderAndHash(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
  ): Promise<string> {
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.width = 16;
    canvas.height = 16;

    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;
    const fsSource = `
      precision mediump float;
      void main() {
        gl_FragColor = vec4(1.0, 0.5, 0.0, 1.0);
      }
    `;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Could not create shader");
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error("Could not compile WebGL shader: " + info);
      }
      return shader;
    };

    const program = gl.createProgram();
    if (!program) throw new Error("Could not create WebGL program");
    gl.attachShader(program, createShader(gl.VERTEX_SHADER, vsSource));
    gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      throw new Error("Could not link WebGL program: " + info);
    }
    gl.useProgram(program);

    const vertices = new Float32Array([-1, -1, 1, -1, 0, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posAttrib = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posAttrib);
    gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    const pixels = new Uint8Array(canvas.width * canvas.height * 4);
    gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    return sha256(pixels.join(","));
  }

  getMetadata(): CollectorMetadata {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      description: this.description,
      privacyImplication:
        "WebGL fingerprinting reveals the precise model of your graphics card and its driver version through unmasked renderer strings and subtle rendering artifacts.",
      usedBy: ["Fingerprint.com", "LinkedIn", "DataDome", "PerimeterX"],
      stabilityWeight: 1.0,
      estimatedDurationMs: 200,
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

registry.register(new WebGLCollector(), CollectorPriority.P1_FAST);
