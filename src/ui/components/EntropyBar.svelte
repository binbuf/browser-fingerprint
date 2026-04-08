<script lang="ts">
  let {
    bits = 0,
    maxBits = 1,
    totalBits = 1
  }: {
    bits: number;
    maxBits: number;
    totalBits: number;
  } = $props();

  let percentageOfMax = $derived(maxBits > 0 ? (bits / maxBits) * 100 : 0);
  let percentageOfTotal = $derived(totalBits > 0 ? (bits / totalBits) * 100 : 0);

  let barColorClass = $derived.by(() => {
    if (bits >= 6) return "bg-danger";
    if (bits >= 3) return "bg-warning";
    return "bg-success";
  });
</script>

<div class="entropy-bar-container">
  <div
    class="track"
    role="meter"
    aria-valuenow={bits}
    aria-valuemin="0"
    aria-valuemax={maxBits}
    aria-label="{bits.toFixed(2)} bits of entropy"
  >
    <div
      class="fill {barColorClass}"
      style="width: {percentageOfMax}%"
    ></div>
  </div>
  <div class="label-row">
    <span class="bits">{bits.toFixed(2)} <span class="label-text">bits</span><span class="label-short">b</span></span>
    <span class="percentage">{percentageOfTotal.toFixed(1)}% <span class="label-text">of total</span></span>
  </div>
</div>

<style>
  .entropy-bar-container {
    width: 100%;
    margin: 1rem 0;
  }

  .track {
    height: 0.5rem;
    width: 100%;
    background-color: var(--color-border);
    border-radius: 9999px;
    overflow: hidden;
    position: relative;
  }

  .fill {
    height: 100%;
    border-radius: 9999px;
    transition: width 400ms ease-out;
  }

  .bg-success {
    background-color: var(--color-success);
  }

  .bg-warning {
    background-color: var(--color-warning);
  }

  .bg-danger {
    background-color: var(--color-danger);
  }

  .label-row {
    display: flex;
    justify-content: space-between;
    margin-top: 0.375rem;
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .bits {
    font-weight: 600;
  }

  .label-short {
    display: none;
  }

  @media (max-width: 400px) {
    .label-text {
      display: none;
    }
    .label-short {
      display: inline;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .fill {
      transition: none;
    }
  }
</style>
