<script lang="ts">
  import { fingerprint } from '../stores';
  import { formatUniqueness, formatUniquenessScientific, formatUniquenessFullDecimal, formatBits } from '../../utils/format';
  import UniquenessMeter from './UniquenessMeter.svelte';

  let report = $derived(fingerprint.uniquenessReport);

  let score = $derived.by(() => {
    if (!report) return 0;
    // Scale: 0-100, mapped from entropy bits (0 bits = 0, 25+ bits = 100)
    return Math.min(100, (report.totalEntropyBits / 25) * 100);
  });

  let verdict = $derived.by(() => {
    if (!report) return "Calculating...";
    const bits = report.totalEntropyBits;
    if (bits < 10) return "Your browser has a relatively common fingerprint.";
    if (bits < 17) return "Your browser is somewhat unique.";
    if (bits < 25) return "Your browser is highly unique.";
    return "Your browser is extremely unique — practically one of a kind.";
  });

  // Use scientific notation when the exponent would be >= 4 (number >= 10,000)
  let scientific = $derived.by(() => {
    if (!report) return null;
    const s = formatUniquenessScientific(report.totalEntropyBits);
    return s.exponent >= 4 ? s : null;
  });

  let showFullNumber = $state(false);

  function openModal() { showFullNumber = true; }
  function closeModal() { showFullNumber = false; }
  function handleOverlayKey(e: KeyboardEvent) { if (e.key === 'Escape') closeModal(); }
</script>

<div class="summary-panel" class:loading={!report} aria-live="polite">
  <div class="meter-section">
    <UniquenessMeter {score} bits={report?.totalEntropyBits ?? 0} />
  </div>

  <div class="stats-section">
    <div class="uniqueness-stat">
      Your browser is unique among approximately
      {#if scientific}
        <span class="value scientific">
          1 in {scientific.mantissa}&thinsp;&times;&thinsp;10<sup>{scientific.exponent}</sup>
          <button class="expand-btn" onclick={openModal} title="Show full number" aria-label="Show full number">
            <span class="expand-icon">···</span>
          </button>
        </span>
      {:else}
        <span class="value">{report ? formatUniqueness(report.estimatedUniqueness) : "Calculating..."}</span>
      {/if}
    </div>
    <div class="entropy-stat">
      <span class="mono">{report ? formatBits(report.totalEntropyBits) : "--.-"}</span> bits of identifying information
    </div>
    <div class="completion-stat">
      <div class="progress-ring-mini" style:--progress={fingerprint.percentage}></div>
      <span>{fingerprint.completedCount}/{fingerprint.totalCount} modules complete</span>
    </div>
  </div>

  <div class="verdict-section">
    <p class="verdict-text">{verdict}</p>
  </div>
</div>

{#if showFullNumber && report}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="modal-overlay" onclick={closeModal} onkeydown={handleOverlayKey} role="dialog" aria-modal="true" aria-label="Full uniqueness value">
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="modal-box" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <span class="modal-title">Full Uniqueness Value</span>
        <button class="close-btn" onclick={closeModal} aria-label="Close">&#10005;</button>
      </div>
      <div class="modal-body">
        <p class="modal-desc">Your browser is unique among approximately 1 in:</p>
        <p class="full-number">{formatUniquenessFullDecimal(report.totalEntropyBits)}</p>
        <p class="modal-note">({formatBits(report.totalEntropyBits)} bits of entropy &approx; 10<sup>{formatUniquenessScientific(report.totalEntropyBits).exponent}</sup>)</p>
      </div>
    </div>
  </div>
{/if}

<style>
  .summary-panel {
    display: grid;
    grid-template-columns: auto 1fr 1fr;
    gap: var(--space-6);
    align-items: center;
    padding: var(--space-6);
    background: var(--color-surface);
    border-radius: var(--radius-md);
    box-shadow: var(--color-shadow-md);
    margin-bottom: var(--space-8);
  }

  .meter-section {
    display: flex;
    justify-content: center;
  }

  .stats-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .uniqueness-stat {
    font-size: 1.125rem;
    color: var(--text-primary);
  }

  .uniqueness-stat .value {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-primary);
    overflow-wrap: break-word;
  }

  .uniqueness-stat .value.scientific {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.25em;
  }

  .expand-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--color-surface-raised, var(--color-border));
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm, 4px);
    padding: 0 0.4em;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-secondary);
    line-height: 1.6;
    transition: background 150ms, color 150ms;
    flex-shrink: 0;
  }

  .expand-btn:hover {
    background: var(--color-primary);
    color: var(--color-on-primary, #fff);
    border-color: var(--color-primary);
  }

  .entropy-stat {
    font-size: 1rem;
    color: var(--text-secondary);
  }

  .entropy-stat .mono {
    font-family: var(--font-mono);
    font-weight: 600;
    color: var(--text-primary);
  }

  .completion-stat {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: 0.875rem;
    color: var(--text-muted);
  }

  .progress-ring-mini {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: conic-gradient(var(--color-primary) calc(var(--progress) * 1%), var(--color-border) 0);
  }

  .verdict-section {
    border-left: 1px solid var(--color-border);
    padding-left: var(--space-6);
    display: flex;
    align-items: center;
  }

  .verdict-text {
    font-size: 1.25rem;
    font-weight: 500;
    line-height: 1.4;
    color: var(--text-primary);
    margin: 0;
  }

  .loading .mono {
    color: var(--text-muted);
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--space-4);
  }

  .modal-box {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--color-shadow-md);
    max-width: 680px;
    width: 100%;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4) var(--space-5);
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
  }

  .modal-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    color: var(--text-secondary);
    padding: 0.25em 0.4em;
    border-radius: var(--radius-sm, 4px);
    line-height: 1;
    transition: color 150ms, background 150ms;
  }

  .close-btn:hover {
    color: var(--text-primary);
    background: var(--color-border);
  }

  .modal-body {
    padding: var(--space-5);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .modal-desc {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  .full-number {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 0.875rem;
    color: var(--text-primary);
    word-break: break-all;
    line-height: 1.7;
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface-raised, var(--color-background));
    border-radius: var(--radius-sm, 4px);
    border: 1px solid var(--color-border);
  }

  .modal-note {
    margin: 0;
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  @media (max-width: 1100px) {
    .summary-panel {
      grid-template-columns: 1fr 1fr;
    }
    .verdict-section {
      grid-column: span 2;
      border-left: none;
      border-top: 1px solid var(--color-border);
      padding-left: 0;
      padding-top: var(--space-6);
    }
  }

  @media (max-width: 700px) {
    .summary-panel {
      grid-template-columns: 1fr;
      text-align: center;
      gap: var(--space-4);
    }
    .meter-section, .stats-section, .verdict-section {
      grid-column: span 1;
    }
    .meter-section {
      margin: 0 auto;
    }
    .completion-stat {
      justify-content: center;
    }
    .verdict-section {
      border-top: 1px solid var(--color-border);
      padding-top: var(--space-6);
    }
    .uniqueness-stat .value.scientific {
      justify-content: center;
    }
  }
</style>
