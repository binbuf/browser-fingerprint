<script lang="ts">
  import { slide } from "svelte/transition";
  import type { CollectorResult } from "../../collectors/types";
  import CategoryCard from "./CategoryCard.svelte";

  let {
    sectionName,
    collectorIds,
    results,
    maxBitsAcrossAll = 1,
    totalBitsAcrossAll = 1
  }: {
    sectionName: string;
    collectorIds: string[];
    results: Map<string, CollectorResult>;
    maxBitsAcrossAll?: number;
    totalBitsAcrossAll?: number;
  } = $props();

  let collapsed = $state(false);
  let sectionId = $derived(sectionName.toLowerCase().replace(/\s+/g, '-'));

  function toggleCollapse() {
    collapsed = !collapsed;
  }

  // Derived metrics
  let sectionResults = $derived(
    collectorIds.map(id => results.get(id)).filter((r): r is CollectorResult => !!r)
  );

  let completedCount = $derived(
    sectionResults.filter(r => r.status === "completed" || r.status === "unsupported" || r.status === "error").length
  );

  let totalSectionBits = $derived(
    sectionResults.reduce((acc, r) => {
      if (r.status === "completed") {
        return acc + r.signals.reduce((sAcc, s) => sAcc + (s.entropyBits ?? 0), 0);
      }
      return acc;
    }, 0)
  );

  let maxBitsInSection = $derived(
     sectionResults.reduce((acc, r) => {
      if (r.status === "completed") {
        const rBits = r.signals.reduce((sAcc, s) => sAcc + (s.entropyBits ?? 0), 0);
        return Math.max(acc, rBits);
      }
      return acc;
    }, 0)
  );
</script>

<section class="category-section" aria-labelledby={sectionId}>
  <div class="section-header">
    <div class="header-left">
      <h2 id={sectionId}>{sectionName}</h2>
      <div class="metrics">
        <span class="section-entropy">{totalSectionBits.toFixed(2)} bits</span>
        <span class="section-count">{completedCount} of {collectorIds.length} complete</span>
      </div>
    </div>
    <button 
      class="collapse-toggle" 
      onclick={toggleCollapse}
      aria-expanded={!collapsed}
      aria-label={collapsed ? "Expand section" : "Collapse section"}
      aria-controls="grid-{sectionId}"
    >
      <span class="chevron {collapsed ? 'collapsed' : ''}">▼</span>
    </button>
  </div>

  {#if !collapsed}
    <div id="grid-{sectionId}" class="card-grid" transition:slide>
      {#each collectorIds as id (id)}
        <CategoryCard 
          collectorId={id} 
          result={results.get(id)}
          maxBits={maxBitsAcrossAll}
          totalBits={totalBitsAcrossAll}
        />
      {/each}
    </div>
  {/if}
</section>

<style>
  .category-section {
    margin-bottom: 3rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid var(--color-border);
    padding-bottom: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .header-left {
    display: flex;
    align-items: baseline;
    gap: 1.5rem;
  }

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--text-primary);
  }

  .metrics {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .section-entropy {
    color: var(--color-primary);
    font-weight: 600;
  }

  .collapse-toggle {
    background: none;
    border: none;
    font-size: 1.25rem;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    transition: background-color 0.2s;
  }

  .collapse-toggle:hover {
    background-color: var(--color-background);
    color: var(--text-primary);
  }

  .chevron {
    transition: transform 0.3s ease;
  }

  .chevron.collapsed {
    transform: rotate(-90deg);
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
  }

  @media (max-width: 640px) {
    .header-left {
      flex-direction: column;
      gap: 0.25rem;
    }

    .card-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .chevron, .card-grid {
      transition: none;
    }
  }
</style>
