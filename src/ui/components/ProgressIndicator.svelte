<script lang="ts">
  import { fingerprint } from "../stores";
  
  let showPulse = $derived(fingerprint.scanState === 'scanning');
  let isComplete = $derived(fingerprint.scanState === 'complete');
</script>

<div 
  class="progress-container" 
  class:pulse={showPulse} 
  class:complete={isComplete}
  aria-live="polite"
>
  <div class="status-text">
    {#if isComplete}
      <span class="status-label"><span class="icon-success">✓</span> Complete &mdash; </span>{fingerprint.completedCount}/{fingerprint.totalCount}
    {:else if fingerprint.scanState === 'scanning'}
      <span class="status-label">Scanning&hellip; </span>{fingerprint.completedCount}/{fingerprint.totalCount}
    {:else}
      <span class="status-label">Ready to scan</span>
    {/if}
  </div>

  <div class="progress-bar-wrapper">
    <div 
      class="progress-bar-fill" 
      role="progressbar"
      aria-valuenow={fingerprint.percentage}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label="Scanning progress"
      style="width: {fingerprint.percentage}%"
    ></div>
  </div>
</div>

<style>
  .progress-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
    width: 100%;
    max-width: 400px;
  }

  .status-text {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: var(--space-2);
    white-space: nowrap;
  }

  .icon-success {
    color: var(--color-success);
    font-weight: bold;
  }

  .progress-bar-wrapper {
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 3px;
    background: transparent;
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    background: var(--color-primary);
    transition: width var(--transition-normal) ease-out;
  }

  .pulse .status-text {
    animation: pulse 2s infinite ease-in-out;
  }

  .complete .progress-bar-fill {
    background: var(--color-success);
    animation: fade-out 1s forwards 1s;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  @keyframes fade-out {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @media (max-width: 600px) {
    .progress-container {
      max-width: 100px;
    }
    .status-label {
      display: none;
    }
    .status-text {
      font-size: 0.75rem;
    }
  }
</style>
