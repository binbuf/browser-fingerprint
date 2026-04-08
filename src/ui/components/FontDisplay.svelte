<script lang="ts">
  import type { FontCategory } from "../../data/types";

  let { data }: { data: {
    detectedFonts: string[];
    detectedCount: number;
    totalProbed: number;
    categories: Record<FontCategory, string[]>;
    inferredSoftware: string[];
  } } = $props();

  const detectedCount = $derived(data.detectedCount || 0);
  const totalProbed = $derived(data.totalProbed || 0);
  const categories = $derived(data.categories || {});
  const inferredSoftware = $derived(data.inferredSoftware || []);

  const categoryLabels: Record<FontCategory, string> = {
    "os-default": "System Default",
    "adobe": "Adobe Creative Suite",
    "ms-office": "Microsoft Office",
    "google": "Google Fonts (local)",
    "developer": "Developer Tools",
    "design": "Design Tools",
    "other": "Other"
  };

  const categoryColors: Record<FontCategory, string> = {
    "os-default": "gray",
    "adobe": "red",
    "ms-office": "blue",
    "google": "yellow",
    "developer": "green",
    "design": "purple",
    "other": "gray"
  };

  function hasFonts(cat: FontCategory) {
    return categories[cat] && categories[cat].length > 0;
  }
</script>

<div class="font-display-container">
  <div class="summary-header">
    <p class="summary-line">Detected <strong>{detectedCount}</strong> of {totalProbed} probed fonts</p>
  </div>

  {#if inferredSoftware.length > 0}
    <div class="software-inference">
      {#each inferredSoftware as software (software)}
        <div class="inference-box">
          <span class="icon">🔍</span>
          <p>Your installed fonts suggest you have <strong>{software}</strong> installed.</p>
        </div>
      {/each}
    </div>
  {/if}

  <div class="font-categories">
    {#each Object.keys(categoryLabels) as cat (cat)}
      {#if hasFonts(cat as FontCategory)}
        <div class="font-group">
          <h4 class="group-title">{categoryLabels[cat as FontCategory]}</h4>
          <div class="chips">
            {#each categories[cat as FontCategory] as font (font)}
              <span class="chip {categoryColors[cat as FontCategory]}">{font}</span>
            {/each}
          </div>
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .font-display-container {
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

  .software-inference {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .inference-box {
    display: flex;
    gap: 0.75rem;
    padding: 0.75rem;
    background-color: var(--color-info-bg);
    border: 1px solid var(--color-info-text);
    border-radius: 0.5rem;
    align-items: center;
  }

  .inference-box .icon {
    font-size: 1.25rem;
  }

  .inference-box p {
    margin: 0;
    font-size: 0.8125rem;
    color: var(--color-info-text);
    line-height: 1.4;
  }

  .font-categories {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .font-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .group-title {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  .chip {
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    background-color: var(--color-background);
    border: 1px solid var(--color-border);
    color: var(--text-secondary);
  }

  .chip.red { border-color: #ef4444; color: #b91c1c; background-color: #fef2f2; }
  .chip.blue { border-color: #3b82f6; color: #1d4ed8; background-color: #eff6ff; }
  .chip.yellow { border-color: #eab308; color: #a16207; background-color: #fefce8; }
  .chip.green { border-color: #22c55e; color: #15803d; background-color: #f0fdf4; }
  .chip.purple { border-color: #a855f7; color: #7e22ce; background-color: #faf5ff; }
  .chip.gray { border-color: var(--color-border); color: var(--text-secondary); background-color: var(--color-background); }

  :global(.dark) .chip.red { background-color: #450a0a; color: #f87171; }
  :global(.dark) .chip.blue { background-color: #172554; color: #60a5fa; }
  :global(.dark) .chip.yellow { background-color: #422006; color: #facc15; }
  :global(.dark) .chip.green { background-color: #052e16; color: #4ade80; }
  :global(.dark) .chip.purple { background-color: #3b0764; color: #c084fc; }
</style>
