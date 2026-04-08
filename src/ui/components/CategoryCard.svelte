<script lang="ts">
  import { slide } from "svelte/transition";
  import type { CollectorResult, CollectorMetadata, SignalEntry } from "../../collectors/types";
  import { registry } from "../../collectors/registry";
  import type { ExtensionEntry, ExtensionCategory, ProtocolHandlerEntry, FontCategory } from "../../data/types";
  import StatusBadge from "./StatusBadge.svelte";
  import EntropyBar from "./EntropyBar.svelte";
  import Tooltip from "./Tooltip.svelte";
  
  // Specialized renderers
  import ExtensionGrid from "./ExtensionGrid.svelte";
  import SoftwareGrid from "./SoftwareGrid.svelte";
  import AntiFingerprint from "./AntiFingerprint.svelte";
  import FontDisplay from "./FontDisplay.svelte";

  interface ExtensionData {
    detectedExtensions: ExtensionEntry[];
    detectedCount: number;
    totalProbed: number;
    categories: Record<ExtensionCategory, ExtensionEntry[]>;
  }

  interface ProtocolData {
    detectedProtocols: ProtocolHandlerEntry[];
    detectedCount: number;
    totalProbed: number;
    inferredApplications: string[];
  }

  interface AntiFingerprintData {
    detected: boolean;
    countermeasures: {
      technique: string;
      detected: boolean;
      description: string;
      tool?: string;
    }[];
    overallEffectiveness: "none" | "partial" | "strong";
  }

  interface FontData {
    detectedFonts: string[];
    detectedCount: number;
    totalProbed: number;
    categories: Record<FontCategory, string[]>;
    inferredSoftware: string[];
  }

  let {
    collectorId,
    result,
    maxBits = 1,
    totalBits = 1
  }: {
    collectorId: string;
    result?: CollectorResult;
    maxBits?: number;
    totalBits?: number;
  } = $props();

  const metadata = $derived(registry.get(collectorId)?.getMetadata());
  let expanded = $state(false);

  function toggleExplanation() {
    expanded = !expanded;
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    // Optional: show a toast or feedback
  }

  // Derived values for the UI
  let bits = $derived(result?.status === "completed" 
    ? result.signals.reduce((acc, s) => acc + (s.entropyBits ?? 0), 0)
    : 0
  );

  let signals = $derived(result?.status === "completed" ? result.signals : []);
  
  let commonality = $derived(result?.status === "completed"
    ? result.signals.reduce((acc, s) => Math.min(acc, s.commonality ?? 1), 1)
    : 1
  );

  let hasPopulationData = $derived(
    result?.status === "completed" && signals.some(s => s.commonality !== undefined)
  );

  let isScanning = $derived(!result);

  let showEnlarged = $state(false);
  let imageDataUrl = $derived(result?.status === "completed" 
    ? Object.values(result.data).find(v => typeof v === 'string' && v.startsWith('data:image/')) as string | undefined
    : undefined
  );

  function toggleEnlarge() {
    showEnlarged = !showEnlarged;
  }
</script>

