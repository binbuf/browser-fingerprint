<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    text,
    position = "top",
    children
  }: {
    text: string;
    position?: "top" | "bottom" | "left" | "right";
    children?: Snippet;
  } = $props();

  let visible = $state(false);
  let id = $derived(`tooltip-${Math.random().toString(36).slice(2, 9)}`);
  let timeout: ReturnType<typeof setTimeout>;

  function show() {
    timeout = setTimeout(() => {
      visible = true;
    }, 300);
  }

  function hide() {
    clearTimeout(timeout);
    visible = false;
  }
</script>

<div
  class="tooltip-wrapper"
  onmouseenter={show}
  onmouseleave={hide}
  onfocusin={show}
  onfocusout={hide}
  aria-describedby={visible ? id : undefined}
>
  {@render children()}
  {#if visible}
    <div 
      {id}
      class="tooltip tooltip-{position}" 
      role="tooltip"
    >
      {text}
    </div>
  {/if}
</div>

<style>
  .tooltip-wrapper {
    position: relative;
    display: inline-block;
  }

  .tooltip {
    position: absolute;
    background-color: var(--text-primary);
    color: var(--color-surface);
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    white-space: nowrap;
    z-index: 1000;
    pointer-events: none;
    opacity: 0;
    animation: fadeIn 0.15s ease-out forwards;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(0); }
    to { opacity: 1; transform: translateY(-4px); }
  }

  /* Position styles */
  .tooltip-top {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-4px);
    margin-bottom: 0.5rem;
  }

  .tooltip-bottom {
    top: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(4px);
    margin-top: 0.5rem;
  }

  .tooltip-left {
    right: 100%;
    top: 50%;
    transform: translateY(-50%) translateX(-4px);
    margin-right: 0.5rem;
  }

  .tooltip-right {
    left: 100%;
    top: 50%;
    transform: translateY(-50%) translateX(4px);
    margin-left: 0.5rem;
  }
</style>
