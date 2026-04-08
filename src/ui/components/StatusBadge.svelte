<script lang="ts">
  import type { CollectorStatus } from "../../collectors/types";

  let { status }: { status: CollectorStatus } = $props();

  const statusConfig = {
    pending: {
      label: "Pending",
      class: "status-pending",
      icon: "○"
    },
    running: {
      label: "Scanning",
      class: "status-scanning",
      icon: "⟳"
    },
    completed: {
      label: "Complete",
      class: "status-complete",
      icon: "✓"
    },
    unsupported: {
      label: "Unsupported",
      class: "status-unsupported",
      icon: "–"
    },
    error: {
      label: "Error",
      class: "status-error",
      icon: "⚠"
    },
    timeout: {
      label: "Timeout",
      class: "status-error",
      icon: "⌛"
    }
  };

  let config = $derived(statusConfig[status]);
</script>

<span
  class="status-badge {config.class}"
  aria-label="Status: {config.label}"
  title={config.label}
>
  <span class="icon" aria-hidden="true">{config.icon}</span>
  <span class="label">{config.label}</span>
</span>

<style>
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    white-space: nowrap;
  }

  .icon {
    font-size: 1rem;
    line-height: 1;
  }

  .status-pending {
    background-color: var(--color-background);
    color: var(--text-muted);
    border: 1px solid var(--color-border);
  }

  .status-scanning {
    background-color: var(--color-info-bg);
    color: var(--color-info-text);
    border: 1px solid var(--color-info-border);
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .status-scanning .icon {
    animation: spin 2s linear infinite;
  }

  .status-complete {
    background-color: var(--color-success-bg);
    color: var(--color-success-text);
    border: 1px solid var(--color-success-border);
  }

  .status-unsupported {
    background-color: var(--color-background);
    color: var(--text-muted);
    border: 1px solid var(--color-border);
  }

  .status-error {
    background-color: var(--color-danger-bg);
    color: var(--color-danger-text);
    border: 1px solid var(--color-danger-border);
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .status-scanning,
    .status-scanning .icon {
      animation: none;
    }
  }
</style>