<article class="card {isScanning ? 'skeleton' : ''}">
  <!-- 1. Card header row -->
  <div class="card-header">
    <div class="header-left">
      <h3>{metadata?.name ?? collectorId}</h3>
      {#if result}
        <StatusBadge status={result.status} />
      {/if}
    </div>
    {#if result?.status === "completed"}
      <div class="entropy-bits">
        <Tooltip text="Total entropy for this module">
          <span>{bits.toFixed(2)} bits</span>
        </Tooltip>
      </div>
    {/if}
  </div>

  <!-- 7. Blocked/Unsupported indicator -->
  {#if result?.status === "unsupported"}
    <div class="blocked-bar">
      <span class="icon">⊘</span>
      <span>{result.reason || "This feature is not supported or was blocked by your browser."}</span>
    </div>
  {:else if result?.status === "error"}
     <div class="blocked-bar error">
      <span class="icon">⚠</span>
      <span>Error: {result.error}</span>
    </div>
  {/if}

  <!-- 2. Data display area -->
  <div class="data-display">
    {#if isScanning}
      <div class="skeleton-lines">
        <div class="line w-3/4"></div>
        <div class="line w-1/2"></div>
        <div class="line w-5/6"></div>
      </div>
    {:else if result?.status === "completed"}
      {#if collectorId === 'extensions'}
        <ExtensionGrid data={result.data as unknown as ExtensionData} />
      {:else if collectorId === 'protocols'}
        <SoftwareGrid data={result.data as unknown as ProtocolData} />
      {:else if collectorId === 'anti-fingerprint'}
        <AntiFingerprint data={result.data as unknown as AntiFingerprintData} />
      {:else if collectorId === 'fonts'}
        <FontDisplay data={result.data as unknown as FontData} />
      {:else}
        {#if imageDataUrl}
          <!-- Image Thumbnail -->
          <div class="thumbnail-container">
            <button 
              class="thumbnail-btn" 
              onclick={toggleEnlarge}
              aria-label="Enlarge rendered fingerprint fragment"
            >
              <img 
                src={imageDataUrl} 
                alt="Rendered fingerprint fragment" 
                class="thumbnail" 
              />
            </button>
            {#if showEnlarged}
              <div 
                class="enlarged-overlay" 
                onclick={toggleEnlarge} 
                onkeydown={(e) => e.key === 'Escape' && toggleEnlarge()}
                role="dialog" 
                aria-modal="true"
                aria-label="Enlarged render"
                tabindex="-1"
              >
                <div class="enlarged-content">
                  <img src={imageDataUrl} alt="Enlarged render" class="enlarged-image" />
                  <button class="close-overlay" onclick={toggleEnlarge} aria-label="Close enlarged view">✕</button>
                </div>
              </div>
            {/if}
          </div>
        {/if}

        <dl class="signal-list">
          {#each signals as signal (signal.key)}
            <div class="signal-item">
              <dt>{signal.label}</dt>
              <dd>
                {#if typeof signal.value === 'string' && signal.value.length > 20 && /^[a-f0-9]{32,64}$/i.test(signal.value)}
                  <!-- Hash display -->
                  <div class="hash-container">
                    <code class="hash">{signal.value.slice(0, 12)}...</code>
                    <button class="copy-btn" onclick={() => copyToClipboard(signal.value as string)} title="Copy full hash">
                      📋
                    </button>
                  </div>
                {:else if Array.isArray(signal.value)}
                  <!-- List display -->
                  <div class="chips">
                    {#each signal.value.slice(0, 10) as item (item)}
                      <span class="chip">{item}</span>
                    {/each}
                    {#if signal.value.length > 10}
                      <span class="chip-more">+{signal.value.length - 10} more</span>
                    {/if}
                  </div>
                {:else if typeof signal.value === 'boolean'}
                  <span class="boolean {signal.value ? 'true' : 'false'}">
                    {signal.value ? 'Yes' : 'No'}
                  </span>
                {:else if typeof signal.value === 'number'}
                  <span class="number">{signal.value.toLocaleString()}</span>
                {:else}
                  <span class="text-value">{signal.value}</span>
                {/if}
              </dd>
            </div>
          {/each}
        </dl>
      {/if}
    {/if}
  </div>

  {#if result?.status === "completed"}
    <!-- 3. Entropy bar -->
    <EntropyBar {bits} {maxBits} {totalBits} />

    <!-- 4. Commonality line -->
    {#if hasPopulationData}
      <p class="commonality">
        {(commonality * 100).toFixed(2)}% of browsers share these values
      </p>
    {/if}

    <!-- 5. "Used by" tags -->
    {#if metadata?.usedBy && metadata.usedBy.length > 0}
      <div class="used-by">
        <span class="label">Used by:</span>
        <div class="tags">
          {#each metadata.usedBy as company (company)}
            <span class="tag">{company}</span>
          {/each}
        </div>
      </div>
    {/if}
  {/if}

  <!-- 6. Explanation toggle -->
  <div class="explanation-section">
    <button 
      class="toggle-btn" 
      onclick={toggleExplanation} 
      aria-expanded={expanded}
      aria-controls="explanation-{collectorId}"
    >
      <span>How does this work?</span>
      <span class="chevron">{expanded ? '▲' : '▼'}</span>
    </button>
    
    {#if expanded}
      <div id="explanation-{collectorId}" class="explanation-content" transition:slide>
        <p class="desc">{metadata?.description}</p>
        <div class="implication">
          <strong>Privacy Implication:</strong>
          <p>{metadata?.privacyImplication}</p>
        </div>
      </div>
    {/if}
  </div>
</article>

<style>
  .card {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 0.75rem;
    padding: 1.25rem;
    box-shadow: var(--color-shadow);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    transition: transform 0.3s ease-out, opacity 0.3s ease-out, box-shadow 0.2s ease-in-out;
  }

  .card:not(.skeleton) {
    animation: cardEnter 0.4s ease-out;
  }

  @keyframes cardEnter {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .card:hover {
    box-shadow: var(--color-shadow-md);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .entropy-bits {
    font-weight: 600;
    color: var(--color-primary);
    font-size: 0.875rem;
  }

  .blocked-bar {
    background-color: var(--color-warning-bg);
    color: var(--color-warning-text);
    border: 1px solid var(--color-warning-border);
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.8125rem;
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .blocked-bar.error {
    background-color: var(--color-danger-bg);
    color: var(--color-danger-text);
    border: 1px solid var(--color-danger-border);
  }

  .data-display {
    min-height: 4rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .thumbnail-container {
    display: flex;
    justify-content: center;
    margin-bottom: 0.5rem;
  }

  .thumbnail-btn {
    padding: 0;
    border: none;
    background: none;
    cursor: zoom-in;
    border-radius: 0.25rem;
    overflow: hidden;
    transition: transform 0.2s ease;
  }

  .thumbnail-btn:hover {
    transform: scale(1.05);
  }

  .thumbnail {
    max-width: 100%;
    height: 60px;
    object-fit: contain;
    border: 1px solid var(--color-border);
    border-radius: 0.25rem;
    background-color: var(--color-background);
    display: block;
  }

  .enlarged-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    cursor: zoom-out;
  }

  .enlarged-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
  }

  .enlarged-image {
    max-width: 100%;
    max-height: 90vh;
    border: 4px solid white;
    border-radius: 0.5rem;
    box-shadow: 0 0 40px rgba(0,0,0,0.5);
    display: block;
  }

  .close-overlay {
    position: absolute;
    top: -40px;
    right: -40px;
    background: white;
    color: black;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    border: none;
  }

  @media (max-width: 600px) {
    .close-overlay {
      top: 10px;
      right: 10px;
    }
  }

  .signal-list {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .signal-item {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 0.875rem;
  }

  dt {
    color: var(--text-secondary);
    font-weight: 500;
  }

  dd {
    margin: 0;
    color: var(--text-primary);
    font-weight: 600;
    text-align: right;
  }

  .hash-container {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .hash {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    background-color: var(--color-background);
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
  }

  .copy-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    margin: -0.25rem;
    border-radius: 0.25rem;
    line-height: 1;
    min-width: 2.75rem;
    min-height: 2.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .copy-btn:hover {
    background-color: var(--color-border);
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    justify-content: flex-end;
    max-width: 200px;
  }

  .chip {
    background-color: var(--color-info-bg);
    color: var(--color-info-text);
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.6875rem;
  }

  .boolean.true { color: var(--color-success); }
  .boolean.false { color: var(--color-danger); }

  .number {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  .commonality {
    margin: 0;
    font-size: 0.8125rem;
    color: var(--text-muted);
  }

  .used-by {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
  }

  .used-by .label {
    color: var(--text-muted);
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  .tag {
    background-color: var(--color-background);
    border: 1px solid var(--color-border);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    color: var(--text-secondary);
  }

  .explanation-section {
    border-top: 1px solid var(--color-border);
    padding-top: 0.75rem;
  }

  .toggle-btn {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: none;
    border: none;
    color: var(--color-primary);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0.75rem 0;
    min-height: 2.75rem;
  }

  .explanation-content {
    margin-top: 0.5rem;
    font-size: 0.8125rem;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .explanation-content .desc {
    margin-bottom: 0.5rem;
  }

  .implication {
    background-color: var(--color-info-bg);
    padding: 0.5rem;
    border-radius: 0.375rem;
  }

  .implication strong {
    color: var(--color-info-text);
    display: block;
    margin-bottom: 0.25rem;
  }

  /* Skeleton loading styles */
  .skeleton {
    pointer-events: none;
  }

  .skeleton .line {
    height: 0.75rem;
    background-color: var(--color-border);
    border-radius: 0.25rem;
    margin-bottom: 0.5rem;
    animation: shimmer 1.5s infinite linear;
    background: linear-gradient(
      90deg,
      var(--color-border) 25%,
      var(--color-background) 50%,
      var(--color-border) 75%
    );
    background-size: 200% 100%;
  }

  .w-3\/4 { width: 75%; }
  .w-1\/2 { width: 50%; }
  .w-5\/6 { width: 83.333333%; }

  @keyframes shimmer {
    from { background-position: 200% 0; }
    to { background-position: -200% 0; }
  }

  @media (max-width: 600px) {
    .hash {
      max-width: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: inline-block;
      vertical-align: middle;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .card, .skeleton .line, .toggle-btn {
      transition: none;
      animation: none;
    }
  }
</style>
