<script lang="ts">
  import { onMount } from "svelte";
  import { preferences } from "../stores";
  import ProgressIndicator from "./ProgressIndicator.svelte";

  let { isSticky = true } = $props();

  let isScrolled = $state(false);

  // Use a sentinel element to detect scroll
  function handleIntersection(entries: IntersectionObserverEntry[]) {
    isScrolled = !entries[0].isIntersecting;
  }

  onMount(() => {
    const sentinel = document.getElementById('header-sentinel');
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: [1]
    });

    observer.observe(sentinel);

    return () => observer.disconnect();
  });
</script>

<div id="header-sentinel" class="sentinel"></div>

<header 
  class="app-header" 
  class:sticky={isSticky} 
  class:scrolled={isScrolled}
>
  <div class="header-container">
    <div class="logo">
      <h1 class="logo-title">
        <span class="logo-bold">Browser</span>Fingerprint
      </h1>
    </div>

    <div class="header-center">
      <ProgressIndicator />
    </div>

    <div class="header-actions">
      <button 
        class="theme-toggle" 
        onclick={() => preferences.toggleTheme()}
        aria-label="Toggle theme"
        title={`Theme: ${preferences.theme}`}
      >
        {#if preferences.theme === 'dark'}
          <span class="icon">🌙</span>
        {:else if preferences.theme === 'light'}
          <span class="icon">☀️</span>
        {:else}
          <span class="icon">💻</span>
        {/if}
      </button>
    </div>
  </div>
</header>

<style>
  .app-header {
    height: 56px;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    transition: box-shadow var(--transition-normal), border-color var(--transition-normal);
    z-index: 1000;
  }

  .app-header.sticky {
    position: sticky;
    top: 0;
  }

  .app-header.scrolled {
    box-shadow: var(--color-shadow);
    border-color: transparent;
  }

  .header-container {
    max-width: var(--content-max-width);
    margin: 0 auto;
    padding: 0 var(--space-5);
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
  }

  .logo {
    display: flex;
    align-items: center;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .logo-title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--text-primary);
    line-height: 1;
  }

  .logo-bold {
    font-weight: 800;
    color: var(--color-primary);
    margin-right: 2px;
  }

  .header-center {
    flex: 1;
    display: flex;
    justify-content: center;
    min-width: 0;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-shrink: 0;
  }

  .theme-toggle {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.25rem;
    padding: var(--space-2);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    transition: background-color var(--transition-fast), color var(--transition-fast);
    min-width: 44px;
    min-height: 44px;
  }

  .theme-toggle:hover {
    background-color: var(--color-background);
    color: var(--text-primary);
  }

  .sentinel {
    height: 1px;
    width: 1px;
    position: absolute;
    top: 0;
    pointer-events: none;
  }

  @media (max-width: 600px) {
    .logo {
      font-size: 0; /* Hide text, keep "Browser" icon-like */
    }
    .logo-bold {
      font-size: 1.1rem;
      margin-right: 0;
    }
  }
</style>
