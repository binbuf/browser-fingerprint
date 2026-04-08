<script lang="ts">
  import { fingerprint } from '../stores';
  import type { AntiFingerprintReport } from '../stores/types';

  let showPreview = $state(false);
  let copyStatus = $state('Copy Hash');
  let downloadStatus = $state('Download Report');

  const isComplete = $derived(fingerprint.scanState === 'complete');
  
  // Lazy-load export logic on demand
  async function handleDownload() {
    if (!isComplete || !fingerprint.snapshot || !fingerprint.uniquenessReport) return;
    
    downloadStatus = 'Preparing...';
    
    try {
      const { generateExportReport, downloadReport } = await import('../../utils/export');
      
      const antiFingerprintResult = fingerprint.results.get('anti-fingerprint');
      const antiFingerprintReport: AntiFingerprintReport = 
        (antiFingerprintResult && antiFingerprintResult.status === 'completed' 
          ? antiFingerprintResult.data as unknown as AntiFingerprintReport 
          : {
              detected: false,
              countermeasures: [],
              overallEffectiveness: 'none'
            });

      const report = generateExportReport(
        fingerprint.snapshot,
        fingerprint.uniquenessReport,
        fingerprint.recognitionResult,
        antiFingerprintReport
      );
      
      downloadReport(report);
      downloadStatus = 'Downloaded!';
      setTimeout(() => { downloadStatus = 'Download Report'; }, 2000);
    } catch (err) {
      console.error('Export failed:', err);
      downloadStatus = 'Failed';
      setTimeout(() => { downloadStatus = 'Download Report'; }, 2000);
    }
  }

  async function handleCopyHash() {
    if (!fingerprint.compositeHash) return;
    
    try {
      await navigator.clipboard.writeText(fingerprint.compositeHash);
      copyStatus = 'Copied!';
      setTimeout(() => { copyStatus = 'Copy Hash'; }, 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }

  function togglePreview() {
    showPreview = !showPreview;
  }

  // Generate a partial JSON preview
  let jsonPreview = $derived.by(() => {
    if (!fingerprint.snapshot) return '';
    
    // Create a simplified preview object
    const preview = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      compositeHash: fingerprint.compositeHash,
      uniqueness: fingerprint.uniquenessReport?.uniquenessLabel,
      resultCount: fingerprint.results.size,
      // Just show a few results in the preview
      results: Object.fromEntries(
        Array.from(fingerprint.results.entries()).slice(0, 3)
      )
    };
    
    return JSON.stringify(preview, null, 2) + '\n  ... (full report contains all collectors)';
  });
</script>

<section class="export-section section-wrapper">
  <div class="section-header">
    <h2 class="section-title">Export Your Results</h2>
  </div>

  <div class="export-card">
    <div class="export-info">
      <p>Download your complete browser fingerprint report as a versioned JSON file. This includes all raw signals, entropy scores, and cross-session recognition data.</p>
    </div>

    <div class="export-actions">
      <button 
        class="btn btn-primary" 
        disabled={!isComplete} 
        onclick={handleDownload}
        title={isComplete ? 'Download full JSON report' : 'Wait for scan to complete'}
      >
        <span class="btn-icon">📥</span>
        {downloadStatus}
      </button>

      <button 
        class="btn btn-secondary" 
        disabled={!fingerprint.compositeHash}
        onclick={handleCopyHash}
      >
        <span class="btn-icon">📋</span>
        {copyStatus}
      </button>
    </div>

    <div class="preview-container">
      <button class="preview-toggle" onclick={togglePreview}>
        {showPreview ? 'Hide Preview' : 'Show JSON Preview'}
        <span class="toggle-icon">{showPreview ? '▲' : '▼'}</span>
      </button>

      {#if showPreview}
        <div class="preview-box">
          <pre>{jsonPreview}</pre>
        </div>
      {/if}
    </div>
  </div>
</section>

<style>
  .export-section {
    margin-top: var(--space-8);
    margin-bottom: var(--space-10);
  }

  .export-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    box-shadow: var(--color-shadow);
  }

  .export-info {
    margin-bottom: var(--space-6);
    color: var(--text-secondary);
    max-width: 700px;
    line-height: 1.6;
  }

  .export-actions {
    display: flex;
    gap: var(--space-4);
    flex-wrap: wrap;
    margin-bottom: var(--space-6);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-6);
    border-radius: var(--radius-md);
    font-weight: 600;
    transition: all var(--transition-fast);
    font-size: 0.9375rem;
  }

  .btn-primary {
    background: var(--color-primary);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--color-primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(26, 86, 219, 0.25);
  }

  .btn-secondary {
    background: var(--color-background);
    color: var(--text-primary);
    border: 1px solid var(--color-border);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--color-border);
    transform: translateY(-1px);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    filter: grayscale(1);
  }

  .btn-icon {
    font-size: 1.1rem;
  }

  .preview-container {
    border-top: 1px solid var(--color-border);
    padding-top: var(--space-4);
  }

  .preview-toggle {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--text-muted);
    font-size: 0.875rem;
    font-weight: 500;
    transition: color var(--transition-fast);
    padding: var(--space-3) 0;
    min-height: 2.75rem;
    cursor: pointer;
    background: none;
    border: none;
  }

  .preview-toggle:hover {
    color: var(--text-secondary);
  }

  .toggle-icon {
    font-size: 0.7rem;
  }

  .preview-box {
    margin-top: var(--space-4);
    background: var(--color-background);
    padding: var(--space-4);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
    overflow-x: auto;
  }

  .preview-box pre {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
  }
</style>
