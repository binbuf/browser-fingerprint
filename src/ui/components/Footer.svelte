<script lang="ts">
  const currentYear = new Date().getFullYear();
</script>

<footer class="app-footer">
  <div class="footer-container">
    <div class="footer-info">
      <p class="project-purpose">
        This tool explores browser fingerprinting techniques to demonstrate how 
        much unique information can be collected from a browser without cookies or tracking IDs.
      </p>
      
      <div class="privacy-statement">
        <span class="privacy-icon">🔒</span>
        <p>No data is sent to any server. Everything you see is computed locally in your browser.</p>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="copyright">
        &copy; {currentYear} &bull; Browser Fingerprint Visualizer
      </div>
      
      <div class="footer-links">
        <a 
          href="https://github.com/binbuf/browser-fingerprint" 
          target="_blank" 
          rel="noopener noreferrer"
          class="github-link"
        >
          <span class="icon">📦</span> GitHub
        </a>
      </div>
    </div>
  </div>
</footer>

<style>
  .app-footer {
    padding: var(--space-10) 0 var(--space-8);
    background-color: var(--color-background);
    border-top: 1px solid var(--color-border);
    color: var(--text-secondary);
    font-size: var(--text-sm);
    margin-top: var(--space-12);
  }

  .footer-container {
    max-width: var(--content-max-width);
    margin: 0 auto;
    padding: 0 var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  .footer-info {
    max-width: 600px;
  }

  .project-purpose {
    line-height: var(--leading-relaxed);
    margin-bottom: var(--space-4);
  }

  .privacy-statement {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    background-color: var(--color-surface);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
  }

  .privacy-icon {
    font-size: 1.2rem;
  }

  .privacy-statement p {
    margin: 0;
    color: var(--text-primary);
    font-weight: 500;
  }

  .footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: var(--space-6);
    border-top: 1px solid var(--color-border);
    gap: var(--space-4);
  }

  .footer-links a {
    color: var(--text-secondary);
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    transition: color var(--transition-fast);
  }

  .footer-links a:hover {
    color: var(--color-primary);
  }

  @media (max-width: 600px) {
    .footer-bottom {
      flex-direction: column;
      text-align: center;
    }
  }
</style>
