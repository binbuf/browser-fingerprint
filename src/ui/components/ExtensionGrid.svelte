<script lang="ts">
  import { slide } from "svelte/transition";
  import type { ExtensionEntry, ExtensionCategory } from "../../data/types";
  import { extensionList } from "../../data/extension-ids";

  let { data }: { data: {
    detectedExtensions: ExtensionEntry[];
    detectedCount: number;
    totalProbed: number;
    categories: Record<ExtensionCategory, ExtensionEntry[]>;
  } } = $props();

  const detectedExtensions = $derived(data.detectedExtensions || []);
  const detectedCount = $derived(data.detectedCount || 0);
  const totalProbed = $derived(data.totalProbed || 0);
  const categories = $derived(data.categories || {});

  let searchQuery = $state("");
  let showUndetected = $state(false);

  let filteredExtensions = $derived(
    detectedExtensions.filter(ext => 
      ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const categoryLabels: Record<ExtensionCategory, string> = {
    "ad-blocker": "Ad Blocker",
    "password-manager": "Password Manager",
    "dev-tools": "Dev Tools",
    "privacy": "Privacy",
    "productivity": "Productivity",
    "social": "Social",
    "shopping": "Shopping",
    "vpn": "VPN",
    "accessibility": "Accessibility",
    "other": "Other"
  };

  const categoryLabelsPlural: Record<ExtensionCategory, string> = {
    "ad-blocker": "Ad Blockers",
    "password-manager": "Password Managers",
    "dev-tools": "Dev Tools",
    "privacy": "Privacy Modules",
    "productivity": "Productivity Tools",
    "social": "Social Add-ons",
    "shopping": "Shopping Assistants",
    "vpn": "VPNs",
    "accessibility": "Accessibility Tools",
    "other": "Other Extensions"
  };

  function getCategoryBreakdown() {
    return Object.entries(categories)
      .filter(([_, list]) => list.length > 0)
      .map(([cat, list]) => {
        const count = list.length;
        const label = count > 1 ? categoryLabelsPlural[cat as ExtensionCategory] : categoryLabels[cat as ExtensionCategory];
        return `${count} ${label}`;
      })
      .join(", ");
  }

  const undetectedExtensions = $derived(
    extensionList.filter(ext => !detectedExtensions.some(d => d.id === ext.id))
  );

  // Helper for icon loading with timeout
  async function loadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        img.src = "";
        reject(new Error("Timeout"));
      }, 2000);

      img.onload = () => {
        clearTimeout(timeout);
        resolve(url);
      };
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error("Error loading"));
      };
      img.src = url;
    });
  }

  // Pre-fetch icons or use fallback
  let iconUrls = $state<Record<string, string>>({});
  
  $effect(() => {
    detectedExtensions.forEach(async (ext) => {
      const url = `chrome-extension://${ext.id}/${ext.warPath}`;
      try {
        await loadImage(url);
        iconUrls[ext.id] = url;
      } catch (e) {
        // Fallback handled in template
      }
    });
  });
</script>

<div class="extension-container">
  <div class="summary-header">
    <p class="summary-line">Detected <strong>{detectedCount}</strong> of {totalProbed} probed extensions</p>
    {#if detectedCount > 0}
      <p class="category-breakdown">{getCategoryBreakdown()}</p>
    {/if}
  </div>

  {#if detectedCount > 10}
    <div class="search-bar">
      <input 
        type="text" 
        placeholder="Search detected extensions..." 
        bind:value={searchQuery}
        aria-label="Search extensions"
      />
    </div>
  {/if}

  {#if filteredExtensions.length > 0}
    <div class="extension-grid">
      {#each filteredExtensions as ext (ext.id)}
        <div class="extension-cell" title="{ext.name} ({ext.id})">
          <div class="icon-container">
            {#if iconUrls[ext.id]}
              <img src={iconUrls[ext.id]} alt="" class="ext-icon" />
            {:else}
              <div class="fallback-icon">🧩</div>
            {/if}
          </div>
          <div class="ext-info">
            <span class="ext-name">{ext.name}</span>
            <span class="ext-category">{categoryLabels[ext.category]}</span>
          </div>
        </div>
      {/each}
    </div>
  {:else if detectedCount > 0}
    <p class="no-results">No extensions match your search.</p>
  {/if}

  <div class="undetected-section">
    <button class="toggle-undetected" onclick={() => showUndetected = !showUndetected}>
      {showUndetected ? 'Hide' : 'Show'} {totalProbed - detectedCount} undetected extensions
      <span class="chevron">{showUndetected ? '▲' : '▼'}</span>
    </button>
    
    {#if showUndetected}
      <div class="undetected-list" transition:slide>
        {#each undetectedExtensions as ext (ext.id)}
          <span class="undetected-item">{ext.name}</span>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .extension-container {
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

  .category-breakdown {
    margin: 0.25rem 0 0 0;
    color: var(--text-secondary);
    font-size: 0.8125rem;
  }

  .search-bar input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    background-color: var(--color-background);
    color: var(--text-primary);
    font-size: 0.875rem;
    min-height: 2.75rem;
  }

  .extension-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  @media (max-width: 400px) {
    .extension-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (min-width: 640px) {
    .extension-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .extension-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .extension-cell {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem;
    background-color: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    transition: border-color 0.2s;
  }

  .extension-cell:hover {
    border-color: var(--color-primary);
  }

  .icon-container {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-surface);
    border-radius: 0.25rem;
    overflow: hidden;
  }

  .ext-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .fallback-icon {
    font-size: 1.25rem;
  }

  .ext-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .ext-name {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    white-space: normal;
    line-height: 1.2;
  }

  .ext-category {
    font-size: 0.6875rem;
    color: var(--text-muted);
    margin-top: 0.125rem;
  }

  .no-results {
    font-size: 0.875rem;
    color: var(--text-muted);
    text-align: center;
    padding: 1rem;
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

  .toggle-undetected:hover {
    color: var(--text-secondary);
  }

  .undetected-list {
    margin-top: 0.5rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    max-height: 150px;
    overflow-y: auto;
    padding: 0.5rem;
    background-color: var(--color-background);
    border-radius: 0.375rem;
  }

  .undetected-item {
    font-size: 0.6875rem;
    color: var(--text-muted);
    background-color: var(--color-surface);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
  }

  .chevron {
    font-size: 0.625rem;
  }
</style>
