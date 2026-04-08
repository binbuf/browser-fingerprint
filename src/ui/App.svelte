<script lang="ts">
  import { onMount } from 'svelte';
  import { fingerprint } from './stores';
  import { registry } from '../collectors/registry';
  import { Orchestrator } from '../engine/orchestrator';
  import { ScoreEngine } from '../engine/scorer';
  import { referenceDataset } from '../data/reference-dataset';
  import Header from './components/Header.svelte';
  import Footer from './components/Footer.svelte';
  import RecognitionBanner from './components/RecognitionBanner.svelte';
  import SummaryPanel from './components/SummaryPanel.svelte';
  import CategorySection from './components/CategorySection.svelte';

  // Lazy-load sections for Phase 3 integration
  const InfoSection = import('./components/InfoSection.svelte');
  const ExportSection = import('./components/ExportSection.svelte');

  // Define category groupings per ux-flows.md
  const categorySections = [
    { id: 'gpu', name: 'GPU & Rendering', collectors: ['canvas', 'webgl', 'webgpu'] },
    { id: 'audio', name: 'Audio', collectors: ['audio'] },
    { id: 'system', name: 'System & Hardware', collectors: ['navigator', 'screen', 'gamepad', 'keyboard', 'performance', 'math'] },
    { id: 'locale', name: 'Locale & Environment', collectors: ['timezone', 'speech', 'css-media'] },
    { id: 'software', name: 'Installed Software', collectors: ['fonts', 'extensions', 'protocols'] },
    { id: 'state', name: 'Browser State', collectors: ['permissions', 'storage', 'network', 'favicon-cache'] },
    { id: 'engine', name: 'Engine Internals', collectors: ['recognition'] },
    { id: 'privacy', name: 'Privacy & Detection', collectors: ['anti-fingerprint', 'webrtc', 'client-hints'] }
  ];

  // Derived metrics for entropy bars
  let resultsList = $derived(Array.from(fingerprint.results.values()));
  let completedResults = $derived(resultsList.filter(r => r.status === 'completed'));
  
  let totalBitsAcrossAll = $derived(
    completedResults.reduce((acc, r) => {
      if (r.status === 'completed') {
        return acc + r.signals.reduce((sAcc, s) => sAcc + (s.entropyBits ?? 0), 0);
      }
      return acc;
    }, 0)
  );

  let maxBitsAcrossAll = $derived(
    completedResults.reduce((acc, r) => {
      if (r.status === 'completed') {
        const bits = r.signals.reduce((sAcc, s) => sAcc + (s.entropyBits ?? 0), 0);
        return Math.max(acc, bits);
      }
      return acc;
    }, 0)
  );

  let orchestrator: Orchestrator;
  let scorer: ScoreEngine;
  let error = $state<Error | null>(null);

  let showBackToTop = $state(false);

  function handleScroll() {
    showBackToTop = window.scrollY > 400;
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onMount(() => {
    window.addEventListener('scroll', handleScroll);
    try {
      orchestrator = new Orchestrator({ excludeNoisy: false });
      scorer = new ScoreEngine(referenceDataset);
      
      // Initialize store with total count from registry
      fingerprint.setTotalCount(registry.count);
      
      // Wire up events
      orchestrator.on('collector:complete', ({ collectorId, result }) => {
        // Compute entropy bits before adding to store
        if (result.status === 'completed') {
          // Enrich signals with entropy bits
          result.signals.forEach(sig => {
            const sigScore = scorer.scoreSignal(sig);
            sig.entropyBits = sigScore.entropyBits;
            if (sigScore.hasReferenceData) {
              sig.commonality = sigScore.frequency;
            }
          });
        }
        
        fingerprint.addResult(collectorId, result);
        
        // Update uniqueness report incrementally
        const enrichedResults = new Map();
        for (const [id, r] of fingerprint.results.entries()) {
          const col = registry.get(id);
          const meta = col?.getMetadata();
          enrichedResults.set(id, {
            collectorId: id,
            collectorName: meta?.name || id,
            category: meta?.category || 'other',
            signals: r.status === 'completed' ? r.signals : [],
            status: r.status
          });
        }

        const report = scorer.computeReport(
          enrichedResults as any,
          registry.count
        );
        fingerprint.updateUniqueness(report);
      });

      orchestrator.on('scan:complete', ({ snapshot }) => {
        fingerprint.setCompositeHash(snapshot.compositeHash);
        fingerprint.setSnapshot(snapshot);
        fingerprint.completeScan();
      });

      // Start the scan
      fingerprint.startScan();
      orchestrator.run().catch(err => {
        console.error('Scan failed:', err);
        error = err instanceof Error ? err : new Error(String(err));
      });
    } catch (err) {
      console.error('Orchestrator initialization failed:', err);
      error = err instanceof Error ? err : new Error(String(err));
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (orchestrator) {
        orchestrator.abort();
      }
    };
  });
</script>

<Header />

<a href="#main-content" class="skip-link sr-only">Skip to content</a>

<main id="main-content">
  <div class="content-wrapper">
    {#if error}
      <div class="error-boundary">
        <h2>Something went wrong</h2>
        <p>{error.message}</p>
        <button onclick={() => window.location.reload()}>Reload Application</button>
      </div>
    {:else}
      <RecognitionBanner />
      
      <SummaryPanel />

      {#each categorySections as section (section.id)}
        <CategorySection 
          sectionName={section.name} 
          collectorIds={section.collectors}
          results={fingerprint.results}
          maxBitsAcrossAll={maxBitsAcrossAll}
          totalBitsAcrossAll={totalBitsAcrossAll}
        />
      {/each}

      {#await InfoSection then { default: Info }}
        <Info />
      {/await}
      
      {#await ExportSection then { default: Export }}
        <Export />
      {/await}
    {/if}
  </div>

  <button 
    class="back-to-top" 
    class:visible={showBackToTop}
    onclick={scrollToTop}
    aria-label="Back to top"
    title="Back to top"
  >
    ↑
  </button>
</main>

<Footer />

<style>
  main {
    flex: 1;
    width: 100%;
    padding-top: var(--space-6);
    position: relative;
  }

  .content-wrapper {
    max-width: var(--content-max-width);
    margin: 0 auto;
    padding: 0 var(--space-5);
    display: flex;
    flex-direction: column;
    overflow-x: hidden; /* Prevent horizontal scroll on main content */
  }

  .error-boundary {
    padding: var(--space-10);
    text-align: center;
    background: var(--color-danger-bg);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-danger-border);
    margin: var(--space-10) 0;
  }

  .error-boundary h2 {
    color: var(--color-danger-text);
    margin-bottom: var(--space-4);
  }

  .error-boundary p {
    margin-bottom: var(--space-6);
  }

  .error-boundary button {
    background: var(--color-danger-text);
    color: white;
    border: none;
    padding: var(--space-3) var(--space-6);
    border-radius: var(--radius-sm);
    cursor: pointer;
  }

  .back-to-top {
    position: fixed;
    bottom: var(--space-6);
    right: var(--space-6);
    width: 44px;
    height: 44px;
    background-color: var(--color-primary);
    color: white;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    cursor: pointer;
    box-shadow: var(--color-shadow-md);
    transition: opacity var(--transition-normal), transform var(--transition-normal);
    opacity: 0;
    pointer-events: none;
    transform: translateY(20px);
    z-index: 500;
  }

  .back-to-top.visible {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }

  .back-to-top:hover {
    background-color: var(--color-primary-hover);
    transform: scale(1.1);
  }

  @media (max-width: 600px) {
    .back-to-top {
      bottom: var(--space-4);
      right: var(--space-4);
    }
  }
</style>
