<script lang="ts">
  import { formatBits } from '../../utils/format';

  interface Props {
    score: number; // 0-100 mapped value
    bits: number;  // raw entropy bits
  }

  let { score = 0, bits = 0 }: Props = $props();

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate stroke-dashoffset: 
  // score 100 -> offset 0 (full circle)
  // score 0 -> offset circumference (empty)
  let offset = $derived(circumference - (score / 100) * circumference);
  
  // Color transitions: green (0-30) → yellow (30-60) → red (60-100)
  let color = $derived.by(() => {
    if (score < 30) return 'var(--color-success)';
    if (score < 60) return 'var(--color-warning)';
    return 'var(--color-danger)';
  });
</script>

<div class="meter-container" role="meter" 
     aria-valuenow={score} 
     aria-valuemin="0" 
     aria-valuemax="100" 
     aria-label="Uniqueness score">
  <svg viewBox="0 0 160 160" class="gauge">
    <!-- Background circle -->
    <circle 
      class="bg" 
      cx="80" cy="80" r={radius} 
    />
    <!-- Fill arc -->
    <circle 
      class="fill" 
      cx="80" cy="80" r={radius} 
      style:stroke-dasharray={circumference}
      style:stroke-dashoffset={offset}
      style:stroke={color}
    />
  </svg>
  <div class="content">
    <span class="bits">{formatBits(bits)}</span>
    <span class="label">bits</span>
  </div>
</div>

<style>
  .meter-container {
    position: relative;
    width: 160px;
    height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .gauge {
    transform: rotate(-90deg);
    width: 100%;
    height: 100%;
  }

  circle {
    fill: none;
    stroke-width: 12;
    stroke-linecap: round;
  }

  .bg {
    stroke: var(--color-border);
    opacity: 0.3;
  }

  .fill {
    transition: stroke-dashoffset 800ms ease-in-out, stroke 800ms ease-in-out;
  }

  .content {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .bits {
    font-family: var(--font-mono);
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1;
    color: var(--text-primary);
  }

  .label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  @media (max-width: 700px) {
    .meter-container {
      width: 120px;
      height: 120px;
    }
    .bits {
      font-size: 1.75rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .fill {
      transition: none;
    }
  }
</style>
