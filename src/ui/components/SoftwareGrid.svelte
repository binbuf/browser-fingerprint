<script lang="ts">
  import { slide } from "svelte/transition";
  import type { ProtocolHandlerEntry } from "../../data/types";
  import { protocolHandlerList } from "../../data/protocol-handlers";

  let { data }: { data: {
    detectedProtocols: ProtocolHandlerEntry[];
    detectedCount: number;
    totalProbed: number;
    inferredApplications: string[];
  } } = $props();

  const detectedProtocols = $derived(data.detectedProtocols || []);
  const detectedCount = $derived(data.detectedCount || 0);
  const totalProbed = $derived(data.totalProbed || 0);

  const categoryLabels: Record<string, string> = {
    "communication": "Communication",
    "development": "Development",
    "gaming": "Gaming",
    "media": "Media",
    "productivity": "Productivity",
    "other": "Other"
  };

  const groupedProtocols = $derived(
    detectedProtocols.reduce((acc, p) => {
      const cat = p.category || "other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(p);
      return acc;
    }, {} as Record<string, ProtocolHandlerEntry[]>)
  );

  const undetectedProtocols = $derived(
    protocolHandlerList.filter(p => !detectedProtocols.some(d => d.scheme === p.scheme))
  );

  let showUndetected = $state(false);
</script>

<div class="software-container">
  <div class="summary-header">
    <p class="summary-line">Detected <strong>{detectedCount}</strong> protocol handlers</p>
  </div>

  {#if detectedCount > 0}
    <div class="category-groups">
      {#each Object.entries(groupedProtocols) as [cat, protocols] (cat)}
        <div class="category-group">
          <h4 class="category-title">{categoryLabels[cat] || cat}</h4>
          <div class="software-grid">
            {#each protocols as p (p.scheme)}
              <div class="software-cell">
                <div class="app-icon">
                  <span class="fallback-icon">📱</span>
                </div>
                <div class="app-info">
                  <span class="app-name">{p.applicationName}</span>
                  <code class="protocol-scheme">{p.scheme}://</code>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <p class="no-results">No protocol handlers detected.</p>
  {/if}

  <div class="undetected-section">
    <button class="toggle-undetected" onclick={() => showUndetected = !showUndetected}>
      {showUndetected ? 'Hide' : 'Show'} {totalProbed - detectedCount} probed protocols
      <span class="chevron">{showUndetected ? '▲' : '▼'}</span>
    </button>
    
    {#if showUndetected}
      <div class="undetected-list" transition:slide>
        {#each undetectedProtocols as p (p.scheme)}
          <div class="undetected-item">
            <span class="u-name">{p.applicationName}</span>
            <code class="u-scheme">{p.scheme}://</code>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .software-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .summary-header {
    font-size: 0.875rem;
  }

  .summary-line {
    margin: 0;
    color: var(--text-primary);
  }

  .category-groups {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .category-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .category-title {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
  }

  .software-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 0.5rem;
  }

  @media (min-width: 640px) {
    .software-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .software-cell {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    background-color: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 0.375rem;
  }

  .app-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-surface);
    border-radius: 0.25rem;
  }

  .fallback-icon {
    font-size: 0.875rem;
  }

  .app-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .app-name {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .protocol-scheme {
    font-size: 0.6875rem;
    color: var(--color-primary);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  .no-results {
    font-size: 0.875rem;
    color: var(--text-muted);
    text-align: center;
    padding: 1rem;
    background-color: var(--color-background);
    border-radius: 0.5rem;
    border: 1px dashed var(--color-border);
  }

  .undetected-section {
    border-top: 1px dotted var(--color-border);
    padding-top: 0.75rem;
  }

  .toggle-undetected {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 0.75rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 0;
    min-height: 2.75rem;
  }

  .undetected-list {
    margin-top: 0.5rem;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.375rem;
    padding: 0.5rem;
    background-color: var(--color-background);
    border-radius: 0.375rem;
  }

  @media (min-width: 640px) {
    .undetected-list {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .undetected-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.6875rem;
    color: var(--text-muted);
    padding: 0.125rem 0.25rem;
  }

  .u-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 0.25rem;
  }

  .u-scheme {
    opacity: 0.6;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  .chevron {
    font-size: 0.625rem;
  }
</style>
