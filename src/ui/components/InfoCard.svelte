<script lang="ts">
  interface Props {
    title: string;
    description: string;
    diagram?: string;
    takeaway: string;
    link: string;
    linkText: string;
    icon?: string;
  }

  let { title, description, diagram, takeaway, link, linkText, icon = 'ℹ️' }: Props = $props();
</script>

<div class="info-card">
  <div class="info-card-header">
    <div class="info-icon">{icon}</div>
    <div class="info-badge">Informational</div>
  </div>
  
  <h3 class="info-title">{title}</h3>
  
  <div class="info-content">
    <p class="info-description">{description}</p>
    
    {#if diagram}
      <div class="info-diagram">
        <pre>{diagram}</pre>
      </div>
    {/if}
    
    <div class="info-takeaway">
      <span class="takeaway-label">Key Takeaway:</span> {takeaway}
    </div>
  </div>
  
  <div class="info-footer">
    <a href={link} target="_blank" rel="noopener noreferrer" class="info-link">
      {linkText}
      <span class="external-icon">↗</span>
    </a>
  </div>
</div>

<style>
  .info-card {
    background: var(--color-purple-bg);
    border: 1px solid var(--color-purple-border);
    border-radius: var(--radius-md);
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    height: 100%;
    transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  }

  .info-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--color-shadow-md);
  }

  .info-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-4);
  }

  .info-icon {
    font-size: 1.5rem;
  }

  .info-badge {
    background: var(--color-purple-border);
    color: var(--color-purple-text);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-lg);
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .info-title {
    color: var(--color-purple-text);
    margin-bottom: var(--space-3);
    font-size: 1.25rem;
  }

  .info-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .info-description {
    font-size: 0.9375rem;
    color: var(--text-secondary);
    margin-bottom: var(--space-4);
    line-height: 1.6;
  }

  .info-diagram {
    background: rgba(0, 0, 0, 0.05);
    padding: var(--space-3);
    border-radius: var(--radius-sm);
    margin-bottom: var(--space-4);
    overflow-x: auto;
  }

  :global([data-theme="dark"]) .info-diagram {
    background: rgba(255, 255, 255, 0.05);
  }

  .info-diagram pre {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.2;
  }

  .info-takeaway {
    font-size: 0.875rem;
    padding: var(--space-3);
    background: rgba(255, 255, 255, 0.5);
    border-left: 3px solid var(--color-purple-border);
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    margin-bottom: var(--space-4);
    font-style: italic;
  }

  :global([data-theme="dark"]) .info-takeaway {
    background: rgba(0, 0, 0, 0.2);
  }

  .takeaway-label {
    font-weight: 700;
    color: var(--color-purple-text);
    font-style: normal;
  }

  .info-footer {
    margin-top: auto;
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-purple-border);
  }

  .info-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    color: var(--color-purple-text);
    font-weight: 600;
    font-size: 0.875rem;
    min-height: 2.75rem;
    padding: var(--space-1) 0;
  }

  .info-link:hover {
    text-decoration: underline;
  }

  .external-icon {
    font-size: 0.75rem;
  }
</style>
