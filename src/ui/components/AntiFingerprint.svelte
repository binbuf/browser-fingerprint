<script lang="ts">
  import { slide } from "svelte/transition";

  interface DetectedCountermeasure {
    technique: string;
    detected: boolean;
    description: string;
    tool?: string;
  }

  let { data }: { data: {
    detected: boolean;
    countermeasures: DetectedCountermeasure[];
    overallEffectiveness: "none" | "partial" | "strong";
  } } = $props();

  const countermeasures = $derived(data.countermeasures || []);
  const overallEffectiveness = $derived(data.overallEffectiveness || "none");
  const detectedCount = $derived(countermeasures.filter((c: DetectedCountermeasure) => c.detected).length);

  const effectivenessLabels = {
    none: "None Detected",
    partial: "Partial Protection",
    strong: "Strong Protection"
  };

  const effectivenessColors = {
    none: "danger",
    partial: "warning",
    strong: "success"
  };

  let expandedIndex = $state<number | null>(null);

  function toggleExpand(index: number) {
    expandedIndex = expandedIndex === index ? null : index;
  }
</script>

<div class="anti-fingerprint-container">
  <div class="effectiveness-header">
    <div class="effectiveness-badge {effectivenessColors[overallEffectiveness as keyof typeof effectivenessColors]}">
      {effectivenessLabels[overallEffectiveness as keyof typeof effectivenessLabels]}
    </div>
    <p class="summary-text">
      Detected <strong>{detectedCount}</strong> active countermeasure{detectedCount === 1 ? '' : 's'} 
      out of {countermeasures.length} checks.
    </p>
  </div>

  <div class="countermeasure-list">
    {#each countermeasures as c, i (c.technique)}
      <div class="countermeasure-row {c.detected ? 'detected' : ''}">
        <button 
          class="row-main" 
          onclick={() => toggleExpand(i)} 
          aria-expanded={expandedIndex === i}
          aria-controls="countermeasure-desc-{i}"
        >
          <span class="status-icon" aria-hidden="true">{c.detected ? '✅' : '❌'}</span>
          <span class="technique-name">{c.technique}</span>
          <span class="status-label">{c.detected ? 'Detected' : 'Not detected'}</span>
          <span class="chevron" aria-hidden="true">{expandedIndex === i ? '▲' : '▼'}</span>
        </button>
        
        {#if expandedIndex === i}
          <div id="countermeasure-desc-{i}" class="explanation-box" transition:slide>
            <p>{c.description}</p>
            {#if c.tool}
              <p class="tool-note">Commonly associated with: <strong>{c.tool}</strong></p>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <div class="paradox-callout">
    <div class="callout-icon" aria-hidden="true">ℹ️</div>
    <div class="callout-content">
      <strong>The Anti-Fingerprinting Paradox:</strong>
      <p>
        Ironically, the specific pattern of your anti-fingerprinting defenses can itself become a fingerprint. 
        Only a small percentage of users have this exact combination of protections enabled, 
        making you highly unique among general web users.
      </p>
    </div>
  </div>
</div>

<style>
  .anti-fingerprint-container {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .effectiveness-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
  }

  .effectiveness-badge {
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    font-weight: 700;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .effectiveness-badge.success {
    background-color: var(--color-success-bg);
    color: var(--color-success);
    border: 1px solid var(--color-success);
  }

  .effectiveness-badge.warning {
    background-color: var(--color-warning-bg);
    color: var(--color-warning-text);
    border: 1px solid var(--color-warning-border);
  }

  .effectiveness-badge.danger {
    background-color: var(--color-danger-bg);
    color: var(--color-danger-text);
    border: 1px solid var(--color-danger-border);
  }

  .summary-text {
    margin: 0;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .countermeasure-list {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .countermeasure-row {
    border-bottom: 1px solid var(--color-border);
  }

  .countermeasure-row:last-child {
    border-bottom: none;
  }

  .row-main {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    cursor: pointer;
    background-color: var(--color-surface);
    transition: background-color 0.2s;
    width: 100%;
    border: none;
    text-align: left;
    font-family: inherit;
  }

  .row-main:hover {
    background-color: var(--color-background);
  }

  .status-icon {
    margin-right: 0.75rem;
    font-size: 1rem;
    width: 1.5rem;
    text-align: center;
  }

  .technique-name {
    flex: 1;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-primary);
  }

  .status-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-right: 0.75rem;
  }

  .detected .status-label {
    color: var(--color-success);
    font-weight: 600;
  }

  .chevron {
    font-size: 0.625rem;
    color: var(--text-muted);
  }

  .explanation-box {
    padding: 0.75rem 1rem 0.75rem 3.25rem;
    background-color: var(--color-background);
    font-size: 0.8125rem;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .explanation-box p {
    margin: 0 0 0.5rem 0;
  }

  .explanation-box p:last-child {
    margin-bottom: 0;
  }

  .tool-note {
    font-style: italic;
    color: var(--text-muted);
  }

  .paradox-callout {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    background-color: var(--color-info-bg);
    border-radius: 0.5rem;
    border-left: 4px solid var(--color-info-text);
  }

  .callout-icon {
    font-size: 1.25rem;
  }

  .callout-content {
    font-size: 0.8125rem;
    color: var(--color-info-text);
  }

  .callout-content strong {
    display: block;
    margin-bottom: 0.25rem;
  }

  .callout-content p {
    margin: 0;
    line-height: 1.4;
  }
</style>
