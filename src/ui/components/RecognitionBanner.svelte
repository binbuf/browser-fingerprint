<script lang="ts">
  import { fingerprint } from '../stores';
  import { formatPercent } from '../../utils/format';
  import { slide } from 'svelte/transition';

  let result = $derived(fingerprint.recognitionResult);
  let showDiff = $state(false);

  let state = $derived.by(() => {
    if (!result) return 'loading';
    if (result.isFirstVisit) return 'first-visit';
    if (result.recognized) return 'recognized';
    return 'not-recognized';
  });

  function toggleDiff() {
    showDiff = !showDiff;
  }

  let isDismissed = $state(false);
</script>

{#if !isDismissed}
  <div class="banner-wrapper" transition:slide>
    <div class="banner {state}" aria-live="assertive">
      <div class="banner-content">
        <div class="icon" aria-hidden="true">
          {#if state === 'loading'}
            <div class="spinner"></div>
          {:else if state === 'first-visit'}
            <span class="icon-info">ℹ</span>
          {:else if state === 'recognized'}
            <span class="icon-warning">⚠</span>
          {:else}
            <span class="icon-success">✓</span>
          {/if}
        </div>
        
        <div class="text">
          {#if state === 'loading'}
            <p>Checking for previous visit...</p>
          {:else if state === 'first-visit'}
            <p class="primary">This is your first visit.</p>
            <p class="secondary">We've saved your fingerprint locally &mdash; come back later to see if we can recognize you without cookies.</p>
          {:else if state === 'recognized'}
            <p class="primary">We recognized you without cookies. Your fingerprint has been stable for {result?.daysSinceLastVisit} days.</p>
            <p class="secondary">{result?.stableAttributeCount} of {result?.totalAttributeCount} attributes matched ({formatPercent(result?.similarity ?? 0)} similarity).</p>
          {:else}
            <p class="primary">Your fingerprint has changed significantly since your last visit.</p>
            <p class="secondary">{result?.changedAttributes?.length ?? 0} attributes changed since your previous visit.</p>
          {/if}
        </div>

        <div class="actions">
          {#if state === 'recognized' || state === 'not-recognized'}
            <button class="btn-diff" onclick={toggleDiff} aria-expanded={showDiff} aria-controls="diff-view">
              {showDiff ? 'Hide changes' : 'Show changes'}
            </button>
          {:else if state === 'first-visit'}
            <button class="btn-close" onclick={() => isDismissed = true} aria-label="Dismiss">✕</button>
          {/if}
        </div>
      </div>

      {#if showDiff && result}
        <div id="diff-view" class="diff-view" transition:slide>
          <div class="diff-grid">
            <div class="diff-header">Attribute</div>
            <div class="diff-header">Status</div>
            <div class="diff-header">Values</div>

            {#each [...result.matchedAttributes, ...result.changedAttributes].sort((a,b) => a.label.localeCompare(b.label)) as attr (attr.key)}
              <div class="diff-row">
                <div class="attr-label">{attr.label}</div>
                <div class="attr-status">
                  {#if attr.matched}
                    <span class="matched">Matched</span>
                  {:else}
                    <span class="changed">Changed</span>
                  {/if}
                </div>
                <div class="attr-values">
                  {#if attr.matched}
                    <span class="value">{attr.currentValue}</span>
                  {:else}
                    <div class="value-comparison">
                      <span class="old-value" title="Previous value">{attr.previousValue}</span>
                      <span class="arrow">→</span>
                      <span class="new-value" title="Current value">{attr.currentValue}</span>
                    </div>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .banner-wrapper {
    margin-bottom: var(--space-5);
    width: 100%;
  }

  .banner {
    border-radius: var(--radius-md);
    border: 1px solid transparent;
    overflow: hidden;
  }

  .banner-content {
    display: flex;
    padding: var(--space-4);
    gap: var(--space-4);
    align-items: center;
  }

  .icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: bold;
  }

  .text {
    flex-grow: 1;
  }

  .text p {
    margin: 0;
  }

  .primary {
    font-weight: 600;
  }

  .secondary {
    font-size: 0.875rem;
    opacity: 0.9;
  }

  .actions {
    display: flex;
    align-items: center;
  }

  .btn-diff {
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    font-weight: 500;
    transition: background-color var(--transition-fast), opacity var(--transition-fast);
  }

  .btn-close {
    padding: var(--space-1) var(--space-2);
    font-size: 1.25rem;
    line-height: 1;
    opacity: 0.5;
    transition: opacity var(--transition-fast);
  }

  .btn-close:hover {
    opacity: 1;
  }

  /* Colors based on state */
  .first-visit {
    background-color: var(--color-info-bg);
    border-color: var(--color-info-border);
    color: var(--color-info-text);
  }

  .recognized {
    background-color: var(--color-danger-bg);
    border-color: var(--color-danger-border);
    color: var(--color-danger-text);
  }
  .recognized .btn-diff {
    background: var(--color-danger-text);
    color: white;
  }
  .recognized .btn-diff:hover {
    opacity: 0.9;
  }

  .not-recognized {
    background-color: var(--color-success-bg);
    border-color: var(--color-success-border);
    color: var(--color-success-text);
  }
  .not-recognized .btn-diff {
    background: var(--color-success-text);
    color: white;
  }
  .not-recognized .btn-diff:hover {
    opacity: 0.9;
  }

  .loading {
    background-color: var(--color-surface);
    border-color: var(--color-border);
    color: var(--text-secondary);
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .diff-view {
    border-top: 1px solid var(--color-border);
    padding: var(--space-4);
    background: rgba(0, 0, 0, 0.05);
  }

  [data-theme="dark"] .diff-view {
    background: rgba(255, 255, 255, 0.05);
  }

  .diff-grid {
    display: grid;
    grid-template-columns: 200px 100px 1fr;
    gap: var(--space-2);
    font-size: 0.875rem;
  }

  .diff-header {
    font-weight: 600;
    padding-bottom: var(--space-2);
    border-bottom: 1px solid rgba(0,0,0,0.1);
  }

  .diff-row {
    display: contents;
  }

  .attr-label {
    font-weight: 500;
    padding: var(--space-1) 0;
  }

  .attr-status {
    padding: var(--space-1) 0;
  }

  .matched {
    color: var(--color-success);
    font-weight: 600;
  }

  .changed {
    color: var(--color-warning);
    font-weight: 600;
  }

  .attr-values {
    padding: var(--space-1) 0;
    font-family: var(--font-mono);
    word-break: break-all;
  }

  .value-comparison {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }

  .old-value {
    color: var(--text-muted);
    text-decoration: line-through;
  }

  .arrow {
    color: var(--text-muted);
  }

  .new-value {
    color: var(--text-primary);
    font-weight: 600;
  }

  @media (max-width: 700px) {
    .diff-grid {
      grid-template-columns: 1fr;
      gap: var(--space-1);
    }
    .diff-header {
      display: none;
    }
    .diff-row {
      display: flex;
      flex-direction: column;
      padding: var(--space-2) 0;
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }
    .diff-row:last-child {
      border-bottom: none;
    }
    .attr-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      color: var(--text-muted);
      padding: 0;
    }
    .attr-status {
      padding: 0;
      font-size: 0.75rem;
    }
    .attr-values {
      padding: var(--space-1) 0;
    }
  }
</style>
