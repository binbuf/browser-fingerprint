<script lang="ts">
  import InfoCard from './InfoCard.svelte';

  const infoCards = [
    {
      title: 'TLS Fingerprinting (JA3/JA4+)',
      description: 'Your browser identifies itself during the TLS handshake before a single line of JavaScript even runs. By analyzing the order of cipher suites, extensions, and elliptic curves, servers can identify your browser version and OS with high accuracy.',
      diagram: `ClientHello
  │  Extensions: [0, 23, 65281, ...]
  │  Ciphers: [4865, 4866, 4867, ...]
  └─> JA4: t13d1516h2_8daaf615...`,
      takeaway: 'This technique identifies your browser at the network level, making it difficult to hide with simple UA spoofing.',
      link: 'https://browserleaks.com/ssl',
      linkText: 'Test your TLS fingerprint at BrowserLeaks',
      icon: '🔐'
    },
    {
      title: 'HTTP/2 & HTTP/3 Fingerprinting',
      description: 'The way your browser manages network streams—specifically SETTINGS frames, window updates, and pseudo-header ordering—is unique to its underlying engine. Even if you change your User-Agent, these low-level patterns reveal your true browser.',
      diagram: `SETTINGS Frame
  │  MAX_CONCURRENT_STREAMS: 100
  │  INITIAL_WINDOW_SIZE: 65535
  └─> Engine: Chromium / V8`,
      takeaway: 'Pseudo-header ordering and stream prioritization can distinguish browser engines even with spoofed identities.',
      link: 'https://scrapfly.io/blog/http2-fingerprinting/',
      linkText: 'Learn more about HTTP/2 Fingerprinting',
      icon: '🌐'
    },
    {
      title: 'TCP/IP Stack Fingerprinting',
      description: 'Passive OS detection identifies your operating system by inspecting the default values in TCP headers, such as the initial TTL (Time To Live), Window Size, and Maximum Segment Size (MSS). These are set by the OS kernel, not the browser.',
      diagram: `TCP Header
  │  TTL: 64 (Linux/macOS)
  │  Window: 65535
  └─> OS Guess: macOS / Linux`,
      takeaway: 'This reveals your operating system to any network observer without requiring any browser cooperation.',
      link: 'https://lcamtuf.coredump.cx/p0f3/',
      linkText: 'Explore p0f documentation',
      icon: '🖥️'
    }
  ];
</script>

<section class="info-section section-wrapper">
  <div class="section-header">
    <h2 class="section-title">Server-Side Techniques (Informational)</h2>
  </div>
  
  <div class="card-grid">
    {#each infoCards as card (card.title)}
      <InfoCard {...card} />
    {/each}
  </div>
</section>

<style>
  .info-section {
    margin-top: var(--space-10);
  }

  .section-title {
    font-size: 1.5rem;
    color: var(--text-primary);
    margin-bottom: var(--space-2);
  }
</style>
